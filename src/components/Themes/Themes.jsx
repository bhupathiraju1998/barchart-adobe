import React, { useRef, useEffect, useMemo } from 'react';
import "@spectrum-web-components/picker/sp-picker.js";
import "@spectrum-web-components/menu/sp-menu.js";
import "@spectrum-web-components/menu/sp-menu-item.js";
import './Themes.css';

const Themes = React.memo(({ selectedTheme = 'light', onThemeChange }) => {
    const pickerRef = useRef(null);

    // Log when Themes component renders
    

    const themeOptions = useMemo(() => [
        { label: 'Light Theme', value: 'light' },
        { label: 'Dark Theme', value: 'dark' },
        { label: 'Colorful Theme', value: 'colorful' },
        { label: 'Minimal Theme', value: 'minimal' },
        { label: 'Professional Theme', value: 'professional' }
    ], []);

    useEffect(() => {
        const pickerElement = pickerRef.current;
        if (pickerElement) {
            // Only update if value actually changed
            if (pickerElement.value !== selectedTheme) {
                pickerElement.value = selectedTheme;
                pickerElement.selected = selectedTheme;
            }
            
            const handleChange = (event) => {
                if (onThemeChange) {
                    onThemeChange(event.target.value);
                }
            };
            pickerElement.addEventListener('change', handleChange);
            return () => {
                pickerElement.removeEventListener('change', handleChange);
            };
        }
    }, [selectedTheme, onThemeChange]);

    return (
        <div className="themes-container">
            <sp-picker 
                ref={pickerRef}
                label="Select Theme"
                value={selectedTheme}
                className="theme-picker"
            >
                {themeOptions.map((option) => (
                    <sp-menu-item key={option.value} value={option.value}>
                        {option.label}
                    </sp-menu-item>
                ))}
            </sp-picker>
        </div>
    );
});

Themes.displayName = 'Themes';

export default Themes;
