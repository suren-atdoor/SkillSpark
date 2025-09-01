-- MongoDB Setup Script
-- This would be used to set up your MongoDB database

-- Create database
use task_manager;

-- Create tasks collection with validation
db.createCollection("tasks", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "status", "priority"],
      properties: {
        title: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        description: {
          bsonType: "string",
          description: "must be a string"
        },
        status: {
          bsonType: "string",
          enum: ["pending", "in-progress", "completed"],
          description: "must be one of the enum values"
        },
        priority: {
          bsonType: "string",
          enum: ["low", "medium", "high"],
          description: "must be one of the enum values"
        },
        createdAt: {
          bsonType: "date",
          description: "must be a date"
        },
        updatedAt: {
          bsonType: "date",
          description: "must be a date"
        }
      }
    }
  }
});

-- Create indexes for better performance
db.tasks.createIndex({ "status": 1 });
db.tasks.createIndex({ "priority": 1 });
db.tasks.createIndex({ "createdAt": -1 });

-- Insert sample data
db.tasks.insertMany([
  {
    title: "Learn MERN Stack",
    description: "Study MongoDB, Express, React, and Node.js",
    status: "in-progress",
    priority: "high",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Build Todo App",
    description: "Create a full-stack todo application",
    status: "pending",
    priority: "medium",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Deploy to Production",
    description: "Deploy the application to a cloud platform",
    status: "pending",
    priority: "low",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
