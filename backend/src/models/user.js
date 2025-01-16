const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "",
    },
    interests: {
      businessDomain: {
        type: [String],
        default: [],
      },
      programmingLanguage: {
        type: [String],
        default: [],
      },
      framework: {
        type: [String],
        default: [],
      },
    },
    seo: {
      title: {
        type: String,
        default: "",
      },
      description: {
        type: String,
        default: "",
      },
      keywords: {
        type: [String],
        default: [],
      },
    },
    featuredProjects: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Project",
        },
      ],
      default: [],
      validate: [
        (array) => array.length <= 3,
        "Featured projects cannot exceed 3",
      ],
    },
    featuredSocials: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Socials",
        },
      ],
      default: [],
      validate: [(array) => array.length <= 4, "Socials cannot exceed 4"],
    },
    apiKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "User",
  }
);

module.exports = mongoose.model("User", userSchema);
