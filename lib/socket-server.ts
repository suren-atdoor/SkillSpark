import { Server } from "socket.io"
import { createServer } from "http"
import { APP_CONFIG } from "@/config/app-config"
import { verify } from "jsonwebtoken"

interface SocketUser {
  id: string
  username: string
  avatar?: string
}

interface LiveQuizRoom {
  id: string
  hostId: string
  quizId: string
  participants: Map<string, SocketUser>
  currentQuestion: number
  isActive: boolean
  startTime?: number
  settings: {
    maxParticipants: number
    timePerQuestion: number
    showLeaderboard: boolean
  }
}

class SocketManager {
  private io: Server
  private liveQuizRooms: Map<string, LiveQuizRoom> = new Map()
  private userSockets: Map<string, string> = new Map() // userId -> socketId

  constructor() {
    const httpServer = createServer()
    this.io = new Server(httpServer, {
      cors: {
        origin: APP_CONFIG.realtime.corsOrigins,
        methods: ["GET", "POST"],
      },
      maxHttpBufferSize: 1e6, // 1MB
    })

    this.setupEventHandlers()
    httpServer.listen(APP_CONFIG.realtime.socketPort)
  }

  private setupEventHandlers() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token
        if (!token) {
          return next(new Error("Authentication error"))
        }

        const decoded = verify(token, APP_CONFIG.auth.jwtSecret) as any
        socket.userId = decoded.userId
        socket.username = decoded.username
        next()
      } catch (err) {
        next(new Error("Authentication error"))
      }
    })

    this.io.on("connection", (socket) => {
      console.log(`User ${socket.username} connected`)
      this.userSockets.set(socket.userId, socket.id)

      // Live Quiz Events
      socket.on("create-live-quiz", this.handleCreateLiveQuiz.bind(this, socket))
      socket.on("join-live-quiz", this.handleJoinLiveQuiz.bind(this, socket))
      socket.on("leave-live-quiz", this.handleLeaveLiveQuiz.bind(this, socket))
      socket.on("start-live-quiz", this.handleStartLiveQuiz.bind(this, socket))
      socket.on("submit-live-answer", this.handleSubmitLiveAnswer.bind(this, socket))
      socket.on("next-question", this.handleNextQuestion.bind(this, socket))

      // Social Events
      socket.on("send-friend-request", this.handleSendFriendRequest.bind(this, socket))
      socket.on("accept-friend-request", this.handleAcceptFriendRequest.bind(this, socket))
      socket.on("challenge-friend", this.handleChallengeFriend.bind(this, socket))

      // Real-time Progress
      socket.on("quiz-progress-update", this.handleQuizProgressUpdate.bind(this, socket))

      // Disconnect
      socket.on("disconnect", () => {
        console.log(`User ${socket.username} disconnected`)
        this.userSockets.delete(socket.userId)
        this.handleUserDisconnect(socket)
      })
    })
  }

  private handleCreateLiveQuiz(socket: any, data: any) {
    const roomId = `live_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const room: LiveQuizRoom = {
      id: roomId,
      hostId: socket.userId,
      quizId: data.quizId,
      participants: new Map(),
      currentQuestion: 0,
      isActive: false,
      settings: {
        maxParticipants: data.maxParticipants || 50,
        timePerQuestion: data.timePerQuestion || 30,
        showLeaderboard: data.showLeaderboard !== false,
      },
    }

    this.liveQuizRooms.set(roomId, room)
    socket.join(roomId)

    socket.emit("live-quiz-created", {
      roomId,
      joinCode: roomId.split("_")[1],
    })
  }

  private handleJoinLiveQuiz(socket: any, data: { roomId: string }) {
    const room = this.liveQuizRooms.get(data.roomId)
    if (!room) {
      socket.emit("error", { message: "Quiz room not found" })
      return
    }

    if (room.participants.size >= room.settings.maxParticipants) {
      socket.emit("error", { message: "Quiz room is full" })
      return
    }

    if (room.isActive) {
      socket.emit("error", { message: "Quiz has already started" })
      return
    }

    room.participants.set(socket.userId, {
      id: socket.userId,
      username: socket.username,
      avatar: socket.avatar,
    })

    socket.join(data.roomId)

    // Notify all participants
    this.io.to(data.roomId).emit("participant-joined", {
      participant: {
        id: socket.userId,
        username: socket.username,
        avatar: socket.avatar,
      },
      totalParticipants: room.participants.size,
    })

    socket.emit("joined-live-quiz", {
      roomId: data.roomId,
      participants: Array.from(room.participants.values()),
      isHost: socket.userId === room.hostId,
    })
  }

  private handleStartLiveQuiz(socket: any, data: { roomId: string }) {
    const room = this.liveQuizRooms.get(data.roomId)
    if (!room || room.hostId !== socket.userId) {
      socket.emit("error", { message: "Unauthorized or room not found" })
      return
    }

    room.isActive = true
    room.startTime = Date.now()

    this.io.to(data.roomId).emit("live-quiz-started", {
      currentQuestion: 0,
      timePerQuestion: room.settings.timePerQuestion,
    })

    // Start question timer
    this.startQuestionTimer(data.roomId, 0)
  }

  private startQuestionTimer(roomId: string, questionIndex: number) {
    const room = this.liveQuizRooms.get(roomId)
    if (!room) return

    setTimeout(() => {
      this.io.to(roomId).emit("question-time-up", { questionIndex })

      // Auto advance to next question or end quiz
      if (questionIndex < 10) {
        // Assuming 10 questions max
        this.handleNextQuestion({ userId: room.hostId }, { roomId })
      } else {
        this.endLiveQuiz(roomId)
      }
    }, room.settings.timePerQuestion * 1000)
  }

  private handleSubmitLiveAnswer(
    socket: any,
    data: { roomId: string; questionIndex: number; answer: any; timeSpent: number },
  ) {
    const room = this.liveQuizRooms.get(data.roomId)
    if (!room || !room.isActive) return

    // Store answer and notify host
    this.io.to(data.roomId).emit("answer-submitted", {
      userId: socket.userId,
      username: socket.username,
      questionIndex: data.questionIndex,
      timeSpent: data.timeSpent,
    })
  }

  private handleNextQuestion(socket: any, data: { roomId: string }) {
    const room = this.liveQuizRooms.get(data.roomId)
    if (!room || room.hostId !== socket.userId) return

    room.currentQuestion++

    this.io.to(data.roomId).emit("next-question", {
      questionIndex: room.currentQuestion,
      timePerQuestion: room.settings.timePerQuestion,
    })

    this.startQuestionTimer(data.roomId, room.currentQuestion)
  }

  private endLiveQuiz(roomId: string) {
    const room = this.liveQuizRooms.get(roomId)
    if (!room) return

    this.io.to(roomId).emit("live-quiz-ended", {
      finalResults: true,
    })

    // Clean up room after 5 minutes
    setTimeout(
      () => {
        this.liveQuizRooms.delete(roomId)
      },
      5 * 60 * 1000,
    )
  }

  private handleSendFriendRequest(socket: any, data: { targetUserId: string }) {
    const targetSocketId = this.userSockets.get(data.targetUserId)
    if (targetSocketId) {
      this.io.to(targetSocketId).emit("friend-request-received", {
        fromUserId: socket.userId,
        fromUsername: socket.username,
        fromAvatar: socket.avatar,
      })
    }
  }

  private handleQuizProgressUpdate(socket: any, data: any) {
    // Broadcast progress to friends or study group
    socket.broadcast.emit("friend-progress-update", {
      userId: socket.userId,
      username: socket.username,
      progress: data.progress,
    })
  }

  private handleUserDisconnect(socket: any) {
    // Remove from all live quiz rooms
    this.liveQuizRooms.forEach((room, roomId) => {
      if (room.participants.has(socket.userId)) {
        room.participants.delete(socket.userId)
        this.io.to(roomId).emit("participant-left", {
          userId: socket.userId,
          totalParticipants: room.participants.size,
        })

        // If host disconnects, end the quiz
        if (room.hostId === socket.userId) {
          this.endLiveQuiz(roomId)
        }
      }
    })
  }
}

export const socketManager = new SocketManager()
