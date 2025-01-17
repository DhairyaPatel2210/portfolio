const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const experienceController = require("../controllers/experienceController");
const educationController = require("../controllers/educationController");
const portfolioController = require("../controllers/portfolioController");

// User routes
router.use("/users", userController);

// Experience routes
router.use("/experiences", experienceController);

// Education routes
router.use("/educations", educationController);

// Portfolio routes (aggregated data)
router.use("/portfolio", portfolioController);

module.exports = router;
