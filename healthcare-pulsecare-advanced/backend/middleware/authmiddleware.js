const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "healthcare-demo-secret";

module.exports = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ message: "Authentication required" });

    const decoded = jwt.verify(token, SECRET);
    req.user = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
