// src/components/LiveStreaming/useLiveStreaming.js
import { useEffect, useState, useRef } from "react";
import {
  useJoin,
  usePublish,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  useIsConnected,
  useRemoteUsers,
} from "agora-rtc-react";
import { getAgoraToken } from "../../services/appServices/getLiveStreamService";
import { useCall } from "../../context/CallContext";

const APP_ID = "cf5e31fa03584573aacaf42daebd493c";
const SESSION_KEY = "shubhtalk_live_session";

export const useLiveStreaming = (client, ROLE, previewSettings = {}) => {
  const [calling, setCalling] = useState(true);
  const [token, setToken] = useState(null);
  const [channelName, setChannelName] = useState(null);
  const [uid, setUid] = useState(null);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [isReconnect, setIsReconnect] = useState(false);

  const isConnected = useIsConnected();
  const [micOn, setMic] = useState(previewSettings.micOn ?? true);
  const [cameraOn, setCamera] = useState(previewSettings.cameraOn ?? true);

  // Track whether mic was muted by an active call (not by the host manually)
  const micMutedByCallRef = useRef(false);
  const [isMicMutedByCall, setIsMicMutedByCall] = useState(false);

  const { activeCall } = useCall();

  useEffect(() => {
    if (client) {
      client.setClientRole(ROLE);
      console.log("🔹 ROLE set on client =>", ROLE);
    }
  }, [client, ROLE]);

  const AGORA_ROLE = ROLE === "host" ? "publisher" : "subscriber";

  useEffect(() => {
    const fetchOrRestoreSession = async () => {
      // Check sessionStorage for an existing live session
      try {
        const saved = sessionStorage.getItem(SESSION_KEY);
        if (saved) {
          const session = JSON.parse(saved);
          if (session.token && session.channel && session.uid) {
            console.log("🔄 Restoring live session from sessionStorage:", session.channel);
            setToken(session.token);
            setChannelName(session.channel);
            setUid(session.uid);
            setChatRoomId(session.chatRoomId || null);
            setIsReconnect(true);
            return;
          }
        }
      } catch (e) {
        console.warn("Failed to parse saved live session", e);
      }

      // No saved session — fetch a fresh token (new room)
      try {
        const res = await getAgoraToken();
        console.log("🔹 Agora token response:", JSON.stringify(res.data?.data));
        const data = res.data?.data;
        setToken(data?.token);
        setChannelName(data?.channel);
        setUid(data?.uid);
        setChatRoomId(data?.chatRoomId || null);
        setIsReconnect(false);

        // Persist to sessionStorage so refreshes reconnect
        sessionStorage.setItem(
          SESSION_KEY,
          JSON.stringify({
            token: data?.token,
            channel: data?.channel,
            uid: data?.uid,
            chatRoomId: data?.chatRoomId || null,
          })
        );
      } catch (err) {
        console.error("Agora token fetch failed", err);
      }
    };
    fetchOrRestoreSession();
  }, []);

  const canJoin = Boolean(token && channelName && calling);

   useJoin(
      {
        appid: APP_ID,
        channel: channelName ?? "",
        token: token ?? null,
        uid: uid ?? null,
        role: AGORA_ROLE,
      },
      canJoin
    );
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(
    micOn && ROLE === "host"
  );
  const { localCameraTrack } = useLocalCameraTrack(
    cameraOn && ROLE === "host"
  );
  const remoteUsers = useRemoteUsers();

  const shouldPublish =
    isConnected && ROLE === "host" && localCameraTrack && localMicrophoneTrack;

  usePublish(
    shouldPublish ? [localMicrophoneTrack, localCameraTrack] : []
  );

  /* ================= MUTE LIVE MIC DURING ACTIVE CALL ================= */
  // When astrologer accepts a call while live, mute the live stream mic
  // so audience can still see video but can't hear the private conversation.
  // We use track.setEnabled(false) instead of setMic(false) to keep the track
  // alive and published — only the audio is silenced. This avoids affecting
  // the camera track or the usePublish hook.
  useEffect(() => {
    if (ROLE !== "host") return;
    if (!localMicrophoneTrack) return;

    if (activeCall) {
      if (!micMutedByCallRef.current) {
        micMutedByCallRef.current = true;
        setIsMicMutedByCall(true);
        localMicrophoneTrack.setEnabled(false);
        console.log("[LiveStream] 🔇 Muting live mic track — private call active");
      }
    } else {
      if (micMutedByCallRef.current) {
        micMutedByCallRef.current = false;
        setIsMicMutedByCall(false);
        // Only re-enable if the host had mic on before the call
        if (micOn) {
          localMicrophoneTrack.setEnabled(true);
        }
        console.log("[LiveStream] 🔊 Restoring live mic track — call ended");
      }
    }
  }, [activeCall, ROLE, localMicrophoneTrack, micOn]);

  // Wrap setMic so host can't manually unmute live stream during an active call
  const safeMicToggle = (value) => {
    if (micMutedByCallRef.current) {
      console.log("[LiveStream] ⚠️ Cannot unmute live mic — private call in progress");
      return;
    }
    setMic(value);
  };

  const clearLiveSession = () => {
    sessionStorage.removeItem(SESSION_KEY);
  };

  return {
    calling,
    setCalling,
    isConnected,
    micOn,
    setMic: safeMicToggle,
    cameraOn,
    setCamera,
    localMicrophoneTrack,
    localCameraTrack,
    remoteUsers,
    channelName,
    chatRoomId,
    isReconnect,
    clearLiveSession,
    isMicMutedByCall,
  };
};
