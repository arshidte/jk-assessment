import fs from "fs";
import Object from "../models/objectModel.js";
import Bucket from "../models/bucketModel.js";
import User from "../models/userModel.js";

// Get object
export const getObject = async (req, res) => {
  const userId = req.user._id;

  // Get the object key(file name) and bucket name from params
  const objectName = req.params.objectKey;

  // Find the object
  try {
    // Fetch the object details from database
    const fetchedObject = await Object.findOne({
      userId,
      objectName,
    });

    if (fetchedObject) {
      res
        .status(200)
        .json({ sts: "01", msg: "Object found successfully", fetchedObject });
    } else {
      res.status(404).json({ sts: "00", msg: "Object not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ sts: "00", msg: "Internal Server Error" });
  }
};

// Put object
export const putObject = async (req, res) => {
  const file = req.file;

  const userId = req.user._id;

  if (!file) {
    res.status(400).json({
      sts: "00",
      msg: "No file uploaded",
    });
  } else if (!userId) {
    res.status(401).json({ sts: "00", msg: "Not authenticated" });
  } else {
    // Save the file details in database

    // Get the bucketName
    const bucketName = req.params.bucketName;

    // If the bucket already exist, push the object to existing bucket, else create one.
    const bucket = await Bucket.findOne({ bucketName });

    if (bucket) {
      const newObject = new Object({
        bucketId: bucket._id,
        userId,
        objectName: file.filename,
        objectPath: file.path,
      });

      bucket.bucketObjects.push(newObject._id);

      try {
        await newObject.save();
        await bucket.save();
        res
          .status(201)
          .json({ sts: "01", msg: "Object uploaded successfully" });
      } catch (error) {
        res.status(500).json({ sts: "00", msg: "Internal Server Error" });
      }
    } else {
      // Create new bucket
      const newBucket = new Bucket({
        userId: userId,
        bucketName,
      });

      // Save the object
      const newObject = new Object({
        bucketId: newBucket._id,
        userId,
        objectName: file.filename,
        objectPath: file.path,
      });

      // Push the newObject to newBucket
      newBucket.bucketObjects.push(newObject._id);

      // Push the newBucket to user
      const user = await User.findById(userId);

      if (user) {
        user.buckets.push(newBucket._id);

        try {
          await user.save();
          await newBucket.save();
          await newObject.save();
          res
            .status(201)
            .json({ sts: "01", msg: "Object uploaded successfully" });
        } catch (error) {
          console.error(error);
          res.status(500).json({ sts: "00", msg: "Internal Server Error" });
        }
      } else {
        res.status(500).json({ sts: "00", msg: "Internal Server Error" });
      }
    }
  }
};

// List all the buckets
export const listBucket = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate({
      path: "buckets",
      select: "bucketName bucketObjects",
      populate: { path: "bucketObjects", select: "objectName objectPath" },
    });
    res.status(200).json({
      sts: "01",
      msg: "Bucket found successfully",
      listBucket: user.buckets,
    });
  } catch (error) {
    request.status(500).json({ sts: "00", msg: "Internal Server Error" });
  }
};

// List objects in the bucket based on the bucketID
export const listObjectFromBucket = async (req, res) => {
  const userId = req.user._id;
  const bucketId = req.params.bucketId;

  try {
    const bucket = await Bucket.findOne({ _id: bucketId, userId }).populate({
      path: "bucketObjects",
      select: "objectName objectPath",
    });
    if (bucket) {
      res.status(200).json({
        sts: "01",
        msg: "Object found successfully",
        listObject: bucket.bucketObjects,
      });
    } else {
      res.status(404).json({ sts: "00", msg: "Bucket not found" });
    }
  } catch (error) {
    res.status(500).json({ sts: "00", msg: "Internal Server Error" });
  }
};
