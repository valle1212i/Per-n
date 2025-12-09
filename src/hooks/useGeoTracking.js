import { useEffect } from 'react'

const SESSION_KEY = 'peran_session_id'
const EVENT_SENT_KEY = 'peran_geo_event_sent'
const ANALYTICS_ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT || '/api/analytics/events'
const ANALYTICS_TOKEN = import.meta.env.VITE_ANALYTICS_TOKEN || 'YOUR_API_KEY'

const getSessionId = () => {
  if (typeof window === 'undefined') return null
  let sessionId = sessionStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = `session-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`
    sessionStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

const fetchGeoData = async () => {
  const response = await fetch('https://ipapi.co/json/')
  if (!response.ok) throw new Error('Failed to fetch geo data')
  const data = await response.json()
  return {
    country: data.country_code || '',
    region: data.region || '',
    city: data.city || '',
    continent: data.continent_code || '',
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone || '',
  }
}

const buildEventPayload = (geo, sessionId) => ({
  type: 'page_view_geo',
  url: window.location.href,
  consent: true,
  country: geo.country,
  region: geo.region,
  city: geo.city,
  continent: geo.continent,
  latitude: geo.latitude,
  longitude: geo.longitude,
  timezone: geo.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  sessionId,
  userAgent: navigator.userAgent,
  timestamp: Date.now(),
})

export const useGeoTracking = (hasConsent) => {
  useEffect(() => {
    if (!hasConsent || typeof window === 'undefined') return
    if (sessionStorage.getItem(EVENT_SENT_KEY)) return

    let cancelled = false

    const track = async () => {
      try {
        const geo = await fetchGeoData()
        if (cancelled || !geo || !geo.country) return
        const sessionId = getSessionId()
        const eventPayload = buildEventPayload(geo, sessionId)

        const response = await fetch(ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ANALYTICS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ events: [eventPayload] }),
        })

        if (!response.ok) throw new Error('Failed to send analytics event')
        sessionStorage.setItem(EVENT_SENT_KEY, 'true')
      } catch (error) {
        console.error('Geo tracking failed:', error)
      }
    }

    track()

    return () => {
      cancelled = true
    }
  }, [hasConsent])
}




