import privateRequest from "./privateRequest";
import publicRequest from "./publicRequest";

export const loginWithPhone = async (data) => {
  return await publicRequest.post("users/loginUser", data);
};

export const verifyOtp = async (data) => {
  return await publicRequest.post("users/verifyOtp", data);
};

export const logout = async (data) => {
  return await publicRequest.post("users/verifyOtp", data);
};

export const registerUser = async (data) => {
  return await privateRequest.post("users/registerUser", data);
};

export const updateAstrologerStatus = async (status) => {
  try {
    return await privateRequest.patch(
      "astrologers/updateStatus",
      { status }
    );
  } catch (error) {
    console.error(
      "Update status failed:",
      error?.response?.data || error.message
    );

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
      },
    };
  }
};