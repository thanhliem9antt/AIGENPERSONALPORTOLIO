import { useRef, useState } from 'react';
import api from '../../api/axiosClient';
import { Button, ErrorState, Field, LoadingSpinner, Select } from '../../components/common/UI';
import ProfilePreview from '../../components/profile/ProfilePreview';
import useResource from '../../hooks/useResource';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const tracks = [
  ['Không chọn nhạc', ''],
  ['Ambient Focus', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'],
  ['Midnight Drive', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'],
  ['Soft Horizon', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'],
];
export default function AppearancePage() {
  const { data: form, setData: setForm, loading, error, reload } = useResource('/appearance', 'appearance');
  const { user } = useAuth();
  const { notify } = useToast();
  const musicRef = useRef();
  const [busy, setBusy] = useState(false);
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error.response?.data?.message} onRetry={reload} />;
  const set = (k) => (e) =>
    setForm({
      ...form,
      [k]:
        e.target.type === 'checkbox'
          ? e.target.checked
          : e.target.type === 'range'
            ? Number(e.target.value)
            : e.target.value,
    });
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.put('/appearance', form);
      setForm(data.appearance);
      notify('Đã lưu giao diện');
    } catch {
      notify('Không thể lưu giao diện', 'error');
    } finally {
      setBusy(false);
    }
  };
  const upload = async (e) => {
    const body = new FormData();
    body.append('music', e.target.files[0]);
    const { data } = await api.post('/appearance/music', body);
    setForm(data.appearance);
    notify('Đã tải nhạc lên');
  };
  return (
    <section>
      <p className="eyebrow">Cá nhân hóa</p>
      <h1 className="mt-2 text-3xl font-semibold">Giao diện</h1>
      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_380px]">
        <form onSubmit={save} className="glass grid gap-5 rounded-3xl p-6 sm:grid-cols-2">
          <Field
            label="Màu chủ đạo"
            type="color"
            className="h-12 p-2"
            value={form.primaryColor}
            onChange={set('primaryColor')}
          />
          <Select label="Kiểu nền" value={form.backgroundType} onChange={set('backgroundType')}>
            <option value="gradient">Gradient</option>
            <option value="image">Ảnh nền</option>
            <option value="solid">Màu đơn</option>
            <option value="video">Video nền</option>
          </Select>
          <Field
            label="Giá trị nền / URL"
            className="sm:col-span-2"
            value={form.backgroundValue || ''}
            onChange={set('backgroundValue')}
          />
          <label className="text-sm text-zinc-300">
            Độ mờ: {form.backgroundOpacity}
            <input
              className="mt-3 w-full"
              type="range"
              min="0"
              max="1"
              step=".05"
              value={form.backgroundOpacity}
              onChange={set('backgroundOpacity')}
            />
          </label>
          <label className="text-sm text-zinc-300">
            Blur: {form.blurStrength}px
            <input
              className="mt-3 w-full"
              type="range"
              min="0"
              max="40"
              value={form.blurStrength}
              onChange={set('blurStrength')}
            />
          </label>
          <Select label="Kiểu card" value={form.cardStyle} onChange={set('cardStyle')}>
            <option value="glass">Glass</option>
            <option value="solid">Solid</option>
            <option value="minimal">Minimal</option>
          </Select>
          <Select label="Font chữ" value={form.fontFamily} onChange={set('fontFamily')}>
            <option>Inter</option>
            <option>Manrope</option>
            <option>Plus Jakarta Sans</option>
          </Select>
          <label className="text-sm text-zinc-300">
            Bo góc: {form.borderRadius}px
            <input
              className="mt-3 w-full"
              type="range"
              min="0"
              max="48"
              value={form.borderRadius}
              onChange={set('borderRadius')}
            />
          </label>
          <label className="text-sm text-zinc-300">
            Âm lượng: {Math.round(form.musicVolume * 100)}%
            <input
              className="mt-3 w-full"
              type="range"
              min="0"
              max="1"
              step=".05"
              value={form.musicVolume}
              onChange={set('musicVolume')}
            />
          </label>
          <Select
            label="Nhạc nền mẫu"
            value={tracks.some((x) => x[1] === form.musicUrl) ? form.musicUrl : ''}
            onChange={(e) => setForm({ ...form, musicUrl: e.target.value })}
          >
            {tracks.map(([name, url]) => (
              <option key={name} value={url}>
                {name}
              </option>
            ))}
          </Select>
          <div className="grid gap-2">
            <span className="text-sm text-zinc-300">Hoặc tải nhạc riêng</span>
            <input ref={musicRef} type="file" accept="audio/*" onChange={upload} className="text-xs text-zinc-500" />
          </div>
          <div className="grid gap-3 text-sm sm:col-span-2">
            {[
              ['enableAnimations', 'Hiệu ứng chuyển động'],
              ['enableParticles', 'Hiệu ứng hạt'],
              ['enableCursorEffect', 'Hiệu ứng con trỏ'],
              ['showMusicControl', 'Hiển thị điều khiển nhạc'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input type="checkbox" checked={!!form[key]} onChange={set(key)} />
                {label}
              </label>
            ))}
          </div>
          <Button disabled={busy} className="sm:col-span-2">
            {busy ? 'Đang lưu…' : 'Lưu giao diện'}
          </Button>
        </form>
        <aside>
          <p className="mb-3 text-sm text-zinc-500">Xem trước chất liệu</p>
          <ProfilePreview user={user} appearance={form} />
        </aside>
      </div>
    </section>
  );
}
