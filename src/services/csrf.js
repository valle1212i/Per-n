/**
 * CSRF Token Service
 * 
 * Fetches CSRF tokens required for authenticated API requests
 */
// Import config values directly to avoid initialization issues
// Use function to defer access and avoid initialization order issues
function getBaseURL() {
  return import.meta.env.VITE_API_BASE_URL || 'https://source-database-809785351172.europe-north1.run.app';
}

/**
 * Get CSRF token from customer portal
 * NOTE: Endpoint provided by Customer Portal team
 * - GET /api/csrf-token
 * - Must include credentials (cookies)
 * Response: { csrfToken: "<token>" }
 * @returns {Promise<string>} CSRF token
 */
export async function getCSRFToken() {
  try {
    const url = `${getBaseURL()}/api/csrf-token`;
    console.log('🔐 Fetching CSRF token from:', url);
    
    const response = await fetch(url, {
      credentials: 'include'
    });
    
    console.log('🔐 CSRF token response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ CSRF token fetch failed:', response.status, errorText);
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🔐 CSRF token response data:', data);
    
    if (!data.csrfToken) {
      console.error('❌ CSRF token not found in response:', data);
      throw new Error('CSRF token not found in response');
    }
    
    console.log('✅ CSRF token obtained:', data.csrfToken.substring(0, 20) + '...');
    return data.csrfToken;
  } catch (error) {
    console.error('❌ Error fetching CSRF token:', error);
    throw error;
  }
}

