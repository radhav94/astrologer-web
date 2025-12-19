export const saveUserToStorage = (user) => {
    if (!user) return;
  
    const filteredUser = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      place: user.place,
      role: user.role,
      languagePreferences: user.languagePreferences || [],
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      isActive: user.isActive
    };
  
    localStorage.setItem("shubhtalk_astrologer_details", JSON.stringify(filteredUser));
  };
  
  export const getUserFromStorage = () => {
    try {
      return JSON.parse(localStorage.getItem("shubhtalk_astrologer_details"));
    } catch {
      return null;
    }
  };

  export const getToken = () => {
    return localStorage.getItem("accessToken"); // or cookie
  };
  
  export const isAuthenticated = () => {
    return !!getToken();
  };