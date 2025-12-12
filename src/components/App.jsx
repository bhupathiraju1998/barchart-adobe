// To support: system="express" scale="medium" color="light"
// import these spectrum web components modules:
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

// To learn more about using "swc-react" visit:
// https://opensource.adobe.com/spectrum-web-components/using-swc-react/
import { Theme } from "@swc-react/theme";
import React from "react";
import NavBar from "./NavBar/NavBar";
import ChartGenerator from "./ChartGenerator/ChartGenerator";
import "./App.css";

const App = ({ addOnUISdk, sandboxProxy }) => {
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
