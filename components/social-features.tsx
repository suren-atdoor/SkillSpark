"use client"

/**
 * SocialFeatures
 * --------------
 * A minimal—but complete—implementation of the social layer:
 * • Friends list with online status
 * • Global leaderboard
 * • Basic challenge & share placeholders
 *
 * You can freely extend the fetch logic and UI details later;
 * this file now compiles without syntax errors.
 */

import { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Users, Trophy, Target, Share2, Crown, Medal } from "lucide-react"

/* ------------------------------------------------------------------ */
/* Types – extend to match your real API                              */
/* ------------------------------------------------------------------ */
export interface SocialFriend {
  id: string
  username: string
  avatar?: string
  status: "online" | "offline" | "in-quiz"
}
export interface LeaderboardEntry {
  id: string
  username: string
  avatar?: string
  rank: number
  score: number
}
/* ------------------------------------------------------------------ */

export function SocialFeatures() {
  const [friends, setFriends] = useState<SocialFriend[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  /* --------------------------------------------------------------- */
  /* Example data fetchers – replace with your real API calls        */
  /* --------------------------------------------------------------- */
  useEffect(() => {
    // Simulate async loading
    const loadDemo = async () => {
      setFriends([
        {
          id: "1",
          username: "alice",
          status: "online",
        },
        {
          id: "2",
          username: "bob",
          status: "in-quiz",
        },
        {
          id: "3",
          username: "carol",
          status: "offline",
        },
      ])

      setLeaderboard([
        {
          id: "1",
          username: "alice",
          rank: 1,
          score: 985,
        },
        {
          id: "2",
          username: "bob",
          rank: 2,
          score: 912,
        },
        {
          id: "3",
          username: "carol",
          rank: 3,
          score: 880,
        },
      ])
    }
    loadDemo()
  }, [])

  /* --------------------------------------------------------------- */
  /* Render helpers                                                  */
  /* --------------------------------------------------------------- */
  const statusDot = (status: SocialFriend["status"]) => {
    const map = {
      online: "bg-green-500",
      "in-quiz": "bg-blue-500",
      offline: "bg-gray-400",
    } as const
    return <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${map[status]}`} />
  }

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-semibold">#{rank}</span>
  }

  /* --------------------------------------------------------------- */
  /* JSX                                                             */
  /* --------------------------------------------------------------- */
  return (
    <section className="max-w-4xl mx-auto mb-10 space-y-8">
      <Tabs defaultValue="friends">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="friends">
            <Users className="mr-2 h-4 w-4" /> Friends
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Trophy className="mr-2 h-4 w-4" /> Leaderboard
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Target className="mr-2 h-4 w-4" /> Challenges
          </TabsTrigger>
          <TabsTrigger value="share">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </TabsTrigger>
        </TabsList>

        {/* -------------------- Friends -------------------- */}
        <TabsContent value="friends">
          <Card>
            <CardHeader>
              <CardTitle>Friends ({friends.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {friends.map((f) => (
                <div key={f.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="relative flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={f.avatar || "/placeholder.svg?height=40&width=40"} alt={f.username} />
                      <AvatarFallback>{f.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {statusDot(f.status)}
                    <span className="font-medium">{f.username}</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Message
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------ Leaderboard ------------------ */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboard.map((entry) => (
                <div key={entry.id} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="w-8 flex justify-center">{rankIcon(entry.rank)}</div>
                  <Avatar>
                    <AvatarImage
                      src={entry.avatar || "/placeholder.svg?height=40&width=40" || "/placeholder.svg"}
                      alt={entry.username}
                    />
                    <AvatarFallback>{entry.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{entry.username}</p>
                  </div>
                  <span className="font-bold text-blue-600">{entry.score}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------- Challenges placeholder ------------- */}
        <TabsContent value="challenges">
          <Card>
            <CardHeader>
              <CardTitle>Challenges</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-500">Real-time challenges will appear here.</CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Share placeholder --------------- */}
        <TabsContent value="share">
          <Card>
            <CardHeader>
              <CardTitle>Share a Quiz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Copy a quiz link and share with friends!</p>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  alert("Link copied to clipboard.")
                }}
              >
                Copy current URL
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  )
}

export default SocialFeatures
