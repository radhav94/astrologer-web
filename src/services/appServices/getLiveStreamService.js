// import { privateGet } from "../api/privateRequest";

import { privateGet, privatePost } from "./privateRequest";

export const getAgoraToken = () => {
  return privatePost("users/live/token");
};

export const getLiveUsers = () => {
  return privateGet("users/live-users");
};
