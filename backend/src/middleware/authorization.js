const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN format

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const origin = req.get("origin") || req.get("referer") || "";
  const domain = new URL(origin).hostname;

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    if (user.domain !== domain) {
      return res.status(403).json({ message: "Invalid domain" });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
