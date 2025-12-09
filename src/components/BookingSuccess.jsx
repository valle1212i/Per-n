import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

function BookingSuccess() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
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
          <h1>Bekräftar betalning...</h1>
          <p className="lede">Vänligen vänta medan vi bekräftar din betalning.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="book-page-wrapper">
      <section className="page-hero" data-reveal>
        <p className="eyebrow">Bokning</p>
        <h1>Betalning genomförd!</h1>
        <p className="lede">Din bokning är nu bekräftad. Vi skickar en bekräftelse via e-post inom kort.</p>
      </section>
      <section className="booking-form-section" data-reveal>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          {sessionId && (
            <p style={{ marginBottom: '1rem', color: 'rgba(244, 239, 232, 0.8)' }}>
              Sessions-ID: {sessionId}
            </p>
          )}
          <p style={{ marginBottom: '2rem', color: 'rgba(244, 239, 232, 0.9)' }}>
            Tack för din bokning! Vi ser fram emot att välkomna dig.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="primary-btn">
              Till startsidan
            </Link>
            <Link to="/book" className="ghost-btn">
              Boka igen
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default BookingSuccess

