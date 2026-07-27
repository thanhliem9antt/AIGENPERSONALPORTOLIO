import { useState } from 'react';
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import api from '../../api/axiosClient';
import { Button, EmptyState, ErrorState, Field, LoadingSpinner, Modal, Select } from '../../components/common/UI';
import { useToast } from '../../contexts/ToastContext';
import useResource from '../../hooks/useResource';

const empty = { platform: 'GitHub', label: '', url: '', icon: 'Link', isVisible: true };
export default function SocialLinksPage() {
  const { data: items, setData: setItems, loading, error, reload } = useResource('/social-links');
  const { notify } = useToast();
  const [form, setForm] = useState(null);
  const [drag, setDrag] = useState(null);
  const save = async (e) => {
    e.preventDefault();
    try {
      if (form._id) {
        const { data } = await api.put(`/social-links/${form._id}`, form);
        setItems(items.map((x) => (x._id === form._id ? data.item : x)));
      } else {
        const { data } = await api.post('/social-links', form);
        setItems([...items, data.item]);
      }
      setForm(null);
      notify('Đã lưu liên kết');
    } catch (err) {
      notify(err.response?.data?.message || 'Không thể lưu', 'error');
    }
  };
  const remove = async (id) => {
    if (!confirm('Xóa liên kết này?')) return;
    await api.delete(`/social-links/${id}`);
    setItems(items.filter((x) => x._id !== id));
    notify('Đã xóa liên kết');
  };
  const drop = async (target) => {
    if (drag === null || drag === target) return;
    const next = [...items];
    const [moved] = next.splice(drag, 1);
    next.splice(target, 0, moved);
    setItems(next);
    setDrag(null);
    await api.put('/social-links/reorder', { ids: next.map((x) => x._id) });
  };
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error.response?.data?.message} onRetry={reload} />;
  return (
    <section>
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow">Kết nối</p>
          <h1 className="mt-2 text-3xl font-semibold">Mạng xã hội</h1>
        </div>
        <Button onClick={() => setForm(empty)}>
          <Plus size={16} />
          Thêm liên kết
        </Button>
      </div>
      <div className="mt-8 grid gap-3">
        {items.length ? (
          items.map((item, index) => (
            <article
              draggable
              onDragStart={() => setDrag(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => drop(index)}
              key={item._id}
              className="glass flex items-center gap-3 rounded-2xl p-4"
            >
              <GripVertical className="cursor-grab text-zinc-600" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.label || item.platform}</p>
                <p className="truncate text-xs text-zinc-500">{item.url}</p>
              </div>
              <button
                onClick={async () => {
                  const { data } = await api.put(`/social-links/${item._id}`, { isVisible: !item.isVisible });
                  setItems(items.map((x) => (x._id === item._id ? data.item : x)));
                }}
                className={`rounded-full px-3 py-1 text-xs ${item.isVisible ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-zinc-500'}`}
              >
                {item.isVisible ? 'Hiển thị' : 'Đã ẩn'}
              </button>
              <button aria-label="Sửa" onClick={() => setForm(item)}>
                <Pencil size={17} />
              </button>
              <button aria-label="Xóa" onClick={() => remove(item._id)} className="text-red-400">
                <Trash2 size={17} />
              </button>
            </article>
          ))
        ) : (
          <EmptyState title="Chưa có liên kết" description="Thêm nơi mọi người có thể tìm và kết nối với bạn." />
        )}
      </div>
      <Modal open={!!form} title={form?._id ? 'Sửa liên kết' : 'Thêm liên kết'} onClose={() => setForm(null)}>
        {form && (
          <form className="grid gap-4" onSubmit={save}>
            <Select
              label="Nền tảng"
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
            >
              {[
                'Facebook',
                'GitHub',
                'LinkedIn',
                'Instagram',
                'TikTok',
                'YouTube',
                'Discord',
                'Telegram',
                'Email',
                'Website',
                'Tùy chỉnh',
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </Select>
            <Field
              label="Nhãn hiển thị"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
            <Field label="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isVisible}
                onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
              />{' '}
              Hiển thị công khai
            </label>
            <Button>Lưu liên kết</Button>
          </form>
        )}
      </Modal>
    </section>
  );
}
