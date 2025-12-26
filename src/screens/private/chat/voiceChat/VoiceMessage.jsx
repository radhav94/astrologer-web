import { useEffect, useRef, useState } from "react";
import { IoPlay, IoPause } from "react-icons/io5";
import { playAudio, stopAudio } from "./audioController";

const VoiceMessage = ({ url, duration = 0, sender }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.paused ? playAudio(audio) : stopAudio(audio);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
    };

    const onTimeUpdate = () => {
      if (!audio.duration) return;
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, []);

  return (
    <div className={`rounded-2xl text-sm md:text-base ${sender ? "bg-gray-300" : "bg-gray-100"} flex items-center gap-4 w-full `}>

      {/* Play / Pause */}
      <button
        onClick={togglePlay}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white shrink-0"
      >
        {playing ? <IoPause /> : <IoPlay />}
      </button>

      {/* Progress + Duration */}
      <div className="flex-1 w-40">
        <div className={`w-full h-1.5 ${sender ? "bg-gray-100" : "bg-gray-300"} rounded-full overflow-hidden`}>
          <div
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-xs text-gray-600 mt-1 shrink-0 w-8">
          {duration}s
        </div>
      </div>

      <audio ref={audioRef} src={url} preload="metadata" />
    </div>
  );
};

export default VoiceMessage;
