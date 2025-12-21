import React, { useRef, useEffect, useMemo } from 'react';
import "@spectrum-web-components/picker/sp-picker.js";
import "@spectrum-web-components/menu/sp-menu.js";
import "@spectrum-web-components/menu/sp-menu-item.js";

const ChartPicker = React.memo(({ selectedChart, onChartChange }) => {
    const pickerRef = useRef(null);

    // Log when ChartPicker component renders
    React.useEffect(() => {
        console.log('🟡 [ChartPicker] Component RENDERED/MOUNTED', {
            selectedChart,
            onChartChange: !!onChartChange
        });
    });

    const chartOptions = useMemo(() => [
        { label: 'Bar Chart', value: 'bar' },
        { label: 'Line Chart', value: 'line' },
        { label: 'Pie Chart', value: 'pie' },
        { label: 'Area Chart', value: 'area' },
        { label: 'Scatter Chart', value: 'scatter' },
        { label: 'Radar Chart', value: 'radar' },
        { label: 'Pie Chart (Nightingale)', value: 'pie-nightingale' },
        { label: 'Funnel Chart', value: 'funnel' },
        { label: 'Mixed Chart', value: 'mixed' }
    ], []);

    useEffect(() => {
        const pickerElement = pickerRef.current;
        if (pickerElement) {
            // Only update if value actually changed
            if (pickerElement.value !== selectedChart) {
                console.log('🟡 [ChartPicker] Updating picker value:', selectedChart);
                pickerElement.value = selectedChart;
                pickerElement.selected = selectedChart;
            }
            
            const handleChange = (event) => {
                console.log('🟡 [ChartPicker] Picker change event:', event.target.value);
                if (onChartChange) {
                    onChartChange(event.target.value);
                }
            };
            pickerElement.addEventListener('change', handleChange);
            return () => {
                pickerElement.removeEventListener('change', handleChange);
            };
        }
    }, [selectedChart, onChartChange]);

    return (
        <sp-picker 
            ref={pickerRef}
            label="Select Chart Type"
            value={selectedChart}
            className="chart-picker"
        >
            {chartOptions.map((option, index) => {
                if (option.type === 'divider') {
                    return (
                        <sp-menu-item 
                            key={`divider-${index}`} 
                            disabled
                            className="menu-divider"
                        >
                        </sp-menu-item>
                    );
                }
                return (
                    <sp-menu-item key={option.value} value={option.value}>
                        {option.label}
                    </sp-menu-item>
                );
            })}
        </sp-picker>
    );
});

ChartPicker.displayName = 'ChartPicker';

export default ChartPicker;

