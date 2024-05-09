import express from "express";
const router = express.Router();
import { upload } from "../middleware/uploadMiddleware.js";
import {
  getObject,
  listBucket,
  putObject,
  listObjectFromBucket,
} from "../controllers/s3Controllers.js";
import { protect } from "../middleware/authMiddleware.js";

router.get("/get-object/:objectKey", getObject);
router.post("/:bucketName", protect, upload.single("file"), putObject);
router.get("/list-buckets", protect, listBucket);
router.get("/list-object/:bucketId", protect, listObjectFromBucket);

export default router;
