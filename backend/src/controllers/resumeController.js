const express = require("express");
const Resume = require("../models/Resume");
const { uploadBase64ToS3, deleteFromS3 } = require("../utils/s3");
const authenticateToken = require("../middleware/authorization");
const router = express.Router();

// Upload single resume
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { file, fileName, displayName } = req.body;

    if (!file || !fileName || !displayName) {
      return res.status(400).json({
        message: "File data, filename, and display name are required",
      });
    }

    const s3Response = await uploadBase64ToS3(file, fileName);

    const newResume = new Resume({
      fileName,
      displayName,
      s3Key: s3Response.key,
      s3Url: s3Response.url,
      user: req.user.userId,
    });

    const savedResume = await newResume.save();

    res.status(201).json({
      message: "Resume uploaded successfully",
      resume: savedResume,
    });
  } catch (error) {
    console.error("Error uploading resume:", error);
    res.status(500).json({ message: "Failed to upload resume" });
  }
});

// Get all resumes
router.get("/", authenticateToken, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.userId });
    res.status(200).json({ resumes });
  } catch (error) {
    console.error("Error fetching resumes:", error);
    res.status(500).json({ message: "Failed to fetch resumes" });
  }
});

// Update resume
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { file, fileName, displayName } = req.body;

    const existingResume = await Resume.findOne({
      _id: id,
      user: req.user.userId,
    });

    if (!existingResume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    await deleteFromS3(existingResume.s3Key);
    const s3Response = await uploadBase64ToS3(file, fileName);

    existingResume.fileName = fileName;
    existingResume.displayName = displayName;
    existingResume.s3Key = s3Response.key;
    existingResume.s3Url = s3Response.url;
    await existingResume.save();

    res.status(200).json({
      message: "Resume updated successfully",
      resume: existingResume,
    });
  } catch (error) {
    console.error("Error updating resume:", error);
    res.status(500).json({ message: "Failed to update resume" });
  }
});

// Delete resume
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const resume = await Resume.findOne({
      _id: id,
      user: req.user.userId,
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    await deleteFromS3(resume.s3Key);
    await resume.deleteOne();

    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Error deleting resume:", error);
    res.status(500).json({ message: "Failed to delete resume" });
  }
});

module.exports = router;
