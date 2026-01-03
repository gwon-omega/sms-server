import { v2 as cloudinary } from "cloudinary";
import { Request } from "express";
import { Readable } from "stream";
import { StorageEngine } from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Custom Cloudinary storage engine compatible with cloudinary v2
class CloudinaryStorage implements StorageEngine {
  _handleFile(
    req: Request,
    file: Express.Multer.File,
    cb: (error: any, info?: Partial<Express.Multer.File>) => void
  ): void {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "fullstack-saas",
        resource_type: "auto",
      },
      (error: any, result: any) => {
        if (error) return cb(error);
        cb(null, {
          filename: result?.public_id || "",
          path: result?.secure_url || "",
          size: result?.bytes || 0,
        });
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    if ((file as any).stream) {
      (file as any).stream.pipe(uploadStream);
    } else if (file.buffer) {
      const bufferStream = Readable.from(file.buffer);
      bufferStream.pipe(uploadStream);
    }
  }

  _removeFile(
    req: Request,
    file: Express.Multer.File & { filename?: string },
    cb: (error: Error | null) => void
  ): void {
    if (file.filename) {
      cloudinary.uploader.destroy(file.filename, (error: any) => {
        cb(error || null);
      });
    } else {
      cb(null);
    }
  }
}

const storage = new CloudinaryStorage();

export { cloudinary, storage };
