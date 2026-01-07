import React, { useEffect, useState } from "react";
import { Icons } from "./Icons";
import { Link } from "react-router";
import { useGetOrderHistoryQuery } from "../redux/oderHistory/orderHistory";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDuration = (seconds = 0) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} Min ${secs} Sec`;
};

const ConsultationHistory = ({ onBack }) => {
  const [page, setPage] = useState(1);
  const [list, setList] = useState([]);

  const { data, isLoading, isFetching, isError } =
    useGetOrderHistoryQuery({ page, limit: 10 });

  // Here  Append data when page changes
  useEffect(() => {
    if (data?.data?.length) {
      setList((prev) => [...prev, ...data.data]);
    }
  }, [data]);

  // THis useEffet is for  Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200;

      if (nearBottom && !isFetching) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFetching]);

  if (isLoading && page === 1) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-500">
        Loading history...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-red-500">
        Failed to load history
      </div>
    );
  }

  return (
    <div className="h-full text-start flex flex-col relative">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200"
        >
          <Link to="/dashboard">
            <Icons.ChevronLeft size={20} />
          </Link>
        </button>
        <h1 className="text-xl font-bold">Consultation History</h1>
      </div>

      {/* List */}
      <div className="space-y-3 pb-24">
        {list.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-xl p-4 shadow-sm border"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icons.Star
                    key={star}
                    size={12}
                    className={
                      star <= item.rating
                        ? "fill-black text-black"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>

              <span className="bg-gray-800 text-white text-[10px] px-3 py-1 rounded-full">
                Call
              </span>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <h4 className="font-bold">
                  {item.displayProfile?.name || "Unknown User"}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(item.createdAt)} •{" "}
                  {formatTime(item.createdAt)}
                </p>
                <p className="text-xs text-gray-500">
                  Duration :{" "}
                  {formatDuration(item.sessionDetails?.durationSeconds)}
                </p>
              </div>

              <div className="text-right font-bold">
                ₹{item.sessionDetails?.amount}
              </div>
            </div>
          </div>
        ))}

        {isFetching && (
          <p className="text-center text-xs text-gray-400 py-4">
            Loading more...
          </p>
        )}

        {!isFetching && list.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-10">
            No consultation history found
          </p>
        )}
      </div>

      {/* Floating Buttons */}
      <div className="fixed bottom-2 left-0 lg:left-[8%] w-full px-6 flex justify-center z-20 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto shadow-lg bg-gray-900 p-1.5 rounded-full">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white rounded-full text-sm">
            <Icons.Sliders size={16} /> Sort
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white rounded-full text-sm">
            <Icons.Filter size={16} /> Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationHistory;
