import { Link, Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/UI';

export default function MainLayout() {
  const { user } = useAuth();
  return (
    <div className="noise min-h-screen overflow-hidden bg-ink">
      <header className="section relative z-10 flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight"><span className="grid h-8 w-8 place-items-center rounded-xl bg-violet-500/20 text-violet-300"><Sparkles size={17} /></span>NOIR</Link>
        <nav className="flex items-center gap-2" aria-label="Điều hướng chính">
          {user ? <Link to="/dashboard"><Button variant="ghost">Dashboard</Button></Link> : <><Link className="hidden text-sm text-zinc-400 hover:text-white sm:block" to="/login">Đăng nhập</Link><Link to="/register"><Button>Tạo profile</Button></Link></>}
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
