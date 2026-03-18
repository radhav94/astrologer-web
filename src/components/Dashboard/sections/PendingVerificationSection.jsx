/**
 * PendingVerificationSection Component
 * Shown when the astrologer's profile is not yet fully verified.
 */
const PendingVerificationSection = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] md:min-h-[80vh] px-4 md:px-0">
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-6 md:p-12 max-w-3xl w-full text-center">
        <div className="w-16 h-16 md:w-24 md:h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
          <svg
            className="w-8 h-8 md:w-12 md:h-12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#F75801"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
          Profile Under Review
        </h2>
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          Thank you for submitting your details. Our team will reach out to you
          for an interview within 4 weeks if your profile gets shortlisted.
        </p>
      </div>
    </div>
  );
};

export default PendingVerificationSection;
