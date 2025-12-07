import { useEffect, useState, Suspense, lazy } from 'react'
import { NavLink, Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'
import ConsentBanner from './components/ConsentBanner'
import { useGeoTracking } from './hooks/useGeoTracking'
// Lazy load BookingForm to avoid circular dependencies
const BookingForm = lazy(() => import('./components/BookingForm').then(module => ({ default: module.BookingForm })))

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

const BookPage = () => (
  <div className="book-page-wrapper">
    <PageHero
      eyebrow="Boka"
      title="Välj din ritual."
      copy="Tokyo Street, Bangkok Heat och Asian Fusion Luxe bekräftas online. Helkvällar kräver dialog med concierge."
    />
    <Suspense fallback={
      <section className="booking-form-section" data-reveal>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Laddar bokningsformulär...</p>
        </div>
      </section>
    }>
      <BookingForm />
    </Suspense>
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
