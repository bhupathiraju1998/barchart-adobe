// To support: system="express" scale="medium" color="light"
// import these spectrum web components modules:
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";
import '@spectrum-web-components/icons-workflow/icons/sp-icon-more.js';

// To learn more about using "swc-react" visit:
// https://opensource.adobe.com/spectrum-web-components/using-swc-react/
import { Theme } from "@swc-react/theme";
import React, { useEffect, useState, Suspense, useMemo, useCallback } from "react";
import ChartGenerator from "./ChartGenerator/ChartGenerator";
import Confetti from "./Confetti/Confetti";
import WhatsAppSupportWidget from "./WhatsAppSupportWidget/WhatsAppSupportWidget";
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
    const [adobeUserType, setAdobeUserType] = useState("free");
    const [emailModalEnabled, setEmailModalEnabled] = useState(false);
    const [hasSubmittedEmail, setHasSubmittedEmail] = useState(false);

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
                // Check if online
                if (!navigator.onLine) {
                    setEmailModalEnabled(false);
                    // Still try to load project config if cached
                    try {
                        const response = await fetch('https://configs.swiftools.com/flags/projects/adobe-express/charts-pro/flags.json');
                        if (response.ok) {
                            const data = await response.json();
                            setFlagsData(data);
                        }
                    } catch (e) {
                        // Silent fail for offline
                    }
                    return;
                }

                // Fetch both configuration URLs with timeout
                const fetchWithTimeout = (url, timeout = 5000) => {
                    return Promise.race([
                        fetch(url),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Fetch timeout')), timeout)
                        )
                    ]);
                };

                const [commonResponse, projectResponse] = await Promise.all([
                    fetchWithTimeout('https://configs.swiftools.com/flags/shared/common-flags.json').catch(() => null),
                    fetchWithTimeout('https://configs.swiftools.com/flags/projects/adobe-express/charts-pro/flags.json').catch(() => null)
                ]);

                // If both fail, disable modal
                if (!commonResponse || !projectResponse || !commonResponse.ok || !projectResponse.ok) {
                    setEmailModalEnabled(false);
                    // Still try to set flagsData from project config if available
                    if (projectResponse?.ok) {
                        try {
                            const projectText = await projectResponse.text();
                            const projectData = JSON.parse(projectText);
                            setFlagsData(projectData);
                        } catch (e) {
                            console.error('Failed to parse project config:', e);
                        }
                    }
                    return;
                }

                // Get text first to handle JSON parse errors
                const [commonText, projectText] = await Promise.all([
                    commonResponse.text(),
                    projectResponse.text()
                ]);

                try {
                    const commonConfig = JSON.parse(commonText);
                    const projectConfig = JSON.parse(projectText);

                    // Check both isEnabled flags
                    const commonEnabled = commonConfig.flags?.adobe_express_integration?.free_access_popup?.isEnabled;
                    const projectEnabled = projectConfig.flags?.free_access_popup?.isEnabled;

                    // Both must be true for email modal
                    const modalEnabled = commonEnabled === true && projectEnabled === true;
                    setEmailModalEnabled(modalEnabled);

                    // Set flagsData from project config
                    setFlagsData(projectConfig);
                } catch (parseError) {
                    console.error('JSON Parse Error in fetchConfig:', parseError.message);
                    setEmailModalEnabled(false);
                    // Still try to set flagsData if project config parsed successfully
                    try {
                        const projectConfig = JSON.parse(projectText);
                        setFlagsData(projectConfig);
                    } catch (e) {
                        // Both failed, leave flagsData as is
                    }
                }
            } catch (error) {
                console.error('Configuration fetch failed:', error);
                setEmailModalEnabled(false);
            }
        };
        fetchConfig();
    }, []);

    // Check if user has already submitted email (from storage)
    useEffect(() => {
        const checkEmailSubmission = async () => {
            if (!addOnUISdk?.instance?.clientStorage) {
                return;
            }
            try {
                const { clientStorage } = addOnUISdk.instance;
                const submittedEmail = await clientStorage.getItem('emailSubmitted');
                if (submittedEmail === 'true') {
                    setHasSubmittedEmail(true);
                }
            } catch (error) {
                console.error('Error checking email submission:', error);
            }
        };
        checkEmailSubmission();
    }, [addOnUISdk]);

    // Handler for when email is successfully submitted
    const handleEmailSubmitted = useCallback(async () => {
        setHasSubmittedEmail(true);
        // Store in clientStorage
        if (addOnUISdk?.instance?.clientStorage) {
            try {
                await addOnUISdk.instance.clientStorage.setItem('emailSubmitted', 'true');
            } catch (error) {
                console.error('Error storing email submission:', error);
            }
        }
    }, [addOnUISdk]);

    // Resolve Adobe account type
    useEffect(() => {
        let isMounted = true;
        const resolveAdobeAccountType = async () => {
            if (!addOnUISdk?.app) {
                return;
            }
            try {
                let profile = null;
                if (typeof addOnUISdk.app.getUserProfile === "function") {
                    profile = await addOnUISdk.app.getUserProfile();
                } else if (addOnUISdk.app.currentUserProfile) {
                    profile = await addOnUISdk.app.currentUserProfile;
                }
                let normalizedType = "free";
                const extractedType =
                    profile?.planType ||
                    profile?.accountType ||
                    profile?.type ||
                    profile?.userType ||
                    profile?.tier;
                if (typeof extractedType === "string" && extractedType.length > 0) {
                    normalizedType = extractedType.toLowerCase().includes("premium") ? "premium" : "free";
                } else if (profile?.isPaid === true) {
                    normalizedType = "premium";
                }
                if (isMounted) {
                    setAdobeUserType(normalizedType);
                }
            } catch (error) {
                console.warn("Unable to resolve Adobe account type:", error);
                if (isMounted) {
                    setAdobeUserType("free");
                }
            }
        };

        resolveAdobeAccountType();

        return () => {
            isMounted = false;
        };
    }, [addOnUISdk]);

    // Promotion config memo
    const promotionConfig = useMemo(() => {
        if (!flagsData?.["ongoing-promotion"]?.isEnabled) {
            return null;
        }

        const promotion = flagsData["ongoing-promotion"];
        const banner = promotion?.promotion_details?.landing_page_banner;
        if (!banner?.isEnabled) {
            return null;
        }

        const normalizedAdobeUserType = (adobeUserType || "free").toLowerCase();
        const adobeUserFilters = Array.isArray(promotion.enabledForAdobeUserTypes)
            ? promotion.enabledForAdobeUserTypes.map((type) => type?.toLowerCase())
            : null;

        if (
            adobeUserFilters &&
            adobeUserFilters.length > 0 &&
            !adobeUserFilters.includes(normalizedAdobeUserType)
        ) {
            return null;
        }

        if (promotion.enabledForPaidUsers === false && isPro) {
            return null;
        }

        return {
            banner,
            buttonAction: banner["button-action"],
            templates: promotion.templates || {},
        };
    }, [flagsData, adobeUserType, isPro]);

    // Handle promotion popup
    const handlePromotionPopup = useCallback(
        async (templateKey) => {
            if (!templateKey) {
                console.warn("Promotion popup missing template key");
                return;
            }
            if (!addOnUISdk?.app?.showModalDialog) {
                console.warn("showModalDialog API unavailable");
                return;
            }
            const dialogUrl = `promotion-dialog.html?template=${encodeURIComponent(templateKey)}`;
            
            // Get title from template content header text
            const template = flagsData?.["ongoing-promotion"]?.templates?.[templateKey];
            const dialogTitle = template?.content?.header?.title || "Special Offer";
            const dialogHeight = template?.content?.specs?.height || 600;
            const dialogWidth = template?.content?.specs?.width || 960;
            
            try {
                await addOnUISdk.app.showModalDialog({
                    variant: "custom",
                    title: dialogTitle,
                    src: dialogUrl,
                    size: { width: dialogWidth, height: dialogHeight },
                });
            } catch (error) {
                console.error("Error launching promotion dialog:", error);
            }
        },
        [addOnUISdk, flagsData]
    );

    // Handle promotion action
    const handlePromotionAction = useCallback(
        async (action) => {
            if (!action) {
                return;
            }
            const actionType = action.type;
            if (actionType === "url") {
                if (action.url) {
                    window.open(action.url, "_blank", "noopener,noreferrer");
                }
                return;
            }
            if (actionType === "inScreenOpenUrl") {
                const inScreenOpenUrlConfig = action.inScreenOpenUrl;
                const targetUrl = 
                    (typeof inScreenOpenUrlConfig === "object" && inScreenOpenUrlConfig?.url) 
                        ? inScreenOpenUrlConfig.url 
                        : (typeof inScreenOpenUrlConfig === "string" 
                            ? inScreenOpenUrlConfig 
                            : action.url);
                
                if (targetUrl) {
                    const width = (typeof inScreenOpenUrlConfig === "object" && inScreenOpenUrlConfig?.width) 
                        ? inScreenOpenUrlConfig.width 
                        : 1200;
                    const height = (typeof inScreenOpenUrlConfig === "object" && inScreenOpenUrlConfig?.height) 
                        ? inScreenOpenUrlConfig.height 
                        : 800;
                    
                    const popupFeatures = `width=${width},height=${height},scrollbars=yes,resizable=yes`;
                    const popup = window.open(targetUrl, "offerPopup", popupFeatures);
                    
                    if (popup) {
                        popup.focus();
                    } else {
                        console.warn("Popup blocked, opening in new tab instead");
                        window.open(targetUrl, "_blank", "noopener,noreferrer");
                    }
                }
                return;
            }
            if (actionType === "inScreenPopup") {
                await handlePromotionPopup(action?.inScreenPopup?.currentTemplate);
                return;
            }
        },
        [handlePromotionPopup]
    );

    // On-load promotion popup (delay + show-once logic)
    useEffect(() => {
        // Early return if conditions not met
        if (
            !flagsData?.["ongoing-promotion"]?.onload_promotion_popup?.isEnabled
        ) {
            return;
        }

        const popupConfig = flagsData["ongoing-promotion"].onload_promotion_popup;
        const templateKey = popupConfig.template || promotionConfig?.buttonAction?.inScreenPopup?.currentTemplate;
        
        if (!templateKey) {
            console.warn("Promotion popup template key not found");
            return;
        }
        
        const delayMs = Math.max(0, (popupConfig.on_load_delay_seconds || 0) * 1000);
        const showOnlyOnce = popupConfig.show_only_once_per_user === true;

        // Check if we should show the popup
        const checkAndShowPopup = async () => {
            if (showOnlyOnce && addOnUISdk?.instance?.clientStorage) {
                try {
                    const storageKey = `promotion_popup_shown_${templateKey}`;
                    const alreadyShown = await addOnUISdk.instance.clientStorage.getItem(storageKey);
                    if (alreadyShown === "true") {
                        return;
                    }
                } catch (error) {
                    console.warn("Error checking promotion popup status:", error);
                }
            }

            handlePromotionPopup(templateKey);

            if (showOnlyOnce && addOnUISdk?.instance?.clientStorage) {
                try {
                    const storageKey = `promotion_popup_shown_${templateKey}`;
                    await addOnUISdk.instance.clientStorage.setItem(storageKey, "true");
                } catch (error) {
                    console.warn("Error saving promotion popup status:", error);
                }
            }
        };

        const timer = setTimeout(() => {
            checkAndShowPopup();
        }, delayMs);

        return () => {
            clearTimeout(timer);
        };
    }, [flagsData, promotionConfig, handlePromotionPopup, addOnUISdk]);

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
                    {/* Promotion Banner */}
                    {promotionConfig && (
                        <div
                            className={`promotion-banner promotion-banner--${promotionConfig.banner.banner_position || "top"}`}
                            style={{
                                backgroundColor: promotionConfig.banner.background_color,
                                color: promotionConfig.banner.text_color,
                            }}
                        >
                            <div
                                className={`promotion-banner__text ${
                                    promotionConfig.banner.marquee_enabled ? "promotion-banner__text--marquee" : ""
                                }`}
                            >
                                <span>{promotionConfig.banner.title}</span>
                            </div>
                            <button
                                className="promotion-banner__button"
                                disabled={!promotionConfig.buttonAction}
                                onClick={() => handlePromotionAction(promotionConfig.buttonAction)}
                                style={{ color: promotionConfig.banner.text_color }}
                            >
                                {promotionConfig.banner.button_text || "Learn More"}
                            </button>
                        </div>
                    )}

                    <div className="app-view-content">
                        <ChartGenerator 
                            sandboxProxy={sandboxProxy} 
                            isPro={isPro} 
                            addOnUISdk={addOnUISdk}
                            onOpenUpgradeDrawer={() => setDrawerOpen(true)}
                            emailModalEnabled={emailModalEnabled}
                            hasSubmittedEmail={hasSubmittedEmail}
                            onEmailSubmitted={handleEmailSubmitted}
                        />
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
                                    <p>Pro users get access to all charts and themes.</p>
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

                {/* WhatsApp Support Widget - appears on all pages when enabled */}
                <WhatsAppSupportWidget flagsData={flagsData} />
            </div>
        </Theme>
    );
};

export default App;
