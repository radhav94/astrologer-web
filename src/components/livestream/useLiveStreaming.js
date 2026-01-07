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

const APP_ID = "5630460abdc141e3b2f8d9597752bd7d";
export const useLiveStreaming = (client, ROLE) => {
  const [calling, setCalling] = useState(true);
    const [token, setToken] = useState(null);
  const [channelName, setChannelName] = useState(null);
      const [uid, setUid] = useState(null);


  const isConnected = useIsConnected();
  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);

  useEffect(() => {
    if (client) {
      client.setClientRole(ROLE);
      console.log("🔹 ROLE set on client =>", ROLE);
    }
  }, [client, ROLE]);


  const AGORA_ROLE =
  ROLE === "host" ? "publisher" : "subscriber";


  useEffect(() => {
      const fetchAgoraToken = async () => {
        try {
          const res = await getAgoraToken();
          setToken(res.data?.data?.token);
          setChannelName(res.data?.data?.channel);
          setUid(res.data?.data?.uid);
        } catch (err) {
          console.error("Agora token fetch failed", err);
        }
      };
      fetchAgoraToken();
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
    channelName
  };
};
