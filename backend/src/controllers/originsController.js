const express = require("express");
const router = express.Router();
const Origin = require("../models/Origin");
const authenticateToken = require("../middleware/authorization");

// Get all origins for a user (requires auth)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const origins = await Origin.find({ user: req.user.userId });
    res.json(origins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all origins (no auth required - for CORS setup)
router.get("/all", async (req, res) => {
  try {
    const origins = await Origin.find({}).select("origin");
    const originList = origins.map((o) => o.origin);
    res.json(originList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new origin
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { origin, description } = req.body;
    const newOrigin = new Origin({
      origin,
      description,
      user: req.user.userId,
    });
    const savedOrigin = await newOrigin.save();
    res.status(201).json(savedOrigin);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Origin already exists for this user" });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Delete an origin
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const origin = await Origin.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!origin) {
      return res.status(404).json({ message: "Origin not found" });
    }

    await origin.deleteOne();
    res.json({ message: "Origin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
