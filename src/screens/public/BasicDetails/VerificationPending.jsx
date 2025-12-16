import { useNavigate } from "react-router-dom";

const VerificationPending = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("shubhtalk_role");
    localStorage.removeItem("shubhtalk_astro_id");
    localStorage.removeItem("shubhtalk_astro_token");
    localStorage.removeItem("shubhtalk_astrologer_details");
    navigate("/");
};
  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-md px-6 pt-10 pb-8 flex flex-col">

        {/* Status bar spacer */}
        <div className="h-6 mb-6" />

        {/* Center Content */}
        <div className="flex flex-col items-center text-center flex-1 justify-center">

          {/* Illustration */}
          <div className="mb-8">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="60" cy="55" r="18" stroke="black" strokeWidth="2" />
              <ellipse cx="60" cy="60" rx="35" ry="10" stroke="black" strokeWidth="2" />
              <path d="M45 52c5-5 25-5 30 0" stroke="black" strokeWidth="2" />
              <path d="M45 60c5 5 25 5 30 0" stroke="black" strokeWidth="2" />

              <line x1="35" y1="72" x2="35" y2="92" stroke="black" strokeWidth="2" />
              <line x1="60" y1="75" x2="60" y2="95" stroke="black" strokeWidth="2" />
              <line x1="85" y1="72" x2="85" y2="92" stroke="black" strokeWidth="2" />

              <circle cx="35" cy="98" r="3" fill="black" />
              <circle cx="60" cy="100" r="3" fill="black" />
              <circle cx="85" cy="98" r="3" fill="black" />

              <path d="M25 40l4 4M95 40l-4 4M60 25l0 5" stroke="black" strokeWidth="2" />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold mb-4">
            We’re Verifying<br />Your Details
          </h1>

          {/* Description */}
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            Our team is reviewing your information to ensure
            everything aligns perfectly.
            <br />
            You’ll be notified once your profile is approved.
          </p>
        </div>

        {/* Bottom Buttons */}
        <div className="flex gap-4 mt-10">
          <button
             onClick={handleLogout}
            className="flex-1 border border-black py-3 rounded-xl font-medium"
          >
            Explore Our Tutorial
          </button>

          <button
            onClick={handleLogout}
            className="flex-1 bg-black text-white py-3 rounded-xl font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;
