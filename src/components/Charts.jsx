import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export const DonutChart = ({ data }) => {
  return (
    <div className="h-32 w-32 relative">
      <ResponsiveContainer minWidth="100%" minHeight="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
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
  const getColor = (intensity) => {
    switch (intensity) {
      case 0:
        return "bg-gray-100";
      case 1:
        return "bg-green-200";
      case 2:
        return "bg-green-300";
      case 3:
        return "bg-green-400";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-12 gap-1.5 sm:gap-2">
        {data.map((item, idx) => (
          <div
            key={idx}
            className={`aspect-square rounded-sm sm:rounded-md ${getColor(
              item.value
            )} transition-colors duration-200 hover:opacity-80`}
            title={`Day ${item.day}: Level ${item.value}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-gray-100"></div>
          <div className="w-3 h-3 rounded-full bg-green-200"></div>
          <div className="w-3 h-3 rounded-full bg-green-300"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span>Many</span>
      </div>
    </div>
  );
};
