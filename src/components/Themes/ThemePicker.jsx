import React, { useRef, useEffect, useMemo } from 'react';
import "@spectrum-web-components/picker/sp-picker.js";
import "@spectrum-web-components/menu/sp-menu.js";
import "@spectrum-web-components/menu/sp-menu-item.js";

const ThemePicker = React.memo(({ selectedTheme, onThemeChange }) => {
    const pickerRef = useRef(null);

    // Log when ThemePicker component renders
    React.useEffect(() => {
        console.log('🔴 [ThemePicker] Component RENDERED/MOUNTED', {
            selectedTheme,
            onThemeChange: !!onThemeChange
        });
    });

    const themeOptions = useMemo(() => [
        { label: 'Default', value: 'default' },
        { label: 'Vintage', value: 'vintage' },
        { label: 'Dark', value: 'dark' },
        { label: 'Westeros', value: 'westeros' },
        { label: 'Essos', value: 'essos' },
        { label: 'Wonderland', value: 'wonderland' },
        { label: 'Walden', value: 'walden' },
        { label: 'Chalk', value: 'chalk' },
        { label: 'Infographic', value: 'infographic' }
    ], []);

    useEffect(() => {
        const pickerElement = pickerRef.current;
        if (pickerElement) {
            // Only update if value actually changed
            if (pickerElement.value !== selectedTheme) {
                console.log('🔴 [ThemePicker] Updating picker value:', selectedTheme);
                pickerElement.value = selectedTheme;
                pickerElement.selected = selectedTheme;
            }
            
            const handleChange = (event) => {
                console.log('🔴 [ThemePicker] Picker change event:', event.target.value);
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
    );
});

ThemePicker.displayName = 'ThemePicker';

export default ThemePicker;


