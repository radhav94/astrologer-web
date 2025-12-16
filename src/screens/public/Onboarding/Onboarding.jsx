import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Onboarding = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all localStorage
    localStorage.clear();

    // Clear all sessionStorage
    sessionStorage.clear();

    // Clear all cookies safely
    try {
      document.cookie
        .split(";")
        .forEach(
          (c) =>
            (document.cookie =
              c.trim().split("=")[0] +
              "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/")
        );
    } catch (err) {
      console.warn("Failed to clear cookies", err);
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#3f5556] overflow-hidden">
      {/* Background Image */}
      <img
        src="/shubhastro.svg"
        alt="Onboarding"
        className="absolute inset-0 w-full h-full object-cover sm:object-contain mx-auto"
      />

      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] px-6 pt-8 pb-6 sm:px-10">
        <div className="max-w-xl mx-auto">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-black leading-tight mb-3">
            Share Your Wisdom <br /> with the World
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-sm sm:text-base mb-6">
            Join a community of trusted astrologers offering authentic
            consultations to seekers worldwide.
          </p>

          {/* Dots */}
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-black rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-black text-white py-3 rounded-xl text-sm sm:text-base font-medium hover:bg-gray-900 transition"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
