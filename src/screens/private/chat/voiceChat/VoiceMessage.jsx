import { useEffect, useRef, useState } from "react";
import { IoPlay, IoPause } from "react-icons/io5";
import { playAudio, stopAudio } from "./audioController";

const VoiceMessage = ({ url, sender }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoadingDuration, setIsLoadingDuration] = useState(true);

  // Fetch duration from audio element at runtime
  useEffect(() => {
    if (!url) {
      setDuration(0);
      setIsLoadingDuration(false);
      return;
    }

    const audio = new Audio();
    let durationCheckTimeout;
    let attemptCount = 0;
    const MAX_ATTEMPTS = 3;

    const checkDuration = (rawDuration) => {
      // Validate duration
      if (isFinite(rawDuration) && rawDuration > 0) {
        setDuration(Math.floor(rawDuration));
        setIsLoadingDuration(false);
        return true;
      }
      return false;
    };

    const handleLoadedMetadata = () => {
      const rawDuration = audio.duration;
      if (checkDuration(rawDuration)) {
        return;
      }
      // If duration is invalid, try alternative method
      console.warn('Invalid audio duration on loadedmetadata:', rawDuration);
      tryAlternativeMethod();
    };

    const tryAlternativeMethod = () => {
      if (attemptCount >= MAX_ATTEMPTS) {
        console.error('Failed to get valid duration after', MAX_ATTEMPTS, 'attempts');
        setDuration(0);
        setIsLoadingDuration(false);
        return;
      }

      attemptCount++;
      // Method 1: Try seeking to get duration
      audio.currentTime = 1e101; // Jump to end
      
      durationCheckTimeout = setTimeout(() => {
        const rawDuration = audio.duration;
        if (!checkDuration(rawDuration)) {
          // Method 2: Try playing briefly
          audio.play().then(() => {
            setTimeout(() => {
              audio.pause();
              audio.currentTime = 0;
              if (!checkDuration(audio.duration)) {
                // Still invalid, give up
                setDuration(0);
                setIsLoadingDuration(false);
              }
            }, 100);
          }).catch(() => {
            setDuration(0);
            setIsLoadingDuration(false);
          });
        }
      }, 300);
    };

    const handleError = (e) => {
      console.error('Error loading audio:', e);
      setDuration(0);
      setIsLoadingDuration(false);
    };

    const handleDurationChange = () => {
      const rawDuration = audio.duration;
      checkDuration(rawDuration);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('error', handleError);

    // Set preload to metadata only
    audio.preload = 'metadata';
    audio.src = url;
    audio.load();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('error', handleError);
      if (durationCheckTimeout) {
        clearTimeout(durationCheckTimeout);
      }
      audio.pause();
      audio.src = '';
    };
  }, [url]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set the source if not already set
    if (!audio.src || audio.src === '') {
      audio.src = url;
    }

    audio.paused ? playAudio(audio) : stopAudio(audio);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set the source
    audio.src = url;

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
  }, [url]);

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
          {isLoadingDuration ? '...' : `${duration}s`}
        </div>
      </div>

      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" style={{ display: 'none' }}>
        <source src={url} type="audio/webm" />
        <source src={url} type="audio/mpeg" />
        <source src={url} />
      </audio>


    </div>
  );
};

export default VoiceMessage;
