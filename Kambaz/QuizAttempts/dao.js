import { v4 as uuidv4 } from "uuid";
import model from "./model.js";
import QuizModel from "../Quizzes/model.js";

export default function QuizAttemptsDao() {
  // Start a new quiz attempt
  function startAttempt(userId, quizId, courseId) {
    const newAttempt = {
      _id: uuidv4(),
      quiz: quizId,
      user: userId,
      course: courseId,
      attemptNumber: 1, // Will be updated based on existing attempts
      status: "IN_PROGRESS",
      startedAt: new Date(),
      answers: [],
      score: 0,
    };
    return model.create(newAttempt);
  }

  // Get all attempts for a quiz by a user
  async function findAttemptsByUserAndQuiz(userId, quizId) {
    return model
      .find({ user: userId, quiz: quizId })
      .sort({ attemptNumber: -1 });
  }

  // Get a specific attempt by ID
  function findAttemptById(attemptId) {
    return model.findById(attemptId).populate("quiz");
  }

  // Get the current in-progress attempt
  async function findInProgressAttempt(userId, quizId) {
    return model.findOne({
      user: userId,
      quiz: quizId,
      status: "IN_PROGRESS",
    });
  }

  // Save answer for a question
  async function saveAnswer(attemptId, questionId, questionType, answer) {
    const attempt = await model.findById(attemptId);
    if (!attempt) return null;

    // Find if answer already exists for this question
    const existingAnswerIndex = attempt.answers.findIndex(
      (a) => a.questionId === questionId
    );

    const answerObj = {
      questionId,
      questionType,
      answer,
      isCorrect: null, // Will be graded on submission
      pointsEarned: 0,
    };

    if (existingAnswerIndex >= 0) {
      // Update existing answer
      attempt.answers[existingAnswerIndex] = answerObj;
    } else {
      // Add new answer
      attempt.answers.push(answerObj);
    }

    await attempt.save();
    return attempt;
  }

  // Submit and grade quiz
  async function submitAndGradeAttempt(attemptId) {
    const attempt = await model.findById(attemptId);
    if (!attempt) return null;

    const quiz = await QuizModel.findById(attempt.quiz);
    if (!quiz) return null;

    let totalScore = 0;
    const gradedAnswers = [];

    // Grade each answer
    for (const answer of attempt.answers) {
      const questionIndex = parseInt(answer.questionId) || 0;
      const question = quiz.questions[questionIndex];

      if (!question) {
        gradedAnswers.push({ ...answer, isCorrect: false, pointsEarned: 0 });
        continue;
      }

      let isCorrect = false;
      let pointsEarned = 0;

      // Grade based on question type
      const qType = (question.questionType || question.type || "").toLowerCase();

      if (qType.includes("multiple") || qType.includes("choice")) {
        // Multiple Choice
        isCorrect = answer.answer === question.correctAnswer;
      } else if (qType.includes("true") || qType.includes("false")) {
        // True/False
        isCorrect = answer.answer === question.correctAnswer;
      } else if (qType.includes("blank") || qType.includes("fill")) {
        // Fill in the Blank - case insensitive comparison
        const studentAnswer = (answer.answer || "").toString().toLowerCase().trim();
        const correctAnswer = (question.correctAnswer || "").toString().toLowerCase().trim();
        
        // Also check against blanks array if it exists
        if (Array.isArray(question.blanks)) {
          isCorrect = question.blanks.some(
            (blank) => blank.toLowerCase().trim() === studentAnswer
          );
        } else {
          isCorrect = studentAnswer === correctAnswer;
        }
      }

      if (isCorrect) {
        pointsEarned = question.points || 0;
        totalScore += pointsEarned;
      }

      gradedAnswers.push({
        ...answer,
        isCorrect,
        pointsEarned,
      });
    }

    // Calculate time spent
    const timeSpent = Math.floor(
      (new Date() - new Date(attempt.startedAt)) / 1000
    );

    // Update attempt with graded results
    attempt.answers = gradedAnswers;
    attempt.score = totalScore;
    attempt.totalPoints = quiz.points || 0;
    attempt.percentage = quiz.points ? (totalScore / quiz.points) * 100 : 0;
    attempt.status = "GRADED";
    attempt.submittedAt = new Date();
    attempt.timeSpent = timeSpent;

    await attempt.save();
    return attempt;
  }

  // Get attempt count for a user on a specific quiz
  async function getAttemptCount(userId, quizId) {
    return model.countDocuments({ user: userId, quiz: quizId });
  }

  // Get all attempts for a course (for faculty)
  async function findAttemptsByCourse(courseId) {
    return model.find({ course: courseId }).populate("user").populate("quiz");
  }

  // Delete an attempt
  function deleteAttempt(attemptId) {
    return model.deleteOne({ _id: attemptId });
  }

  return {
    startAttempt,
    findAttemptsByUserAndQuiz,
    findAttemptById,
    findInProgressAttempt,
    saveAnswer,
    submitAndGradeAttempt,
    getAttemptCount,
    findAttemptsByCourse,
    deleteAttempt,
  };
}