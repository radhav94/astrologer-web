import { Link } from "react-router-dom";
import { Icons } from "../../../../../../components/Icons";

const TermsConditions = () => {
  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto text-left">
      <div className="flex items-center gap-4 mb-8">
        <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
          <Link to="/guidelines">
            <Icons.ChevronLeft size={20} className="text-gray-700" />
          </Link>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Terms & Conditions</h1>
      </div>

      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 leading-relaxed text-gray-700 space-y-8">
        <div>
          <p className="mb-4">
            Welcome to ShubhAstro. These Terms & Conditions ("Terms") govern
            your use of our mobile application, website, products, and services
            ("Platform"). By accessing or using the Platform, you agree to be
            bound by these Terms.
          </p>
          <p className="font-bold text-gray-900">
            If you do not agree, please do not use the Platform.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-3">
            1. Eligibility
          </h3>
          <p>
            You must be 18 years or older to create an account and use
            ShubhAstro. By registering, you confirm that the information you
            provide is accurate and true.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-3">
            2. Nature of Services
          </h3>
          <p className="mb-2">ShubhAstro provides:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4 marker:text-gray-400">
            <li>Access to astrologers for consultations</li>
            <li>Birth chart/Kundli generation</li>
            <li>Tarot, numerology, and related esoteric services</li>
            <li>Content, reports, and predictions</li>
          </ul>
          <p className="bg-gray-50 p-4 rounded-xl text-sm border-l-4 border-gray-300">
            All predictions are advisory in nature. They are not guaranteed
            outcomes and should not replace professional advice such as medical,
            legal, or financial counsel.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-3">
            3. User Account
          </h3>
          <p className="mb-2">
            To use ShubhAstro, you may need to register using your mobile number
            and OTP verification. You are responsible for:
          </p>
          <ul className="list-disc pl-5 space-y-1 mb-4 marker:text-gray-400">
            <li>Maintaining confidentiality of your account</li>
            <li>All activity under your account</li>
            <li>Updating your information whenever necessary</li>
          </ul>
          <p>
            ShubhAstro reserves the right to suspend or terminate accounts that
            violate these Terms.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-3">
            4. Consultations & Interactions
          </h3>
          <p className="mb-2">When you book a consultation on ShubhAstro:</p>
          <ul className="list-disc pl-5 space-y-1 marker:text-gray-400">
            <li>
              The astrologer is responsible for the quality of insights offered.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
