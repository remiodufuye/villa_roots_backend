const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Course = require("../models/courseModel");
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1.) Get the currently booked course
  const course = await Course.findById(req.params.courseId);

  // 2.) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/my-courses/?course=${
      req.params.courseId
    }&user=${req.user.id}&price=${course.price}`,
    cancel_url: `${req.protocol}://${req.get("host")}/course/${course.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.courseID,
    line_items: [
      {
        name: `${course.name} Course`,
        description: course.summary,
        images: [`https://www.natours.dev/img/courses/${course.imageCover}`],
        amount: course.price * 100,
        currency: "usd",
        quantity: 1,
      },
    ],
  });

  // 3.) Create session as response

  res.status(200).json({
    status: "success",
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //  This is only temporary , because its UNSECURE : evertone can make bookings without paying
  const { course, user, price } = req.query;
  if (!course && !user && !price) return next();
  await Booking.create({ course, user, price });

  res.redirect(req.originalUrl.split("?")[0]);
});

exports.webhookCheckout = (req, res, next) => {};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
