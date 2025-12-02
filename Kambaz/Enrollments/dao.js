import { v4 as uuidv4 } from "uuid";
export default function EnrollmentsDao(db) {
  // function enrollUserInCourse(userId, courseId) {
  //   const { enrollments } = db;
  //   enrollments.push({ _id: uuidv4(), user: userId, course: courseId });
  // }
  function enrollUserInCourse(userId, courseId) {
  const enrollment = { _id: uuidv4(), user: userId, course: courseId };
  db.enrollments.push(enrollment);
  return enrollment;
}
  function unenrollUserFromCourse(enrollmentId) {
    const { enrollments } = db;
    db.enrollments = enrollments.filter(
      (enrollment) => enrollment._id !== enrollmentId
    );
  }
  function findEnrollmentsForUser(userId) {
    const { enrollments } = db;
    return enrollments.filter((enrollment) => enrollment.user === userId);
  }

  function findEnrollmentsForCourse(courseId) {
    return db.enrollments.filter(e => String(e.course) === String(courseId));
  }
  
  return { enrollUserInCourse, unenrollUserFromCourse, findEnrollmentsForUser, findEnrollmentsForCourse };
}

