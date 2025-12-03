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
 * @returns {Promise<string>} CSRF token
 */
export async function getCSRFToken() {
  try {
    const response = await fetch(`${getBaseURL()}/api/auth/csrf`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.csrfToken) {
      throw new Error('CSRF token not found in response');
    }
    
    return data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}

