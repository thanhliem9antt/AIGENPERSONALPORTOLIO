import mongoose from 'mongoose';

const appearanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    primaryColor: { type: String, default: '#8b5cf6' },
    backgroundType: { type: String, enum: ['gradient', 'image', 'solid', 'video'], default: 'gradient' },
    backgroundValue: { type: String, default: 'linear-gradient(135deg,#08090c,#17122b)' },
    backgroundOpacity: { type: Number, default: 0.7, min: 0, max: 1 },
    backgroundBlur: { type: Number, default: 0, min: 0, max: 24 },
    coverBlur: { type: Number, default: 0, min: 0, max: 24 },
    coverType: { type: String, enum: ['image', 'gradient', 'solid'], default: 'image' },
    coverValue: { type: String, default: '' },
    backgroundPosition: { type: String, default: 'center', enum: ['center', 'top', 'bottom'] },
    overlayColor: { type: String, default: '#08090c', match: /^#[0-9a-f]{6}$/i },
    blurStrength: { type: Number, default: 18, min: 0, max: 40 },
    cardStyle: { type: String, default: 'glass', enum: ['glass', 'solid', 'minimal'] },
    borderRadius: { type: Number, default: 24, min: 0, max: 48 },
    fontFamily: { type: String, default: 'Inter', enum: ['Inter', 'Manrope', 'Plus Jakarta Sans'] },
    displayNameStyle: {
      type: String,
      default: 'classic',
      enum: ['classic', 'gradient', 'neon', 'outline', 'serif', 'mono', 'elegant'],
    },
    displayNameColor: { type: String, default: '#ffffff', match: /^#[0-9a-f]{6}$/i },
    displayNameGradient: { type: String, default: 'linear-gradient(90deg,#c4b5fd,#f0abfc)' },
    enableAnimations: { type: Boolean, default: true },
    enableParticles: { type: Boolean, default: false },
    profileEffect: {
      type: String,
      default: 'none',
      enum: ['none', 'snow', 'sakura', 'rain', 'sunlight', 'leaves', 'stars', 'fireflies', 'bubbles'],
    },
    enableCursorEffect: { type: Boolean, default: false },
    cursorStyle: {
      type: String,
      default: 'default',
      enum: ['default', 'glow', 'dot', 'ring', 'crosshair', 'sparkle', 'block', 'heart'],
    },
    cursorColor: { type: String, default: '#a78bfa', match: /^#[0-9a-f]{6}$/i },
    cursorSize: { type: Number, default: 18, min: 8, max: 48 },
    musicUrl: String,
    musicPublicId: String,
    musicVolume: { type: Number, default: 0.35, min: 0, max: 1 },
    showMusicControl: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model('Appearance', appearanceSchema);
