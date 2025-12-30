import { Link } from "react-router-dom";
import { Icons } from "../../../../components/Icons";
import { useState } from "react";
import { useSetAstrologerPriceMutation } from "../../../../redux/astrologer/astrologerApi";
import { Toast } from "../../../../components";
import { useSelector } from "react-redux";

const SetPrice = () => {
  const userData = JSON.parse(
    localStorage.getItem("shubhtalk_astrologer_details")
  );
  console.log(userData, "userData");
  const [price, setPrice] = useState({
    callRate: {
      unit: "minute",
      currency: "INR",
      amount: userData?.price?.callRate?.amount,
    },
    chatRate: {
      unit: "minute",
      currency: "INR",
      amount: userData?.price?.chatRate?.amount,
    },
  });

  const [setAstrologerPrice, { isLoading }] = useSetAstrologerPriceMutation();

  const handleAmountChange = (type) => (e) => {
    const value = parseInt(e.target.value);

    setPrice((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        amount: value,
      },
    }));
  };

  const handlSetPrice = async () => {
    try {
      const response = await setAstrologerPrice(price).unwrap();
      Toast.success("Price updated successfully");
    } catch (error) {
      Toast.error(error?.data?.message || "Failed to update price");
    }
  };

  return (
    <div className="h-full flex flex-col max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
          <Link to="/dashboard">
            <Icons.ChevronLeft size={20} className="text-gray-700" />
          </Link>
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          Set Your Consultation Price
        </h1>
      </div>

      <div className="flex-1 text-left">
        <p className="text-gray-600 text-sm mb-8 leading-relaxed">
          Choose your per-minute rate for calls and chats. You can update it
          anytime.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">
              Call Rate / Minute
            </label>

            <div className="relative">
              {/* Rupee symbol */}
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                ₹
              </span>

              <input
                type="number"
                value={price.callRate.amount}
                onChange={handleAmountChange("callRate")}
                min={0}
                className="w-full border border-gray-400 rounded-xl pl-8 pr-4 py-3 font-bold text-gray-900 
                 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />
            </div>
            {/* <p className="text-xs text-left text-gray-400 mt-1">
              Current Rate <span className="text-black font-bold">₹20</span>
            </p> */}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">
              Chat Rate / Minute
            </label>

            <div className="relative">
              {/* Rupee symbol */}
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                ₹
              </span>

              <input
                type="number"
                value={price.chatRate.amount}
                onChange={handleAmountChange("chatRate")}
                min={0}
                className="w-full border border-gray-400 rounded-xl pl-8 pr-4 py-3 font-bold text-gray-900 
                 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-4 pb-6">
        <div className="bg-[#D1F0E3] p-6 rounded-2xl mb-2 text-center">
          <p className="text-[#2D6A4F] text-xs font-medium leading-relaxed">
            Higher prices may affect booking frequency.
            <br />
            Choose wisely.
          </p>
        </div>

        <button
          onClick={handlSetPrice}
          className="w-full bg-black text-white font-medium py-4 rounded-2xl hover:bg-gray-900 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default SetPrice;
