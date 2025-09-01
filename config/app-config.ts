export const APP_CONFIG = {
  // Database Configuration
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || "mongodb://localhost:27017",
      dbName: process.env.DB_NAME || "quiz_master",
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      },
    },
    redis: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number.parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      db: Number.parseInt(process.env.REDIS_DB || "0"),
    },
  },

  // Authentication Configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || "fallback-secret-change-in-production",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
    bcryptRounds: Number.parseInt(process.env.BCRYPT_ROUNDS || "12"),
    sessionTimeout: Number.parseInt(process.env.SESSION_TIMEOUT || "3600"), // 1 hour
  },

  // File Upload Configuration
  upload: {
    maxFileSize: Number.parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB
    allowedImageTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    uploadPath: process.env.UPLOAD_PATH || "./uploads",
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
  },

  // Real-time Configuration
  realtime: {
    socketPort: Number.parseInt(process.env.SOCKET_PORT || "3001"),
    corsOrigins: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
    maxConnections: Number.parseInt(process.env.MAX_SOCKET_CONNECTIONS || "1000"),
  },

  // Email Configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    from: process.env.EMAIL_FROM || "noreply@quizmaster.com",
  },

  // Push Notifications
  notifications: {
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    },
    vapid: {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
      subject: process.env.VAPID_SUBJECT || "mailto:admin@quizmaster.com",
    },
  },

  // Social Features
  social: {
    enableSharing: process.env.ENABLE_SHARING !== "false",
    enableLeaderboards: process.env.ENABLE_LEADERBOARDS !== "false",
    enableAchievements: process.env.ENABLE_ACHIEVEMENTS !== "false",
    maxFriends: Number.parseInt(process.env.MAX_FRIENDS || "100"),
  },

  // App Settings
  app: {
    name: process.env.APP_NAME || "Quiz Master",
    version: process.env.APP_VERSION || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    baseUrl: process.env.BASE_URL || "http://localhost:3000",
    apiUrl: process.env.API_URL || "http://localhost:3000/api",
    socketUrl: process.env.SOCKET_URL || "http://localhost:3001",
  },
}

export const isDevelopment = APP_CONFIG.app.environment === "development"
export const isProduction = APP_CONFIG.app.environment === "production"
