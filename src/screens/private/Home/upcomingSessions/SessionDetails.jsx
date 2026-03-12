import React from "react";
import { Icons } from "../../../../components/Icons";
import { Link } from "react-router";
import { useCall } from "../../../../context/CallContext";
import { voiceSocket } from "../../../../services/appServices/voiceSocketServices";
import toast from "../../../../components/toast";
import { useChat } from "../../../../context/chatContext";
import { Toast } from "../../../../components";
import SessionCard from "../../../../components/SessionCard";

const SessionDetails = () => {
  const { waitingList, setWaitingList, activeCall, setActiveCall } = useCall();
  const { activeChat, setActiveChat } = useChat();

  // Format time to display
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get user profile image
  const getUserImage = (call) => {
    return call?.user?.customer?.profileImgUrl || 
           call?.user?.astro?.profileImgUrl || 
           call?.user?.profileImage || 
           "";
  };

  // Get user name
  const getUserName = (call) => {
    const customer = call?.user?.customer;
    const astro = call?.user?.astro;
    
    if (customer?.firstName) {
      return `${customer.firstName}${customer.lastName ? ' ' + customer.lastName : ''}`;
    }
    
    if (astro?.firstName) {
      return `${astro.firstName}${astro.lastName ? ' ' + astro.lastName : ''}`;
    }
    
    return call?.callerName || call?.callerId || "User";
  };

  // ✅ ACCEPT CALL
  const handleAccept = async (call) => {
    if (!call?.roomId || !call?.agoraToken) return;

    if (activeCall || activeChat) {
      toast.error("Please cancel the previous call/chat");
      return;
    }

    setActiveCall(null);
    await new Promise((res) => setTimeout(res, 0));

    voiceSocket.emit("waiting:accept", {
      roomId: call.roomId,
    });

    setWaitingList((prev) =>
      prev.filter((item) => item.roomId !== call.roomId)
    );

    await new Promise((res) => setTimeout(res, 50));

    setActiveCall({
      roomId: call.roomId,
      agoraToken: call.agoraToken,
      callerName: call.callerName,
      isUserSide: false,
      callType: call.type || "audio",
      userId: call.userId || call.callerId,
      astrologerId: call.astrologerId,
      chatRoomId: call.chatRoomId || call.roomId,
      kundliId: call.kundliId,
    });
  };

  // ✅ ACCEPT CHAT
  const handleAcceptChat = async (chat) => {
    if (!chat?.roomId) return;

    if (activeCall || activeChat) {
      toast.error("Please cancel the previous call/chat");
      return;
    }

    setActiveChat(null);
    await new Promise((res) => setTimeout(res, 0));

    voiceSocket.emit("waiting:accept", {
      roomId: chat.roomId,
    });

    setWaitingList((prev) =>
      prev.filter((item) => item.roomId !== chat.roomId)
    );

    Toast.success("Wait for customer to accept");
  };

  // ❌ REJECT CALL
  const handleReject = (call) => {
    if (!call?.roomId) return;

    voiceSocket.emit("call:reject", {
      roomId: call.roomId,
      rejectedBy: "ASTROLOGER"
    });

    setWaitingList((prev) =>
      prev.filter((item) => item.roomId !== call.roomId)
    );
  };

  // ❌ REJECT CHAT
  const handleRejectChat = (chat) => {
    if (!chat?.roomId) return;

    voiceSocket.emit("chat:reject", {
      roomId: chat.roomId,
      rejectedBy: "ASTROLOGER"
    });

    setWaitingList((prev) =>
      prev.filter((item) => item.roomId !== chat.roomId)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white min-h-screen md:min-h-0 md:my-8 md:rounded-2xl md:shadow-sm">
        <div className="px-5 py-6 md:px-8 md:py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <button className="p-2 bg-[#FFF5EC] border border-[#FFE8C5] rounded-xl hover:bg-[#FFEDD5] transition-colors">
                  <Icons.ChevronLeft size={20} className="text-[#F75801]" />
                </button>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Upcoming Sessions</h1>
            </div>

            <span className="text-[#F75801] font-semibold text-sm">
              {waitingList?.length} in Queue
            </span>
          </div>

          {/* Session List */}
          <div className="space-y-4">
            {waitingList.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No upcoming sessions at the moment
              </div>
            ) : (
              waitingList.map((call) => (
                <SessionCard
                  key={call._id}
                  name={getUserName(call)}
                  profileImage={getUserImage(call)}
                  duration="10 minutes"
                  time={call.createdAt ? formatTime(call.createdAt) : "4:36 PM"}
                  sessionType={call.type || "Call"}
                  onDecline={() => call.type === "chat" ? handleRejectChat(call) : handleReject(call)}
                  onStart={() => call.type === "chat" ? handleAcceptChat(call) : handleAccept(call)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetails;
