import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";

import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

const initApp = async () => {
    try {
        await addOnUISdk.ready;
        console.log("addOnUISdk is ready for use.");

        const rootElement = document.getElementById("root");
        if (!rootElement) {
            console.error("Root element not found");
            return;
        }

        let sandboxProxy = null;
        
        if (addOnUISdk.instance && addOnUISdk.instance.runtime) {
            const runtime = addOnUISdk.instance.runtime;
            console.log("🟡 [Index] Requesting sandbox proxy...");
            
            // Request API proxy with retry logic
            try {
                sandboxProxy = await Promise.race([
                    runtime.apiProxy("documentSandbox"),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Proxy timeout')), 5000))
                ]);
                console.log("✅ [Index] Sandbox proxy obtained:", sandboxProxy);
            } catch (proxyError) {
                console.warn("⚠️ [Index] First proxy attempt failed:", proxyError);
                // Retry once
                try {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    sandboxProxy = await runtime.apiProxy("documentSandbox");
                    console.log("✅ [Index] Sandbox proxy obtained on retry:", sandboxProxy);
                } catch (retryError) {
                    console.warn('❌ [Index] Sandbox proxy unavailable after retry:', retryError);
                    sandboxProxy = null;
                }
            }
        } else {
            console.warn("⚠️ [Index] addOnUISdk.instance or runtime not available");
        }

        // Create React root and render
        const root = createRoot(rootElement);
        root.render(<App sandboxProxy={sandboxProxy} addOnUISdk={addOnUISdk || {}}/>);
        
    } catch (error) {
        // Silently handle errors - still render the app
        console.warn('Initialization warning:', error);
        
        // Render app anyway - it should handle missing features gracefully
        const rootElement = document.getElementById("root");
        if (rootElement) {
            const root = createRoot(rootElement);
            root.render(<App sandboxProxy={null} addOnUISdk={addOnUISdk || {}}/>);
        }
    }
};

// Start initialization
initApp();
