import React, { useEffect, useRef, useState } from "react";
import { Icons } from "./Icons";
import { Link } from "react-router";
import { useGetRecentAstrologerActivitiesQuery } from "../redux/recentActivities/recentActivities";

const LIMIT = 5;

const RecentActivity = ({ onBack }) => {
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const loaderRef = useRef(null);

  const { data, isFetching } =
    useGetRecentAstrologerActivitiesQuery({ page, limit: LIMIT });

  useEffect(() => {
      console.log("dataaaaaa",data);

    if (data?.data?.records?.length) {

      setRecords((prev) => [...prev, ...data?.data?.records]);
    }
  }, [data]);

  useEffect(() => {
    if (!loaderRef.current || !data?.data?.pagination?.hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetching) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [data, isFetching]);

  console.log("recordsssssssss",records);

  return (
    <div className="h-full flex flex-col text-start">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 bg-gray-100 rounded-xl"
        >
          <Link to="/dashboard">
            <Icons.ChevronLeft size={20} />
          </Link>
        </button>
        <h1 className="text-xl font-bold">Recent Activity</h1>
      </div>

      {/* CONTENT */}
      <div className="space-y-6 pb-20">
        {records.map((group) => (
          <div key={group.date}>
            <h3 className="text-sm font-semibold mb-3 border-b pb-2">
              {group.date}
            </h3>

            <div className="space-y-3">
              {group.transactions.map((tx) => (
                <div
                  key={tx._id}
                  className="bg-[#EAEAEA] rounded-xl p-4 flex justify-between"
                >
                  <div className="flex gap-4">
                    <div className="w-12 h-12">
                      <img
                        className="rounded-full"
                        src={`https://picsum.photos/seed/${tx.userId}/200`}
                        alt=""
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        {tx.message}
                      </p>

                      {tx.reason === "call_billing" && (
                        <span className="inline-block mt-1 px-2 py-0.5 border rounded-full text-[10px]">
                          Call
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex flex-col justify-between">
                    <p className="text-xs text-gray-400">
                      {new Date(tx.createdAt).toLocaleTimeString()}
                    </p>

                    {tx.amount > 0 && (
                      <p className="text-green-600 font-bold text-sm">
                        + ₹{tx.amount}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* LOAD MORE */}
        {data?.data?.pagination?.hasNextPage && (
          <div ref={loaderRef} className="h-10 flex justify-center">
            {isFetching && (
              <p className="text-sm text-gray-400">Loading...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
