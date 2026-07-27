import { MapPin } from 'lucide-react';

export default function ProfilePreview({ profile = {}, user = {}, appearance = {} }) {
  return (
    <div
      className="overflow-hidden border border-white/10 bg-[#101116]"
      style={{ borderRadius: appearance.borderRadius || 24, fontFamily: appearance.fontFamily }}
    >
      <div
        className="h-32 bg-gradient-to-br from-violet-500/30 to-slate-900 bg-cover bg-center"
        style={
          profile.backgroundUrl
            ? { backgroundImage: `linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.35)),url(${profile.backgroundUrl})` }
            : undefined
        }
      />
      <div className="p-5">
        <div className="-mt-14 mb-3 h-20 w-20 overflow-hidden rounded-2xl border-4 border-[#101116] bg-gradient-to-br from-violet-300 to-zinc-700">
          {profile.avatarUrl && <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />}
        </div>
        <h3 className="text-xl font-semibold">{profile.displayName || user.fullName || 'Tên của bạn'}</h3>
        <p className="text-sm text-zinc-500">@{user.username || 'username'}</p>
        <p className="mt-3 text-sm text-violet-300">{profile.headline || 'Tiêu đề nghề nghiệp'}</p>
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
          {profile.skills?.map((skill) => (
            <span key={skill} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px]">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
