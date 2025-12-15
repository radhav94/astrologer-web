import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EXPERTISE_AREAS = [
  "Love & Relationships",
  "Career & Growth",
  "Wealth & Finances",
  "Health & Well-Being",
  "Self-Understanding",
  "Psychology",
];

const AreaOfExpertise = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);

  const toggleSelect = (item) => {
    setSelected((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };

  const isValid = selected.length > 0;

  return (
    <div className="min-h-screen bg-white flex justify-center text-left">
      <div className="w-full max-w-md px-6 pt-10 pb-10 flex flex-col">

        {/* Progress + Skip */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-black rounded-full" />
            <span className="w-2 h-2 bg-gray-300 rounded-full" />
            <span className="w-2 h-2 bg-gray-300 rounded-full" />
          </div>

          <button onClick={() => navigate("/verifyprofile")} className="text-sm text-gray-600 underline">
            Skip for Now
          </button>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold mb-2">
          Area of Expertise
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Help users find you for the guidance you’re best at,
          choose the life areas you specialize in.
        </p>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {EXPERTISE_AREAS.map((item) => {
            const active = selected.includes(item);

            return (
              <button
                key={item}
                onClick={() => toggleSelect(item)}
                className={`
                  h-28 rounded-2xl p-4 text-left font-semibold text-sm
                  transition flex items-start
                  ${
                    active
                      ? "bg-black text-white"
                      : "bg-gray-800 text-white opacity-90"
                  }
                `}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          disabled={!isValid}
          onClick={() => navigate("/verifyprofile")}
          className={`
            w-full py-3 rounded-xl font-medium transition mt-auto
            ${
              isValid
                ? "bg-black text-white hover:bg-gray-900"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }
          `}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AreaOfExpertise;
