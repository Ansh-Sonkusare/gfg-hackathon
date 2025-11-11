'use client';

import { useEffect } from 'react';
import './page.css';

export default function Home() {
  useEffect(() => {
    // Initialize Lenis smooth scroll
    const initLenis = async () => {
      const Lenis = (await import('lenis')).default;
      const lenis = new Lenis();

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    };

    initLenis();

    // Preloader animation
    const initPreloader = () => {
      const preloader = document.getElementById('preloader');
      setTimeout(() => {
        preloader?.classList.add('hidden');
        setTimeout(() => {
          preloader?.remove();
          initPageAnimations();
        }, 1000);
      }, 3500);
    };

    // Navigation effects
    const initNavigation = () => {
      const navbar = document.getElementById('navbar');
      const navLinks = document.querySelectorAll('.nav-link');
      const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
      const navMenu = document.querySelector('.nav-menu');

      window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
          navbar?.classList.add('scrolled');
        } else {
          navbar?.classList.remove('scrolled');
        }
      });

      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href');
          // Use Lenis for smooth scrolling
          const lenis = new (window as any).Lenis();
          lenis.scrollTo(targetId, { offset: -80 });

          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          if (navMenu?.classList.contains('open')) (mobileMenuBtn as HTMLElement)?.click();
        });
      });

      (mobileMenuBtn as HTMLElement)?.addEventListener('click', () => {
        navMenu?.classList.toggle('open');
      });
    };

    // 3D Tilt effects
    const init3DTiltEffects = () => {
      document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e as MouseEvent).clientX - rect.left;
          const y = (e as MouseEvent).clientY - rect.top;
          const rotateX = (y - rect.height / 2) / (rect.height / 2) * -10;
          const rotateY = (x - rect.width / 2) / (rect.width / 2) * 10;
          (card as HTMLElement).style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        card.addEventListener('mouseleave', () => {
          (card as HTMLElement).style.transform = 'rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
      });
    };

    // Scroll reveal animations
    const initScrollReveal = () => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.fade-in-up, .hub-container').forEach(el => {
        observer.observe(el);
      });
    };

    // Testimonial carousel
    const initTestimonialCarousel = () => {
      const track = document.querySelector('.testimonial-track');
      if (!track) return;

      const cards = Array.from(track.children);
      cards.forEach(card => track.appendChild(card.cloneNode(true)));

      let currentIndex = 0;
      setInterval(() => {
        currentIndex++;
        (track as HTMLElement).style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        (track as HTMLElement).style.transform = `translateX(-${(100 / (cards.length * 2)) * currentIndex}%)`;

        if (currentIndex >= cards.length) {
          setTimeout(() => {
            (track as HTMLElement).style.transition = 'none';
            currentIndex = 0;
            (track as HTMLElement).style.transform = `translateX(0%)`;
          }, 500);
        }
      }, 5000);
    };

    const initPageAnimations = () => {
      initNavigation();
      init3DTiltEffects();
      initScrollReveal();
      initTestimonialCarousel();
      console.log('🚀 EduLend: All systems initialized');
    };

    // Initialize all functions
    initPreloader();
  }, []);

  return (
    <>
      {/* Preloader */}
      <div id="preloader" className="preloader">
        <div className="preloader-content">
          <svg className="logo-svg" width="400" height="80" viewBox="0 0 400 80" xmlns="http://www.w3.org/2000/svg">
            <text x="200" y="45" textAnchor="middle" className="logo-text">EduLend</text>
          </svg>
        </div>
      </div>



      {/* Navigation */}
      <nav id="navbar" className="navbar">
        <div className="nav-container">
          <div className="nav-logo">EduLend</div>
          <div className="nav-menu">
            <a href="#peer-hub" className="nav-link">Peer-to-Peer Hub</a>
            <a href="#safety-hub" className="nav-link">EduCIBIL Credit Engine</a>
            <a href="#sports-hub" className="nav-link">Finance Playground</a>
          </div>
          <button className="nav-cta">LOGIN / SIGN UP</button>
          <button className="mobile-menu-btn">☰</button>
        </div>
      </nav>

      {/* Video Background Section */}
      <section className="video-container relative flex flex-col items-center justify-center text-center p-8 sm:p-12 md:p-24">
        <video autoPlay loop muted playsInline>
          <source src="Symbiosis Lavale Pune campus.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="z-10 text-white max-w-2xl flex flex-col items-center">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-wide mb-2 text-white font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              EduLend
            </h1>
          </div>
          <div className=" bg-opacity-90 p-4 rounded-xl  mt-8 mb-8">
            <p className="text-md sm:text-base font-light text-white">
              Empowering students with instant, trusted peer-to-peer lending
              through <br /> EduCIBIL credit under a trusted financial ecosystem
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header fade-in-up">
            <h2 className="section-title">CAMPUS SOLUTIONS</h2>
            <p className="section-subtitle">Comprehensive digital ecosystem for modern campus life</p>
          </div>

          <div className="hub-container" id="peer-hub">
            <div className="hub-left">
              <h3 className="hub-name">Peer to Peer Hub</h3>
            </div>
            <div className="hub-right">
              <div className="feature-card" data-tilt>
                <div className="feature-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9,22 9,12 15,12 15,22" />
                  </svg>
                </div>
                <div className="feature-content">
                  <h4 className="feature-name">QuickFund</h4>
                  <p className="feature-description">Quick cash for urgent student needs</p>
                  <a href="/borrower" className="feature-link">Learn More →</a>
                </div>
                <div className="holographic-glare"></div>
              </div>
              <div className="feature-card" data-tilt>
                <div className="feature-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="21 21l-4.35-4.35" />
                  </svg>
                </div>
                <div className="feature-content">
                  <h4 className="feature-name">PeerInvest</h4>
                  <p className="feature-description">Empower fellow students, earn trust badges</p>
                  <a href="/lender" className="feature-link">Learn More →</a>
                </div>
                <div className="holographic-glare"></div>
              </div>
            </div>
          </div>

          <div className="hub-container" id="safety-hub">
            <div className="hub-left">
              <h3 className="hub-name">EduCIBIL Credit Engine</h3>
            </div>
            <div className="hub-right">
              <div className="feature-card" data-tilt>
                <div className="feature-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="feature-content">
                  <h4 className="feature-name">wallet</h4>
                  <p className="feature-description">Your secure space to manage and track your finances.</p>
                  <a href="#" className="feature-link">Learn More →</a>
                </div>
                <div className="holographic-glare"></div>
              </div>
              <div className="feature-card" data-tilt>
                <div className="feature-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <path d="9 9h6m-6 4h4" />
                  </svg>
                </div>
                <div className="feature-content">
                  <h4 className="feature-name">My Profile</h4>
                  <p className="feature-description">Your reputation passport — built through actions, not words</p>
                  <a href="#" className="feature-link">Learn More →</a>
                </div>
                <div className="holographic-glare"></div>
              </div>
            </div>
          </div>

          <div className="hub-container" id="sports-hub">
            <div className="hub-left">
              <h3 className="hub-name">Finance Playground</h3>
            </div>
            <div className="hub-right">
              <div className="feature-card" data-tilt>
                <div className="feature-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                    <path d="18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="4 22h16" />
                    <path d="10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                    <path d="14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                    <path d="18 2H6v7a6 6 0 0 0 12 0V2Z" />
                  </svg>
                </div>
                <div className="feature-content">
                  <h4 className="feature-name">Gamified Financial Journey</h4>
                  <p className="feature-description">Your financial journey, made fun and engaging</p>
                  <a href="#" className="feature-link">Learn More →</a>
                </div>
                <div className="holographic-glare"></div>
              </div>
              <div className="feature-card" data-tilt>
                <div className="feature-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <path d="9 16h6" />
                  </svg>
                </div>
                <div className="feature-content">
                  <h4 className="feature-name">Incentives & Badges</h4>
                  <p className="feature-description">Rewards for responsible financial behavior</p>
                  <a href="#" className="feature-link">Learn More →</a>
                </div>
                <div className="holographic-glare"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="testimonials-header fade-in-up">
            <h2 className="testimonials-title">TRUSTED BY THE COMMUNITY</h2>
          </div>
          <div className="testimonials-carousel fade-in-up">
            <div className="testimonial-track">
              <div className="testimonial-card">
                <p className="testimonial-quote">"PradyyKaCampus transformed how I connect with fellow students. The marketplace feature is incredible!"</p>
                <div className="testimonial-author">
                  <div className="author-name">Arjun Sharma</div>
                  <div className="author-role">Computer Science Student</div>
                </div>
              </div>
              <div className="testimonial-card">
                <p className="testimonial-quote">"Finally, a platform that understands campus life. The emergency SOS feature gives me peace of mind."</p>
                <div className="testimonial-author">
                  <div className="author-name">Priya Patel</div>
                  <div className="author-role">Engineering Student</div>
                </div>
              </div>
              <div className="testimonial-card">
                <p className="testimonial-quote">"Booking sports facilities has never been easier. This platform is a game-changer for campus life."</p>
                <div className="testimonial-author">
                  <div className="author-name">Rahul Gupta</div>
                  <div className="author-role">Management Student</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-separator"></div>
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <div className="footer-logo">PradyyKaCampus</div>
              <p className="footer-mission">Revolutionizing campus life through innovative digital solutions</p>
              <div className="social-icons">
                <a href="#" className="social-link" target="_blank">Twitter</a>
                <a href="#" className="social-link" target="_blank">Instagram</a>
                <a href="#" className="social-link" target="_blank">LinkedIn</a>
              </div>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">Peer-to-Peer Hub</h4>
              <div className="footer-links">
                <a href="#" className="footer-link ">Student Marketplace</a>
                <a href="#" className="footer-link ">Lost & Found</a>
              </div>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">Support & Safety Hub</h4>
              <div className="footer-links">
                <a href="#" className="footer-link ">Emergency SOS</a>
                <a href="#" className="footer-link ">Anonymous Feedback</a>
              </div>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">Sports Hub</h4>
              <div className="footer-links">
                <a href="#" className="footer-link ">Sports Activities</a>
                <a href="#" className="footer-link ">Slot Booking</a>
              </div>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">Resources</h4>
              <div className="footer-links">
                <a href="#" className="footer-link ">About Us</a>
                <a href="#" className="footer-link ">Contact</a>
                <a href="#" className="footer-link ">FAQ</a>
                <a href="#" className="footer-link ">Privacy Policy</a>
                <a href="#" className="footer-link ">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copyright">© PradyyKaCampus. All Rights Reserved.</div>
          </div>
        </div>
      </footer>
    </>
  );
}
