# SwitchTabs Component

A flexible, reusable tabs component that supports both default rounded button-style tabs and custom styling.

## Features

- **Default Styling**: Beautiful rounded button-style tabs out of the box
- **Custom Styling**: Pass custom CSS module classes to completely change the UI
- **Same Functionality**: Tab switching logic remains consistent regardless of styling
- **Fully Responsive**: Works on all screen sizes

## Usage

### 1. Default Style (Rounded Buttons)

```jsx
import SwitchTabs from "../../../../components/UI/tabs/SwitchTabs";

const MyComponent = () => {
  const tabs = [
    {
      label: "Profile",
      value: "profile",
      component: ProfileTab,
    },
    {
      label: "Settings",
      value: "settings",
      component: SettingsTab,
    },
  ];

  return <SwitchTabs tabs={tabs} defaultTab="profile" />;
};
```

### 2. Custom Style (Underline Tabs)

```jsx
import SwitchTabs from "../../../../components/UI/tabs/SwitchTabs";
import styles from "./MyComponent.module.scss";

const MyComponent = () => {
  const tabs = [
    {
      label: "Transaction History",
      value: "transactions",
      component: TransactionHistory,
    },
    {
      label: "Gifts Received",
      value: "gifts",
      component: GiftsReceived,
    },
  ];

  const customTabStyles = {
    container: styles.transactionsContainer,
    buttonGroup: styles.tabsHeader,
    button: styles.tabButton,
    activeButton: styles.active,
    content: styles.tabContent,
  };

  return (
    <SwitchTabs 
      tabs={tabs} 
      defaultTab="transactions" 
      customStyles={customTabStyles}
    />
  );
};
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `tabs` | `Array` | Yes | `[]` | Array of tab objects with `label`, `value`, and `component` |
| `defaultTab` | `string` | No | First tab value | The tab value to select by default |
| `customStyles` | `Object` | No | `{}` | Custom CSS module classes object |

### customStyles Object

| Property | Description |
|----------|-------------|
| `container` | Custom class for the main container |
| `buttonGroup` | Custom class for the button group wrapper |
| `button` | Custom class for individual tab buttons |
| `activeButton` | Custom class for the active tab button |
| `content` | Custom class for the content wrapper |

## Example Custom SCSS

For underline-style tabs (like in Transactions):

```scss
.transactionsContainer {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.tabsHeader {
  display: flex;
  border-bottom: 2px solid #E5E5E5;
  margin-bottom: 24px;
}

.tabButton {
  flex: 1;
  padding: 16px 0;
  background: none;
  border: none;
  font-size: 18px;
  font-weight: 400;
  color: #9E9E9E;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    color: #1A1A1A;
  }
  
  &.active {
    color: #1A1A1A;
    font-weight: 600;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 3px;
      background-color: #1A1A1A;
    }
  }
}

.tabContent {
  width: 100%;
}
```

## Benefits

1. **Backward Compatible**: Existing implementations continue to work without changes
2. **Flexible**: Supports any custom design through CSS modules
3. **Maintainable**: Single source of truth for tab logic
4. **Type-Safe**: Clear prop structure with documentation
5. **Reusable**: Use across the entire application with different styles

## Notes

- If `customStyles` is not provided, the component uses default rounded button styling
- All custom style properties are optional - you can override only what you need
- The tab switching logic and state management remain the same regardless of styling
