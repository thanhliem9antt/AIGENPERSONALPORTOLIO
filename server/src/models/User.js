import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

export const USER_ROLES = ['user', 'admin', 'moderator', 'creator', 'verified', 'vip'];

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 80 },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9_]+$/ },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, default: 'user', enum: ['user', 'admin'] },
    roles: {
      type: [{ type: String, enum: USER_ROLES }],
      default: ['user'],
      validate: {
        validator: (roles) =>
          roles.length > 0 && roles.length <= USER_ROLES.length && new Set(roles).size === roles.length,
        message: 'Danh sách role không hợp lệ',
      },
    },
    titles: {
      type: [{ type: String, trim: true, maxlength: 40 }],
      default: [],
      validate: {
        validator: (titles) =>
          titles.length <= 10 && new Set(titles.map((title) => title.toLowerCase())).size === titles.length,
        message: 'Danh sách danh hiệu không hợp lệ',
      },
    },
    isActive: { type: Boolean, default: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, select: false },
    referralCount: { type: Number, default: 0, min: 0 },
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
  object.roles = [...new Set(['user', ...(object.roles || []), ...(object.role === 'admin' ? ['admin'] : [])])];
  delete object.password;
  delete object.referredBy;
  delete object.tokenVersion;
  return object;
};

export default mongoose.model('User', userSchema);
