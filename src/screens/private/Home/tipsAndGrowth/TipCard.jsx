import { appSvgs } from "../../../../utils/appImages";


const TipCard = ({ tip }) => {
  return (
    <div
      className="
      relative
      min-w-[240px] w-[240px] md:min-w-[280px] md:w-[280px]
      bg-white
      rounded-2xl 
      p-6 
      flex flex-col 
      justify-start 
      snap-start
      transition-transform duration-300 hover:scale-[1.02]
      cursor-pointer
      shadow-sm
      border border-gray-100
    "
    >
      {/* Quote Icon */}
      <div className="mb-3 opacity-80">
        <img src={appSvgs.Quotes} alt="Quote" className="w-9 h-7" />
      </div>

      {/* Text Content */}
      <p className="text-sm font-normal text-[#6B7280] leading-relaxed">
        {tip.text}
      </p>
    </div>
  );
};

export default TipCard;
