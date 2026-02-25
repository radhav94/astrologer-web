// import { useCall } from "../context/CallContext";
// import { useCall } from "../../context/CallContext";
import { useCall } from "../../../context/CallContext";
import VideoCalling from "./VideoCall";
// import VideoCalling from "./VideoCall";
import AgoraVoiceCalling from "./VoiceCall";
import IncomingMessagePopup from "../../../components/IncomingMessagePopup";


export default function AudioVideoContainer() {
  const { activeCall } = useCall();

  if (!activeCall) return null;

  // ⭐ Type based rendering
  return (
    <>
      <IncomingMessagePopup />
      {activeCall.callType === "video" && <VideoCalling callData={activeCall} />}
      {activeCall.callType === "audio" && <AgoraVoiceCalling callData={activeCall} />}
    </>
  );
}
