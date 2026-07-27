import { useEffect, useMemo, useState } from 'react';
import { Clock3, ExternalLink, Gamepad2, GripVertical, Heart, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import api from '../../api/axiosClient';
import { Button, EmptyState, ErrorState, Field, LoadingSpinner, Modal, Select } from '../../components/common/UI';
import { useToast } from '../../contexts/ToastContext';
import useResource from '../../hooks/useResource';

const defaultDetails = {
  status: 'Đang chơi',
  hoursPlayed: 0,
  rank: '',
  note: '',
  isFavorite: false,
  isVisible: true,
};

function Cover({ game, className = '' }) {
  if (game.coverUrl) return <img src={game.coverUrl} alt={`Ảnh bìa ${game.title}`} className={`object-cover ${className}`} />;
  return <div className={`grid place-items-center bg-gradient-to-br from-red-500/25 via-zinc-900 to-violet-500/20 ${className}`}><span className="text-3xl font-black tracking-[-.08em] text-white/80">{game.title.split(' ').map((word) => word[0]).slice(0, 3).join('')}</span></div>;
}

function DetailsForm({ form, setForm, onSubmit, submitLabel }) {
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value });
  return <form className="grid gap-4" onSubmit={onSubmit}>
    <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-3"><Cover game={form} className="h-16 w-28 rounded-xl" /><div><p className="font-semibold">{form.title}</p><p className="text-xs text-zinc-500">{form.platform} · {form.genre}</p></div></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <Select label="Trạng thái" value={form.status} onChange={set('status')}><option>Đang chơi</option><option>Đã hoàn thành</option><option>Tạm nghỉ</option><option>Muốn chơi lại</option></Select>
      <Field label="Số giờ đã chơi" type="number" min="0" max="100000" value={form.hoursPlayed} onChange={set('hoursPlayed')} />
    </div>
    <Field label="Rank / bậc xếp hạng" placeholder="Ví dụ: Diamond, Immortal, Ancient" value={form.rank || ''} onChange={set('rank')} />
    <Field as="textarea" rows="3" label="Ghi chú" placeholder="Điều bạn thích ở game này…" value={form.note || ''} onChange={set('note')} />
    <div className="flex flex-wrap gap-5 text-sm text-zinc-300">
      <label className="flex items-center gap-2"><input type="checkbox" checked={form.isFavorite} onChange={set('isFavorite')} /> Game yêu thích</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={form.isVisible} onChange={set('isVisible')} /> Hiển thị công khai</label>
    </div>
    <Button>{submitLabel}</Button>
  </form>;
}

export default function GamesPage() {
  const { data: games, setData: setGames, loading, error, reload } = useResource('/games', 'games');
  const [catalog, setCatalog] = useState([]);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState('');
  const [form, setForm] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const { notify } = useToast();

  useEffect(() => {
    if (catalogOpen && catalog.length === 0) api.get('/games/catalog').then(({ data }) => setCatalog(data.games));
  }, [catalogOpen, catalog.length]);

  const filteredCatalog = useMemo(() => catalog.filter((game) =>
    (!platform || game.platform === platform)
    && (!query || `${game.title} ${game.genre}`.toLowerCase().includes(query.toLowerCase()))
    && !games?.some((item) => item.gameKey === game.key)), [catalog, games, platform, query]);

  const save = async (event) => {
    event.preventDefault();
    try {
      if (form._id) {
        const { data } = await api.put(`/games/${form._id}`, form);
        setGames(games.map((game) => game._id === form._id ? data.game : game));
      } else {
        const { data } = await api.post('/games', { ...form, gameKey: form.key });
        setGames([...games, data.game]);
      }
      setForm(null);
      setCatalogOpen(false);
      notify('Đã lưu game vào profile');
    } catch (error) {
      notify(error.response?.data?.message || 'Không thể lưu game', 'error');
    }
  };

  const remove = async (id) => {
    if (!confirm('Xóa game này khỏi profile?')) return;
    await api.delete(`/games/${id}`);
    setGames(games.filter((game) => game._id !== id));
    notify('Đã xóa game');
  };

  const drop = async (target) => {
    if (dragIndex === null || dragIndex === target) return;
    const next = [...games];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(target, 0, moved);
    setGames(next);
    setDragIndex(null);
    await api.put('/games/reorder', { ids: next.map((game) => game._id) });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error.response?.data?.message} onRetry={reload} />;

  return <section>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Gaming identity</p><h1 className="mt-2 text-3xl font-semibold">Game đã chơi</h1><p className="mt-2 text-sm text-zinc-500">Thêm những tựa game định hình trải nghiệm của bạn.</p></div><Button onClick={() => setCatalogOpen(true)}><Plus size={16} />Thêm game</Button></div>
    <div className="mt-8 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {games.length ? games.map((game, index) => <article key={game._id} draggable onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => drop(index)} className="glass group overflow-hidden rounded-3xl">
        <div className="relative"><Cover game={game} className="h-40 w-full transition duration-500 group-hover:scale-[1.025]" /><div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0d0e13] to-transparent" /><button aria-label="Kéo để sắp xếp" className="glass absolute left-3 top-3 grid h-9 w-9 cursor-grab place-items-center rounded-xl text-zinc-400"><GripVertical size={16} /></button>{game.isFavorite && <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl bg-red-500/80"><Heart fill="currentColor" size={16} /></span>}</div>
        <div className="p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{game.title}</h2><p className="mt-1 text-xs text-zinc-500">{game.platform} · {game.genre}</p></div><span className={`rounded-full px-2.5 py-1 text-[11px] ${game.isVisible ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-zinc-500'}`}>{game.isVisible ? 'Công khai' : 'Đã ẩn'}</span></div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-400"><span className="rounded-full bg-white/5 px-2.5 py-1">{game.status}</span>{game.hoursPlayed > 0 && <span className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1"><Clock3 size={12} />{game.hoursPlayed} giờ</span>}{game.rank && <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-violet-300">{game.rank}</span>}</div>
        {game.note && <p className="mt-4 line-clamp-2 text-sm leading-6 text-zinc-500">{game.note}</p>}
        <div className="mt-5 flex items-center gap-3">{game.gameUrl && <a href={game.gameUrl} target="_blank" rel="noreferrer" aria-label={`Mở trang ${game.title}`}><ExternalLink size={17} /></a>}<button className="ml-auto" onClick={() => setForm({ ...game })} aria-label="Sửa game"><Pencil size={17} /></button><button className="text-red-400" onClick={() => remove(game._id)} aria-label="Xóa game"><Trash2 size={17} /></button></div></div>
      </article>) : <div className="md:col-span-2 2xl:col-span-3"><EmptyState title="Chưa có game nào" description="Chọn từ catalog Steam và Riot Games để tạo bộ sưu tập của bạn." action={<Button onClick={() => setCatalogOpen(true)}><Gamepad2 size={16} />Khám phá catalog</Button>} /></div>}
    </div>

    <Modal open={catalogOpen && !form} title="Chọn game đã chơi" onClose={() => setCatalogOpen(false)}>
      <div className="grid gap-3 sm:grid-cols-[1fr_160px]"><label className="relative"><Search className="absolute left-3 top-3.5 text-zinc-600" size={16} /><input className="input pl-10" placeholder="Tìm theo tên hoặc thể loại" value={query} onChange={(event) => setQuery(event.target.value)} /></label><select className="input" value={platform} onChange={(event) => setPlatform(event.target.value)}><option value="">Tất cả nền tảng</option><option>Steam</option><option>Riot Games</option></select></div>
      <div className="mt-5 grid max-h-[55vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">{filteredCatalog.map((game) => <button key={game.key} onClick={() => setForm({ ...game, ...defaultDetails })} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition hover:border-violet-400/40 hover:bg-white/10"><Cover game={game} className="h-24 w-full" /><div className="p-3"><p className="text-sm font-semibold">{game.title}</p><p className="mt-1 text-xs text-zinc-500">{game.platform} · {game.genre}</p></div></button>)}</div>
      {filteredCatalog.length === 0 && <p className="py-10 text-center text-sm text-zinc-500">Không tìm thấy game phù hợp hoặc bạn đã thêm tất cả.</p>}
    </Modal>

    <Modal open={!!form} title={form?._id ? 'Cập nhật game' : 'Thêm vào profile'} onClose={() => setForm(null)}>{form && <DetailsForm form={form} setForm={setForm} onSubmit={save} submitLabel={form._id ? 'Lưu thay đổi' : 'Thêm game'} />}</Modal>
  </section>;
}
