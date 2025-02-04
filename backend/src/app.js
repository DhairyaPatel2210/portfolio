const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const Origin = require("./models/Origin");

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration
const corsOptions = {
  origin: async function (origin, callback) {
    try {
      // Get all allowed origins from the database
      const origins = await Origin.find({}).select("origin");
      const allowedOrigins = origins.map((o) => o.origin);

      // Add default origins based on environment
      if (process.env.NODE_ENV === "production") {
        allowedOrigins.push(
          "https://dhairya.shareitineary.live",
          "https://shareitineary.live"
        );
      } else {
        allowedOrigins.push("http://localhost:5173");
      }

      callback(null, allowedOrigins);
    } catch (error) {
      callback(error);
    }
  },
  credentials: true,
};

// Middleware
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));
app.use(cors(corsOptions));

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

const originRoutes = require("./controllers/originsController");
app.use("/api/origins", originRoutes);

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
