import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export const DonutChart = ({ data }) => {
  return (
    <div className="h-24 w-24 sm:h-32 sm:w-32 relative">
      <ResponsiveContainer minWidth="100%" minHeight="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={20}
            outerRadius={30}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
            className="sm:!hidden"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
            className="!hidden sm:!block"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            itemStyle={{ fontSize: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center Label (Simulated) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center"></div>
      </div>
    </div>
  );
};

export const Heatmap = ({ data }) => {
  const getColor = (count) => {
    if (count === 0) return "bg-[#E8F5E9]";
    if (count <= 2) return "bg-[#A5D6A7]";
    if (count <= 5) return "bg-[#66BB6A]";
    if (count <= 10) return "bg-[#4CAF50]";
    return "bg-[#2E7D32]";
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-12 gap-1.5 sm:gap-2">
        {data.map((item, idx) => (
          <div
            key={idx}
            className={`aspect-square rounded-md ${getColor(
              item.value
            )} transition-colors duration-200 hover:opacity-80 cursor-pointer`}
            title={`Day ${item.day}: ${item.value} session${item.value !== 1 ? 's' : ''}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-4 text-xs text-[#9CA3AF]">
        <span>Less</span>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-md bg-[#E8F5E9]"></div>
          <div className="w-3 h-3 rounded-md bg-[#A5D6A7]"></div>
          <div className="w-3 h-3 rounded-md bg-[#66BB6A]"></div>
          <div className="w-3 h-3 rounded-md bg-[#4CAF50]"></div>
        </div>
        <span>Many</span>
      </div>
    </div>
  );
};
