import { Link, useNavigate } from "react-router-dom";
import { Icons } from "../../../../components/Icons";
import { useState } from "react";
import { useSetAstrologerPriceMutation } from "../../../../redux/astrologer/astrologerApi";
import { Toast } from "../../../../components";
import { ChevronRight } from "lucide-react";

const SetPrice = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(
    localStorage.getItem("shubhtalk_astrologer_details")
  );
  
  // Get current prices with fallbacks
  const currentAudioRate = userData?.price?.audioRate?.amount || userData?.price?.callRate?.amount || 0;
  const currentChatRate = userData?.price?.chatRate?.amount || 0;
  const currentVideoRate = userData?.price?.videoCallRate?.amount || 0;
  
  const [price, setPrice] = useState({
    audioRate: {
      unit: "minute",
      currency: "INR",
      amount: currentAudioRate,
    },
    chatRate: {
      unit: "minute",
      currency: "INR",
      amount: currentChatRate,
    },
    videoCallRate: {
      unit: "minute",
      currency: "INR",
      amount: currentVideoRate,
    },
  });

  const [errors, setErrors] = useState({
    audioRate: "",
    chatRate: "",
    videoCallRate: "",
  });

  const [touched, setTouched] = useState({
    audioRate: false,
    chatRate: false,
    videoCallRate: false,
  });

  const [setAstrologerPrice, { isLoading }] = useSetAstrologerPriceMutation();

  // Validation rules
  const validateAmount = (value, fieldName) => {
    if (value === '' || value === null || value === undefined) {
      return `${fieldName} is required`;
    }
    
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      return `${fieldName} must be a valid number`;
    }
    
    if (numValue < 1) {
      return `${fieldName} must be at least ₹1`;
    }
    
    if (numValue > 10000) {
      return `${fieldName} cannot exceed ₹10,000`;
    }
    
    if (!Number.isInteger(numValue)) {
      return `${fieldName} must be a whole number`;
    }
    
    return "";
  };

  // Validate single field
  const validateField = (type, value) => {
    const fieldNames = {
      audioRate: "Audio call rate",
      chatRate: "Chat rate",
      videoCallRate: "Video call rate",
    };
    
    const error = validateAmount(value, fieldNames[type]);
    setErrors(prev => ({ ...prev, [type]: error }));
    return error === "";
  };

  // Validate all fields
  const validateAllFields = () => {
    const audioError = validateAmount(price.audioRate.amount, "Audio call rate");
    const chatError = validateAmount(price.chatRate.amount, "Chat rate");
    const videoError = validateAmount(price.videoCallRate.amount, "Video call rate");
    
    setErrors({
      audioRate: audioError,
      chatRate: chatError,
      videoCallRate: videoError,
    });
    
    return !audioError && !chatError && !videoError;
  };

  const handleAmountChange = (type) => (e) => {
    const value = e.target.value;
    
    // Allow empty string for user to clear and retype
    if (value === '') {
      setPrice((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          amount: '',
        },
      }));
      return;
    }
    
    // Only allow positive integers
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setPrice((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          amount: numValue,
        },
      }));
      
      // Validate on change if field was touched
      if (touched[type]) {
        validateField(type, numValue);
      }
    }
  };

  const handleBlur = (type) => {
    setTouched(prev => ({ ...prev, [type]: true }));
    validateField(type, price[type].amount);
  };

  const handleSetPrice = async () => {
    // Mark all fields as touched
    setTouched({
      audioRate: true,
      chatRate: true,
      videoCallRate: true,
    });
    
    // Validate all fields
    if (!validateAllFields()) {
      Toast.error("Please fix the errors before saving");
      return;
    }
    
    // Check if any value has changed
    const hasChanges = 
      price.audioRate.amount !== currentAudioRate ||
      price.chatRate.amount !== currentChatRate ||
      price.videoCallRate.amount !== currentVideoRate;
    
    if (!hasChanges) {
      Toast.warning("No changes to save");
      return;
    }
    
    try {
      await setAstrologerPrice(price).unwrap();
      
      // Update localStorage with new prices
      const updatedUserData = {
        ...userData,
        price: {
          ...userData?.price,
          audioRate: price.audioRate,
          chatRate: price.chatRate,
          videoCallRate: price.videoCallRate,
        },
      };
      localStorage.setItem("shubhtalk_astrologer_details", JSON.stringify(updatedUserData));
      
      Toast.success("Prices updated successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Price update error:", error);
      Toast.error(error?.data?.message || "Failed to update prices. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile: Full width with padding, Desktop: Centered card */}
      <div className="max-w-2xl mx-auto bg-white min-h-screen md:min-h-0 md:my-8 md:rounded-2xl md:shadow-sm">
        <div className="px-5 py-6 md:px-8 md:py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/dashboard"
              className="p-2 bg-[#FFF5EC] border border-[#FFE8C5] rounded-xl hover:bg-[#FFEDD5] transition-colors flex-shrink-0"
            >
              <Icons.ChevronLeft size={20} className="text-[#F75801]" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">
              Set Your Consultation Price
            </h1>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            Choose your per-minute rate for calls and chats. You can update it anytime.
          </p>

          {/* Rate Input Sections */}
          <div className="space-y-6 mb-8">
            {/* Audio Call Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="audioRate" className="text-base font-semibold text-gray-900">
                  Audio Call Rate/Minute
                </label>
                <span className="px-3 py-1 bg-[#FFF5EC] border border-[#FFE8C5] rounded-full text-xs text-gray-700">
                  Current Rate: ₹{currentAudioRate}
                </span>
              </div>
              <input
                id="audioRate"
                type="number"
                value={price.audioRate.amount}
                onChange={handleAmountChange("audioRate")}
                onBlur={() => handleBlur("audioRate")}
                placeholder="e.g: 20"
                min={1}
                max={10000}
                className={`w-full bg-gray-50 border rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-0 transition-colors
                         ${errors.audioRate && touched.audioRate 
                           ? 'border-red-500 focus:border-red-500' 
                           : 'border-gray-300 focus:border-gray-400'}`}
              />
              {errors.audioRate && touched.audioRate && (
                <p className="text-red-500 text-xs mt-1">{errors.audioRate}</p>
              )}
            </div>

            {/* Chat Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="chatRate" className="text-base font-semibold text-gray-900">
                  Chat Rate/Minute
                </label>
                <span className="px-3 py-1 bg-[#FFF5EC] border border-[#FFE8C5] rounded-full text-xs text-gray-700">
                  Current Rate: ₹{currentChatRate}
                </span>
              </div>
              <input
                id="chatRate"
                type="number"
                value={price.chatRate.amount}
                onChange={handleAmountChange("chatRate")}
                onBlur={() => handleBlur("chatRate")}
                placeholder="e.g: 20"
                min={1}
                max={10000}
                className={`w-full bg-gray-50 border rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-0 transition-colors
                         ${errors.chatRate && touched.chatRate 
                           ? 'border-red-500 focus:border-red-500' 
                           : 'border-gray-300 focus:border-gray-400'}`}
              />
              {errors.chatRate && touched.chatRate && (
                <p className="text-red-500 text-xs mt-1">{errors.chatRate}</p>
              )}
            </div>

            {/* Video Call Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="videoCallRate" className="text-base font-semibold text-gray-900">
                  Video Call Rate/Minute
                </label>
                <span className="px-3 py-1 bg-[#FFF5EC] border border-[#FFE8C5] rounded-full text-xs text-gray-700">
                  Current Rate: ₹{currentVideoRate}
                </span>
              </div>
              <input
                id="videoCallRate"
                type="number"
                value={price.videoCallRate.amount}
                onChange={handleAmountChange("videoCallRate")}
                onBlur={() => handleBlur("videoCallRate")}
                placeholder="e.g: 20"
                min={1}
                max={10000}
                className={`w-full bg-gray-50 border rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-0 transition-colors
                         ${errors.videoCallRate && touched.videoCallRate 
                           ? 'border-red-500 focus:border-red-500' 
                           : 'border-gray-300 focus:border-gray-400'}`}
              />
              {errors.videoCallRate && touched.videoCallRate && (
                <p className="text-red-500 text-xs mt-1">{errors.videoCallRate}</p>
              )}
            </div>
          </div>

          {/* Warning Box */}
          <div className="bg-[#FFF5EC] border border-[#FFE8C5] rounded-2xl p-5 mb-6">
            <p className="text-center text-sm font-medium text-[#8B6914] leading-relaxed">
              Higher prices may affect booking frequency. Choose wisely.
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSetPrice}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#F75801] to-[#D43400] text-white font-semibold py-4 rounded-full
                     hover:from-[#E54E00] hover:to-[#C32F00] active:scale-[0.98] transition-all shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                Save
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetPrice;
