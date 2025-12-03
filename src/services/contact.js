/**
 * Contact Form Service
 * 
 * Handles contact form submissions to the customer portal
 */
import apiConfig from '../config/api';
import { getCSRFToken } from './csrf';

/**
 * Send a contact message to the customer portal
 * @param {Object} messageData - Message data
 * @param {string} messageData.name - Customer name
 * @param {string} messageData.email - Customer email (required)
 * @param {string} messageData.phone - Customer phone (optional)
 * @param {string} messageData.subject - Message subject (optional, defaults to 'Kontaktformulär')
 * @param {string} messageData.message - Message content (required)
 * @returns {Promise<Object>} Response from customer portal
 */
export async function sendContactMessage(messageData) {
  try {
    const csrfToken = await getCSRFToken();
    
    if (!csrfToken) {
      throw new Error('Kunde inte hämta säkerhetstoken. Ladda om sidan och försök igen.');
    }
    
    const response = await fetch(`${apiConfig.baseURL}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'X-Tenant': apiConfig.tenant
      },
      credentials: 'include',
      body: JSON.stringify({
        tenant: apiConfig.tenant,
        name: messageData.name || '',
        email: messageData.email,
        phone: messageData.phone || '',
        subject: messageData.subject || 'Kontaktformulär',
        message: messageData.message,
        company: '' // Honeypot field (must be empty)
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Kunde inte skicka meddelande');
    }
    
    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        id: result.id,
        message: 'Meddelande skickat'
      };
    }
    
    throw new Error(result.message || 'Kunde inte skicka meddelande');
  } catch (error) {
    console.error('Error sending contact message:', error);
    throw error;
  }
}

