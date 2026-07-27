import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    channel: { type: String, default: 'world', index: true },
    content: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

export default mongoose.model('Message', messageSchema);
