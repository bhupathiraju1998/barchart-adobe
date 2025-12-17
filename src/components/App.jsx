// To support: system="express" scale="medium" color="light"
// import these spectrum web components modules:
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";
import '@spectrum-web-components/icons-workflow/icons/sp-icon-more.js';

// To learn more about using "swc-react" visit:
// https://opensource.adobe.com/spectrum-web-components/using-swc-react/
import { Theme } from "@swc-react/theme";
import React, { useEffect, useState, Suspense } from "react";
import ChartGenerator from "./ChartGenerator/ChartGenerator";
import Confetti from "./Confetti/Confetti";
import "./App.css";

const App = ({ addOnUISdk, sandboxProxy }) => {
    const [isPro, setIsPro] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerLicenseKey, setDrawerLicenseKey] = useState('');
    const [drawerLicenseError, setDrawerLicenseError] = useState('');
    const [drawerLicenseLoading, setDrawerLicenseLoading] = useState(false);
    const [flagsData, setFlagsData] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [confettiKey, setConfettiKey] = useState(0);

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

    // Fetch configuration on mount
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('https://configs.swiftools.com/flags/projects/adobe-express/charts-pro/flags.json');
                if (response.ok) {
                    const data = await response.json();
                    setFlagsData(data);
                }
            } catch (error) {
                console.error('Failed to fetch config:', error);
            }
        };
        fetchConfig();
    }, []);

    const handleSettingsClick = () => {
        setPopoverOpen((open) => !open);
    };

    const handleRemoveLicenseKey = async () => {
        if (!addOnUISdk || !addOnUISdk.instance || !addOnUISdk.instance.clientStorage) {
            console.warn('ClientStorage not available');
            return;
        }
        
        const { clientStorage } = addOnUISdk.instance;
        await clientStorage.removeItem('licenseKey');
        await clientStorage.removeItem('licenseData');
        setIsPro(false);
        setPopoverOpen(false);
    };

    // Reliable confetti trigger function
    const triggerConfetti = () => {
        console.log('🎉 Triggering confetti...');
        setShowConfetti(false); // Reset first
        setConfettiKey(prev => prev + 1); // Force re-render
        setTimeout(() => {
            setShowConfetti(true);
            console.log('🎊 Confetti should now be visible');
            
            // Auto-hide confetti after 8 seconds
            setTimeout(() => {
                setShowConfetti(false);
                console.log('🎊 Confetti hidden');
            }, 8000);
        }, 50); // Small delay to ensure state reset
    };

    const handleLicenseVerified = async (key, licenseData) => {
        if (!addOnUISdk || !addOnUISdk.instance || !addOnUISdk.instance.clientStorage) {
            console.warn('ClientStorage not available');
            return;
        }
        
        const { clientStorage } = addOnUISdk.instance;
        await clientStorage.setItem('licenseKey', key);
        
        if (licenseData) {
            const licenseDataToStore = {
                status: licenseData.status,
                renewal_period_end: licenseData.renewal_period_end,
                renewal_period_start: licenseData.renewal_period_start,
                cancel_at_period_end: licenseData.cancel_at_period_end,
                lastValidated: new Date().toISOString()
            };
            
            await clientStorage.setItem('licenseData', JSON.stringify(licenseDataToStore));
        }
        
        setIsPro(true);
        setDrawerLicenseKey('');
        setDrawerOpen(false);
        triggerConfetti(); // Trigger confetti on success
    };

    const getPricingData = () => {
        if (!flagsData || !flagsData['pricing-page-details']) {
            return null;
        }
        
        const pricingPageDetails = flagsData['pricing-page-details'];
        const projectPricingInfo = pricingPageDetails['pricing-info'];
        
        if (projectPricingInfo && Array.isArray(projectPricingInfo) && projectPricingInfo.length > 0) {
            return projectPricingInfo;
        }
        
        return null;
    };

    const MANAGE_SUBSCRIPTION_URL = "https://adobe.swiftools.com/manage-subscriptions";

    return (
        <Theme system="express" scale="medium" color="light">
            <div className="app-layout">
                {/* Fixed Navbar */}
                <div className="app-navbar">
                    {!isPro && (
                        <>
                            <div className="navbar-spacer"></div>
                            <button 
                                className="navbar-unlock-button"
                                onClick={() => setDrawerOpen(true)}
                            >
                                <div className="upgrade-badge"></div>
                                <div className="upgrade-text">
                                    <span className="upgrade-main">UNLOCK UPGRADE</span>
                                </div>
                            </button>
                        </>
                    )}
                    {isPro && (
                        <>
                            <div className="navbar-spacer"></div>
                            <div className="navbar-upgraded-badge">
                                <span className="navbar-upgraded-text">✨UPGRADED✨</span>
                            </div>
                        </>
                    )}
                    <button
                        aria-label="Open menu"
                        className="navbar-menu-button"
                        onClick={handleSettingsClick}
                    >
                        <sp-icon-more style={{width: 20, height: 20, color: '#888'}}></sp-icon-more>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="app-main-content">
                    <div className="app-view-content">
                        <ChartGenerator sandboxProxy={sandboxProxy} isPro={isPro} />
                    </div>
                </div>

                {/* Settings Drawer - slides from left */}
                {popoverOpen && (
                    <div className="settings-drawer-overlay" onClick={() => setPopoverOpen(false)}>
                        <div className="settings-drawer" onClick={(e) => e.stopPropagation()}>
                            <div className="drawer-header">
                                <h2>Settings</h2>
                                <button className="drawer-close" onClick={() => setPopoverOpen(false)}>×</button>
                            </div>
                            
                            <div className="drawer-content">
                                <div className="settings-menu-list">
                                    {isPro ? (
                                        // Premium user menu options
                                        <>
                                            <button 
                                                className="settings-menu-item"
                                                onClick={() => {
                                                    window.open(MANAGE_SUBSCRIPTION_URL, "_blank");
                                                    setPopoverOpen(false);
                                                }}
                                            >
                                                Manage Subscription
                                            </button>
                                            
                                            {/* Dynamic settings menu items from configuration */}
                                            {flagsData?.['settings-menu-items']?.map((item, index) => {
                                                if (item.isEnabled) {
                                                    return (
                                                        <button
                                                            key={`dynamic-${item.name}-${index}`}
                                                            className="settings-menu-item"
                                                            onClick={() => {
                                                                window.open(item.url, "_blank");
                                                                setPopoverOpen(false);
                                                            }}
                                                        >
                                                            {item.name}
                                                        </button>
                                                    );
                                                }
                                                return null;
                                            })}
                                            
                                            <button
                                                className="settings-menu-item"
                                                onClick={() => {
                                                    handleRemoveLicenseKey();
                                                }}
                                            >
                                                Remove existing Licence key
                                            </button>
                                        </>
                                    ) : (
                                        // Non-premium user menu options
                                        <>
                                            <button
                                                className="settings-menu-item"
                                                onClick={() => {
                                                    setDrawerOpen(true);
                                                    setPopoverOpen(false);
                                                }}
                                            >
                                                Activate License Key
                                            </button>
                                            
                                            {/* Dynamic settings menu items from configuration */}
                                            {flagsData?.['settings-menu-items']?.map((item, index) => {
                                                if (item.isEnabled) {
                                                    return (
                                                        <button
                                                            key={`dynamic-${item.name}-${index}`}
                                                            className="settings-menu-item"
                                                            onClick={() => {
                                                                window.open(item.url, "_blank");
                                                                setPopoverOpen(false);
                                                            }}
                                                        >
                                                            {item.name}
                                                        </button>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upgrade Drawer - slides from right */}
                {drawerOpen && (
                    <div className="upgrade-drawer-overlay" onClick={() => setDrawerOpen(false)}>
                        <div className="upgrade-drawer" onClick={(e) => e.stopPropagation()}>
                            <div className="drawer-header">
                                <h2>Unlock Upgrade</h2>
                                <button className="drawer-close" onClick={() => setDrawerOpen(false)}>×</button>
                            </div>
                            
                            <div className="drawer-content">
                                {/* License Key Activation Section */}
                                <div className="drawer-license-section">
                                    <h3>Activate License Key</h3>
                                    <p>Enter the license key you received after your purchase to unlock all Upgrade features.</p>
                                    <input
                                        type="text"
                                        className="drawer-license-input"
                                        placeholder="Enter your license key"
                                        value={drawerLicenseKey}
                                        onChange={(e) => {
                                            setDrawerLicenseKey(e.target.value);
                                            setDrawerLicenseError('');
                                        }}
                                    />
                                    {drawerLicenseError && <p className="drawer-license-error">{drawerLicenseError}</p>}
                                    <button 
                                        className="drawer-license-activate-button" 
                                        onClick={async () => {
                                            if (!drawerLicenseKey) {
                                                setDrawerLicenseError('Please enter a license key.');
                                                return;
                                            }
                                            setDrawerLicenseError('');
                                            setDrawerLicenseLoading(true);
                                            
                                            try {
                                                const WORKER_URL = 'https://api.swiftools.com/license-verifier';
                                                const response = await fetch(WORKER_URL, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({ licenseKey: drawerLicenseKey, productName: 'charts-pro'}),
                                                });
                                                
                                                const data = await response.json();
                                                
                                                if (response.ok && data.valid === true && (data.status === 'active' || data.status === 'completed')) {
                                                    await handleLicenseVerified(drawerLicenseKey, data);
                                                } else {
                                                    const errorMessage = data.message || 'License validation failed: Try again later.';
                                                    setDrawerLicenseError(errorMessage);
                                                }
                                            } catch (error) {
                                                console.error("Error verifying license:", error);
                                                setDrawerLicenseError('Could not connect to verification server. Please check your internet connection.');
                                            } finally {
                                                setDrawerLicenseLoading(false);
                                            }
                                        }}
                                        disabled={drawerLicenseLoading}
                                    >
                                        {drawerLicenseLoading ? 'Verifying...' : 'Activate License Key'}
                                    </button>
                                </div>

                                {/* Pricing Plans Section */}
                                <div className="drawer-pricing-section">
                                    <h3>Pricing Plans</h3>
                                    {getPricingData() ? (
                                        <div className="drawer-pricing-options">
                                            {getPricingData().map((plan, index) => (
                                                <div 
                                                    key={index}
                                                    className={`drawer-pricing-option ${plan.isHighlighted ? 'drawer-pricing-option--highlighted' : ''}`}
                                                    onClick={() => {
                                                        window.open(plan.url, "_blank");
                                                    }}
                                                >
                                                    <div className="drawer-pricing-content">
                                                        <div className="drawer-pricing-left">
                                                            <h4>{plan.title}</h4>
                                                            <p className="drawer-pricing-subtitle">{plan.subtitle}</p>
                                                        </div>
                                                        <div className="drawer-pricing-right">
                                                            <p className="drawer-pricing-price">{plan.price}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="drawer-pricing-options">
                                            <div className="drawer-pricing-option drawer-pricing-option--highlighted" onClick={() => {
                                                window.open("https://whop.com/checkout/plan_azOUBQZrkKxLa", "_blank");
                                            }}>
                                                <div className="drawer-pricing-content">
                                                    <div className="drawer-pricing-left">
                                                        <h4>Annual Plan</h4>
                                                        <p className="drawer-pricing-subtitle">Best Value!</p>
                                                    </div>
                                                    <div className="drawer-pricing-right">
                                                        <p className="drawer-pricing-price">$29.99/year</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="drawer-pricing-option" onClick={() => {
                                                window.open("https://whop.com/checkout/plan_gcusW3CtrJbfu", "_blank");
                                            }}>
                                                <div className="drawer-pricing-content">
                                                    <div className="drawer-pricing-left">
                                                        <h4>Monthly Plan</h4>
                                                        <p className="drawer-pricing-subtitle">Starter's Plan</p>
                                                    </div>
                                                    <div className="drawer-pricing-right">
                                                        <p className="drawer-pricing-price">$4.99/month</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Pro Users Message */}
                                <div className="drawer-pro-message">
                                    <p>Pro users get unlimited generation</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confetti Effect */}
                {showConfetti && (
                    <Suspense fallback={null}>
                        <Confetti key={confettiKey} duration={8000} />
                    </Suspense>
                )}
            </div>
        </Theme>
    );
};

export default App;
