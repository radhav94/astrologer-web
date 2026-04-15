import { Link } from "react-router-dom";
import { Icons } from "../../Icons";
import { appSvgs } from "../../../utils/appImages";
import styles from "./ConsultationPriceSection.module.scss";

/**
 * Consultation Price Section Component
 * Displays current consultation rates and allows updating them
 */
const ConsultationPriceSection = ({ astrologerData }) => {
  return (
    <div className="grid grid-cols-1">
      <div className={styles.priceCard}>
        {/* Decorative background elements */}
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />

        <div className="flex items-start justify-between gap-3 sm:gap-4 mb-6 lg:mb-5 relative z-10">
          <div className="flex-1 min-w-0">
            <h3 className={styles.setPrice}>
              Set Consultation Price
            </h3>
            <p className="text-[#6B7280] text-xs sm:text-sm mt-1">
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

        <div className={styles.ratesContainer}>
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex flex-col justify-center">
              <p className="text-sm sm:text-base font-semibold text-[#1A1A1A] leading-tight">
                Current Rates
              </p>
              <p className="text-[#6B7280] text-xs mt-1">Per minute pricing across consultations</p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className={styles.rateItem}>
                <div className={styles.rateIconWrap}>
                  <img src={appSvgs.ChatIcon} alt="Chat" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#6B7280] uppercase tracking-[0.14em] mt-2">
                  Chat
                </p>
                <p className="text-sm sm:text-xl font-bold text-[#1A1A1A] whitespace-nowrap mt-1">
                  ₹{astrologerData?.price?.chatRate?.amount || 0}/m
                </p>
              </div>

              <div className={styles.rateItem}>
                <div className={styles.rateIconWrap}>
                  <img src={appSvgs.AudioIcon} alt="Call" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#6B7280] uppercase tracking-[0.14em] mt-2">
                  Call
                </p>
                <p className="text-sm sm:text-xl font-bold text-[#1A1A1A] whitespace-nowrap mt-1">
                  ₹{astrologerData?.price?.audioRate?.amount || 0}/m
                </p>
              </div>

              <div className={styles.rateItem}>
                <div className={styles.rateIconWrap}>
                  <img src={appSvgs.VideoIcon} alt="Video" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#6B7280] uppercase tracking-[0.14em] mt-2">
                  Video
                </p>
                <p className="text-sm sm:text-xl font-bold text-[#1A1A1A] whitespace-nowrap mt-1">
                  ₹{astrologerData?.price?.videoCallRate?.amount || 0}/m
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationPriceSection;
