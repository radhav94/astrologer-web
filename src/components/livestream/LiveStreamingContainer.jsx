import { useLiveStreaming } from "./useLiveStreaming";
import { useLiveChat } from "./useLiveChat";
import LiveView from "./LiveView";
import "./styles/live.scss";

const LiveStreamingContainer = ({ client }) => {
  const ROLE = "host";

  const live = useLiveStreaming(client, ROLE);
  const chat = useLiveChat(live.channelName);

  return (
    <div className="live-container">
      <LiveView ROLE={ROLE} {...live} {...chat} />
    </div>
  );
};

export default LiveStreamingContainer;
