import quizzesDao from "./dao.js";

export default function quizzesRoutes(app /*, db */) {
  const dao = quizzesDao();

  // GET all quizzes for a course
  const findQuizzesForCourse = async (req, res) => {
    const { courseId } = req.params;
    const quizzes = await dao.findQuizzesForCourse(courseId);
    res.json(quizzes);
  };
  app.get("/api/courses/:courseId/quizzes", findQuizzesForCourse);

  // CREATE quiz for course
  const createQuizForCourse = async (req, res) => {
    const { courseId } = req.params;
    const quiz = req.body || {};
    const newQuiz = await dao.createQuizForCourse(courseId, quiz);
    res.json(newQuiz);
  };
  app.post("/api/courses/:courseId/quizzes", createQuizForCourse);

  // GET single quiz
  const findQuizById = async (req, res) => {
    const { quizId } = req.params;
    const quiz = await dao.findQuizById(quizId);
    if (!quiz) {
      res.sendStatus(404);
      return;
    }
    res.json(quiz);
  };
  app.get("/api/quizzes/:quizId", findQuizById);

  // UPDATE quiz
  const updateQuiz = async (req, res) => {
    const { quizId } = req.params;
    const quizUpdates = req.body;
    const updated = await dao.updateQuiz(quizId, quizUpdates);
    res.json(updated);
  };
  app.put("/api/quizzes/:quizId", updateQuiz);

  // DELETE quiz
  const deleteQuiz = async (req, res) => {
    const { quizId } = req.params;
    const status = await dao.deleteQuiz(quizId);
    res.send(status);
  };
  app.delete("/api/quizzes/:quizId", deleteQuiz);
}
