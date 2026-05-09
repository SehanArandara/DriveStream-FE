import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Car, Wrench, ShieldCheck, Star, MapPin, Phone, Mail,
  ChevronRight, CheckCircle, Zap, Award, Users, ArrowRight,
  Calendar, BarChart2, Bell, Menu, X, Globe, MessageCircle, Camera, Briefcase
} from 'lucide-react';

/* ── tiny hook for scroll-triggered animations ── */
const useScrollReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
};

/* ── data ── */
const SERVICES = [
  { icon: Wrench, title: 'Full Vehicle Service', desc: 'Comprehensive engine, brake, and fluid checks by certified technicians.', color: '#006aff' },
  { icon: Zap,    title: 'Express Oil Change',  desc: 'In and out in 30 minutes—no appointment needed for quick lube visits.', color: '#f59e0b' },
  { icon: ShieldCheck, title: 'Safety Inspection', desc: 'Government-compliant multi-point safety checks and certification.', color: '#10b981' },
  { icon: BarChart2,   title: 'Diagnostics & Scan', desc: 'OBD-II computer diagnostics pinpointing hidden faults fast.', color: '#8b5cf6' },
  { icon: Car,   title: 'Tyres & Alignment',   desc: 'Balancing, rotation, and precision wheel alignment for every make.', color: '#ef4444' },
  { icon: Bell,  title: 'Reminder Alerts',      desc: 'Smart SMS & email reminders so you never miss a service interval.', color: '#06b6d4' },
];

const STATS = [
  { value: '12,400+', label: 'Happy Customers' },
  { value: '98%',     label: 'Satisfaction Rate' },
  { value: '8 Yrs',   label: 'In Business' },
  { value: '24/7',    label: 'Support Available' },
];

const TESTIMONIALS = [
  { name: 'Ashan Perera',    role: 'Toyota Corolla Owner',   rating: 5, text: 'DriveStream completely changed how I manage my car. Real-time tracking is a game changer!' },
  { name: 'Dilini Fernando', role: 'Honda Civic Owner',      rating: 5, text: 'Booked a full service in under two minutes. The portal is incredibly easy to use.' },
  { name: 'Rajan Mehta',     role: 'Nissan X-Trail Owner',  rating: 5, text: 'Transparent pricing, zero surprises. I always know exactly what\'s being done to my vehicle.' },
];

const STEPS = [
  { step: '01', title: 'Create Account',      desc: 'Register in seconds with email or Google.' },
  { step: '02', title: 'Add Your Vehicle',    desc: 'Enter your plate and model—we do the rest.' },
  { step: '03', title: 'Book a Service',      desc: 'Pick a date, time and service package.' },
  { step: '04', title: 'Track & Pay Online',  desc: 'Monitor progress live and pay securely.' },
];

const FAQ = [
  { q: 'Do I need an account to book?',          a: 'Yes—your free account lets you track jobs, view history and receive reminders.' },
  { q: 'Can I bring any vehicle make?',           a: 'Absolutely. We service all makes including Japanese, European and Korean vehicles.' },
  { q: 'How do I pay?',                           a: 'We accept PayHere, credit/debit cards and cash at our workshop.' },
  { q: 'What if I need to reschedule?',           a: 'Cancel or reschedule any booking up to 4 hours before the slot—penalty free.' },
];

/* ── sub-components ── */
const StarRow = ({ count = 5 }) => (
  <div className="ds-stars">
    {Array.from({ length: count }).map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
  </div>
);

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="ds-faq-item" onClick={() => setOpen(!open)}>
      <div className="ds-faq-q">
        <span>{q}</span>
        <ChevronRight size={18} className={`ds-faq-arrow ${open ? 'ds-faq-arrow-open' : ''}`} />
      </div>
      {open && <p className="ds-faq-a">{a}</p>}
    </div>
  );
};

/* ── main component ── */
const LandingPage = () => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useScrollReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="ds-root">
      {/* ── NAVBAR ── */}
      <nav className={`ds-nav ${scrolled ? 'ds-nav-scrolled' : ''}`}>
        <div className="ds-nav-inner">
          <Link to="/" className="ds-logo">
            <Car size={26} /> DriveStream
          </Link>
          <ul className={`ds-nav-links ${menuOpen ? 'ds-nav-open' : ''}`}>
            {['Services','How It Works','About','Contact'].map(item => (
              <li key={item}><a href={`#${item.toLowerCase().replace(' ','-')}`} onClick={() => setMenuOpen(false)}>{item}</a></li>
            ))}
          </ul>
          <div className="ds-nav-cta">
            {user ? (
              <Link to="/dashboard" className="ds-btn-primary">Go to Dashboard <ArrowRight size={16} /></Link>
            ) : (
              <>
                <Link to="/login"    className="ds-btn-ghost">Log In</Link>
                <Link to="/register" className="ds-btn-primary">Get Started <ArrowRight size={16} /></Link>
              </>
            )}
          </div>
          <button className="ds-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="ds-hero" id="hero">
        <div className="ds-hero-glow ds-hero-glow-1" />
        <div className="ds-hero-glow ds-hero-glow-2" />
        <div className="ds-hero-content">
          <span className="ds-badge">🚀 Sri Lanka's #1 Auto Service Platform</span>
          <h1 className="ds-hero-title">
            Your Car Deserves - Test 01<br />
            <span className="ds-hero-gradient">Expert Care</span>,<br />
            Seamlessly Delivered.
          </h1>
          <p className="ds-hero-sub">
            Book services, track real-time repairs, manage your entire vehicle history—all from one intelligent platform built for modern drivers.
          </p>
          <div className="ds-hero-actions">
            {user ? (
              <Link to="/dashboard" className="ds-btn-primary ds-btn-lg">
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="ds-btn-primary ds-btn-lg">
                  Book a Service <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="ds-btn-outline-lg">
                  Customer Login
                </Link>
              </>
            )}
          </div>
          <div className="ds-hero-trust">
            <StarRow />
            <span className="ds-hero-trust-text">Trusted by <strong>12,400+</strong> vehicle owners across Sri Lanka</span>
          </div>
        </div>
        <div className="ds-hero-visual">
          <div className="ds-hero-card ds-card-float">
            <div className="ds-hcard-header">
              <div className="ds-hcard-dot green" /><span>Live Job Tracking</span>
            </div>
            <div className="ds-hcard-row"><Wrench size={14} /> Full Service — <strong>In Progress</strong></div>
            <div className="ds-progress-bar"><div className="ds-progress-fill" style={{width:'65%'}} /></div>
            <div className="ds-hcard-sub">Est. completion: 2:30 PM</div>
          </div>
          <div className="ds-hero-card ds-card-float ds-card-delay">
            <div className="ds-hcard-header"><CheckCircle size={14} color="#10b981" /> Payment Confirmed</div>
            <div className="ds-hcard-amount">LKR 8,500</div>
            <div className="ds-hcard-sub">Oil Change + Alignment · Ref #DS-00214</div>
          </div>
          <div className="ds-hero-card ds-card-float ds-card-delay2">
            <div className="ds-hcard-header"><Bell size={14} color="#f59e0b" /> Service Reminder</div>
            <div className="ds-hcard-sub" style={{marginTop:4}}>Your next service is due in <strong>14 days</strong></div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="ds-stats-band">
        {STATS.map(s => (
          <div key={s.label} className="ds-stat-item">
            <span className="ds-stat-value">{s.value}</span>
            <span className="ds-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── SERVICES ── */}
      <section className="ds-section" id="services">
        <div className="ds-section-inner">
          <div className="ds-section-label reveal">What We Offer</div>
          <h2 className="ds-section-title reveal">World-Class Services,<br /><span className="ds-hero-gradient">Right at Your Fingertips</span></h2>
          <p className="ds-section-sub reveal">From express oil changes to full diagnostics—all managed through your DriveStream account.</p>
          <div className="ds-services-grid">
            {SERVICES.map(({ icon: Icon, title, desc, color }) => (
              <div className="ds-service-card reveal" key={title}>
                <div className="ds-service-icon" style={{ background: `${color}18`, color }}>
                  <Icon size={26} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
                <span className="ds-service-link" style={{ color }}>Learn more <ChevronRight size={14} /></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="ds-section ds-section-dark" id="how-it-works">
        <div className="ds-section-inner">
          <div className="ds-section-label reveal" style={{color:'#7dd3fc'}}>Simple Process</div>
          <h2 className="ds-section-title reveal" style={{color:'#f1f5f9'}}>Up & Running in<br /><span className="ds-hero-gradient">4 Easy Steps</span></h2>
          <div className="ds-steps-grid">
            {STEPS.map(({ step, title, desc }) => (
              <div className="ds-step reveal" key={step}>
                <div className="ds-step-num">{step}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
          <div className="ds-steps-cta reveal">
            <Link to="/register" className="ds-btn-primary ds-btn-lg">
              Create Free Account <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── ABOUT / WHY US ── */}
      <section className="ds-section" id="about">
        <div className="ds-section-inner ds-about-grid">
          <div className="ds-about-text">
            <div className="ds-section-label reveal">About DriveStream</div>
            <h2 className="ds-section-title reveal">Built by Mechanics,<br /><span className="ds-hero-gradient">Designed for You</span></h2>
            <p className="ds-about-desc reveal">
              Founded in 2016 at <strong>45 Galle Road, Colombo 03, Sri Lanka</strong>, DriveStream began as a single bay workshop and grew into a full-stack automotive management platform trusted by thousands of drivers island-wide.
            </p>
            {[
              'Real-time repair tracking with live tech updates',
              'OBD-II diagnostic integration for all modern vehicles',
              'Secure PayHere online payment processing',
              'Multi-role portal for customers, technicians & admins',
            ].map(f => (
              <div className="ds-feature-row reveal" key={f}>
                <CheckCircle size={18} color="#10b981" />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div className="ds-about-cards">
            <div className="ds-about-card reveal">
              <Award size={28} color="#006aff" />
              <h4>ISO 9001 Certified</h4>
              <p>Quality management systems audited annually.</p>
            </div>
            <div className="ds-about-card reveal">
              <Users size={28} color="#8b5cf6" />
              <h4>35+ Expert Technicians</h4>
              <p>Factory-trained across all major vehicle brands.</p>
            </div>
            <div className="ds-about-card reveal">
              <Calendar size={28} color="#f59e0b" />
              <h4>Online Booking 24/7</h4>
              <p>Schedule anytime—our platform never closes.</p>
            </div>
            <div className="ds-about-card reveal">
              <ShieldCheck size={28} color="#10b981" />
              <h4>2-Year Workmanship Warranty</h4>
              <p>All labour and parts covered, no questions asked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="ds-section ds-section-teal">
        <div className="ds-section-inner">
          <div className="ds-section-label reveal" style={{color:'#7dd3fc'}}>Customer Stories</div>
          <h2 className="ds-section-title reveal" style={{color:'#f1f5f9'}}>Don't Just Take <span className="ds-hero-gradient">Our Word For It</span></h2>
          <div className="ds-testimonials-grid">
            {TESTIMONIALS.map(({ name, role, rating, text }) => (
              <div className="ds-testimonial reveal" key={name}>
                <StarRow count={rating} />
                <p className="ds-testimonial-text">"{text}"</p>
                <div className="ds-testimonial-author">
                  <div className="ds-author-avatar">{name[0]}</div>
                  <div>
                    <strong>{name}</strong>
                    <span>{role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="ds-section" id="faq">
        <div className="ds-section-inner ds-faq-inner">
          <div>
            <div className="ds-section-label reveal">FAQ</div>
            <h2 className="ds-section-title reveal">Got Questions?<br /><span className="ds-hero-gradient">We've Got Answers</span></h2>
            <p className="ds-section-sub reveal" style={{textAlign:'left'}}>Can't find what you're looking for? <Link to="/login" className="ds-text-link">Chat with our team</Link>.</p>
          </div>
          <div className="ds-faq-list">
            {FAQ.map(item => <FaqItem key={item.q} {...item} />)}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="ds-cta-banner">
        <div className="ds-cta-glow" />
        <h2 className="reveal">Ready to Drive Smarter?</h2>
        <p className="reveal">Join 12,400+ Sri Lankan drivers who trust DriveStream for every kilometre.</p>
        <div className="ds-cta-actions reveal">
          <Link to="/register" className="ds-btn-primary ds-btn-lg">Create Free Account</Link>
          <Link to="/login"    className="ds-btn-outline-white">I Already Have an Account</Link>
        </div>
      </section>

      {/* ── CONTACT / FOOTER ── */}
      <footer className="ds-footer" id="contact">
        <div className="ds-footer-inner">
          <div className="ds-footer-brand">
            <div className="ds-logo" style={{fontSize:'1.4rem',marginBottom:'0.75rem'}}>
              <Car size={22} /> DriveStream
            </div>
            <p>Next-generation automotive service management for Sri Lankan drivers.</p>
            <div className="ds-social">
              {[Globe, MessageCircle, Camera, Briefcase].map((Icon, i) => (
                <a key={i} href="#" className="ds-social-icon"><Icon size={16} /></a>
              ))}
            </div>
          </div>
          <div className="ds-footer-col">
            <h4>Quick Links</h4>
            <Link to="/register">Register</Link>
            <Link to="/login">Customer Login</Link>
            <Link to="/staff-login">Staff Portal</Link>
            <a href="#services">Services</a>
          </div>
          <div className="ds-footer-col">
            <h4>Services</h4>
            <a href="#services">Full Vehicle Service</a>
            <a href="#services">Oil Change</a>
            <a href="#services">Safety Inspection</a>
            <a href="#services">Tyres & Alignment</a>
          </div>
          <div className="ds-footer-col">
            <h4>Contact Us</h4>
            <a href="tel:+94112345678" className="ds-contact-row"><Phone size={14} /> +94 11 234 5678</a>
            <a href="mailto:support@drivestream.lk" className="ds-contact-row"><Mail size={14} /> support@drivestream.lk</a>
            <div className="ds-contact-row"><MapPin size={14} /> 45 Galle Road, Colombo 03</div>
            <div className="ds-contact-row" style={{marginTop:4,opacity:.7,fontSize:'.8rem'}}>Mon–Sat: 7:30 AM – 6:00 PM</div>
          </div>
        </div>
        <div className="ds-footer-bottom">
          <span>© 2025 DriveStream Technologies (Pvt) Ltd. All rights reserved.</span>
          <span>Registered in Sri Lanka · BRN 20250045</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
