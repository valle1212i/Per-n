import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'

// Lazy load Calendar to avoid initialization issues
const Calendar = lazy(() => import('./Calendar'))

function BookingForm() {
  const [formData, setFormData] = useState({
    date: '',
    serviceId: '',
    providerId: '',
    guests: 2,
    time: '',
    name: '',
    email: '',
    phone: '',
    notes: '',
    specialRequests: '',
    bookingType: 'table' // 'table' or 'package'
  })

  const [services, setServices] = useState([])
  const [providers, setProviders] = useState([])
  const [bookingSettings, setBookingSettings] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [bookedDates, setBookedDates] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // ✅ CORRECT: Extract industryTerminology from root level (not from inside settings)
  // The API returns: { success: true, settings: {...}, industryTerminology: {...} }
  // So industryTerminology is at the root level, not inside settings
  const industryTerminology = bookingSettings?.industryTerminology || {}
  const formLabels = industryTerminology?.formLabels || {}
  const terms = industryTerminology?.terminology || {}
  
  // Determine if this is a restaurant booking (restaurants don't need service/provider selectors)
  // Check if businessType is 'restaurant' or if we have restaurant-specific labels
  const isRestaurant = bookingSettings?.businessType === 'restaurant' || 
                       formLabels.partySize !== undefined ||
                       (formLabels.selectService && formLabels.selectService.includes('bordstorlek'))
  
  // Helper functions to get labels with fallbacks
  // ✅ CORRECT: Using formLabels.selectService (e.g., "Välj bordstorlek" for restaurants)
  const getServiceLabel = () => {
    const label = formLabels.selectService || 'Tjänst'
    if (!formLabels.selectService) {
      console.warn('⚠️ formLabels.selectService is missing, using fallback:', label)
    } else {
      console.log('✅ Service label from API:', label)
    }
    return label
  }
  // ✅ CORRECT: Using formLabels.selectProvider (e.g., "Välj serveringspersonal" for restaurants)
  const getProviderLabel = () => {
    const label = formLabels.selectProvider || 'Personal'
    if (!formLabels.selectProvider) {
      console.warn('⚠️ formLabels.selectProvider is missing, using fallback:', label)
    } else {
      console.log('✅ Provider label from API:', label)
    }
    return label
  }
  const getTimeLabel = () => formLabels.selectTime || 'Tid'
  // ✅ Restaurant-specific: Party size label (e.g., "Antal personer")
  const getPartySizeLabel = () => formLabels.partySize || 'Gruppstorlek'
  // ✅ Restaurant-specific: Notes label (e.g., "Allergier eller särskilda önskemål")
  const getNotesLabel = () => formLabels.notes || 'Anteckningar'
  // ✅ Restaurant-specific: Customer name label (e.g., "Namn")
  const getCustomerNameLabel = () => formLabels.customerName || 'Namn'
  const getServiceTerm = () => terms.service || 'tjänst'
  const getProviderTerm = () => terms.provider || 'personal'

  // Store loaded services in refs to avoid re-initialization
  const servicesRef = useRef({
    fetchServices: null,
    fetchProviders: null,
    fetchBookingSettings: null,
    createBooking: null,
    generateTimeSlots: null,
    generateAvailableSlots: null,
    fetchBookings: null,
    trackFormStart: null,
    trackFormSubmit: null
  })

  // Lazy load booking services - defined as regular function to avoid useCallback initialization issues
  const loadBookingServices = async () => {
    if (!servicesRef.current.fetchServices) {
      try {
        const bookingModule = await import('../services/booking');
        servicesRef.current.fetchServices = bookingModule.fetchServices;
        servicesRef.current.fetchProviders = bookingModule.fetchProviders;
        servicesRef.current.fetchBookingSettings = bookingModule.fetchBookingSettings;
        servicesRef.current.createBooking = bookingModule.createBooking;
        servicesRef.current.generateTimeSlots = bookingModule.generateTimeSlots;
        servicesRef.current.generateAvailableSlots = bookingModule.generateAvailableSlots;
        servicesRef.current.fetchBookings = bookingModule.fetchBookings;
      } catch (error) {
        console.error('Failed to load booking services:', error);
        throw error;
      }
    }
  }

  // Lazy load analytics services - defined as regular function to avoid useCallback initialization issues
  const loadAnalyticsServices = async () => {
    if (!servicesRef.current.trackFormStart) {
      try {
        const analyticsModule = await import('../services/analytics');
        servicesRef.current.trackFormStart = analyticsModule.trackFormStart;
        servicesRef.current.trackFormSubmit = analyticsModule.trackFormSubmit;
      } catch (error) {
        console.error('Failed to load analytics services:', error);
        // Don't throw - analytics is optional
      }
    }
  }

  // ✅ CRITICAL: Load services, providers, and settings on component mount
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Load services dynamically
        await loadBookingServices()
        await loadAnalyticsServices()
        
        if (!servicesRef.current.fetchServices || !servicesRef.current.fetchProviders || !servicesRef.current.fetchBookingSettings) {
          throw new Error('Failed to load booking services')
        }
        
        const [servicesData, providersData, settingsData] = await Promise.all([
          servicesRef.current.fetchServices(true),
          servicesRef.current.fetchProviders(true),
          servicesRef.current.fetchBookingSettings()
        ])
        
        // Ensure we're setting arrays, not objects or undefined
        setServices(Array.isArray(servicesData) ? servicesData : [])
        setProviders(Array.isArray(providersData) ? providersData : [])
        // Ensure settings is an object or null, never undefined
        setBookingSettings(settingsData && typeof settingsData === 'object' ? settingsData : null)
        
        // Debug: Log the settings structure to verify industryTerminology
        if (settingsData && typeof settingsData === 'object') {
          console.log('Booking settings loaded:', settingsData)
          console.log('Industry terminology:', settingsData.industryTerminology)
          if (settingsData.industryTerminology) {
            console.log('Form labels:', settingsData.industryTerminology.formLabels)
            console.log('Service label:', settingsData.industryTerminology.formLabels?.selectService)
            console.log('Provider label:', settingsData.industryTerminology.formLabels?.selectProvider)
          }
        }
        
        // Track form start
        if (servicesRef.current.trackFormStart) {
          servicesRef.current.trackFormStart('booking-form').catch(() => {})
        }
      } catch (error) {
        console.error('Error loading booking data:', error)
        // Ensure error is always a string, never an object
        const errorMessage = error instanceof Error ? error.message : String(error || 'Kunde inte ladda bokningsdata. Ladda om sidan och försök igen.')
        setError(errorMessage || 'Kunde inte ladda bokningsdata. Ladda om sidan och försök igen.')
        // Ensure we set empty arrays and null for settings
        setServices([])
        setProviders([])
        setBookingSettings(null)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // ✅ CRITICAL: Refresh settings periodically (every 5 minutes)
  useEffect(() => {
    if (!servicesRef.current.fetchBookingSettings) return

    const refreshSettings = async () => {
      try {
        const newSettings = await servicesRef.current.fetchBookingSettings()
        if (newSettings && typeof newSettings === 'object') {
          setBookingSettings(newSettings)
        }
      } catch (error) {
        console.error('Error refreshing settings:', error)
      }
    }
    
    refreshSettings()
    const interval = setInterval(refreshSettings, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  // ✅ CRITICAL: When service, date, provider, OR settings change, check availability
  // For restaurants, only need date (serviceId and providerId are optional)
  useEffect(() => {
    if (isRestaurant) {
      // For restaurants, check availability with just date
      if (formData.date && bookingSettings) {
        checkAvailability()
      } else {
        setAvailableSlots([])
      }
    } else {
      // For other business types, require serviceId and providerId
      if (formData.serviceId && formData.date && formData.providerId && bookingSettings && services && services.length > 0) {
        checkAvailability()
      } else {
        setAvailableSlots([])
      }
    }
  }, [formData.serviceId, formData.date, formData.providerId, bookingSettings, services, isRestaurant])

  // Load booked dates for calendar display
  useEffect(() => {
    loadBookedDates()
  }, [formData.providerId])

  const loadBookedDates = async () => {
    if (!formData.providerId) return
    
    try {
      await loadBookingServices()
      if (!servicesRef.current.fetchBookings) {
        console.warn('Booking services not loaded yet')
        return
      }
      
      const today = new Date()
      const futureDate = new Date()
      futureDate.setDate(today.getDate() + 60) // Next 60 days
      
      const bookings = await servicesRef.current.fetchBookings(today, futureDate, formData.providerId)
      
      // Extract unique dates that have bookings
      const booked = new Set()
      bookings.forEach(booking => {
        if (booking.status !== 'canceled') {
          const date = new Date(booking.start)
          const dateStr = date.toISOString().split('T')[0]
          booked.add(dateStr)
        }
      })
      
      setBookedDates(Array.from(booked))
    } catch (error) {
      console.error('Error loading booked dates:', error)
    }
  }

  const checkAvailability = async () => {
    // For restaurants, only date is required
    if (isRestaurant) {
      if (!formData.date || !bookingSettings) {
        setAvailableSlots([])
        return
      }
    } else {
      // For other business types, require serviceId and providerId
      if (!formData.serviceId || !formData.providerId || !formData.date || !bookingSettings) {
        setAvailableSlots([])
        return
      }
    }

    try {
      await loadBookingServices()
      if (!servicesRef.current.generateTimeSlots || !servicesRef.current.fetchBookings) {
        console.warn('Booking services not loaded yet')
        setAvailableSlots([])
        return
      }
      
      // For restaurants, use default duration (120 minutes) and no provider filter
      let durationMin = 120
      let providerId = null
      
      if (!isRestaurant) {
        const selectedService = services.find(s => s._id === formData.serviceId)
        if (!selectedService) {
          setAvailableSlots([])
          return
        }
        durationMin = selectedService.durationMin || 120
        providerId = formData.providerId
      }

      const selectedDate = new Date(formData.date)
      
      // Get bookings for the selected day
      const dayStart = new Date(selectedDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(selectedDate)
      dayEnd.setHours(23, 59, 59, 999)
      
      const bookings = await servicesRef.current.fetchBookings(dayStart, dayEnd, providerId)
      
      // ✅ CRITICAL: Generate available time slots using opening hours from settings
      const slots = servicesRef.current.generateTimeSlots(selectedDate, durationMin, bookings, bookingSettings)

      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error checking availability:', error)
      setAvailableSlots([])
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    // Ensure value is always a string
    const safeValue = String(value || '')
    setFormData(prev => ({
      ...prev,
      [name]: safeValue,
      // Reset time when service or provider changes
      ...(name === 'serviceId' || name === 'providerId' ? { time: '' } : {})
    }))
    // Ensure error is always a string
    setError(null)
  }

  const handleDateSelect = (date) => {
    // Ensure date is always a string
    const safeDate = String(date || '')
    setFormData(prev => ({
      ...prev,
      date: safeDate,
      time: '' // Reset time when date changes
    }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate required fields
      // For restaurants, only date, time, and name are required
      if (isRestaurant) {
        if (!formData.date || !formData.time || !formData.name) {
          throw new Error('Vänligen fyll i alla obligatoriska fält')
        }
      } else {
        // For other business types, require serviceId and providerId
        if (!formData.serviceId || !formData.providerId || !formData.date || !formData.time) {
          throw new Error('Vänligen fyll i alla obligatoriska fält')
        }
      }

      // Build booking date/time
      const bookingDate = new Date(formData.date)
      const [hours, minutes] = formData.time.split(':')
      bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      // For restaurants, use default duration (120 minutes)
      // For other business types, get duration from selected service
      let durationMin = 120
      if (!isRestaurant) {
        const selectedService = services.find(s => s._id === formData.serviceId)
        if (!selectedService) {
          const terminology = bookingSettings?.industryTerminology || {}
          const terms = terminology?.terminology || {}
          const serviceTerm = terms.service || 'tjänst'
          throw new Error(`Ogiltig ${serviceTerm} vald`)
        }
        durationMin = selectedService.durationMin || 120
      }

      const bookingEnd = new Date(bookingDate)
      bookingEnd.setMinutes(bookingEnd.getMinutes() + durationMin)

      // Ensure services are loaded
      await loadBookingServices()
      if (!servicesRef.current.createBooking) {
        throw new Error('Bokningstjänster kunde inte laddas')
      }

      // Create booking
      // For restaurants, serviceId and providerId are optional (can be null or use defaults)
      const result = await servicesRef.current.createBooking({
        serviceId: isRestaurant ? null : formData.serviceId,
        providerId: isRestaurant ? null : formData.providerId,
        start: bookingDate,
        end: bookingEnd,
        customerName: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: 'confirmed'
      })

      if (result.success) {
        setSuccess(true)
        await loadAnalyticsServices()
        if (servicesRef.current.trackFormSubmit) {
          servicesRef.current.trackFormSubmit('booking-form').catch(() => {})
        }
        
        // Reset form
        setFormData({
          date: '',
          serviceId: '',
          providerId: '',
          guests: 2,
          time: '',
          name: '',
          email: '',
          phone: '',
          notes: '',
          specialRequests: '',
          bookingType: formData.bookingType
        })
        
        // Refresh availability
        await checkAvailability()
        await loadBookedDates()
        
        alert('Tack för din bokning! Vi bekräftar via e-post inom kort.')
      } else if (result.conflict) {
        setError(result.message || 'Denna tid är redan bokad. Välj en annan tid.')
        // Refresh availability
        await checkAvailability()
      } else {
        throw new Error(result.message || 'Kunde inte skapa bokning')
      }
    } catch (error) {
      console.error('Error submitting booking:', error)
      // Ensure error is always a string
      const errorMessage = error instanceof Error ? error.message : String(error || 'Ett fel uppstod vid skapande av bokning')
      setError(errorMessage || 'Ett fel uppstod vid skapande av bokning')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <section className="booking-form-section" data-reveal>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Laddar bokningsdata...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="booking-form-section" data-reveal>
      <form className="booking-form" onSubmit={handleSubmit}>
        {error && typeof error === 'string' && error.length > 0 && (
          <div className="booking-error" style={{ 
            padding: '1rem', 
            marginBottom: '1rem', 
            backgroundColor: '#fee', 
            color: '#c33',
            borderRadius: '4px'
          }}>
            {String(error)}
          </div>
        )}
        
        {success === true && (
          <div className="booking-success" style={{ 
            padding: '1rem', 
            marginBottom: '1rem', 
            backgroundColor: '#efe', 
            color: '#3c3',
            borderRadius: '4px'
          }}>
            Bokning skapad! Vi bekräftar via e-post inom kort.
          </div>
        )}

        <div className="booking-form-grid">
          {/* ✅ For restaurants, hide service/provider selectors - they're not needed */}
          {!isRestaurant && (
            <>
              <div className="booking-form-group">
                <label htmlFor="serviceId">{getServiceLabel()} *</label>
                <select
                  id="serviceId"
                  name="serviceId"
                  value={String(formData.serviceId || '')}
                  onChange={handleChange}
                  required
                >
                  <option value="">Välj {getServiceTerm()}...</option>
                  {Array.isArray(services) && services.map((service) => {
                    if (!service || typeof service !== 'object') return null
                    const serviceId = String(service._id || '')
                    const serviceName = String(service.name || 'Unknown')
                    const duration = service.durationMin ? `(${Number(service.durationMin)} min)` : ''
                    return (
                      <option key={serviceId || Math.random()} value={serviceId}>
                        {serviceName} {duration}
                      </option>
                    )
                  })}
                </select>
                {(!Array.isArray(services) || services.length === 0) && !loading && (
                  <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                    Inga {getServiceTerm()}er tillgängliga. Kontakta restaurangen för bokning.
                  </p>
                )}
              </div>

              <div className="booking-form-group">
                <label htmlFor="providerId">{getProviderLabel()} *</label>
                <select
                  id="providerId"
                  name="providerId"
                  value={String(formData.providerId || '')}
                  onChange={handleChange}
                  required
                >
                  <option value="">Välj {getProviderTerm().toLowerCase()}...</option>
                  {Array.isArray(providers) && providers.map((provider) => {
                    if (!provider || typeof provider !== 'object') return null
                    const providerId = String(provider._id || '')
                    const providerName = String(provider.name || 'Unknown')
                    return (
                      <option key={providerId || Math.random()} value={providerId}>
                        {providerName}
                      </option>
                    )
                  })}
                </select>
                {(!Array.isArray(providers) || providers.length === 0) && !loading && (
                  <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                    Ingen {getProviderTerm().toLowerCase()} tillgänglig. Kontakta restaurangen för bokning.
                  </p>
                )}
              </div>
            </>
          )}

          <div className="booking-form-group full-width">
            <label>Välj datum *</label>
            <Suspense fallback={<div style={{ padding: '1rem', textAlign: 'center' }}>Laddar kalender...</div>}>
              <Calendar
                selectedDate={formData.date || ''}
                onDateSelect={handleDateSelect}
                bookedDates={Array.isArray(bookedDates) ? bookedDates : []}
              />
            </Suspense>
            {formData.date && (
              <input
                type="hidden"
                name="date"
                value={String(formData.date || '')}
                required
              />
            )}
          </div>

          <div className="booking-form-group">
            <label htmlFor="time">{getTimeLabel()} *</label>
            <select
              id="time"
              name="time"
              value={String(formData.time || '')}
              onChange={handleChange}
              required
              disabled={availableSlots.length === 0 && formData.date !== '' && (isRestaurant || (formData.serviceId && formData.providerId))}
            >
              <option value="">
                {availableSlots.length === 0 && formData.date !== '' 
                  ? 'Inga lediga tider för detta datum' 
                  : `Välj ${getTimeLabel().toLowerCase()}`}
              </option>
              {Array.isArray(availableSlots) && availableSlots.map((slot, index) => {
                if (!slot || typeof slot !== 'object') return null
                const timeValue = slot.start && typeof slot.start.toTimeString === 'function' 
                  ? String(slot.start.toTimeString().slice(0, 5)) 
                  : ''
                const displayValue = String(slot.display || '')
                if (!timeValue && !displayValue) return null
                return (
                  <option key={index} value={timeValue}>
                    {displayValue}
                  </option>
                )
              })}
            </select>
            {formData.date && availableSlots.length === 0 && (isRestaurant || (formData.serviceId && formData.providerId)) && (
              <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                Inga lediga tider för detta datum. Välj ett annat datum.
              </p>
            )}
          </div>

          {bookingSettings && bookingSettings.formFields && bookingSettings.formFields.requirePartySize === true && (
            <div className="booking-form-group">
              <label htmlFor="guests">{getPartySizeLabel()} *</label>
              <input
                type="number"
                id="guests"
                name="guests"
                value={Number(formData.guests) || 2}
                onChange={handleChange}
                min="1"
                max="20"
                required
                placeholder={getPartySizeLabel()}
              />
            </div>
          )}

          {bookingSettings && bookingSettings.formFields && bookingSettings.formFields.requireNotes === true && (
            <div className="booking-form-group full-width">
              <label htmlFor="notes">{getNotesLabel()} *</label>
              <textarea
                id="notes"
                name="notes"
                value={String(formData.notes || '')}
                onChange={handleChange}
                required
                rows="3"
                placeholder={getNotesLabel()}
              />
            </div>
          )}

          <div className="booking-form-group">
            <label htmlFor="name">{getCustomerNameLabel()} *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
              placeholder={getCustomerNameLabel()}
            />
          </div>

          {/* ✅ CRITICAL: Use formFields from settings to conditionally show/require fields */}
          {bookingSettings && bookingSettings.formFields && typeof bookingSettings.formFields.requireEmail !== 'undefined' && bookingSettings.formFields.requireEmail !== false && (
            <div className="booking-form-group">
              <label htmlFor="email">E-post {bookingSettings.formFields.requireEmail === true ? '*' : ''}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={String(formData.email || '')}
                onChange={handleChange}
                required={bookingSettings.formFields.requireEmail === true}
              />
            </div>
          )}

          {bookingSettings && bookingSettings.formFields && typeof bookingSettings.formFields.requirePhone !== 'undefined' && bookingSettings.formFields.requirePhone !== false && (
            <div className="booking-form-group">
              <label htmlFor="phone">Telefon {bookingSettings.formFields.requirePhone === true ? '*' : ''}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={String(formData.phone || '')}
                onChange={handleChange}
                required={bookingSettings.formFields.requirePhone === true}
              />
            </div>
          )}

          {bookingSettings && bookingSettings.formFields && typeof bookingSettings.formFields.allowSpecialRequests !== 'undefined' && bookingSettings.formFields.allowSpecialRequests !== false && (
            <div className="booking-form-group full-width">
              <label htmlFor="specialRequests">Särskilda önskemål</label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={String(formData.specialRequests || '')}
                onChange={handleChange}
                rows="3"
                placeholder="Har du några särskilda önskemål?"
              />
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="primary-btn booking-submit"
          disabled={submitting || !String(formData.date || '') || !String(formData.time || '') || (isRestaurant ? !String(formData.name || '') : (!String(formData.serviceId || '') || !String(formData.providerId || '')))}
        >
          {submitting ? 'Skapar bokning...' : 'Bekräfta bokning'}
        </button>
      </form>
    </section>
  )
}

export default BookingForm

