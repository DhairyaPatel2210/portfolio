const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    s3Key: {
      type: String,
      required: true,
    },
    s3Url: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
