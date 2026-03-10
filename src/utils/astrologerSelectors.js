import dayjs from "dayjs";

// Transform API response to UI-friendly format
export const selectAstrologerProfile = (apiData) => {
  if (!apiData?.data) return null;
  
  const astrologer = apiData.data;

  console.log("Seprate Date:",apiData,astrologer)
  
  // Transform education array to normalize field names
  const normalizedEducation = (astrologer.education || astrologer.qualifications || []).map(edu => ({
    qualification: edu.qualification || edu.levelOfEducation || '',
    universityName: edu.universityName || '',
    certificateImgUrl: edu.certificateImgUrl || '',
    display: edu.display || false,
  }));
  
  return {
    id: astrologer._id || astrologer.id,
    firstName: astrologer.firstName || '',
    lastName: astrologer.lastName || '',
    name: `${astrologer.firstName || ''} ${astrologer.lastName || ''}`.trim() || 'Unknown',
    email: astrologer.email || '',
    phone: astrologer.phoneNumber || astrologer.contactNumber || astrologer.phone || '',
    dateOfBirth: astrologer.dob || astrologer.dateOfBirth || '',
    gender: astrologer.gender || '',
    profileImage: astrologer.profilePicture || astrologer.avatar || astrologer.imageUrl || '',
    experience: astrologer.experience || astrologer.experienceYears || 0,
    wallet: astrologer.wallet || astrologer.balance || 0,
    languages: astrologer?.languagePreferences || [],
    specializations: astrologer.specializations || astrologer.specialties || [],
    education: normalizedEducation,
    achievements: astrologer.achievements || [],
    achievementImages: astrologer.achievementImages || [],
  };
};

// Selector for header/basic display info
export const selectBasicInfo = (apiData) => {
  const profile = selectAstrologerProfile(apiData);
  if (!profile) return null;
  
  return {
    name: profile.name,
    experience: profile.experience,
    wallet: profile.wallet,
  };
};

// Selector for ProfileTab component
export const selectProfileTabData = (apiData) => {
  const profile = selectAstrologerProfile(apiData);
  if (!profile) return null;

  // console.log("profile:",profile,apiData)
  
  return {
    name: profile.name,
    dateOfBirth: dayjs(profile.dateOfBirth).format("DD MMM YYYY") || 'N/A',
    gender: profile.gender,
    phone: profile.phone,
    email: profile.email,
    profileImage: profile.profileImage,
    languages: profile.languages,
    specializations: profile.specializations,
    education: profile.education,
    achievements: profile.achievements,
    achievementImages: profile.achievementImages,
  };
};

// Selector for contact information
export const selectContactInfo = (apiData) => {
  const profile = selectAstrologerProfile(apiData);
  if (!profile) return null;
  
  return {
    phone: profile.phone,
    email: profile.email,
  };
};
