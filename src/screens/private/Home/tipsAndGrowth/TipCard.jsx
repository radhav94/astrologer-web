const TipCard = ({ tip }) => {
  return (
    <div
      className="
      relative
      min-w-[240px] w-[240px] md:min-w-[280px] md:w-[280px]
      bg-gray-100 
      rounded-2xl 
      p-6 
      flex flex-col 
      justify-start 
      snap-start
      transition-transform duration-300 hover:scale-[1.02]
      cursor-pointer
    "
    >
      {/* Quote Icon */}
      <div className="text-4xl text-gray-800 font-serif leading-none mb-3 opacity-80">
        “
      </div>

      {/* Text Content */}
      <p className="text-sm font-medium text-gray-600 leading-relaxed">
        {tip.text}
      </p>
    </div>
  );
};

export default TipCard;
