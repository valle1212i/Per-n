/**
 * Booking System Service
 * 
 * Handles all booking-related API calls to the customer portal
 * 
 * CRITICAL: Always fetch services and providers dynamically - never hardcode IDs!
 */
// Lazy import CSRF to avoid circular dependencies
let getCSRFToken = null;
async function loadCSRF() {
  if (!getCSRFToken) {
    const csrfModule = await import('./csrf');
    getCSRFToken = csrfModule.getCSRFToken;
  }
  return getCSRFToken;
}

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
    
    // Debug: Log the full response structure
    console.log('Settings API response:', JSON.stringify(data, null, 2));
    console.log('Response keys:', Object.keys(data));
    console.log('Has industryTerminology at root?', 'industryTerminology' in data);
    
    if (data.success && data.settings) {
      // ✅ CORRECT: industryTerminology is at root level, not inside settings
      const industryTerminology = data.industryTerminology;
      
      // Debug: Log the settings and industryTerminology structure
      console.log('Settings object:', data.settings);
      console.log('Industry terminology (from root):', industryTerminology);
      if (industryTerminology) {
        console.log('Form labels:', industryTerminology.formLabels);
        console.log('Service label:', industryTerminology.formLabels?.selectService);
        console.log('Provider label:', industryTerminology.formLabels?.selectProvider);
      } else {
        console.warn('⚠️ industryTerminology is undefined at root level!');
      }
      
      // Return both settings and industryTerminology merged together
      // This way BookingForm can access both settings and industryTerminology
      return {
        ...data.settings,
        industryTerminology: industryTerminology || null
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching booking settings:', error);
    return null;
  }
}

/**
 * Fetch available products for booking
 * ✅ PUBLIC ENDPOINT: No authentication required
 * @returns {Promise<Array>} Array of product objects
 */
export async function fetchBookingProducts() {
  try {
    const response = await fetch(`${getApiBase()}/public/products`, {
      headers: {
        'X-Tenant': getTenant() // ✅ Required: Include tenant header
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && Array.isArray(data.products)) {
      return data.products;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching booking products:', error);
    return [];
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
    
    // ✅ Use public endpoint for fetching bookings (no authentication required)
    const response = await fetch(`${getApiBase()}/public/bookings?${params}`, {
      headers: {
        'X-Tenant': getTenant()
      }
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
    // ✅ CRITICAL: Fetch fresh CSRF token right before each booking request
    // The CSRF cookie secret can change, so we must fetch a fresh token that matches the current cookie secret
    // Do NOT cache the token - fetch it fresh every time
    console.log('🔐 Fetching fresh CSRF token before booking request...');
    
    const csrfResponse = await fetch(`${getBaseURL()}/api/csrf-token`, {
      credentials: 'include'
    });
    
    if (!csrfResponse.ok) {
      throw new Error(`Failed to fetch CSRF token: ${csrfResponse.status}`);
    }
    
    const csrfData = await csrfResponse.json();
    
    if (!csrfData.csrfToken) {
      throw new Error('CSRF token not found in response');
    }
    
    const csrfToken = csrfData.csrfToken;
    console.log('✅ Fresh CSRF token obtained:', csrfToken.substring(0, 20) + '...');
    
    // Ensure dates are ISO strings
    const startDate = bookingData.start instanceof Date 
      ? bookingData.start.toISOString() 
      : bookingData.start;
    const endDate = bookingData.end instanceof Date 
      ? bookingData.end.toISOString() 
      : bookingData.end;
    
    // Use public bookings endpoint (cross-origin safe)
    const url = `${getApiBase()}/public/bookings`;
    const headers = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'X-Tenant': getTenant()
    };
    
    // Check if CSRF cookie exists
    const cookies = document.cookie;
    const hasCSRFCookie = cookies.includes('csrf') || cookies.includes('_csrf');
    
    console.log('📝 Booking request:', {
      url,
      method: 'POST',
      headers: {
        'Content-Type': headers['Content-Type'],
        'X-CSRF-Token': csrfToken ? csrfToken.substring(0, 20) + '...' : 'MISSING',
        'X-Tenant': headers['X-Tenant']
      },
      hasCredentials: true,
      cookies: cookies ? cookies.substring(0, 100) + '...' : 'No cookies',
      hasCSRFCookie: hasCSRFCookie
    });
    
    // Build request body with all required fields
    const requestBody = {
      serviceId: bookingData.serviceId,
      providerId: bookingData.providerId,
      start: startDate,
      end: endDate,
      customerName: bookingData.customerName,
      email: bookingData.email,
      phone: bookingData.phone || '',
      status: bookingData.status || 'confirmed',
      partySize: bookingData.partySize ? Number(bookingData.partySize) : (bookingData.guests ? Number(bookingData.guests) : 1), // ✅ Include partySize as number (required for restaurants)
      notes: bookingData.notes, // Include notes
      specialRequests: bookingData.specialRequests, // Include special requests
      productIds: bookingData.productIds && Array.isArray(bookingData.productIds) && bookingData.productIds.length > 0 ? bookingData.productIds : undefined // ✅ Include selected product IDs
    };
    
    // ✅ Detailed logging for debugging validation errors
    console.log('📝 Booking request body:', {
      serviceId: requestBody.serviceId ? requestBody.serviceId.substring(0, 20) + '...' : 'MISSING/NULL',
      providerId: requestBody.providerId || 'null (optional for restaurants)',
      start: requestBody.start,
      end: requestBody.end,
      customerName: requestBody.customerName || 'MISSING',
      email: requestBody.email || 'MISSING',
      phone: requestBody.phone || 'empty',
      status: requestBody.status,
      partySize: requestBody.partySize || 'not provided',
      partySizeType: typeof requestBody.partySize,
      productIds: requestBody.productIds || 'not provided',
      productIdsCount: requestBody.productIds ? requestBody.productIds.length : 0,
      notes: requestBody.notes || 'not provided',
      specialRequests: requestBody.specialRequests || 'not provided',
      allFieldsPresent: {
        serviceId: !!requestBody.serviceId,
        start: !!requestBody.start,
        end: !!requestBody.end,
        customerName: !!requestBody.customerName
      }
    });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      credentials: 'include',
      body: JSON.stringify(requestBody)
    });
    
    console.log('📝 Booking response status:', response.status, response.statusText);
    
    // Read body once; try JSON parse, fallback to text
    const rawBody = await response.text();
    let result = {};
    try {
      result = rawBody ? JSON.parse(rawBody) : {};
    } catch (parseErr) {
      console.warn('⚠️ Failed to parse booking response JSON, using text', parseErr);
      result = { message: rawBody };
    }
    
    if (!response.ok) {
      console.error('❌ Booking failed:', response.status, result);
      // Log full error details for 500 errors
      if (response.status === 500) {
        console.error('❌ Server Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorMessage: result.message,
          fullResponse: result
        });
      }
    }
    
    if (response.status === 409) {
      // Booking conflict
      return {
        success: false,
        conflict: true,
        message: result.message || 'Denna tid är redan bokad. Välj en annan tid.'
      };
    }
    
    if (result.success) {
      // ✅ Return full response including payment information
      return {
        success: true,
        booking: result.booking,
        requiresPayment: result.requiresPayment || false,
        checkoutUrl: result.checkoutUrl || null,
        sessionId: result.sessionId || null
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
    const getCSRF = await loadCSRF();
    const csrfToken = await getCSRF();
    
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
    const getCSRF = await loadCSRF();
    const csrfToken = await getCSRF();
    
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
  
  // Debug: Log settings structure
  console.log('🔍 generateTimeSlots called with:', {
    date: date.toISOString(),
    durationMin,
    existingBookingsCount: existingBookings?.length || 0,
    settings: settings ? Object.keys(settings) : null,
    openingHours: settings?.openingHours,
    calendarBehavior: settings?.calendarBehavior
  });
  
  // ✅ CRITICAL: Get day of week for day-specific opening hours
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
  const dayOpeningHours = settings?.openingHours?.[dayOfWeek];
  
  console.log('📅 Day of week:', dayOfWeek, 'Opening hours for this day:', dayOpeningHours);
  
  // ✅ CRITICAL: Use day-specific opening hours first, then fallback to calendarBehavior
  let startHour = null;
  let endHour = null;
  
  if (dayOpeningHours && dayOpeningHours.isOpen !== false && dayOpeningHours.start && dayOpeningHours.end) {
    // ✅ PRIORITY 1: Use day-specific opening hours
    console.log('✅ Using day-specific opening hours:', dayOpeningHours.start, '-', dayOpeningHours.end);
    const [startHours, startMinutes] = dayOpeningHours.start.split(':').map(Number);
    const [endHours, endMinutes] = dayOpeningHours.end.split(':').map(Number);
    
    startHour = startHours;
    endHour = endMinutes > 0 ? endHours + 1 : endHours + 1;
  } else if (dayOpeningHours?.isOpen === false) {
    // Business is closed on this day
    console.log('❌ Business is closed on', dayOfWeek);
    return [];
  } else if (settings?.calendarBehavior?.startTime && settings?.calendarBehavior?.endTime) {
    // ✅ PRIORITY 2: Fallback to general calendarBehavior times
    console.log('✅ Using calendarBehavior times:', settings.calendarBehavior.startTime, '-', settings.calendarBehavior.endTime);
    const [startHours] = settings.calendarBehavior.startTime.split(':').map(Number);
    const [endHours, endMinutes] = settings.calendarBehavior.endTime.split(':').map(Number);
    
    startHour = startHours;
    endHour = endMinutes > 0 ? endHours + 1 : endHours + 1;
  }
  
  // ✅ CRITICAL: If no settings, return empty (don't show any slots)
  if (startHour === null || endHour === null) {
    console.warn('⚠️ No opening hours configured - cannot generate time slots', {
      dayOpeningHours,
      calendarBehavior: settings?.calendarBehavior,
      settingsKeys: settings ? Object.keys(settings) : 'settings is null'
    });
    return [];
  }
  
  console.log('⏰ Generated time slots will be from', startHour, 'to', endHour);
  
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

