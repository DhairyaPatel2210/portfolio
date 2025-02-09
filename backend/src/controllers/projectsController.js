const express = require("express");
const router = express.Router();
const multer = require("multer");
const Project = require("../models/Projects");
const authenticateToken = require("../middleware/authorization");
const { uploadBase64ToS3, deleteFromS3 } = require("../utils/s3");
const path = require("path");
const User = require("../models/user");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".png", ".jpg", ".jpeg", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Create project
router.post("/", authenticateToken, upload.single("icon"), async (req, res) => {
  try {
    const projectData = req.body;

    // Handle base64 image upload
    if (projectData.iconImage) {
      s3Response = await uploadBase64ToS3(
        projectData.iconImage,
        projectData.title
      );

      // Replace base64 data with S3 URL
      projectData.iconImage = s3Response.url;
      projectData.s3Key = s3Response.key;
    }

    // Create project with user reference
    const project = new Project({
      ...projectData,
      user: req.user.userId,
    });

    await project.save();
    res
      .status(201)
      .json({ message: "Project Created Successfully", ...project });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Update project
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const updateData = req.body;

    // Handle image update if new image is provided
    if (
      updateData.iconImage &&
      !updateData.iconImage.includes("amazonaws.com")
    ) {
      // Delete old image if exists
      if (project.s3Key) {
        await deleteFromS3(project.s3Key);
      }

      // Upload new image
      const s3Response = await uploadBase64ToS3(
        updateData.iconImage,
        updateData.title
      );

      // Update image URL and key
      updateData.iconImage = s3Response.url;
      updateData.s3Key = s3Response.key;
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ ...updatedProject, message: "Project Updated Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete project
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if project is featured
    const user = await User.findById(req.user.userId);
    if (user.featuredProjects.includes(project._id)) {
      return res.status(400).json({
        message:
          "Cannot delete project while it is featured. Please remove it from featured projects first.",
        isFeatured: true,
      });
    }

    // Delete image from S3 if exists
    if (project.s3Key) {
      await deleteFromS3(project.s3Key);
    }

    // Delete project from database
    await project.deleteOne();

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all projects for user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.userId }).sort({
      createdAt: -1,
    }); // Sort by creation date, newest first
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single project
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
