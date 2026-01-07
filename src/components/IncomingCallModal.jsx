import { useCall } from "../context/CallContext";
import { voiceSocket } from "../services/appServices/voiceSocketServices";

const IncomingCallModal = () => {
  const { incomingCall, setIncomingCall, setActiveCall } = useCall();
  if (!incomingCall) return null;

  const acceptCall = () => {
    // voiceSocket.emit("accept_call", {
    //   roomId: incomingCall.roomId,
    //   token: incomingCall.agoraToken,
    //   channelName: incomingCall.roomId,
    // });

    voiceSocket.emit("call:accept", {
      roomId: incomingCall.roomId,
      token: incomingCall.agoraToken,
      channelName: incomingCall.roomId,
      acceptedBy : "ASTROLOGER"
    });

    setActiveCall({
      roomId: incomingCall.roomId,
      agoraToken: incomingCall.agoraToken,
      isUserSide: false,
      callType: incomingCall.callType,
      callerName:incomingCall.callerName
    });

    setIncomingCall(null);
  };

  const rejectCall = () => {
    // voiceSocket.emit("reject_call", {
    //   roomId: incomingCall.roomId,
    // });

    voiceSocket.emit("call:reject", {
      roomId: incomingCall.roomId,
      rejectedBy: "ASTROLOGER"
    })
    setIncomingCall(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      {/* Popup */}
      <div className="pointer-events-auto mb-6 w-[90%] max-w-md animate-slideUp rounded-2xl bg-zinc-900/95 p-5 shadow-2xl backdrop-blur-md">
        
        {/* Title */}
        <div className="mb-4 flex items-center gap-3">
          <div className="text-3xl">
            {incomingCall.callType === "video" ? "📹" : "📞"}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Incoming {incomingCall.callType === "video" ? "Video" : "Audio"} Call
            </h3>
            <p className="text-sm text-zinc-400">
              Someone is calling you…
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-5 flex gap-4">
          <button
            onClick={rejectCall}
            className="flex-1 rounded-xl bg-red-600 py-3 text-white font-semibold hover:bg-red-700 active:scale-95 transition"
          >
            Reject
          </button>

          <button
            onClick={acceptCall}
            className="flex-1 rounded-xl bg-green-600 py-3 text-white font-semibold hover:bg-green-700 active:scale-95 transition"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
