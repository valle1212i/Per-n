/**
 * Booking System Service
 * 
 * Handles all booking-related API calls to the customer portal
 * 
 * CRITICAL: Always fetch services and providers dynamically - never hardcode IDs!
 */
import { getCSRFToken } from './csrf';

// Import config values directly to avoid initialization issues
// Use functions to defer access and avoid initialization order issues
function getBaseURL() {
  return import.meta.env.VITE_API_BASE_URL || 'https://source-database-809785351172.europe-north1.run.app';
}

function getTenant() {
  return import.meta.env.VITE_TENANT_ID || 'peranrestaurante';
}

// Get API base URL dynamically to avoid initialization issues
function getApiBase() {
  return `${getBaseURL()}/api/system/booking`;
}

/**
 * Fetch all active services (bookable items) for the tenant
 * ✅ PUBLIC ENDPOINT: No authentication required
 * @param {boolean} isActive - Filter by active status (optional)
 * @returns {Promise<Array>} Array of service objects
 */
export async function fetchServices(isActive = true) {
  try {
    const url = `${getApiBase()}/public/services${isActive ? '?isActive=true' : ''}`;
    const response = await fetch(url, {
      headers: {
        'X-Tenant': getTenant() // ✅ Required: Include tenant header
      }
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
 * ✅ PUBLIC ENDPOINT: No authentication required
 * @param {boolean} isActive - Filter by active status (optional)
 * @returns {Promise<Array>} Array of provider objects
 */
export async function fetchProviders(isActive = true) {
  try {
    const url = `${getApiBase()}/public/providers${isActive ? '?isActive=true' : ''}`;
    const response = await fetch(url, {
      headers: {
        'X-Tenant': getTenant() // ✅ Required: Include tenant header
      }
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
 * Fetch booking settings (including opening hours and form fields)
 * ✅ PUBLIC ENDPOINT: No authentication required
 * ✅ CRITICAL: Always fetch settings to respect tenant's opening hours
 * @returns {Promise<Object|null>} Booking settings object
 */
export async function fetchBookingSettings() {
  try {
    const response = await fetch(`${getApiBase()}/public/settings`, {
      headers: {
        'X-Tenant': getTenant() // ✅ Required: Include tenant header
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch settings: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.settings) {
      return data.settings;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching booking settings:', error);
    return null;
  }
}

/**
 * Fetch provider-specific availability and available slots
 * ✅ PUBLIC ENDPOINT: Use this to get exact available slots for each provider
 * @param {String} providerId - Provider ID
 * @param {Date|String} date - Date to check (Date object or YYYY-MM-DD string)
 * @param {Number} slotDuration - Duration of each slot in minutes (default: 30)
 * @returns {Promise<Object|null>} Availability object
 */
export async function fetchProviderAvailability(providerId, date, slotDuration = 30) {
  try {
    const dateStr = date instanceof Date 
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      : date;
    
    const response = await fetch(
      `${getApiBase()}/public/providers/${providerId}/availability?date=${dateStr}&slotDuration=${slotDuration}`,
      {
        headers: {
          'X-Tenant': getTenant() // ✅ Required: Include tenant header
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch provider availability: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.availability) {
      return data.availability;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching provider availability:', error);
    return null;
  }
}

/**
 * Fetch bookings for a date range
 * ✅ CRITICAL: Exclude canceled bookings from availability calculations
 * Note: This endpoint requires authentication (credentials: 'include')
 * @param {Date} fromDate - Start date
 * @param {Date} toDate - End date
 * @param {string} providerId - Optional provider filter
 * @param {string} status - Optional status filter ('confirmed', 'pending', 'canceled', 'no_show')
 * @returns {Promise<Array>} Array of booking objects (excluding canceled)
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
    
    const response = await fetch(`${getApiBase()}/bookings?${params}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && Array.isArray(data.bookings)) {
      // ✅ CRITICAL: Filter out canceled bookings - they don't block availability
      return data.bookings.filter(booking => booking.status !== 'canceled');
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
    
    const response = await fetch(`${getApiBase()}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'X-Tenant': getTenant()
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
    
    const response = await fetch(`${getApiBase()}/bookings/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'X-Tenant': getTenant()
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
    
    const response = await fetch(`${getApiBase()}/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
        'X-Tenant': getTenant()
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
 * Generate time slots based on opening hours and existing bookings
 * ✅ CRITICAL: Use settings parameter for opening hours (no hardcoded values)
 * @param {Date} date - Date to generate slots for
 * @param {number} durationMin - Duration in minutes
 * @param {Array} existingBookings - Array of existing bookings (already filtered for canceled)
 * @param {Object} settings - Booking settings object (from fetchBookingSettings)
 * @returns {Array} Array of available time slots
 */
export function generateTimeSlots(date, durationMin, existingBookings, settings = null) {
  const slots = [];
  
  // ✅ CRITICAL: Get day of week for day-specific opening hours
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
  const dayOpeningHours = settings?.openingHours?.[dayOfWeek];
  
  // ✅ CRITICAL: Use day-specific opening hours first, then fallback to calendarBehavior
  let startHour = null;
  let endHour = null;
  
  if (dayOpeningHours && dayOpeningHours.isOpen !== false && dayOpeningHours.start && dayOpeningHours.end) {
    // ✅ PRIORITY 1: Use day-specific opening hours
    const [startHours, startMinutes] = dayOpeningHours.start.split(':').map(Number);
    const [endHours, endMinutes] = dayOpeningHours.end.split(':').map(Number);
    
    startHour = startHours;
    endHour = endMinutes > 0 ? endHours + 1 : endHours + 1;
  } else if (dayOpeningHours?.isOpen === false) {
    // Business is closed on this day
    return [];
  } else if (settings?.calendarBehavior?.startTime && settings?.calendarBehavior?.endTime) {
    // ✅ PRIORITY 2: Fallback to general calendarBehavior times
    const [startHours] = settings.calendarBehavior.startTime.split(':').map(Number);
    const [endHours, endMinutes] = settings.calendarBehavior.endTime.split(':').map(Number);
    
    startHour = startHours;
    endHour = endMinutes > 0 ? endHours + 1 : endHours + 1;
  }
  
  // ✅ CRITICAL: If no settings, return empty (don't show any slots)
  if (startHour === null || endHour === null) {
    console.warn('⚠️ No opening hours configured - cannot generate time slots');
    return [];
  }
  
  const slotInterval = settings?.calendarBehavior?.timeSlotInterval || 30;
  
  // ✅ CRITICAL: Get actual closing time to filter slots
  let actualEndHour = null;
  let actualEndMinutes = null;
  if (dayOpeningHours && dayOpeningHours.isOpen !== false && dayOpeningHours.end) {
    const [endH, endM] = dayOpeningHours.end.split(':').map(Number);
    actualEndHour = endH;
    actualEndMinutes = endM;
  } else if (settings?.calendarBehavior?.endTime) {
    const [endH, endM] = settings.calendarBehavior.endTime.split(':').map(Number);
    actualEndHour = endH;
    actualEndMinutes = endM;
  }
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotInterval) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, minute, 0, 0);
      
      // ✅ CRITICAL: Skip slots that start at or after closing time
      if (actualEndHour !== null && actualEndMinutes !== null) {
        const slotStartMinutes = hour * 60 + minute;
        const closingMinutes = actualEndHour * 60 + actualEndMinutes;
        
        if (slotStartMinutes >= closingMinutes) {
          continue;
        }
      }
      
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + durationMin);
      
      // ✅ CRITICAL: Check that slot doesn't extend beyond closing time
      if (actualEndHour !== null && actualEndMinutes !== null) {
        const slotEndMinutes = slotEnd.getHours() * 60 + slotEnd.getMinutes();
        const closingMinutes = actualEndHour * 60 + actualEndMinutes;
        
        if (slotEndMinutes > closingMinutes) {
          continue;
        }
      }
      
      // ✅ CRITICAL: Check for conflicts with existing bookings
      const hasConflict = existingBookings.some(booking => {
        const bookingStart = new Date(booking.start);
        const bookingEnd = new Date(booking.end);
        return (slotStart < bookingEnd && slotEnd > bookingStart);
      });
      
      // ✅ CRITICAL: Only add slots that are NOT booked (no conflicts)
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
}

/**
 * Generate available time slots for a date (uses settings)
 * @param {Date} date - Date to generate slots for
 * @param {number} durationMin - Duration in minutes
 * @param {string} providerId - Provider ID
 * @param {Object} options - Options for slot generation (deprecated - use settings instead)
 * @param {Object} settings - Booking settings object (from fetchBookingSettings)
 * @returns {Promise<Array>} Array of available time slots
 */
export async function generateAvailableSlots(date, durationMin, providerId, options = {}, settings = null) {
  try {
    // Get bookings for the day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const bookings = await fetchBookings(dayStart, dayEnd, providerId);
    
    // Use generateTimeSlots with settings if available, otherwise fallback to old behavior
    if (settings) {
      return generateTimeSlots(date, durationMin, bookings, settings);
    }
    
    // Fallback to old behavior if no settings (for backward compatibility)
    const {
      startHour = 9,
      endHour = 17,
      intervalMin = 30
    } = options;
    
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

