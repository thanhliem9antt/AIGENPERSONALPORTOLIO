import multer from 'multer';
import { ApiError } from '../utils/http.js';

const storage = multer.memoryStorage();
export const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
      return callback(new ApiError(415, 'Chỉ chấp nhận ảnh JPG, PNG, WebP hoặc GIF'));
    }
    callback(null, true);
  },
});

export const audioUpload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    if (!['audio/mpeg', 'audio/ogg', 'audio/wav'].includes(file.mimetype)) {
      return callback(new ApiError(415, 'Chỉ chấp nhận MP3, OGG hoặc WAV'));
    }
    callback(null, true);
  },
});
