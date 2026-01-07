import privateRequest from "./privateRequest";
import publicRequest from "./publicRequest";

export const loginWithPhone = async (data) => {
  return await publicRequest.post("astrologers/loginAstrologer", data);
};

export const verifyOtp = async (data) => {
  return await publicRequest.post("astrologers/verifyOtp", data);
};

export const logout = async (data) => {
  return await publicRequest.post("users/verifyOtp", data);
};

export const registerUser = async (data) => {
  return await privateRequest.post("astrologers/registerAstrologer", data);
};

export const updateAstrologerStatus = async (status) => {
  try {
    return await privateRequest.patch(
      "astrologers/updateStatus",
      { status : status === "online", activeType : status === "online" ? ['chat', 'video', 'audio'] : [] }
    );
  } catch (error) {
    console.error(
      "Update status failed:",
      error?.response?.data || error.message
    );
  }    
};

export const totalEarning = async () => {
  try {
    const response = await privateRequest.get("transactions/getTotalEarning");
    return response;
  } catch (error) {

    return {
      data: {
        success: false,
        message: "Status update failed",
      },
    };
  }
};

export const getAstrologerById = async (id) => {
  try {
    return await privateRequest.get(
      `astrologers/astrologer?astrologerId=${id}`
    );
  } catch (error) {
    console.error("Fetch astrologer failed:", error?.response?.status);
    return {
      data: {
        success: false,
        data: [],
        message: "Total earning API failed",
      },
    };
  }
};


// 🔴 Stop Live Streaming (Host End Live)
export const stopLiveStream = async (channel) => {
  try {
    return await privateRequest.post("users/live/stop", {
      channel,
    });
  } catch (error) {
    console.error(
      "Stop live stream failed:",
      error?.response?.data || error.message
    );
    return {
      data: {
        success: false,
        message: "Failed to stop live stream",
      },
    };
  }
};
