import { appSvgs } from "../../../../utils/appImages";

const gradients = [
  "from-[#FFF8F0] to-[#FFE8D4]",
  "from-[#F0F7FF] to-[#D8ECFF]",
  "from-[#F0FFF4] to-[#D4F5DD]",
  "from-[#FFF5F5] to-[#FFE0E0]",
  "from-[#F5F0FF] to-[#E4D8FF]",
];

const TipCard = ({ tip, index = 0 }) => {
  const gradient = gradients[index % gradients.length];

  return (
    <div
      className={`
        relative
        min-w-[240px] w-[240px] md:min-w-[280px] md:w-[280px]
        bg-gradient-to-br ${gradient}
        rounded-2xl 
        p-6 
        flex flex-col 
        justify-start 
        snap-start
        transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
        cursor-pointer
        border border-white/60
      `}
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}
    >
      {/* Quote Icon */}
      <div className="mb-3 opacity-70">
        <img src={appSvgs.Quotes} alt="Quote" className="w-9 h-7" />
      </div>

      {/* Text Content */}
      <p className="text-sm font-normal text-[#4B5563] leading-relaxed">
        {tip.text}
      </p>
    </div>
  );
};

export default TipCard;
