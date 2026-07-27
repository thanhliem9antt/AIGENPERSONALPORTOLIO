import { useEffect, useRef, useState } from 'react';
import {
  Check,
  Clipboard,
  Headphones,
  Link as LinkIcon,
  Mic,
  MicOff,
  Plus,
  Search,
  Send,
  Users,
  Video,
} from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../../api/axiosClient';
import { Button, ErrorState, LoadingSpinner } from '../../components/common/UI';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

let youtubeApiPromise;
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;
  youtubeApiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    }
  });
  return youtubeApiPromise;
}

function extractVideoId(value) {
  const text = String(value || '').trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(text)) return text;
  try {
    const url = new URL(text);
    const candidate =
      url.hostname === 'youtu.be'
        ? url.pathname.slice(1).split('/')[0]
        : url.searchParams.get('v') || url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1];
    return /^[a-zA-Z0-9_-]{11}$/.test(candidate || '') ? candidate : '';
  } catch {
    return '';
  }
}

const socketRoot = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const roomFromUrl = () => new URLSearchParams(location.search).get('room')?.toUpperCase() || '';

function VideoCard({ video, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(video)}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-black/20 text-left transition hover:border-violet-400/40"
    >
      <div className="aspect-video bg-zinc-900">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="grid h-full place-items-center text-zinc-600">
            <Video />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-medium">{video.title}</p>
        <p className="mt-1 truncate text-xs text-zinc-500">{video.channelTitle || 'YouTube'}</p>
      </div>
    </button>
  );
}

export default function WatchTogetherPage() {
  const { user } = useAuth();
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [room, setRoom] = useState(null);
  const [roomCode, setRoomCode] = useState(roomFromUrl);
  const [invites, setInvites] = useState([]);
  const [videos, setVideos] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchConfigured, setSearchConfigured] = useState(true);
  const [friendUsername, setFriendUsername] = useState('');
  const [participants, setParticipants] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [muted, setMuted] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const socketRef = useRef(null);
  const playerRef = useRef(null);
  const playerElementRef = useRef(null);
  const applyingRemoteRef = useRef(false);
  const roomRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef(new Map());
  const audioContainerRef = useRef(null);

  const isHost = Boolean(room && String(room.hostId?._id || room.hostId) === user?._id);
  const activeRoomId = room?.roomId;
  const hasVideo = Boolean(room?.videoId);

  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  useEffect(() => {
    Promise.all([api.get('/watch/invites'), api.get('/watch/search')])
      .then(([inviteResponse, suggestionResponse]) => {
        setInvites(inviteResponse.data.invites);
        setVideos(suggestionResponse.data.videos);
        setSearchConfigured(suggestionResponse.data.youtubeSearchConfigured);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const enterRoom = async (code = roomCode) => {
    try {
      const normalized = String(code || '')
        .trim()
        .toUpperCase();
      const { data } = await api.post(`/watch/rooms/${normalized}/join`);
      setRoom(data.room);
      setRoomCode(normalized);
      history.replaceState(null, '', `/dashboard/watch-together?room=${normalized}`);
    } catch (requestError) {
      notify(requestError.response?.data?.message || 'Không thể vào phòng', 'error');
    }
  };

  useEffect(() => {
    const initialRoom = roomFromUrl();
    if (initialRoom) enterRoom(initialRoom);
    // The initial deep link only needs to be handled once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeRoomId) return undefined;
    const socket = io(socketRoot, { withCredentials: true });
    const peers = peersRef.current;
    const audioContainer = audioContainerRef.current;
    socketRef.current = socket;

    const ensurePeer = (targetId) => {
      if (peersRef.current.has(targetId)) return peersRef.current.get(targetId);
      const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      localStreamRef.current?.getTracks().forEach((track) => peer.addTrack(track, localStreamRef.current));
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('watch:signal', { targetId, signal: { type: 'ice', candidate: event.candidate } });
        }
      };
      peer.ontrack = (event) => {
        const existing = document.getElementById(`watch-audio-${targetId}`);
        const audio = existing || document.createElement('audio');
        audio.id = `watch-audio-${targetId}`;
        audio.autoplay = true;
        audio.srcObject = event.streams[0];
        if (!existing) audioContainerRef.current?.appendChild(audio);
      };
      peer.onconnectionstatechange = () => {
        if (['failed', 'closed', 'disconnected'].includes(peer.connectionState)) {
          document.getElementById(`watch-audio-${targetId}`)?.remove();
          peersRef.current.delete(targetId);
          peer.close();
        }
      };
      peersRef.current.set(targetId, peer);
      return peer;
    };

    socket.on('connect', () => socket.emit('watch:join', activeRoomId));
    socket.on('watch:participants', setParticipants);
    socket.on('watch:sync', (state) => {
      const player = playerRef.current;
      const currentRoom = roomRef.current;
      setRoom((value) => ({ ...value, ...state }));
      if (!player?.getCurrentTime) return;
      applyingRemoteRef.current = true;
      if (state.videoId && state.videoId !== currentRoom?.videoId)
        player.loadVideoById(state.videoId, state.currentTime);
      else if (Math.abs(player.getCurrentTime() - state.currentTime) > 2) player.seekTo(state.currentTime, true);
      if (state.isPlaying) player.playVideo();
      else player.pauseVideo();
      window.setTimeout(() => {
        applyingRemoteRef.current = false;
      }, 500);
    });
    socket.on('watch:signal', async ({ senderId, signal }) => {
      try {
        const peer = ensurePeer(senderId);
        if (signal.type === 'offer') {
          await peer.setRemoteDescription(signal.description);
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit('watch:signal', {
            targetId: senderId,
            signal: { type: 'answer', description: peer.localDescription },
          });
        } else if (signal.type === 'answer') {
          await peer.setRemoteDescription(signal.description);
        } else if (signal.type === 'ice' && signal.candidate) {
          await peer.addIceCandidate(signal.candidate);
        }
      } catch {
        notify('Kết nối voice với một thành viên bị gián đoạn', 'error');
      }
    });
    socket.on('connect_error', () => notify('Không thể kết nối realtime tới phòng', 'error'));

    return () => {
      socket.disconnect();
      socketRef.current = null;
      peers.forEach((peer) => peer.close());
      peers.clear();
      audioContainer?.replaceChildren();
    };
  }, [activeRoomId, notify]);

  useEffect(() => {
    if (!voiceEnabled || !socketRef.current?.connected) return;
    const socket = socketRef.current;
    participants
      .filter((participant) => participant.id !== socket.id && participant.voiceReady && socket.id < participant.id)
      .forEach(async (participant) => {
        let peer = peersRef.current.get(participant.id);
        if (!peer) {
          peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
          localStreamRef.current?.getTracks().forEach((track) => peer.addTrack(track, localStreamRef.current));
          peer.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit('watch:signal', {
                targetId: participant.id,
                signal: { type: 'ice', candidate: event.candidate },
              });
            }
          };
          peer.ontrack = (event) => {
            document.getElementById(`watch-audio-${participant.id}`)?.remove();
            const audio = document.createElement('audio');
            audio.id = `watch-audio-${participant.id}`;
            audio.autoplay = true;
            audio.srcObject = event.streams[0];
            audioContainerRef.current?.appendChild(audio);
          };
          peersRef.current.set(participant.id, peer);
        }
        if (peer.signalingState === 'stable') {
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          socket.emit('watch:signal', {
            targetId: participant.id,
            signal: { type: 'offer', description: peer.localDescription },
          });
        }
      });
  }, [participants, voiceEnabled]);

  useEffect(() => {
    if (!activeRoomId || !hasVideo || !playerElementRef.current) return undefined;
    let cancelled = false;
    loadYouTubeApi().then((YT) => {
      if (cancelled || !playerElementRef.current) return;
      playerRef.current?.destroy?.();
      const currentRoom = roomRef.current;
      playerRef.current = new YT.Player(playerElementRef.current, {
        host: 'https://www.youtube-nocookie.com',
        videoId: currentRoom?.videoId || undefined,
        playerVars: { playsinline: 1, rel: 0, controls: isHost ? 1 : 0 },
        events: {
          onReady: (event) => {
            const latestRoom = roomRef.current;
            if (latestRoom?.currentTime) event.target.seekTo(latestRoom.currentTime, true);
            if (latestRoom?.isPlaying) event.target.playVideo();
            setPlayerReady(true);
          },
          onStateChange: (event) => {
            if (!isHost || applyingRemoteRef.current || ![1, 2].includes(event.data)) return;
            const currentRoom = roomRef.current;
            socketRef.current?.emit('watch:sync', {
              videoId: currentRoom.videoId,
              title: currentRoom.videoTitle,
              thumbnail: currentRoom.videoThumbnail,
              currentTime: event.target.getCurrentTime(),
              isPlaying: event.data === 1,
            });
          },
        },
      });
    });
    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
      playerRef.current = null;
      setPlayerReady(false);
    };
  }, [activeRoomId, hasVideo, isHost]);

  useEffect(
    () => () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  useEffect(() => {
    if (!isHost || !playerReady) return undefined;
    const timer = window.setInterval(() => {
      const player = playerRef.current;
      const currentRoom = roomRef.current;
      if (!player?.getCurrentTime || !currentRoom?.videoId) return;
      socketRef.current?.emit('watch:sync', {
        videoId: currentRoom.videoId,
        title: currentRoom.videoTitle,
        thumbnail: currentRoom.videoThumbnail,
        currentTime: player.getCurrentTime(),
        isPlaying: player.getPlayerState() === 1,
      });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isHost, playerReady]);

  const createRoom = async () => {
    try {
      const { data } = await api.post('/watch/rooms', {});
      setRoom(data.room);
      setRoomCode(data.room.roomId);
      history.replaceState(null, '', `/dashboard/watch-together?room=${data.room.roomId}`);
    } catch (requestError) {
      notify(requestError.response?.data?.message || 'Không thể tạo phòng', 'error');
    }
  };

  const selectVideo = async (video) => {
    if (!isHost) return;
    const videoId = extractVideoId(video.videoId);
    if (!videoId) return notify('URL hoặc ID YouTube không hợp lệ', 'error');
    const normalized = {
      videoId,
      title: video.title || `YouTube · ${videoId}`,
      thumbnail: video.thumbnail || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      channelTitle: video.channelTitle || '',
    };
    setRoom((value) => ({
      ...value,
      videoId,
      videoTitle: normalized.title,
      videoThumbnail: normalized.thumbnail,
      currentTime: 0,
      isPlaying: true,
    }));
    playerRef.current?.loadVideoById(videoId);
    socketRef.current?.emit('watch:sync', { ...normalized, currentTime: 0, isPlaying: true });
    try {
      await api.post('/watch/history', normalized);
    } catch {
      // Playback should continue even if history cannot be saved.
    }
  };

  const search = async (event) => {
    event.preventDefault();
    const pastedVideoId = extractVideoId(searchText);
    if (pastedVideoId) {
      selectVideo({ videoId: pastedVideoId, title: `YouTube · ${pastedVideoId}` });
      return;
    }
    try {
      const { data } = await api.get('/watch/search', { params: { q: searchText } });
      setVideos(data.videos);
      setSearchConfigured(data.youtubeSearchConfigured);
      if (!data.youtubeSearchConfigured && searchText) {
        notify('Chưa cấu hình YouTube API; hãy dán link video để phát', 'error');
      }
    } catch (requestError) {
      notify(requestError.response?.data?.message || 'Không thể tìm video', 'error');
    }
  };

  const startVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      setVoiceEnabled(true);
      setMuted(false);
      socketRef.current?.emit('watch:voice-state', { enabled: true, muted: false });
    } catch {
      notify('Cần cấp quyền microphone để dùng voice chat', 'error');
    }
  };

  const toggleMute = () => {
    const next = !muted;
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !next;
    });
    setMuted(next);
    socketRef.current?.emit('watch:voice-state', { enabled: true, muted: next });
  };

  const leaveRoom = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setVoiceEnabled(false);
    setRoom(null);
    setParticipants([]);
    history.replaceState(null, '', '/dashboard/watch-together');
  };

  if (loading) return <LoadingSpinner label="Đang chuẩn bị Watch Together" />;
  if (error) return <ErrorState message={error.response?.data?.message || error.message} />;

  if (!room) {
    return (
      <section className="mx-auto max-w-5xl">
        <p className="eyebrow">Watch Together</p>
        <h1 className="mt-2 text-3xl font-semibold">Xem YouTube cùng bạn bè</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Tạo phòng riêng, tham gia bằng mã hoặc nhận lời mời từ bạn bè. Video được đồng bộ theo chủ phòng và voice chat
          chạy trực tiếp giữa các thành viên.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="glass rounded-3xl p-6">
            <Video className="text-violet-300" />
            <h2 className="mt-5 text-xl font-semibold">Bắt đầu một phòng mới</h2>
            <p className="mt-2 text-sm text-zinc-500">Bạn sẽ là chủ phòng và điều khiển video cho mọi người.</p>
            <Button className="mt-6" variant="accent" onClick={createRoom}>
              <Plus size={18} /> Tạo phòng
            </Button>
          </div>
          <form
            className="glass rounded-3xl p-6"
            onSubmit={(event) => {
              event.preventDefault();
              enterRoom();
            }}
          >
            <Users className="text-cyan-300" />
            <h2 className="mt-5 text-xl font-semibold">Tham gia bằng mã</h2>
            <input
              className="input mt-4 uppercase"
              value={roomCode}
              maxLength="8"
              onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
              placeholder="Ví dụ: W8K2H9PM"
              aria-label="Mã phòng"
            />
            <Button className="mt-3 w-full" type="submit">
              Vào phòng
            </Button>
          </form>
        </div>
        {invites.length > 0 && (
          <div className="glass mt-5 rounded-3xl p-6">
            <h2 className="font-semibold">Lời mời đang chờ</h2>
            <div className="mt-4 grid gap-3">
              {invites.map((invite) => (
                <div
                  key={invite._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/5 p-4"
                >
                  <div>
                    <p className="text-sm">{invite.sender.fullName} mời bạn xem cùng</p>
                    <p className="text-xs text-zinc-500">
                      @{invite.sender.username} · Phòng {invite.roomId}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="accent"
                      onClick={async () => {
                        const { data } = await api.put(`/watch/invites/${invite._id}`, { accept: true });
                        setInvites((items) => items.filter((item) => item._id !== invite._id));
                        await enterRoom(data.room.roomId);
                      }}
                    >
                      <Check size={16} /> Tham gia
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={async () => {
                        await api.put(`/watch/invites/${invite._id}`, { accept: false });
                        setInvites((items) => items.filter((item) => item._id !== invite._id));
                      }}
                    >
                      Bỏ qua
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Watch Together</p>
          <h1 className="mt-2 text-3xl font-semibold">Phòng {room.roomId}</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Chủ phòng: @{room.hostId?.username} · {participants.length} người đang kết nối
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            onClick={async () => {
              await navigator.clipboard.writeText(`${location.origin}/dashboard/watch-together?room=${room.roomId}`);
              notify('Đã sao chép link phòng');
            }}
          >
            <Clipboard size={17} /> Sao chép lời mời
          </Button>
          <Button variant="danger" onClick={leaveRoom}>
            Rời phòng
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">
            <div className="relative aspect-video">
              {hasVideo ? (
                <div ref={playerElementRef} className="h-full w-full" />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-black p-8 text-center">
                  <div>
                    <Video className="mx-auto text-zinc-600" size={42} />
                    <p className="mt-4 font-medium">
                      {isHost ? 'Tìm hoặc dán link YouTube để bắt đầu' : 'Đang chờ chủ phòng chọn video'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-xs leading-5 text-amber-200/80">
            Watch Together sử dụng trình phát nhúng chính thức. Quảng cáo, nếu có, do YouTube quyết định và ứng dụng
            không chặn hoặc bỏ qua quảng cáo.
          </div>

          {isHost && (
            <div className="glass rounded-3xl p-5">
              <form className="flex flex-col gap-3 sm:flex-row" onSubmit={search}>
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-4 top-3.5 text-zinc-600" size={18} />
                  <input
                    className="input pl-11"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Tìm video hoặc dán link YouTube…"
                  />
                </div>
                <Button variant="accent">
                  <Search size={17} /> Tìm kiếm
                </Button>
              </form>
              <div className="mt-5 flex items-center justify-between">
                <h2 className="font-semibold">Gợi ý dành cho bạn</h2>
                {!searchConfigured && <span className="text-xs text-zinc-500">Đang dùng lịch sử xem</span>}
              </div>
              {videos.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {videos.map((video) => (
                    <VideoCard key={video.videoId} video={video} onSelect={selectVideo} />
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-sm text-zinc-500">Chưa có lịch sử. Hãy dán một link YouTube để bắt đầu.</p>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-5">
          {isHost && (
            <form
              className="glass rounded-3xl p-5"
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  const { data } = await api.post(`/watch/rooms/${room.roomId}/invites`, {
                    username: friendUsername,
                  });
                  setFriendUsername('');
                  notify(data.message);
                } catch (requestError) {
                  notify(requestError.response?.data?.message || 'Không thể gửi lời mời', 'error');
                }
              }}
            >
              <h2 className="font-semibold">Mời bạn bè</h2>
              <div className="mt-3 flex gap-2">
                <input
                  className="input min-w-0"
                  value={friendUsername}
                  onChange={(event) => setFriendUsername(event.target.value)}
                  placeholder="username"
                />
                <Button aria-label="Gửi lời mời">
                  <Send size={17} />
                </Button>
              </div>
            </form>
          )}

          <div className="glass rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Voice chat</h2>
                <p className="mt-1 text-xs text-zinc-500">Âm thanh trực tiếp giữa các thành viên</p>
              </div>
              <Headphones className="text-violet-300" />
            </div>
            {!voiceEnabled ? (
              <Button className="mt-4 w-full" variant="accent" onClick={startVoice}>
                <Mic size={17} /> Bật voice
              </Button>
            ) : (
              <Button className="mt-4 w-full" variant={muted ? 'danger' : 'ghost'} onClick={toggleMute}>
                {muted ? <MicOff size={17} /> : <Mic size={17} />}
                {muted ? 'Đang tắt mic' : 'Mic đang bật'}
              </Button>
            )}
            <div className="mt-4 grid gap-2">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                  <span
                    className={`h-2 w-2 rounded-full ${participant.voiceReady ? 'bg-emerald-400' : 'bg-zinc-600'}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{participant.fullName}</p>
                    <p className="truncate text-xs text-zinc-500">@{participant.username}</p>
                  </div>
                  {participant.muted && <MicOff size={14} className="text-zinc-500" />}
                </div>
              ))}
            </div>
            <div ref={audioContainerRef} className="hidden" />
          </div>
        </aside>
      </div>
    </section>
  );
}
