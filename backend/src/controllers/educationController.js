const express = require("express");
const router = express.Router();
const Education = require("../models/Education");
const authenticateToken = require("../middleware/authorization");

// Get all educations for the authenticated user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const educations = await Education.find({ user: req.user.userId }).sort({
      startDate: -1,
    }); // Sort by start date, most recent first

    res.json(educations);
  } catch (error) {
    console.error("Error fetching educations:", error);
    res.status(500).json({ message: "Error fetching educations" });
  }
});

// Create a new education
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      universityName,
      major,
      degree,
      startDate,
      endDate,
      relatedCourseworks,
      gpa,
      isPursuing,
    } = req.body;

    // Validate required fields
    if (
      !universityName ||
      !major ||
      !degree ||
      !startDate ||
      !endDate ||
      !relatedCourseworks ||
      gpa === undefined ||
      isPursuing === undefined
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create new education
    const education = new Education({
      universityName,
      major,
      degree,
      startDate,
      endDate,
      relatedCourseworks,
      gpa,
      isPursuing,
      user: req.user.userId,
    });

    await education.save();

    res.status(201).json({
      message: "Education created successfully",
      education,
    });
  } catch (error) {
    console.error("Error creating education:", error);
    res.status(500).json({ message: "Error creating education" });
  }
});

// Update an education
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const {
      universityName,
      major,
      degree,
      startDate,
      endDate,
      relatedCourseworks,
      gpa,
      isPursuing,
    } = req.body;

    // Validate required fields
    if (
      !universityName ||
      !major ||
      !degree ||
      !startDate ||
      !endDate ||
      !relatedCourseworks ||
      gpa === undefined ||
      isPursuing === undefined
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find and update the education
    const education = await Education.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      {
        universityName,
        major,
        degree,
        startDate,
        endDate,
        relatedCourseworks,
        gpa,
        isPursuing,
      },
      { new: true }
    );

    if (!education) {
      return res.status(404).json({ message: "Education not found" });
    }

    res.json({
      message: "Education updated successfully",
      education,
    });
  } catch (error) {
    console.error("Error updating education:", error);
    res.status(500).json({ message: "Error updating education" });
  }
});

// Delete an education
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const education = await Education.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!education) {
      return res.status(404).json({ message: "Education not found" });
    }

    res.json({ message: "Education deleted successfully" });
  } catch (error) {
    console.error("Error deleting education:", error);
    res.status(500).json({ message: "Error deleting education" });
  }
});

module.exports = router;
