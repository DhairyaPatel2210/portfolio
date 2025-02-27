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
const { uploadBase64ToS3, deleteFromS3 } = require("../utils/s3");
const { generateKeyPair, decryptWithPrivateKey } = require("../utils/crypto");

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const origin = req.get("origin") || req.get("referer") || "";
    const domain = new URL(origin).hostname;

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
      { userId: newUser._id, email: newUser.email, domain: domain },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return success with token
    res.status(201).json({
      message: "User created successfully",
      token,
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

    // Find user by email
    const user = await User.findOne({ email: email });
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const origin = req.get("origin") || req.get("referer") || "";
    const domain = new URL(origin).hostname;

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, domain: domain },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return user data and token
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
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
  res.clearCookie("jwt", {
    path: "/",
  });
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

    if (!user.apiKey) {
      return res.status(204).json({ message: "No API key found" });
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
    const { encryptedKey, email } = req.body;

    if (!encryptedKey || !email) {
      return res.status(400).json({
        message: "Encrypted API key and email are required",
      });
    }

    // Find user by email and include apiKey in selection
    const user = await User.findOne({ email }).select(
      "+rsaKeys.privateKey +apiKey"
    );

    if (!user || !user.rsaKeys?.privateKey) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    try {
      // Attempt to decrypt the API key
      const decryptedApiKey = decryptWithPrivateKey(
        encryptedKey,
        user.rsaKeys.privateKey
      );

      const origin = req.get("origin") || req.get("referer") || "";
      const domain = new URL(origin).hostname;

      // Compare with stored API key
      if (decryptedApiKey === user.apiKey) {
        // Generate JWT token
        const token = jwt.sign(
          { userId: user._id, email: user.email, domain: domain },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );

        // Return user data and token (same format as login)
        return res.status(200).json({
          message: "Authentication successful",
          token,
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
        });
      }

      return res.status(401).json({ message: "Invalid credentials" });
    } catch (decryptError) {
      console.error("Decryption error:", decryptError);
      return res.status(401).json({
        message: "Failed to decrypt API key",
      });
    }
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
    const { title, description, keywords, image } = req.body;

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

    // Handle image update
    if (image) {
      const user = await User.findById(req.user.userId);

      // Delete old image if it exists
      if (user.seo.image && user.seo.image.s3Key) {
        await deleteFromS3(user.seo.image.s3Key);
      }

      // Upload new image
      const s3Response = await uploadBase64ToS3(image, "seo-image");
      updateData["seo.image.s3Key"] = s3Response.key;
      updateData["seo.image.s3Url"] = s3Response.url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true }
    ).select("seo");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "SEO data updated successfully",
      seo: updatedUser.seo,
    });
  } catch (error) {
    console.error("Error updating SEO data:", error);
    res.status(500).json({ message: "Error updating SEO data" });
  }
});

// Update Google Analytics tracking code
router.put("/analytics", authenticateToken, async (req, res) => {
  try {
    const { googleAnalyticsId } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { "analytics.googleAnalyticsId": googleAnalyticsId },
      { new: true }
    ).select("analytics");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Analytics settings updated successfully",
      analytics: user.analytics,
    });
  } catch (error) {
    console.error("Error updating analytics settings:", error);
    res.status(500).json({ message: "Error updating analytics settings" });
  }
});

// Get Google Analytics tracking code
router.get("/analytics", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("analytics");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ analytics: user.analytics });
  } catch (error) {
    console.error("Error fetching analytics settings:", error);
    res.status(500).json({ message: "Error fetching analytics settings" });
  }
});

// Generate public key
router.get("/public-key", authenticateToken, async (req, res) => {
  try {
    // Find user with their private key
    const user = await User.findById(req.user.userId).select(
      "+rsaKeys.privateKey"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user already has keys, return the existing public key
    if (user.rsaKeys?.publicKey) {
      return res.json({ publicKey: user.rsaKeys.publicKey });
    }

    // Generate new keys only if user doesn't have them
    const { publicKey, privateKey } = generateKeyPair();

    // Store both keys
    user.rsaKeys = {
      privateKey,
      publicKey,
    };
    await user.save();

    res.json({ publicKey });
  } catch (error) {
    console.error("Error handling public key:", error);
    res.status(500).json({ message: "Error handling public key" });
  }
});

// Regenerate public key (requires confirmation)
router.post("/public-key", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new key pair
    const { publicKey, privateKey } = generateKeyPair();

    // Update keys
    user.rsaKeys = {
      privateKey,
      publicKey,
    };
    await user.save();

    res.json({ publicKey });
  } catch (error) {
    console.error("Error regenerating public key:", error);
    res.status(500).json({ message: "Error regenerating public key" });
  }
});

module.exports = router;
