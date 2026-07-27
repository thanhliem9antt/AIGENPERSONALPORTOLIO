import mongoose from 'mongoose';

const adminAuditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['access_updated', 'admin_bootstrapped'], required: true },
    previousRoles: [{ type: String }],
    nextRoles: [{ type: String }],
    previousTitles: [{ type: String }],
    nextTitles: [{ type: String }],
  },
  { timestamps: true },
);

adminAuditLogSchema.index({ actorId: 1, createdAt: -1 });
adminAuditLogSchema.index({ targetId: 1, createdAt: -1 });

export default mongoose.model('AdminAuditLog', adminAuditLogSchema);
