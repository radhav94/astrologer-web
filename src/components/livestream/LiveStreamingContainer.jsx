import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLiveStreaming } from "./useLiveStreaming";
import { useLiveChat } from "./useLiveChat";
import LiveView from "./LiveView";
import { useLiveStream } from "../../context/LiveStreamContext";
import "./styles/live.scss";

const LiveStreamingContainer = ({ client }) => {
  const ROLE = "host";
  const location = useLocation();
  const previewSettings = location.state || {};
  const { startLiveSession } = useLiveStream();

  const live = useLiveStreaming(client, ROLE, previewSettings);
  const chat = useLiveChat(live.channelName, live.isReconnect, live.chatRoomId);

  useEffect(() => {
    startLiveSession();
  }, [startLiveSession]);

  return (
    <div className="live-container">
      <LiveView ROLE={ROLE} {...live} {...chat} />
    </div>
  );
};

export default LiveStreamingContainer;
