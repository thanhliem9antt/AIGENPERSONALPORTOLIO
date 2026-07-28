import { useRef, useState } from 'react';
import { Check, Image, MousePointer2, Palette, SlidersHorizontal, Sparkles } from 'lucide-react';
import api from '../../api/axiosClient';
import { Button, ErrorState, Field, LoadingSpinner, Select } from '../../components/common/UI';
import { ImageUploader } from '../../components/forms/Uploaders';
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

const gradientPresets = [
  ['Noir Violet', 'linear-gradient(135deg,#08090c 0%,#17122b 55%,#2e1065 100%)'],
  ['Ocean Night', 'linear-gradient(135deg,#020617 0%,#082f49 55%,#164e63 100%)'],
  ['Crimson', 'linear-gradient(135deg,#09090b 0%,#450a0a 55%,#7f1d1d 100%)'],
  ['Aurora', 'linear-gradient(135deg,#020617 0%,#064e3b 45%,#312e81 100%)'],
  ['Sunset', 'linear-gradient(135deg,#18181b 0%,#7c2d12 45%,#701a75 100%)'],
  ['Mono', 'linear-gradient(135deg,#09090b 0%,#27272a 55%,#52525b 100%)'],
];

const cursorOptions = [
  ['default', 'Mặc định', 'Con trỏ tiêu chuẩn của trình duyệt'],
  ['glow', 'Glow', 'Vầng sáng mềm đi theo con trỏ'],
  ['dot', 'Dot', 'Chấm tròn tối giản'],
  ['ring', 'Ring', 'Vòng tròn hiện đại'],
  ['crosshair', 'Crosshair', 'Dấu ngắm chính xác'],
  ['sparkle', 'Sparkle', 'Tia sáng lấp lánh'],
  ['block', 'Block', 'Khối pixel cá tính'],
  ['heart', 'Heart', 'Trái tim nhỏ đáng yêu'],
];

const colorPresets = [
  ['Tím', '#a78bfa'],
  ['Hồng', '#f0abfc'],
  ['Xanh', '#67e8f9'],
  ['Lục', '#86efac'],
  ['Vàng', '#fde68a'],
  ['Cam', '#fdba74'],
  ['Đỏ', '#fda4af'],
  ['Trắng', '#ffffff'],
];

const displayNameStyles = [
  ['classic', 'Cổ điển', 'Sạch, rõ và dễ đọc'],
  ['gradient', 'Gradient', 'Chuyển màu nổi bật'],
  ['neon', 'Neon', 'Phát sáng như biển hiệu'],
  ['outline', 'Outline', 'Viền chữ hiện đại'],
  ['serif', 'Serif', 'Thanh lịch, cổ điển'],
  ['mono', 'Mono', 'Công nghệ, tối giản'],
  ['elegant', 'Elegant', 'Nghiêng mềm, nghệ thuật'],
];

const profileEffects = [
  ['none', 'Không hiệu ứng', 'Nền tĩnh, tối ưu nhất'],
  ['snow', 'Tuyết rơi', 'Những bông tuyết trắng nhẹ nhàng'],
  ['sakura', 'Hoa anh đào', 'Cánh hoa hồng bay trong gió'],
  ['rain', 'Mưa', 'Mưa rơi tạo không khí điện ảnh'],
  ['sunlight', 'Ánh nắng', 'Tia nắng ấm chuyển động chậm'],
  ['leaves', 'Lá cây', 'Lá xanh và vàng rơi tự nhiên'],
  ['stars', 'Bầu trời sao', 'Những ngôi sao lấp lánh'],
  ['fireflies', 'Đom đóm', 'Đốm sáng bay dịu dàng'],
  ['bubbles', 'Bong bóng', 'Bong bóng trong suốt nổi lên'],
];

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="sm:col-span-2">
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-violet-300" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      {description && <p className="mt-1 text-xs text-zinc-500">{description}</p>}
    </div>
  );
}

export default function AppearancePage() {
  const { data: form, setData: setForm, loading, error, reload } = useResource('/appearance', 'appearance');
  const { user } = useAuth();
  const { notify } = useToast();
  const musicRef = useRef();
  const [busy, setBusy] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error.response?.data?.message} onRetry={reload} />;

  const update = (key, value) => setForm({ ...form, [key]: value });
  const selectedCursor =
    form.cursorStyle === 'default' && form.enableCursorEffect
      ? 'glow'
      : form.cursorStyle || (form.enableCursorEffect ? 'glow' : 'default');
  const selectCursor = (value) => setForm({ ...form, cursorStyle: value, enableCursorEffect: false });
  const set = (key) => (event) =>
    update(
      key,
      event.target.type === 'checkbox'
        ? event.target.checked
        : event.target.type === 'range'
          ? Number(event.target.value)
          : event.target.value,
    );

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.put('/appearance', form);
      setForm({ ...form, ...data.appearance });
      notify('Đã lưu giao diện');
    } catch (requestError) {
      notify(requestError.response?.data?.message || 'Không thể lưu giao diện', 'error');
    } finally {
      setBusy(false);
    }
  };

  const uploadMusic = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append('music', file);
    try {
      const { data } = await api.post('/appearance/music', body);
      setForm(data.appearance);
      notify('Đã tải nhạc lên');
    } catch (requestError) {
      notify(requestError.response?.data?.message || 'Không thể tải nhạc', 'error');
    }
  };

  return (
    <section>
      <p className="eyebrow">Cá nhân hóa</p>
      <h1 className="mt-2 text-3xl font-semibold">Giao diện profile</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-500">
        Tùy chỉnh nền, chất liệu card và con trỏ. Mọi thay đổi được xem trước ngay và áp dụng lên profile công khai sau
        khi lưu.
      </p>

      <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
        <form onSubmit={save} className="glass grid gap-5 rounded-3xl p-5 sm:grid-cols-2 sm:p-6">
          <SectionTitle
            icon={Palette}
            title="Phông nền"
            description="Chọn gradient, ảnh, màu đơn hoặc video làm không gian chính."
          />
          <Select label="Kiểu nền" value={form.backgroundType} onChange={set('backgroundType')}>
            <option value="gradient">Gradient</option>
            <option value="image">Hình ảnh nền</option>
            <option value="solid">Màu đơn</option>
            <option value="video">Video nền</option>
          </Select>
          <Field
            label="Màu chủ đạo"
            type="color"
            className="h-12 p-2"
            value={form.primaryColor}
            onChange={set('primaryColor')}
          />

          {form.backgroundType === 'gradient' && (
            <div className="sm:col-span-2">
              <span className="text-sm text-zinc-300">Gradient có sẵn</span>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gradientPresets.map(([name, value]) => {
                  const selected = form.backgroundValue === value;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => update('backgroundValue', value)}
                      className={`relative h-20 overflow-hidden rounded-2xl border text-left transition ${
                        selected
                          ? 'border-violet-300 ring-2 ring-violet-500/30'
                          : 'border-white/10 hover:border-white/25'
                      }`}
                      style={{ background: value }}
                    >
                      <span className="absolute inset-x-0 bottom-0 bg-black/45 px-2.5 py-2 text-[11px]">{name}</span>
                      {selected && (
                        <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white text-black">
                          <Check size={13} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <Field
                label="CSS gradient tùy chỉnh"
                className="mt-4"
                value={form.backgroundValue || ''}
                onChange={set('backgroundValue')}
                placeholder="linear-gradient(135deg, #08090c, #2e1065)"
              />
            </div>
          )}

          {form.backgroundType === 'image' && (
            <div className="grid gap-4 sm:col-span-2">
              <Field
                label="URL ảnh nền"
                value={form.backgroundValue || ''}
                onChange={set('backgroundValue')}
                placeholder="https://..."
              />
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-black/15 p-4">
                <Image className="text-zinc-500" size={20} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Tải ảnh từ thiết bị</p>
                  <p className="text-xs text-zinc-500">JPG, PNG, WebP hoặc GIF · tối đa 5MB</p>
                </div>
                <ImageUploader
                  endpoint="/profile/background"
                  label="Tải ảnh bìa"
                  onUploaded={(profile) => update('backgroundValue', profile.backgroundUrl)}
                />
              </div>
              <label className="text-sm text-zinc-300">
                Độ mờ ảnh bìa: {form.coverBlur ?? 0}px
                <input
                  className="mt-3 w-full accent-violet-500"
                  type="range"
                  min="0"
                  max="24"
                  value={form.coverBlur ?? 0}
                  onChange={set('coverBlur')}
                />
              </label>
            </div>
          )}

          {form.backgroundType === 'solid' && (
            <Field
              label="Màu nền"
              type="color"
              className="h-12 p-2 sm:col-span-2"
              value={/^#[0-9a-f]{6}$/i.test(form.backgroundValue || '') ? form.backgroundValue : '#08090c'}
              onChange={set('backgroundValue')}
            />
          )}

          {form.backgroundType === 'video' && (
            <Field
              label="URL video nền"
              className="sm:col-span-2"
              value={form.backgroundValue || ''}
              onChange={set('backgroundValue')}
              placeholder="https://.../background.mp4"
            />
          )}

          <label className="text-sm text-zinc-300">
            Độ hiển thị nền: {Math.round((form.backgroundOpacity ?? 0.7) * 100)}%
            <input
              className="mt-3 w-full accent-violet-500"
              type="range"
              min="0"
              max="1"
              step=".05"
              value={form.backgroundOpacity ?? 0.7}
              onChange={set('backgroundOpacity')}
            />
          </label>
          <label className="text-sm text-zinc-300">
            Blur nền: {form.backgroundBlur ?? 0}px
            <input
              className="mt-3 w-full accent-violet-500"
              type="range"
              min="0"
              max="24"
              value={form.backgroundBlur ?? 0}
              onChange={set('backgroundBlur')}
            />
          </label>
          <Field
            label="Màu lớp phủ"
            type="color"
            className="h-12 p-2"
            value={form.overlayColor || '#08090c'}
            onChange={set('overlayColor')}
          />
          <Select
            label="Vị trí ảnh nền"
            value={form.backgroundPosition || 'center'}
            onChange={set('backgroundPosition')}
          >
            <option value="top">Phía trên</option>
            <option value="center">Chính giữa</option>
            <option value="bottom">Phía dưới</option>
          </Select>

          <div className="my-1 border-t border-white/10 sm:col-span-2" />
          <SectionTitle icon={SlidersHorizontal} title="Card & nội dung" />
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
          <div className="sm:col-span-2">
            <span className="text-sm text-zinc-300">Phong cách tên hiển thị</span>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {displayNameStyles.map(([value, label, description]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => update('displayNameStyle', value)}
                  className={`rounded-2xl border p-3 text-left transition ${
                    (form.displayNameStyle || 'classic') === value
                      ? 'border-violet-400/40 bg-violet-500/10'
                      : 'border-white/10 bg-black/10 hover:border-white/20'
                  }`}
                >
                  <span className="flex items-center justify-between text-sm font-medium">
                    {label}
                    {(form.displayNameStyle || 'classic') === value && <Check size={15} className="text-violet-300" />}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-500">{description}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <span className="text-sm text-zinc-300">Màu tên hiển thị</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {colorPresets.map(([label, value]) => (
                <button
                  key={value}
                  type="button"
                  title={label}
                  aria-label={`Màu ${label}`}
                  onClick={() => update('displayNameColor', value)}
                  className={`h-9 w-9 rounded-full border-2 transition ${
                    form.displayNameColor === value ? 'scale-110 border-white' : 'border-white/20'
                  }`}
                  style={{ background: value }}
                />
              ))}
              <Field
                label="Màu tùy chỉnh"
                type="color"
                className="h-9 w-12 p-1"
                value={form.displayNameColor || '#ffffff'}
                onChange={set('displayNameColor')}
              />
            </div>
          </div>
          <label className="text-sm text-zinc-300">
            Blur card: {form.blurStrength}px
            <input
              className="mt-3 w-full accent-violet-500"
              type="range"
              min="0"
              max="40"
              value={form.blurStrength}
              onChange={set('blurStrength')}
            />
          </label>
          <label className="text-sm text-zinc-300">
            Bo góc: {form.borderRadius}px
            <input
              className="mt-3 w-full accent-violet-500"
              type="range"
              min="0"
              max="48"
              value={form.borderRadius}
              onChange={set('borderRadius')}
            />
          </label>

          <div className="my-1 border-t border-white/10 sm:col-span-2" />
          <SectionTitle
            icon={MousePointer2}
            title="Con trỏ"
            description="Kiểu con trỏ này sẽ xuất hiện khi khách xem profile của bạn."
          />
          <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
            {cursorOptions.map(([value, label, description]) => (
              <button
                key={value}
                type="button"
                onClick={() => selectCursor(value)}
                className={`rounded-2xl border p-3 text-left transition ${
                  selectedCursor === value
                    ? 'border-violet-400/40 bg-violet-500/10'
                    : 'border-white/10 bg-black/10 hover:border-white/20'
                }`}
              >
                <span className="flex items-center justify-between text-sm font-medium">
                  {label}
                  {selectedCursor === value && <Check size={15} className="text-violet-300" />}
                </span>
                <span className="mt-1 block text-xs text-zinc-500">{description}</span>
              </button>
            ))}
          </div>
          <Field
            label="Màu con trỏ"
            type="color"
            className="h-12 p-2"
            value={form.cursorColor || '#a78bfa'}
            onChange={set('cursorColor')}
          />
          <label className="text-sm text-zinc-300">
            Kích thước: {form.cursorSize ?? 18}px
            <input
              className="mt-3 w-full accent-violet-500"
              type="range"
              min="8"
              max="48"
              value={form.cursorSize ?? 18}
              onChange={set('cursorSize')}
            />
          </label>

          <div className="my-1 border-t border-white/10 sm:col-span-2" />
          <SectionTitle icon={Sparkles} title="Hiệu ứng & âm thanh" />
          <div className="sm:col-span-2">
            <span className="text-sm text-zinc-300">Hiệu ứng khi khách xem profile</span>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {profileEffects.map(([value, label, description]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => update('profileEffect', value)}
                  className={`rounded-2xl border p-3 text-left transition ${
                    (form.profileEffect || 'none') === value
                      ? 'border-violet-400/40 bg-violet-500/10'
                      : 'border-white/10 bg-black/10 hover:border-white/20'
                  }`}
                >
                  <span className="flex items-center justify-between text-sm font-medium">
                    {label}
                    {(form.profileEffect || 'none') === value && <Check size={15} className="text-violet-300" />}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-500">{description}</span>
                </button>
              ))}
            </div>
          </div>
          <label className="text-sm text-zinc-300">
            Âm lượng: {Math.round(form.musicVolume * 100)}%
            <input
              className="mt-3 w-full accent-violet-500"
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
            value={tracks.some((track) => track[1] === form.musicUrl) ? form.musicUrl : ''}
            onChange={(event) => update('musicUrl', event.target.value)}
          >
            {tracks.map(([name, url]) => (
              <option key={name} value={url}>
                {name}
              </option>
            ))}
          </Select>
          <div className="grid gap-2">
            <span className="text-sm text-zinc-300">Hoặc tải nhạc riêng</span>
            <input
              ref={musicRef}
              type="file"
              accept="audio/*"
              onChange={uploadMusic}
              className="text-xs text-zinc-500"
            />
          </div>
          <div className="grid gap-3 text-sm">
            {[
              ['enableAnimations', 'Hiệu ứng chuyển động'],
              ['enableParticles', 'Hiệu ứng hạt'],
              ['showMusicControl', 'Hiển thị điều khiển nhạc'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input type="checkbox" className="accent-violet-500" checked={Boolean(form[key])} onChange={set(key)} />
                {label}
              </label>
            ))}
          </div>

          <Button disabled={busy} className="sm:col-span-2">
            {busy ? 'Đang lưu…' : 'Lưu giao diện'}
          </Button>
        </form>

        <aside className="xl:sticky xl:top-24">
          <p className="mb-3 text-sm text-zinc-500">Preview trực tiếp</p>
          <ProfilePreview user={user} appearance={form} />
          <p className="mt-3 text-xs leading-5 text-zinc-600">
            Preview mô phỏng màu nền, blur, card và con trỏ. Profile công khai sẽ hiển thị toàn màn hình.
          </p>
        </aside>
      </div>
    </section>
  );
}
