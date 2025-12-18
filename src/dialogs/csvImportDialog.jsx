import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import CSVImportDialogContent from "../components/Charts/CSVImportDialogContent";
import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

const CSVImportDialogApp = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await addOnUISdk.ready;
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

  return (
    <CSVImportDialogContent
      onClose={handleClose}
      onDataSubmit={handleDataSubmit}
    />
  );
};

const container = document.getElementById("csv-import-dialog-root");
if (container) {
  const root = createRoot(container);
  root.render(<CSVImportDialogApp />);
}

