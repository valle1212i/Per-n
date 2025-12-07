import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'

// Lazy load Calendar to avoid initialization issues
const Calendar = lazy(() => import('./Calendar').then(module => ({ default: module.Calendar })))

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
        
        setServices(servicesData)
        setProviders(providersData)
        setBookingSettings(settingsData)
        
        // Track form start
        if (servicesRef.current.trackFormStart) {
          servicesRef.current.trackFormStart('booking-form').catch(() => {})
        }
      } catch (error) {
        console.error('Error loading booking data:', error)
        setError('Kunde inte ladda bokningsdata. Ladda om sidan och försök igen.')
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
        if (newSettings) {
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
  useEffect(() => {
    if (formData.serviceId && formData.date && formData.providerId && bookingSettings && services && services.length > 0) {
      checkAvailability()
    } else {
      setAvailableSlots([])
    }
  }, [formData.serviceId, formData.date, formData.providerId, bookingSettings, services])

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
    if (!formData.serviceId || !formData.providerId || !formData.date || !bookingSettings) {
      setAvailableSlots([])
      return
    }

    try {
      await loadBookingServices()
      if (!servicesRef.current.generateTimeSlots || !servicesRef.current.fetchBookings) {
        console.warn('Booking services not loaded yet')
        setAvailableSlots([])
        return
      }
      
      const selectedService = services.find(s => s._id === formData.serviceId)
      if (!selectedService) {
        setAvailableSlots([])
        return
      }

      const durationMin = selectedService.durationMin || 120
      const selectedDate = new Date(formData.date)
      
      // Get bookings for the selected day
      const dayStart = new Date(selectedDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(selectedDate)
      dayEnd.setHours(23, 59, 59, 999)
      
      const bookings = await servicesRef.current.fetchBookings(dayStart, dayEnd, formData.providerId)
      
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
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset time when service or provider changes
      ...(name === 'serviceId' || name === 'providerId' ? { time: '' } : {})
    }))
    setError(null)
  }

  const handleDateSelect = (date) => {
    setFormData(prev => ({
      ...prev,
      date,
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
      if (!formData.serviceId || !formData.providerId || !formData.date || !formData.time) {
        throw new Error('Vänligen fyll i alla obligatoriska fält')
      }

      const selectedService = services.find(s => s._id === formData.serviceId)
      if (!selectedService) {
        throw new Error('Ogiltig tjänst vald')
      }

      // Build booking date/time
      const bookingDate = new Date(formData.date)
      const [hours, minutes] = formData.time.split(':')
      bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      const durationMin = selectedService.durationMin || 120
      const bookingEnd = new Date(bookingDate)
      bookingEnd.setMinutes(bookingEnd.getMinutes() + durationMin)

      // Ensure services are loaded
      await loadBookingServices()
      if (!servicesRef.current.createBooking) {
        throw new Error('Bokningstjänster kunde inte laddas')
      }

      // Create booking
      const result = await servicesRef.current.createBooking({
        serviceId: formData.serviceId,
        providerId: formData.providerId,
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
      setError(error.message || 'Ett fel uppstod vid skapande av bokning')
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
        {error && (
          <div className="booking-error" style={{ 
            padding: '1rem', 
            marginBottom: '1rem', 
            backgroundColor: '#fee', 
            color: '#c33',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}
        
        {success && (
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
          <div className="booking-form-group">
            <label htmlFor="serviceId">Välj tjänst *</label>
            <select
              id="serviceId"
              name="serviceId"
              value={formData.serviceId}
              onChange={handleChange}
              required
            >
              <option value="">Välj tjänst...</option>
              {Array.isArray(services) && services.map((service) => (
                <option key={service?._id || Math.random()} value={service?._id || ''}>
                  {service?.name || 'Unknown'} {service?.durationMin ? `(${service.durationMin} min)` : ''}
                </option>
              ))}
            </select>
            {(!Array.isArray(services) || services.length === 0) && !loading && (
              <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                Inga tjänster tillgängliga. Kontakta restaurangen för bokning.
              </p>
            )}
          </div>

          <div className="booking-form-group">
            <label htmlFor="providerId">Välj personal/område *</label>
            <select
              id="providerId"
              name="providerId"
              value={formData.providerId}
              onChange={handleChange}
              required
            >
              <option value="">Välj personal/område...</option>
              {Array.isArray(providers) && providers.map((provider) => (
                <option key={provider?._id || Math.random()} value={provider?._id || ''}>
                  {provider?.name || 'Unknown'}
                </option>
              ))}
            </select>
            {(!Array.isArray(providers) || providers.length === 0) && !loading && (
              <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                Ingen personal tillgänglig. Kontakta restaurangen för bokning.
              </p>
            )}
          </div>

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
                value={formData.date}
                required
              />
            )}
          </div>

          <div className="booking-form-group">
            <label htmlFor="time">Tid *</label>
            <select
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              disabled={availableSlots.length === 0 && formData.date !== ''}
            >
              <option value="">
                {availableSlots.length === 0 && formData.date !== '' 
                  ? 'Inga lediga tider för detta datum' 
                  : 'Välj tid'}
              </option>
              {Array.isArray(availableSlots) && availableSlots.map((slot, index) => (
                <option key={index} value={slot?.start?.toTimeString?.()?.slice(0, 5) || ''}>
                  {slot?.display || ''}
                </option>
              ))}
            </select>
            {formData.date && availableSlots.length === 0 && formData.serviceId && formData.providerId && (
              <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                Inga lediga tider för detta datum. Välj ett annat datum.
              </p>
            )}
          </div>

          {bookingSettings?.formFields?.requirePartySize && (
            <div className="booking-form-group">
              <label htmlFor="guests">Gruppstorlek {bookingSettings.formFields.requirePartySize ? '*' : ''}</label>
              <input
                type="number"
                id="guests"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                min="1"
                max="12"
                required={bookingSettings.formFields.requirePartySize}
              />
            </div>
          )}

          {bookingSettings?.formFields?.requireNotes && (
            <div className="booking-form-group full-width">
              <label htmlFor="notes">Anteckningar {bookingSettings.formFields.requireNotes ? '*' : ''}</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                required={bookingSettings.formFields.requireNotes}
                rows="3"
              />
            </div>
          )}

          <div className="booking-form-group">
            <label htmlFor="name">Namn</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* ✅ CRITICAL: Use formFields from settings to conditionally show/require fields */}
          {bookingSettings?.formFields?.requireEmail !== false && (
            <div className="booking-form-group">
              <label htmlFor="email">E-post {bookingSettings?.formFields?.requireEmail ? '*' : ''}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required={bookingSettings?.formFields?.requireEmail}
              />
            </div>
          )}

          {bookingSettings?.formFields?.requirePhone !== false && (
            <div className="booking-form-group">
              <label htmlFor="phone">Telefon {bookingSettings?.formFields?.requirePhone ? '*' : ''}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required={bookingSettings?.formFields?.requirePhone}
              />
            </div>
          )}

          {bookingSettings?.formFields?.allowSpecialRequests !== false && (
            <div className="booking-form-group full-width">
              <label htmlFor="specialRequests">Särskilda önskemål</label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
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
          disabled={submitting || !formData.serviceId || !formData.providerId || !formData.date || !formData.time}
        >
          {submitting ? 'Skapar bokning...' : 'Bekräfta bokning'}
        </button>
      </form>
    </section>
  )
}

export default BookingForm

