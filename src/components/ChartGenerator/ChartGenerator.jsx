import React, { useState, useRef, useCallback, useMemo } from 'react';
import ChartPicker from '../Charts/ChartPicker';
import ChartPreview from '../Charts/ChartPreview';
import ChartActions from '../Charts/ChartActions';
import ThemePicker from '../Themes/ThemePicker';
import UploadModal from '../Charts/UploadModal';
import LoginSignupModal from '../Charts/LoginSignupModal';
import ChartStylingOptions from '../Charts/ChartStylingOptions';
import { revalidateSubscription } from '../../services/subscriptionValidationService';
import './ChartGenerator.css';

// Define pro-only charts and themes
const PRO_ONLY_CHARTS = ['funnel', 'mixed', 'pie-doughnut', 'pie-nightingale', 'scatter'];
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

    // Debug: Log when importedData changes
    React.useEffect(() => {
        console.log('🟢 [ChartGenerator] importedData changed:', importedData);
    }, [importedData]);
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

            // Export chart as data URL (PNG format) with high quality
            const dataUrl = echartsInstance.getDataURL({
                type: 'png',
                pixelRatio: 4,
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

    // Handle API call after form submission
    const handleLoginSignupSubmit = useCallback(async (payload) => {
        try {
            console.log("🟢 [ChartGenerator] Login/Signup Payload:", payload);
            console.log("📦 [ChartGenerator] Payload Details:", {
                adobeId: payload.adobeId,
                adobeAccountType: payload.adobeAccountType,
                productName: payload.productName,
                email: payload.email
            });
            
            // TODO: Replace console.log with actual API call when ready
            // const API_URL = 'https://api.swiftools.com/user/login-signup';
            // const response = await fetch(API_URL, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(payload),
            // });
            // const data = await response.json();

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
        
        console.log("🟢 [ChartGenerator] Import CSV clicked - opening dialog");
        
        try {
            const dialogUrl = "csv-import-dialog.html";
            const result = await addOnUISdk.app.showModalDialog({
                variant: "custom",
                title: "Import CSV Data",
                src: dialogUrl,
                size: { width: 1200, height: 700 },
            });
            
            console.log("🟢 [ChartGenerator] Dialog closed with result:", result);
            
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
                    console.log("🟢 [ChartGenerator] Valid data received from dialog:", chartData);
                    console.log("🟢 [ChartGenerator] Setting importedData with:", {
                        labelsCount: chartData.labels.length,
                        valuesCount: chartData.values.length,
                        labels: chartData.labels.slice(0, 5), // Show first 5 for debugging
                        values: chartData.values.slice(0, 5)  // Show first 5 for debugging
                    });
                    setImportedData(chartData);
                } else {
                    console.log("🟡 [ChartGenerator] Dialog closed without valid data structure. Result:", result);
                    console.log("🟡 [ChartGenerator] chartData:", chartData);
                }
            } else {
                console.log("🟡 [ChartGenerator] Dialog closed with no result");
            }
        } catch (error) {
            console.error("❌ [ChartGenerator] Error opening CSV import dialog:", error);
            alert("Failed to open import dialog. Please try again.");
        }
    }, [sandboxProxy, addOnUISdk]);

    const handleDataUploaded = useCallback((chartData) => {
        console.log("🟢 [ChartGenerator] Data uploaded:", chartData);
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

