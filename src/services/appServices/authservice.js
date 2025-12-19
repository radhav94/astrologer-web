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

export const totalEarning = async () => {
  try {
    const response = await privateRequest.get("transactions/getTotalEarning");
    return response;
  } catch (error) {

    return {
      data: {
        success: false,
        data: [],
        message: "Total earning API failed",
      },
    };
  }
};