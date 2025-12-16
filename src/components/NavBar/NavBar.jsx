import React from 'react';
import './NavBar.css';

const NavBar = ({ planType = "Basic Plan User", planDescription = "Access to basic features only", onUpgrade }) => {
    return (
        <div className="navbar-container">
            <div className="navbar-content">
                <div className="navbar-text">
                    <div className="navbar-title">{planType} :</div>
                    <div className="navbar-description">{planDescription}</div>
                </div>
                <a 
                    href="#" 
                    className="navbar-upgrade-link"
                    onClick={(e) => {
                        e.preventDefault();
                        if (onUpgrade) onUpgrade();
                    }}
                >
                    Upgrade now.
                </a>
            </div>
        </div>
    );
};

export default NavBar;





