const mongoose = require("mongoose");
const slugify = require("slugify");

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A Course Must Have a Name!"],
      unique: true,
      trim: true,
      maxlength: [
        40,
        "A Course name must have less than or equal to 40 characters",
      ],
      minlength: [
        10,
        "A Course name must have more than or equal to 10 characters",
      ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A Course Must Have a Duration!"],
    },
    maxStudentSize: {
      type: Number,
      required: [true, "A Course Must Have a Student Size!"],
    },
    difficulty: {
      type: String,
      required: [true, "A Course Must have a Difficulty value !"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy , medium , difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A Course Must Have a Price!!"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // The this keyword will only work when creating a new document
          return val < this.price;
        },
        message: "Discount Price ({VALUE}) Should be Below the Regular Price!!",
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, "A Course Must Have a Description"],
    },
    imageCover: {
      type: String,
      required: [true, "A Course Must Have a Cover Image!"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretCourse: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      cordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        cordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// courseSchema.index({ price: 1 });
courseSchema.index({ price: 1, ratingsAverage: -1 });
courseSchema.index({ slug: 1 });
courseSchema.index({ startLocation: "2dsphere" });

courseSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// Virtual Populate
courseSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "course",
  localField: "_id",
});

// DOCUMENT MIDDLEWARE runs before .save() and .create()
courseSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARE
courseSchema.pre(/^find/, function (next) {
  this.find({
    secretCourse: { $ne: true },
  });
  this.start = Date.now();
  next();
});

courseSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

courseSchema.post(/^find/, function (docs, next) {
  console.log(`The Query Took ${Date.now() - this.start} milliseconds!`);
  next();
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
