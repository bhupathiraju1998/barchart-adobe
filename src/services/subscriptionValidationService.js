// Subscription validation service for checking license expiration
// Handles monthly, yearly, and lifetime licenses

/**
 * Validates subscription based on API response data
 * @param {Object} data - License verification API response
 * @returns {Object} Validation result with valid flag, type, reason, etc.
 */
export const validateSubscription = (data) => {
    // 1. Base validation check
    if (data.valid !== true) {
        return { 
            valid: false, 
            reason: 'License not valid',
            shouldRevoke: true 
        };
    }

    // 2. Check for lifetime license
    // Lifetime = status "completed" + no renewal periods
    const isLifetime = data.status === 'completed' && 
                       data.renewal_period_end === null && 
                       data.renewal_period_start === null;
    
    if (isLifetime) {
        return { 
            valid: true, 
            type: 'lifetime',
            reason: 'Lifetime license - no expiration' 
        };
    }

    // 3. Check active subscriptions (monthly/yearly)
    if (data.status === 'active') {
        // Check renewal_period_end for expiration
        if (data.renewal_period_end) {
            // Convert Unix timestamp (seconds) to JavaScript Date (milliseconds)
            const renewalEnd = new Date(data.renewal_period_end * 1000);
            const now = new Date();
            
            if (now > renewalEnd) {
                return { 
                    valid: false, 
                    reason: 'Subscription renewal period expired',
                    shouldRevoke: true 
                };
            }
            
            // Active subscription with valid renewal period
            return { 
                valid: true, 
                type: 'subscription',
                expiresAt: renewalEnd,
                reason: 'Active subscription' 
            };
        } else {
            // Active but no renewal period (shouldn't happen, but handle gracefully)
            return { 
                valid: true, 
                type: 'subscription',
                reason: 'Active subscription (no expiration data)' 
            };
        }
    }

    // 4. Handle "completed" status (could be lifetime or expired subscription)
    if (data.status === 'completed') {
        // If renewal_period_end exists, check if it's expired
        if (data.renewal_period_end) {
            const renewalEnd = new Date(data.renewal_period_end * 1000);
            if (new Date() > renewalEnd) {
                return { 
                    valid: false, 
                    reason: 'Subscription expired',
                    shouldRevoke: true 
                };
            }
            // If not expired, might be a special case
            return { 
                valid: true, 
                type: 'subscription',
                expiresAt: renewalEnd,
                reason: 'Completed status with valid period' 
            };
        }
        // If no renewal period, assume lifetime
        return { 
            valid: true, 
            type: 'lifetime',
            reason: 'Completed status (lifetime or one-time purchase)' 
        };
    }

    // 5. Invalid status (cancelled, expired, etc.)
    return { 
        valid: false, 
        reason: `Invalid subscription status: ${data.status}`,
        shouldRevoke: true 
    };
};

/**
 * Re-validates subscription with server
 * @param {string} licenseKey - License key to validate
 * @returns {Promise<Object>} Validation result with full license data
 */
export const revalidateSubscription = async (licenseKey) => {
    try {
        const response = await fetch('https://api.swiftools.com/license-verifier', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ licenseKey, productName: 'charts-pro' }),
        });
        
        if (!response.ok) {
            throw new Error(`Verification request failed: ${response.status}`);
        }
        
        const data = await response.json();
        const validation = validateSubscription(data);
        
        return {
            ...validation,
            licenseData: data,
            success: true
        };
    } catch (error) {
        console.error('Error revalidating subscription:', error);
        return {
            success: false,
            valid: false,
            error: error.message
        };
    }
};

