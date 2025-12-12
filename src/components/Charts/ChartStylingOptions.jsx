import React, { useState, useRef, useEffect } from 'react';
import "@spectrum-web-components/picker/sp-picker.js";
import "@spectrum-web-components/menu/sp-menu.js";
import "@spectrum-web-components/menu/sp-menu-item.js";
import '@spectrum-web-components/icons-workflow/icons/sp-icon-refresh.js';
import './ChartStylingOptions.css';

const ChartStylingOptions = React.memo(({ chartType, stylingOptions, onStylingChange }) => {
    const [localOptions, setLocalOptions] = useState({
        // Common options
        labelVisible: stylingOptions?.labelVisible ?? true,
        valueVisible: stylingOptions?.valueVisible ?? true,
        fontFamily: stylingOptions?.fontFamily ?? 'Arial',
        fontStyle: stylingOptions?.fontStyle ?? 'normal',
        fontWeight: stylingOptions?.fontWeight ?? 400,
        fontSize: stylingOptions?.fontSize ?? 12,
        // Axis options (for axis-based charts)
        xAxisRotation: stylingOptions?.xAxisRotation ?? 0,
        yAxisRotation: stylingOptions?.yAxisRotation ?? 0,
        // Line/Area options
        lineWidth: stylingOptions?.lineWidth ?? 3,
        lineSmooth: stylingOptions?.lineSmooth ?? true,
        showDataPoints: stylingOptions?.showDataPoints ?? false,
        pointSize: stylingOptions?.pointSize ?? 8,
        // Bar options
        barWidth: stylingOptions?.barWidth ?? 60,
        barBorderRadius: stylingOptions?.barBorderRadius ?? 4,
        barSpacing: stylingOptions?.barSpacing ?? 0,
        // Pie options
        innerRadius: stylingOptions?.innerRadius ?? (chartType === 'pie-doughnut' ? 50 : chartType === 'pie-nightingale' ? 20 : 0),
        outerRadius: stylingOptions?.outerRadius ?? (chartType === 'pie-doughnut' ? 70 : chartType === 'pie-nightingale' ? 100 : 40),
        labelLineLength: stylingOptions?.labelLineLength ?? 15,
        showLegend: stylingOptions?.showLegend ?? true,
        // Funnel options
        funnelWidth: stylingOptions?.funnelWidth ?? 80,
        funnelGap: stylingOptions?.funnelGap ?? 2,
        funnelLabelPosition: stylingOptions?.funnelLabelPosition ?? 'inside',
        funnelSort: stylingOptions?.funnelSort ?? 'descending',
        // Scatter options
        scatterPointSize: stylingOptions?.scatterPointSize ?? 20,
        scatterPointShape: stylingOptions?.scatterPointShape ?? 'circle',
        scatterShowLabels: stylingOptions?.scatterShowLabels ?? true,
        scatterSort: stylingOptions?.scatterSort ?? 'none',
        scatterLabelPosition: stylingOptions?.scatterLabelPosition ?? 'top',
        // Area options
        areaOpacity: stylingOptions?.areaOpacity ?? 50
    });

    const fontFamilyPickerRef = useRef(null);
    const fontStylePickerRef = useRef(null);
    const funnelLabelPositionPickerRef = useRef(null);
    const funnelSortPickerRef = useRef(null);
    const scatterPointShapePickerRef = useRef(null);
    const scatterSortPickerRef = useRef(null);
    const scatterLabelPositionPickerRef = useRef(null);

    // Adobe-supported free fonts
    const fontFamilies = [
        { label: 'Arial', value: 'Arial' },
        { label: 'Helvetica', value: 'Helvetica' },
        { label: 'Times New Roman', value: 'Times New Roman' },
        { label: 'Courier New', value: 'Courier New' },
        { label: 'Verdana', value: 'Verdana' },
        { label: 'Georgia', value: 'Georgia' },
        { label: 'Palatino', value: 'Palatino' },
        { label: 'Garamond', value: 'Garamond' },
        { label: 'Bookman', value: 'Bookman' },
        { label: 'Comic Sans MS', value: 'Comic Sans MS' },
        { label: 'Trebuchet MS', value: 'Trebuchet MS' },
        { label: 'Arial Black', value: 'Arial Black' },
        { label: 'Impact', value: 'Impact' },
        { label: 'Lucida Console', value: 'Lucida Console' },
        { label: 'Tahoma', value: 'Tahoma' }
    ];

    const fontStyles = [
        { label: 'Normal', value: 'normal' },
        { label: 'Bold', value: 'bold' },
        { label: 'Italic', value: 'italic' }
    ];

    const rotationOptions = [
        { label: '0°', value: 0 },
        { label: '15°', value: 15 },
        { label: '30°', value: 30 },
        { label: '45°', value: 45 },
        { label: '90°', value: 90 }
    ];

    const pointShapes = [
        { label: 'Circle', value: 'circle' },
        { label: 'Rectangle', value: 'rect' },
        { label: 'Round Rectangle', value: 'roundRect' },
        { label: 'Triangle', value: 'triangle' },
        { label: 'Diamond', value: 'diamond' },
        { label: 'Pin', value: 'pin' },
        { label: 'Arrow', value: 'arrow' }
    ];

    const funnelLabelPositions = [
        { label: 'Inside', value: 'inside' },
        { label: 'Outside', value: 'outside' }
    ];

    const funnelSortOptions = [
        { label: 'Descending', value: 'descending' },
        { label: 'Ascending', value: 'ascending' }
    ];

    // Check if chart type has axis
    const hasAxis = ['bar', 'line', 'area', 'scatter', 'bar-horizontal', 'mixed'].includes(chartType);
    const isLineChart = ['line', 'area', 'mixed'].includes(chartType);
    const isBarChart = ['bar', 'bar-horizontal', 'mixed'].includes(chartType);
    const isPieChart = ['pie', 'pie-doughnut', 'pie-nightingale'].includes(chartType);
    const isFunnelChart = chartType === 'funnel';
    const isScatterChart = chartType === 'scatter';
    const isAreaChart = chartType === 'area';

    // Update local state when prop changes
    useEffect(() => {
        if (stylingOptions) {
            setLocalOptions(prev => ({
                ...prev,
                labelVisible: stylingOptions.labelVisible ?? true,
                valueVisible: stylingOptions.valueVisible ?? true,
                fontFamily: stylingOptions.fontFamily ?? 'Arial',
                fontStyle: stylingOptions.fontStyle ?? 'normal',
                fontWeight: stylingOptions.fontWeight ?? 400,
                fontSize: stylingOptions.fontSize ?? 12,
                xAxisRotation: stylingOptions.xAxisRotation ?? 0,
                yAxisRotation: stylingOptions.yAxisRotation ?? 0,
                lineWidth: stylingOptions.lineWidth ?? 3,
                lineSmooth: stylingOptions.lineSmooth ?? true,
                showDataPoints: stylingOptions.showDataPoints ?? false,
                pointSize: stylingOptions.pointSize ?? 8,
                barWidth: stylingOptions.barWidth ?? 60,
                barBorderRadius: stylingOptions.barBorderRadius ?? 4,
                barSpacing: stylingOptions.barSpacing ?? 0,
                innerRadius: stylingOptions.innerRadius ?? prev.innerRadius,
                outerRadius: stylingOptions.outerRadius ?? prev.outerRadius,
                labelLineLength: stylingOptions.labelLineLength ?? 15,
                showLegend: stylingOptions.showLegend ?? true,
                funnelWidth: stylingOptions.funnelWidth ?? 80,
                funnelGap: stylingOptions.funnelGap ?? 2,
                funnelLabelPosition: stylingOptions.funnelLabelPosition ?? 'inside',
                funnelSort: stylingOptions.funnelSort ?? 'descending',
                scatterPointSize: stylingOptions.scatterPointSize ?? 20,
                scatterPointShape: stylingOptions.scatterPointShape ?? 'circle',
                scatterShowLabels: stylingOptions.scatterShowLabels ?? true,
                scatterSort: stylingOptions.scatterSort ?? 'none',
                scatterLabelPosition: stylingOptions.scatterLabelPosition ?? 'top',
                areaOpacity: stylingOptions.areaOpacity ?? 50
            }));
        }
    }, [stylingOptions]);

    // Sync picker values
    useEffect(() => {
        if (fontFamilyPickerRef.current) {
            fontFamilyPickerRef.current.value = localOptions.fontFamily;
        }
        if (fontStylePickerRef.current) {
            fontStylePickerRef.current.value = localOptions.fontStyle;
        }
        if (funnelLabelPositionPickerRef.current) {
            funnelLabelPositionPickerRef.current.value = localOptions.funnelLabelPosition;
        }
        if (funnelSortPickerRef.current) {
            funnelSortPickerRef.current.value = localOptions.funnelSort;
        }
        if (scatterPointShapePickerRef.current) {
            scatterPointShapePickerRef.current.value = localOptions.scatterPointShape;
        }
        if (scatterSortPickerRef.current) {
            scatterSortPickerRef.current.value = localOptions.scatterSort;
        }
        if (scatterLabelPositionPickerRef.current) {
            scatterLabelPositionPickerRef.current.value = localOptions.scatterLabelPosition;
        }
    }, [localOptions.fontFamily, localOptions.fontStyle, localOptions.funnelLabelPosition, localOptions.funnelSort, localOptions.scatterPointShape]);

    const handleToggle = (key) => {
        const newOptions = {
            ...localOptions,
            [key]: !localOptions[key]
        };
        setLocalOptions(newOptions);
        if (onStylingChange) {
            onStylingChange(newOptions);
        }
    };

    const handleChange = (key, value) => {
        const newOptions = {
            ...localOptions,
            [key]: value
        };
        setLocalOptions(newOptions);
        if (onStylingChange) {
            onStylingChange(newOptions);
        }
    };

    const handleFontFamilyChange = (event) => {
        handleChange('fontFamily', event.target.value);
    };

    const handleFontStyleChange = (event) => {
        handleChange('fontStyle', event.target.value);
    };

    const handleFontWeightChange = (event) => {
        const value = parseInt(event.target.value, 10);
        if (isNaN(value)) return;
        const clampedValue = Math.max(100, Math.min(900, value));
        handleChange('fontWeight', clampedValue);
    };

    const handleFontSizeChange = (event) => {
        const value = parseInt(event.target.value, 10);
        if (isNaN(value)) return;
        const clampedValue = Math.max(10, Math.min(30, value));
        handleChange('fontSize', clampedValue);
    };

    const handleSliderChange = (key, min, max) => (event) => {
        const value = parseFloat(event.target.value);
        if (isNaN(value)) return;
        const clampedValue = Math.max(min, Math.min(max, value));
        handleChange(key, clampedValue);
    };

    const handlePickerChange = (key) => (event) => {
        handleChange(key, event.target.value);
    };

    const handleReset = (key, defaultValue) => {
        handleChange(key, defaultValue);
    };

    const RefreshIcon = ({ onClick, title = "Reset to default" }) => (
        <button
            className="refresh-icon-button"
            onClick={onClick}
            title={title}
            type="button"
        >
            <sp-icon-refresh size="s"></sp-icon-refresh>
        </button>
    );

    return (
        <div className="chart-styling-options">
            {/* Common Options - Always Visible */}
            <div className="styling-section">
                <h3 className="styling-section-title">Text Visibility</h3>
                <div className="toggle-group">
                    <div className="toggle-item">
                        <label className="toggle-label">Label</label>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={localOptions.labelVisible}
                                onChange={() => handleToggle('labelVisible')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className="toggle-item">
                        <label className="toggle-label">Value</label>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={localOptions.valueVisible}
                                onChange={() => handleToggle('valueVisible')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="styling-section">
                <h3 className="styling-section-title">
                    Font Family
                    <RefreshIcon onClick={() => handleReset('fontFamily', 'Arial')} />
                </h3>
                <sp-picker
                    ref={fontFamilyPickerRef}
                    label="Font Family"
                    value={localOptions.fontFamily}
                    onInput={handleFontFamilyChange}
                    className="styling-picker"
                >
                    {fontFamilies.map((font) => (
                        <sp-menu-item key={font.value} value={font.value}>
                            {font.label}
                        </sp-menu-item>
                    ))}
                </sp-picker>
            </div>

            <div className="styling-section">
                <h3 className="styling-section-title">
                    Font Style
                    <RefreshIcon onClick={() => handleReset('fontStyle', 'normal')} />
                </h3>
                <sp-picker
                    ref={fontStylePickerRef}
                    label="Font Style"
                    value={localOptions.fontStyle}
                    onInput={handleFontStyleChange}
                    className="styling-picker"
                >
                    {fontStyles.map((style) => (
                        <sp-menu-item key={style.value} value={style.value}>
                            {style.label}
                        </sp-menu-item>
                    ))}
                </sp-picker>
            </div>

            <div className="styling-section">
                <h3 className="styling-section-title">
                    Font Weight
                    <RefreshIcon onClick={() => handleReset('fontWeight', 400)} />
                </h3>
                <div className="slider-group">
                    <input
                        type="range"
                        min={100}
                        max={900}
                        step={100}
                        value={localOptions.fontWeight}
                        onChange={handleFontWeightChange}
                        className="styling-slider"
                    />
                    <input
                        type="number"
                        value={localOptions.fontWeight.toString()}
                        min={100}
                        max={900}
                        step={100}
                        onChange={handleFontWeightChange}
                        className="styling-input"
                    />
                </div>
            </div>

            <div className="styling-section">
                <h3 className="styling-section-title">
                    Font Size
                    <RefreshIcon onClick={() => handleReset('fontSize', 12)} />
                </h3>
                <div className="slider-group">
                    <input
                        type="range"
                        min={10}
                        max={30}
                        step={1}
                        value={localOptions.fontSize}
                        onChange={handleFontSizeChange}
                        className="styling-slider"
                    />
                    <input
                        type="number"
                        value={localOptions.fontSize.toString()}
                        min={10}
                        max={30}
                        step={1}
                        onChange={handleFontSizeChange}
                        className="styling-input"
                    />
                </div>
            </div>

            {/* Axis Options - For axis-based charts */}
            {hasAxis && (
                <>
                    <div className="styling-section">
                        <h3 className="styling-section-title">
                            X-Axis Label Rotation
                            <RefreshIcon onClick={() => handleReset('xAxisRotation', 0)} />
                        </h3>
                        <sp-picker
                            label="X-Axis Rotation"
                            value={localOptions.xAxisRotation.toString()}
                            onInput={handlePickerChange('xAxisRotation')}
                            className="styling-picker"
                        >
                            {rotationOptions.map((option) => (
                                <sp-menu-item key={option.value} value={option.value.toString()}>
                                    {option.label}
                                </sp-menu-item>
                            ))}
                        </sp-picker>
                    </div>

                    <div className="styling-section">
                        <h3 className="styling-section-title">
                            Y-Axis Label Rotation
                            <RefreshIcon onClick={() => handleReset('yAxisRotation', 0)} />
                        </h3>
                        <sp-picker
                            label="Y-Axis Rotation"
                            value={localOptions.yAxisRotation.toString()}
                            onInput={handlePickerChange('yAxisRotation')}
                            className="styling-picker"
                        >
                            {rotationOptions.map((option) => (
                                <sp-menu-item key={option.value} value={option.value.toString()}>
                                    {option.label}
                                </sp-menu-item>
                            ))}
                        </sp-picker>
                    </div>
                </>
            )}

            {/* Line/Area Chart Options */}
            {isLineChart && (
                <>
                    <div className="styling-section">
                        <h3 className="styling-section-title">
                            Line Width
                            <RefreshIcon onClick={() => handleReset('lineWidth', 3)} />
                        </h3>
                        <div className="slider-group">
                            <input
                                type="range"
                                min={1}
                                max={10}
                                step={1}
                                value={localOptions.lineWidth}
                                onChange={handleSliderChange('lineWidth', 1, 10)}
                                className="styling-slider"
                            />
                            <input
                                type="number"
                                value={localOptions.lineWidth.toString()}
                                min={1}
                                max={10}
                                step={1}
                                onChange={handleSliderChange('lineWidth', 1, 10)}
                                className="styling-input"
                            />
                        </div>
                    </div>

                    <div className="styling-section">
                        <h3 className="styling-section-title">Line Options</h3>
                        <div className="toggle-group">
                            <div className="toggle-item">
                                <label className="toggle-label">Smooth Line</label>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={localOptions.lineSmooth}
                                        onChange={() => handleToggle('lineSmooth')}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                <label className="toggle-label">Show Data Points</label>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={localOptions.showDataPoints}
                                        onChange={() => handleToggle('showDataPoints')}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {localOptions.showDataPoints && (
                        <div className="styling-section">
                            <h3 className="styling-section-title">
                                Point Size
                                <RefreshIcon onClick={() => handleReset('pointSize', 8)} />
                            </h3>
                            <div className="slider-group">
                                <input
                                    type="range"
                                    min={5}
                                    max={20}
                                    step={1}
                                    value={localOptions.pointSize}
                                    onChange={handleSliderChange('pointSize', 5, 20)}
                                    className="styling-slider"
                                />
                                <input
                                    type="number"
                                    value={localOptions.pointSize.toString()}
                                    min={5}
                                    max={20}
                                    step={1}
                                    onChange={handleSliderChange('pointSize', 5, 20)}
                                    className="styling-input"
                                />
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Bar Chart Options */}
            {isBarChart && (
                <>
                    <div className="styling-section">
                        <h3 className="styling-section-title">
                            Bar Width
                            <RefreshIcon onClick={() => handleReset('barWidth', 60)} />
                        </h3>
                        <div className="slider-group">
                            <input
                                type="range"
                                min={10}
                                max={100}
                                step={5}
                                value={localOptions.barWidth}
                                onChange={handleSliderChange('barWidth', 10, 100)}
                                className="styling-slider"
                            />
                            <input
                                type="number"
                                value={localOptions.barWidth.toString()}
                                min={10}
                                max={100}
                                step={5}
                                onChange={handleSliderChange('barWidth', 10, 100)}
                                className="styling-input"
                            />
                        </div>
                    </div>

                    <div className="styling-section">
                        <h3 className="styling-section-title">
                            Bar Border Radius
                            <RefreshIcon onClick={() => handleReset('barBorderRadius', 4)} />
                        </h3>
                        <div className="slider-group">
                            <input
                                type="range"
                                min={0}
                                max={20}
                                step={1}
                                value={localOptions.barBorderRadius}
                                onChange={handleSliderChange('barBorderRadius', 0, 20)}
                                className="styling-slider"
                            />
                            <input
                                type="number"
                                value={localOptions.barBorderRadius.toString()}
                                min={0}
                                max={20}
                                step={1}
                                onChange={handleSliderChange('barBorderRadius', 0, 20)}
                                className="styling-input"
                            />
                        </div>
                    </div>

                    <div className="styling-section">
                        <h3 className="styling-section-title">
                            Bar Spacing
                            <RefreshIcon onClick={() => handleReset('barSpacing', 0)} />
                        </h3>
                        <div className="slider-group">
                            <input
                                type="range"
                                min={0}
                                max={50}
                                step={1}
                                value={localOptions.barSpacing}
                                onChange={handleSliderChange('barSpacing', 0, 50)}
                                className="styling-slider"
                            />
                            <input
                                type="number"
                                value={localOptions.barSpacing.toString()}
                                min={0}
                                max={50}
                                step={1}
                                onChange={handleSliderChange('barSpacing', 0, 50)}
                                className="styling-input"
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Pie Chart Options */}
            {isPieChart && (
                <>
                    <div className="styling-section">
                        <h3 className="styling-section-title">
                            Inner Radius
                            <RefreshIcon onClick={() => handleReset('innerRadius', chartType === 'pie-doughnut' ? 50 : chartType === 'pie-nightingale' ? 20 : 0)} />
                        </h3>
                        <div className="slider-group">
                            <input
                                type="range"
                                min={chartType === 'pie-nightingale' ? 5 : 0}
                                max={chartType === 'pie-nightingale' ? 60 : 80}
                                step={chartType === 'pie-nightingale' ? 1 : 5}
                                value={localOptions.innerRadius}
                                onChange={handleSliderChange('innerRadius', chartType === 'pie-nightingale' ? 5 : 0, chartType === 'pie-nightingale' ? 60 : 80)}
                                className="styling-slider"
                            />
                            <input
                                type="number"
                                value={localOptions.innerRadius.toString()}
                                min={chartType === 'pie-nightingale' ? 5 : 0}
                                max={chartType === 'pie-nightingale' ? 60 : 80}
                                step={chartType === 'pie-nightingale' ? 1 : 5}
                                onChange={handleSliderChange('innerRadius', chartType === 'pie-nightingale' ? 5 : 0, chartType === 'pie-nightingale' ? 60 : 80)}
                                className="styling-input"
                            />
                        </div>
                    </div>

                    <div className="styling-section">
                        <h3 className="styling-section-title">
                            Outer Radius
                            <RefreshIcon onClick={() => handleReset('outerRadius', chartType === 'pie-doughnut' ? 70 : chartType === 'pie-nightingale' ? 100 : 40)} />
                        </h3>
                        <div className="slider-group">
                            <input
                                type="range"
                                min={chartType === 'pie-nightingale' ? 60 : 30}
                                max={chartType === 'pie-nightingale' ? 120 : 100}
                                step={chartType === 'pie-nightingale' ? 1 : 5}
                                value={localOptions.outerRadius}
                                onChange={handleSliderChange('outerRadius', chartType === 'pie-nightingale' ? 60 : 30, chartType === 'pie-nightingale' ? 120 : 100)}
                                className="styling-slider"
                            />
                            <input
                                type="number"
                                value={localOptions.outerRadius.toString()}
                                min={chartType === 'pie-nightingale' ? 60 : 30}
                                max={chartType === 'pie-nightingale' ? 120 : 100}
                                step={chartType === 'pie-nightingale' ? 1 : 5}
                                onChange={handleSliderChange('outerRadius', chartType === 'pie-nightingale' ? 60 : 30, chartType === 'pie-nightingale' ? 120 : 100)}
                                className="styling-input"
                            />
                        </div>
                    </div>

                    <div className="styling-section">
                        <h3 className="styling-section-title">
                            Label Line Length
                            <RefreshIcon onClick={() => handleReset('labelLineLength', 15)} />
                        </h3>
                        <div className="slider-group">
                            <input
                                type="range"
                                min={5}
                                max={50}
                                step={1}
                                value={localOptions.labelLineLength}
                                onChange={handleSliderChange('labelLineLength', 5, 50)}
                                className="styling-slider"
                            />
                            <input
                                type="number"
                                value={localOptions.labelLineLength.toString()}
                                min={5}
                                max={50}
                                step={1}
                                onChange={handleSliderChange('labelLineLength', 5, 50)}
                                className="styling-input"
                            />
                        </div>
                    </div>

                    <div className="styling-section">
                        <h3 className="styling-section-title">Show Legend</h3>
                        <div className="toggle-group">
                            <div className="toggle-item">
                                <label className="toggle-label">Legend</label>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={localOptions.showLegend}
                                        onChange={() => handleToggle('showLegend')}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Funnel Chart Options */}
            {isFunnelChart && (
                <>
                    <div className="styling-section">
                        <h3 className="styling-section-title">
                            Funnel Width
                            <RefreshIcon onClick={() => handleReset('funnelWidth', 80)} />
                        </h3>
                        <div className="slider-group">
                            <input
                                type="range"
                                min={50}
                                max={100}
                                step={5}
                                value={localOptions.funnelWidth}
                                onChange={handleSliderChange('funnelWidth', 50, 100)}
                                className="styling-slider"
                            />
                            <input
                                type="number"
                                value={localOptions.funnelWidth.toString()}
                                min={50}
                                max={100}
                                step={5}
                                onChange={handleSliderChange('funnelWidth', 50, 100)}
                                className="styling-input"
                            />
                        </div>
                    </div>

                    <div className="styling-section">
                        <h3 className="styling-section-title">
                            Gap Between Items
                            <RefreshIcon onClick={() => handleReset('funnelGap', 2)} />
                        </h3>
                        <div className="slider-group">
                            <input
                                type="range"
                                min={0}
                                max={10}
                                step={1}
                                value={localOptions.funnelGap}
                                onChange={handleSliderChange('funnelGap', 0, 10)}
                                className="styling-slider"
                            />
                            <input
                                type="number"
                                value={localOptions.funnelGap.toString()}
                                min={0}
                                max={10}
                                step={1}
                                onChange={handleSliderChange('funnelGap', 0, 10)}
                                className="styling-input"
                            />
                        </div>
                    </div>

                    <div className="styling-section">
                        <h3 className="styling-section-title">
                            Label Position
                            <RefreshIcon onClick={() => handleReset('funnelLabelPosition', 'inside')} />
                        </h3>
                        <sp-picker
                            ref={funnelLabelPositionPickerRef}
                            label="Label Position"
                            value={localOptions.funnelLabelPosition}
                            onInput={handlePickerChange('funnelLabelPosition')}
                            className="styling-picker"
                        >
                            {funnelLabelPositions.map((option) => (
                                <sp-menu-item key={option.value} value={option.value}>
                                    {option.label}
                                </sp-menu-item>
                            ))}
                        </sp-picker>
                    </div>

                    <div className="styling-section">
                        <h3 className="styling-section-title">
                            Sort Order
                            <RefreshIcon onClick={() => handleReset('funnelSort', 'descending')} />
                        </h3>
                        <sp-picker
                            ref={funnelSortPickerRef}
                            label="Sort Order"
                            value={localOptions.funnelSort}
                            onInput={handlePickerChange('funnelSort')}
                            className="styling-picker"
                        >
                            {funnelSortOptions.map((option) => (
                                <sp-menu-item key={option.value} value={option.value}>
                                    {option.label}
                                </sp-menu-item>
                            ))}
                        </sp-picker>
                    </div>
                </>
            )}

            {/* Scatter Chart Options */}
            {isScatterChart && (
                <>
                    <div className="styling-section">
                        <h3 className="styling-section-title">
                            Point Size
                            <RefreshIcon onClick={() => handleReset('scatterPointSize', 20)} />
                        </h3>
                        <div className="slider-group">
                            <input
                                type="range"
                                min={5}
                                max={50}
                                step={1}
                                value={localOptions.scatterPointSize}
                                onChange={handleSliderChange('scatterPointSize', 5, 50)}
                                className="styling-slider"
                            />
                            <input
                                type="number"
                                value={localOptions.scatterPointSize.toString()}
                                min={5}
                                max={50}
                                step={1}
                                onChange={handleSliderChange('scatterPointSize', 5, 50)}
                                className="styling-input"
                            />
                        </div>
                    </div>

                    <div className="styling-section">
                        <h3 className="styling-section-title">
                            Point Shape
                            <RefreshIcon onClick={() => handleReset('scatterPointShape', 'circle')} />
                        </h3>
                        <sp-picker
                            ref={scatterPointShapePickerRef}
                            label="Point Shape"
                            value={localOptions.scatterPointShape}
                            onInput={handlePickerChange('scatterPointShape')}
                            className="styling-picker"
                        >
                            {pointShapes.map((option) => (
                                <sp-menu-item key={option.value} value={option.value}>
                                    {option.label}
                                </sp-menu-item>
                            ))}
                        </sp-picker>
                    </div>

                    <div className="styling-section">
                        <h3 className="styling-section-title">Show Point Labels</h3>
                        <div className="toggle-group">
                            <div className="toggle-item">
                                <label className="toggle-label">Labels</label>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={localOptions.scatterShowLabels}
                                        onChange={() => handleToggle('scatterShowLabels')}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Area Chart Specific Options */}
            {isAreaChart && (
                    <div className="styling-section">
                        <h3 className="styling-section-title">
                            Area Opacity
                            <RefreshIcon onClick={() => handleReset('areaOpacity', 50)} />
                        </h3>
                        <div className="slider-group">
                        <input
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            value={localOptions.areaOpacity}
                            onChange={handleSliderChange('areaOpacity', 0, 100)}
                            className="styling-slider"
                        />
                        <input
                            type="number"
                            value={localOptions.areaOpacity.toString()}
                            min={0}
                            max={100}
                            step={5}
                            onChange={handleSliderChange('areaOpacity', 0, 100)}
                            className="styling-input"
                        />
                    </div>
                </div>
            )}
        </div>
    );
});

ChartStylingOptions.displayName = 'ChartStylingOptions';

export default ChartStylingOptions;
