// src/components/common/SwitchTabs.jsx
import { useState, useEffect } from "react";
import styles from "./Switchtabs.module.scss";

/**
 * Reusable SwitchTabs Component
 * @param {Array} tabs - Array of { label: string, value: string, component: ReactNode }
 * @param {string} defaultTab - (optional) The tab value to select by default
 * @param {Object} customStyles - (optional) Custom CSS module classes object
 *   - container: Custom class for the main container
 *   - buttonGroup: Custom class for the button group wrapper
 *   - button: Custom class for individual tab buttons
 *   - activeButton: Custom class for the active tab button
 *   - content: Custom class for the content wrapper
 */
const SwitchTabs = ({ tabs = [], defaultTab, customStyles = {} }) => {
  // Determine initial tab: use defaultTab if valid, otherwise first tab
  const getInitialTab = () => {
    if (defaultTab && tabs.some(tab => tab.value === defaultTab)) {
      return defaultTab;
    }
    return tabs[0]?.value || null;
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Update active tab if defaultTab changes or tabs change
  useEffect(() => {
    const newTab = getInitialTab();
    if (newTab && newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [defaultTab, tabs]);

  const handleSelect = (value) => {
    setActiveTab(value);
  };

  const ActiveComponent = tabs.find(
    (tab) => tab.value === activeTab
  )?.component;

  // Use custom styles if provided, otherwise use default styles
  const containerClass = customStyles.container || styles.switchTabsContainer;
  const buttonGroupClass = customStyles.buttonGroup || styles.buttonGroup;
  const buttonClass = customStyles.button || styles.toggleButton;
  const activeButtonClass = customStyles.activeButton || styles.active;
  const contentClass = customStyles.content || styles.tabContent;

  return (
    <div className={containerClass}>
      {/* Buttons */}
      <div className={buttonGroupClass}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={`${buttonClass} ${
              activeTab === tab.value ? activeButtonClass : ""
            }`}
            onClick={() => handleSelect(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className={contentClass}>
        {ActiveComponent ? <ActiveComponent /> : <p>No content found</p>}
      </div>
    </div>
  );
};

export default SwitchTabs;
