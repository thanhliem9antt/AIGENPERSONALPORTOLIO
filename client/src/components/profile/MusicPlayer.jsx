import { Pause, Play, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function MusicPlayer({ src, volume = .35 }) {
  const audio=useRef(null); const [playing,setPlaying]=useState(false);
  useEffect(()=>{if(audio.current)audio.current.volume=volume},[volume]);
  if(!src)return null;
  const toggle=async()=>{if(audio.current.paused){await audio.current.play();setPlaying(true)}else{audio.current.pause();setPlaying(false)}};
  return <div className="flex items-center gap-2"><audio ref={audio} src={src} loop onEnded={()=>setPlaying(false)}/><button onClick={toggle} className="glass grid h-11 w-11 place-items-center rounded-full" aria-label={playing?'Tắt nhạc':'Bật nhạc'}>{playing?<Pause size={17}/>:<Play size={17}/>}</button><Volume2 className="text-zinc-500" size={15}/></div>;
}
