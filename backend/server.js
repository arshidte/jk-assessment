import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";

import s3Routes from "./routes/s3Routes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
app.use(express.json());

// Database connection
connectDB();

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.status(201).json("Running");
});

// Routes
app.use("/api/s3", s3Routes);
app.use("/api/user", userRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running in ${port}`));
