import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  platform: { type: String, required: true, trim: true, maxlength: 40 },
  label: { type: String, trim: true, maxlength: 60 },
  url: { type: String, required: true, trim: true },
  icon: { type: String, default: 'Link' },
  order: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('SocialLink', socialLinkSchema);
