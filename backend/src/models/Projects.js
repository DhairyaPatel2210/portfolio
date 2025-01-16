const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    programmingLanguages: {
      type: [String],
      required: true,
    },
    githubRepo: {
      type: String,
      required: true,
      trim: true,
    },
    liveWebLink: {
      type: String,
      trim: true,
    },
    projectType: {
      type: [String],
      required: true,
    },
    specialNote: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    iconImage: {
      type: String,
      required: true,
    },
    s3Key: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentlyWorking: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
