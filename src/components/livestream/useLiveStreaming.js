// src/components/LiveStreaming/useLiveStreaming.js
import { useEffect, useState } from "react";
import {
  useJoin,
  usePublish,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  useIsConnected,
  useRemoteUsers,
} from "agora-rtc-react";
import { getAgoraToken } from "../../services/appServices/getLiveStreamService";

const APP_ID = "c76e3d30a3b6483689dac88ca9f94381";
const SESSION_KEY = "shubhtalk_live_session";

export const useLiveStreaming = (client, ROLE) => {
  const [calling, setCalling] = useState(true);
  const [token, setToken] = useState(null);
  const [channelName, setChannelName] = useState(null);
  const [uid, setUid] = useState(null);
  const [isReconnect, setIsReconnect] = useState(false);

  const isConnected = useIsConnected();
  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);

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
        setIsReconnect(false);

        // Persist to sessionStorage so refreshes reconnect
        sessionStorage.setItem(
          SESSION_KEY,
          JSON.stringify({
            token: data?.token,
            channel: data?.channel,
            uid: data?.uid,
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

  const clearLiveSession = () => {
    sessionStorage.removeItem(SESSION_KEY);
  };

  return {
    calling,
    setCalling,
    isConnected,
    micOn,
    setMic,
    cameraOn,
    setCamera,
    localMicrophoneTrack,
    localCameraTrack,
    remoteUsers,
    channelName,
    isReconnect,
    clearLiveSession,
  };
};
