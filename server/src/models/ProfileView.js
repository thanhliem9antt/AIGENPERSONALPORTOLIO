import mongoose from 'mongoose';

const profileViewSchema = new mongoose.Schema({
  profileUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  visitorIpHash: { type: String, required: true },
  userAgent: { type: String, maxlength: 300 },
  viewedAt: { type: Date, default: Date.now, expires: '90d' },
});

profileViewSchema.index({ profileUserId: 1, visitorIpHash: 1, viewedAt: -1 });
export default mongoose.model('ProfileView', profileViewSchema);
