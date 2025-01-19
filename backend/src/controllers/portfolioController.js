const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Resume = require("../models/Resume");
const Education = require("../models/Education");
const Experience = require("../models/Experience");
const authenticateToken = require("../middleware/authorization");

// Get aggregated portfolio data
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Get user data with populated featured projects and socials
    const user = await User.findById(req.user.userId)
      .select("-password")
      .populate("featuredProjects")
      .populate("featuredSocials");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all resumes
    const resumes = await Resume.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });

    // Get education history
    const education = await Education.find({ user: req.user.userId }).sort({
      startDate: -1,
    });

    // Get experience history
    const experience = await Experience.find({ user: req.user.userId }).sort({
      startDate: -1,
    });

    const portfolioData = {
      name: `${user.firstName} ${user.lastName}`,
      about: user.about,
      status: user.status,
      seo: {
        title: user.seo.title,
        description: user.seo.description,
        keywords: user.seo.keywords,
      },
      analytics: {
        googleAnalyticsId: user.analytics?.googleAnalyticsId || "",
      },
      featuredProjects: user.featuredProjects,
      featuredSocials: user.featuredSocials,
      resumes: resumes.map((resume) => ({
        url: resume.s3Url,
        displayName: resume.displayName,
      })),
      education,
      experience,
    };

    res.json(portfolioData);
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    res.status(500).json({ message: "Error fetching portfolio data" });
  }
});

module.exports = router;
