# FormStep Component

A reusable, scalable, and dynamic progress indicator component for multi-step forms, onboarding flows, and profile setup processes.

## Features

- ✅ **Fully Reusable**: Works with any number of steps
- ✅ **Dynamic**: No hardcoded step counts
- ✅ **Interactive**: Optional clickable steps with keyboard support
- ✅ **Accessible**: Includes ARIA attributes and keyboard navigation
- ✅ **Visual States**: Active, completed, and inactive step styling
- ✅ **Responsive**: Works on mobile and desktop

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `totalSteps` | `number` | `6` | No | Total number of steps in the flow |
| `currentStep` | `number` | `1` | No | Currently active step (1-indexed) |
| `onStepChange` | `function` | `undefined` | No | Callback when a step is clicked. If not provided, steps are not clickable |

## Usage

### Basic Usage (Display Only)

```jsx
import FormStep from "./FormStep";

function MyForm() {
  return (
    <FormStep totalSteps={6} currentStep={3} />
  );
}
```

### Interactive Steps with Navigation

```jsx
import { useState } from "react";
import FormStep from "./FormStep";

function MyForm() {
  const [currentStep, setCurrentStep] = useState(1);

  const handleStepChange = (step) => {
    setCurrentStep(step);
  };

  return (
    <FormStep
      totalSteps={6}
      currentStep={currentStep}
      onStepChange={handleStepChange}
    />
  );
}
```

### Multi-Step Form with Validation

```jsx
import { useState } from "react";
import FormStep from "./FormStep";

function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1);

  const handleStepChange = (step) => {
    // Add validation logic here
    if (step <= currentStep) {
      // Allow going back to previous steps
      setCurrentStep(step);
    }
  };

  return (
    <div>
      <FormStep
        totalSteps={6}
        currentStep={currentStep}
        onStepChange={handleStepChange}
      />
      {/* Your form content */}
    </div>
  );
}
```

### Onboarding Flow (3 Steps)

```jsx
import FormStep from "./FormStep";

function Onboarding() {
  const [step, setStep] = useState(1);

  return (
    <FormStep
      totalSteps={3}
      currentStep={step}
      onStepChange={setStep}
    />
  );
}
```

## Visual States

### Active Step
- Larger dot with border
- Inner filled circle
- Highlighted color (#E64900)

### Completed Step
- Filled dot
- Orange color (#E64900)
- Indicates user has passed this step

### Inactive Step
- Gray dot (#9ca3af)
- Default state for upcoming steps

## Accessibility

The component includes:

- `role="button"` for clickable steps
- `tabIndex={0}` for keyboard navigation
- `aria-current="step"` for active step
- `aria-label` describing step position
- Keyboard support (Enter and Space keys)

## Styling

Styles are defined in `BasicForms.module.scss`:

- `.progressWrapper` - Container for all steps
- `.progressItem` - Individual step container
- `.progressDotActive` - Active step styling
- `.progressDotInner` - Inner circle of active step
- `.progressDotCompleted` - Completed step styling
- `.progressDot` - Inactive step styling
- `.progressLine` - Connector line between steps

## Examples

See `FormStep.example.jsx` for comprehensive usage examples including:

1. Basic usage (display only)
2. Interactive steps with navigation
3. Multi-step form with validation
4. Onboarding flow
5. Registration flow
6. Controlled navigation

## Integration with Existing Forms

### BasicDetails.jsx

```jsx
import FormStep from "./FormStep";

function BasicDetails() {
  return (
    <div>
      <FormStep totalSteps={6} currentStep={1} />
      {/* Rest of your form */}
    </div>
  );
}
```

### ProfessionalDetails.jsx

```jsx
import FormStep from "./FormStep";

function ProfessionalDetails() {
  return (
    <div>
      <FormStep totalSteps={6} currentStep={2} />
      {/* Rest of your form */}
    </div>
  );
}
```

## Best Practices

1. **Step Indexing**: Steps are 1-indexed (1, 2, 3...), not 0-indexed
2. **Validation**: Implement validation logic in `onStepChange` callback
3. **Navigation Control**: Omit `onStepChange` prop to disable step clicking
4. **Completed Steps**: Track completed steps separately if needed
5. **Responsive Design**: Component is responsive by default

## Migration from Old Implementation

### Before (Hardcoded)

```jsx
<div className={styles.progressWrapper}>
  <div className={styles.progressItem}>
    <span className={styles.progressDotActive}>
      <span className={styles.progressDotInner}></span>
    </span>
  </div>
  {[...Array(5)].map((_, index) => (
    <div key={index} className={styles.progressItem}>
      <div className={styles.progressLine}></div>
      <span className={styles.progressDot}></span>
    </div>
  ))}
</div>
```

### After (Reusable)

```jsx
<FormStep totalSteps={6} currentStep={1} />
```

## Notes

- The component automatically handles line rendering between steps
- First step doesn't have a line before it
- Cursor changes to pointer when steps are clickable
- Component is fully controlled - parent manages state
