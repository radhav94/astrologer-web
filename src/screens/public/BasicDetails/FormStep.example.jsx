/**
 * FormStep Component - Usage Examples
 * 
 * This file demonstrates various ways to use the FormStep component
 * in different scenarios like multi-step forms, onboarding flows, etc.
 */

import { useState } from "react";
import FormStep from "./FormStep";

// Example 1: Basic Usage (Display Only - No Click Interaction)
export const BasicUsageExample = () => {
  return (
    <div>
      <FormStep totalSteps={6} currentStep={3} />
    </div>
  );
};

// Example 2: Interactive Steps with Navigation
export const InteractiveStepsExample = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleStepChange = (step) => {
    console.log(`Navigating to step ${step}`);
    setCurrentStep(step);
  };

  return (
    <div>
      <FormStep
        totalSteps={6}
        currentStep={currentStep}
        onStepChange={handleStepChange}
      />
      <p>Current Step: {currentStep}</p>
    </div>
  );
};

// Example 3: Multi-Step Form with Validation
export const MultiStepFormExample = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const handleStepChange = (step) => {
    // Only allow navigation to completed steps or next step
    if (step <= currentStep || completedSteps.includes(step)) {
      setCurrentStep(step);
    }
  };

  const handleNext = () => {
    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    // Move to next step
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div>
      <FormStep
        totalSteps={6}
        currentStep={currentStep}
        onStepChange={handleStepChange}
      />
      <button onClick={handleNext}>Next Step</button>
    </div>
  );
};

// Example 4: Onboarding Flow (3 Steps)
export const OnboardingFlowExample = () => {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div>
      <FormStep
        totalSteps={3}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
      />
      {currentStep === 1 && <div>Welcome Screen</div>}
      {currentStep === 2 && <div>Profile Setup</div>}
      {currentStep === 3 && <div>Preferences</div>}
    </div>
  );
};

// Example 5: Registration Flow (6 Steps)
export const RegistrationFlowExample = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    "Basic Details",
    "Professional Details",
    "Education",
    "Languages",
    "Expertise",
    "Verification",
  ];

  return (
    <div>
      <FormStep
        totalSteps={6}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
      />
      <h2>{steps[currentStep - 1]}</h2>
    </div>
  );
};

// Example 6: Controlled Navigation (No Direct Step Click)
export const ControlledNavigationExample = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div>
      {/* No onStepChange prop = steps are not clickable */}
      <FormStep totalSteps={6} currentStep={currentStep} />
      <button onClick={handlePrevious} disabled={currentStep === 1}>
        Previous
      </button>
      <button onClick={handleNext} disabled={currentStep === 6}>
        Next
      </button>
    </div>
  );
};
