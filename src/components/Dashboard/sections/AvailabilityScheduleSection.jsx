import { Link } from "react-router-dom";
import { Icons } from "../../Icons";
import calendarImage from "../../../assets/images/calender.png";

/**
 * Availability Schedule Section Component
 * Prompts astrologer to set their availability schedule
 */
const AvailabilityScheduleSection = () => {
  return (
    <div
      className="relative rounded-[24px] sm:rounded-[32px] lg:rounded-[28px] p-6 sm:p-8 lg:p-7 overflow-hidden min-h-[320px] sm:min-h-0 transition-all duration-300 hover:shadow-lg"
      style={{
        background: 'linear-gradient(135deg, #FAFBFC 0%, #F3F4F6 50%, #EBEDF0 100%)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-[#FFF5EC]/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-gradient-to-tr from-[#FFE8D4]/30 to-transparent pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-0 sm:gap-8 lg:gap-10">
        <div className="flex-1 w-full sm:w-auto z-20 relative pb-32 sm:pb-0">
          <h3 className="font-bold text-[22px] text-left leading-[1.3] sm:text-[28px] lg:text-[26px] text-[#2D2D2D] mb-3 sm:mb-4 lg:mb-3">
            No Calls Scheduled,<br />Update Availability
          </h3>
          <p className="text-[#6B7280] text-[14px] leading-[1.6] sm:text-[16px] lg:text-[15px] mb-6 sm:mb-7 lg:mb-6 max-w-[420px]">
            Curate your calendars based on availability.
          </p>
          <Link
            to="/profile"
            state={{ data: "availability" }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F75801] to-[#D43400] hover:from-[#D43400] hover:to-[#B82E00] text-white px-8 sm:px-9 lg:px-8 py-[13px] sm:py-[14px] lg:py-[12px] rounded-full text-[15px] sm:text-[16px] lg:text-[15px] font-semibold transition-all duration-300"
            style={{ boxShadow: '0 4px 16px rgba(247, 88, 1, 0.3)' }}
          >
            Set Now <Icons.ChevronRight size={18} className="sm:w-5 sm:h-5 lg:w-[18px] lg:h-[18px]" strokeWidth={2.5} />
          </Link>
        </div>

        <div className="absolute bottom-4 right-4 sm:relative sm:bottom-auto sm:right-auto w-[200px] sm:w-[300px] lg:w-[320px] h-[200px] sm:h-[300px] lg:h-[320px] flex items-center justify-center flex-shrink-0 z-10">
          <div className="absolute w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] lg:w-[320px] lg:h-[320px] bg-gradient-to-br from-[#FFF8F0] via-[#FFF3E6] to-[#FFECD9] rounded-full opacity-80" />
          
          <div className="relative z-10">
            <img 
              src={calendarImage}
              alt="Calendar"
              className="w-[180px] sm:w-[280px] lg:w-[300px] h-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityScheduleSection;
