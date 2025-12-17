import React from "react";
import { ChevronLeft, Mic, Send, Star } from "lucide-react";
import { Link } from "react-router-dom";

const messages = [
  {
    text: "transformation wale rahenge career aur personal dono fronts par.",
    isSender: false,
    time: "4:26",
  },
  { text: "Achha ya challenging?", isSender: true, time: "4:26" },
  {
    text: "Mix hai. Career mein naye chances milenge, par decision calmly lijiye.",
    isSender: false,
    time: "4:26",
  },
  { text: "Personal life?", isSender: true, time: "4:26" },
  {
    text: "Thoda delay dikh raha hai, Jan ke baad clarity milegi.",
    isSender: false,
    time: "4:26",
  },
  { text: "Koi remedy?", isSender: true, time: "4:26" },
  {
    text: "Har Friday white flower chadhaiye aur 10 min meditation kijiye. Peace milega.",
    isSender: false,
    time: "4:26",
  },
  { text: "Thank you 😊", isSender: true, time: "4:26" },
  { text: "Always 🙏 Trust the process.", isSender: false, time: "4:26" },
];
const Message = ({ text, isSender, time }) => (
  <div
    className={`flex w-full mb-4 ${isSender ? "justify-end" : "justify-start"}`}
  >
    <div
      className={`flex flex-col max-w-[85%] md:max-w-[65%] ${
        isSender ? "items-end" : "items-start"
      }`}
    >
      <div
        className={`
          px-5 py-3 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm relative
          ${
            isSender
              ? "bg-gray-300 text-gray-900 rounded-tr-sm"
              : "bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-100"
          }
        `}
      >
        {text}
      </div>
      <span className="text-[10px] text-gray-400 mt-1 px-1 font-medium">
        {time}
      </span>
    </div>
  </div>
);

const ChatInterface = () => {
  return (
    <div className="flex flex-col h-full -m-4 md:-m-8">
      {/* Header */}
      <div className="flex items-center justify-between p-2  border-b border-gray-100 bg-white rounded-t-2xl z-10">
        <div className="flex items-center gap-3">
          <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <Link to="/dashboard">
              <ChevronLeft size={20} className="text-gray-700" />
            </Link>
          </button>
          <Link to="/client-details" className="pr-14">
            <div className="flex ">
              <h2 className="text-lg font-bold text-gray-900">Priya Gupta</h2>
            </div>
          </Link>
        </div>
        <div className="flex items-center ">
          <div className="text-red-500 bg-red-50 px-3 py-1 rounded-full text-xs font-semibold">
            Ends in 3:11
          </div>
          {/* Placeholder for menu dots if needed like standard chat apps, though not in wireframe explicitly, useful for desktop feel */}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white custom-scrollbar">
        {messages.map((msg, idx) => (
          <Message key={idx} {...msg} />
        ))}
      </div>

      {/* Footer Area: Rating & Input */}
      <div className="p-4 md:p-6 bg-white border-t border-gray-100 rounded-b-2xl">
        {/* Rating Section */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">
              Add Rating
            </span>
            <div className="flex gap-1 ml-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  className="text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors"
                  strokeWidth={1.5}
                />
              ))}
            </div>
          </div>
          <span className="text-xs text-gray-500">
            Tell us about your experience
          </span>
        </div>

        {/* Input Bar */}
        <div className="relative flex items-center gap-3">
          <div className="flex-1 relative group">
            <input
              type="text"
              placeholder="| Starts typing..."
              className="w-full pl-5 pr-12 py-4 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all shadow-sm group-hover:border-gray-400"
            />
          </div>

          <button
            className="p-4 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            title="Voice Message"
          >
            <Mic size={24} />
          </button>

          <button className="p-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 shadow-md transition-transform active:scale-95">
            <Send size={20} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
