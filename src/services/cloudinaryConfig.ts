import { v2 as cloudinary } from "cloudinary";
import { Request } from "express";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Custom Cloudinary storage engine compatible with cloudinary v2
const storage = {
  _handleFile(
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, info?: Partial<Express.Multer.File>) => void
  ) {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "fullstack-saas",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return cb(error);
        cb(null, {
          filename: result?.public_id || "",
          path: result?.secure_url || "",
          size: result?.bytes || 0,
        });
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    if (file.stream) {
      file.stream.pipe(uploadStream);
    } else if (file.buffer) {
      const bufferStream = Readable.from(file.buffer);
      bufferStream.pipe(uploadStream);
    }
  },

  _removeFile(
    req: Request,
    file: Express.Multer.File & { filename?: string },
    cb: (error: Error | null) => void
  ) {
    if (file.filename) {
      cloudinary.uploader.destroy(file.filename, (error) => {
        cb(error || null);
      });
    } else {
      cb(null);
    }
  },
};

export { cloudinary, storage };
