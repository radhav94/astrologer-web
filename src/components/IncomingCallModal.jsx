import { useCall } from "../context/CallContext";
import { voiceSocket } from "../services/appServices/voiceSocketServices";
import toast from "./toast";
import { useEffect, useState, useRef } from "react";

const IncomingCallModal = () => {
  const { incomingCall, setIncomingCall, setActiveCall, activeCall, sharedAgoraState, setSharedAgoraState, setIsUpgradeRejectionProtected, upgradeRejectionRef, isUpgradingRef } = useCall();
  const [isAccepting, setIsAccepting] = useState(false);
  const pendingUpgradeRef = useRef(false); // Track if we're waiting for an upgrade accept

  // Listen for call accept errors from server
  useEffect(() => {
    const handleCallAcceptError = (data) => {
      // Only handle errors that have a roomId matching our incomingCall
      // This prevents cross-contamination with chat errors on the same socket
      if (!data.roomId || (incomingCall && data.roomId !== incomingCall.roomId)) {
        return; // Not our error — ignore
      }

      console.error("Call accept error:", data);

      // 🔑 ALREADY_ACCEPTED during an upgrade means the call exists and is active.
      // The backend rejects call:accept because the audio call was already accepted.
      // For upgrades, this is expected — proceed with the switch directly.
      if (data.code === "ALREADY_ACCEPTED" && pendingUpgradeRef.current) {
        console.log("📹 ALREADY_ACCEPTED during upgrade — proceeding with video switch");
        pendingUpgradeRef.current = false;

        if (incomingCall) {
          setActiveCall({
            ...activeCall,
            callType: "video",
            agoraToken: incomingCall.agoraToken || activeCall.agoraToken,
          });
          setIncomingCall(null);
          setIsAccepting(false);
        }
        return;
      }

      if (data.code === "ALREADY_ACCEPTED") {
        toast.error(data.message || "This call has already been accepted from another device.");
      } else {
        toast.error(data.message || "Failed to accept call");
      }
      
      // Reset upgrade state if it was set
      if (pendingUpgradeRef.current) {
        pendingUpgradeRef.current = false;
        isUpgradingRef.current = false;
        setSharedAgoraState(prev => ({ ...prev, isUpgrading: false }));
      }

      setIncomingCall(null);
      setIsAccepting(false);
    };

    const handleCallAcceptSuccess = (data) => {
      console.log("Call accepted successfully:", data);
      pendingUpgradeRef.current = false;
      
      // Only set active call when server confirms success
      if (incomingCall) {
        // Check if this is a switch/downgrade scenario
        // Detect switch from our own state - don't rely solely on backend's isSwitch flag
        const isSameRoom = activeCall && activeCall.roomId === incomingCall.roomId;
        const isSwitch = data?.isSwitch || 
                         (isSameRoom && activeCall.callType !== incomingCall.callType);
        const isDowngrading = activeCall && 
                              activeCall.callType === "video" && 
                              incomingCall.callType === "audio" &&
                              isSwitch;

        const isUpgrading = activeCall && 
                            activeCall.callType === "audio" && 
                            incomingCall.callType === "video" &&
                            isSwitch;

        // If switching, update the existing activeCall to preserve all data
        if (isSwitch && activeCall) {
          console.log(`🔄 Switching call type from ${activeCall.callType} to ${incomingCall.callType}`);
          
          setActiveCall({
            ...activeCall, // Preserve existing call data
            callType: incomingCall.callType, // Update only the call type
            agoraToken: data.agoraToken || incomingCall.agoraToken || activeCall.agoraToken // Update token if provided
          });
        } else {
          // New call - set all data from incomingCall
          setActiveCall({
            roomId: incomingCall.roomId,
            agoraToken: data.agoraToken || incomingCall.agoraToken,
            isUserSide: false,
            callType: data.type || incomingCall.callType,
            callerName: incomingCall.callerName,
            userId: incomingCall.userId,
            astrologerId: incomingCall.astrologerId,
            chatRoomId: incomingCall.chatRoomId,
            kundliId: incomingCall.kundliId,
            userID: incomingCall.userID
          });
        }
        
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
  }, [setIncomingCall, incomingCall, setActiveCall, activeCall]);

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

      // Check if downgrading from video to audio
      const isDowngrading = activeCall && 
                            activeCall.callType === "video" && 
                            incomingCall.callType === "audio" &&
                            sharedAgoraState.client;

      if (isUpgrading) {
        // 🔑 Set ref SYNCHRONOUSLY so VoiceCall cleanup can read it immediately
        isUpgradingRef.current = true;
        pendingUpgradeRef.current = true;
        
        console.log("🔄 Setting isUpgrading flag");
        setSharedAgoraState(prev => ({ 
          ...prev, 
          isUpgrading: true 
        }));
        
        console.log("🔄 Upgrade initiated — isUpgradingRef:", isUpgradingRef.current);
        console.log("🔄 Upgrading from audio to video");
      } else if (isDowngrading) {
        console.log("🔽 Setting isDowngrading flag");
        setSharedAgoraState(prev => ({ 
          ...prev, 
          isDowngrading: true 
        }));
        
        console.log("🔽 Downgrading from video to audio");
      }

      voiceSocket.emit("call:accept", {
        roomId: incomingCall.roomId,
        token: incomingCall.agoraToken,
        channelName: incomingCall.roomId,
        acceptedBy: "ASTROLOGER",
        callType: incomingCall.callType // Tell backend this is a video upgrade
      });

    } catch (error) {
      console.error("Error accepting call:", error);
      toast.error(error?.message || "Failed to accept call");
      pendingUpgradeRef.current = false;
      setIsAccepting(false);
    }
  };

  const rejectCall = () => {
    // Check if this is a video upgrade request during an ongoing audio call
    const isUpgradeRequest = activeCall && 
                             activeCall.callType === "audio" && 
                             incomingCall.callType === "video" &&
                             activeCall.roomId === incomingCall.roomId;

    // Check if this is an audio downgrade request during an ongoing video call
    const isDowngradeRequest = activeCall && 
                               activeCall.callType === "video" && 
                               incomingCall.callType === "audio" &&
                               activeCall.roomId === incomingCall.roomId;

    if (isUpgradeRequest) {
      console.log("🚫 Rejecting video upgrade request - keeping audio call active");
      
      // Set BOTH ref and state for immediate + reactive protection
      upgradeRejectionRef.current = true;
      setIsUpgradeRejectionProtected(true);
      console.log("🛡️ Upgrade rejection protection ENABLED (ref + state)");
      
      // Clear protection after 5 seconds
      setTimeout(() => {
        upgradeRejectionRef.current = false;
        setIsUpgradeRejectionProtected(false);
        console.log("🛡️ Upgrade rejection protection DISABLED");
      }, 5000);
      
      voiceSocket.emit("call:reject", {
        roomId: incomingCall.roomId,
        rejectedBy: "ASTROLOGER"
      });
    } else if (isDowngradeRequest) {
      console.log("🚫 Rejecting audio downgrade request - keeping video call active");
      
      // Set protection for downgrade rejection
      upgradeRejectionRef.current = true;
      setIsUpgradeRejectionProtected(true);
      console.log("🛡️ Downgrade rejection protection ENABLED");
      
      // Clear protection after 5 seconds
      setTimeout(() => {
        upgradeRejectionRef.current = false;
        setIsUpgradeRejectionProtected(false);
        console.log("🛡️ Downgrade rejection protection DISABLED");
      }, 5000);
      
      voiceSocket.emit("call:reject", {
        roomId: incomingCall.roomId,
        rejectedBy: "ASTROLOGER"
      });
    } else {
      console.log("🚫 Rejecting new incoming call");
      voiceSocket.emit("call:reject", {
        roomId: incomingCall.roomId,
        rejectedBy: "ASTROLOGER"
      });
    }
    
    setIncomingCall(null);
  };

  return (
    <div className="fixed inset-0 z-[100001] flex items-end justify-center pointer-events-none">
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
                : activeCall && activeCall.callType === "video" && incomingCall.callType === "audio"
                ? "Switch to Audio Call?"
                : `Incoming ${incomingCall.callType === "video" ? "Video" : "Audio"} Call`}
            </h3>
            <p className="text-sm text-zinc-400">
              {activeCall && activeCall.callType === "audio" && incomingCall.callType === "video"
                ? `${incomingCall.callerName || "Caller"} wants to switch to video`
                : activeCall && activeCall.callType === "video" && incomingCall.callType === "audio"
                ? `${incomingCall.callerName || "Caller"} wants to switch to audio only`
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
              : activeCall && activeCall.callType === "video" && incomingCall.callType === "audio"
              ? "Keep Video"
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
            {isAccepting 
              ? "Accepting..." 
              : activeCall && activeCall.callType === "audio" && incomingCall.callType === "video" 
              ? "Switch to Video"
              : activeCall && activeCall.callType === "video" && incomingCall.callType === "audio"
              ? "Switch to Audio"
              : "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
