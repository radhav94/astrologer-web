import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentStep } from "../../../reducer/registerSlice";
import styles from "./BasicForms.module.scss";

// Step route mapping
const STEP_ROUTES = {
  1: "/basic-details",
  2: "/professional-details",
  3: "/language-speak",
  4: "/education",
  5: "/achievements",
  6: "/areaofexpertise",
};

const FormStep = ({ totalSteps = 6, currentStep = 1 }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const completedStep = useSelector((state) => state.register.currentStep);

  const handleStepClick = (stepIndex) => {
    // Only allow navigation to completed steps or current step
    if (stepIndex <= completedStep) {
      // Update Redux state
      dispatch(setCurrentStep(stepIndex));
      
      // Navigate to the corresponding route
      const route = STEP_ROUTES[stepIndex];
      if (route) {
        navigate(route);
      }
    }
  };

  const renderStep = (stepIndex) => {
    const isActive = stepIndex === currentStep;
    const isCompleted = stepIndex < completedStep;
    const isClickable = stepIndex <= completedStep && stepIndex !== currentStep;
    const isFuture = stepIndex > completedStep;

    return (
      <div
        key={stepIndex}
        className={styles.progressItem}
        onClick={() => isClickable && handleStepClick(stepIndex)}
        onKeyDown={(e) => {
          if (isClickable && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleStepClick(stepIndex);
          }
        }}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        aria-current={isActive ? "step" : undefined}
        aria-label={`Step ${stepIndex} of ${totalSteps}${isCompleted ? " (completed)" : ""}${isFuture ? " (locked)" : ""}`}
        style={{ 
          cursor: isClickable ? "pointer" : isFuture ? "not-allowed" : "default",
          opacity: isFuture ? 0.5 : 1,
        }}
      >
        {/* Show line before dot (except for first step) */}
        {stepIndex > 1 && <div className={styles.progressLine}></div>}

        {/* Render dot based on state */}
        {isActive ? (
          <span className={styles.progressDotActive}>
            <span className={styles.progressDotInner}></span>
          </span>
        ) : isCompleted ? (
          <span className={styles.progressDotCompleted}></span>
        ) : (
          <span className={styles.progressDot}></span>
        )}
      </div>
    );
  };

  return (
    <div className={styles.progressWrapper}>
      {Array.from({ length: totalSteps }, (_, index) => index + 1).map(
        (stepIndex) => renderStep(stepIndex)
      )}
    </div>
  );
};

export default FormStep;
