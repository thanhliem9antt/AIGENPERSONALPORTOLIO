import mongoose from 'mongoose';

const appearanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    primaryColor: { type: String, default: '#8b5cf6' },
    backgroundType: { type: String, enum: ['gradient', 'image', 'solid', 'video'], default: 'gradient' },
    backgroundValue: { type: String, default: 'linear-gradient(135deg,#08090c,#17122b)' },
    backgroundOpacity: { type: Number, default: 0.7, min: 0, max: 1 },
    blurStrength: { type: Number, default: 18, min: 0, max: 40 },
    cardStyle: { type: String, default: 'glass', enum: ['glass', 'solid', 'minimal'] },
    borderRadius: { type: Number, default: 24, min: 0, max: 48 },
    fontFamily: { type: String, default: 'Inter', enum: ['Inter', 'Manrope', 'Plus Jakarta Sans'] },
    enableAnimations: { type: Boolean, default: true },
    enableParticles: { type: Boolean, default: false },
    enableCursorEffect: { type: Boolean, default: false },
    musicUrl: String,
    musicPublicId: String,
    musicVolume: { type: Number, default: 0.35, min: 0, max: 1 },
    showMusicControl: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model('Appearance', appearanceSchema);
