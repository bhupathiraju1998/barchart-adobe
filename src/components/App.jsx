// To support: system="express" scale="medium" color="light"
// import these spectrum web components modules:
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

// To learn more about using "swc-react" visit:
// https://opensource.adobe.com/spectrum-web-components/using-swc-react/
import { Button } from "@swc-react/button";
import { Theme } from "@swc-react/theme";
import React, { useState } from "react";
import NavBar from "./NavBar/NavBar";
import "./App.css";

const App = ({ addOnUISdk }) => {
    const [buttonLabel, setButtonLabel] = useState("Click me");

    function handleClick() {
        setButtonLabel("Clicked");
    }

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
                <div className="scrollable-content">
                    <div className="container">
                        <Button size="m" onClick={handleClick}>
                            {buttonLabel}
                        </Button>
                        {/* Your chart generator content will go here */}
                    </div>
                </div>
            </div>
        </Theme>
    );
};

export default App;
