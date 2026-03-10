import { useLocation } from "react-router-dom";
import { useLiveStreaming } from "./useLiveStreaming";
import { useLiveChat } from "./useLiveChat";
import LiveView from "./LiveView";
import "./styles/live.scss";

const LiveStreamingContainer = ({ client }) => {
  const ROLE = "host";
  const location = useLocation();
  const previewSettings = location.state || {};

  const live = useLiveStreaming(client, ROLE, previewSettings);
  const chat = useLiveChat(live.channelName);

  return (
    <div className="live-container">
      <LiveView ROLE={ROLE} {...live} {...chat} />
    </div>
  );
};

export default LiveStreamingContainer;
