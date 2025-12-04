import { v4 as uuidv4 } from "uuid";
import model from "./model.js";

export default function quizzesDao() {
  function findQuizzesForCourse(courseId) {
    return model.find({ course: courseId }).sort({ availableDate: 1 });
  }

  function findQuizById(quizId) {
    return model.findById(quizId);
  }

  function createQuizForCourse(courseId, quiz) {
    const newQuiz = {
      ...quiz,
      _id: uuidv4(),
      course: courseId,
    };
    return model.create(newQuiz);
  }

  function updateQuiz(quizId, quizUpdates) {
    return model.findByIdAndUpdate(quizId, quizUpdates, { new: true });
  }

  function deleteQuiz(quizId) {
    return model.deleteOne({ _id: quizId });
  }

  return {
    findQuizzesForCourse,
    findQuizById,
    createQuizForCourse,
    updateQuiz,
    deleteQuiz,
  };
}
