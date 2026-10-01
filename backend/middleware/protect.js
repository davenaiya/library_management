const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) 
    return res.status(401).json({ msg: "No token, access denied" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || user.isDeleted) return res.status(401).json({ msg: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token invalid" });
  }
};

module.exports = protect;