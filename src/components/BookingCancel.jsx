import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

function BookingCancel() {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('booking_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate a brief loading state
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="book-page-wrapper">
        <section className="page-hero" data-reveal>
          <p className="eyebrow">Bokning</p>
          <h1>Laddar...</h1>
        </section>
      </div>
    )
  }

  return (
    <div className="book-page-wrapper">
      <section className="page-hero" data-reveal>
        <p className="eyebrow">Bokning</p>
        <h1>Betalning avbruten</h1>
        <p className="lede">Din bokning är fortfarande väntande. Du kan försöka igen eller avbryta bokningen.</p>
      </section>
      <section className="booking-form-section" data-reveal>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          {bookingId && (
            <p style={{ marginBottom: '1rem', color: 'rgba(244, 239, 232, 0.8)' }}>
              Boknings-ID: {bookingId}
            </p>
          )}
          <p style={{ marginBottom: '2rem', color: 'rgba(244, 239, 232, 0.9)' }}>
            Betalningen avbröts. Din bokning är fortfarande sparad men väntar på betalning.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/book" className="primary-btn">
              Försök igen
            </Link>
            <Link to="/" className="ghost-btn">
              Till startsidan
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default BookingCancel

