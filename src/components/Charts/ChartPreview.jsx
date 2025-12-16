import React, { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';

const ChartPreview = ({ chartType, theme, onChartRef, importedData, stylingOptions }) => {
    const chartRef = useRef(null);

    // Log when ChartPreview component renders
    React.useEffect(() => {
        console.log('🟣 [ChartPreview] Component RENDERED/MOUNTED', {
            chartType,
            theme,
            onChartRef: !!onChartRef,
            hasImportedData: !!importedData,
            stylingOptions
        });
    });

    // Expose chartRef to parent via callback
    React.useEffect(() => {
        if (onChartRef) {
            onChartRef(chartRef);
        }
    }, [onChartRef]);

    // ECharts built-in theme color schemes
    const themeColors = {
        default: {
            backgroundColor: '#ffffff',
            textColor: '#333333',
            gridColor: '#e0e0e0',
            colors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4']
        },
        vintage: {
            backgroundColor: '#fef8ef',
            textColor: '#6c5b4f',
            gridColor: '#e8dcc6',
            colors: ['#d87c7c', '#919e8b', '#d7ab82', '#6e7074', '#61a0a8', '#efa18d', '#787464', '#cc7e63']
        },
        dark: {
            backgroundColor: '#1e1e1e',
            textColor: '#e0e0e0',
            gridColor: '#404040',
            colors: ['#dd6b66', '#759aa0', '#e69d87', '#8dc1a9', '#ea7ccc', '#eedd78', '#73a373', '#73b9bc', '#7289ab', '#91ca8c', '#f49f42']
        },
        westeros: {
            backgroundColor: '#fffef0',
            textColor: '#516b91',
            gridColor: '#d3d3d3',
            colors: ['#516b91', '#59a4a3', '#84c7b0', '#a3d9b1', '#c7e89e', '#f0f9a4', '#f7d794', '#f5b87e', '#f29866', '#ee5a6f']
        },
        essos: {
            backgroundColor: '#fffef0',
            textColor: '#6e7079',
            gridColor: '#d3d3d3',
            colors: ['#893448', '#d95850', '#eb8146', '#ffb248', '#f2d643', '#ebdba4']
        },
        wonderland: {
            backgroundColor: '#fffef0',
            textColor: '#516b91',
            gridColor: '#d3d3d3',
            colors: ['#4ea397', '#22c3aa', '#7bd9a5', '#bff128', '#faff72', '#f9f26d', '#fad758', '#f9ca7b', '#f4a261', '#ee5a6f']
        },
        walden: {
            backgroundColor: '#fffef0',
            textColor: '#516b91',
            gridColor: '#d3d3d3',
            colors: ['#c12e34', '#e6b600', '#0098d9', '#2b821d', '#005eaa', '#339ca8', '#cda819', '#32a487']
        },
        chalk: {
            backgroundColor: '#293441',
            textColor: '#b9b8ce',
            gridColor: '#3e4a5b',
            colors: ['#fc97af', '#87f7cf', '#f7f494', '#72ccff', '#f7c5a0', '#d4a4eb', '#d2f5a6', '#76f2f2']
        },
        infographic: {
            backgroundColor: '#ffffff',
            textColor: '#333333',
            gridColor: '#e0e0e0',
            colors: ['#C1232B', '#B5C334', '#FCCE10', '#E87C25', '#27727B', '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD', '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0']
        }
    };

    const currentTheme = themeColors[theme] || themeColors.default;

    // Memoize chart option calculation to prevent unnecessary recalculations
    const chartOption = useMemo(() => {
        console.log('🟣 [ChartPreview] Computing chart option for:', { 
            chartType, 
            theme, 
            hasImportedData: !!importedData, 
            stylingOptions,
            fontFamily: stylingOptions?.fontFamily,
            fontStyle: stylingOptions?.fontStyle,
            fontSize: stylingOptions?.fontSize
        });
        
        // Helper function to get text style based on styling options (for labels, axis labels, legend, etc.)
        // Defined inside useMemo to ensure it uses the latest stylingOptions
        const getTextStyle = (defaultStyle = {}, isValue = false) => {
            if (!stylingOptions) {
                const result = {
                    ...defaultStyle,
                    fontFamily: 'Arial',
                    fontStyle: 'normal'
                };
                console.log('🔵 [ChartPreview] getTextStyle (no stylingOptions):', { isValue, result });
                return result;
            }

            const visibility = isValue ? stylingOptions.valueVisible : stylingOptions.labelVisible;
            const baseStyle = {
                show: visibility !== false,
                fontSize: stylingOptions.fontSize ?? 12,
                fontFamily: stylingOptions.fontFamily ?? 'Arial',
                fontWeight: stylingOptions.fontWeight ?? 400,
                color: currentTheme.textColor
            };

            // Apply font style - ensure fontFamily and fontStyle are always set
            if (stylingOptions.fontStyle === 'bold') {
                baseStyle.fontWeight = 'bold';
                baseStyle.fontStyle = 'normal';
            } else if (stylingOptions.fontStyle === 'italic') {
                baseStyle.fontStyle = 'italic';
            } else {
                baseStyle.fontStyle = stylingOptions.fontStyle ?? 'normal';
            }

            // Ensure fontFamily is always explicitly set
            baseStyle.fontFamily = stylingOptions.fontFamily ?? 'Arial';

            const result = {
                ...defaultStyle,
                ...baseStyle,
                show: visibility !== false && (defaultStyle.show !== false)
            };
            
            console.log('🔵 [ChartPreview] getTextStyle:', {
                isValue,
                stylingOptions_fontFamily: stylingOptions.fontFamily,
                stylingOptions_fontStyle: stylingOptions.fontStyle,
                result_fontFamily: result.fontFamily,
                result_fontStyle: result.fontStyle,
                result_fontWeight: result.fontWeight,
                result_fontSize: result.fontSize
            });

            return result;
        };

        // Helper function to get label style (for category labels, axis labels, legend)
        const getLabelStyle = (defaultStyle = {}) => getTextStyle(defaultStyle, false);

        // Helper function to get value style (for data values, tooltip values)
        const getValueStyle = (defaultStyle = {}) => getTextStyle(defaultStyle, true);

        const baseConfig = {
            backgroundColor: currentTheme.backgroundColor,
            textStyle: getTextStyle({
                color: currentTheme.textColor
            }),
            tooltip: {
                backgroundColor: currentTheme.backgroundColor,
                borderColor: currentTheme.gridColor,
                textStyle: getTextStyle({
                    color: currentTheme.textColor
                })
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
                borderColor: currentTheme.gridColor
            }
        };

        // Helper to get barCategoryGap value
        const getBarCategoryGap = () => {
            const spacing = stylingOptions?.barSpacing;
            console.log('🟣 [ChartPreview] getBarCategoryGap called:', {
                spacing,
                stylingOptions_barSpacing: stylingOptions?.barSpacing,
                isUndefined: spacing === undefined,
                isNull: spacing === null,
                type: typeof spacing
            });
            // Handle 0 explicitly - 0 is a valid value
            if (spacing !== undefined && spacing !== null && spacing !== '') {
                const result = `${spacing}%`;
                console.log('🟣 [ChartPreview] barCategoryGap result:', result);
                return result;
            }
            const defaultResult = '0%';
            console.log('🟣 [ChartPreview] barCategoryGap default:', defaultResult);
            return defaultResult;
        };

        // Use imported data if available, otherwise use dummy data
        const commonData = importedData?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const commonValues = importedData?.values || [120, 200, 150, 80, 70, 110, 130];

        switch (chartType) {
            case 'bar':
                return {
                    ...baseConfig,
                    tooltip: {
                        ...baseConfig.tooltip,
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    xAxis: {
                        type: 'category',
                        data: commonData,
                        boundaryGap: true,
                        axisLabel: {
                            ...getLabelStyle({
                                color: currentTheme.textColor
                            }),
                            rotate: stylingOptions?.xAxisRotation ?? 0
                        },
                        axisLine: {
                            lineStyle: {
                                color: currentTheme.gridColor
                            }
                        }
                    },
                    yAxis: {
                        type: 'value',
                        axisLabel: {
                            ...getLabelStyle({
                                color: currentTheme.textColor
                            }),
                            rotate: stylingOptions?.yAxisRotation ?? 0
                        },
                        axisLine: {
                            lineStyle: {
                                color: currentTheme.gridColor
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: currentTheme.gridColor
                            }
                        }
                    },
                    series: [
                        {
                            name: 'Sales',
                            type: 'bar',
                            data: commonValues,
                            barWidth: `${stylingOptions?.barWidth ?? 60}%`,
                            barCategoryGap: getBarCategoryGap(),
                            barGap: '0%',
                            itemStyle: {
                                color: currentTheme.colors[0],
                                borderRadius: [
                                    stylingOptions?.barBorderRadius ?? 4,
                                    stylingOptions?.barBorderRadius ?? 4,
                                    0,
                                    0
                                ]
                            },
                            label: getValueStyle({
                                show: true,
                                position: 'top',
                                color: currentTheme.textColor
                            })
                        }
                    ]
                };

            case 'line':
                return {
                    ...baseConfig,
                    tooltip: {
                        ...baseConfig.tooltip,
                        trigger: 'axis'
                    },
                    xAxis: {
                        type: 'category',
                        data: commonData,
                        boundaryGap: true,
                        axisLabel: {
                            ...getLabelStyle({
                                color: currentTheme.textColor
                            }),
                            rotate: stylingOptions?.xAxisRotation ?? 0
                        },
                        axisLine: {
                            lineStyle: {
                                color: currentTheme.gridColor
                            }
                        }
                    },
                    yAxis: {
                        type: 'value',
                        axisLabel: {
                            ...getLabelStyle({
                                color: currentTheme.textColor
                            }),
                            rotate: stylingOptions?.yAxisRotation ?? 0
                        },
                        axisLine: {
                            lineStyle: {
                                color: currentTheme.gridColor
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: currentTheme.gridColor
                            }
                        }
                    },
                    series: [
                        {
                            name: 'Sales',
                            type: 'line',
                            data: commonValues,
                            smooth: stylingOptions?.lineSmooth ?? true,
                            itemStyle: {
                                color: currentTheme.colors[0]
                            },
                            lineStyle: {
                                width: stylingOptions?.lineWidth ?? 3
                            },
                            showSymbol: stylingOptions?.showDataPoints ?? false,
                            symbolSize: stylingOptions?.showDataPoints ? (stylingOptions?.pointSize ?? 8) : 0,
                            label: (() => {
                                const valueStyle = getValueStyle({
                                    show: true,
                                    position: 'top',
                                    color: currentTheme.textColor
                                });
                                // If show is false, return false to hide the label completely
                                if (valueStyle.show === false) {
                                    return { show: false };
                                }
                                return {
                                    ...valueStyle,
                                    formatter: '{c}'
                                };
                            })()
                        }
                    ]
                };

            case 'pie':
                return {
                    ...baseConfig,
                    tooltip: {
                        ...baseConfig.tooltip,
                        trigger: 'item',
                        formatter: '{a} <br/>{b}: {c} ({d}%)'
                    },
                    legend: {
                        data: commonData,
                        bottom: 0,
                        show: stylingOptions?.showLegend !== false,
                        textStyle: getLabelStyle({
                            color: currentTheme.textColor
                        })
                    },
                    series: [
                        {
                            name: 'Sales',
                            type: 'pie',
                            radius: [
                                `${stylingOptions?.innerRadius ?? 20}%`,
                                `${stylingOptions?.outerRadius ?? 40}%`
                            ],
                            avoidLabelOverlap: false,
                            itemStyle: {
                                borderRadius: 8,
                                borderColor: currentTheme.backgroundColor,
                                borderWidth: 2
                            },
                            label: {
                                ...getLabelStyle({
                                    show: true,
                                    color: currentTheme.textColor
                                }),
                                formatter: (params) => {
                                    let result = '';
                                    if (stylingOptions?.labelVisible !== false) {
                                        result += params.name;
                                    }
                                    if (stylingOptions?.valueVisible !== false) {
                                        if (result) result += '\n';
                                        result += params.percent + '%';
                                    }
                                    return result || '';
                                }
                            },
                            labelLine: {
                                length: stylingOptions?.labelLineLength ?? 15,
                                length2: Math.max(3, Math.floor((stylingOptions?.labelLineLength ?? 15) / 3)),
                                lineStyle: {
                                    color: currentTheme.textColor,
                                    width: 1
                                }
                            },
                            emphasis: {
                                label: getLabelStyle({
                                    show: true,
                                    fontSize: stylingOptions?.fontSize ? stylingOptions.fontSize + 2 : 14,
                                    fontWeight: 'bold',
                                    color: currentTheme.textColor
                                })
                            },
                            data: commonData.map((day, index) => ({
                                value: commonValues[index],
                                name: day
                            })),
                            color: currentTheme.colors
                        }
                    ]
                };

            case 'area':
                return {
                    ...baseConfig,
                    tooltip: {
                        ...baseConfig.tooltip,
                        trigger: 'axis'
                    },
                    xAxis: {
                        type: 'category',
                        data: commonData,
                        axisLabel: {
                            ...getLabelStyle({
                                fontSize: stylingOptions?.fontSize ?? 12,
                                color: currentTheme.textColor
                            }),
                            rotate: stylingOptions?.xAxisRotation ?? 0
                        },
                        axisLine: {
                            lineStyle: {
                                color: currentTheme.gridColor
                            }
                        }
                    },
                    yAxis: {
                        type: 'value',
                        axisLabel: {
                            ...getLabelStyle({
                                fontSize: stylingOptions?.fontSize ?? 12,
                                color: currentTheme.textColor
                            }),
                            rotate: stylingOptions?.yAxisRotation ?? 0
                        },
                        axisLine: {
                            lineStyle: {
                                color: currentTheme.gridColor
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: currentTheme.gridColor
                            }
                        }
                    },
                    series: [
                        {
                            name: 'Sales',
                            type: 'line',
                            data: commonValues,
                            smooth: stylingOptions?.lineSmooth ?? true,
                            areaStyle: {
                                opacity: (stylingOptions?.areaOpacity ?? 50) / 100
                            },
                            itemStyle: {
                                color: currentTheme.colors[0]
                            },
                            lineStyle: {
                                width: stylingOptions?.lineWidth ?? 2
                            },
                            showSymbol: stylingOptions?.showDataPoints ?? false,
                            symbolSize: stylingOptions?.showDataPoints ? (stylingOptions?.pointSize ?? 8) : 0,
                            label: (() => {
                                const valueStyle = getValueStyle({
                                    show: true,
                                    position: 'top',
                                    color: currentTheme.textColor
                                });
                                // If show is false, return false to hide the label completely
                                if (valueStyle.show === false) {
                                    return { show: false };
                                }
                                return {
                                    ...valueStyle,
                                    formatter: '{c}'
                                };
                            })()
                        }
                    ]
                };

            case 'scatter':
                return {
                    ...baseConfig,
                    tooltip: {
                        ...baseConfig.tooltip,
                        trigger: 'item',
                        formatter: (params) => {
                            return `${params.name}: (${params.value[0]}, ${params.value[1]})`;
                        }
                    },
                    xAxis: {
                        type: 'value',
                        name: 'Value',
                        nameLocation: 'middle',
                        nameGap: 30,
                        axisLabel: {
                            ...getLabelStyle({
                                color: currentTheme.textColor
                            }),
                            rotate: stylingOptions?.xAxisRotation ?? 0
                        },
                        axisLine: {
                            lineStyle: {
                                color: currentTheme.gridColor
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: currentTheme.gridColor
                            }
                        }
                    },
                    yAxis: {
                        type: 'value',
                        name: 'Sales',
                        nameLocation: 'middle',
                        nameGap: 50,
                        axisLabel: {
                            ...getLabelStyle({
                                color: currentTheme.textColor
                            }),
                            rotate: stylingOptions?.yAxisRotation ?? 0
                        },
                        axisLine: {
                            lineStyle: {
                                color: currentTheme.gridColor
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: currentTheme.gridColor
                            }
                        }
                    },
                    series: [
                        {
                            name: 'Sales',
                            type: 'scatter',
                            data: (() => {
                                let data = commonValues.map((val, index) => ({
                                    value: [index * 20, val],
                                    name: commonData[index]
                                }));
                                // Apply sort order
                                if (stylingOptions?.scatterSort === 'ascending') {
                                    data.sort((a, b) => a.value[1] - b.value[1]);
                                } else if (stylingOptions?.scatterSort === 'descending') {
                                    data.sort((a, b) => b.value[1] - a.value[1]);
                                }
                                return data;
                            })(),
                            symbolSize: stylingOptions?.scatterPointSize ?? 20,
                            symbol: stylingOptions?.scatterPointShape ?? 'circle',
                            itemStyle: {
                                color: currentTheme.colors[0]
                            },
                            label: {
                                ...getLabelStyle({
                                    show: stylingOptions?.scatterShowLabels ?? true,
                                    formatter: '{b}',
                                    position: stylingOptions?.scatterLabelPosition ?? 'top',
                                    fontSize: stylingOptions?.fontSize ? stylingOptions.fontSize - 2 : 10,
                                    color: currentTheme.textColor
                                }),
                                formatter: (params) => {
                                    let result = '';
                                    if (stylingOptions?.labelVisible !== false) {
                                        result += params.name;
                                    }
                                    if (stylingOptions?.valueVisible !== false) {
                                        if (result) result += '\n';
                                        result += `(${params.value[0]}, ${params.value[1]})`;
                                    }
                                    return result || '';
                                }
                            }
                        }
                    ]
                };

            case 'bar-horizontal':
                return {
                    ...baseConfig,
                    tooltip: {
                        ...baseConfig.tooltip,
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    grid: {
                        ...baseConfig.grid,
                        left: '15%',
                        right: '4%'
                    },
                    xAxis: {
                        type: 'value',
                        axisLabel: {
                            ...getLabelStyle({
                                color: currentTheme.textColor
                            }),
                            rotate: stylingOptions?.xAxisRotation ?? 0
                        },
                        axisLine: {
                            lineStyle: {
                                color: currentTheme.gridColor
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: currentTheme.gridColor
                            }
                        }
                    },
                    yAxis: {
                        type: 'category',
                        data: commonData,
                        axisLabel: {
                            ...getLabelStyle({
                                color: currentTheme.textColor
                            }),
                            rotate: stylingOptions?.yAxisRotation ?? 0
                        },
                        axisLine: {
                            lineStyle: {
                                color: currentTheme.gridColor
                            }
                        }
                    },
                    series: [
                        {
                            name: 'Sales',
                            type: 'bar',
                            data: commonValues,
                            barWidth: `${stylingOptions?.barWidth ?? 60}%`,
                            barCategoryGap: getBarCategoryGap(),
                            barGap: '0%',
                            itemStyle: {
                                color: currentTheme.colors[0],
                                borderRadius: [
                                    0,
                                    stylingOptions?.barBorderRadius ?? 4,
                                    stylingOptions?.barBorderRadius ?? 4,
                                    0
                                ]
                            },
                            label: getValueStyle({
                                show: true,
                                position: 'right',
                                color: currentTheme.textColor
                            })
                        }
                    ]
                };

            case 'pie-doughnut':
                return {
                    ...baseConfig,
                    tooltip: {
                        ...baseConfig.tooltip,
                        trigger: 'item',
                        formatter: '{a} <br/>{b}: {c} ({d}%)'
                    },
                    legend: {
                        data: commonData,
                        bottom: 0,
                        show: stylingOptions?.showLegend !== false,
                        textStyle: getLabelStyle({
                            color: currentTheme.textColor
                        })
                    },
                    series: [
                        {
                            name: 'Sales',
                            type: 'pie',
                            radius: [
                                `${stylingOptions?.innerRadius ?? 10}%`,
                                `${stylingOptions?.outerRadius ?? 50}%`
                            ],
                            avoidLabelOverlap: false,
                            itemStyle: {
                                borderRadius: 8,
                                borderColor: currentTheme.backgroundColor,
                                borderWidth: 2
                            },
                            label: {
                                ...getLabelStyle({
                                    show: true,
                                    color: currentTheme.textColor
                                }),
                                formatter: (params) => {
                                    let result = '';
                                    if (stylingOptions?.labelVisible !== false) {
                                        result += params.name;
                                    }
                                    if (stylingOptions?.valueVisible !== false) {
                                        if (result) result += '\n';
                                        result += params.percent + '%';
                                    }
                                    return result || '';
                                }
                            },
                            labelLine: {
                                length: stylingOptions?.labelLineLength ?? 15,
                                length2: Math.max(3, Math.floor((stylingOptions?.labelLineLength ?? 15) / 3)),
                                lineStyle: {
                                    color: currentTheme.textColor,
                                    width: 1
                                }
                            },
                            emphasis: {
                                label: getLabelStyle({
                                    show: true,
                                    fontSize: stylingOptions?.fontSize ? stylingOptions.fontSize + 2 : 14,
                                    fontWeight: 'bold',
                                    color: currentTheme.textColor
                                })
                            },
                            data: commonData.map((day, index) => ({
                                value: commonValues[index],
                                name: day
                            })),
                            color: currentTheme.colors
                        }
                    ]
                };

            case 'pie-nightingale':
                return {
                    ...baseConfig,
                    tooltip: {
                        ...baseConfig.tooltip,
                        trigger: 'item',
                        formatter: '{a} <br/>{b}: {c} ({d}%)'
                    },
                    legend: {
                        data: commonData,
                        bottom: 0,
                        show: stylingOptions?.showLegend !== false,
                        textStyle: getLabelStyle({
                            color: currentTheme.textColor
                        })
                    },
                    series: [
                        {
                            name: 'Sales',
                            type: 'pie',
                            radius: [
                                stylingOptions?.innerRadius ?? 5,
                                stylingOptions?.outerRadius ?? 60
                            ],
                            center: ['50%', '50%'],
                            roseType: 'area',
                            itemStyle: {
                                borderRadius: 8,
                                borderColor: currentTheme.backgroundColor,
                                borderWidth: 2
                            },
                            label: {
                                ...getLabelStyle({
                                    show: true,
                                    color: currentTheme.textColor
                                }),
                                formatter: (params) => {
                                    let result = '';
                                    if (stylingOptions?.labelVisible !== false) {
                                        result += params.name;
                                    }
                                    if (stylingOptions?.valueVisible !== false) {
                                        if (result) result += '\n';
                                        result += params.percent + '%';
                                    }
                                    return result || '';
                                }
                            },
                            labelLine: {
                                length: stylingOptions?.labelLineLength ?? 15,
                                length2: Math.max(3, Math.floor((stylingOptions?.labelLineLength ?? 15) / 3)),
                                lineStyle: {
                                    color: currentTheme.textColor,
                                    width: 1
                                }
                            },
                            emphasis: {
                                label: getLabelStyle({
                                    show: true,
                                    fontSize: stylingOptions?.fontSize ? stylingOptions.fontSize + 2 : 14,
                                    fontWeight: 'bold',
                                    color: currentTheme.textColor
                                })
                            },
                            data: commonData.map((day, index) => ({
                                value: commonValues[index],
                                name: day
                            })),
                            color: currentTheme.colors
                        }
                    ]
                };

            case 'funnel':
                return {
                    ...baseConfig,
                    tooltip: {
                        ...baseConfig.tooltip,
                        trigger: 'item',
                        formatter: '{a} <br/>{b}: {c}'
                    },
                    legend: {
                        data: commonData,
                        textStyle: getLabelStyle({
                            color: currentTheme.textColor
                        })
                    },
                    series: [
                        {
                            name: 'Sales',
                            type: 'funnel',
                            left: `${(100 - (stylingOptions?.funnelWidth ?? 80)) / 2}%`,
                            top: 60,
                            bottom: 60,
                            width: `${stylingOptions?.funnelWidth ?? 80}%`,
                            min: 0,
                            max: Math.max(...commonValues),
                            minSize: '0%',
                            maxSize: '100%',
                            sort: stylingOptions?.funnelSort ?? 'descending',
                            gap: stylingOptions?.funnelGap ?? 2,
                            label: {
                                ...getLabelStyle({
                                    show: true,
                                    position: stylingOptions?.funnelLabelPosition ?? 'inside',
                                    color: currentTheme.textColor
                                }),
                                formatter: (params) => {
                                    let result = '';
                                    if (stylingOptions?.labelVisible !== false) {
                                        result += params.name;
                                    }
                                    if (stylingOptions?.valueVisible !== false) {
                                        if (result) result += '\n';
                                        result += params.value;
                                    }
                                    return result || '';
                                }
                            },
                            labelLine: {
                                length: 10,
                                lineStyle: {
                                    width: 1,
                                    type: 'solid'
                                }
                            },
                            itemStyle: {
                                borderColor: currentTheme.backgroundColor,
                                borderWidth: 1
                            },
                            emphasis: {
                                label: getValueStyle({
                                    fontSize: stylingOptions?.fontSize ? stylingOptions.fontSize + 2 : 14,
                                    color: currentTheme.textColor
                                })
                            },
                            data: commonData.map((day, index) => ({
                                value: commonValues[index],
                                name: day
                            })),
                            color: currentTheme.colors
                        }
                    ]
                };

            case 'mixed':
                return {
                    ...baseConfig,
                    tooltip: {
                        ...baseConfig.tooltip,
                        trigger: 'axis'
                    },
                    xAxis: {
                        type: 'category',
                        data: commonData,
                        boundaryGap: true,
                        axisLabel: {
                            ...getLabelStyle({
                                fontSize: stylingOptions?.fontSize ?? 12,
                                color: currentTheme.textColor
                            }),
                            rotate: stylingOptions?.xAxisRotation ?? 0
                        },
                        axisLine: {
                            lineStyle: {
                                color: currentTheme.gridColor
                            }
                        }
                    },
                    yAxis: [
                        {
                            type: 'value',
                            name: 'Sales',
                            position: 'left',
                            axisLabel: getLabelStyle({
                                color: currentTheme.textColor,
                                rotate: stylingOptions?.yAxisRotation ?? 0
                            }),
                            axisLine: {
                                lineStyle: {
                                    color: currentTheme.gridColor
                                }
                            },
                            splitLine: {
                                lineStyle: {
                                    color: currentTheme.gridColor
                                }
                            }
                        },
                        {
                            type: 'value',
                            name: 'Target',
                            position: 'right',
                            axisLabel: getLabelStyle({
                                color: currentTheme.textColor,
                                rotate: stylingOptions?.yAxisRotation ?? 0
                            }),
                            axisLine: {
                                lineStyle: {
                                    color: currentTheme.gridColor
                                }
                            },
                            splitLine: {
                                show: false
                            }
                        }
                    ],
                    series: [
                        {
                            name: 'Sales',
                            type: 'bar',
                            data: commonValues,
                            barWidth: `${stylingOptions?.barWidth ?? 60}%`,
                            barCategoryGap: getBarCategoryGap(),
                            barGap: '0%',
                            itemStyle: {
                                color: currentTheme.colors[0],
                                borderRadius: [
                                    stylingOptions?.barBorderRadius ?? 4,
                                    stylingOptions?.barBorderRadius ?? 4,
                                    0,
                                    0
                                ]
                            },
                            label: getValueStyle({
                                show: true,
                                position: 'top',
                                fontSize: stylingOptions?.fontSize ?? 12,
                                color: currentTheme.textColor
                            })
                        },
                        {
                            name: 'Target',
                            type: 'line',
                            yAxisIndex: 1,
                            data: commonValues.map(v => v * 1.2),
                            itemStyle: {
                                color: currentTheme.colors[1]
                            },
                            lineStyle: {
                                width: stylingOptions?.lineWidth ?? 3
                            },
                            smooth: stylingOptions?.lineSmooth ?? true,
                            showSymbol: stylingOptions?.showDataPoints ?? false,
                            symbol: 'circle',
                            symbolSize: stylingOptions?.showDataPoints ? (stylingOptions?.pointSize ?? 8) : 0
                        }
                    ]
                };

            default:
                return baseConfig;
        }
    }, [chartType, theme, currentTheme, importedData, stylingOptions]);

    // Log the final chart option to verify fontFamily and fontStyle are included
    React.useEffect(() => {
        if (chartOption && chartOption.series) {
            const firstSeries = chartOption.series[0];
            console.log('🟣 [ChartPreview] Final chart option computed:', {
                hasXAxis: !!chartOption.xAxis,
                hasYAxis: !!chartOption.yAxis,
                hasLegend: !!chartOption.legend,
                hasSeries: !!chartOption.series,
                barSpacing: stylingOptions?.barSpacing,
                firstSeriesType: firstSeries?.type,
                barCategoryGap: firstSeries?.barCategoryGap,
                barGap: firstSeries?.barGap,
                barWidth: firstSeries?.barWidth,
                fullFirstSeries: firstSeries,
                xAxisLabelFontFamily: chartOption.xAxis?.axisLabel?.fontFamily,
                xAxisLabelFontStyle: chartOption.xAxis?.axisLabel?.fontStyle,
                yAxisLabelFontFamily: chartOption.yAxis?.axisLabel?.fontFamily,
                yAxisLabelFontStyle: chartOption.yAxis?.axisLabel?.fontStyle,
                legendTextStyleFontFamily: chartOption.legend?.textStyle?.fontFamily,
                legendTextStyleFontStyle: chartOption.legend?.textStyle?.fontStyle,
                seriesLabelFontFamily: chartOption.series?.[0]?.label?.fontFamily,
                seriesLabelFontStyle: chartOption.series?.[0]?.label?.fontStyle,
                currentStylingOptions: {
                    fontFamily: stylingOptions?.fontFamily,
                    fontStyle: stylingOptions?.fontStyle,
                    fontSize: stylingOptions?.fontSize,
                    barSpacing: stylingOptions?.barSpacing
                }
            });
        }
    }, [chartOption, stylingOptions]);

    // For "default" theme, don't pass theme prop (use ECharts default)
    // For other themes, pass the theme name to use ECharts built-in themes
    const echartsTheme = theme === 'default' ? undefined : theme;

    return (
        <div className="chart-preview">
            <ReactECharts 
                ref={chartRef}
                option={chartOption} 
                theme={echartsTheme}
                style={{ height: '300px', width: '100%' }}
                notMerge={true}
                lazyUpdate={false}
            />
        </div>
    );
};

ChartPreview.displayName = 'ChartPreview';

// Custom comparison function - only re-render if chartType, theme, importedData, or stylingOptions change
export default React.memo(ChartPreview, (prevProps, nextProps) => {
    const chartTypeSame = prevProps.chartType === nextProps.chartType;
    const themeSame = prevProps.theme === nextProps.theme;
    const importedDataSame = JSON.stringify(prevProps.importedData) === JSON.stringify(nextProps.importedData);
    const stylingOptionsSame = JSON.stringify(prevProps.stylingOptions) === JSON.stringify(nextProps.stylingOptions);
    return chartTypeSame && themeSame && importedDataSame && stylingOptionsSame;
});

