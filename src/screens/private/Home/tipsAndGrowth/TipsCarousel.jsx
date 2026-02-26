import SectionHeader from "../../../../components/UI/SectionHeader";
import TipCard from "./TipCard";

const tips = [
  {
    id: 1,
    text: "Ratings influence visibility, respond within 10 minutes for higher ranking.",
  },
  {
    id: 2,
    text: "Adding high-quality images to your portfolio increases engagement by 30%.",
  },
  {
    id: 3,
    text: "Consistently updating your availability calendar helps avoid unwanted cancellations.",
  },
  {
    id: 4,
    text: "Personalizing your response messages builds trust and encourages repeat customers.",
  },
  {
    id: 5,
    text: "Offering a small discount for first-time clients can significantly boost your initial order rate.",
  },
];

const TipsCarousel = () => {
  return (
    <div className="w-full mx-auto py-4">
      {/* Section Header */}
      <div className="px-4 text-start md:px-0 mb-4 flex justify-center">
        <SectionHeader title="TIPS & GROWTH" />
      </div>

      {/* 
          Scrollable Container 
          - overflow-x-auto: Enables horizontal scrolling
          - no-scrollbar: Custom class to hide scrollbar (defined in index.html)
          - snap-x snap-mandatory: CSS Scroll Snap for better mobile experience
        */}
      <div
        className="
          flex 
          overflow-x-auto 
          gap-4 
          pb-6 
          px-4 
          md:px-0
          snap-x snap-mandatory 
          no-scrollbar
          scroll-smooth
        "
      >
        {tips.map((tip) => (
          <TipCard key={tip.id} tip={tip} />
        ))}

        {/* Spacer for right-side padding when scrolling to the end */}
        <div className="w-1 shrink-0 md:hidden" />
      </div>
    </div>
  );
};

export default TipsCarousel;
