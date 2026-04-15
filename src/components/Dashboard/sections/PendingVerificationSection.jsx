/**
 * PendingVerificationSection Component
 * Shown when the astrologer's profile is not yet fully verified.
 */
const PendingVerificationSection = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] md:min-h-[80vh] px-4 md:px-0">
      <div
        className="relative bg-white rounded-3xl md:rounded-[32px] p-8 md:p-14 max-w-3xl w-full text-center overflow-hidden"
        style={{
          boxShadow: '0 4px 32px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #F75801 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br from-[#FFF5EC]/60 to-transparent pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-gradient-to-tr from-[#FFE8D4]/40 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <div className="w-18 h-18 md:w-24 md:h-24 bg-gradient-to-br from-[#FFF5EC] to-[#FFE8D4] rounded-3xl flex items-center justify-center mx-auto mb-5 md:mb-7"
            style={{ boxShadow: '0 4px 16px rgba(247, 88, 1, 0.1)' }}
          >
            <svg
              className="w-9 h-9 md:w-12 md:h-12"
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
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
            Profile Under Review
          </h2>
          <p className="text-sm md:text-base text-gray-500 leading-relaxed max-w-md mx-auto">
            Thank you for submitting your details. Our team will reach out to you
            for an interview within 4 weeks if your profile gets shortlisted.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingVerificationSection;
