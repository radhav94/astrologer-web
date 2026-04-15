import { Link } from "react-router-dom";
import { Icons } from "../../Icons";

const checkItems = [
  { key: "photo", label: "Photo", check: (d) => !!d?.profileImgUrl },
  { key: "bio", label: "Bio", check: (d) => !!d?.bio && d.bio.length > 10 },
  { key: "languages", label: "Languages", check: (d) => d?.languages?.length > 0 },
  { key: "specialties", label: "Specialties", check: (d) => d?.specialties?.length > 0 },
  { key: "education", label: "Education", check: (d) => !!d?.education || d?.educationDetails?.length > 0 },
  { key: "price", label: "Price", check: (d) => d?.price?.chatRate?.amount > 0 || d?.price?.audioRate?.amount > 0 },
  { key: "experience", label: "Experience", check: (d) => d?.experience > 0 },
  { key: "achievements", label: "Achievements", check: (d) => d?.achievements?.length > 0 },
];

const ProfileCompletionSection = ({ astrologerData }) => {
  const completed = checkItems.filter((item) => item.check(astrologerData));
  const total = checkItems.length;
  const percent = Math.round((completed.length / total) * 100);
  const incomplete = checkItems.filter((item) => !item.check(astrologerData));

  if (percent === 100) return null;

  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      className="relative rounded-2xl p-4 sm:p-5 overflow-hidden h-full"
      style={{
        background: "linear-gradient(145deg, #FFF7F0 0%, #FFFFFF 100%)",
        boxShadow: "var(--dashboard-shadow-card)",
        border: "1px solid var(--dashboard-border)",
      }}
    >
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[rgba(247,88,1,0.06)] pointer-events-none" />

      <div className="flex items-center gap-4 relative z-10">
        {/* Ring */}
        <div className="flex-shrink-0 relative w-[72px] h-[72px]">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="6" />
            <circle cx="36" cy="36" r={radius} fill="none" stroke="url(#pgComp)" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000 ease-out" />
            <defs>
              <linearGradient id="pgComp" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F75801" />
                <stop offset="100%" stopColor="#FF8F00" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-[#1A1A1A]">{percent}%</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-[#1A1A1A] mb-1">
            {percent < 50 ? "Let's get started!" : "Almost there!"}
          </h4>
          <p className="text-[11px] text-[#6B7280] mb-2">A complete profile builds more trust with customers.</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {incomplete.slice(0, 3).map((item) => (
              <span key={item.key} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#FFF0E4] text-[#F75801] border border-[#FFE0C4]">
                {item.label}
              </span>
            ))}
            {incomplete.length > 3 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#9CA3AF]">
                +{incomplete.length - 3}
              </span>
            )}
          </div>
          <Link to="/profile" className="text-xs font-semibold text-[#F75801] flex items-center gap-1 hover:text-[#D43400] transition-colors">
            Complete <Icons.ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionSection;
