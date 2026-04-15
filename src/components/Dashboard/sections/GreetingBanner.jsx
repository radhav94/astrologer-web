import { useMemo } from "react";
import { Icons } from "../../Icons";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good Morning", icon: <Icons.Sun size={18} className="text-[#FFD600]" /> };
  if (h < 17) return { text: "Good Afternoon", icon: <Icons.CloudSun size={18} className="text-[#FFA726]" /> };
  return { text: "Good Evening", icon: <Icons.Moon size={18} className="text-[#F2C572]" /> };
};

const quotes = [
  "The stars align for those who show up consistently.",
  "Every session is a chance to change someone's life.",
  "Your guidance lights the path for others.",
  "Trust the cosmos — your best sessions are ahead.",
  "Patience and wisdom attract the right clients.",
];

const GreetingBanner = ({ astrologerData }) => {
  const greeting = useMemo(() => getGreeting(), []);
  const name = astrologerData?.name || astrologerData?.firstName || "Astrologer";
  const firstName = name.split(" ")[0];
  const quote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div
      className="relative rounded-2xl p-4 sm:p-5 overflow-hidden h-full flex flex-col justify-center"
      style={{
        background: "linear-gradient(145deg, #FFF7F0 0%, #FFFFFF 100%)",
        boxShadow: "var(--dashboard-shadow-card)",
        border: "1px solid var(--dashboard-border)",
      }}
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[rgba(247,88,1,0.06)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-[rgba(255,192,99,0.08)] blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-1.5 mb-1.5">
          {greeting.icon}
          <p className="text-[#6B7280] text-[11px] font-medium tracking-[0.16em] uppercase">{today}</p>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight mb-2">
          {greeting.text}, {firstName}
        </h2>
        <p className="text-[#6B7280] text-xs sm:text-sm leading-relaxed italic line-clamp-2 max-w-[28rem]">
          "{quote}"
        </p>
      </div>
    </div>
  );
};

export default GreetingBanner;
