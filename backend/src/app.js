const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Connect to MongoDB
connectDB();

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://dhairya.shareitineary.live", "https://shareitineary.live"]
    : ["http://localhost:5173"];

// Middleware
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Rate limiting
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
//   max: parseInt(process.env.RATE_LIMIT_MAX),
// });
// app.use("/api", limiter);

// Routes
const userRoutes = require("./controllers/userController");
app.use("/api/users", userRoutes);

const projectRoutes = require("./controllers/projectsController");
app.use("/api/projects", projectRoutes);

const resumeRoutes = require("./controllers/resumeController");
app.use("/api/resumes", resumeRoutes);

const socialRoutes = require("./controllers/socialsController");
app.use("/api/socials", socialRoutes);

const experienceRoutes = require("./controllers/experienceController");
app.use("/api/experiences", experienceRoutes);

const educationRoutes = require("./controllers/educationController");
app.use("/api/educations", educationRoutes);

const portfolioRoutes = require("./controllers/portfolioController");
app.use("/api/portfolio", portfolioRoutes);

const contactRoutes = require("./controllers/contactController");
app.use("/api/contact", contactRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
