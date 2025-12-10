import { useState } from "react";
import { Icons } from "../../../../../components/Icons";
import { Link } from "react-router-dom";

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const categories = [
    "Account & Profile",
    "Offers & Wallets",
    "Payments & Refunds",
    "App Features & Navigation",
    "Consultations & Bookings",
    "Privacy & Data Security",
  ];

  const questions = [
    {
      q: "How long do refunds take?",
      a: "Refunds typically take 5-7 business days to reflect in your original payment method, depending on your bank's processing time.",
    },
    {
      q: "My payment went through, but the consultation didn't start. What should I do?",
      a: "If the amount is deducted but your session didn't begin, your booking will auto-retry. If it still doesn't start, raise a ticket and our team will review it and issue a refund if applicable.",
    },
    {
      q: "Will I get a refund if the astrologer doesn't respond or ends the session early?",
      a: "Yes, you are only charged for the actual duration of the consultation. Any unused balance is returned to your wallet immediately.",
    },
    {
      q: "I was charged twice. How can I fix this?",
      a: "Please report this transaction via the 'Recent Tickets' section. Attach screenshots of both deductions, and we will process a refund for the duplicate charge within 24 hours.",
    },
    {
      q: "Can I cancel a booked session?",
      a: "Yes, you can cancel a scheduled session up to 10 minutes before the start time without any penalty.",
    },
  ];

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="h-full flex flex-col max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
          <Link to="/profile" state={{ data: "support" }}>
            <Icons.ChevronLeft size={20} className="text-gray-700" />
          </Link>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">FAQs</h1>
      </div>

      <div className="mb-8">
        <h2 className="text-lg text-gray-700 leading-relaxed mb-6">
          Find Clear Answers to All Your Astrology App Questions. Select from
          the topics below
        </h2>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                idx === 2
                  ? "bg-black text-white border-black"
                  : "bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Questions Accordion */}
        <div className="space-y-4">
          {questions.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-2xl transition-colors duration-200 overflow-hidden ${
                openIndex === idx
                  ? "bg-gray-100"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-bold text-sm text-gray-900 pr-4">
                  {item.q}
                </span>
                <span className="text-gray-500">
                  {openIndex === idx ? (
                    <Icons.Minus size={18} />
                  ) : (
                    <Icons.Plus size={18} />
                  )}
                </span>
              </button>

              <div
                className={`px-5 text-sm text-gray-600 leading-relaxed overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === idx
                    ? "max-h-96 pb-5 opacity-100"
                    : "max-h-0 pb-0 opacity-0"
                }`}
              >
                {item.a}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto bg-black text-white p-6 rounded-2xl flex items-center justify-between">
        <span className="font-medium">Still have a query?</span>
        <button className="bg-white text-black px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default FAQs;
