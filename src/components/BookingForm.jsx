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
  const [products, setProducts] = useState([]) // Products for booking
  const [selectedProducts, setSelectedProducts] = useState([]) // Selected product IDs
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
  
  // Check if product booking is enabled
  // ✅ Always define this variable, even if bookingSettings is null
  const isProductBookingEnabled = Boolean(
    bookingSettings?.formFields?.allowProductBooking === true &&
    bookingSettings?.paymentSettings?.enabled === true
  )
  
  // ✅ CORRECT: Determine if this is a restaurant booking
  // Check industryTerminology.businessType (recommended) or formLabels.partySize
  // The API returns businessType in industryTerminology, not in settings
  const isRestaurant = industryTerminology?.businessType === 'restaurant' || 
                       !!formLabels.partySize ||
                       bookingSettings?.businessType === 'restaurant' // Fallback: will work after API auto-updates
  
  // Debug: Log restaurant detection
  console.log('🔍 Restaurant detection:', {
    isRestaurant,
    industryTerminologyBusinessType: industryTerminology?.businessType,
    settingsBusinessType: bookingSettings?.businessType,
    hasPartySize: !!formLabels.partySize,
    partySize: formLabels.partySize,
    selectService: formLabels.selectService
  })
  
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
    fetchBookingProducts: null,
    createBooking: null,
    generateTimeSlots: null,
    generateAvailableSlots: null,
    fetchBookings: null,
    fetchCalendarAvailability: null,
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
        servicesRef.current.fetchBookingProducts = bookingModule.fetchBookingProducts; // ✅ Add fetchBookingProducts
        servicesRef.current.createBooking = bookingModule.createBooking;
        servicesRef.current.generateTimeSlots = bookingModule.generateTimeSlots;
        servicesRef.current.generateAvailableSlots = bookingModule.generateAvailableSlots;
        servicesRef.current.fetchBookings = bookingModule.fetchBookings;
        servicesRef.current.fetchCalendarAvailability = bookingModule.fetchCalendarAvailability; // ✅ Add fetchCalendarAvailability
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
        
        // ✅ Load products if product booking is enabled
        const allowProductBooking = settingsData?.formFields?.allowProductBooking === true
        const paymentEnabled = settingsData?.paymentSettings?.enabled === true
        
        console.log('🔍 Product booking check:', {
          allowProductBooking,
          paymentEnabled,
          hasFetchFunction: !!servicesRef.current.fetchBookingProducts,
          formFields: settingsData?.formFields,
          paymentSettings: settingsData?.paymentSettings
        })
        
        if (allowProductBooking && paymentEnabled && servicesRef.current.fetchBookingProducts) {
          try {
            console.log('📦 Fetching products...')
            const productsData = await servicesRef.current.fetchBookingProducts()
            console.log('📦 Products response:', productsData)
            setProducts(Array.isArray(productsData) ? productsData : [])
            console.log('✅ Products loaded:', Array.isArray(productsData) ? productsData.length : 0)
          } catch (error) {
            console.error('❌ Error loading products:', error)
            setProducts([])
          }
        } else {
          console.log('⚠️ Product booking not enabled or fetch function not available')
          setProducts([])
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
  // ✅ Uses new API endpoint that handles all availability calculations on backend
  useEffect(() => {
    loadBookedDates()
  }, [])

  const loadBookedDates = async () => {
    try {
      await loadBookingServices()
      if (!servicesRef.current.fetchCalendarAvailability) {
        console.warn('Calendar availability service not loaded yet')
        return
      }
      
      const today = new Date()
      const futureDate = new Date()
      futureDate.setDate(today.getDate() + 60) // Next 60 days
      
      // ✅ RECOMMENDED: Use new API endpoint for calendar availability
      // This uses correct slot-by-slot calculation on the backend
      const availability = await servicesRef.current.fetchCalendarAvailability(today, futureDate)
      
      if (availability) {
        // Extract dates that are fully booked
        const booked = new Set()
        Object.entries(availability).forEach(([date, status]) => {
          if (status.isFullyBooked) {
            booked.add(date)
          }
        })
        setBookedDates(Array.from(booked))
      } else {
        // Fallback: if API fails, don't mark any dates as booked
        setBookedDates([])
      }
    } catch (error) {
      console.error('Error loading booked dates:', error)
      // On error, don't mark any dates as booked (safer than blocking all dates)
      setBookedDates([])
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
      
      // ✅ CRITICAL: Determine if providerId is required based on business type
      // For restaurants (providerId is null), allow bookings without providerId
      // For provider-based bookings, only count bookings with valid providerId
      const requireProviderId = !isRestaurant && providerId != null && providerId !== ''
      
      // Debug: Log what we're passing to generateTimeSlots
      console.log('🔍 checkAvailability - calling generateTimeSlots with:', {
        date: selectedDate.toISOString(),
        durationMin,
        bookingsCount: bookings.length,
        requireProviderId,
        isRestaurant,
        bookingSettings: bookingSettings ? {
          hasOpeningHours: !!bookingSettings.openingHours,
          openingHoursKeys: bookingSettings.openingHours ? Object.keys(bookingSettings.openingHours) : null,
          hasCalendarBehavior: !!bookingSettings.calendarBehavior,
          settingsKeys: Object.keys(bookingSettings)
        } : null
      });
      
      // ✅ CRITICAL: Generate available time slots using opening hours from settings
      // Pass requireProviderId flag so only bookings with valid providerId block slots
      const slots = servicesRef.current.generateTimeSlots(selectedDate, durationMin, bookings, bookingSettings, requireProviderId)
      
      console.log('✅ Generated slots:', slots.length, 'available time slots');

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
      // ✅ CRITICAL: For restaurants, serviceId is still required (must be valid service ID)
      // Even though we hide the service selector, we need to use a valid serviceId
      // Use first available service if none selected, or formData.serviceId if selected
      let serviceIdToUse = formData.serviceId
      
      if (isRestaurant && !serviceIdToUse) {
        // For restaurants without selected service, use first available service
        if (services && services.length > 0) {
          serviceIdToUse = services[0]._id
          console.log('🍽️ Restaurant booking: Auto-selecting first service:', services[0].name, serviceIdToUse)
        } else {
          throw new Error('Inga tjänster tillgängliga. Kontakta restaurangen för bokning.')
        }
      }
      
      if (!serviceIdToUse) {
        throw new Error('Vänligen välj en tjänst')
      }
      
      // ✅ Log booking data before sending
      const partySizeValue = isRestaurant ? (Number(formData.guests) || 1) : undefined;
      console.log('📋 Booking data before sending:', {
        serviceId: serviceIdToUse ? serviceIdToUse.substring(0, 20) + '...' : 'MISSING',
        providerId: isRestaurant ? null : formData.providerId,
        start: bookingDate.toISOString(),
        end: bookingEnd.toISOString(),
        customerName: formData.name || 'MISSING',
        email: formData.email || 'MISSING',
        phone: formData.phone || 'empty',
        partySize: partySizeValue,
        partySizeType: typeof partySizeValue,
        isRestaurant: isRestaurant
      });
      
      const result = await servicesRef.current.createBooking({
        serviceId: serviceIdToUse, // ✅ Always use valid serviceId
        providerId: isRestaurant ? null : formData.providerId, // ✅ Optional for restaurants
        start: bookingDate,
        end: bookingEnd,
        customerName: formData.name, // ✅ Required: customer name
        email: formData.email,
        phone: formData.phone,
        partySize: isRestaurant ? (Number(formData.guests) || 1) : undefined, // ✅ Include partySize for restaurants (ensure it's a number)
        productIds: selectedProducts.length > 0 ? selectedProducts : undefined, // ✅ Include selected product IDs
        status: 'confirmed'
      })

      if (result.success) {
        // ✅ CRITICAL: Check if payment is required
        if (result.requiresPayment && result.checkoutUrl) {
          console.log('💳 Payment required, redirecting to Stripe checkout:', result.checkoutUrl)
          // Redirect customer to Stripe checkout
          window.location.href = result.checkoutUrl
          return // Don't reset form or show success message - user will be redirected
        }
        
        // No payment required - booking confirmed immediately
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
        setSelectedProducts([]) // Reset selected products
        
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
      let errorMessage = error instanceof Error ? error.message : String(error || 'Ett fel uppstod vid skapande av bokning')
      
      // ✅ Enhanced error messages based on error type
      if (errorMessage.includes('betalningssession')) {
        // Payment session error - provide more helpful message
        errorMessage = 'Ett fel uppstod vid skapande av betalningssession. Kontrollera att Stripe är korrekt konfigurerat och att produkterna finns i Stripe.'
      } else if (errorMessage.includes('Betalningssystem')) {
        // Payment system not configured
        errorMessage = 'Betalningssystemet är inte korrekt konfigurerat. Kontakta support.'
      } else if (errorMessage.includes('produkter hittades inte')) {
        // Products not found
        errorMessage = 'En eller flera produkter hittades inte. Kontrollera att produkterna finns i Stripe och har aktiva priser.'
      } else if (errorMessage.includes('Inga giltiga produkter')) {
        // No valid products
        errorMessage = 'Inga giltiga produkter hittades för betalning. Kontrollera att produkterna har aktiva priser.'
      }
      
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
              disabled={availableSlots.length === 0 && formData.date !== ''}
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
            {formData.date && availableSlots.length === 0 && (
              <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                Inga lediga tider för detta datum. Välj ett annat datum.
              </p>
            )}
          </div>

          {/* ✅ Always show party size field for restaurants, or if requirePartySize is true */}
          {(isRestaurant || (bookingSettings && bookingSettings.formFields && bookingSettings.formFields.requirePartySize === true)) && (
            <div className="booking-form-group">
              <label htmlFor="guests">{getPartySizeLabel()} *</label>
              <input
                type="number"
                id="guests"
                name="guests"
                value={Number(formData.guests) || 1}
                onChange={handleChange}
                min="1"
                max="50"
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

          {/* ✅ Product Selection Section */}
          {isProductBookingEnabled && products.length > 0 && (
            <div className="booking-form-group full-width" style={{ marginTop: '1.5rem', padding: '1.5rem', border: '1px solid rgba(244, 239, 232, 0.2)', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Välj produkter/paket (valfritt)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {products.map(product => (
                  <label
                    key={product.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      padding: '1rem',
                      border: selectedProducts.includes(product.id) ? '1px solid #c5a26e' : '1px solid rgba(244, 239, 232, 0.2)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: selectedProducts.includes(product.id) ? 'rgba(197, 162, 110, 0.1)' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedProducts.includes(product.id)) {
                        e.currentTarget.style.backgroundColor = 'rgba(244, 239, 232, 0.05)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedProducts.includes(product.id)) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      value={product.id}
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts([...selectedProducts, product.id])
                        } else {
                          setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                        }
                      }}
                      style={{ marginRight: '1rem', marginTop: '2px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{product.name}</div>
                      {product.description && (
                        <div style={{ color: 'rgba(244, 239, 232, 0.7)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                          {product.description}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {product.prices && Array.isArray(product.prices) && product.prices.map(price => (
                          <span
                            key={price.id}
                            style={{
                              backgroundColor: '#c5a26e',
                              color: '#050505',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.875rem',
                              fontWeight: '600'
                            }}
                          >
                            {(price.amount / 100).toFixed(2)} {price.currency}
                          </span>
                        ))}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
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

