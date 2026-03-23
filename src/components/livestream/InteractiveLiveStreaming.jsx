// src/components/LiveStreaming/InteractiveLiveStreaming.jsx
import React from "react";
import { AgoraRTCProvider } from "agora-rtc-react";
import AgoraRTC from "agora-rtc-react";
import LiveStreamingContainer from "./LiveStreamingContainer";
import { useLiveStream } from "../../context/LiveStreamContext";

const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });

const InteractiveLiveStreaming = () => {
  const { isLiveMinimized } = useLiveStream();

  return (
    <AgoraRTCProvider client={client}>
      <div style={{ display: isLiveMinimized ? "none" : "block", width: "100%", height: "100%" }}>
        <LiveStreamingContainer client={client} />
      </div>
    </AgoraRTCProvider>
  );
};

export default InteractiveLiveStreaming;

