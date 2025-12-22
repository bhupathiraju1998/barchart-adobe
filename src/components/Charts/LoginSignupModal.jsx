import React, { useState, useEffect } from 'react';
import { sendDirectNotification } from '../../services/notificationService';
import './LoginSignupModal.css';

const LoginSignupModal = ({ isOpen, onClose, onSubmit, addOnUISdk }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);
  const [error, setError] = useState('');

  // Clear input field when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setError('');
      setIsSubmitting(false);
      setIsCheckingExisting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Get user information helper
  const getUserInfo = async () => {
    let adobeId = '';
    let adobeAccountType = 'free';

    if (addOnUISdk && addOnUISdk.app && addOnUISdk.app.currentUser) {
      try {
        adobeId = await addOnUISdk.app.currentUser.userId();
        const isPremium = await addOnUISdk.app.currentUser.isPremiumUser();
        adobeAccountType = isPremium ? 'premium' : 'free';
      } catch (userInfoError) {
        console.error('Error getting user info:', userInfoError);
        // Continue with default values
      }
    }

    return { adobeId, adobeAccountType };
  };

  const handleSubmit = async () => {
    if (!email || !email.trim()) {
      setError('Please enter a valid email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Get user information from addOnUISdk
      const { adobeId, adobeAccountType } = await getUserInfo();

      // Prepare payload for API
      const payload = {
        adobeId: adobeId,
        adobeAccountType: adobeAccountType,
        productName: 'charts-pro',
        email: email.trim()
      };

      // Make POST API call to register user
      const API_URL = 'https://api.swiftools.com/adobe/user-registration';
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to register user' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      // Send Discord notification on email submission (silently fail if it doesn't work)
      // Note: This is separate from first page load notification
      // Check session storage to avoid duplicate if first page load already sent
      try {
        // Get webhook URL from parent component via props or from global config
        // For now, we'll skip if notification was already sent on page load
        // If you want to send on email submission too, pass webhookUrl as prop
        const alreadyNotified = sessionStorage.getItem('notificationSent');
        
        if (!alreadyNotified) {
          // If notification wasn't sent on page load, you can send it here
          // But typically we only send once per session
          // Uncomment below if you want to send on email submission as well:
          /*
          const webhookUrl = // Get from props or config
          if (webhookUrl) {
            const userId = adobeId || email.trim();
            await sendDirectNotification(userId, webhookUrl);
            sessionStorage.setItem('notificationSent', 'true');
          }
          */
        }
      } catch (notificationError) {
        // Silently fail - don't break the registration flow
        console.warn('Notification failed:', notificationError);
      }

      // Call onSubmit callback with payload (for backward compatibility)
      await onSubmit(payload);
      
      // Reset form on success
      setEmail('');
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAlreadySignedUp = async (e) => {
    e.preventDefault();
    
    setIsCheckingExisting(true);
    setError('');

    try {
      // Get user information from addOnUISdk
      const { adobeId } = await getUserInfo();

      if (!adobeId) {
        setError('Please enter your valid email to login/signup.');
        setIsCheckingExisting(false);
        return;
      }

      // Make POST API call to check existing user
      const API_URL = 'https://api.swiftools.com/adobe/user-registration';
      
      // Prepare payload for POST request
      const payload = {
        adobeId: adobeId,
        read: true
      };
      
      let response;
      try {
        response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } catch (fetchError) {
        // Network error or fetch failed
        console.error('❌ Network error checking existing user:', fetchError);
        setError('User not found. Enter email to login/signup.');
        setIsCheckingExisting(false);
        return;
      }

      if (!response.ok) {
        // HTTP error (404, 500, etc.)
        try {
          const errorData = await response.json();
          // If 404 or user not found, show friendly message
          if (response.status === 404 || errorData.message?.toLowerCase().includes('not found')) {
            setError('User not found. Enter email to login/signup.');
          } else {
            setError('User not found. Enter email to login/signup.');
          }
        } catch (parseError) {
          // Failed to parse error response
          setError('User not found. Enter email to login/signup.');
        }
        setIsCheckingExisting(false);
        return;
      }

      const data = await response.json();
      
      // Check if user exists based on API response structure
      // Response structure: { success: true, data: { email, adobeId, adobeAccountType, products } }
      if (data.success === true && data.data && (data.data.email || data.data.adobeId)) {
        // User exists - close modal and proceed
        setEmail('');
        const userData = data.data;
        await onSubmit({
          adobeId: userData.adobeId || adobeId,
          adobeAccountType: userData.adobeAccountType || 'free',
          productName: 'charts-pro',
          email: userData.email || '' // Use email from API if available
        });
      } else {
        setError('User not found. Enter email to login/signup.');
      }
    } catch (error) {
      console.error('❌ Error checking existing user:', error);
      // Show user-friendly message for any unexpected errors
      setError('User not found. Enter email to login/signup.');
    } finally {
      setIsCheckingExisting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Check if email has a value (not empty or just whitespace)
  const isEmailValid = email.trim().length > 0;

  return (
    <div className="login-signup-modal-overlay" onClick={handleOverlayClick}>
      <div className="login-signup-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="login-signup-modal-header">
          <h2>One Click login/Signup</h2>
          <button className="login-signup-modal-close" onClick={handleClose}>
            ×
          </button>
        </div>
        <div className="login-signup-modal-body">
          <div className="login-signup-form">
            <div className="login-signup-input-group">
              <input
                type="email"
                className="login-signup-email-input"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSubmitting && !isCheckingExisting && isEmailValid) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                disabled={isSubmitting || isCheckingExisting}
              />
              {error && <div className="login-signup-error">{error}</div>}
            </div>
            <button
              type="button"
              className="login-signup-submit-button"
                disabled={isSubmitting || !isEmailValid || isCheckingExisting}
                onClick={handleSubmit}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            <div className="login-signup-link-container">
              <a 
                href="#" 
                className="login-signup-link" 
                onClick={handleAlreadySignedUp}
                style={{ 
                  pointerEvents: (isSubmitting || isCheckingExisting) ? 'none' : 'auto',
                  opacity: (isSubmitting || isCheckingExisting) ? 0.6 : 1,
                  cursor: (isSubmitting || isCheckingExisting) ? 'not-allowed' : 'pointer'
                }}
              >
                {isCheckingExisting ? 'Checking...' : 'Already signed up?'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignupModal;

