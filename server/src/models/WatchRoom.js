import mongoose from 'mongoose';

const watchRoomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 12 },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    videoId: { type: String, default: '', trim: true, maxlength: 32 },
    videoTitle: { type: String, default: '', trim: true, maxlength: 200 },
    videoThumbnail: { type: String, default: '', trim: true, maxlength: 1000 },
    currentTime: { type: Number, default: 0, min: 0 },
    isPlaying: { type: Boolean, default: false },
    lastSyncedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

watchRoomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
watchRoomSchema.index({ hostId: 1, createdAt: -1 });

export default mongoose.model('WatchRoom', watchRoomSchema);
