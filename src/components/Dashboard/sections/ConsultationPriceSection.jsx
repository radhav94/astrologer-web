import { Link } from "react-router-dom";
import { Icons } from "../../Icons";
import { appSvgs } from "../../../utils/appImages";
import styles from "./ConsultationPriceSection.module.scss";

/**
 * Consultation Price Section Component
 * Displays current consultation rates and allows updating them
 */
const ConsultationPriceSection = ({ astrologerData }) => {

  // console.log("astrologerData:::",astrologerData)
  return (
    <div className="grid grid-cols-1">
      <div className="bg-[#FFE4BA] rounded-3xl p-4 sm:p-8 lg:p-6 text-left shadow-sm relative overflow-hidden">
        <div className="flex items-start justify-between gap-3 sm:gap-4 mb-6 lg:mb-5">
          <div className="flex-1 min-w-0">
            <h3 className={styles.setPrice}>
              Set Consultation Price
            </h3>
            <p className="text-[#6B7280] text-sm sm:text-lg lg:text-base">
              Update your per-minute rate for calls and chats.
            </p>
          </div>
          
          <Link
            to="/set-your-consultation-price"
            className={styles.setButton}
          >
            Set Now <Icons.ChevronRight size={18} className="sm:w-5 sm:h-5 lg:w-[18px] lg:h-[18px]" />
          </Link>
        </div>

        <div className="bg-[#FFF5EC] rounded-2xl sm:rounded-3xl lg:rounded-2xl p-4 sm:p-6 lg:p-5">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex flex-col justify-center min-w-[75px] sm:min-w-[120px] lg:min-w-[100px]">
              <p className="text-base sm:text-xl lg:text-lg font-normal text-[#2D2D2D] leading-tight">
                Current<br />Rates
              </p>
            </div>

            <div className="flex flex-col items-center flex-1">
              <img src={appSvgs.ChatIcon} alt="Chat" className="sm:w-10 sm:h-10 lg:w-8 lg:h-8 mb-1 sm:mb-2 lg:mb-1.5 object-contain" />
              <p className="text-sm sm:text-3xl lg:text-2xl font-bold text-[#2D2D2D] whitespace-nowrap">
                ₹{astrologerData?.price?.chatRate?.amount || 0}/m
              </p>
            </div>

            <div className="flex flex-col items-center flex-1">
              <img src={appSvgs.AudioIcon} alt="Call" className="sm:w-10 sm:h-10 lg:w-8 lg:h-8 mb-1 sm:mb-2 lg:mb-1.5 object-contain" />
              <p className="text-sm sm:text-3xl lg:text-2xl font-bold text-[#2D2D2D] whitespace-nowrap">
                ₹{astrologerData?.price?.audioRate?.amount || 0}/m
              </p>
            </div>

            <div className="flex flex-col items-center flex-1">
              <img src={appSvgs.VideoIcon} alt="Video" className="sm:w-10 sm:h-10 lg:w-8 lg:h-8 mb-1 sm:mb-2 lg:mb-1.5 object-contain" />
              <p className="text-sm sm:text-3xl lg:text-2xl font-bold text-[#2D2D2D] whitespace-nowrap">
                ₹{astrologerData?.price?.videoCallRate?.amount || 0}/m
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationPriceSection;
