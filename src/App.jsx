import { useEffect, useState, useCallback } from 'react'
import { NavLink, Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'
import ConsentBanner from './components/ConsentBanner'
import { useGeoTracking } from './hooks/useGeoTracking'
// Use dynamic imports to avoid initialization issues
// Services will be loaded lazily when needed

const heroSlides = [
  {
    title: 'Celestial buljong',
    caption: 'Släktens fond sjuder över kol i arton timmar.',
    image: '/moredish.png',
  },
  {
    title: 'Gamla stan skymning',
    caption: 'Townhouse-fasaden lyser i dimman från gränderna.',
    image: '/onedesih.png',
  },
  {
    title: 'Opiumblomma',
    caption: 'Kronblad konserverade i lagrad Pu-erh.',
    image: '/cocktail.png',
  },
]

const tastingJourneys = [
  {
    title: 'Tokyo Street',
    price: 'SEK 1 099',
    description:
      'Tjugo serveringar som kartlägger Peráns svensk-kinesiska arv med infusioner, teceremonier och ögonblick vid vagn.',
    details: 'Kväll | Ons–Sön | 17.30 & 20.30',
  },
  {
    title: 'Bangkok Heat',
    price: 'SEK 899',
    description:
      'En ljusare sittning med fokus på skaldjur från Stockholms skärgård, syrliga äpplen och glödgrillade gröna blad.',
    details: 'Vardagar | 12.00',
  },
  {
    title: 'Asian Fusion Luxe',
    price: 'SEK 1 299',
    description:
      'Sju lågalcoholiska infusioner, nordiska teer och lagrade saké som följer Krönikans dramaturgi.',
    details: 'Tillval | Förbokas',
  },
]

const tastingHeroImages = [
  '/peodpleeating.png',
  '/avsmakning.png',
  '/winetastingpic.png',
]

const tastingPackages = [
  {
    title: 'Kampanjer avsmakning',
    image: '/media/package-1.jpg',
    description:
      'Här hittar du säsongens bästa kampanjer och specialerbjudanden för våra avsmakningsmenyer. Perfekt för att uppleva Peráns kök till förmånliga priser.',
    cta: 'Se kampanjer',
    link: '/book',
  },
  {
    title: 'Krönika XX – Fullständig upplevelse',
    image: '/firefood.png',
    description:
      'Njut av vår signaturmeny med tjugo serveringar, infusioner, teceremonier och ögonblick vid vagn. Inkluderar middag och välkomstdrink. Boka för en eller flera gäster.',
    cta: 'Se paket',
    link: '/book',
  },
  {
    title: 'Merkuriuslunch – Dagspaket',
    image: '/media/package-3.jpg',
    description:
      'Njut av vår ljusare lunchmeny med fokus på skaldjur, syrliga smaker och glödgrillade grönsaker. Perfekt för en avslappnad dag i Gamla stan. Välj mellan våra dag- eller kvällspaket.',
    cta: 'Se paket',
    link: '/book',
  },
]

const experiences = [
  {
    title: 'Sinnenas bord',
    detail:
      'Sex platser vid utvecklingsköket där kockarna berättar varje rörelse. Interaktiv uppläggning och inédit serveringar.',
    image: '/vegetables.png',
  },
  {
    title: 'Husets ande',
    detail:
      'En guidad promenad genom den återställda örtapoteksvåningen, arkiven och takateljén innan middagen börjar.',
    image: '/kitchenpic.png',
  },
  {
    title: 'Nattlig vinyl',
    detail:
      'Opium Bar övergår till ett nattligt lyssningsrum med stockholmska vinylgrävare och digestifer till 01.00.',
    image: '/gamlastan.png',
  },
]

const galleryPieces = [
  {
    label: 'Minne 04',
    title: 'Lotus + ostronrök',
    image: '/gyoza.png',
  },
  {
    label: 'Minne 09',
    title: 'Anka glaserad med honung från Roslagen',
    image: '/waguysteak.png',
  },
  {
    label: 'Minne 12',
    title: 'Fermenterad chili och kosmosblomma',
    image: '/media/gallery-3.jpg',
  },
  {
    label: 'Minne 17',
    title: 'Bärnstensbuljong + liljelök',
    image: '/wokpanfire.png',
  },
]

const collaborations = [
  {
    title: 'WFW Ateljé',
    text: 'Stipendier och residens för unga kvinnliga kockar i samarbete med Women for Women och svenska kulinariska skolor.',
  },
  {
    title: 'Jord & Hav-kollektivet',
    text: 'En inköpsring med mikropartners: västkustens ostronodlare, uppländska risfält och regenerativa andgårdar.',
  },
]

const philosophyEvents = [
  {
    title: 'Elementens ritual',
    image: '/media/hero-1.jpg',
    description:
      'En månadsvis workshop där vi utforskar de fem elementen genom matlagning, teceremonier och meditation. Varje session fokuserar på ett element och dess koppling till svensk-kinesisk köksfilosofi.',
    cta: 'Läs mer',
    link: '#',
  },
  {
    title: 'Arkivpromenader',
    image: '/media/hero-2.jpg',
    description:
      'Guidade turer genom Peráns återställda apoteksarkiv där fjärde generationens recept och örtböcker visas. Följ av en kortare teceremoni i takateljén.',
    cta: 'Boka tur',
    link: '#',
  },
  {
    title: 'Krönikeskrivning',
    image: '/media/hero-3.jpg',
    description:
      'Lär dig att dokumentera smakminnen och matresor i Peráns stil. Workshop i samarbete med lokala författare och matjournalister.',
    cta: 'Läs mer',
    link: '#',
  },
  {
    title: 'Vår stolta kock',
    image: '/asianchefsawe.png',
    description:
      'Månadsvisa möten med våra producenter: västkustens ostronodlare, uppländska risbönder och regenerativa andgårdar. Smakning och samtal om hållbarhet.',
    cta: 'Läs mer',
    link: '#',
  },
]

const navLinks = [
  { to: '/philosophy', label: 'Filosofi' },
  { to: '/tasting', label: 'Avsmakning' },
  { to: '/experiences', label: 'Upplevelser' },
  { to: '/gallery', label: 'Galleri' },
  { to: '/reserve', label: 'Reservationer' },
]

const HeroSection = ({ onMenuClick }) => (
  <section className="hero" data-reveal>
    <div className="hero-content">
      <p className="eyebrow">Progressiv svensk–kinesisk</p>
      <h1>Tiden rör sig åt ett håll, minnen åt ett annat.</h1>
      <p className="lede">
        Perán är ett townhouse i Gamla stan där örtapotekets ritualer möter en tjugo-rättersjournal av eldkyssad matlagning.
        Varje sittning är ett samtal mellan dåtid och nutid.
      </p>
      <div className="cta-row">
        <Link className="primary-btn" to="/book">
          Boka
        </Link>
        <button
          className="text-btn"
          onClick={onMenuClick}
          type="button"
        >
          Menu
        </button>
      </div>
    </div>
    <div className="hero-slides">
      {heroSlides.map((slide, index) => (
        <article className="hero-slide" key={slide.title} data-reveal style={{ '--delay': `${index * 120}ms` }}>
          <div className="hero-image" style={{ backgroundImage: `url(${slide.image})` }} />
          <div className="hero-slide-caption">
            <p className="slide-label">{slide.title}</p>
            <p>{slide.caption}</p>
          </div>
        </article>
      ))}
    </div>
  </section>
)

const SplitSection = () => (
  <section className="split-section" data-reveal>
    <Link to="/philosophy" className="split-card">
      <div className="split-image" style={{ backgroundImage: 'url(/restarauntpic.png)' }} />
      <div className="split-overlay">
        <h2 className="split-title">Vår berättelse</h2>
      </div>
    </Link>
    <Link to="/tasting" className="split-card">
      <div className="split-image" style={{ backgroundImage: 'url(/asiandish.png)' }} />
      <div className="split-overlay">
        <h2 className="split-title">Köket</h2>
      </div>
    </Link>
  </section>
)

const StorySection = () => (
  <section className="story" data-reveal>
    <div className="story-hero">
      <div className="story-hero-bg" style={{ backgroundImage: 'url(/marketinchina.png)' }} />
      <div className="story-hero-overlay" />
      <div className="story-hero-content">
        <p className="eyebrow">Fem element · Fem sinnen · Tjugo minnen</p>
        <h2>En filosofi rotad i örtarv och Stockholms nattliga puls.</h2>
      </div>
    </div>
    <div className="story-content">
      <p>
        Kökschef Araya bär fjärde generationens apotekarnycklar. Perán flätar kol, ånga, fermentation och ljud för att
        koreografera minnesbilder. Townhouset rymmer konstnärliga interventioner, arkiv och stilla te-rum.
      </p>
      <div className="story-grid">
        <div>
          <p className="mini-title">Elementens syntax</p>
          <p>Serveringarna växlar mellan jord, vatten, eld, metall och trä – översatta till textur, hetta eller doft.</p>
        </div>
        <div>
          <p className="mini-title">Krönikeskrift</p>
          <p>Menyerna liknar en resedagbok med kort prosa, arkivfoton och bläckskisser.</p>
        </div>
        <div>
          <p className="mini-title">Lokala gillen</p>
          <p>Råvaror hämtas från skärgårdens saltbäddar, västkustens tångodlare och en ankgård vi driver i Uppland.</p>
        </div>
      </div>
    </div>
  </section>
)

const PhilosophyMainSection = () => (
  <section className="philosophy-main" data-reveal>
    <div className="philosophy-main-bg" style={{ backgroundImage: 'url(/drawedkitchen.png)' }} />
    <div className="philosophy-main-overlay" />
    <div className="philosophy-main-content">
      <h2 className="philosophy-main-title">Filosofi</h2>
      <p className="philosophy-main-subtitle">Smakresa för sinnena</p>
      <p className="philosophy-main-text">
        Lunch i svensk-kinesisk anda, unika middagsupplevelser och välgjorda infusioner – Perán är så mycket mer än bara
        en restaurangupplevelse. Bekanta dig med influenser från det moderna, progressiva köket i vår townhouse, i
        Opiumbaren eller på takterrassen med drömska vyer över Gamla stan. Välkommen till en smakresa för alla sinnen.
      </p>
      <Link className="philosophy-main-cta" to="/tasting">
        Våra menyer
      </Link>
    </div>
  </section>
)

const PhilosophyCalendarSection = () => (
  <section className="philosophy-calendar" data-reveal>
    <div className="philosophy-calendar-header">
      <h2>Kalendarium</h2>
    </div>
    <div className="philosophy-calendar-grid">
      {philosophyEvents.map((event, index) => (
        <article key={event.title} className="philosophy-calendar-card" data-reveal style={{ '--delay': `${index * 100}ms` }}>
          <div className="philosophy-calendar-image" style={{ backgroundImage: `url(${event.image})` }} />
          <div className="philosophy-calendar-content">
            <h3 className="philosophy-calendar-title">{event.title}</h3>
            <p className="philosophy-calendar-description">{event.description}</p>
            <Link className="philosophy-calendar-cta" to={event.link}>
              {event.cta}
            </Link>
          </div>
        </article>
      ))}
    </div>
  </section>
)

const TastingSection = () => (
  <section className="tasting" data-reveal>
    <div className="section-header">
      <p className="eyebrow">Avsmakningsresor</p>
      <h2>Menyer som skiftar med <span className="underlined">årstid</span>, <span className="underlined">tidvatten</span> och <span className="underlined">månfas</span>.</h2>
    </div>
    <div className="tasting-cards">
      {tastingJourneys.map((journey, index) => (
        <article className="tasting-card" key={journey.title} data-reveal style={{ '--delay': `${index * 120}ms` }}>
          <div className="tasting-top">
            <p className="mini-title">{journey.title}</p>
            <span>{journey.price}</span>
          </div>
          <p>{journey.description}</p>
          <p className="muted">{journey.details}</p>
          <Link className="text-btn" to="/book">
            Boka
          </Link>
        </article>
      ))}
    </div>
  </section>
)

const TastingHeroSection = () => (
  <section className="tasting-hero" data-reveal>
    <div className="tasting-hero-grid">
      {tastingHeroImages.map((image, index) => (
        <div
          key={index}
          className="tasting-hero-image"
          style={{ backgroundImage: `url(${image})`, '--delay': `${index * 150}ms` }}
          data-reveal
        />
      ))}
    </div>
  </section>
)

const TastingMainTitle = () => (
  <section className="tasting-main-title" data-reveal>
    <h2>AVSMAKNINGSPAKET</h2>
  </section>
)

const TastingPackagesSection = () => (
  <section className="tasting-packages" data-reveal>
    <div className="tasting-packages-grid">
      {tastingPackages.map((pkg, index) => (
        <article key={pkg.title} className="tasting-package-card" data-reveal style={{ '--delay': `${index * 100}ms` }}>
          <div className="tasting-package-image" style={{ backgroundImage: `url(${pkg.image})` }} />
          <div className="tasting-package-content">
            <h3 className="tasting-package-title">{pkg.title}</h3>
            <p className="tasting-package-description">{pkg.description}</p>
            <Link className="tasting-package-cta" to={pkg.link}>
              {pkg.cta}
            </Link>
          </div>
        </article>
      ))}
    </div>
  </section>
)

const ExperienceSection = () => (
  <section className="experience" data-reveal>
    <div className="section-header">
      <p className="eyebrow">Bortom matsalen</p>
      <h2>Försjunkna ritualer invävda i varje besök.</h2>
    </div>
    <ul className="experience-list">
      {experiences.map((experience, index) => (
        <li key={experience.title} data-reveal style={{ '--delay': `${index * 90}ms` }}>
          <span className="index">{String(index + 1).padStart(2, '0')}</span>
          <div>
            <p className="mini-title">{experience.title}</p>
            <p>{experience.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  </section>
)

const FullImageExperienceSection = () => (
  <>
    {experiences.map((experience, index) => (
      <section
        key={experience.title}
        className={`full-image-experience ${index % 2 === 0 ? 'align-left' : 'align-right'}`}
        data-reveal
        style={{ '--delay': `${index * 200}ms` }}
      >
        <div className="full-image-bg" style={{ backgroundImage: `url(${experience.image})` }} />
        <div className="full-image-overlay" />
        <div className="full-image-content">
          <p className="full-image-number">{String(index + 1).padStart(2, '0')}</p>
          <h2 className="full-image-title">{experience.title}</h2>
          <p className="full-image-detail">{experience.detail}</p>
        </div>
      </section>
    ))}
  </>
)

const GallerySection = () => (
  <section className="gallery" data-reveal>
    <div className="section-header">
      <p className="eyebrow">Infångade minnen</p>
      <h2>Redaktionella glimtar ur Peráns journal.</h2>
    </div>
    <div className="gallery-grid">
      {galleryPieces.map((piece, index) => (
        <figure className="gallery-card" key={piece.title} data-reveal style={{ '--delay': `${index * 60}ms` }}>
          <div className="gallery-image" style={{ backgroundImage: `url(${piece.image})` }} />
          <figcaption>
            <p className="muted">{piece.label}</p>
            <p>{piece.title}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  </section>
)

const CollaborationsSection = () => (
  <section className="collab" data-reveal>
    <div className="section-header">
      <p className="eyebrow">Program</p>
      <h2>Samarbeten som sträcker sig bortom bordet.</h2>
    </div>
    <div className="collab-grid">
      {collaborations.map((item, index) => (
        <article key={item.title} data-reveal style={{ '--delay': `${index * 120}ms` }}>
          <p className="mini-title">{item.title}</p>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  </section>
)

const ReserveSection = () => (
  <section className="reserve" data-reveal>
    <div>
      <p className="eyebrow">Reservationer</p>
      <h2>Platser släpps den första varje månad kl. 12.00 (CET).</h2>
      <p>
        Sällskap om 2–4 bokar online. För privata middagar (6 gäster) eller takterrassens ceremonier, kontakta
        concierge@peran.se. Allergier meddelas senast 48 timmar före sittning.
      </p>
    </div>
    <div className="reserve-card">
      <p className="mini-title">Tillgänglighet</p>
      <ul>
        <li>Matsalen · Ons–Sön</li>
        <li>Sinnenas bord · Tor–Lör</li>
        <li>Opium Bar · Dagligen från 21.00</li>
      </ul>
      <a className="primary-btn full" href="https://www.exploretock.com" target="_blank" rel="noreferrer">
        Boka via Tock
      </a>
      <a className="ghost-btn full" href="mailto:concierge@peran.se">
        Mejla concierge
      </a>
    </div>
  </section>
)

const PageHero = ({ eyebrow, title, copy }) => (
  <section className="page-hero" data-reveal>
    <p className="eyebrow">{eyebrow}</p>
    <h1>{title}</h1>
    {copy && <p className="lede">{copy}</p>}
  </section>
)

const HomePage = ({ onMenuClick }) => (
  <>
    <HeroSection onMenuClick={onMenuClick} />
    <StorySection />
    <TastingSection />
    <SplitSection />
    <ExperienceSection />
    <GallerySection />
    <CollaborationsSection />
    <ReserveSection />
  </>
)

const PhilosophyPage = () => (
  <>
    <PageHero
      eyebrow="Filosofi"
      title="Örtlinjer vävda med Stockholms nytolkade energi."
      copy="Vandra genom townhouse-arkiven, apotekslådorna och de privata tesalongerna innan du slår dig ner för Krönikan."
    />
    <PhilosophyMainSection />
    <PhilosophyCalendarSection />
  </>
)

const TastingPage = () => (
  <>
    <TastingHeroSection />
    <TastingMainTitle />
    <TastingPackagesSection />
  </>
)

const ExperiencesPage = () => (
  <>
    <PageHero
      eyebrow="Upplevelser"
      title="Försjunkna ritualer i varje besök."
      copy="Utöver matsalen rymmer Perán ljudbad, arkivpromenader och sena vinylsessioner."
    />
    <FullImageExperienceSection />
    <CollaborationsSection />
  </>
)

const GalleryPage = () => (
  <>
    <PageHero
      eyebrow="Galleri"
      title="Redaktionella glimtar ur Peráns journal."
      copy="Fångade av stockholmska fotografer som dokumenterar townhouse-ljuset varje säsong."
    />
    <GallerySection />
  </>
)

const ReservePage = () => (
  <>
    <PageHero
      eyebrow="Reservationer"
      title="Säkra din plats till Krönika XX."
      copy="Tillgängligheten uppdateras varje månad. För skräddarsydda evenemang, kontakta vår concierge."
    />
    <ReserveSection />
  </>
)

const Calendar = ({ selectedDate, onDateSelect, bookedDates = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const monthNames = [
    'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
    'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
  ]

  const weekDays = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month, year) => {
    const firstDay = new Date(year, month, 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1 // Convert Sunday (0) to 6, Monday (1) to 0
  }

  const isDateBooked = (date) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    return bookedDates.includes(dateStr)
  }

  const isDatePast = (date) => {
    const dateObj = new Date(currentYear, currentMonth, date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return dateObj < today
  }

  const isDateSelected = (date) => {
    if (!selectedDate) return false
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    return selectedDate === dateStr
  }

  const handleDateClick = (date) => {
    if (isDatePast(date) || isDateBooked(date)) return
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    onDateSelect(dateStr)
  }

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
  const days = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button type="button" className="calendar-nav-btn" onClick={goToPreviousMonth}>
          ‹
        </button>
        <h3 className="calendar-month-year">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <button type="button" className="calendar-nav-btn" onClick={goToNextMonth}>
          ›
        </button>
      </div>
      <div className="calendar-weekdays">
        {weekDays.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-days">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="calendar-day empty" />
          }
          const isPast = isDatePast(day)
          const isBooked = isDateBooked(day)
          const isSelected = isDateSelected(day)
          return (
            <button
              key={day}
              type="button"
              className={`calendar-day ${isPast ? 'past' : ''} ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''} ${!isPast && !isBooked ? 'available' : ''}`}
              onClick={() => handleDateClick(day)}
              disabled={isPast || isBooked}
            >
              {day}
            </button>
          )
        })}
      </div>
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color available"></span>
          <span>Tillgänglig</span>
        </div>
        <div className="legend-item">
          <span className="legend-color booked"></span>
          <span>Fullbokat</span>
        </div>
        <div className="legend-item">
          <span className="legend-color selected"></span>
          <span>Vald</span>
        </div>
      </div>
    </div>
  )
}

const BookingForm = () => {
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
  const servicesRef = useState(() => ({
    fetchServices: null,
    fetchProviders: null,
    fetchBookingSettings: null,
    createBooking: null,
    generateTimeSlots: null,
    generateAvailableSlots: null,
    fetchBookings: null,
    trackFormStart: null,
    trackFormSubmit: null
  }))[0]

  // Lazy load booking services
  const loadBookingServices = useCallback(async () => {
    if (!servicesRef.fetchServices) {
      try {
        const bookingModule = await import('./services/booking');
        servicesRef.fetchServices = bookingModule.fetchServices;
        servicesRef.fetchProviders = bookingModule.fetchProviders;
        servicesRef.fetchBookingSettings = bookingModule.fetchBookingSettings;
        servicesRef.createBooking = bookingModule.createBooking;
        servicesRef.generateTimeSlots = bookingModule.generateTimeSlots;
        servicesRef.generateAvailableSlots = bookingModule.generateAvailableSlots;
        servicesRef.fetchBookings = bookingModule.fetchBookings;
      } catch (error) {
        console.error('Failed to load booking services:', error);
        throw error;
      }
    }
  }, [servicesRef])

  // Lazy load analytics services
  const loadAnalyticsServices = useCallback(async () => {
    if (!servicesRef.trackFormStart) {
      try {
        const analyticsModule = await import('./services/analytics');
        servicesRef.trackFormStart = analyticsModule.trackFormStart;
        servicesRef.trackFormSubmit = analyticsModule.trackFormSubmit;
      } catch (error) {
        console.error('Failed to load analytics services:', error);
        // Don't throw - analytics is optional
      }
    }
  }, [servicesRef])

  // ✅ CRITICAL: Load services, providers, and settings on component mount
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Load services dynamically
        await loadBookingServices()
        await loadAnalyticsServices()
        
        if (!servicesRef.fetchServices || !servicesRef.fetchProviders || !servicesRef.fetchBookingSettings) {
          throw new Error('Failed to load booking services')
        }
        
        const [servicesData, providersData, settingsData] = await Promise.all([
          servicesRef.fetchServices(true),
          servicesRef.fetchProviders(true),
          servicesRef.fetchBookingSettings()
        ])
        
        setServices(servicesData)
        setProviders(providersData)
        setBookingSettings(settingsData)
        
        // Track form start
        if (servicesRef.trackFormStart) {
          servicesRef.trackFormStart('booking-form').catch(() => {})
        }
      } catch (error) {
        console.error('Error loading booking data:', error)
        setError('Kunde inte ladda bokningsdata. Ladda om sidan och försök igen.')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [loadBookingServices, loadAnalyticsServices, servicesRef])

  // ✅ CRITICAL: Refresh settings periodically (every 5 minutes)
  useEffect(() => {
    if (!servicesRef.fetchBookingSettings) return

    const refreshSettings = async () => {
      try {
        const newSettings = await servicesRef.fetchBookingSettings()
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
  }, [servicesRef.fetchBookingSettings])

  // ✅ CRITICAL: When service, date, provider, OR settings change, check availability
  useEffect(() => {
    if (formData.serviceId && formData.date && formData.providerId && bookingSettings) {
      checkAvailability()
    }
  }, [formData.serviceId, formData.date, formData.providerId, bookingSettings])

  // Load booked dates for calendar display
  useEffect(() => {
    loadBookedDates()
  }, [loadBookedDates])

  const loadBookedDates = useCallback(async () => {
    if (!formData.providerId) return
    
    try {
      await loadBookingServices()
      if (!servicesRef.fetchBookings) {
        console.warn('Booking services not loaded yet')
        return
      }
      
      const today = new Date()
      const futureDate = new Date()
      futureDate.setDate(today.getDate() + 60) // Next 60 days
      
      const bookings = await servicesRef.fetchBookings(today, futureDate, formData.providerId)
      
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
  }, [formData.providerId, loadBookingServices, servicesRef])

  const checkAvailability = useCallback(async () => {
    if (!formData.serviceId || !formData.providerId || !formData.date || !bookingSettings) {
      setAvailableSlots([])
      return
    }

    try {
      await loadBookingServices()
      if (!servicesRef.generateTimeSlots || !servicesRef.fetchBookings) {
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
      
      const bookings = await servicesRef.fetchBookings(dayStart, dayEnd, formData.providerId)
      
      // ✅ CRITICAL: Generate available time slots using opening hours from settings
      const slots = servicesRef.generateTimeSlots(selectedDate, durationMin, bookings, bookingSettings)

      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error checking availability:', error)
      setAvailableSlots([])
    }
  }, [formData.serviceId, formData.providerId, formData.date, bookingSettings, services, loadBookingServices, servicesRef])

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
      if (!servicesRef.createBooking) {
        throw new Error('Bokningstjänster kunde inte laddas')
      }

      // Create booking
      const result = await servicesRef.createBooking({
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
        if (servicesRef.trackFormSubmit) {
          servicesRef.trackFormSubmit('booking-form').catch(() => {})
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

  const today = new Date().toISOString().split('T')[0]

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
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name} {service.durationMin ? `(${service.durationMin} min)` : ''}
                </option>
              ))}
            </select>
            {services.length === 0 && (
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
              {providers.map((provider) => (
                <option key={provider._id} value={provider._id}>
                  {provider.name}
                </option>
              ))}
            </select>
            {providers.length === 0 && (
              <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                Ingen personal tillgänglig. Kontakta restaurangen för bokning.
              </p>
            )}
          </div>

          <div className="booking-form-group full-width">
            <label>Välj datum *</label>
            <Calendar
              selectedDate={formData.date}
              onDateSelect={handleDateSelect}
              bookedDates={bookedDates}
            />
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
              {availableSlots.map((slot, index) => (
                <option key={index} value={slot.start.toTimeString().slice(0, 5)}>
                  {slot.display}
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

const BookPage = () => (
  <div className="book-page-wrapper">
    <PageHero
      eyebrow="Boka"
      title="Välj din ritual."
      copy="Tokyo Street, Bangkok Heat och Asian Fusion Luxe bekräftas online. Helkvällar kräver dialog med concierge."
    />
    <BookingForm />
  </div>
)

const NotFoundPage = () => (
  <section className="page-hero" data-reveal>
    <p className="eyebrow">404</p>
    <h1>Denna sida har vandrat iväg.</h1>
    <p className="lede">Återvänd till journalen för att fortsätta resan.</p>
    <Link className="primary-btn" to="/">
      Till startsidan
    </Link>
  </section>
)

function App() {
  const location = useLocation()
  const [hasConsent, setHasConsent] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('analytics_consent') === 'granted'
  })
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('analytics_consent') !== null
  })
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(null)

  const menuImages = [
    { src: '/menuperan.png', alt: 'Menu' },
    { src: '/vinmeny.png', alt: 'Vinmeny' },
    { src: '/desserterpiuc.png', alt: 'Desserter' },
    { src: '/smaratter.png', alt: 'Smårätter' },
    { src: '/olmeny.png', alt: 'Ölmeny' }
  ]

  useGeoTracking(hasConsent)

  useEffect(() => {
    window.scrollTo(0, 0)
    // Track page view on route change (non-blocking)
    if (hasConsent) {
      // Use setTimeout to defer tracking and avoid initialization issues
      setTimeout(async () => {
        try {
          const analyticsModule = await import('./services/analytics').catch(() => null)
          if (analyticsModule?.trackPageView) {
            await analyticsModule.trackPageView({ page: location.pathname }).catch(() => {})
          }
        } catch (err) {
          // Silently fail - analytics shouldn't break the app
          console.debug('Analytics tracking failed:', err)
        }
      }, 0)
    }
  }, [location.pathname, hasConsent])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial state

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [location.pathname])

  const handleAcceptConsent = () => {
    localStorage.setItem('analytics_consent', 'granted')
    setHasConsent(true)
    setBannerDismissed(true)
  }

  const handleDeclineConsent = () => {
    localStorage.setItem('analytics_consent', 'denied')
    setHasConsent(false)
    setBannerDismissed(true)
  }

  const handleMenuImageClick = (index) => {
    setSelectedMenuIndex(index)
  }

  const handleCloseFullSize = () => {
    setSelectedMenuIndex(null)
  }

  const handleNextMenu = (e) => {
    e.stopPropagation()
    setSelectedMenuIndex((prev) => (prev + 1) % menuImages.length)
  }

  const handlePrevMenu = (e) => {
    e.stopPropagation()
    setSelectedMenuIndex((prev) => (prev - 1 + menuImages.length) % menuImages.length)
  }

  useEffect(() => {
    if (selectedMenuIndex === null) return

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setSelectedMenuIndex((prev) => (prev + 1) % menuImages.length)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setSelectedMenuIndex((prev) => (prev - 1 + menuImages.length) % menuImages.length)
      } else if (e.key === 'Escape') {
        setSelectedMenuIndex(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedMenuIndex, menuImages.length])

  return (
    <div className="peran-site">
      <ConsentBanner
        visible={!hasConsent && !bannerDismissed}
        onAccept={handleAcceptConsent}
        onDecline={handleDeclineConsent}
      />
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        <nav className="nav">
          <NavLink to="/" className="mark">
            <img src="/peran-logo-new.png" alt="Perán" className="logo-image" />
          </NavLink>
          <div className="nav-links">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to}>
                {link.label}
                <span className="nav-chinese-char">下</span>
              </NavLink>
            ))}
          </div>
          <Link className="ghost-btn" to="/book">
            Boka
          </Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage onMenuClick={() => setIsMenuOpen(true)} />} />
          <Route path="/philosophy" element={<PhilosophyPage />} />
          <Route path="/tasting" element={<TastingPage />} />
          <Route path="/experiences" element={<ExperiencesPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/reserve" element={<ReservePage />} />
          <Route path="/book" element={<BookPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {isMenuOpen && (
        <div className="menu-modal" onClick={() => {
          setIsMenuOpen(false)
          setSelectedMenuIndex(null)
        }}>
          <div className="menu-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="menu-modal-close" onClick={() => {
              setIsMenuOpen(false)
              setSelectedMenuIndex(null)
            }}>
              ×
            </button>
            {selectedMenuIndex === null ? (
              <div className="menu-modal-images">
                {menuImages.map((menu, index) => (
                  <img
                    key={index}
                    src={menu.src}
                    alt={menu.alt}
                    className="menu-modal-image"
                    onClick={() => handleMenuImageClick(index)}
                  />
                ))}
              </div>
            ) : (
              <div className="menu-fullsize-container">
                <button
                  className="menu-nav-arrow menu-nav-arrow-prev"
                  onClick={handlePrevMenu}
                  aria-label="Previous menu"
                >
                  ‹
                </button>
                <img
                  src={menuImages[selectedMenuIndex].src}
                  alt={menuImages[selectedMenuIndex].alt}
                  className="menu-fullsize-image"
                />
                <button
                  className="menu-nav-arrow menu-nav-arrow-next"
                  onClick={handleNextMenu}
                  aria-label="Next menu"
                >
                  ›
                </button>
                <button
                  className="menu-fullsize-close"
                  onClick={handleCloseFullSize}
                  aria-label="Close full size"
                >
                  ×
                </button>
                <div className="menu-fullsize-counter">
                  {selectedMenuIndex + 1} / {menuImages.length}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="footer">
        <div>
          <img src="/peran-logo-new.png" alt="Perán" className="logo-image footer-logo" />
          <p>Kornhamnstorg 57, Gamla stan, Stockholm · Townhouse på sex våningar</p>
          <p className="muted">© {new Date().getFullYear()} Perán House. Formad av minnen.</p>
        </div>
        <div className="footer-links">
          <NavLink to="/">Hem</NavLink>
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
              <span className="nav-chinese-char">下</span>
            </NavLink>
          ))}
        </div>
      </footer>
    </div>
  )
}

export default App
