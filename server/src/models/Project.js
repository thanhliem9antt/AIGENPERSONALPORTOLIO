import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, required: true, trim: true, lowercase: true },
  shortDescription: { type: String, trim: true, maxlength: 240 },
  description: { type: String, trim: true, maxlength: 3000 },
  thumbnailUrl: String,
  thumbnailPublicId: String,
  technologies: [{ type: String, trim: true }],
  demoUrl: String,
  githubUrl: String,
  status: { type: String, enum: ['Đang phát triển', 'Đã hoàn thành', 'Tạm dừng'], default: 'Đang phát triển' },
  isFeatured: { type: Boolean, default: false },
  isVisible: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

projectSchema.index({ userId: 1, slug: 1 }, { unique: true });
export default mongoose.model('Project', projectSchema);
