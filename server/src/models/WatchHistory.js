import mongoose from 'mongoose';

const watchHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    videoId: { type: String, required: true, trim: true, maxlength: 32 },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    thumbnail: { type: String, default: '', trim: true, maxlength: 1000 },
    channelTitle: { type: String, default: '', trim: true, maxlength: 120 },
    watchCount: { type: Number, default: 1, min: 1 },
    watchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

watchHistorySchema.index({ userId: 1, videoId: 1 }, { unique: true });
watchHistorySchema.index({ userId: 1, watchedAt: -1 });

export default mongoose.model('WatchHistory', watchHistorySchema);
