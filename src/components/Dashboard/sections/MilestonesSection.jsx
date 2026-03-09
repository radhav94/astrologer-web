import SectionHeader from "../../UI/SectionHeader";

/**
 * Milestones Section Component
 * Displays achievement milestones and progress
 */
const MilestonesSection = () => {
  return (
    <div className="space-y-4">
      <div className="flex">
        <SectionHeader title="MILESTONES" />
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x snap-mandatory">
        {/* Milestone Card 1 */}
        <div className="min-w-[320px] sm:min-w-[400px] flex-shrink-0 bg-gradient-to-br from-[#FFE8C5] to-[#FFD4A3] rounded-3xl p-6 shadow-sm snap-start">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl flex-shrink-0 shadow-md">
                ⚡
              </div>
              <div>
                <h4 className="font-bold text-[#2D2D2D] text-xl">
                  Earn More with<br />Milestones!
                </h4>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-3xl font-bold text-[#2D2D2D] mb-1">₹30,000</p>
              <p className="text-sm text-[#6B7280]">
                projected earning<br />for the month
              </p>
            </div>
          </div>

          <div className="relative mb-4">
            <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-[#FF6B35] rounded-full" style={{ width: '0%' }}></div>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#8B6914] to-[#6B4E0F] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <span className="text-white text-lg">🏆</span>
              </div>
              <span className="text-lg font-bold text-[#2D2D2D]">0/15</span>
            </div>
          </div>

          <p className="text-base text-[#6B7280]">
            Complete 2 more sessions to start getting ₹30/min
          </p>
        </div>

        {/* Milestone Card 2 */}
        <div className="min-w-[320px] sm:min-w-[400px] flex-shrink-0 bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] rounded-3xl p-6 shadow-sm snap-start">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl flex-shrink-0 shadow-md">
                🎯
              </div>
              <div>
                <h4 className="font-bold text-[#2D2D2D] text-xl">
                  Session<br />Master!
                </h4>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-3xl font-bold text-[#2D2D2D] mb-1">₹50,000</p>
              <p className="text-sm text-[#6B7280]">
                projected earning<br />for the month
              </p>
            </div>
          </div>

          <div className="relative mb-4">
            <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-[#4CAF50] rounded-full" style={{ width: '20%' }}></div>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <span className="text-white text-lg">🏆</span>
              </div>
              <span className="text-lg font-bold text-[#2D2D2D]">3/30</span>
            </div>
          </div>

          <p className="text-base text-[#6B7280]">
            Complete 27 more sessions to unlock ₹50/min rate
          </p>
        </div>

        {/* Milestone Card 3 */}
        <div className="min-w-[320px] sm:min-w-[400px] flex-shrink-0 bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] rounded-3xl p-6 shadow-sm snap-start">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl flex-shrink-0 shadow-md">
                ⭐
              </div>
              <div>
                <h4 className="font-bold text-[#2D2D2D] text-xl">
                  Rating<br />Champion!
                </h4>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-3xl font-bold text-[#2D2D2D] mb-1">Bonus</p>
              <p className="text-sm text-[#6B7280]">
                ₹5,000<br />reward
              </p>
            </div>
          </div>

          <div className="relative mb-4">
            <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-[#2196F3] rounded-full" style={{ width: '60%' }}></div>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1976D2] to-[#0D47A1] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <span className="text-white text-lg">🏆</span>
              </div>
              <span className="text-lg font-bold text-[#2D2D2D]">4.5/5.0</span>
            </div>
          </div>

          <p className="text-base text-[#6B7280]">
            Maintain 5.0 rating for bonus rewards
          </p>
        </div>

        <div className="min-w-[20px]"></div>
      </div>
    </div>
  );
};

export default MilestonesSection;
