const Course = require("../models/courseModel");
const User = require("../models/userModel");
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get Course Data from Collection
  const courses = await Course.find();
  // 2) Build Template
  // 3) Render that template using course data from 1)

  res.status(200).render("overview", {
    title: "All Courses",
    courses,
  });
});

exports.getCourse = catchAsync(async (req, res, next) => {
  // 1) Get the data for the requested course ( including reviews and guides )
  const course = await Course.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user ",
  });

  if (!course) {
    return next(new AppError("There is no course with that name!", 404));
  }

  // 2) Build template
  // 3) Render template using data from 1

  res.status(200).render("course", {
    title: `${course.name} Course`,
    course,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render("login", {
    title: "Login to Your Account",
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your Account",
  });
};

exports.getMyCourses = catchAsync(async (req, res, next) => {
  // 1.) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2.) Find courses with the returned IDs
  const courseIDs = bookings.map((el) => el.course);
  const courses = await Course.find({ _id: { $in: courseIDs } });

  res.status(200).render("overview", {
    title: "My Courses",
    courses,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render("account", {
    title: "Your Account",
    user: updatedUser,
  });
});
