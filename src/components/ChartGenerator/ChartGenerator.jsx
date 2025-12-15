import React, { useState, useRef, useCallback } from 'react';
import ChartPicker from '../Charts/ChartPicker';
import ChartPreview from '../Charts/ChartPreview';
import ChartActions from '../Charts/ChartActions';
import ThemePicker from '../Themes/ThemePicker';
import UploadModal from '../Charts/UploadModal';
import ChartStylingOptions from '../Charts/ChartStylingOptions';
import './ChartGenerator.css';

const ChartGenerator = ({ sandboxProxy }) => {
    const [selectedChart, setSelectedChart] = useState('bar');
    const [selectedTheme, setSelectedTheme] = useState('default');
    const [isAdding, setIsAdding] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [importedData, setImportedData] = useState(null);
    const [stylingOptions, setStylingOptions] = useState({
        // Common options
        labelVisible: true,
        valueVisible: true,
        fontFamily: 'Arial',
        fontStyle: 'normal',
        fontWeight: 400,
        fontSize: 12,
        // Axis options
        xAxisRotation: 0,
        yAxisRotation: 0,
        // Line/Area options
        lineWidth: 3,
        lineSmooth: true,
        showDataPoints: false,
        pointSize: 8,
        // Bar options
        barWidth: 60,
        barBorderRadius: 4,
        barSpacing: 0,
        // Pie options
        innerRadius: 0,
        outerRadius: 40,
        labelLineLength: 15,
        showLegend: true,
        // Funnel options
        funnelWidth: 80,
        funnelGap: 2,
        funnelLabelPosition: 'inside',
        funnelSort: 'descending',
        // Scatter options
        scatterPointSize: 20,
        scatterPointShape: 'circle',
        scatterShowLabels: true,
        scatterSort: 'none',
        scatterLabelPosition: 'top',
        // Area options
        areaOpacity: 50
    });
    const chartRef = useRef(null);

    // Log when stylingOptions state changes
    React.useEffect(() => {
        console.log('🟢 [ChartGenerator] stylingOptions state updated:', {
            fontFamily: stylingOptions?.fontFamily,
            fontStyle: stylingOptions?.fontStyle,
            fontSize: stylingOptions?.fontSize,
            fontWeight: stylingOptions?.fontWeight,
            fullOptions: stylingOptions
        });
    }, [stylingOptions]);

    const handleChartRef = useCallback((ref) => {
        if (ref && ref.current) {
            chartRef.current = ref.current;
        }
    }, []);

    const handleChartChange = useCallback((value) => {
        console.log('🟢 [ChartGenerator] Chart change requested:', value);
        setSelectedChart(value);
    }, []);

    const handleThemeChange = useCallback((theme) => {
        console.log('🟢 [ChartGenerator] Theme change requested:', theme);
        setSelectedTheme(theme);
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
            console.log("🟢 [Chart] Current styling options when adding to page:", {
                fontFamily: stylingOptions?.fontFamily,
                fontStyle: stylingOptions?.fontStyle,
                fontSize: stylingOptions?.fontSize,
                fontWeight: stylingOptions?.fontWeight,
                fullStylingOptions: stylingOptions
            });

            // Get the ECharts instance
            const echartsInstance = chartRef.current.getEchartsInstance();
            if (!echartsInstance) {
                throw new Error("Failed to get ECharts instance");
            }

            // Get the current chart option to verify styling
            const currentOption = echartsInstance.getOption();
            console.log("🟢 [Chart] Current ECharts option (checking fontFamily/fontStyle):", {
                hasXAxis: !!currentOption.xAxis,
                hasYAxis: !!currentOption.yAxis,
                hasLegend: !!currentOption.legend,
                xAxisLabelFontFamily: currentOption.xAxis?.[0]?.axisLabel?.fontFamily,
                xAxisLabelFontStyle: currentOption.xAxis?.[0]?.axisLabel?.fontStyle,
                yAxisLabelFontFamily: currentOption.yAxis?.[0]?.axisLabel?.fontFamily,
                yAxisLabelFontStyle: currentOption.yAxis?.[0]?.axisLabel?.fontStyle,
                legendTextStyleFontFamily: currentOption.legend?.[0]?.textStyle?.fontFamily,
                legendTextStyleFontStyle: currentOption.legend?.[0]?.textStyle?.fontStyle
            });

            // Export chart as data URL (PNG format)
            const dataUrl = echartsInstance.getDataURL({
                type: 'png',
                pixelRatio: 2,
                backgroundColor: '#fff'
            });

            console.log("🟢 [Chart] Chart exported to data URL (with styling:", {
                fontFamily: stylingOptions?.fontFamily,
                fontStyle: stylingOptions?.fontStyle
            }, ")");

            // Convert data URL to blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            console.log("🟢 [Chart] Chart converted to blob:", blob);

            // Use sandbox function to add chart to design
            const result = await sandboxProxy.addChartToDesign(blob);

            if (result.success) {
                console.log("✅ [Chart] Chart added to design successfully with styling:", {
                    fontFamily: stylingOptions?.fontFamily,
                    fontStyle: stylingOptions?.fontStyle
                });
            } else {
                alert(result.error || "Failed to add chart to design");
            }
        } catch (error) {
            console.error("❌ [Chart] Error adding chart to design:", error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsAdding(false);
        }
    }, [sandboxProxy, stylingOptions]);

    const handleImportCSV = useCallback(() => {
        if (!sandboxProxy) {
            alert("Please wait for the add-on to initialize.");
            return;
        }
        
        console.log("🟢 [ChartGenerator] Import CSV clicked");
        setIsUploadModalOpen(true);
    }, [sandboxProxy]);

    const handleDataUploaded = useCallback((chartData) => {
        console.log("🟢 [ChartGenerator] Data uploaded:", chartData);
        setImportedData(chartData);
        setIsUploadModalOpen(false);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsUploadModalOpen(false);
    }, []);

    const handleStylingChange = useCallback((newOptions) => {
        console.log('🟢 [ChartGenerator] Styling options changed:', {
            newOptions,
            fontFamily: newOptions?.fontFamily,
            fontStyle: newOptions?.fontStyle,
            fontSize: newOptions?.fontSize,
            previousFontFamily: stylingOptions?.fontFamily,
            previousFontStyle: stylingOptions?.fontStyle
        });
        setStylingOptions(newOptions);
    }, [stylingOptions]);

    return (
        <div className="chart-generator-container">
            <div className="pickers-row">
                <ChartPicker 
                    selectedChart={selectedChart}
                    onChartChange={handleChartChange}
                />
                <ThemePicker 
                    selectedTheme={selectedTheme}
                    onThemeChange={handleThemeChange}
                />
            </div>
            <ChartPreview 
                chartType={selectedChart}
                theme={selectedTheme}
                onChartRef={handleChartRef}
                importedData={importedData}
                stylingOptions={stylingOptions}
            />
            <ChartActions 
                sandboxProxy={sandboxProxy}
                isAdding={isAdding}
                onAddToPage={handleAddToPage}
                onImportCSV={handleImportCSV}
            />
            <ChartStylingOptions 
                chartType={selectedChart}
                stylingOptions={stylingOptions}
                onStylingChange={handleStylingChange}
            />
            <UploadModal 
                isOpen={isUploadModalOpen}
                onClose={handleCloseModal}
                onDataUploaded={handleDataUploaded}
            />
        </div>
    );
};

export default ChartGenerator;

