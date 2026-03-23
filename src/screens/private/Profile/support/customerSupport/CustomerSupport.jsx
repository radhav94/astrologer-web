import { useState } from "react";
import { Icons } from "../../../../../components/Icons";
import { Link } from "react-router-dom";

const CustomerSupport = () => {
  const [messages] = useState([
    {
      id: 1,
      text: "Namaste 😊 How can we help you today?",
      sender: "bot",
      time: "4:25 PM",
      options: [
        "Session & Booking Issues",
        "Payment & Earnings Help",
        "Profile & Verification Support",
        "Customer Complaint Alerts",
        "Technical Assistance",
        "Report a User",
        "Schedule & Availability Help",
      ],
    },
    { id: 2, text: "Report a User", sender: "user", time: "4:26 PM" },
    {
      id: 3,
      text: "Sure 😌 Let us know which order can we help you with.",
      sender: "bot",
      time: "4:26 PM",
      isOrderSelect: true,
    },
    { id: 4, orderId: "2", sender: "user", time: "4:26 PM" }, // Simulated user selection
    {
      id: 5,
      text: "Please select the concern you want to address.",
      sender: "bot",
      time: "4:26 PM",
      options: [
        "Customer support issue",
        "Harassment or Bad Behavior",
        "Other",
      ],
    },
  ]);

  const orders = [
    {
      id: "1",
      name: "Jasmine",
      date: "Oct 01, 2025",
      time: "04:36 PM",
      duration: "5 Min 30 Secs",
      price: 200,
    },
    {
      id: "2",
      name: "Jasmine",
      date: "Oct 01, 2025",
      time: "04:36 PM",
      duration: "5 Min 30 Secs",
      price: 200,
    },
    {
      id: "3",
      name: "Jasmine",
      date: "Oct 01, 2025",
      time: "04:36 PM",
      duration: "5 Min 30 Secs",
      price: 200,
    },
  ];

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-100">
        <button className="p-2 bg-[#FFF5EC] border border-[#FFE8C5] rounded-xl hover:bg-[#FFEDD5] transition-colors">
          <Link to="/profile" state={{ data: "support" }}>
            <Icons.ChevronLeft size={20} className="text-[#F75801]" />
          </Link>
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Customer Support</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">
              Usually replies instantly
            </span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[70%] ${
                msg.sender === "user" ? "items-end" : "items-start"
              } flex flex-col`}
            >
              {/* Message Bubble */}
              {msg.text && !msg.isOrderSelect && (
                <div
                  className={`px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-gray-400 text-white rounded-tr-sm"
                      : "bg-white text-gray-800 rounded-tl-sm border border-gray-100"
                  }`}
                >
                  {msg.text}

                  {/* Options List */}
                  {msg.options && (
                    <div className="mt-4 flex flex-col gap-2">
                      {msg.options.map((opt, idx) => (
                        <button
                          key={idx}
                          className="text-left text-blue-600 font-medium text-sm py-1 hover:underline"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Order Selection UI (Bot) */}
              {msg.isOrderSelect && (
                <div className="bg-white rounded-2xl rounded-tl-sm border border-gray-100 p-4 w-full sm:min-w-[320px] shadow-sm">
                  <p className="text-sm text-gray-800 mb-4">{msg.text}</p>
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-green-600">
                          <Icons.Phone size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">
                            {order.name}
                          </h4>
                          <p className="text-[10px] text-gray-500">
                            {order.date} • {order.time}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-500">
                              Duration: {order.duration}
                            </span>
                            <span className="text-xs font-bold text-gray-900">
                              ₹{order.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="text-xs text-blue-600 font-bold mt-3 hover:underline">
                    View More
                  </button>
                </div>
              )}

              {/* Selected Order Display (User) */}
              {msg.orderId && (
                <div className="bg-gray-300 text-gray-800 p-3 rounded-2xl rounded-tr-sm flex items-center gap-3 min-w-[280px]">
                  <div className="w-10 h-10 bg-white/50 rounded-lg flex items-center justify-center text-green-700">
                    <Icons.Phone size={16} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-xs">Jasmine</h4>
                    <p className="text-[10px] text-gray-600">
                      Oct 01, 2025 • 04:36 PM
                    </p>
                    <span className="text-xs font-bold">₹200</span>
                  </div>
                </div>
              )}

              <span className="text-[10px] text-gray-400 mt-1 px-1">
                {msg.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <button className="w-full bg-black text-white font-medium py-3.5 rounded-xl hover:bg-gray-900 transition-colors">
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default CustomerSupport;
