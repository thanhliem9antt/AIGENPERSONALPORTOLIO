import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';
import { ApiError } from '../utils/http.js';

export function uploadBuffer(buffer, folder, resourceType = 'image') {
  if (!process.env.CLOUDINARY_CLOUD_NAME) throw new ApiError(503, 'Cloudinary chưa được cấu hình');
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType, transformation: resourceType === 'image' ? [{ quality: 'auto', fetch_format: 'auto' }] : undefined },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export async function destroyAsset(publicId, resourceType = 'image') {
  if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
