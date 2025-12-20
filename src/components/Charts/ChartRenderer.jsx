import React, { useMemo, useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { generateChartOption, themeColors } from './ChartOptionGenerator';

/**
 * Reusable Chart Renderer Component
 * Renders an ECharts chart based on chartType, theme, and data
 * 
 * @param {string} chartType - Type of chart (bar, line, pie, etc.)
 * @param {string} theme - Theme name (default, dark, vintage, etc.)
 * @param {Object} data - Data object with labels and values arrays: { labels: [], values: [] }
 * @param {Object} stylingOptions - Optional styling options
 * @param {Object} option - Optional pre-generated ECharts option (if provided, chartType/theme/data are ignored)
 * @param {Object} style - Optional style object for the container
 * @param {Object|Function} onChartRef - Optional ref object or callback to get chart ref
 */
const ChartRenderer = React.forwardRef(({ 
  chartType = 'bar', 
  theme = 'default', 
  data = null, 
  stylingOptions = {},
  option = null,
  style = { height: '300px', width: '100%' },
  onChartRef = null
}, ref) => {
  const internalRef = useRef(null);

  // Generate chart option using the shared generator, or use provided option
  const chartOption = useMemo(() => {
    if (option) {
      return option; // Use provided option if available
    }
    return generateChartOption(chartType, theme, data, stylingOptions);
  }, [chartType, theme, data, stylingOptions, option]);

  // Handle ref forwarding - support both ref prop and onChartRef callback
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(internalRef);
      } else {
        ref.current = internalRef.current;
      }
    }
    if (onChartRef) {
      if (typeof onChartRef === 'function') {
        onChartRef(internalRef);
      } else {
        onChartRef.current = internalRef.current;
      }
    }
  }, [ref, onChartRef]);

  // For "default" theme, don't pass theme prop (use ECharts default)
  const echartsTheme = theme === 'default' ? undefined : theme;

  return (
    <ReactECharts 
      ref={internalRef}
      option={chartOption} 
      theme={echartsTheme}
      style={style}
      notMerge={true}
      lazyUpdate={false}
    />
  );
});

ChartRenderer.displayName = 'ChartRenderer';

export default ChartRenderer;

