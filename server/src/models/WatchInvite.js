import mongoose from 'mongoose';

const watchInviteSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, uppercase: true, trim: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

watchInviteSchema.index({ roomId: 1, recipient: 1 }, { unique: true });
watchInviteSchema.index({ recipient: 1, status: 1, createdAt: -1 });
watchInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('WatchInvite', watchInviteSchema);
