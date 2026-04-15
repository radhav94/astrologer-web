import { Link } from "react-router-dom";
import { Icons } from "../../Icons";

const actions = [
  {
    label: "Go Live",
    subtitle: "Start streaming",
    icon: <Icons.Radio size={20} />,
    to: "/live-preview",
    accent: "#F75801",
    bg: "linear-gradient(135deg, #FFF0E6 0%, #FFE0CC 100%)",
    iconBg: "linear-gradient(135deg, #F75801 0%, #FF8F00 100%)",
  },
  {
    label: "Availability",
    subtitle: "Set schedule",
    icon: <Icons.Calendar size={20} />,
    to: "/schedule-availablity",
    accent: "#3B82F6",
    bg: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
    iconBg: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)",
  },
  {
    label: "Followers",
    subtitle: "View audience",
    icon: <Icons.User size={20} />,
    to: "/followers",
    accent: "#8B5CF6",
    bg: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)",
    iconBg: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
  },
  {
    label: "Support",
    subtitle: "Get help",
    icon: <Icons.Headphones size={20} />,
    to: "/customer-support",
    accent: "#4BA01D",
    bg: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
    iconBg: "linear-gradient(135deg, #4BA01D 0%, #65C832 100%)",
  },
];

const QuickActionsSection = () => {
  return (
    <div className="grid grid-cols-2 gap-2.5 h-full">
      {actions.map((action) => (
        <Link
          key={action.label}
          to={action.to}
          className="group relative flex flex-col items-start justify-between rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden"
          style={{
            background: action.bg,
            border: `1px solid ${action.accent}18`,
          }}
        >
          {/* Decorative corner circle */}
          <div
            className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-[0.07] pointer-events-none"
            style={{ background: action.accent }}
          />

          {/* Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md"
            style={{ background: action.iconBg }}
          >
            {action.icon}
          </div>

          {/* Text */}
          <div className="mt-3">
            <p className="text-sm font-bold text-[#1A1A1A] leading-tight">{action.label}</p>
            <p className="text-[11px] text-[#6B7280] mt-0.5">{action.subtitle}</p>
          </div>

          {/* Arrow */}
          <div
            className="absolute bottom-3 right-3 w-6 h-6 rounded-full flex items-center justify-center opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
            style={{ background: `${action.accent}12`, color: action.accent }}
          >
            <Icons.ArrowRight size={12} />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default QuickActionsSection;
