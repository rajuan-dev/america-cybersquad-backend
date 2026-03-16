import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { ICloudinaryUploadResponse, IUploadedFile } from "../interfaces/file";
import config from "../config";

// Create uploads folder if not exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// allowed file types
const allowedTypes = [
  // images
  "image/jpeg",
  "image/png",
  "image/avif",
  "image/webp",

  // documents
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx

  // archives
  "application/zip",

  // openDocument formats
  "application/vnd.oasis.opendocument.presentation", // .odp
  "application/vnd.oasis.opendocument.spreadsheet", // .ods
  "application/vnd.oasis.opendocument.text", // .odt
  "application/vnd.oasis.opendocument.chart",
  "application/vnd.oasis.opendocument.graphics",
  "application/vnd.oasis.opendocument.image",
  "application/vnd.oasis.opendocument.text-master",

  // text files
  "text/plain",
  "text/csv",
  "text/html",
  "text/markdown",
  "text/xml",
  "text/json",
  "application/json",
  "application/octet-stream",

  // audio types
  "audio/mpeg", // MP3
  "audio/wav", // WAV
  "audio/ogg", // OGG
  "audio/webm", // WEBM
  "audio/aac", // AAC
  "audio/flac", // FLAC
  "audio/x-m4a", // M4A
  "audio/mp4", // MP4 (audio)
  "audio/x-ms-wma", // WMA
  "audio/m4a", // M4A
  "audio/x-wav", // WAV
  "audio/x-ms-wax", // WAX

  // video types
  "video/mp4", // MP4
  "video/mpeg", // MPEG
  "video/x-msvideo", // AVI
  "video/x-ms-wmv", // WMV
  "video/quicktime", // MOV
  "video/x-flv", // FLV
  "video/webm", // WEBM
  "video/3gpp", // 3GP
  "video/3gpp2", // 3G2
  "video/ogg", // OGG
  "video/x-matroska", // MKV
];

// File filter
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"));
  }
};

// Multer disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// Multer middleware
const upload = multer({ storage, fileFilter });

const profileImage = upload.single("profileImage");

const uploadMessageImages = upload.array("messageImages", 40);
const newsImage = upload.array("image", 40);
const advertiseVideo = upload.single("advertiseVideo");
const invertorRelationImage = upload.single("invertorRelationImage");

// dayTripImage and vehicle image
const image = upload.array("image", 40);

// Cloudinary configuration
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

/**
 * Converts an absolute local file path to a normalized relative URL.
 * e.g. "R:/project/uploads/123-video.mp4" → "/uploads/123-video.mp4"
 */
const toRelativePath = (absolutePath: string): string => {
  const normalized = absolutePath.replace(/\\/g, "/"); // fix Windows backslashes
  const uploadsIndex = normalized.indexOf("/uploads/");
  if (uploadsIndex !== -1) {
    return normalized.slice(uploadsIndex); // "/uploads/filename.mp4"
  }
  // fallback: just return the filename under /uploads/
  return `/uploads/${path.basename(normalized)}`;
};

// Cloudinary uploader function
const uploadToCloudinary = async (
  file: any,
): Promise<ICloudinaryUploadResponse | undefined> => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(file.path)) {
      return reject(new Error(`File not found at ${file.path}`));
    }

    // Determine resource type based on MIME type
    let resourceType: "image" | "video" | "raw" = "raw";

    if (file.mimetype.startsWith("image/")) {
      resourceType = "image";
    } else if (file.mimetype.startsWith("video/")) {
      resourceType = "video";
    } else {
      resourceType = "raw"; // For PDF, DOCX, XLSX, ZIP, etc.
    }

    cloudinary.uploader.upload(
      file.path,
      { resource_type: resourceType },
      (error, result) => {
        // Delete local file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        if (error) {
          reject(error);
        } else {
          resolve(result as ICloudinaryUploadResponse | undefined);
        }
      },
    );
  });
};

// Cloudinary video uploader function (optimized for large video files)
const uploadVideoToCloudinary = async (
  file: any,
): Promise<ICloudinaryUploadResponse | undefined> => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(file.path)) {
      return reject(new Error(`File not found at ${file.path}`));
    }

    if (!file.mimetype.startsWith("video/")) {
      // Clean up local file before rejecting
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return reject(new Error(`File is not a video: ${file.mimetype}`));
    }

    cloudinary.uploader.upload(
      file.path,
      {
        resource_type: "video",
        chunk_size: 6_000_000, // 6MB chunks for large video uploads
        eager: [{ streaming_profile: "full_hd", format: "m3u8" }], // HLS streaming
        eager_async: true, // Process eager transformations asynchronously
      },
      (error, result) => {
        // Delete local file after upload attempt
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        if (error) {
          reject(error);
        } else {
          resolve(result as ICloudinaryUploadResponse | undefined);
        }
      },
    );
  });
};

/**
 * Saves the video locally and returns a clean relative URL.
 * Use this instead of uploadVideoToCloudinary when you want
 * to serve videos from your own server (no Cloudinary).
 *
 * Returns: { videoUrl: "/uploads/1773703032366-video.mp4" }
 */
const saveVideoLocally = (file: any): { videoUrl: string } => {
  if (!file) {
    throw new Error("No file provided");
  }

  if (!file.mimetype.startsWith("video/")) {
    // Clean up if wrong type slipped through
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw new Error(`File is not a video: ${file.mimetype}`);
  }

  return {
    videoUrl: toRelativePath(file.path),
  };
};

export const uploadFile = {
  upload,
  profileImage,

  uploadMessageImages,
  newsImage,
  advertiseVideo,
  invertorRelationImage,
  uploadToCloudinary,
  uploadVideoToCloudinary,
  saveVideoLocally,

  // dayTripImage and vehicle image
  image,
};