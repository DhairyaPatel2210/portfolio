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
    const { name, link, lightIcon, darkIcon } = req.body;

    // Upload light theme icon to S3
    const lightIconResponse = await uploadBase64ToS3(
      lightIcon,
      `${name}-light`
    );
    // Upload dark theme icon to S3
    const darkIconResponse = await uploadBase64ToS3(darkIcon, `${name}-dark`);

    const social = new Socials({
      name: name,
      link: link,
      lightIcon: {
        s3Link: lightIconResponse.url,
        s3Key: lightIconResponse.key,
      },
      darkIcon: {
        s3Link: darkIconResponse.url,
        s3Key: darkIconResponse.key,
      },
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
    const { name, link, lightIcon, darkIcon } = req.body;

    const social = await Socials.findOne({ _id: id, user: req.user.userId });
    if (!social) {
      return res.status(404).json({ message: "Social not found" });
    }

    // If new light icon is provided, delete old one and upload new one
    if (lightIcon) {
      await deleteFromS3(social.lightIcon.s3Key);
      const lightIconResponse = await uploadBase64ToS3(
        lightIcon,
        `${name}-light`
      );
      social.lightIcon = {
        s3Link: lightIconResponse.url,
        s3Key: lightIconResponse.key,
      };
    }

    // If new dark icon is provided, delete old one and upload new one
    if (darkIcon) {
      await deleteFromS3(social.darkIcon.s3Key);
      const darkIconResponse = await uploadBase64ToS3(darkIcon, `${name}-dark`);
      social.darkIcon = {
        s3Link: darkIconResponse.url,
        s3Key: darkIconResponse.key,
      };
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

    // Delete both icons from S3
    await deleteFromS3(social.lightIcon.s3Key);
    await deleteFromS3(social.darkIcon.s3Key);

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
