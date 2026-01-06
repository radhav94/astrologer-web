// import { privateGet } from "../api/privateRequest";

import {  privatePost } from "./privateRequest";

export const getAgoraToken = () => {
  return privatePost("users/live/token");
};
