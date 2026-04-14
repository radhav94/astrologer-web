import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Icons } from "../../../components/Icons";
import { Play, Calendar, Clock } from "lucide-react";
import { useGetChatHistoryQuery } from "../../../redux/activity/chatApi";
import { useGetCallRecordingsQuery } from "../../../redux/oderHistory/orderHistory";
import { AppDefaultImg } from "../../../utils/appImages";
import VoiceMessage from "../chat/voiceChat/VoiceMessage";
import dayjs from "dayjs";
import styles from "./OrderDetails.module.scss";

const TABS = ["Call", "Chat", "Video", "Remedies"];

const fmtTime = (iso) => (iso ? dayjs(iso).format("hh:mm A") : "");
const fmtDate = (iso) => (iso ? dayjs(iso).format("DD MMM YYYY") : "");
const fmtDuration = (val) => {
  if (!val && val !== 0) return "0 Min 0 Secs";
  const totalSec = Math.round(val * 60);
  return `${Math.floor(totalSec / 60)} Min ${totalSec % 60} Secs`;
};

/* ===== Call Recording Card ===== */
const CallCard = ({ rec }) => {
  const mediaRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const m = mediaRef.current;
    if (!m || !rec.recordingUrl) return;
    m.src = rec.recordingUrl;
    const onTime = () => { if (m.duration && isFinite(m.duration)) setProgress((m.currentTime / m.duration) * 100); };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnd = () => { setIsPlaying(false); setProgress(0); };
    m.addEventListener("timeupdate", onTime);
    m.addEventListener("play", onPlay);
    m.addEventListener("pause", onPause);
    m.addEventListener("ended", onEnd);
    return () => { m.removeEventListener("timeupdate", onTime); m.removeEventListener("play", onPlay); m.removeEventListener("pause", onPause); m.removeEventListener("ended", onEnd); };
  }, [rec.recordingUrl]);

  const toggle = () => {
    const m = mediaRef.current;
    if (!m || !rec.recordingUrl) return;
    isPlaying ? m.pause() : m.play().catch(() => {});
  };

  return (
    <div className={styles.infoCard}>
      <div className={styles.cardWrapper}>
        {rec.orderId && (
          <div className={styles.cardHeader}>
            <h3 className={styles.orderId}>#{String(rec.orderId || rec.sessionId).slice(-4)}</h3>
          </div>
        )}
        <div className={styles.cardContent} onClick={toggle} role="button">
          <div className={styles.waveformIcon}>
            {isPlaying ? (
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="3" height="20" x="4" y="10" fill="#111827" rx="1.5"><animate attributeName="height" values="20;30;20" dur="1s" repeatCount="indefinite"/><animate attributeName="y" values="10;5;10" dur="1s" repeatCount="indefinite"/></rect>
                <rect width="3" height="28" x="11" y="6" fill="#111827" rx="1.5"><animate attributeName="height" values="28;18;28" dur="1s" repeatCount="indefinite" begin="0.2s"/><animate attributeName="y" values="6;11;6" dur="1s" repeatCount="indefinite" begin="0.2s"/></rect>
                <rect width="3" height="24" x="18" y="8" fill="#111827" rx="1.5"><animate attributeName="height" values="24;32;24" dur="1s" repeatCount="indefinite" begin="0.4s"/><animate attributeName="y" values="8;4;8" dur="1s" repeatCount="indefinite" begin="0.4s"/></rect>
                <rect width="3" height="20" x="25" y="10" fill="#111827" rx="1.5"><animate attributeName="height" values="20;28;20" dur="1s" repeatCount="indefinite" begin="0.15s"/><animate attributeName="y" values="10;6;10" dur="1s" repeatCount="indefinite" begin="0.15s"/></rect>
                <rect width="3" height="26" x="32" y="7" fill="#111827" rx="1.5"><animate attributeName="height" values="26;16;26" dur="1s" repeatCount="indefinite" begin="0.35s"/><animate attributeName="y" values="7;12;7" dur="1s" repeatCount="indefinite" begin="0.35s"/></rect>
              </svg>
            ) : (
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="20" fill="#fff" stroke="#F97316" strokeWidth="2"/>
                <polygon points="18,14 32,22 18,30" fill="#F97316"/>
              </svg>
            )}
          </div>
          <div className={styles.infoSection}>
            <p className={styles.detailRow}><span>{fmtDate(rec.sessionDate || rec.createdAt)}</span><span className={styles.sep}>•</span><span>{fmtTime(rec.sessionDate || rec.createdAt)}</span></p>
            <p className={styles.detailRow}><span>Duration : {fmtDuration(rec.duration)}</span></p>
            <p className={styles.amount}>₹{rec.amount || 0}</p>
          </div>
        </div>
        <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${progress}%` }} /></div>
        <audio ref={mediaRef} preload="auto" style={{ display: "none" }} />
        {!rec.recordingUrl && <p className={styles.noRec}>No recording available</p>}
      </div>
    </div>
  );
};

/* ===== Video Recording Card ===== */
const VideoCard = ({ rec, userName, userImage }) => {
  const videoRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!showModal || !rec.recordingUrl || !videoRef.current) return;
    videoRef.current.src = rec.recordingUrl;
    videoRef.current.play().catch(() => {});
    return () => { if (videoRef.current) { videoRef.current.pause(); videoRef.current.src = ""; } };
  }, [showModal, rec.recordingUrl]);

  return (
    <div className={styles.infoCard}>
      <div className={styles.cardWrapper}>
        <div className={styles.cardContent} onClick={() => rec.recordingUrl && setShowModal(true)} role="button">
          <img src={userImage || AppDefaultImg.DefaultMaleAstrologer} alt={userName} className={styles.astroImage} onError={(e) => { e.target.src = AppDefaultImg.DefaultMaleAstrologer; }} />
          <div className={styles.infoSection}>
            <h3 className={styles.astroName}>{userName || "User"}</h3>
            <p className={styles.detailRow}>
              <Calendar size={14} color="#F97316" /><span>{fmtDate(rec.sessionDate || rec.createdAt)}</span>
              <Clock size={14} color="#F97316" /><span>{fmtTime(rec.sessionDate || rec.createdAt)}</span>
            </p>
            <p className={styles.detailRow}><span>Duration : {fmtDuration(rec.duration)}</span></p>
            <p className={styles.amount}>₹{rec.amount || 0}</p>
          </div>
          <div className={styles.typeIcon}><Icons.Video size={22} color="#F97316" /></div>
        </div>
        {!rec.recordingUrl && <p className={styles.noRec}>No recording available</p>}
      </div>
      {showModal && rec.recordingUrl && (
        <div className={styles.videoOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.videoModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowModal(false)}><Icons.X size={24} color="#fff" /></button>
            <video ref={videoRef} className={styles.videoPlayer} controls autoPlay playsInline />
          </div>
        </div>
      )}
    </div>
  );
};

/* ===== Chat Session ===== */
const ChatSession = ({ messages, roomId, date }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [kundliModal, setKundliModal] = useState(null);
  const sessionDate = date ? dayjs(date).format("MMM DD, YYYY") : "";
  const sessionTime = date ? dayjs(date).format("hh:mm A") : "";

  const renderMsg = (msg) => {
    const c = msg.message;
    switch (msg.type) {
      case "image":
        return <div className={styles.imageMsg}><img src={c} alt="Shared" className={styles.msgImage} onClick={() => setImagePreview(c)} loading="lazy" /></div>;
      case "video":
        return <div className={styles.videoMsg}><video src={c} controls preload="metadata" className={styles.msgVideo} /></div>;
      case "audio":
        return <VoiceMessage url={c} sender={msg.sender === "astrologer"} />;
      case "attachment":
        return <a href={c} target="_blank" rel="noopener noreferrer" className={styles.attachmentLink}>📎 {c?.split("/").pop() || "Download"}</a>;
      case "kundli":
        return <button type="button" onClick={() => msg.kundliId && setKundliModal(`${window.location.origin}/kundli/${msg.kundliId}`)} className={styles.kundliLink}>🪐 {msg.kundliName ? `${msg.kundliName}'s Kundli` : "View Kundli"}</button>;
      case "gift": {
        let gd = null;
        let gt = "Gift received";
        try { const p = typeof c === "string" ? JSON.parse(c) : c; gd = p?.giftData || p; gt = p?.text || gt; } catch { gd = msg.giftData || null; }
        if (!gd && msg.giftData) gd = msg.giftData;
        return (
          <div className="flex flex-col gap-3 min-w-[250px]">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <span style={{ color: "#f75801", fontSize: 18 }}>🎁</span>
              <span className="text-xs font-semibold text-gray-600 uppercase">Gift Received</span>
            </div>
            {gt && <p className="text-sm text-gray-700 italic p-3 rounded-lg border-l-4" style={{ borderLeftColor: "#f75801", background: "linear-gradient(to right, #fff7ed, #fef3c7)" }}>"{gt}"</p>}
            {gd && (
              <div className="flex items-center gap-3">
                {gd.giftImg && <img src={gd.giftImg} alt={gd.giftName || "Gift"} className="w-20 h-20 object-contain rounded-lg bg-white p-2 border border-gray-100" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }} onError={(e) => { e.target.style.display = "none"; }} />}
                <div className="flex flex-col flex-1">
                  <span className="font-bold text-lg text-gray-900">{gd.giftName || "Gift"}</span>
                  {gd.price != null && <span className="text-base font-semibold" style={{ color: "#f75801" }}>₹{Number(gd.price).toLocaleString("en-IN")}</span>}
                </div>
              </div>
            )}
          </div>
        );
      }
      case "products": {
        const prods = msg.suggestedProducts || [];
        if (!prods.length) return <p className={styles.messageText}>{c || "Suggested products"}</p>;
        return (
          <div className={styles.productsMsg}>
            {c && <p className={styles.productsNote}>"{c}"</p>}
            {prods.map((p, i) => {
              const img = p.variantImage || p.image || p.images?.[0];
              const price = p.variantPrice ?? p.price;
              const mrp = p.variantMrp ?? p.mrp;
              return (
                <div key={p.variantId || p.productId || i} className={styles.productMsgCard}>
                  {img && <img src={img} alt={p.title} className={styles.productMsgImg} onError={(e) => { e.target.style.display = "none"; }} />}
                  <div className={styles.productMsgInfo}>
                    <span className={styles.productMsgTitle}>{p.title}</span>
                    {p.variantTitle && <span className={styles.productMsgVariant}>{p.variantTitle}</span>}
                    {price != null && <span className={styles.productMsgPrice}>₹{Number(price).toLocaleString("en-IN")}{mrp && mrp > price && <s className={styles.mrp}> ₹{Number(mrp).toLocaleString("en-IN")}</s>}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
      default: {
        // Detect voice messages stored as JSON (e.g. {"audioUrl": "...", "duration": 30})
        if (typeof c === "string" && !msg.type) {
          try {
            const parsed = JSON.parse(c);
            if (parsed && typeof parsed === "object" && parsed.audioUrl) {
              return <VoiceMessage url={parsed.audioUrl} duration={parsed.duration} sender={msg.sender === "astrologer"} />;
            }
          } catch {
            // Not JSON, render as text
          }
        }
        return <p className={styles.messageText}>{c}</p>;
      }
    }
  };

  return (
    <div className={styles.chatSession}>
      <div className={styles.sessionHeader}>
        <h3 className={styles.sessionId}>#{roomId?.slice(-4)}</h3>
        <div className={styles.divider} />
        <p className={styles.sessionDateTime}>{sessionDate} • {sessionTime}</p>
      </div>
      <div className={styles.messagesContainer}>
        {messages.map((msg) => {
          const isSender = msg.sender === "astrologer";
          return isSender ? (
            <div key={msg._id} className={styles.sentWrapper}>
              <div className={styles.sentBubble}>{renderMsg(msg)}</div>
              <div className={styles.msgMeta}><span className={styles.time}>{fmtTime(msg.createdAt)}</span></div>
            </div>
          ) : (
            <div key={msg._id} className={styles.receivedWrapper}>
              <div className={styles.receivedBubble}>{renderMsg(msg)}</div>
              <span className={styles.receivedTime}>{fmtTime(msg.createdAt)}</span>
            </div>
          );
        })}
      </div>
      {imagePreview && <div className={styles.imagePreviewOverlay} onClick={() => setImagePreview(null)}><img src={imagePreview} alt="Preview" className={styles.imagePreviewFull} /></div>}
      {kundliModal && (
        <div className={styles.videoOverlay} onClick={() => setKundliModal(null)}>
          <div className={styles.videoModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setKundliModal(null)}><Icons.X size={24} color="#fff" /></button>
            <iframe src={kundliModal} title="Kundli" style={{ width: "100%", height: "100%", border: "none" }} />
          </div>
        </div>
      )}
    </div>
  );
};

/* ===== Remedies Tab ===== */
const RemediesTab = ({ chatData }) => {
  const msgs = chatData?.data || [];
  const entries = msgs.filter((m) => m?.type === "products" && m?.suggestedProducts?.length > 0);
  if (!entries.length) return <EmptyState text="No remedies suggested yet" />;
  return (
    <div className={styles.remediesList}>
      {entries.map((entry, idx) => (
        <div key={entry._id || idx} className={styles.remedyCard}>
          {entry.message && <p className={styles.remedyNote}>"{entry.message}"</p>}
          <span className={styles.remedyDate}>{dayjs(entry.createdAt).format("DD MMM YYYY, hh:mm A")}</span>
          <div className={styles.productList}>
            {(entry.suggestedProducts || []).map((p, i) => {
              const img = p.variantImage || p.image || p.images?.[0];
              const brand = typeof p.brand === "object" ? p.brand?.name : p.brand;
              const price = p.variantPrice ?? p.price;
              const mrp = p.variantMrp ?? p.mrp;
              const disc = mrp && price != null && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
              return (
                <div key={p.variantId || p.productId || p._id || i} className={styles.productCard}>
                  {img && <div className={styles.productImageWrap}><img src={img} alt={p.title || "Product"} className={styles.productImage} onError={(e) => { e.target.style.display = "none"; }} /></div>}
                  <div className={styles.productInfo}>
                    <h4 className={styles.productTitle}>{p.title || "Suggested Product"}</h4>
                    {p.variantTitle && <span className={styles.productVariant}>{p.variantTitle}</span>}
                    {brand && <span className={styles.productBrand}>{brand}</span>}
                    {p.short_description && <p className={styles.productDesc}>{p.short_description}</p>}
                    {price != null && (
                      <div className={styles.priceRow}>
                        <span className={styles.price}>₹{Number(price).toLocaleString("en-IN")}</span>
                        {mrp && mrp > price && <s className={styles.mrpStrike}>₹{Number(mrp).toLocaleString("en-IN")}</s>}
                        {disc > 0 && <span className={styles.discount}>{disc}% off</span>}
                      </div>
                    )}
                    {p.category?.length > 0 && <div className={styles.categories}>{p.category.map((cat) => <span key={cat.ID || cat._id} className={styles.categoryTag}>{cat.name}</span>)}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const EmptyState = ({ text }) => (
  <div className={styles.emptyState}><Icons.FileText size={40} /><p>{text}</p></div>
);

/* ===== Main Component ===== */
const OrderDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { userName, profileImage } = location.state || {};
  const [activeTab, setActiveTab] = useState(location.state?.tab || "Call");
  const tabsRef = useRef(null);

  const { data: chatData, isLoading: chatLoading } = useGetChatHistoryQuery(
    { userId }, { skip: !userId, refetchOnMountOrArgChange: true }
  );
  const { data: recordingsData, isLoading: recLoading } = useGetCallRecordingsQuery(
    userId, { skip: !userId }
  );

  const { callRecordings, videoRecordings } = useMemo(() => {
    const list = recordingsData?.data || [];
    const calls = [], videos = [];
    list.forEach((r) => (r.sessionType === "video" ? videos : calls).push(r));
    return { callRecordings: calls, videoRecordings: videos };
  }, [recordingsData]);

  const chatSessions = useMemo(() => {
    const msgs = chatData?.data || [];
    if (!Array.isArray(msgs) || !msgs.length) return [];
    const grouped = {};
    msgs.forEach((m) => { const rid = m.roomId || "unknown"; if (!grouped[rid]) grouped[rid] = []; grouped[rid].push(m); });
    return Object.entries(grouped)
      .map(([rid, ms]) => ({ roomId: rid, messages: ms.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)), date: ms[0]?.createdAt }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [chatData]);

  const isLoading = activeTab === "Chat" || activeTab === "Remedies" ? chatLoading : recLoading;

  const getInitials = (name) => {
    if (!name) return "A";
    const parts = name.trim().split(" ");
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name[0].toUpperCase();
  };

  const renderContent = () => {
    if (isLoading) return <div className={styles.loadingState}><div className={styles.spinner} /><p>Loading...</p></div>;
    switch (activeTab) {
      case "Call":
        if (!callRecordings.length) return <EmptyState text="No call recordings found" />;
        return <div className={styles.recordingsList}>{callRecordings.map((r) => <CallCard key={r.sessionId || r._id} rec={r} />)}</div>;
      case "Chat":
        if (!chatSessions.length) return <EmptyState text="No chat history found" />;
        return <div className={styles.chatWindow}>{chatSessions.map((s) => <ChatSession key={s.roomId} messages={s.messages} roomId={s.roomId} date={s.date} />)}</div>;
      case "Video":
        if (!videoRecordings.length) return <EmptyState text="No video recordings found" />;
        return <div className={styles.recordingsList}>{videoRecordings.map((r) => <VideoCard key={r.sessionId || r._id} rec={r} userName={userName} userImage={profileImage} />)}</div>;
      case "Remedies":
        return <RemediesTab chatData={chatData} />;
      default: return null;
    }
  };

  return (
    <div className={styles.orderDetails}>
      {/* Header */}
      <div className={styles.orderHeader}>
        <button className={styles.backButton} onClick={() => navigate(-1)} aria-label="Go back">
          <Icons.ChevronLeft size={24} />
        </button>
        <div className={styles.astrologerInfo}>
          <div className={styles.avatarContainer}>
            {profileImage ? (
              <img src={profileImage} alt={userName} className={styles.avatar} onError={(e) => { e.target.style.display = "none"; e.target.nextSibling && (e.target.nextSibling.style.display = "flex"); }} />
            ) : null}
            <div className={styles.avatarFallback} style={profileImage ? { display: "none" } : {}}>{getInitials(userName)}</div>
          </div>
          <div className={styles.details}>
            <h2 className={styles.name}>{userName || "User"}</h2>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabsWrapper} ref={tabsRef}>
          {TABS.map((tab) => (
            <button key={tab} className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={styles.tabContent}>{renderContent()}</div>
    </div>
  );
};

export default OrderDetails;
