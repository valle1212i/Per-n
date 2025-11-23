import './ConsentBanner.css'

function ConsentBanner({ visible, onAccept, onDecline }) {
  if (!visible) return null

  return (
    <div className="consent-banner" role="dialog" aria-live="polite">
      <div className="consent-banner__content">
        <p className="consent-banner__title">Vi värnar din integritet</p>
        <p className="consent-banner__text">
          Vi använder geo-data för att förstå hur Perán upplevs runt om i världen. Uppgifterna skickas först när du
          samtycker. Du kan när som helst återkalla ditt samtycke.
        </p>
      </div>
      <div className="consent-banner__actions">
        <button type="button" className="consent-banner__btn ghost" onClick={onDecline}>
          Avvisa
        </button>
        <button type="button" className="consent-banner__btn primary" onClick={onAccept}>
          Tillåt
        </button>
      </div>
    </div>
  )
}

export default ConsentBanner


