import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

// User registration controller
export const registerUser = async (req, res) => {
  try {
    const { userName, password } = req.body;
    if (!userName || !password) {
      res
        .status(400)
        .json({ sts: "00", msg: "Please enter all required fields" });
    } else {
      // Check if userName already exists
      let user = await User.findOne({ userName });
      if (user) {
        res.status(400).json({ sts: "00", msg: "User already exists" });
      } else {
        // Create new user
        const newUser = await User.create({ userName, password });
        if (newUser) {
          res.status(201).json({ sts: "01", msg: "User created successfully" });
        } else {
          res.status(500).json({ sts: "00", msg: "Internal Server Error" });
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ sts: "00", msg: "Internal Server Error" });
  }
};

// User login controller
export const loginUser = async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      res
        .status(400)
        .json({ sts: "00", msg: "Please enter all required fields" });
    } else {
      let user = await User.findOne({ userName });

      if (!user) {
        res.status(401).json({ sts: "00", msg: "User does not exist" });
      } else {
        if (user && (await user.matchPassword(password))) {
          const accessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            {
              expiresIn: "1d",
            }
          );

          res.status(200).json({
            userName: user.userName,
            token_type: "Bearer",
            accessToken,
            sts: "01",
            msg: "Success",
          });
        } else {
          res
            .status(401)
            .json({ sts: "00", msg: "You entered wrong password" });
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ sts: "00", msg: "Internal Server Error" });
  }
};
