import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import "@spectrum-web-components/tabs/sp-tabs.js";
import "@spectrum-web-components/tabs/sp-tab.js";
import "@spectrum-web-components/tabs/sp-tab-panel.js";
import Charts from '../Charts/Charts';
import Themes from '../Themes/Themes';
import './Tabs.css';

const Tabs = ({ sandboxProxy }) => {
    const [selectedTab, setSelectedTab] = useState('charts');
    const [selectedTheme, setSelectedTheme] = useState('light');
    const tabsRef = useRef(null);

    // Log when Tabs component renders
    

    useEffect(() => {
        const tabsElement = tabsRef.current;
        if (tabsElement) {
            // Sync React state with Spectrum component state on mount
            if (tabsElement.selected !== selectedTab) {
                tabsElement.selected = selectedTab;
            }
            
            const handleChange = (event) => {
                const newTab = event.target.selected;
                // Only update if it's actually different, not undefined, and is a valid tab value
                if (newTab && newTab !== selectedTab && (newTab === 'charts' || newTab === 'themes')) {
                    setSelectedTab(newTab);
                } else if (!newTab || (newTab !== 'charts' && newTab !== 'themes')) {
                    // Restore the valid selectedTab value
                    if (tabsElement.selected !== selectedTab) {
                        tabsElement.selected = selectedTab;
                    }
                }
            };
            tabsElement.addEventListener('change', handleChange);
            return () => {
                tabsElement.removeEventListener('change', handleChange);
            };
        }
    }, [selectedTab]);

    // Sync selectedTab prop to sp-tabs element when it changes
    useEffect(() => {
        const tabsElement = tabsRef.current;
        if (tabsElement && tabsElement.selected !== selectedTab) {
            tabsElement.selected = selectedTab;
        }
    }, [selectedTab]);

    const handleThemeChange = useCallback((theme) => {
        setSelectedTheme(theme);
    }, []);

    // Memoize Charts component props to prevent unnecessary re-renders
    const chartsProps = useMemo(() => ({
        sandboxProxy,
        selectedTheme
    }), [sandboxProxy, selectedTheme]);

    // Memoize Themes component props
    const themesProps = useMemo(() => ({
        selectedTheme,
        onThemeChange: handleThemeChange
    }), [selectedTheme, handleThemeChange]);

    // Memoize tab panel content to prevent re-renders
    const chartsPanelContent = useMemo(() => (
        <div className="tab-panel-content">
            <Charts {...chartsProps} />
        </div>
    ), [chartsProps]);

    const themesPanelContent = useMemo(() => (
        <div className="tab-panel-content">
            <Themes {...themesProps} />
        </div>
    ), [themesProps]);

    return (
        <div className="tabs-container">
            <sp-tabs 
                ref={tabsRef}
                selected={selectedTab} 
                className="custom-tabs"
            >
                <sp-tab label="Charts" value="charts"></sp-tab>
                <sp-tab label="Themes" value="themes"></sp-tab>
                <sp-tab-panel value="charts" key="charts-panel">
                    {chartsPanelContent}
                </sp-tab-panel>
                <sp-tab-panel value="themes" key="themes-panel">
                    {themesPanelContent}
                </sp-tab-panel>
            </sp-tabs>
        </div>
    );
};

// Don't memoize Tabs - it needs to re-render when selectedTheme changes
// But we'll prevent unnecessary re-renders through other optimizations
export default Tabs;

