import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import {
  BarChart3,
  Brush,
  FolderKanban,
  Gamepad2,
  Link2,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  Tv2,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const links = [
  ['Tổng quan', '/dashboard', BarChart3, true],
  ['Chỉnh sửa profile', '/dashboard/profile', UserRound],
  ['Mạng xã hội', '/dashboard/social-links', Link2],
  ['Dự án', '/dashboard/projects', FolderKanban],
  ['Game đã chơi', '/dashboard/games', Gamepad2],
  ['Giao diện', '/dashboard/appearance', Brush],
  ['Bạn bè & chat', '/dashboard/community', MessageCircle],
  ['Watch Together', '/dashboard/watch-together', Tv2],
  ['Cài đặt tài khoản', '/dashboard/settings', Settings],
];

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = async () => {
    await logout();
    navigate('/');
  };
  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-white/10 bg-[#0b0c10] p-5">
      <div className="mb-8 flex items-center justify-between">
        <NavLink to="/" className="text-lg font-bold">
          NOIR<span className="text-violet-400">.</span>
        </NavLink>
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Đóng menu">
          <X />
        </button>
      </div>
      <nav className="grid gap-1">
        {links.map(([label, to, Icon, end]) => (
          <NavLink
            end={end}
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${isActive ? 'bg-white/10 text-white' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={signOut}
        className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-500 hover:bg-red-500/10 hover:text-red-300"
      >
        <LogOut size={18} />
        Đăng xuất
      </button>
    </aside>
  );
  return (
    <div className="min-h-screen bg-ink">
      <div className="fixed inset-y-0 left-0 hidden lg:block">{sidebar}</div>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 lg:hidden" onClick={() => setOpen(false)}>
          <div className="h-full" onClick={(e) => e.stopPropagation()}>
            {sidebar}
          </div>
        </div>
      )}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-white/10 bg-ink/80 px-5 py-4 backdrop-blur-xl sm:px-8">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Mở menu">
            <Menu />
          </button>
          <div className="ml-auto text-right">
            <p className="text-sm font-medium">{user?.fullName}</p>
            <p className="text-xs text-zinc-500">@{user?.username}</p>
          </div>
        </header>
        <main className="p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
