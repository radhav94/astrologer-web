import { createContext, useContext, useState, useCallback } from "react";

const LiveStreamContext = createContext();

export const LiveStreamProvider = ({ children }) => {
  const [isLiveMinimized, setIsLiveMinimized] = useState(false);
  const [liveMetadata, setLiveMetadata] = useState(null);
  const [isLive, setIsLiveState] = useState(
    () => sessionStorage.getItem("shubhtalk_is_live") === "true"
  );
  const [liveStartTime, setLiveStartTime] = useState(() => {
    const saved = sessionStorage.getItem("shubhtalk_live_start_time");
    return saved ? Number(saved) : null;
  });

  const setIsLive = useCallback((value) => {
    setIsLiveState(value);
    if (value) {
      sessionStorage.setItem("shubhtalk_is_live", "true");
    } else {
      sessionStorage.removeItem("shubhtalk_is_live");
      sessionStorage.removeItem("shubhtalk_live_start_time");
    }
  }, []);

  const startLiveSession = useCallback(() => {
    setIsLive(true);
    // Only set a new start time if one doesn't already exist (preserves timer on refresh)
    const existing = sessionStorage.getItem("shubhtalk_live_start_time");
    if (existing && Number(existing) > 0) {
      setLiveStartTime(Number(existing));
    } else {
      const now = Date.now();
      setLiveStartTime(now);
      sessionStorage.setItem("shubhtalk_live_start_time", String(now));
    }
  }, [setIsLive]);

  const minimizeLive = useCallback((metadata) => {
    setLiveMetadata(metadata);
    setIsLiveMinimized(true);
  }, []);

  const maximizeLive = useCallback(() => {
    setIsLiveMinimized(false);
  }, []);

  const endLiveSession = useCallback(() => {
    setIsLiveMinimized(false);
    setLiveMetadata(null);
    setIsLive(false);
    setLiveStartTime(null);
    sessionStorage.removeItem("shubhtalk_live_mic");
    sessionStorage.removeItem("shubhtalk_live_camera");
  }, [setIsLive]);

  return (
    <LiveStreamContext.Provider
      value={{
        isLive,
        isLiveMinimized,
        liveMetadata,
        liveStartTime,
        startLiveSession,
        minimizeLive,
        maximizeLive,
        endLiveSession,
      }}
    >
      {children}
    </LiveStreamContext.Provider>
  );
};

export const useLiveStream = () => {
  const ctx = useContext(LiveStreamContext);
  if (!ctx) throw new Error("useLiveStream must be used within LiveStreamProvider");
  return ctx;
};
