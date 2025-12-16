import { Link } from "react-router-dom";
import { Icons } from "../../../components/Icons";

const ProfileTab = () => {
  const userData = JSON.parse(
    localStorage.getItem("shubhtalk_astrologer_details")
  );

  const firstName = userData?.firstName?.trim();
  const lastName = userData?.lastName?.trim();
  const userName =
    firstName && lastName ? `${firstName} ${lastName}` : "Unknown";
  return (
    <>
      {/* Details Sections */}
      <div className="space-y-4 pb-12 text-left ">
        {/* Basic Details */}
        <Link to="/profile/basic-details">
          <div className="bg-[#EAEAEA] p-5 rounded-2xl relative cursor-pointer">
            <div className="absolute top-5 right-5 text-gray-500">
              <Icons.Edit size={18} />
            </div>

            <span className="bg-[#444444] text-white px-3 py-1 rounded-full text-xs font-medium">
              Basic Details
            </span>
            <h3 className="font-bold text-lg text-gray-900 mt-3">{userName}</h3>
            <p className="text-sm text-gray-600">Jan 01, 2002 • Male</p>
            <p className="text-sm text-gray-600">+91 98989 98989</p>
            <p className="text-sm text-gray-600">hariprasad@gmail.com</p>
          </div>
        </Link>

        {/* Languages */}
        <Link to="/profile/languages">
          <div className="bg-[#EAEAEA] my-5 p-5 rounded-2xl relative cursor-pointer">
            <div className="absolute top-5 right-5 text-gray-500">
              <Icons.Edit size={18} />
            </div>
            <span className="bg-[#444444] text-white px-3 py-1 rounded-full text-xs font-medium">
              Languages
            </span>
            <div className="flex gap-2 mt-3">
              <span className="bg-[#666666] text-white px-4 py-1.5 rounded-full text-sm">
                Hindi
              </span>
              <span className="bg-[#666666] text-white px-4 py-1.5 rounded-full text-sm">
                English
              </span>
            </div>
          </div>
        </Link>

        {/* Professional Details */}
        <Link to="/profile/professional-details">
          <div className="bg-[#EAEAEA] p-5 my-5 rounded-2xl relative cursor-pointer">
            <div className="absolute top-5 right-5 text-gray-500">
              <Icons.Edit size={18} />
            </div>
            <span className="bg-[#444444] text-white px-3 py-1 rounded-full text-xs font-medium">
              Professional Details
            </span>
            <div className="flex gap-2 mt-3">
              <span className="bg-[#666666] text-white px-4 py-1.5 rounded-full text-sm">
                Vedic
              </span>
              <span className="bg-[#666666] text-white px-4 py-1.5 rounded-full text-sm">
                Tarot
              </span>
              <span className="bg-[#666666] text-white px-4 py-1.5 rounded-full text-sm">
                KP
              </span>
            </div>
          </div>
        </Link>

        {/* Achievements */}
        <Link to="/profile/achievements">
          <div className="bg-[#EAEAEA] p-5 my-4 rounded-2xl relative cursor-pointer">
            <div className="absolute top-5 right-5 text-gray-500">
              <Icons.Edit size={18} />
            </div>
            <span className="bg-[#444444] text-white px-3 py-1 rounded-full text-xs font-medium">
              Achievements
            </span>
            <p className="text-sm text-gray-700 mt-3 leading-relaxed">
              With years of dedicated practice, I've guided thousands of
              individuals across love, career, health, and life direction. My
              work combines classical Vedic principles with deep intuitive
              understanding, helping clients receive...{" "}
              <span className="text-blue-600 font-medium">
                Continue Reading
              </span>
            </p>
            <div className="flex gap-2 mt-4">
              <div className="w-16 h-16 bg-[#C4C4C4] rounded-lg"></div>
              <div className="w-16 h-16 bg-[#C4C4C4] rounded-lg"></div>
              <div className="w-16 h-16 bg-[#C4C4C4] rounded-lg"></div>
              <div className="w-16 h-16 bg-[#C4C4C4] rounded-lg flex items-center justify-center text-gray-600 font-bold text-sm">
                +4
              </div>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
};

export default ProfileTab;
