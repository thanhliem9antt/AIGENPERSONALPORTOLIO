import { MapPin, Play } from 'lucide-react';

function previewBackground(appearance, profile) {
  if (appearance.backgroundType === 'image') {
    const url = /^https?:\/\//i.test(appearance.backgroundValue || '')
      ? appearance.backgroundValue
      : profile.backgroundUrl;
    return url
      ? {
          backgroundImage: `url(${url})`,
          backgroundPosition: appearance.backgroundPosition || 'center',
        }
      : { background: 'linear-gradient(135deg,#18181b,#312e81)' };
  }
  if (appearance.backgroundType === 'solid') return { background: appearance.backgroundValue || '#08090c' };
  if (appearance.backgroundType === 'video') return { background: 'linear-gradient(135deg,#09090b,#172554)' };
  return { background: appearance.backgroundValue || 'linear-gradient(135deg,#08090c,#2e1065)' };
}

function CursorPreview({ appearance }) {
  const style =
    appearance.cursorStyle === 'default' && appearance.enableCursorEffect
      ? 'glow'
      : appearance.cursorStyle || (appearance.enableCursorEffect ? 'glow' : 'default');
  if (style === 'default' || style === 'crosshair') return null;
  const size = Math.min(appearance.cursorSize || 18, 32);
  const color = appearance.cursorColor || '#a78bfa';
  return (
    <span
      className={`pointer-events-none absolute right-7 top-7 z-30 rounded-full ${
        style === 'glow' ? 'blur-md' : style === 'ring' ? 'border-2 bg-transparent' : ''
      }`}
      style={{
        width: size,
        height: size,
        background: style === 'ring' ? 'transparent' : color,
        borderColor: color,
        boxShadow: style === 'glow' ? `0 0 ${size * 1.5}px ${size / 2}px ${color}` : undefined,
      }}
      aria-hidden="true"
    />
  );
}

export default function ProfilePreview({ profile = {}, user = {}, appearance = {} }) {
  const cursorStyle =
    appearance.cursorStyle === 'default' && appearance.enableCursorEffect
      ? 'glow'
      : appearance.cursorStyle || (appearance.enableCursorEffect ? 'glow' : 'default');
  const cardClass =
    appearance.cardStyle === 'solid'
      ? 'bg-[#111218] border-white/10'
      : appearance.cardStyle === 'minimal'
        ? 'bg-black/20 border-transparent'
        : 'bg-black/40 border-white/15';

  return (
    <div
      className="relative min-h-[460px] overflow-hidden border border-white/10 bg-[#08090c] p-5"
      style={{
        borderRadius: appearance.borderRadius || 24,
        fontFamily: appearance.fontFamily,
        cursor: cursorStyle === 'crosshair' ? 'crosshair' : undefined,
      }}
    >
      <div
        className="absolute inset-0 scale-105 bg-cover"
        style={{
          ...previewBackground(appearance, profile),
          filter: `blur(${appearance.backgroundBlur || 0}px)`,
          opacity: appearance.backgroundOpacity ?? 0.7,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: appearance.overlayColor || '#08090c', opacity: 1 - (appearance.backgroundOpacity ?? 0.7) }}
      />
      {appearance.backgroundType === 'video' && (
        <span className="absolute left-4 top-4 z-20 inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[10px] text-zinc-300">
          <Play size={10} /> Video nền
        </span>
      )}
      <CursorPreview appearance={appearance} />

      <div
        className={`relative z-10 mt-20 border p-5 shadow-2xl backdrop-blur-xl ${cardClass}`}
        style={{
          borderRadius: appearance.borderRadius || 24,
          backdropFilter: appearance.cardStyle === 'glass' ? `blur(${appearance.blurStrength ?? 18}px)` : undefined,
        }}
      >
        <div className="-mt-14 mb-3 h-20 w-20 overflow-hidden rounded-2xl border-4 border-[#101116] bg-gradient-to-br from-violet-300 to-zinc-700">
          {profile.avatarUrl && <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />}
        </div>
        <h3 className="text-xl font-semibold">{profile.displayName || user.fullName || 'Tên của bạn'}</h3>
        <p className="text-sm text-zinc-500">@{user.username || 'username'}</p>
        <p className="mt-3 text-sm" style={{ color: appearance.primaryColor || '#a78bfa' }}>
          {profile.headline || 'Tiêu đề nghề nghiệp'}
        </p>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-400">
          {profile.bio || 'Một đoạn giới thiệu ngắn và đầy cá tính về bạn.'}
        </p>
        {profile.location && (
          <p className="mt-3 flex items-center gap-1 text-xs text-zinc-500">
            <MapPin size={13} />
            {profile.location}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {(profile.skills?.length ? profile.skills : ['Design', 'Creator', 'Developer']).map((skill) => (
            <span key={skill} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px]">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
