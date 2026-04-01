import { Icons } from "../components/Icons";
import { appSvgs } from "./appImages";

export const EXPERTISE_AREAS = [
  {
    id: 1,
    title: "Love & Relationships",
    bgGradient: `linear-gradient(151.72deg, #FFECF0 10.17%, #F2EAFF 101.97%)`,
    icon: appSvgs.LoveIcon,
    iconBgColor: "#FF6B9D",
    slug:"love-and-relationships"
  },
  {
    id: 2,
    title: "Career & Growth",
    bgGradient: `linear-gradient(123.4deg, #F6E9FF 30.13%, #E8D4FF 100%)`,
    icon: appSvgs.CareerIcon,
    iconBgColor: "#9B6DD6",
    slug: "career-and-growth",
  },
  {
    id: 3,
    title: "Wealth & Finances",
    bgGradient: `linear-gradient(151.72deg, #E8F8E8 10.17%, #D4F1D4 101.97%)`,
    icon: appSvgs.WealthIcon,
    iconBgColor: "#4CAF50",
    slug: "wealth-and-finances",
  },
  {
    id: 4,
    title: "Health & Well-Being",
    bgGradient: `linear-gradient(136.36deg, #E3F2FD 37.95%, #BBDEFB 100%)`,
    icon: appSvgs.HealthIcon,
    iconBgColor: "#42A5F5",
    slug: "health-and-well-being",
  },
  {
    id: 5,
    title: "Self-Understanding",
    bgGradient: `linear-gradient(151.72deg, #FFE8F0 10.17%, #FFD6E8 101.97%)`,
    icon: appSvgs.SelfIcon,
    iconBgColor: "#FF6B9D",
    slug: "self-understanding",
  },
  {
    id: 6,
    title: "Psychology",
    bgGradient: `linear-gradient(157.15deg, #FFF4E0 -1.34%, #FFE8B2 100%)`,
    icon: appSvgs.OtherIcon,
    iconBgColor: "#FFB74D",
    slug: "psychology",
  },
];

export const availabilityConfig = [
  {
    type: "call",
    title: "Calls",
    subtitle: "Voice consultations",
    icon: Icons.Phone,
  },
  {
    type: "chat",
    title: "Chats",
    subtitle: "Text consultations",
    icon: Icons.MessageSquare,
  },
];