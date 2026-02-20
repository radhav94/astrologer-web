export const combineClasses = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export const requiredMessage = (name = "This field") => {
  return `${name} is required!`;
};

export const getToken = () => {
  return localStorage.getItem("shubhtalk_astro_token");
};


export const formatIndianPhone = (phone) => {
  if (!phone) return '';
  
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle phone with country code (12 digits: 91 + 10 digits)
  if (digits.length === 12 && digits.startsWith('91')) {
    const countryCode = digits.slice(0, 2);
    const firstPart = digits.slice(2, 7);
    const secondPart = digits.slice(7, 12);
    return `+${countryCode} ${firstPart} ${secondPart}`;
  }
  
  // Handle phone without country code (10 digits)
  if (digits.length === 10) {
    const firstPart = digits.slice(0, 5);
    const secondPart = digits.slice(5, 10);
    return `+91 ${firstPart} ${secondPart}`;
  }
  
  // Return original if format doesn't match
  return phone;
};

