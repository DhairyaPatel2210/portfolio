const express = require("express");
const router = express.Router();
const User = require("../models/user");
const authenticateToken = require("../middleware/authorization");
const sgMail = require("@sendgrid/mail");

// Get contact information
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("contact")
      .select("-contact.sendGridApiKey")
      .select("-contact.personalEmail")
      .select("-contact.fromEmail");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ contact: user.contact });
  } catch (error) {
    console.error("Error fetching contact info:", error);
    res.status(500).json({ message: "Error fetching contact information" });
  }
});

// Update contact information
router.put("/", authenticateToken, async (req, res) => {
  try {
    const { contact } = req.body; // Destructure from the wrapped contact object

    if (!contact.location || !contact.personalEmail || !contact.fromEmail) {
      return res.status(400).json({
        message: "Location, personal email, and from email are required",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { contact },
      { new: true }
    ).select("contact");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Contact information updated successfully",
      contact: user.contact,
    });
  } catch (error) {
    console.error("Error updating contact info:", error);
    res.status(500).json({ message: "Error updating contact information" });
  }
});

// Send email to user
router.post("/send-message", async (req, res) => {
  try {
    const { email, message, name, user_location } = req.body;

    if (!email || !message || !name || !user_location) {
      return res.status(400).json({
        message: "Email, message, name, and location are required",
      });
    }

    // Get user's personal email and from email
    const user = await User.findOne().select("contact");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.contact.sendGridApiKey) {
      return res.status(400).json({
        message: "SendGrid API key not configured",
      });
    }

    // Configure SendGrid
    sgMail.setApiKey(user.contact.sendGridApiKey);

    // Email content
    const msg = {
      to: user.contact.personalEmail,
      from: user.contact.fromEmail,
      subject: `New Contact Message from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Location:</strong> ${user_location}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    // Send email
    await sgMail.send(msg);

    res.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Error sending message" });
  }
});

module.exports = router;
