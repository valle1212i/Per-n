/**
 * Booking System Service
 * 
 * Handles all booking-related API calls to the customer portal
 * 
 * CRITICAL: Always fetch services and providers dynamically - never hardcode IDs!
 */
import apiConfig from '../config/api';
import { getCSRFToken } from './csrf';

const API_BASE = `${apiConfig.baseURL}/api/system/booking`;

/**
 * Fetch all active services (bookable items) for the tenant
 * @param {boolean} isActive - Filter by active status (optional)
 * @returns {Promise<Array>} Array of service objects
 */
export async function fetchServices(isActive = true) {
  try {
    const url = `${API_BASE}/services${isActive ? '?isActive=true' : ''}`;
    const response = await fetch(url, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch services: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && Array.isArray(data.services)) {
      return data.services;
    }
    
    console.warn('No services returned or invalid response format');
    return [];
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

/**
 * Fetch all active providers (staff) for the tenant
 * @param {boolean} isActive - Filter by active status (optional)
 * @returns {Promise<Array>} Array of provider objects
 */
export async function fetchProviders(isActive = true) {
  try {
    const url = `${API_BASE}/providers${isActive ? '?isActive=true' : ''}`;
    const response = await fetch(url, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch providers: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && Array.isArray(data.providers)) {
      return data.providers;
    }
    
    console.warn('No providers returned or invalid response format');
    return [];
  } catch (error) {
    console.error('Error fetching providers:', error);
    return [];
  }
}

/**
 * Fetch bookings for a date range
 * @param {Date} fromDate - Start date
 * @param {Date} toDate - End date
 * @param {string} providerId - Optional provider filter
 * @param {string} status - Optional status filter ('confirmed', 'pending', 'canceled', 'no_show')
 * @returns {Promise<Array>} Array of booking objects
 */
export async function fetchBookings(fromDate, toDate, providerId = null, status = null) {
  try {
    const params = new URLSearchParams({
      from: fromDate.toISOString(),
      to: toDate.toISOString()
    });
    
    if (providerId) {
      params.append('providerId', providerId);
    }
    
    if (status) {
      params.append('status', status);
    }
    
    const response = await fetch(`${API_BASE}/bookings?${params}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && Array.isArray(data.bookings)) {
      return data.bookings;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

/**
 * Create a new booking
 * @param {Object} bookingData - Booking data
 * @param {string} bookingData.serviceId - Service ID (from fetchServices)
 * @param {string} bookingData.providerId - Provider ID (from fetchProviders)
 * @param {Date|string} bookingData.start - Start date/time (ISO string or Date)
 * @param {Date|string} bookingData.end - End date/time (ISO string or Date)
 * @param {string} bookingData.customerName - Customer name
 * @param {string} bookingData.email - Customer email
 * @param {string} bookingData.phone - Customer phone (optional)
 * @param {string} bookingData.status - Booking status (optional, defaults to 'confirmed')
 * @returns {Promise<Object>} Created booking object or error
 */
export async function createBooking(bookingData) {
  try {
    const csrfToken = await getCSRFToken();
    
    // Ensure dates are ISO strings
    const startDate = bookingData.start instanceof Date 
      ? bookingData.start.toISOString() 
      : bookingData.start;
    const endDate = bookingData.end instanceof Date 
      ? bookingData.end.toISOString() 
      : bookingData.end;
    
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'X-Tenant': apiConfig.tenant
      },
      credentials: 'include',
      body: JSON.stringify({
        serviceId: bookingData.serviceId,
        providerId: bookingData.providerId,
        start: startDate,
        end: endDate,
        customerName: bookingData.customerName,
        email: bookingData.email,
        phone: bookingData.phone || '',
        status: bookingData.status || 'confirmed'
      })
    });
    
    const result = await response.json();
    
    if (response.status === 409) {
      // Booking conflict
      return {
        success: false,
        conflict: true,
        message: result.message || 'Denna tid är redan bokad. Välj en annan tid.'
      };
    }
    
    if (result.success) {
      return {
        success: true,
        booking: result.booking
      };
    }
    
    return {
      success: false,
      message: result.message || 'Kunde inte skapa bokning'
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    return {
      success: false,
      message: error.message || 'Ett fel uppstod vid skapande av bokning'
    };
  }
}

/**
 * Update an existing booking
 * @param {string} bookingId - Booking ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated booking object or error
 */
export async function updateBooking(bookingId, updates) {
  try {
    const csrfToken = await getCSRFToken();
    
    // Convert dates to ISO strings if needed
    const body = { ...updates };
    if (body.start instanceof Date) body.start = body.start.toISOString();
    if (body.end instanceof Date) body.end = body.end.toISOString();
    
    const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'X-Tenant': apiConfig.tenant
      },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    
    const result = await response.json();
    
    if (response.status === 409) {
      return {
        success: false,
        conflict: true,
        message: result.message || 'Bokningen kolliderar med en befintlig bokning'
      };
    }
    
    if (result.success) {
      return {
        success: true,
        booking: result.booking
      };
    }
    
    return {
      success: false,
      message: result.message || 'Kunde inte uppdatera bokning'
    };
  } catch (error) {
    console.error('Error updating booking:', error);
    return {
      success: false,
      message: error.message || 'Ett fel uppstod vid uppdatering av bokning'
    };
  }
}

/**
 * Cancel a booking
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Cancelled booking object or error
 */
export async function cancelBooking(bookingId) {
  try {
    const csrfToken = await getCSRFToken();
    
    const response = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
        'X-Tenant': apiConfig.tenant
      },
      credentials: 'include'
    });
    
    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        booking: result.booking
      };
    }
    
    return {
      success: false,
      message: result.message || 'Kunde inte avboka'
    };
  } catch (error) {
    console.error('Error canceling booking:', error);
    return {
      success: false,
      message: error.message || 'Ett fel uppstod vid avbokning'
    };
  }
}

/**
 * Check if a time slot is available
 * @param {Date} start - Start time
 * @param {Date} end - End time
 * @param {string} providerId - Provider ID
 * @returns {Promise<boolean>} True if available, false if conflicted
 */
export async function checkAvailability(start, end, providerId) {
  try {
    const bookings = await fetchBookings(start, end, providerId);
    
    // Check for conflicts
    const hasConflict = bookings.some(booking => {
      if (booking.status === 'canceled') return false;
      
      const bookingStart = new Date(booking.start);
      const bookingEnd = new Date(booking.end);
      
      // Check for overlap
      return (start < bookingEnd && end > bookingStart);
    });
    
    return !hasConflict;
  } catch (error) {
    console.error('Error checking availability:', error);
    return false;
  }
}

/**
 * Generate available time slots for a date
 * @param {Date} date - Date to generate slots for
 * @param {number} durationMin - Duration in minutes
 * @param {string} providerId - Provider ID
 * @param {Object} options - Options for slot generation
 * @param {number} options.startHour - Start hour (default: 9)
 * @param {number} options.endHour - End hour (default: 17)
 * @param {number} options.intervalMin - Interval in minutes (default: 30)
 * @returns {Promise<Array>} Array of available time slots
 */
export async function generateAvailableSlots(date, durationMin, providerId, options = {}) {
  const {
    startHour = 9,
    endHour = 17,
    intervalMin = 30
  } = options;
  
  try {
    // Get bookings for the day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const bookings = await fetchBookings(dayStart, dayEnd, providerId);
    
    // Generate all possible slots
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMin) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + durationMin);
        
        // Skip if slot extends past end hour
        if (slotEnd.getHours() > endHour || 
            (slotEnd.getHours() === endHour && slotEnd.getMinutes() > 0)) {
          continue;
        }
        
        // Check for conflicts
        const hasConflict = bookings.some(booking => {
          if (booking.status === 'canceled') return false;
          
          const bookingStart = new Date(booking.start);
          const bookingEnd = new Date(booking.end);
          
          return (slotStart < bookingEnd && slotEnd > bookingStart);
        });
        
        if (!hasConflict) {
          slots.push({
            start: slotStart,
            end: slotEnd,
            display: slotStart.toLocaleTimeString('sv-SE', {
              hour: '2-digit',
              minute: '2-digit'
            })
          });
        }
      }
    }
    
    return slots;
  } catch (error) {
    console.error('Error generating available slots:', error);
    return [];
  }
}

