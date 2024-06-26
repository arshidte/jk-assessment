import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.userId).select("-password");
        next();
      } catch (error) {
        console.error(error);
        res.status(401).json({ sts: "00", msg: "Not authenticated" });
      }
    }

    if (!token) {
      res.status(401).json({ sts: "00", msg: "Not authenticated" });
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({ sts: "00", msg: "Not authenticated" });
  }
};
