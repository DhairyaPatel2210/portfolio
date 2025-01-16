const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authorization");
const Socials = require("../models/Socials");
const User = require("../models/user");
const { uploadToS3, deleteFromS3, uploadBase64ToS3 } = require("../utils/s3");

// Get all socials for a user
const getAllSocials = async (req, res) => {
  try {
    const socials = await Socials.find({ user: req.user.userId });
    res.status(200).json(socials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new social
const createSocial = async (req, res) => {
  try {
    const { name, link, icon } = req.body;

    // Upload image to S3
    const response = await uploadBase64ToS3(icon, name);

    const social = new Socials({
      name: name,
      link: link,
      s3Link: response.url,
      s3Key: response.key,
      user: req.user.userId,
    });

    const savedSocial = await social.save();
    res.status(201).json(savedSocial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a social
const updateSocial = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, link, icon } = req.body;

    const social = await Socials.findOne({ _id: id, user: req.user.userId });
    if (!social) {
      return res.status(404).json({ message: "Social not found" });
    }

    // If new image is provided, delete old one and upload new one
    if (icon) {
      await deleteFromS3(social.s3Key);
      const response = await uploadBase64ToS3(icon, name);
      social.s3Link = response.url;
      social.s3Key = response.key;
    }

    social.name = name || social.name;
    social.link = link || social.link;

    const updatedSocial = await social.save();
    res.status(200).json(updatedSocial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a social
const deleteSocial = async (req, res) => {
  try {
    const id = req.params.id;

    const social = await Socials.findOne({ _id: id, user: req.user.userId });
    if (!social) {
      return res.status(404).json({ message: "Social not found" });
    }

    // Check if social is featured
    const user = await User.findById(req.user.userId);
    if (user.featuredSocials.includes(social._id)) {
      return res.status(400).json({
        message:
          "Cannot delete social while it is featured. Please remove it from featured socials first.",
        isFeatured: true,
      });
    }

    // Delete image from S3
    await deleteFromS3(social.s3Key);

    // Delete social from database
    await social.deleteOne();

    res.status(200).json({ message: "Social deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Social Media Routes
router.get("/", authenticateToken, getAllSocials);
router.post("/", authenticateToken, createSocial);
router.put("/:id", authenticateToken, updateSocial);
router.delete("/:id", authenticateToken, deleteSocial);

// Add this route after your existing routes
router.get("/search", authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const socials = await Socials.find({
      user: req.user.userId,
      name: { $regex: query, $options: "i" },
    })
      .select("name")
      .sort({ name: 1 });

    res.json(socials);
  } catch (error) {
    console.error("Error searching socials:", error);
    res.status(500).json({ message: "Error searching socials" });
  }
});

module.exports = router;
