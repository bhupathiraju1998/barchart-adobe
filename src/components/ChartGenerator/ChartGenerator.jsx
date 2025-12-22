import React, { useState, useRef, useCallback, useMemo } from 'react';
import ChartPicker from '../Charts/ChartPicker';
import ChartPreview from '../Charts/ChartPreview';
import ChartActions from '../Charts/ChartActions';
import ThemePicker from '../Themes/ThemePicker';
import UploadModal from '../Charts/UploadModal';
import LoginSignupModal from '../Charts/LoginSignupModal';
import ChartStylingOptions from '../Charts/ChartStylingOptions';
import { revalidateSubscription } from '../../services/subscriptionValidationService';
import { themeColors } from '../Charts/ChartOptionGenerator';
import './ChartGenerator.css';

// Define pro-only charts and themes
const PRO_ONLY_CHARTS = ['funnel', 'mixed', 'radar', 'pie-nightingale', 'scatter'];
const PRO_ONLY_THEMES = ['vintage', 'westeros', 'essos', 'wonderland', 'walden', 'chalk', 'infographic'];

const ChartGenerator = ({ 
    sandboxProxy, 
    isPro = false, 
    addOnUISdk, 
    onOpenUpgradeDrawer,
    emailModalEnabled = false,
    hasSubmittedEmail = false,
    onEmailSubmitted
}) => {
    const [selectedChart, setSelectedChart] = useState('bar');
    const [selectedTheme, setSelectedTheme] = useState('default');
    const [isAdding, setIsAdding] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isLoginSignupModalOpen, setIsLoginSignupModalOpen] = useState(false);
    const [importedData, setImportedData] = useState(null);
    const [selectedColumnIndex, setSelectedColumnIndex] = useState(0);

    // Debug: Log when importedData changes

    // Calculate available columns count
    const availableColumns = useMemo(() => {
        if (!importedData) return 0;
        const isMultipleSeries = Array.isArray(importedData?.values?.[0]) && typeof importedData.values[0][0] === 'number';
        return isMultipleSeries ? importedData.values.length : 1;
    }, [importedData]);

    // Determine which charts need column navigation (single-series charts)
    // Mixed chart also needs navigation to select which columns to use
    const needsColumnNavigation = useMemo(() => {
        const multiSeriesCharts = ['line', 'area', 'scatter', 'radar', 'bar'];
        return !multiSeriesCharts.includes(selectedChart) && availableColumns > 1;
    }, [selectedChart, availableColumns]);

    // Reset selected column when chart type changes
    React.useEffect(() => {
        setSelectedColumnIndex(0);
    }, [selectedChart]);

    // Handle column navigation
    const handlePreviousColumn = useCallback(() => {
        setSelectedColumnIndex(prev => (prev > 0 ? prev - 1 : availableColumns - 1));
    }, [availableColumns]);

    const handleNextColumn = useCallback(() => {
        setSelectedColumnIndex(prev => (prev < availableColumns - 1 ? prev + 1 : 0));
    }, [availableColumns]);
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
        innerRadius: 20, // Default inner radius for pie charts (20% for regular pie)
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
        areaOpacity: 50,
        // Radar options
        radarRadius: 70,
        radarNameGap: 5,
        radarSplitNumber: 5,
        radarShape: 'polygon',
        radarShowArea: true,
        radarAreaOpacity: 30
    });
    const chartRef = useRef(null);

    

    const handleChartRef = useCallback((ref) => {
        if (ref && ref.current) {
            chartRef.current = ref.current;
        }
    }, []);

    const handleChartChange = useCallback((value) => {
        setSelectedChart(value);
    }, []);

    // Update showDataPoints default when chart type changes to line/area/radar
    React.useEffect(() => {
        if (selectedChart === 'line' || selectedChart === 'area' || selectedChart === 'radar') {
            setStylingOptions(prev => {
                if (prev.showDataPoints === false) {
                    return {
                        ...prev,
                        showDataPoints: true
                    };
                }
                return prev;
            });
        }
    }, [selectedChart]);

    const handleThemeChange = useCallback((theme) => {
        setSelectedTheme(theme);
    }, []);

    // Validate subscription before adding chart (for Pro users)
    const validateSubscriptionBeforeAdding = useCallback(async () => {
        if (isPro && addOnUISdk) {
            try {
                const { clientStorage } = addOnUISdk.instance;
                const storedKey = await clientStorage.getItem("licenseKey");

                if (storedKey) {
                    const validation = await revalidateSubscription(storedKey);

                    if (!validation.success || !validation.valid) {
                        if (validation.shouldRevoke) {
                            await clientStorage.removeItem("licenseKey");
                            await clientStorage.removeItem("licenseData");

                            // Reload page to sync state with parent component
                            alert(
                                "Your subscription has expired or is no longer valid. Please renew your subscription to continue adding charts."
                            );
                            window.location.reload();
                            return false;
                        }
                        return false;
                    }

                    // Update cached license data
                    const data = validation.licenseData;
                    const licenseDataToStore = {
                        status: data.status,
                        renewal_period_end: data.renewal_period_end,
                        renewal_period_start: data.renewal_period_start,
                        cancel_at_period_end: data.cancel_at_period_end,
                        subscription_type: validation.type,
                        expiresAt: validation.expiresAt
                            ? validation.expiresAt.toISOString()
                            : null,
                        lastValidated: new Date().toISOString(),
                    };

                    await clientStorage.setItem(
                        "licenseData",
                        JSON.stringify(licenseDataToStore)
                    );
                    return true;
                }
            } catch (error) {
                console.error(
                    "Error validating subscription before adding chart:",
                    error
                );
                // Allow adding chart if offline (graceful degradation)
                return true;
            }
        }
        return true; // Non-Pro users or no validation needed
    }, [isPro, addOnUISdk]);

    // Show login/signup popup when Add to Page is clicked
    const handleAddToPage = useCallback(async () => {
        if (!sandboxProxy) {
            alert("Please wait for the add-on to initialize.");
            return;
        }

        if (!chartRef.current) {
            alert("Chart not ready. Please wait a moment and try again.");
            return;
        }

        // For Pro users: validate subscription before proceeding
        if (isPro) {
            const isValid = await validateSubscriptionBeforeAdding();
            if (!isValid) {
                // Validation failed - subscription expired
                // State will be updated by validation function (page reload)
                return;
            }
        }

        // Check all three conditions for email modal (same as bulk addons)
        const shouldShowModal = 
            emailModalEnabled === true &&  // Both flags are true
            isPro === false &&              // Not a Pro user
            hasSubmittedEmail === false;    // Has not submitted email yet

        if (shouldShowModal) {
            // Show the login/signup modal
            setIsLoginSignupModalOpen(true);
        } else {
            // Skip modal and directly add chart to page
            await addChartToPage();
        }
    }, [sandboxProxy, emailModalEnabled, isPro, hasSubmittedEmail, addChartToPage, validateSubscriptionBeforeAdding]);

    // Actual function to add chart to page
    const addChartToPage = useCallback(async () => {
        setIsAdding(true);
        try {
            

            // Get the ECharts instance
            const echartsInstance = chartRef.current.getEchartsInstance();
            if (!echartsInstance) {
                throw new Error("Failed to get ECharts instance");
            }

            // Get the current chart option to verify styling
            const currentOption = echartsInstance.getOption();
            

            // For single-series charts with multiple columns, ensure we export the selected column
            const isMultipleSeries = Array.isArray(importedData?.values?.[0]) && typeof importedData.values[0][0] === 'number';
            if (needsColumnNavigation && isMultipleSeries && currentOption.series) {
                // Modify the option to show only selected column before export
                const modifiedSeries = currentOption.series.map((s, idx) => {
                    if (idx === selectedColumnIndex) {
                        return s; // Keep selected series
                    } else {
                        // Hide other series by setting data to empty array
                        return {
                            ...s,
                            data: []
                        };
                    }
                });
                
                // Temporarily update the chart to show only selected column
                echartsInstance.setOption({
                    series: modifiedSeries
                }, { notMerge: false });
                
                // Wait a bit for chart to update
                await new Promise(resolve => setTimeout(resolve, 100));
            }

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

            // Export chart as data URL (PNG format) with high quality
            const dataUrl = echartsInstance.getDataURL({
                type: 'png',
                pixelRatio: 4,
                backgroundColor: exportBackgroundColor
            });

            

            // Convert data URL to blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            
            // Use sandbox function to add chart to design
            const result = await sandboxProxy.addChartToDesign(blob);

            
        } catch (error) {
            console.log(`Error: ${error.message}`);
        } finally {
            setIsAdding(false);
        }
    }, [sandboxProxy, stylingOptions, selectedTheme, needsColumnNavigation, selectedColumnIndex, importedData]);

    // Handle API call after form submission
    const handleLoginSignupSubmit = useCallback(async (payload) => {
        try {
            
            
            

            // Mark email as submitted
            if (onEmailSubmitted) {
                onEmailSubmitted();
            }

            // Close the modal
            setIsLoginSignupModalOpen(false);

            // Proceed with adding chart to page
            await addChartToPage();
        } catch (error) {
            console.error("❌ [ChartGenerator] Error:", error);
            throw error; // Re-throw to let the modal handle the error display
        }
    }, [addChartToPage, onEmailSubmitted]);

    const handleImportCSV = useCallback(async () => {
        if (!sandboxProxy) {
            alert("Please wait for the add-on to initialize.");
            return;
        }
        
        if (!addOnUISdk?.app?.showModalDialog) {
            alert("Dialog API not available. Please try again.");
            return;
        }
        
        
        try {
            // Pass current chart type, theme, and useFreshData flag as URL parameters
            // useFreshData=true when importedData is null (fresh page load)
            const useFreshData = importedData === null;
            const dialogUrl = `csv-import-dialog.html?chartType=${encodeURIComponent(selectedChart)}&theme=${encodeURIComponent(selectedTheme)}&useFreshData=${useFreshData}`;
            const result = await addOnUISdk.app.showModalDialog({
                variant: "custom",
                title: "Import CSV Data",
                src: dialogUrl,
                size: { width: 1200, height: 700 },
            });
            
            
            // Handle dialog result - result structure is: { type: 'custom', buttonType: 'primary', result: { labels: [...], values: [...] } }
            // The actual chartData is at result.result
            if (result && result.result) {
                let chartData = result.result;
                
                // Check if it's nested one more level (result.result.result)
                if (chartData.result && chartData.result.labels && chartData.result.values) {
                    chartData = chartData.result;
                }
                
                // Validate the data structure
                if (chartData && Array.isArray(chartData.labels) && Array.isArray(chartData.values)) {
                    
                    setImportedData(chartData);
                }
            } 
        } catch (error) {
            alert("Failed to open import dialog. Please try again.");
        }
    }, [sandboxProxy, addOnUISdk, selectedChart, selectedTheme, importedData]);

    const handleDataUploaded = useCallback((chartData) => {
        setImportedData(chartData);
        setIsUploadModalOpen(false);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsUploadModalOpen(false);
    }, []);

    const handleCloseLoginSignupModal = useCallback(() => {
        setIsLoginSignupModalOpen(false);
    }, []);

    const handleStylingChange = useCallback((newOptions) => {
        
        setStylingOptions(newOptions);
    }, [stylingOptions]);

    // Check if selected chart or theme is pro-only
    const isProOnlySelected = useMemo(() => {
        const isProChart = PRO_ONLY_CHARTS.includes(selectedChart);
        const isProTheme = PRO_ONLY_THEMES.includes(selectedTheme);
        return isProChart || isProTheme;
    }, [selectedChart, selectedTheme]);

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
                selectedColumnIndex={selectedColumnIndex}
                needsColumnNavigation={needsColumnNavigation}
                availableColumns={availableColumns}
                onPreviousColumn={handlePreviousColumn}
                onNextColumn={handleNextColumn}
            />
            <ChartActions 
                sandboxProxy={sandboxProxy}
                isAdding={isAdding}
                onAddToPage={handleAddToPage}
                onImportCSV={handleImportCSV}
                isPro={isPro}
                isProOnlySelected={isProOnlySelected}
                onOpenUpgradeDrawer={onOpenUpgradeDrawer}
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
            <LoginSignupModal 
                isOpen={isLoginSignupModalOpen}
                onClose={handleCloseLoginSignupModal}
                onSubmit={handleLoginSignupSubmit}
                addOnUISdk={addOnUISdk}
            />
        </div>
    );
};

export default ChartGenerator;

