import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const bucketName = req.params.bucketName;
    const uploadPath = `uploads/${bucketName}`;

    // Check if the directory exists, if not, create it
    fs.access(uploadPath, (err) => {
      if (err) {
        fs.mkdir(uploadPath, { recursive: true }, (err) => {
          if (err) {
            console.error("Error creating directory:", err);
            cb(err, uploadPath);
          } else {
            cb(null, uploadPath);
          }
        });
      } else {
        cb(null, uploadPath);
      }
    });
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e6);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
  },
});

export const upload = multer({ storage: storage });
