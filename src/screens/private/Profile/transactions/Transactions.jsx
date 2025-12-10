import { Icons } from "../../../../components/Icons";

const TRANSACTIONS = [
  {
    id: "1",
    title: "Call with #1876",
    date: "Oct 01, 2025 • 04:36 PM",
    amount: 200,
    isCredit: true,
  },
  {
    id: "2",
    title: "Withdrawal to bank",
    date: "Oct 01, 2025 • 04:36 PM",
    amount: 5000,
    isCredit: false,
  },
  {
    id: "3",
    title: "Call with #1876",
    date: "Oct 01, 2025 • 04:36 PM",
    amount: 200,
    isCredit: true,
  },
  {
    id: "4",
    title: "Call with #1876",
    date: "Oct 01, 2025 • 04:36 PM",
    amount: 200,
    isCredit: true,
  },
  {
    id: "5",
    title: "Call with #1876",
    date: "Oct 01, 2025 • 04:36 PM",
    amount: 200,
    isCredit: true,
  },
  {
    id: "6",
    title: "Withdrawal to bank",
    date: "Oct 01, 2025 • 04:36 PM",
    amount: 5000,
    isCredit: false,
  },
  {
    id: "7",
    title: "Call with #1876",
    date: "Oct 01, 2025 • 04:36 PM",
    amount: 200,
    isCredit: true,
  },
  {
    id: "8",
    title: "Call with #1876",
    date: "Oct 01, 2025 • 04:36 PM",
    amount: 200,
    isCredit: true,
  },
  {
    id: "9",
    title: "Call with #1876",
    date: "Oct 01, 2025 • 04:36 PM",
    amount: 200,
    isCredit: true,
  },
];

const Transactions = () => {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        {/* Title is usually in header, but keeping layout consistent with other subpages */}
      </div>

      <div className="space-y-4">
        {TRANSACTIONS.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="flex justify-between items-start border-b border-gray-100 pb-4 last:border-0"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs text-gray-500">#1896 • {item.date}</p>
              </div>
              <h4 className="font-bold text-gray-900">{item.title}</h4>
            </div>
            <div
              className={`font-bold ${
                item.isCredit ? "text-[#05CD99]" : "text-[#C03744]"
              }`}
            >
              {item.isCredit ? "+" : "-"} ₹{item.amount}
            </div>
          </div>
        ))}
      </div>

      <div className=" bottom-6 left-0 w-full px-6 flex justify-center z-20 pointer-events-none">
        <div className="w-full max-w-lg pointer-events-auto">
          <button className="w-full bg-black text-white font-medium py-4 rounded-2xl hover:bg-gray-900 transition-colors shadow-lg">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
