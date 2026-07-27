import { useEffect, useState } from 'react';
import { CalendarDays, Copy, ExternalLink, FolderKanban, Gamepad2, Link2, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import { Button, LoadingSpinner } from '../../components/common/UI';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function OverviewPage() {
  const {user}=useAuth(); const {notify}=useToast(); const [stats,setStats]=useState(null);
  useEffect(()=>{Promise.all([api.get('/profile/me'),api.get('/social-links'),api.get('/projects'),api.get('/games')]).then(([p,s,j,g])=>setStats({profile:p.data.profile,links:s.data.items.length,projects:j.data.items.length,games:g.data.games.length}))},[]);
  if(!stats)return <LoadingSpinner/>;
  const url=`${location.origin}/@${user.username}`; const copy=()=>navigator.clipboard.writeText(url).then(()=>notify('Đã sao chép đường dẫn'));
  const cards=[[UsersRound,'Lượt xem',stats.profile?.profileViews||0],[Link2,'Liên kết',stats.links],[FolderKanban,'Dự án',stats.projects],[Gamepad2,'Game đã chơi',stats.games],[CalendarDays,'Ngày tham gia',new Date(user.createdAt).toLocaleDateString('vi-VN')]];
  return <section><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Dashboard</p><h1 className="mt-2 text-3xl font-semibold">Chào {user.fullName.split(' ').at(-1)}.</h1><p className="mt-2 text-zinc-500">Profile của bạn đang sẵn sàng để tạo ấn tượng.</p></div><div className="flex gap-2"><Button variant="ghost" onClick={copy}><Copy size={16}/>Sao chép link</Button><a href={url} target="_blank" rel="noreferrer"><Button><ExternalLink size={16}/>Xem profile</Button></a></div></div><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{cards.map(([Icon,label,value])=><article key={label} className="glass rounded-2xl p-5"><Icon className="text-violet-300" size={19}/><p className="mt-7 text-2xl font-semibold">{value}</p><p className="mt-1 text-sm text-zinc-500">{label}</p></article>)}</div><div className="glass mt-6 rounded-3xl p-6"><h2 className="text-lg font-semibold">Hoàn thiện profile</h2><p className="mt-2 text-sm text-zinc-400">Thêm thông tin, liên kết, game và dự án để profile kể trọn câu chuyện của bạn.</p><div className="mt-5 flex flex-wrap gap-2"><Link to="/dashboard/profile"><Button variant="accent">Chỉnh sửa profile</Button></Link><Link to="/dashboard/games"><Button variant="ghost">Thêm game</Button></Link><Link to="/dashboard/projects"><Button variant="ghost">Quản lý dự án</Button></Link></div></div></section>;
}
