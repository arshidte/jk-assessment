import mongoose from "mongoose";

const objectSchema = new mongoose.Schema(
  {
    bucketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bucket",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    objectName: {
      type: String,
      required: true,
    },
    objectPath: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Object = new mongoose.model("Object", objectSchema);
export default Object;
