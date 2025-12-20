import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import CSVImportDialogContent from "../components/Charts/CSVImportDialogContent";
import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

const CSVImportDialogApp = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState('bar');
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    const init = async () => {
      try {
        await addOnUISdk.ready;
        
        // Read chart type and theme from URL parameters
        const params = new URLSearchParams(window.location.search);
        const urlChartType = params.get('chartType');
        const urlTheme = params.get('theme');
        
        console.log('🟢 [CSVImportDialog] URL params:', { urlChartType, urlTheme, search: window.location.search });
        
        if (urlChartType) {
          console.log('🟢 [CSVImportDialog] Setting chartType to:', urlChartType);
          setChartType(urlChartType);
        }
        if (urlTheme) {
          console.log('🟢 [CSVImportDialog] Setting theme to:', urlTheme);
          setTheme(urlTheme);
        }
      } catch (err) {
        console.error("Failed to initialize add-on SDK:", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleClose = () => {
    addOnUISdk.instance.runtime.dialog.close();
  };

  const handleDataSubmit = (chartData) => {
    // Send data back to the main app via dialog result
    // The result object will be returned by showModalDialog promise
    console.log('🟢 [CSVImportDialog] Submitting data to close dialog:', chartData);
    addOnUISdk.instance.runtime.dialog.close({
      result: chartData
    });
  };

  if (isLoading) {
    return (
      <div className="csv-import-dialog-loader">
        <div className="csv-import-dialog-spinner" />
        <span>Loading…</span>
      </div>
    );
  }

  console.log('🟢 [CSVImportDialog] Rendering with chartType:', chartType, 'theme:', theme);
  
  return (
    <CSVImportDialogContent
      onClose={handleClose}
      onDataSubmit={handleDataSubmit}
      chartType={chartType}
      theme={theme}
    />
  );
};

const container = document.getElementById("csv-import-dialog-root");
if (container) {
  const root = createRoot(container);
  root.render(<CSVImportDialogApp />);
}

