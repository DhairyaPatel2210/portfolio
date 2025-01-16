const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const authenticateToken = require("../middleware/authorization");
const generateHashPassword = require("../utils/bcryptPassword");
const crypto = require("crypto");
const Project = require("../models/Projects");
const Socials = require("../models/Socials");

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // Save user to database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set token in cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Return success without sending password
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(email, password);
    // Find user by email
    const user = await User.findOne({ email: email });
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const hashedPassword = await generateHashPassword(password);

    console.log(hashedPassword, user.password);

    // Compare passwords
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set token in cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({ message: "Login successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add this new route to check authentication status
router.get("/check-auth", authenticateToken, (req, res) => {
  // If middleware passes, user is authenticated
  res.json({
    isAuthenticated: true,
  });
});

// Logout route
router.post("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.json({ message: "Logout successful" });
});

// Get user interests
router.get("/interests", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ interests: user.interests });
  } catch (error) {
    console.error("Error fetching interests:", error);
    res.status(500).json({ message: "Error fetching interests" });
  }
});

// Update user interests
router.put("/interests", authenticateToken, async (req, res) => {
  try {
    const { businessDomain, programmingLanguage, framework } = req.body;

    // Validate input
    if (!businessDomain && !programmingLanguage && !framework) {
      return res
        .status(400)
        .json({ message: "No interests provided for update" });
    }

    const updateData = {};
    if (businessDomain) updateData["interests.businessDomain"] = businessDomain;
    if (programmingLanguage)
      updateData["interests.programmingLanguage"] = programmingLanguage;
    if (framework) updateData["interests.framework"] = framework;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Interests updated successfully",
      interests: user.interests,
    });
  } catch (error) {
    console.error("Error updating interests:", error);
    res.status(500).json({ message: "Error updating interests" });
  }
});

// Get user about
router.get("/about", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ about: user.about });
  } catch (error) {
    console.error("Error fetching about:", error);
    res.status(500).json({ message: "Error fetching about information" });
  }
});

// Update user about
router.put("/about", authenticateToken, async (req, res) => {
  try {
    const { about } = req.body;
    if (!about) {
      return res.status(400).json({ message: "About text is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { about },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "About updated successfully",
      about: user.about,
    });
  } catch (error) {
    console.error("Error updating about:", error);
    res.status(500).json({ message: "Error updating about information" });
  }
});

// Get user status
router.get("/status", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ status: user.status });
  } catch (error) {
    console.error("Error fetching status:", error);
    res.status(500).json({ message: "Error fetching status information" });
  }
});

// Update user status
router.put("/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status text is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Status updated successfully",
      status: user.status,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Error updating status information" });
  }
});

// Generate API key
router.post("/api-key", authenticateToken, async (req, res) => {
  try {
    const apiKey = crypto.randomBytes(32).toString("hex");

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { apiKey },
      { new: true }
    ).select("-password");

    res.json({
      message: "API key generated successfully",
      apiKey: user.apiKey,
    });
  } catch (error) {
    console.error("Error generating API key:", error);
    res.status(500).json({ message: "Error generating API key" });
  }
});

// Get API key
router.get("/api-key", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("apiKey");

    console.log(user);

    if (!user.apiKey) {
      return res.status(404).json({ message: "No API key found" });
    }

    res.json({ apiKey: user.apiKey });
  } catch (error) {
    console.error("Error fetching API key:", error);
    res.status(500).json({ message: "Error fetching API key" });
  }
});

// Authenticate with API key
router.post("/auth/api-key", async (req, res) => {
  try {
    const { email, apiKey } = req.body;

    if (!email || !apiKey) {
      return res
        .status(400)
        .json({ message: "Email and API key are required" });
    }

    const user = await User.findOne({ email, apiKey });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      message: "Authentication successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error authenticating with API key:", error);
    res.status(500).json({ message: "Error authenticating with API key" });
  }
});

// Update featured projects
router.put("/featured-projects", authenticateToken, async (req, res) => {
  try {
    const { projectIds } = req.body;

    if (!Array.isArray(projectIds)) {
      return res.status(400).json({ message: "projectIds must be an array" });
    }

    if (projectIds.length > 3) {
      return res
        .status(400)
        .json({ message: "Cannot feature more than 3 projects" });
    }

    // Verify all projects exist and belong to user
    const projects = await Project.find({
      _id: { $in: projectIds },
      user: req.user.userId,
    });

    if (projects.length !== projectIds.length) {
      return res.status(400).json({
        message: "One or more projects not found or don't belong to user",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { featuredProjects: projectIds },
      { new: true }
    ).populate("featuredProjects");

    res.json({
      message: "Featured projects updated successfully",
      featuredProjects: user.featuredProjects,
    });
  } catch (error) {
    console.error("Error updating featured projects:", error);
    res.status(500).json({ message: "Error updating featured projects" });
  }
});

// Update featured socials
router.put("/featured-socials", authenticateToken, async (req, res) => {
  try {
    const { socialIds } = req.body;

    if (!Array.isArray(socialIds)) {
      return res.status(400).json({ message: "socialIds must be an array" });
    }

    if (socialIds.length > 4) {
      return res
        .status(400)
        .json({ message: "Cannot feature more than 4 socials" });
    }

    // Verify all socials exist and belong to user
    const socials = await Socials.find({
      _id: { $in: socialIds },
      user: req.user.userId,
    });

    if (socials.length !== socialIds.length) {
      return res.status(400).json({
        message: "One or more socials not found or don't belong to user",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { featuredSocials: socialIds },
      { new: true }
    ).populate("featuredSocials");

    res.json({
      message: "Featured socials updated successfully",
      featuredSocials: user.featuredSocials,
    });
  } catch (error) {
    console.error("Error updating featured socials:", error);
    res.status(500).json({ message: "Error updating featured socials" });
  }
});

// Get featured projects
router.get("/featured-projects", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate("featuredProjects")
      .select("featuredProjects");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      featuredProjects: user.featuredProjects,
    });
  } catch (error) {
    console.error("Error fetching featured projects:", error);
    res.status(500).json({ message: "Error fetching featured projects" });
  }
});

// Get featured socials
router.get("/featured-socials", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate("featuredSocials")
      .select("featuredSocials");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      featuredSocials: user.featuredSocials,
    });
  } catch (error) {
    console.error("Error fetching featured socials:", error);
    res.status(500).json({ message: "Error fetching featured socials" });
  }
});

// Get SEO data
router.get("/seo", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("seo");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ seo: user.seo });
  } catch (error) {
    console.error("Error fetching SEO data:", error);
    res.status(500).json({ message: "Error fetching SEO data" });
  }
});

// Update SEO data
router.put("/seo", authenticateToken, async (req, res) => {
  try {
    const { title, description, keywords } = req.body;

    // Create update object with only provided fields
    const updateData = {};
    if (title !== undefined) updateData["seo.title"] = title;
    if (description !== undefined) updateData["seo.description"] = description;
    if (keywords !== undefined) {
      if (!Array.isArray(keywords)) {
        return res.status(400).json({ message: "Keywords must be an array" });
      }
      updateData["seo.keywords"] = keywords;
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true }
    ).select("seo");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "SEO data updated successfully",
      seo: user.seo,
    });
  } catch (error) {
    console.error("Error updating SEO data:", error);
    res.status(500).json({ message: "Error updating SEO data" });
  }
});

module.exports = router;
