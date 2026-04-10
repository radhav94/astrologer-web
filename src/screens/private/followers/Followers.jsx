import { useState, useEffect, useRef, useCallback } from "react";
import { Icons } from "../../../components/Icons";
import { Link } from "react-router-dom";
import { useLazyGetFollowersQuery } from "../../../redux/astrologer/astrologerApi";
import { useSelector } from "react-redux";

const Followers = () => {
  const [fetchFollowers, { isLoading }] = useLazyGetFollowersQuery();
  const astrologerId = useSelector((state) => state.register.astrologerId) || localStorage.getItem("shubhtalk_astro_id");
  const [followers, setFollowers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const loadingRef = useRef(false);
  const observerRef = useRef(null);

  const loadFollowers = useCallback(async (pageNum) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const result = await fetchFollowers({ astrologerId, page: pageNum, limit: 20 }).unwrap();
      const list = result?.data || [];
      const pagination = result?.pagination;
      setFollowers((prev) => pageNum === 1 ? list : [...prev, ...list]);
      setHasMore(pagination?.hasNextPage ?? list.length >= 20);
    } catch { /* silently fail */ }
    loadingRef.current = false;
    setInitialLoading(false);
  }, [fetchFollowers]);

  useEffect(() => { loadFollowers(1); }, [loadFollowers]);

  const lastRef = useCallback((node) => {
    if (isLoading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
        const next = page + 1;
        setPage(next);
        loadFollowers(next);
      }
    });
    if (node) observerRef.current.observe(node);
  }, [isLoading, hasMore, page, loadFollowers]);

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  };

  const sorted = [...followers].sort((a, b) => {
    if (sortBy === "name") return (a.userName || "").localeCompare(b.userName || "");
    if (sortBy === "recent") return new Date(b.followedAt || 0) - new Date(a.followedAt || 0);
    if (sortBy === "oldest") return new Date(a.followedAt || 0) - new Date(b.followedAt || 0);
    return 0;
  });

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-100">
        <button className="p-2 bg-[#FFF5EC] border border-[#FFE8C5] rounded-xl hover:bg-[#FFEDD5] transition-colors">
          <Link to="/dashboard">
            <Icons.ChevronLeft size={20} className="text-[#F75801]" />
          </Link>
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1 text-center">Followers</h1>
        <div className="w-10" />
      </div>

      {/* Sort Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50 relative">
        <p className="text-sm text-gray-600">
          Sort by <span className="font-bold text-gray-900 capitalize">{sortBy}</span>
        </p>
        <button onClick={() => setShowSortMenu(!showSortMenu)} className="text-[#F75801]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M6 12h12M9 18h6"/></svg>
        </button>
        {showSortMenu && (
          <div className="absolute right-4 top-12 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden">
            {["default", "name", "recent", "oldest"].map((opt) => (
              <button
                key={opt}
                onClick={() => { setSortBy(opt); setShowSortMenu(false); }}
                className={`block w-full text-left px-5 py-3 text-sm hover:bg-gray-50 capitalize ${sortBy === opt ? "text-[#F75801] font-semibold" : "text-gray-700"}`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Followers List */}
      <div className="flex-1 overflow-y-auto">
        {initialLoading ? (
          <div className="flex justify-center items-center h-32"><span className="text-gray-400 text-sm">Loading...</span></div>
        ) : sorted.length === 0 ? (
          <div className="flex justify-center items-center h-32"><span className="text-gray-400 text-sm">No followers yet</span></div>
        ) : (
          <div>
            {sorted.map((f, idx) => {
              const name = f.userName || "User";
              const avatar = f.profileImgUrl;
              const since = f.followedAt;
              const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              const isLast = idx === sorted.length - 1;
              return (
                <div
                  key={f._id || f.userId || idx}
                  ref={isLast ? lastRef : null}
                  className="flex items-center gap-4 mx-4 my-2 px-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-left"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#F7C9A0]">
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-orange-50 flex items-center justify-center text-[#F75801] font-bold text-sm">
                        {initials}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-[15px]">{name}</h3>
                    {since && <p className="text-xs text-gray-400 mt-0.5">Following since {formatDate(since)}</p>}
                  </div>
                </div>
              );
            })}
            {isLoading && <div className="flex justify-center py-4"><span className="text-gray-400 text-sm">Loading more...</span></div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Followers;
