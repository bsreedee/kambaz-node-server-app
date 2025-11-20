import EnrollmentsDao from "./dao.js";

export default function EnrollmentsRoutes(app, db) {
  const dao = EnrollmentsDao(db);
  const enrollUserInCourse = (req, res) => {
    const { userId, courseId } = req.params;
    const enrollment = dao.enrollUserInCourse(userId, courseId);
    res.json(enrollment);
  };
  const unenrollUserFromCourse = (req, res) => {
    const { enrollmentId } = req.params;
    dao.unenrollUserFromCourse(enrollmentId);
    res.sendStatus(200);
  };
  const findEnrollmentsForUser = (req, res) => {
    const { userId } = req.params;
    const enrollments = dao.findEnrollmentsForUser(userId);
    res.json(enrollments);
  };
  const findEnrollmentsForCourse = (req, res) => {
    const { courseId } = req.params;
    const enrollments = dao.findEnrollmentsForCourse(courseId);
    res.json(enrollments);
  };
  // Kambaz/Enrollments/routes.js
app.get("/api/courses/:courseId/enrollments", (req, res) => {
  const { courseId } = req.params;
  const candidates = new Set([String(courseId)]);
  const c = (db.courses || []).find(
    x => String(x._id) === String(courseId) || String(x.number) === String(courseId) || String(x.id) === String(courseId)
  );
  if (c) {
    if (c._id) candidates.add(String(c._id));
    if (c.number) candidates.add(String(c.number));
    if (c.id) candidates.add(String(c.id));
  }
  const list = (db.enrollments || [])
    .filter(e => candidates.has(String(e.course)))
    .map(e => ({ ...e, user: e.user ?? e.userId ?? e.student ?? e.uid }));
  res.json(list);
});



  app.get("/api/enrollments/users/:userId", findEnrollmentsForUser);
  app.get("/api/enrollments/courses/:courseId", findEnrollmentsForCourse);
  app.delete("/api/enrollments/:enrollmentId", unenrollUserFromCourse);
  app.post(
    "/api/enrollments/users/:userId/courses/:courseId",
    enrollUserInCourse
  );
}