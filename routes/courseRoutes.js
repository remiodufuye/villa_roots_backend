const express = require("express");
const courseController = require("../controllers/courseController");
const authController = require("../controllers/authController");
const reviewRouter = require("./reviewRoutes");

const router = express.Router();

// router.param('id', courseController.checkID);

router.use("/:courseId/reviews", reviewRouter);

router
  .route("/top-5-cheap")
  .get(courseController.aliasTopCourses, courseController.getAllCourses);
router.route("/course-stats").get(courseController.getCourseStats);
router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    courseController.getMonthlyPlan
  );

router
  .route("/courses-within/:distance/center/:latlng/unit/:unit")
  .get(courseController.getCoursesWithin);

//  courses-within?distance=233&center=-40,45,unit=mi
// courses-within/233/center/-40,45/unit/mi

router
  .route("/distances/:latlng/unit/:unit")
  .get(courseController.getDistances);

router
  .route("/")
  .get(courseController.getAllCourses)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    courseController.createCourse
  );
router
  .route("/:id")
  .get(courseController.getCourse)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    courseController.uploadCourseImages,
    courseController.resizeCourseImages,
    courseController.updateCourse
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    courseController.deleteCourse
  );

module.exports = router;
