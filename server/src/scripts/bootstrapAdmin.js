import 'dotenv/config';
import { connectDatabase } from '../config/database.js';
import AdminAuditLog from '../models/AdminAuditLog.js';
import User from '../models/User.js';

const username = String(process.argv[2] || '')
  .trim()
  .toLowerCase();

if (!/^[a-z0-9_]+$/.test(username)) {
  throw new Error('Dùng: npm run bootstrap-admin -- <username>');
}

await connectDatabase();
const users = await User.find({ isActive: true }).select('role roles');
if (users.some((user) => user.role === 'admin' || user.roles?.includes('admin'))) {
  throw new Error('Hệ thống đã có admin. Hãy dùng form quản trị để cấp thêm quyền.');
}

const target = await User.findOne({ username, isActive: true }).select('+tokenVersion');
if (!target) throw new Error(`Không tìm thấy tài khoản @${username}`);

const previousRoles = [...new Set(['user', ...(target.roles || [])])];
target.role = 'admin';
target.roles = [...new Set([...previousRoles, 'admin'])];
target.tokenVersion += 1;
await target.save();
await AdminAuditLog.create({
  actorId: target.id,
  targetId: target.id,
  action: 'admin_bootstrapped',
  previousRoles,
  nextRoles: target.roles,
  previousTitles: target.titles || [],
  nextTitles: target.titles || [],
});

console.log(`Đã cấp quyền admin đầu tiên cho @${username}. Tài khoản cần đăng nhập lại.`);
process.exit(0);
