import { Link } from "react-router-dom";
import { Icons } from "../../../../../components/Icons";

const Guidelines = () => {
  const items = [
    {
      label: "Terms & Conditions",
      desc: "Read our service terms and platform policies.",
      icon: Icons.FileText,
      path: "/guidelines/terms-conditions",
    },
    {
      label: "Privacy Policies",
      desc: "Read our service terms and platform policies.",
      icon: Icons.Shield,
    },
    {
      label: "App License",
      desc: "Read our service terms and platform policies.",
      icon: Icons.AlertCircle,
    },
  ];

  return (
    <div className="h-full flex flex-col max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
          <Link to="/profile" state={{ data: "support" }}>
            <Icons.ChevronLeft size={20} className="text-gray-700" />
          </Link>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Guidelines & Best Practices
        </h1>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <Link
            to={item.path}
            key={idx}
            className="group bg-gray-50 rounded-2xl p-6 flex items-center justify-between hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 cursor-pointer"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-gray-900">{item.label}</h4>
              </div>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 group-hover:bg-black group-hover:text-white transition-colors">
              <Icons.ArrowRight size={18} />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-auto pt-8">
        <button className="w-full bg-gray-100 rounded-2xl p-6 flex items-center justify-between hover:bg-red-50 transition-colors group">
          <span className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">
            Delete Account
          </span>
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
            <Icons.ArrowRight size={18} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Guidelines;
