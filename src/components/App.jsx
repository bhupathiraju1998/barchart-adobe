// To support: system="express" scale="medium" color="light"
// import these spectrum web components modules:
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

// To learn more about using "swc-react" visit:
// https://opensource.adobe.com/spectrum-web-components/using-swc-react/
import { Theme } from "@swc-react/theme";
import React, { useEffect } from "react";
import NavBar from "./NavBar/NavBar";
import ChartGenerator from "./ChartGenerator/ChartGenerator";
import "./App.css";

const App = ({ addOnUISdk, sandboxProxy }) => {
    // Inject styles for Spectrum menu items to handle shadow DOM
    useEffect(() => {
        const styleId = 'spectrum-menu-item-padding';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                sp-menu-item {
                    --spectrum-menu-item-padding-left: 20px !important;
                    --spectrum-menu-item-padding-right: 16px !important;
                    --spectrum-menu-item-padding-top: 12px !important;
                    --spectrum-menu-item-padding-bottom: 12px !important;
                }
                /* Try to target shadow DOM content */
                sp-menu-item::part(content),
                sp-menu-item::part(text) {
                    padding-left: 20px !important;
                }
            `;
            document.head.appendChild(style);
        }

        // Also try to apply styles directly to elements after they're created
        const observer = new MutationObserver(() => {
            const menuItems = document.querySelectorAll('sp-menu-item');
            menuItems.forEach(item => {
                if (item.shadowRoot) {
                    const style = document.createElement('style');
                    style.textContent = `
                        :host {
                            --spectrum-menu-item-padding-left: 20px !important;
                            --spectrum-menu-item-padding-right: 16px !important;
                            --spectrum-menu-item-padding-top: 12px !important;
                            --spectrum-menu-item-padding-bottom: 12px !important;
                        }
                        .item {
                            padding-left: 20px !important;
                            padding-right: 16px !important;
                            padding-top: 12px !important;
                            padding-bottom: 12px !important;
                        }
                    `;
                    if (!item.shadowRoot.querySelector('style[data-custom-padding]')) {
                        style.setAttribute('data-custom-padding', 'true');
                        item.shadowRoot.appendChild(style);
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    function handleUpgrade() {
        // Handle upgrade action
        console.log("Upgrade clicked");
        // You can add your upgrade logic here
    }

    return (
        // Please note that the below "<Theme>" component does not react to theme changes in Express.
        // You may use "addOnUISdk.app.ui.theme" to get the current theme and react accordingly.
        <Theme system="express" scale="medium" color="light">
            <div className="app-wrapper">
                <NavBar 
                    planType="Basic Plan User"
                    planDescription="Access to basic features only"
                    onUpgrade={handleUpgrade}
                />
                <ChartGenerator sandboxProxy={sandboxProxy} />
            </div>
        </Theme>
    );
};

export default App;
