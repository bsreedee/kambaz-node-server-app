import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    _id: String,
    course: String, // course _id like "CS101"
    title: { type: String, default: "New Quiz" },
    description: { type: String, default: "" },

    // Meta settings from project handout
    quizType: { type: String, default: "Graded Quiz" }, // Graded Quiz / Practice Quiz / ...
    assignmentGroup: { type: String, default: "Quizzes" },
    points: { type: Number, default: 0 },

    shuffleAnswers: { type: Boolean, default: true },
    timeLimit: { type: Number, default: 20 }, // minutes
    multipleAttempts: { type: Boolean, default: false },
    attemptsAllowed: { type: Number, default: 1 },
    showCorrectAnswers: { type: String, default: "Never" },
    accessCode: { type: String, default: "" },
    oneQuestionAtATime: { type: Boolean, default: true },
    webcamRequired: { type: Boolean, default: false },
    lockQuestionsAfterAnswering: { type: Boolean, default: false },

    dueDate: Date,
    availableDate: Date,
    untilDate: Date,

    published: { type: Boolean, default: false },

    // placeholder for later question editor
    questions: {
      type: Array,
      default: [],
    },

    // can be used later to store last score per student, etc.
  },
  { collection: "quizzes", timestamps: true }
);

export default quizSchema;
