import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    displayName: { type: String, trim: true, maxlength: 80 },
    headline: { type: String, trim: true, maxlength: 120 },
    bio: { type: String, trim: true, maxlength: 800 },
    location: { type: String, trim: true, maxlength: 100 },
    contactEmail: { type: String, trim: true },
    phone: { type: String, trim: true },
    website: { type: String, trim: true },
    avatarUrl: String,
    avatarPublicId: String,
    backgroundUrl: String,
    backgroundPublicId: String,
    availabilityStatus: { type: String, default: 'Available for work', maxlength: 80 },
    skills: [{ type: String, trim: true, maxlength: 40 }],
    profileViews: { type: Number, default: 0, min: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model('Profile', profileSchema);
