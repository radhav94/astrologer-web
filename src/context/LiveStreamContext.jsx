import { createContext, useContext, useState, useCallback } from "react";

const LiveStreamContext = createContext();

export const LiveStreamProvider = ({ children }) => {
  const [isLiveMinimized, setIsLiveMinimized] = useState(false);
  const [liveMetadata, setLiveMetadata] = useState(null);
  const [isLive, setIsLive] = useState(false);

  const startLiveSession = useCallback(() => {
    setIsLive(true);
  }, []);

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
  }, []);

  return (
    <LiveStreamContext.Provider
      value={{
        isLive,
        isLiveMinimized,
        liveMetadata,
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
