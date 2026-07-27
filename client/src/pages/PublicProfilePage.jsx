import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock3,
  Copy,
  ExternalLink,
  Facebook,
  Gamepad2,
  Github,
  Globe,
  Heart,
  Instagram,
  Link as LinkIcon,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Music,
  Phone,
  Send,
  Youtube,
} from 'lucide-react';
import api from '../api/axiosClient';
import { LoadingSpinner } from '../components/common/UI';
import MusicPlayer from '../components/profile/MusicPlayer';
import { useToast } from '../contexts/ToastContext';

const socialIcons = {
  Github,
  Facebook,
  Linkedin,
  Instagram,
  Youtube,
  Mail,
  MessageCircle,
  Send,
  Globe,
  Music,
  ExternalLink,
  Link: LinkIcon,
};

function GameCover({ game }) {
  if (game.coverUrl)
    return (
      <img
        src={game.coverUrl}
        alt={`Ảnh bìa ${game.title}`}
        className="h-28 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />
    );
  return (
    <div className="grid h-28 place-items-center bg-gradient-to-br from-red-500/25 via-zinc-950 to-violet-500/20">
      <Gamepad2 className="text-white/60" size={30} />
    </div>
  );
}

export default function PublicProfilePage() {
  const { profileHandle } = useParams();
  const username = profileHandle?.startsWith('@') ? profileHandle.slice(1) : profileHandle;
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const { notify } = useToast();

  useEffect(() => {
    document.title = `@${username} — NOIR`;
    api
      .get(`/profile/public/${username}`)
      .then(({ data: profileData }) => {
        setData(profileData);
        document.title = `${profileData.profile.displayName || profileData.user.fullName} (@${username}) — NOIR`;
        const description = profileData.profile.bio || `Profile của @${username}`;
        document.querySelector('meta[name="description"]')?.setAttribute('content', description);
        [
          ['og:title', document.title],
          ['og:description', description],
          ['og:url', location.href],
          ['og:image', profileData.profile.avatarUrl],
        ].forEach(([property, content]) => {
          if (!content) return;
          let meta = document.querySelector(`meta[property="${property}"]`);
          if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', content);
        });
        api.post(`/profile/public/${username}/view`).catch(() => {});
      })
      .catch((requestError) => setError(requestError.response?.data?.message || 'Không tìm thấy profile'));
    return () => {
      document.title = 'NOIR — Dấu ấn cá nhân';
    };
  }, [username]);

  const background = useMemo(() => {
    if (!data) return {};
    const appearance = data.appearance || {};
    if (appearance.backgroundType === 'image') {
      const customBackground = /^https?:\/\//i.test(appearance.backgroundValue || '')
        ? appearance.backgroundValue
        : data.profile.backgroundUrl;
      if (!customBackground) return { background: '#08090c' };
      return {
        backgroundImage: `linear-gradient(rgba(8,9,12,${1 - (appearance.backgroundOpacity ?? 0.7)}),rgba(8,9,12,${1 - (appearance.backgroundOpacity ?? 0.7)})),url(${customBackground})`,
      };
    }
    if (appearance.backgroundType === 'video') return { background: '#08090c' };
    if (appearance.backgroundType === 'solid') return { background: appearance.backgroundValue };
    return { background: appearance.backgroundValue || 'linear-gradient(135deg,#08090c,#17122b)' };
  }, [data]);

  if (error)
    return (
      <main className="grid min-h-screen place-items-center bg-ink text-center">
        <div>
          <h1 className="text-4xl font-semibold">Profile không tồn tại</h1>
          <p className="mt-3 text-zinc-500">{error}</p>
        </div>
      </main>
    );
  if (!data)
    return (
      <main className="grid min-h-screen place-items-center bg-ink">
        <LoadingSpinner label="Đang mở profile" />
      </main>
    );

  const { user, profile, socialLinks, projects, games = [], appearance = {} } = data;
  const featuredProjects = projects.filter((project) => project.isFeatured);
  const videoSource =
    appearance.backgroundType === 'video' && /^https?:\/\//i.test(appearance.backgroundValue || '')
      ? appearance.backgroundValue
      : null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animation =
    appearance.enableAnimations && !reduceMotion
      ? { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55 } }
      : {};

  return (
    <main
      className="relative min-h-screen bg-cover bg-fixed bg-center px-4 py-12 sm:px-6"
      style={{ ...background, fontFamily: appearance.fontFamily, '--cursor-x': '50vw', '--cursor-y': '50vh' }}
      onPointerMove={
        appearance.enableCursorEffect && !reduceMotion
          ? (event) => {
              event.currentTarget.style.setProperty('--cursor-x', `${event.clientX}px`);
              event.currentTarget.style.setProperty('--cursor-y', `${event.clientY}px`);
            }
          : undefined
      }
    >
      {videoSource && (
        <video
          className="fixed inset-0 h-full w-full object-cover"
          src={videoSource}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 bg-black/30" />
      {appearance.enableParticles && !reduceMotion && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => (
            <span
              key={index}
              className="profile-particle"
              style={{
                left: `${(index * 37) % 100}%`,
                animationDelay: `${(index % 7) * -1.3}s`,
                animationDuration: `${10 + (index % 6)}s`,
              }}
            />
          ))}
        </div>
      )}
      {appearance.enableCursorEffect && !reduceMotion && (
        <div
          className="pointer-events-none fixed z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
          style={{
            left: 'var(--cursor-x)',
            top: 'var(--cursor-y)',
            background: `radial-gradient(circle, ${appearance.primaryColor || '#8b5cf6'} 0%, transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}
      <motion.section
        {...animation}
        className={`relative mx-auto w-full max-w-3xl p-5 sm:p-8 ${
          appearance.cardStyle === 'solid'
            ? 'border border-white/10 bg-[#111218] shadow-2xl'
            : appearance.cardStyle === 'minimal'
              ? 'border border-transparent bg-black/20'
              : 'border border-white/15 bg-black/40 shadow-2xl backdrop-blur-2xl'
        }`}
        style={{
          borderRadius: appearance.borderRadius ?? 24,
          backdropFilter: appearance.cardStyle === 'glass' ? `blur(${appearance.blurStrength ?? 18}px)` : undefined,
        }}
      >
        <header className="text-center">
          <div className="relative mx-auto h-28 w-28">
            <div className="h-full w-full overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-violet-300 to-zinc-800 shadow-xl">
              {profile.avatarUrl && (
                <img
                  src={profile.avatarUrl}
                  alt={`Avatar của ${profile.displayName}`}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <span
              className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-[#111218] bg-emerald-400"
              title={profile.availabilityStatus}
            />
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">{profile.displayName || user.fullName}</h1>
          <p className="mt-1 text-sm text-zinc-400">@{user.username}</p>
          <p className="mt-4 text-violet-300" style={{ color: appearance.primaryColor }}>
            {profile.headline}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-300">{profile.bio}</p>
          {profile.location && (
            <p className="mt-3 flex items-center justify-center gap-1 text-xs text-zinc-500">
              <MapPin size={13} />
              {profile.location}
            </p>
          )}
          {(profile.contactEmail || profile.phone || profile.website) && (
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-zinc-400">
              {profile.contactEmail && (
                <a className="flex items-center gap-1 hover:text-white" href={`mailto:${profile.contactEmail}`}>
                  <Mail size={13} />
                  {profile.contactEmail}
                </a>
              )}
              {profile.phone && (
                <a className="flex items-center gap-1 hover:text-white" href={`tel:${profile.phone}`}>
                  <Phone size={13} />
                  {profile.phone}
                </a>
              )}
              {profile.website && (
                <a
                  className="flex items-center gap-1 hover:text-white"
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Globe size={13} />
                  Website
                </a>
              )}
            </div>
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {profile.skills.map((skill) => (
              <span key={skill} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
                {skill}
              </span>
            ))}
          </div>
        </header>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {socialLinks.map((link) => {
            const Icon = socialIcons[link.icon] || LinkIcon;
            return (
              <a
                key={link._id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label || link.platform}
                className="glass flex items-center gap-2 rounded-xl px-4 py-3 text-sm transition hover:-translate-y-1 hover:bg-white/10"
              >
                <Icon size={17} />
                {link.label || link.platform}
              </a>
            );
          })}
        </div>

        {featuredProjects.length > 0 && (
          <section className="mt-10">
            <div className="flex items-end justify-between">
              <div>
                <p className="eyebrow">Selected work</p>
                <h2 className="mt-2 text-xl font-semibold">Dự án nổi bật</h2>
              </div>
              <span className="text-xs text-zinc-500">{profile.profileViews} lượt xem</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {featuredProjects.map((project) => (
                <a
                  key={project._id}
                  href={project.demoUrl || project.githubUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:scale-[1.015]"
                >
                  <div
                    className="h-32 bg-gradient-to-br from-violet-500/25 to-zinc-900 bg-cover bg-center"
                    style={project.thumbnailUrl ? { backgroundImage: `url(${project.thumbnailUrl})` } : undefined}
                  />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium">{project.title}</h3>
                      <span className="shrink-0 text-[10px] uppercase tracking-wide text-zinc-600">
                        {project.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-zinc-500">{project.shortDescription}</p>
                    {project.technologies?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {project.technologies.slice(0, 4).map((technology) => (
                          <span
                            key={technology}
                            className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-zinc-400"
                          >
                            {technology}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {games.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
                <Gamepad2 size={19} />
              </div>
              <div>
                <p className="eyebrow">Now playing</p>
                <h2 className="mt-1 text-xl font-semibold">Game đã chơi</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {games.map((game) => (
                <a
                  key={game._id}
                  href={game.gameUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-white/20"
                >
                  <div className="relative">
                    <GameCover game={game} />
                    {game.isFavorite && (
                      <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-red-500/85">
                        <Heart fill="currentColor" size={14} />
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium">{game.title}</h3>
                        <p className="mt-1 text-xs text-zinc-500">
                          {game.platform} · {game.status}
                        </p>
                      </div>
                      {game.hoursPlayed > 0 && (
                        <span className="flex shrink-0 items-center gap-1 text-xs text-zinc-500">
                          <Clock3 size={12} />
                          {game.hoursPlayed}h
                        </span>
                      )}
                    </div>
                    {game.rank && (
                      <span className="mt-3 inline-flex rounded-full bg-violet-500/15 px-2.5 py-1 text-[11px] text-violet-300">
                        {game.rank}
                      </span>
                    )}
                    {game.note && <p className="mt-3 line-clamp-2 text-xs leading-5 text-zinc-500">{game.note}</p>}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-10 flex items-center justify-between border-t border-white/10 pt-5">
          <button
            onClick={() => navigator.clipboard.writeText(location.href).then(() => notify('Đã sao chép link'))}
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white"
          >
            <Copy size={14} />
            Sao chép profile
          </button>
          {appearance.showMusicControl && <MusicPlayer src={appearance.musicUrl} volume={appearance.musicVolume} />}
          <span className="text-xs text-zinc-600">Made with NOIR</span>
        </footer>
      </motion.section>
    </main>
  );
}
