import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export const DonutChart = ({ data }) => {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value, fill } = payload[0].payload;
    const pct = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
    return (
      <div className="bg-[#1E1E2E] rounded-xl shadow-2xl border border-white/10 px-3 py-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: fill }} />
          <span className="text-white/80 font-semibold">{name}</span>
        </div>
        <p className="text-white font-bold mt-0.5">₹{value.toLocaleString("en-IN")} ({pct}%)</p>
      </div>
    );
  };

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
            paddingAngle={2}
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
            paddingAngle={2}
            dataKey="value"
            stroke="none"
            className="!hidden sm:!block"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center" />
      </div>
    </div>
  );
};

export const Heatmap = ({ data, dark = false }) => {
  const getColor = (count) => {
    if (dark) {
      if (count === 0) return "bg-white/[0.04]";
      if (count <= 2) return "bg-[#FF6B35]/25";
      if (count <= 5) return "bg-[#FF6B35]/45";
      if (count <= 10) return "bg-[#FF6B35]/70";
      return "bg-[#FF6B35]";
    }
    if (count === 0) return "bg-[#F0F4F0]";
    if (count <= 2) return "bg-[#A5D6A7]";
    if (count <= 5) return "bg-[#66BB6A]";
    if (count <= 10) return "bg-[#43A047]";
    return "bg-[#2E7D32]";
  };

  const legendColors = dark
    ? ["bg-white/[0.04]", "bg-[#FF6B35]/25", "bg-[#FF6B35]/45", "bg-[#FF6B35]"]
    : ["bg-[#F0F4F0]", "bg-[#A5D6A7]", "bg-[#66BB6A]", "bg-[#43A047]"];

  return (
    <div className="w-full">
      <div className="grid grid-cols-12 gap-1.5 sm:gap-2">
        {data.map((item, idx) => (
          <div
            key={idx}
            className={`aspect-square rounded-lg ${getColor(item.value)} transition-all duration-200 hover:opacity-80 hover:scale-110 cursor-pointer`}
            title={`Day ${item.day}: ${item.value} session${item.value !== 1 ? "s" : ""}`}
          />
        ))}
      </div>
      <div className={`flex items-center gap-2 mt-4 text-xs font-medium ${dark ? "text-white/30" : "text-[#9CA3AF]"}`}>
        <span>Less</span>
        <div className="flex gap-1">
          {legendColors.map((c, i) => (
            <div key={i} className={`w-3.5 h-3.5 rounded-md ${c}`} />
          ))}
        </div>
        <span>Many</span>
      </div>
    </div>
  );
};
