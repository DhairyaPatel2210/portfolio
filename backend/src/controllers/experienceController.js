const express = require("express");
const router = express.Router();
const Experience = require("../models/Experience");
const authenticateToken = require("../middleware/authorization");

// Get all experiences for the authenticated user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const experiences = await Experience.find({ user: req.user.userId }).sort({
      startDate: -1,
    }); // Sort by start date, most recent first

    console.log(experiences);

    res.json(experiences);
  } catch (error) {
    console.error("Error fetching experiences:", error);
    res.status(500).json({ message: "Error fetching experiences" });
  }
});

// Create a new experience
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      role,
      company,
      startDate,
      endDate,
      isCurrentJob,
      responsibilities,
      technologies,
    } = req.body;

    // Validate required fields
    if (
      !role ||
      !company ||
      !startDate ||
      !responsibilities ||
      !technologies ||
      isCurrentJob === undefined
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create new experience
    const experience = new Experience({
      role,
      company,
      startDate,
      endDate: endDate || null,
      isCurrentJob,
      responsibilities,
      technologies,
      user: req.user.userId,
    });

    await experience.save();

    res.status(201).json({
      message: "Experience created successfully",
      experience,
    });
  } catch (error) {
    console.error("Error creating experience:", error);
    res.status(500).json({ message: "Error creating experience" });
  }
});

// Update an experience
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const {
      role,
      company,
      startDate,
      endDate,
      isCurrentJob,
      responsibilities,
      technologies,
    } = req.body;

    // Validate required fields
    if (
      !role ||
      !company ||
      !startDate ||
      !responsibilities ||
      !technologies ||
      isCurrentJob === undefined
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find and update the experience
    const experience = await Experience.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      {
        role,
        company,
        startDate,
        endDate: endDate || null,
        isCurrentJob,
        responsibilities,
        technologies,
      },
      { new: true }
    );

    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    res.json({
      message: "Experience updated successfully",
      experience,
    });
  } catch (error) {
    console.error("Error updating experience:", error);
    res.status(500).json({ message: "Error updating experience" });
  }
});

// Delete an experience
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const experience = await Experience.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    res.json({ message: "Experience deleted successfully" });
  } catch (error) {
    console.error("Error deleting experience:", error);
    res.status(500).json({ message: "Error deleting experience" });
  }
});

module.exports = router;
