import { Radio } from "lucide-react";
import "./ExitConfirmationModal.scss";

const ExitConfirmationModal = ({ show, onStay, onExit }) => {
  if (!show) return null;

  return (
    <div className="ecm-overlay" onClick={onStay}>
      <div className="ecm-card" onClick={(e) => e.stopPropagation()}>
        <div className="ecm-icon">
          <Radio size={32} />
        </div>
        <h3 className="ecm-title">Do you want to exit live streaming?</h3>
        <p className="ecm-subtitle">
          Your audience will no longer be able to see you once you leave.
        </p>
        <div className="ecm-actions">
          <button className="ecm-btn ecm-stay" onClick={onStay}>
            Stay Live
          </button>
          <button className="ecm-btn ecm-exit" onClick={onExit}>
            End &amp; Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmationModal;
