/**
 * CSRF Token Service
 * 
 * Fetches CSRF tokens required for authenticated API requests
 */
import apiConfig from '../config/api';

/**
 * Get CSRF token from customer portal
 * @returns {Promise<string>} CSRF token
 */
export async function getCSRFToken() {
  try {
    const response = await fetch(`${apiConfig.baseURL}/api/auth/csrf`, {
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

