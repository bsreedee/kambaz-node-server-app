import { v4 as uuidv4 } from "uuid";
import model from "./model.js";

export async function findCoursesForUser(userId) {
 const enrollments = await model.find({ user: userId }).populate("course");
 return enrollments.map((enrollment) => enrollment.course);
}

export default function EnrollmentsDao() {
  function enrollUserInCourse(userId, courseId) {
    return model.create({user: userId,
       course: courseId, 
       _id: `${userId}-${courseId}`,});
  }

  async function findEnrollmentsForUser(userId) {
    return model.find({ user: userId }); 
  }

  async function findEnrollmentsForCourse(courseId) {
    return model.find({ course: courseId });
  }
   
  function unenrollAllUsersFromCourse(courseId) {
   return model.deleteMany({ course: courseId });
 }
 function enrollUserInCourse(userId, courseId) {
  return model.create({
    user: userId,
    course: courseId,
    _id: `${userId}-${courseId}`,
  });
}
function unenrollUserFromCourse(user, course) {
  return model.deleteOne({ user, course });
}

  return { enrollUserInCourse, 
    unenrollUserFromCourse, 
    findEnrollmentsForUser, 
    findEnrollmentsForCourse,
    findCoursesForUser,
    unenrollAllUsersFromCourse  
  };
}