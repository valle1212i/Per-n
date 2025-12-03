/**
 * Analytics Tracking Service
 * 
 * Handles analytics tracking to the customer portal
 * No CSRF protection required for this endpoint
 */

import apiConfig from '../config/api';

/**
 * Get or create session ID for analytics
 * @returns {string} Session ID
 */
function getSessionId() {
  if (typeof window === 'undefined') return null;
  
  const SESSION_KEY = 'analytics_session';
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Get traffic source from referrer
 * @returns {string} Traffic source ('direct', 'organic', 'social', 'referral')
 */
function getTrafficSource() {
  if (typeof window === 'undefined') return 'direct';
  
  const ref = document.referrer;
  if (!ref) return 'direct';
  if (ref.includes('google') || ref.includes('bing') || ref.includes('yahoo')) return 'organic';
  if (ref.includes('facebook') || ref.includes('instagram') || ref.includes('twitter') || ref.includes('linkedin')) return 'social';
  return 'referral';
}

/**
 * Track a page view
 * @param {Object} options - Tracking options
 * @param {string} options.page - Page path (optional, defaults to current pathname)
 * @param {string} options.referrer - Referrer URL (optional, defaults to document.referrer)
 * @returns {Promise<void>}
 */
export async function trackPageView(options = {}) {
  try {
    const sessionId = getSessionId();
    if (!sessionId) return;
    
    const page = options.page || (typeof window !== 'undefined' ? window.location.pathname : '/');
    const referrer = options.referrer || (typeof window !== 'undefined' ? document.referrer : '');
    
    const response = await fetch(`${apiConfig.baseURL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant': apiConfig.tenant
      },
      body: JSON.stringify({
        event: 'page_view',
        tenant: apiConfig.tenant,
        data: {
          page: page,
          referrer: referrer,
          sessionId: sessionId,
          device: typeof window !== 'undefined' && /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          source: getTrafficSource(),
          timestamp: new Date().toISOString()
        }
      })
    });
    
    if (!response.ok) {
      console.warn('Failed to track page view:', response.status);
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
    // Don't throw - analytics failures shouldn't break the app
  }
}

/**
 * Track a custom event
 * @param {string} eventType - Event type ('form_start', 'form_submit', 'cta_click', 'button_click', etc.)
 * @param {Object} eventData - Additional event data
 * @returns {Promise<void>}
 */
export async function trackEvent(eventType, eventData = {}) {
  try {
    const sessionId = getSessionId();
    if (!sessionId) return;
    
    const response = await fetch(`${apiConfig.baseURL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant': apiConfig.tenant
      },
      body: JSON.stringify({
        event: eventType,
        tenant: apiConfig.tenant,
        data: {
          ...eventData,
          sessionId: sessionId,
          timestamp: new Date().toISOString()
        }
      })
    });
    
    if (!response.ok) {
      console.warn(`Failed to track event ${eventType}:`, response.status);
    }
  } catch (error) {
    console.error(`Error tracking event ${eventType}:`, error);
    // Don't throw - analytics failures shouldn't break the app
  }
}

/**
 * Track form submission
 * @param {string} formId - Form identifier
 * @param {string} page - Page path (optional)
 * @returns {Promise<void>}
 */
export async function trackFormSubmit(formId, page = null) {
  return trackEvent('form_submit', {
    formId: formId,
    page: page || (typeof window !== 'undefined' ? window.location.pathname : '/')
  });
}

/**
 * Track form start
 * @param {string} formId - Form identifier
 * @param {string} page - Page path (optional)
 * @returns {Promise<void>}
 */
export async function trackFormStart(formId, page = null) {
  return trackEvent('form_start', {
    formId: formId,
    page: page || (typeof window !== 'undefined' ? window.location.pathname : '/')
  });
}

/**
 * Track CTA click
 * @param {string} ctaId - CTA identifier
 * @param {string} page - Page path (optional)
 * @returns {Promise<void>}
 */
export async function trackCTAClick(ctaId, page = null) {
  return trackEvent('cta_click', {
    ctaId: ctaId,
    page: page || (typeof window !== 'undefined' ? window.location.pathname : '/')
  });
}

