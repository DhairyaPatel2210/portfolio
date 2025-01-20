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
    contact: {
      location: {
        type: String,
        required: true,
        default: "",
      },
      personalEmail: {
        type: String,
        required: true,
        default: "",
      },
      fromEmail: {
        type: String,
        required: true,
        default: "",
      },
      sendGridApiKey: {
        type: String,
        default: "",
      },
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
      image: {
        s3Key: {
          type: String,
          required: true,
          default: "",
        },
        s3Url: {
          type: String,
          required: true,
          default: "",
        },
      },
    },
    analytics: {
      googleAnalyticsId: {
        type: String,
        default: "",
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
      select: false,
    },
    rsaKeys: {
      privateKey: {
        type: String,
        select: false,
      },
      publicKey: {
        type: String,
      },
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
