import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 80 },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9_]+$/ },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, default: 'user', enum: ['user', 'admin'] },
    isActive: { type: Boolean, default: true },
    tokenVersion: { type: Number, default: 0, min: 0, select: false },
  },
  { timestamps: true },
);

userSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(value) {
  return bcrypt.compare(value, this.password);
};

userSchema.methods.toJSON = function safeJSON() {
  const object = this.toObject();
  delete object.password;
  delete object.tokenVersion;
  return object;
};

export default mongoose.model('User', userSchema);
