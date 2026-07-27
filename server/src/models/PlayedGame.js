import mongoose from 'mongoose';

const playedGameSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  gameKey: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  platform: { type: String, required: true, enum: ['Steam', 'Riot Games', 'Khác'] },
  publisher: { type: String, trim: true, maxlength: 80 },
  genre: { type: String, trim: true, maxlength: 60 },
  coverUrl: String,
  gameUrl: String,
  status: { type: String, enum: ['Đang chơi', 'Đã hoàn thành', 'Tạm nghỉ', 'Muốn chơi lại'], default: 'Đang chơi' },
  hoursPlayed: { type: Number, default: 0, min: 0, max: 100000 },
  rank: { type: String, trim: true, maxlength: 60 },
  note: { type: String, trim: true, maxlength: 300 },
  isFavorite: { type: Boolean, default: false },
  isVisible: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

playedGameSchema.index({ userId: 1, gameKey: 1 }, { unique: true });
export default mongoose.model('PlayedGame', playedGameSchema);
