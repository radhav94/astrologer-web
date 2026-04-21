import { useState, useEffect, useCallback, memo } from "react";
import { IoClose } from "react-icons/io5";
import { GrReactjs } from "react-icons/gr";
import { voiceSocket } from "../../services/appServices/voiceSocketServices";
import IframeModal from "../../screens/private/chat/IframeModal";
import "./KundliPopup.scss";

/**
 * Individual kundli list item — memoised to avoid re-renders
 * when sibling items change or popup re-renders.
 */
const KundliItem = memo(({ kundliId, kundliName, onView }) => (
  <div className="kp-item" onClick={() => onView(kundliId)}>
    <div className="kp-item-icon">
      <GrReactjs size={22} />
    </div>
    <div className="kp-item-info">
      <p className="kp-item-name">
        {kundliName ? `${kundliName}'s Kundli` : "View Kundli"}
      </p>
      <p className="kp-item-action">Tap to view →</p>
    </div>
  </div>
));

/**
 * KundliPopup — centered modal that collects kundli entries
 * from real-time socket messages during the current session.
 *
 * Props:
 *  - isOpen      : boolean — controls visibility
 *  - onClose     : () => void
 *  - activeCall  : object — current call data (needs chatRoomId / roomId)
 */
const KundliPopup = ({ isOpen, onClose, activeCall }) => {
  const [iframeSrc, setIframeSrc] = useState(null);
  const [kundliList, setKundliList] = useState([]);

  const chatRoomId = activeCall?.chatRoomId || activeCall?.roomId;

  // Collect kundli messages arriving via socket during the active call
  useEffect(() => {
    if (!chatRoomId) return;

    const handleMessage = (data) => {
      if (data?.type !== "kundli" || !data?.kundliId) return;

      setKundliList((prev) => {
        if (prev.some((k) => k.kundliId === data.kundliId)) return prev;
        return [...prev, {
          kundliId: data.kundliId,
          kundliName: data.kundliName || "",
        }];
      });
    };

    voiceSocket.on("message:recieved", handleMessage);
    return () => voiceSocket.off("message:recieved", handleMessage);
  }, [chatRoomId]);

  // Reset list when call ends
  useEffect(() => {
    if (!activeCall) setKundliList([]);
  }, [activeCall]);

  const handleView = useCallback((id) => {
    setIframeSrc(`${window.location.origin}/kundli/${id}`);
  }, []);

  const handleCloseIframe = useCallback(() => setIframeSrc(null), []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="kp-overlay" onClick={onClose}>
        <div className="kp-card" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="kp-header">
            <h3 className="kp-title">Kundli</h3>
            <button className="kp-close-btn" onClick={onClose} aria-label="Close">
              <IoClose size={22} />
            </button>
          </div>

          {/* Content */}
          <div className="kp-content">
            {kundliList.length === 0 ? (
              <div className="kp-empty">No kundli available for this session</div>
            ) : (
              <div className="kp-list">
                {kundliList.map((k) => (
                  <KundliItem
                    key={k.kundliId}
                    kundliId={k.kundliId}
                    kundliName={k.kundliName}
                    onView={handleView}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kundli iframe viewer */}
      <IframeModal open={!!iframeSrc} src={iframeSrc} onClose={handleCloseIframe} />
    </>
  );
};

export default memo(KundliPopup);
