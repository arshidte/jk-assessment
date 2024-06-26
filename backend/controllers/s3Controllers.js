import Object from "../models/objectModel.js";
import Bucket from "../models/bucketModel.js";
import User from "../models/userModel.js";
import fs from "fs";

// Get object
export const getObject = async (req, res) => {
  // Get the object key(file name) and bucket name from params
  const objectName = req.params.objectKey;

  // Find the object
  try {
    // Fetch the object details from database
    const fetchedObject = await Object.findOne({
      objectName,
    });

    console.log(fetchedObject);

    if (fetchedObject) {
      // Get the file path from the fetched object
      const filePath = fetchedObject.objectPath;

      // Create a read stream from the file
      const stream = fs.createReadStream(filePath);

      // Set response headers
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${objectName}"`
      );

      // Pipe the file stream to the response object
      stream.pipe(res);
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
          .json({ sts: "01", msg: "Object uploaded successfully", newObject });
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

  // For pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const user = await User.findById(userId)
      .populate({
        path: "buckets",
        select: "bucketName bucketObjects",
        populate: { path: "bucketObjects", select: "objectName objectPath" },
      })
      .skip((page - 1) * limit)
      .limit(limit);

    if (user) {
      res.status(200).json({
        sts: "01",
        msg: "Bucket found successfully",
        listBucket: user.buckets,
      });
    } else {
      res.status(404).json({ sts: "00", msg: "Bucket not found" });
    }
  } catch (error) {
    res.status(500).json({ sts: "00", msg: "Internal Server Error" });
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

// Delete an object from the bucket and object DB
export const deleteObject = async (req, res) => {
  const userId = req.user._id;
  const objectName = req.params.objectKey;

  try {
    const deletingObject = await Object.findOne({ objectName, userId });

    if (deletingObject) {
      // Get the object path
      const objectPath = deletingObject.objectPath;

      // Delete the file associated with the object
      fs.unlink(objectPath, async (err) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ sts: "00", msg: "Failed to delete object file" });
        }

        // Get the existing bucket
        const bucketId = deletingObject.bucketId;
        const bucket = await Bucket.findById(bucketId);

        // Remove the object from the bucket
        bucket.bucketObjects.pull(deletingObject._id);

        const updateBucket = await bucket.save();
        const deleteObject = await Object.deleteOne({ objectName, userId });

        if (updateBucket && deleteObject.deletedCount === 1) {
          res
            .status(200)
            .json({ sts: "01", msg: "Object deleted successfully" });
        } else {
          res.status(500).json({ sts: "00", msg: "Object failed to delete" });
        }
      });
    } else {
      res.status(404).json({ sts: "00", msg: "Object not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ sts: "00", msg: "Internal Server Error" });
  }
};
