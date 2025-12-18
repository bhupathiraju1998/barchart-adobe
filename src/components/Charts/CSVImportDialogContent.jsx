import React, { useState, useRef, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import ReactECharts from 'echarts-for-react';
import './CSVImportDialogContent.css';

const CSVImportDialogContent = ({ onClose, onDataSubmit }) => {
  // Get sample data structure
  const getSampleData = () => {
    return [
      ['Day', 'Sales'],
      ['Mon', '120'],
      ['Tue', '200'],
      ['Wed', '150'],
      ['Thu', '80'],
      ['Fri', '70'],
      ['Sat', '110'],
      ['Sun', '130']
    ];
  };

  // Initialize with sample data
  const initializeSampleData = () => {
    const sampleData = getSampleData();
    const sampleHeaders = sampleData[0];
    const sampleRows = sampleData.slice(1).map(row => {
      const rowObj = {};
      sampleHeaders.forEach((header, index) => {
        rowObj[header] = row[index] || '';
      });
      return rowObj;
    });
    return { headers: sampleHeaders, rows: sampleRows };
  };

  const initialData = initializeSampleData();
  const [tableData, setTableData] = useState(initialData.rows);
  const [headers, setHeaders] = useState(initialData.headers);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Load sample data (reset to sample)
  const handleTrySampleData = useCallback(() => {
    const initial = initializeSampleData();
    setHeaders(initial.headers);
    setTableData(initial.rows);
  }, []);

  // Download sample CSV
  const handleDownloadSample = useCallback((e) => {
    e.preventDefault();
    try {
      const sampleData = getSampleData();
      const csvContent = sampleData.map(row => 
        row.map(cell => {
          const escaped = String(cell).replace(/"/g, '""');
          if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
            return `"${escaped}"`;
          }
          return escaped;
        }).join(',')
      ).join('\n');

      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csvContent;

      const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'sample-chart-data.csv';
      link.style.display = 'none';
      document.body.appendChild(link);
      
      requestAnimationFrame(() => {
        link.click();
        setTimeout(() => {
          if (link.parentNode) {
            document.body.removeChild(link);
          }
          URL.revokeObjectURL(blobUrl);
        }, 100);
      });
    } catch (error) {
      console.error('Error creating CSV download:', error);
      alert('Failed to download sample file.');
    }
  }, []);

  // Parse CSV file
  const parseCSV = async (file) => {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('File must contain at least a header row and one data row.');
    }

    const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const validHeaderIndices = [];
    const validHeaders = [];
    
    rawHeaders.forEach((header, index) => {
      if (header && header.trim() !== '') {
        validHeaderIndices.push(index);
        validHeaders.push(header);
      }
    });
    
    if (validHeaders.length === 0) {
      throw new Error('File must contain valid column headers.');
    }
    
    const headerCounts = {};
    const duplicateHeaders = [];
    
    validHeaders.forEach((header) => {
      if (headerCounts[header]) {
        headerCounts[header]++;
        if (headerCounts[header] === 2) {
          duplicateHeaders.push(header);
        }
      } else {
        headerCounts[header] = 1;
      }
    });
    
    if (duplicateHeaders.length > 0) {
      throw new Error('File contains duplicate column headers.');
    }

    const data = lines.slice(1).map((line) => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row = {};
      validHeaders.forEach((header, index) => {
        const originalIndex = validHeaderIndices[index];
        row[header] = values[originalIndex] || '';
      });
      return row;
    }).filter(row => {
      return Object.values(row).some(val => val && val.trim() !== '');
    });

    if (data.length === 0) {
      throw new Error('File must contain at least one data row.');
    }

    return { headers: validHeaders, data };
  };

  // Parse Excel file
  const parseExcel = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    if (jsonData.length < 2) {
      throw new Error('File must contain at least a header row and one data row.');
    }

    const rawHeaders = jsonData[0].map(h => String(h || '').trim());
    
    const validHeaderIndices = [];
    const validHeaders = [];
    
    rawHeaders.forEach((header, index) => {
      if (header && header.trim() !== '') {
        validHeaderIndices.push(index);
        validHeaders.push(header);
      }
    });
    
    if (validHeaders.length === 0) {
      throw new Error('File must contain valid column headers.');
    }
    
    const headerCounts = {};
    const duplicateHeaders = [];
    
    validHeaders.forEach((header) => {
      if (headerCounts[header]) {
        headerCounts[header]++;
        if (headerCounts[header] === 2) {
          duplicateHeaders.push(header);
        }
      } else {
        headerCounts[header] = 1;
      }
    });
    
    if (duplicateHeaders.length > 0) {
      throw new Error('File contains duplicate column headers.');
    }

    const data = jsonData.slice(1).map((row) => {
      const rowObj = {};
      validHeaders.forEach((header, index) => {
        const originalIndex = validHeaderIndices[index];
        rowObj[header] = String(row[originalIndex] || '').trim();
      });
      return rowObj;
    }).filter(row => {
      return Object.values(row).some(val => val && val.trim() !== '');
    });

    if (data.length === 0) {
      throw new Error('File must contain at least one data row.');
    }

    return { headers: validHeaders, data };
  };

  const handleFile = async (file) => {
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    
    if (!isCSV && !isExcel) {
      alert('Please select a CSV or Excel file (.csv, .xlsx, .xls).');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsLoading(true);
    
    try {
      let parsedData;
      
      if (isCSV) {
        parsedData = await parseCSV(file);
      } else {
        parsedData = await parseExcel(file);
      }

      if (parsedData.headers.length < 2) {
        throw new Error('File must contain at least 2 columns: one for labels and one for values.');
      }

      setHeaders(parsedData.headers);
      setTableData(parsedData.data);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert(error.message || 'The file you selected is invalid.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Handle cell edit
  const handleCellEdit = useCallback((rowIndex, header, value) => {
    setTableData(prevData => {
      const newData = [...prevData];
      newData[rowIndex] = {
        ...newData[rowIndex],
        [header]: value
      };
      return newData;
    });
  }, []);

  // Add new row
  const handleAddRow = useCallback(() => {
    if (!headers.length) return;
    const newRow = {};
    headers.forEach(header => {
      newRow[header] = '';
    });
    setTableData(prevData => [...(prevData || []), newRow]);
  }, [headers]);

  // Delete row
  const handleDeleteRow = useCallback((rowIndex) => {
    setTableData(prevData => {
      const newData = [...prevData];
      newData.splice(rowIndex, 1);
      return newData;
    });
  }, []);

  // Submit data
  const handleSubmit = useCallback(() => {
    if (!tableData || !headers.length || tableData.length === 0) {
      alert('Please add some data before submitting.');
      return;
    }

    if (headers.length < 2) {
      alert('Data must contain at least 2 columns: one for labels and one for values.');
      return;
    }

    const labelColumn = headers[0];
    const valueColumn = headers[1];
    
    const chartData = {
      labels: tableData.map(row => row[labelColumn] || ''),
      values: tableData.map(row => parseFloat(row[valueColumn]) || 0)
    };

    // Validate that we have at least some numeric values
    const hasValidNumbers = chartData.values.some(val => !isNaN(val) && isFinite(val));
    if (!hasValidNumbers) {
      alert('The values column must contain numeric data.');
      return;
    }

    console.log('🟢 [CSVImportDialogContent] Submitting data:', chartData);
    onDataSubmit(chartData);
  }, [tableData, headers, onDataSubmit]);

  // Generate chart option for preview
  const chartOption = useMemo(() => {
    if (!tableData || !headers.length || tableData.length === 0) {
      return null;
    }

    const labelColumn = headers[0];
    const valueColumn = headers[1];
    
    const labels = tableData.map(row => row[labelColumn] || '');
    const values = tableData.map(row => parseFloat(row[valueColumn]) || 0);

    return {
      title: {
        text: 'Chart Preview',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          rotate: labels.length > 5 ? 45 : 0
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: values,
        type: 'bar',
        itemStyle: {
          color: '#5470c6'
        }
      }]
    };
  }, [tableData, headers]);

  return (
    <div className="csv-import-dialog-content">
      <div className="csv-import-dialog-header">
        <h2>Import CSV Data</h2>
        <button className="csv-import-dialog-close" onClick={onClose}>×</button>
      </div>

      <div className="csv-import-dialog-body">
        <div className="csv-import-left-panel">
          <div className="csv-import-actions">
            <button 
              className="csv-import-try-sample-btn"
              onClick={handleTrySampleData}
            >
              Try with Sample Data
            </button>
            <a 
              href="#" 
              className="csv-import-download-link"
              onClick={handleDownloadSample}
            >
              Download CSV Sample
            </a>
          </div>

          <div 
            className={`csv-import-drop-zone ${isDragOver ? 'drag-over' : ''}`}
            onClick={handleImportClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            style={{ cursor: 'pointer' }}
          >
            <p className="drop-text">Click to import CSV or Excel file</p>
            <p className="drop-or">or</p>
            <p className="drop-text">Drag and drop your file here</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {isLoading && (
            <div className="csv-import-loading">Processing...</div>
          )}

          {tableData && headers.length > 0 && (
            <div className="csv-import-table-container">
              <div className="csv-import-table-header">
                <h3>Edit Data</h3>
                <button 
                  className="csv-import-add-row-btn"
                  onClick={handleAddRow}
                >
                  + Add Row
                </button>
              </div>
              <div className="csv-import-table-wrapper">
                <table className="csv-import-table">
                  <thead>
                    <tr>
                      {headers.map((header, idx) => (
                        <th key={idx}>{header}</th>
                      ))}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {headers.map((header, colIndex) => (
                          <td key={colIndex}>
                            <input
                              type="text"
                              value={row[header] || ''}
                              onChange={(e) => handleCellEdit(rowIndex, header, e.target.value)}
                              className="csv-import-cell-input"
                            />
                          </td>
                        ))}
                        <td>
                          <button
                            className="csv-import-delete-row-btn"
                            onClick={() => handleDeleteRow(rowIndex)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="csv-import-dialog-footer">
            <button 
              className="csv-import-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="csv-import-submit-btn"
              onClick={handleSubmit}
              disabled={!tableData || tableData.length === 0}
            >
              Apply Data
            </button>
          </div>
        </div>

        <div className="csv-import-right-panel">
          <div className="csv-import-preview-container">
            <h3>Chart Preview</h3>
            {chartOption ? (
              <ReactECharts 
                option={chartOption}
                style={{ height: '400px', width: '100%' }}
                notMerge={true}
                lazyUpdate={false}
              />
            ) : (
              <div className="csv-import-preview-placeholder">
                <p>Import data or try sample data to see preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVImportDialogContent;

