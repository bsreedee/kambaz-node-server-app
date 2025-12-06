import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    _id: String,
    quiz: { type: String, ref: "QuizModel" }, // quiz _id
    user: { type: String, ref: "UserModel" }, // student _id
    course: String, // course _id
    
    // Attempt tracking
    attemptNumber: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["IN_PROGRESS", "SUBMITTED", "GRADED"],
      default: "IN_PROGRESS",
    },
    
    // Timing
    startedAt: { type: Date, default: Date.now },
    submittedAt: Date,
    timeSpent: Number, // in seconds
    
    // Answers
    answers: [
      {
        questionId: String, // can be index or _id of question
        questionType: String, // "Multiple Choice", "True/False", "Fill in the Blank"
        answer: mongoose.Schema.Types.Mixed, // can be string, boolean, array
        isCorrect: Boolean,
        pointsEarned: Number,
      },
    ],
    
    // Scoring
    score: { type: Number, default: 0 }, // points earned
    totalPoints: Number, // total possible points
    percentage: Number, // calculated percentage
    
    // Metadata
    ipAddress: String,
    userAgent: String,
  },
  { collection: "quizAttempts", timestamps: true }
);

// Index for faster queries
quizAttemptSchema.index({ quiz: 1, user: 1 });
quizAttemptSchema.index({ user: 1, course: 1 });

export default quizAttemptSchema;