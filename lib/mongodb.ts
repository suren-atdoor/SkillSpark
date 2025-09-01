// MongoDB connection utility
// This would be used in a real MERN application

export interface MongoDBConfig {
  uri: string
  dbName: string
}

// Example MongoDB connection setup
export const connectToDatabase = async () => {
  // In a real app, you would use:
  // const { MongoClient } = require('mongodb')
  // const client = new MongoClient(process.env.MONGODB_URI)
  // await client.connect()
  // return client.db(process.env.DB_NAME)

  console.log("MongoDB connection would be established here")
  return null
}

// Example Mongoose schema
export const TaskSchema = {
  title: { type: String, required: true },
  description: { type: String, default: "" },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}
