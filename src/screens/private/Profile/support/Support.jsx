import { Link } from "react-router-dom";
import { Icons } from "../../../../components/Icons";

const Support = () => {
  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        {/* Astrologer Support */}
        <Link to="/customer-support">
          <div className="bg-gray-100 rounded-3xl p-8 hover:bg-gray-200 transition-colors cursor-pointer group relative overflow-hidden">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-6 group-hover:bg-white transition-colors">
              <Icons.Headphones size={32} className="text-gray-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Astrologer Support
            </h3>
            <p className="text-gray-500 text-sm">
              Chat with our team for quick help regarding your account or
              bookings.
            </p>
            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
              <Icons.ArrowRight size={24} className="text-gray-900" />
            </div>
          </div>
        </Link>

        {/* FAQs */}
        <Link to="/FAQs">
          <div className="bg-gray-100 rounded-3xl p-8 hover:bg-gray-200 transition-colors cursor-pointer group relative overflow-hidden">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-6 group-hover:bg-white transition-colors">
              <Icons.HelpCircle size={32} className="text-gray-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">FAQs</h3>
            <p className="text-gray-500 text-sm">
              Find quick answers to common app questions, payments, and
              features.
            </p>
            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
              <Icons.ArrowRight size={24} className="text-gray-900" />
            </div>
          </div>
        </Link>

        {/* Recent Tickets */}
        <Link to="/recent-tickets">
          <div className="bg-gray-100 rounded-3xl p-8 hover:bg-gray-200 transition-colors cursor-pointer group relative overflow-hidden">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-6 group-hover:bg-white transition-colors">
              <Icons.FileText size={32} className="text-gray-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Recent Tickets
            </h3>
            <p className="text-gray-500 text-sm">
              Track updates on your latest support requests and resolutions.
            </p>
            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
              <Icons.ArrowRight size={24} className="text-gray-900" />
            </div>
          </div>
        </Link>

        {/* Guidelines */}
        <Link to="/guidelines">
          <div className="bg-gray-100 rounded-3xl p-8 hover:bg-gray-200 transition-colors cursor-pointer group relative overflow-hidden">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-6 group-hover:bg-white transition-colors">
              <Icons.Shield size={32} className="text-gray-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Guidelines & Best Practices
            </h3>
            <p className="text-gray-500 text-sm">
              Access consultation standards, behavious policies,and tips.
            </p>
            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
              <Icons.ArrowRight size={24} className="text-gray-900" />
            </div>
          </div>
        </Link>
      </div>

      {/* Others Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Others</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-between hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100 cursor-pointer">
            <div>
              <h4 className="font-bold text-gray-900">Community Guidelines</h4>
              <p className="text-xs text-gray-500 mt-1">
                Learn how to use the platform safely and respectfully.
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
              <Icons.ArrowRight size={18} />
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-between hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100 cursor-pointer">
            <div>
              <h4 className="font-bold text-gray-900">Tips and Growth</h4>
              <p className="text-xs text-gray-500 mt-1">
                Learn how to use the platform and earn more.
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
              <Icons.ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
