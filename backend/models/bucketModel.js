import mongoose from "mongoose";

const bucketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bucketName: {
      type: String,
      required: true,
    },
    bucketObjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Object",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Bucket = new mongoose.model("Bucket", bucketSchema);
export default Bucket;