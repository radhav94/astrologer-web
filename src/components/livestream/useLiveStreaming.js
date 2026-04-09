// src/components/LiveStreaming/useLiveStreaming.js
import { useEffect, useState, useRef, useCallback } from "react";
import {
  useJoin,
  usePublish,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  useIsConnected,
  useRemoteUsers,
} from "agora-rtc-react";
import { getAgoraToken, refreshAgoraToken } from "../../services/appServices/getLiveStreamService";
import { useCall } from "../../context/CallContext";
import { useLiveStream } from "../../context/LiveStreamContext";

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;
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
  const { endLiveSession } = useLiveStream();
  const hasTriedRefreshRef = useRef(false);
  const hasInitRef = useRef(false);

  // Fetch a fresh Agora token (used on first load only)
  const fetchFreshToken = useCallback(async () => {
    try {
      const res = await getAgoraToken();
      const data = res.data?.data;
      setToken(data?.token);
      setChannelName(data?.channel);
      setUid(data?.uid);
      setChatRoomId(data?.chatRoomId || null);
      setIsReconnect(false);

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
      sessionStorage.removeItem(SESSION_KEY);
      endLiveSession();
    }
  }, [endLiveSession]);

  useEffect(() => {
    if (client) {
      client.setClientRole(ROLE);
      console.log("🔹 ROLE set on client =>", ROLE);
    }
  }, [client, ROLE]);

  const AGORA_ROLE = ROLE === "host" ? "publisher" : "subscriber";

  useEffect(() => {
    if (hasInitRef.current) return;
    hasInitRef.current = true;

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
      await fetchFreshToken();
    };
    fetchOrRestoreSession();
  }, [fetchFreshToken]);

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

  // Handle Agora join failures (e.g. expired token from a restored session).
  // CONNECTING → DISCONNECTED means the join itself failed.
  // Also handle token renewal before expiry to keep the stream alive.
  useEffect(() => {
    if (!client) return;

    const handleStateChange = (curState, prevState) => {
      if (prevState === "CONNECTING" && curState === "DISCONNECTED") {
        console.warn("[useLiveStreaming] Agora join failed (CONNECTING → DISCONNECTED)");
        if (!hasTriedRefreshRef.current) {
          hasTriedRefreshRef.current = true;
          // Try refreshing the token for the same channel first.
          // Only fall back to a brand-new room if there's no channel to refresh.
          const currentChannel = channelName;
          const currentUid = uid;
          if (currentChannel) {
            console.log("[useLiveStreaming] Refreshing token for existing channel:", currentChannel);
            refreshAgoraToken(currentChannel, currentUid)
              .then((res) => {
                const data = res.data?.data;
                const newToken = data?.token;
                if (newToken) {
                  setToken(newToken);
                  try {
                    const saved = sessionStorage.getItem(SESSION_KEY);
                    if (saved) {
                      const session = JSON.parse(saved);
                      session.token = newToken;
                      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
                    }
                  } catch (_) {}
                  console.log("[useLiveStreaming] ✅ Token refreshed — will retry join");
                } else {
                  console.error("[useLiveStreaming] No token in refresh response — creating new room");
                  sessionStorage.removeItem(SESSION_KEY);
                  fetchFreshToken();
                }
              })
              .catch(() => {
                console.error("[useLiveStreaming] Refresh failed — creating new room");
                sessionStorage.removeItem(SESSION_KEY);
                fetchFreshToken();
              });
          } else {
            console.log("[useLiveStreaming] No existing channel — fetching fresh token");
            sessionStorage.removeItem(SESSION_KEY);
            fetchFreshToken();
          }
        } else {
          console.error("[useLiveStreaming] Retry also failed — ending live session");
          sessionStorage.removeItem(SESSION_KEY);
          endLiveSession();
        }
      }

      if (curState === "CONNECTED") {
        hasTriedRefreshRef.current = false;
      }
    };

    // Renew token for the SAME channel using the dedicated refresh endpoint.
    const renewForChannel = async () => {
      const currentChannel = channelName;
      const currentUid = uid;
      if (!currentChannel) return;

      console.log("[useLiveStreaming] Renewing token for channel:", currentChannel);
      try {
        const res = await refreshAgoraToken(currentChannel, currentUid);
        const data = res.data?.data;
        const newToken = data?.token;
        if (newToken) {
          await client.renewToken(newToken);
          setToken(newToken);
          try {
            const saved = sessionStorage.getItem(SESSION_KEY);
            if (saved) {
              const session = JSON.parse(saved);
              session.token = newToken;
              sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
            }
          } catch (_) {}
          console.log("[useLiveStreaming] ✅ Token renewed successfully");
        }
      } catch (err) {
        console.error("[useLiveStreaming] Token renewal failed:", err);
      }
    };

    // Fires ~30s before expiry — proactive renewal
    const handleTokenWillExpire = () => {
      console.warn("[useLiveStreaming] ⚠️ Token expiring soon");
      renewForChannel();
    };

    // Fires after token has fully expired — same renewal flow.
    // If this also fails, the stream stops silently (matches mobile behavior).
    const handleTokenDidExpire = () => {
      console.warn("[useLiveStreaming] 🔴 Token expired — attempting renewal");
      renewForChannel();
    };

    client.on("connection-state-change", handleStateChange);
    client.on("token-privilege-will-expire", handleTokenWillExpire);
    client.on("token-privilege-did-expire", handleTokenDidExpire);
    return () => {
      client.off("connection-state-change", handleStateChange);
      client.off("token-privilege-will-expire", handleTokenWillExpire);
      client.off("token-privilege-did-expire", handleTokenDidExpire);
    };
  }, [client, channelName, fetchFreshToken, endLiveSession]);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(ROLE === "host");
  const { localCameraTrack } = useLocalCameraTrack(ROLE === "host");
  const remoteUsers = useRemoteUsers();

  // Mute/unmute mic track via setEnabled (don't destroy/recreate)
  useEffect(() => {
    if (localMicrophoneTrack) {
      const shouldBeEnabled = micOn && !micMutedByCallRef.current;
      localMicrophoneTrack.setEnabled(shouldBeEnabled);
    }
  }, [micOn, localMicrophoneTrack]);

  // Mute/unmute camera track via setEnabled
  useEffect(() => {
    if (localCameraTrack) {
      localCameraTrack.setEnabled(cameraOn);
    }
  }, [cameraOn, localCameraTrack]);

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
