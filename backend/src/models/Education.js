const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema(
  {
    universityName: {
      type: String,
      required: true,
    },
    major: {
      type: String,
      required: true,
    },
    degree: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: function () {
        return !this.isPursuing;
      },
    },
    relatedCourseworks: {
      type: [String],
      required: true,
    },
    gpa: {
      type: Number,
      required: true,
    },
    isPursuing: {
      type: Boolean,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Education", educationSchema);
