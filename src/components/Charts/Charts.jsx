import React, { useState, useRef, useCallback } from 'react';
import ChartPicker from './ChartPicker';
import ChartPreview from './ChartPreview';
import ChartActions from './ChartActions';
import { themeColors } from './ChartOptionGenerator';
import './Charts.css';

const Charts = React.memo(({ sandboxProxy, selectedTheme = 'light' }) => {
    const [selectedChart, setSelectedChart] = useState('bar');
    const [isAdding, setIsAdding] = useState(false);
    const chartRef = useRef(null);

    // Log when Charts component renders
    React.useEffect(() => {
        console.log('🟢 [Charts] Component RENDERED/MOUNTED', {
            selectedChart,
            selectedTheme,
            sandboxProxy: !!sandboxProxy,
            isAdding
        });
    });

    const handleChartRef = useCallback((ref) => {
        if (ref && ref.current) {
            chartRef.current = ref.current;
        }
    }, []);

    const handleChartChange = useCallback((value) => {
        console.log('🟢 [Charts] Chart change requested:', value);
        setSelectedChart(value);
    }, []);

    const handleAddToPage = useCallback(async () => {
        if (!sandboxProxy) {
            alert("Please wait for the add-on to initialize.");
            return;
        }

        if (!chartRef.current) {
            alert("Chart not ready. Please wait a moment and try again.");
            return;
        }

        setIsAdding(true);
        try {
            console.log("🟢 [Chart] Starting chart export and insertion...");

            // Get the ECharts instance
            const echartsInstance = chartRef.current.getEchartsInstance();
            if (!echartsInstance) {
                throw new Error("Failed to get ECharts instance");
            }

            // Get current chart option to check backgroundColor
            const currentOption = echartsInstance.getOption();
            
            // Determine background color: transparent ONLY for default theme, otherwise use theme's background color
            // Use chart option's backgroundColor as source of truth since ChartPreview sets it correctly based on theme
            const chartOptionBackgroundColor = currentOption.backgroundColor;
            let exportBackgroundColor;
            
            // Default theme uses '#ffffff' in the chart option, but we want transparent for export
            // For all other themes, use the chart option's backgroundColor (which is already correct)
            if (chartOptionBackgroundColor === '#ffffff') {
                // This is the default theme - use transparent for export
                exportBackgroundColor = 'transparent';
            } else {
                // For all other themes, use the chart option's backgroundColor (already set correctly by ChartPreview)
                exportBackgroundColor = chartOptionBackgroundColor || '#ffffff';
            }

            // Export chart as data URL (PNG format)
            const dataUrl = echartsInstance.getDataURL({
                type: 'png',
                pixelRatio: 2,
                backgroundColor: exportBackgroundColor
            });

            console.log("🟢 [Chart] Chart exported to data URL");

            // Convert data URL to blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            console.log("🟢 [Chart] Chart converted to blob:", blob);

            // Use sandbox function to add chart to design
            const result = await sandboxProxy.addChartToDesign(blob);

            if (result.success) {
                console.log("✅ [Chart] Chart added to design successfully!");
            } else {
                alert(result.error || "Failed to add chart to design");
            }
        } catch (error) {
            console.error("❌ [Chart] Error adding chart to design:", error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsAdding(false);
        }
    }, [sandboxProxy, selectedTheme]);

    return (
        <div className="charts-container">
            <ChartPicker 
                selectedChart={selectedChart}
                onChartChange={handleChartChange}
            />
            <ChartPreview 
                chartType={selectedChart}
                theme={selectedTheme}
                onChartRef={handleChartRef}
            />
            <ChartActions 
                sandboxProxy={sandboxProxy}
                isAdding={isAdding}
                onAddToPage={handleAddToPage}
            />
        </div>
    );
});

Charts.displayName = 'Charts';

// Custom comparison - only re-render if sandboxProxy or selectedTheme changes
export default React.memo(Charts, (prevProps, nextProps) => {
    return prevProps.sandboxProxy === nextProps.sandboxProxy &&
           prevProps.selectedTheme === nextProps.selectedTheme;
});
