import React from "react";
import { Icons } from "../../../../components/Icons";
import { Link } from "react-router";
// import { Toast } from "../../../../components/Dashboard"; // adjust import if needed
import { useCall } from "../../../../context/CallContext";
import { voiceSocket } from "../../../../services/appServices/voiceSocketServices";
import toast from "../../../../components/toast";
import { useChat } from "../../../../context/chatContext";
import { Toast } from "../../../../components";

const SessionDetails = () => {
  const { waitingList, setWaitingList, activeCall, setActiveCall } = useCall();
  const { activeChat, setActiveChat } = useChat();

  // const astroIdLocal = localStorage.getItem("shubhtalk_astro_id");

  // ✅ ACCEPT CALL (same logic as old CallHistoryTab)
  const handleAccept = async (call) => {
    if (!call?.roomId || !call?.agoraToken) return;

    if (activeCall || activeChat) {
      toast.error("Please cancel the previous call/chat");
      return;
    }

    // reset just in case
    setActiveCall(null);

    await new Promise((res) => setTimeout(res, 0));

    voiceSocket.emit("waiting:accept", {
      roomId: call.roomId,
    });

    // remove from waiting list
    setWaitingList((prev) =>
      prev.filter((item) => item.roomId !== call.roomId)
    );

    await new Promise((res) => setTimeout(res, 50));

    // start call
    setActiveCall({
      roomId: call.roomId,
      agoraToken: call.agoraToken,
      callerName: call.callerName,
      isUserSide: false,
      callType: call.type || "audio",
      userId: call.userId || call.callerId,
      astrologerId: call.astrologerId || astroIdLocal,
      chatRoomId: call.chatRoomId || call.roomId,
      kundliId: call.kundliId,
    });
  };

    // ✅ ACCEPT CALL (same logic as old CallHistoryTab)
  const handleAcceptChat = async (chat) => {
    if (!chat?.roomId) return;

    if (activeCall || activeChat) {
      toast.error("Please cancel the previous call/Chat");
      return;
    }

    // reset just in case
    setActiveChat(null);

    await new Promise((res) => setTimeout(res, 0));

    voiceSocket.emit("waiting:accept", {
      roomId: chat.roomId,
    });

    // remove from waiting list
    setWaitingList((prev) =>
      prev.filter((item) => item.roomId !== chat.roomId)
    );

    Toast.success("Wait for customer to accept");
  };

  // ❌ REJECT CALL
  const handleReject = (call) => {
    if (!call?.roomId) return;

    // voiceSocket.emit("reject_call", {
    //   roomId: call.roomId,
    // });
    voiceSocket.emit("call:reject", {
      roomId: call.roomId,
      rejectedBy: "ASTROLOGER"
    });

    setWaitingList((prev) =>
      prev.filter((item) => item.roomId !== call.roomId)
    );
  };

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

  console.log("callll",waitingList)

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 md:px-4 mb-6">
        <div className="flex justify-start items-center md:gap-4">
          <Link to="/dashboard">
            <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              <Icons.ChevronLeft size={20} className="text-gray-700" />
            </button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Upcoming Sessions</h1>
        </div>

        <p className="text-red-500">{waitingList.length} in Queue</p>
      </div>

      {/* LIST */}
      <div className="space-y-6 pb-24">
        {waitingList.length === 0 ? (
          <p className="text-gray-500 text-center">No waiting sessions</p>
        ) : (
          <div className="space-y-3">
            {waitingList.map((call) => (
              <div
                key={call._id}
                className="bg-gray-300 rounded-xl p-4 shadow-sm border border-gray-100"
              >
                {/* TOP */}
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold">
                    {call.callerName || call.callerId}
                  </div>

                  <span className="bg-gray-800 text-white text-[10px] font-medium px-3 py-1 rounded-full">
                    {call.type?.toUpperCase() || "AUDIO"}
                  </span>
                </div>

                {/* DETAILS */}
                <div className="text-xs space-y-1">
                  <p>Name: {call?.user?.customer?.firstName}</p>
                  <p>Status: {call.status}</p>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => call.type === "chat" ? handleAcceptChat(call) : handleAccept(call)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => call.type === "chat" ? handleRejectChat(call) : handleReject(call)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionDetails;
