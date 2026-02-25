import { useCall } from "../context/CallContext";
import { voiceSocket } from "../services/appServices/voiceSocketServices";
import toast from "./toast";
import { useEffect, useState } from "react";

const IncomingCallModal = () => {
  const { incomingCall, setIncomingCall, setActiveCall, activeCall, sharedAgoraState, setSharedAgoraState, setIsUpgradeRejectionProtected, upgradeRejectionRef } = useCall();
  const [isAccepting, setIsAccepting] = useState(false);

  // Listen for call accept errors from server
  useEffect(() => {
    const handleCallAcceptError = (data) => {
      console.error("Call accept error:", data);
      
      if (data.code === "ALREADY_ACCEPTED") {
        toast.error(data.message || "This call has already been accepted from another device.");
      } else {
        toast.error(data.message || "Failed to accept call");
      }
      
      setIncomingCall(null);
      setIsAccepting(false);
    };

    const handleCallAcceptSuccess = (data) => {
      console.log("Call accepted successfully:", data);
      
      // Only set active call when server confirms success
      if (incomingCall) {
        setActiveCall({
          roomId: incomingCall.roomId,
          agoraToken: incomingCall.agoraToken,
          isUserSide: false,
          callType: incomingCall.callType,
          callerName: incomingCall.callerName,
          userId: incomingCall.userId,
          astrologerId: incomingCall.astrologerId,
          chatRoomId: incomingCall.chatRoomId,
          kundliId: incomingCall.kundliId,
          userID: incomingCall.userID
        });
        
        setIncomingCall(null);
        setIsAccepting(false);
      }
    };

    voiceSocket.on("error", handleCallAcceptError);
    voiceSocket.on("call:accepted", handleCallAcceptSuccess);

    return () => {
      voiceSocket.off("error", handleCallAcceptError);
      voiceSocket.off("call:accepted", handleCallAcceptSuccess);
    };
  }, [setIncomingCall, incomingCall, setActiveCall]);

  if (!incomingCall) return null;

  const acceptCall = () => {
    if (isAccepting) return;
    setIsAccepting(true);

    try {
      // Check if upgrading from audio to video
      const isUpgrading = activeCall && 
                          activeCall.callType === "audio" && 
                          incomingCall.callType === "video" &&
                          sharedAgoraState.client;

      if (isUpgrading) {
        // Log the state after setting
        setTimeout(() => {
          console.log("🔄 Shared state after setting isUpgrading:", {
            isUpgrading: sharedAgoraState.isUpgrading,
            hasClient: !!sharedAgoraState.client,
            hasMicTrack: !!sharedAgoraState.micTrack
          });
        }, 100);
      }

      voiceSocket.emit("call:accept", {
        roomId: incomingCall.roomId,
        token: incomingCall.agoraToken,
        channelName: incomingCall.roomId,
        acceptedBy: "ASTROLOGER"
      });

    } catch (error) {
      console.error("Error accepting call:", error);
      toast.error(error?.message || "Failed to accept call");
      setIsAccepting(false);
    }
  };

  const rejectCall = () => {
    // Check if this is a video upgrade request during an ongoing audio call
    const isUpgradeRequest = activeCall && 
                             activeCall.callType === "audio" && 
                             incomingCall.callType === "video" &&
                             activeCall.roomId === incomingCall.roomId;

    if (isUpgradeRequest) {
      console.log("🚫 Rejecting video upgrade request - keeping audio call active");
      
      // Set BOTH ref and state for immediate + reactive protection
      upgradeRejectionRef.current = true;
      setIsUpgradeRejectionProtected(true);
      console.log("🛡️ Upgrade rejection protection ENABLED (ref + state)", {
        refValue: upgradeRejectionRef.current,
        timestamp: new Date().toISOString()
      });
      
      // Clear protection after 5 seconds
      setTimeout(() => {
        upgradeRejectionRef.current = false;
        setIsUpgradeRejectionProtected(false);
        console.log("🛡️ Upgrade rejection protection DISABLED");
      }, 5000);
      
      // Emit regular reject - server will respond with call:rejected
      console.log("📤 Emitting call:reject for upgrade rejection");
      voiceSocket.emit("call:reject", {
        roomId: incomingCall.roomId,
        rejectedBy: "ASTROLOGER"
      });
    } else {
      console.log("🚫 Rejecting new incoming call");
      // Regular call rejection - no protection needed
      voiceSocket.emit("call:reject", {
        roomId: incomingCall.roomId,
        rejectedBy: "ASTROLOGER"
      });
    }
    
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
              {activeCall && activeCall.callType === "audio" && incomingCall.callType === "video" 
                ? "Switch to Video Call?" 
                : `Incoming ${incomingCall.callType === "video" ? "Video" : "Audio"} Call`}
            </h3>
            <p className="text-sm text-zinc-400">
              {activeCall && activeCall.callType === "audio" && incomingCall.callType === "video"
                ? `${incomingCall.callerName || "Caller"} wants to switch to video`
                : `${incomingCall.callerName || "Someone"} is calling you…`}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-5 flex gap-4">
          <button
            onClick={rejectCall}
            className="flex-1 rounded-xl bg-red-600 py-3 text-white font-semibold hover:bg-red-700 active:scale-95 transition"
          >
            {activeCall && activeCall.callType === "audio" && incomingCall.callType === "video" 
              ? "Keep Audio Only" 
              : "Reject"}
          </button>

          <button
            onClick={acceptCall}
            disabled={isAccepting}
            className={`flex-1 rounded-xl py-3 text-white font-semibold transition ${
              isAccepting 
                ? "bg-green-600/50 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700 active:scale-95"
            }`}
          >
            {isAccepting ? "Accepting..." : activeCall && activeCall.callType === "audio" && incomingCall.callType === "video" ? "Switch to Video" : "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
