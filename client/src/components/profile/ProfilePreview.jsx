import { useState } from 'react';
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

function previewCover(appearance, profile) {
  const type = appearance.coverType || 'image';
  const value = appearance.coverValue || profile.backgroundUrl;
  if (type === 'solid') return { background: value || '#111218' };
  if (type === 'gradient') return { background: value || 'linear-gradient(135deg,#18181b,#312e81)' };
  if (/^https?:\/\//i.test(value || '')) return { backgroundImage: `url(${value})` };
  return { background: 'linear-gradient(135deg,#18181b,#312e81)' };
}

function CursorPreview({ appearance, position }) {
  const style =
    appearance.cursorStyle === 'default' && appearance.enableCursorEffect
      ? 'glow'
      : appearance.cursorStyle || (appearance.enableCursorEffect ? 'glow' : 'default');
  if (style === 'default' || style === 'crosshair') return null;
  const size = Math.min(appearance.cursorSize || 18, 32);
  const color = appearance.cursorColor || '#a78bfa';
  return (
    <span
      className={`pointer-events-none absolute z-30 rounded-full ${
        style === 'glow'
          ? 'blur-md'
          : style === 'ring'
            ? 'border-2 bg-transparent'
            : style === 'sparkle'
              ? 'cursor-sparkle'
              : style === 'heart'
                ? 'cursor-heart'
                : style === 'block'
                  ? 'cursor-block'
                  : ''
      }`}
      style={{
        left: position.x,
        top: position.y,
        '--cursor-color': color,
        width: size,
        height: size,
        background: style === 'ring' || style === 'sparkle' || style === 'heart' ? 'transparent' : color,
        borderColor: color,
        boxShadow: style === 'glow' ? `0 0 ${size * 1.5}px ${size / 2}px ${color}` : undefined,
      }}
      aria-hidden="true"
    />
  );
}

function EffectPreview({ type }) {
  if (!type || type === 'none') return null;
  return (
    <div className={`profile-effect profile-effect-preview profile-effect-${type}`} aria-hidden="true">
      {Array.from({ length: 18 }, (_, index) => (
        <span
          key={index}
          style={{
            left: `${((index * 47) % 103) - 2}%`,
            animationDelay: `${(index % 7) * -1.2}s`,
            animationDuration: `${7 + (index % 5)}s`,
            '--effect-size': `${6 + (index % 4) * 3}px`,
          }}
        />
      ))}
    </div>
  );
}

function displayNamePreviewStyle(appearance) {
  const style = appearance.displayNameStyle || 'classic';
  const color = appearance.displayNameColor || '#ffffff';
  const result = { color };
  if (style === 'gradient') {
    result.background = appearance.displayNameGradient || 'linear-gradient(90deg,#c4b5fd,#f0abfc)';
    result.WebkitBackgroundClip = 'text';
    result.WebkitTextFillColor = 'transparent';
  }
  if (style === 'neon') result.textShadow = `0 0 8px ${color}, 0 0 18px ${color}`;
  if (style === 'outline') {
    result.color = 'transparent';
    result.WebkitTextStroke = `1px ${color}`;
  }
  if (style === 'serif' || style === 'elegant') result.fontFamily = 'Georgia, serif';
  if (style === 'elegant') result.fontStyle = 'italic';
  if (style === 'mono') result.fontFamily = 'ui-monospace, SFMono-Regular, monospace';
  return result;
}

export default function ProfilePreview({ profile = {}, user = {}, appearance = {} }) {
  const [cursorPosition, setCursorPosition] = useState({ x: '78%', y: '18%' });
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
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        setCursorPosition({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });
      }}
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
      <EffectPreview type={appearance.profileEffect} />
      <div
        className="absolute left-5 right-5 top-5 z-10 h-32 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/40 via-zinc-900 to-cyan-500/30"
        aria-label="Ảnh bìa profile"
      >
        <div
          className="absolute inset-0 scale-105 bg-cover"
          style={{
            ...previewCover(appearance, profile),
            backgroundPosition: appearance.backgroundPosition || 'center',
            filter: `blur(${appearance.coverBlur || 0}px)`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" aria-hidden="true" />
      </div>
      {appearance.backgroundType === 'video' && (
        <span className="absolute left-4 top-4 z-20 inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[10px] text-zinc-300">
          <Play size={10} /> Video nền
        </span>
      )}
      <CursorPreview appearance={appearance} position={cursorPosition} />

      <div
        className={`relative z-10 mt-28 border p-5 shadow-2xl backdrop-blur-xl ${cardClass}`}
        style={{
          borderRadius: appearance.borderRadius || 24,
          backdropFilter: appearance.cardStyle === 'glass' ? `blur(${appearance.blurStrength ?? 18}px)` : undefined,
        }}
      >
        <div className="-mt-14 mb-3 h-20 w-20 overflow-hidden rounded-2xl border-4 border-[#101116] bg-gradient-to-br from-violet-300 to-zinc-700">
          {profile.avatarUrl && <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />}
        </div>
        <h3 className="text-xl font-semibold" style={displayNamePreviewStyle(appearance)}>
          {profile.displayName || user.fullName || 'Tên của bạn'}
        </h3>
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
