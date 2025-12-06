import QuizAttemptsDao from "../QuizAttempts/dao.js";
import QuizzesDao from "../Quizzes/dao.js";

export default function QuizAttemptsRoutes(app) {
  const attemptsDao = QuizAttemptsDao();
  const quizzesDao = QuizzesDao();

  // Start a new quiz attempt
  const startQuizAttempt = async (req, res) => {
    try {
      const { quizId } = req.params;
      const currentUser = req.session["currentUser"];
      
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get quiz to check settings
      const quiz = await quizzesDao.findQuizById(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Check if there's already an in-progress attempt
      const inProgress = await attemptsDao.findInProgressAttempt(
        currentUser._id,
        quizId
      );
      
      if (inProgress) {
        return res.json(inProgress); // Return existing in-progress attempt
      }

      // Check attempt limit
      const attemptCount = await attemptsDao.getAttemptCount(
        currentUser._id,
        quizId
      );
      
      if (
        !quiz.multipleAttempts &&
        attemptCount >= 1
      ) {
        return res.status(403).json({
          message: "You have already completed this quiz",
        });
      }

      if (
        quiz.multipleAttempts &&
        quiz.attemptsAllowed &&
        attemptCount >= quiz.attemptsAllowed
      ) {
        return res.status(403).json({
          message: `You have used all ${quiz.attemptsAllowed} attempts`,
        });
      }

      // Create new attempt
      const newAttempt = await attemptsDao.startAttempt(
        currentUser._id,
        quizId,
        quiz.course
      );

      // Update attempt number
      newAttempt.attemptNumber = attemptCount + 1;
      await newAttempt.save();

      res.json(newAttempt);
    } catch (error) {
      console.error("Error starting quiz attempt:", error);
      res.status(500).json({ message: "Error starting quiz attempt" });
    }
  };

  // Get all attempts for a quiz by current user
  const getMyAttempts = async (req, res) => {
    try {
      const { quizId } = req.params;
      const currentUser = req.session["currentUser"];

      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const attempts = await attemptsDao.findAttemptsByUserAndQuiz(
        currentUser._id,
        quizId
      );
      res.json(attempts);
    } catch (error) {
      console.error("Error getting attempts:", error);
      res.status(500).json({ message: "Error getting attempts" });
    }
  };

  // Get a specific attempt by ID
  const getAttemptById = async (req, res) => {
    try {
      const { attemptId } = req.params;
      const currentUser = req.session["currentUser"];

      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const attempt = await attemptsDao.findAttemptById(attemptId);
      
      if (!attempt) {
        return res.status(404).json({ message: "Attempt not found" });
      }

      // Check if user owns this attempt or is faculty
      if (
        attempt.user !== currentUser._id &&
        currentUser.role !== "FACULTY" &&
        currentUser.role !== "ADMIN"
      ) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      res.json(attempt);
    } catch (error) {
      console.error("Error getting attempt:", error);
      res.status(500).json({ message: "Error getting attempt" });
    }
  };

  // Save an answer for a question
  const saveQuestionAnswer = async (req, res) => {
    try {
      const { attemptId } = req.params;
      const { questionId, questionType, answer } = req.body;
      const currentUser = req.session["currentUser"];

      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const attempt = await attemptsDao.findAttemptById(attemptId);
      
      if (!attempt) {
        return res.status(404).json({ message: "Attempt not found" });
      }

      if (attempt.user !== currentUser._id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      if (attempt.status !== "IN_PROGRESS") {
        return res.status(400).json({
          message: "Cannot modify a submitted attempt",
        });
      }

      const updatedAttempt = await attemptsDao.saveAnswer(
        attemptId,
        questionId,
        questionType,
        answer
      );

      res.json(updatedAttempt);
    } catch (error) {
      console.error("Error saving answer:", error);
      res.status(500).json({ message: "Error saving answer" });
    }
  };

  // Submit and grade quiz
  const submitQuiz = async (req, res) => {
    try {
      const { attemptId } = req.params;
      const currentUser = req.session["currentUser"];

      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const attempt = await attemptsDao.findAttemptById(attemptId);
      
      if (!attempt) {
        return res.status(404).json({ message: "Attempt not found" });
      }

      if (attempt.user !== currentUser._id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      if (attempt.status !== "IN_PROGRESS") {
        return res.status(400).json({
          message: "This attempt has already been submitted",
        });
      }

      const gradedAttempt = await attemptsDao.submitAndGradeAttempt(attemptId);
      res.json(gradedAttempt);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Error submitting quiz" });
    }
  };

  // Get current in-progress attempt
  const getInProgressAttempt = async (req, res) => {
    try {
      const { quizId } = req.params;
      const currentUser = req.session["currentUser"];

      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const attempt = await attemptsDao.findInProgressAttempt(
        currentUser._id,
        quizId
      );
      
      res.json(attempt || null);
    } catch (error) {
      console.error("Error getting in-progress attempt:", error);
      res.status(500).json({ message: "Error getting attempt" });
    }
  };

  // Register routes
  app.post("/api/quizzes/:quizId/attempts", startQuizAttempt);
  app.get("/api/quizzes/:quizId/attempts", getMyAttempts);
  app.get("/api/quizzes/:quizId/attempts/current", getInProgressAttempt);
  app.get("/api/attempts/:attemptId", getAttemptById);
  app.post("/api/attempts/:attemptId/answers", saveQuestionAnswer);
  app.post("/api/attempts/:attemptId/submit", submitQuiz);
}