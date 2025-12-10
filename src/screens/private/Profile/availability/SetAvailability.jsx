import { Icons } from "../../../../components/Icons";

const SetAvailability = () => {
  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  // Simplified calendar data for Dec 2025 based on image
  const calendarData = [
    { day: 29, prev: true },
    { day: 30, prev: true },
    { day: 31, prev: true },
    { day: 1 },
    { day: 2 },
    { day: 3 },
    { day: 4 },
    { day: 5 },
    { day: 6 },
    { day: 7, bold: true },
    { day: 8, selected: true },
    { day: 9, bold: true },
    { day: 10, bold: true },
    { day: 11, bold: true },
    { day: 12, bold: true },
    { day: 13, bold: true },
    { day: 14, bold: true },
    { day: 15, bold: true },
    { day: 16, bold: true },
    { day: 17, bold: true },
    { day: 18, bold: true },
    { day: 19, bold: true },
    { day: 20, bold: true },
    { day: 21, bold: true },
    { day: 22, bold: true },
    { day: 23, bold: true },
    { day: 24, bold: true },
    { day: 25, bold: true },
    { day: 26, bold: true },
    { day: 27, bold: true },
    { day: 28, bold: true },
    { day: 29, bold: true },
    { day: 30, bold: true },
    { day: 1, next: true },
    { day: 2, next: true },
  ];

  return (
    <div className="h-full flex flex-col max-w-lg mx-auto">
      {/* Header Tabs */}
      {/* <div className="flex border-b border-gray-200 mb-8">
        <button className="flex-1 pb-3 text-sm font-medium border-b-2 border-black text-black">
          Flexible Date
        </button>
        <button className="flex-1 pb-3 text-sm font-medium border-b-2 border-transparent text-gray-400 hover:text-gray-600">
          Fixed Date
        </button>
      </div> */}

      {/* Date Inputs */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Start Date</label>
          <div className="border border-gray-300 rounded-lg p-3">
            <span className="font-bold text-gray-900">17/01/2025</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">End Date</label>
          <div className="border border-gray-300 rounded-lg p-3 h-[46px]">
            {/* Empty state */}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="border border-gray-100 rounded-2xl p-6 shadow-sm bg-white mb-6">
        <div className="flex items-center justify-between mb-6">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full">
            <Icons.ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-900">December 2025</h2>
          <button className="p-2 text-gray-900 hover:bg-gray-50 rounded-full">
            <Icons.ArrowRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-4 mb-2">
          {days.map((d) => (
            <div
              key={d}
              className="text-center text-sm font-bold text-gray-800"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-2">
          {calendarData.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-center items-center aspect-square"
            >
              <button
                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm transition-all
                   ${item.selected ? "bg-gray-300 text-black font-bold" : ""}
                   ${item.prev || item.next ? "text-gray-200" : ""}
                   ${
                     !item.prev && !item.next && !item.selected && item.bold
                       ? "text-black font-bold"
                       : ""
                   }
                   ${
                     !item.prev && !item.next && !item.selected && !item.bold
                       ? "text-gray-300 font-medium"
                       : ""
                   }
                   ${
                     !item.prev && !item.next && !item.selected
                       ? "hover:bg-gray-100"
                       : ""
                   }
                 `}
              >
                {item.day}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pb-6">
        <button className="w-full bg-black text-white font-medium py-4 rounded-2xl hover:bg-gray-900 transition-colors">
          Next
        </button>
      </div>
    </div>
  );
};

export default SetAvailability;
