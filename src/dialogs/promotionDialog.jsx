import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import PromotionPopup from "../components/PromotionPopup/PromotionPopup";
import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

const CONFIG_URL =
  "https://configs.swiftools.com/flags/projects/adobe-express/charts-pro/flags.json";

const PromotionDialogApp = () => {
  const [template, setTemplate] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        await addOnUISdk.ready;
        const params = new URLSearchParams(window.location.search);
        const templateKey = params.get("template");
        const response = await fetch(CONFIG_URL);
        if (!response.ok) {
          throw new Error("Unable to load promotion configuration");
        }
        const data = await response.json();
        const dialogTemplate =
          data?.["ongoing-promotion"]?.templates?.[templateKey] ||
          data?.["ongoing-promotion"]?.templates?.black_friday;
        if (!dialogTemplate) {
          throw new Error("Promotion template unavailable. Please try again later.");
        }
        setTemplate(dialogTemplate);
      } catch (err) {
        console.error("Failed to load promotion dialog:", err);
        setError(err.message || "Unexpected error while loading promotion.");
      } finally {
        setIsLoading(false);
      }
    };
    loadTemplate();
  }, []);

  if (isLoading) {
    return (
      <div className="promotion-dialog-loader">
        <div className="promotion-dialog-spinner" />
        <span>Loading…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, textAlign: "center", fontFamily: "Inter, sans-serif" }}>
        {error}
      </div>
    );
  }

  return (
    <PromotionPopup
      template={template}
      onClose={() => addOnUISdk.instance.runtime.dialog.close()}
      useModalFrame={false}
    />
  );
};

const container = document.getElementById("promotion-dialog-root");
if (container) {
  const root = createRoot(container);
  root.render(<PromotionDialogApp />);
}



