// import { useCall } from "../context/CallContext";
// import { useCall } from "../../context/CallContext";
import { useCall } from "../../../context/CallContext";
import VideoCalling from "./VideoCall";
// import VideoCalling from "./VideoCall";
import AgoraVoiceCalling from "./VoiceCall";


export default function AudioVideoContainer() {
  const { activeCall } = useCall();

  if (!activeCall) return null;

  // ⭐ Type based rendering
  if (activeCall.callType === "video") {
    return <VideoCalling callData={activeCall} />;
  }

  if (activeCall.callType === "audio") {
    return <AgoraVoiceCalling callData={activeCall} />;
  }

  return null;
}
