import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import LandingNavbar from '@/components/lightswind-pro/tubelight-navbar';
import HeroSandbox from '../components/landing/HeroSandbox';
import ScholarlyStats from '../components/landing/ScholarlyStats';
import MushafScrollytelling from '../components/landing/MushafScrollytelling';
import BentoFeatures from '../components/landing/BentoFeatures';
import TimelineWorkflow from '../components/landing/TimelineWorkflow';
import FaqSection from '../components/landing/FaqSection';
import ClosingCtaBanner from '../components/landing/ClosingCtaBanner';
import EditorialFooter from '../components/landing/EditorialFooter';
import ElegantCta from '../components/reactbits/ElegantCta';
import HeroBackground from '../components/reactbits/HeroBackground';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  // ── Lenis Smooth Inertial Scroll with GSAP ScrollTrigger Integration ──────
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    // Synchronize Lenis scroll ticks with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    const id = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
    };
  }, []);

  // ── GSAP Parallax & Kinetic Editorial Typography Animations ───────────────
  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      // 0. Hero kinetic word reveal (Masked Split Entrance)
      const heroWords = pageRef.current?.querySelectorAll('.hero-split-word');
      if (heroWords && heroWords.length > 0) {
        gsap.fromTo(
          heroWords,
          { yPercent: 125, rotateZ: 2, opacity: 0 },
          {
            yPercent: 0,
            rotateZ: 0,
            opacity: 1,
            duration: 1.1,
            ease: 'power4.out',
            stagger: 0.07,
            delay: 0.1,
          }
        );
      }

      gsap.fromTo(
        '.hero-kinetic-kicker',
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.05 }
      );

      gsap.fromTo(
        '.hero-kinetic-subtitle',
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.45 }
      );

      gsap.fromTo(
        '.hero-kinetic-cta',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.65 }
      );

      // 1. Hero floating Arabic watermark parallax drift
      gsap.to('.hero-watermark-parallax', {
        yPercent: -45,
        ease: 'none',
        scrollTrigger: {
          trigger: '#simulasi',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // 2. Hero sandbox subtle vertical lag
      gsap.to('.hero-sandbox-lag', {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: '#simulasi',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

      // 3. Kinetic Typographic Parallax Marquee (Opposing dual-track drift)
      gsap.to('.marquee-track-left', {
        xPercent: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: '.kinetic-marquee-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      gsap.to('.marquee-track-right', {
        xPercent: 16,
        ease: 'none',
        scrollTrigger: {
          trigger: '.kinetic-marquee-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // 4. Manifesto Quote Word-by-Word Scroll Scrub
      const quoteWords = pageRef.current?.querySelectorAll('.manifesto-word');
      if (quoteWords && quoteWords.length > 0) {
        gsap.fromTo(
          quoteWords,
          { color: 'rgba(255, 255, 255, 0.2)' },
          {
            color: 'rgba(255, 255, 255, 0.98)',
            stagger: 0.08,
            ease: 'none',
            scrollTrigger: {
              trigger: '.manifesto-quote-wrap',
              start: 'top 80%',
              end: 'bottom 50%',
              scrub: 0.8,
            },
          }
        );
      }

      // 5. Section Watermarks Parallax Drift
      const watermarks = pageRef.current?.querySelectorAll('.section-watermark-drift');
      watermarks?.forEach((wm) => {
        gsap.to(wm, {
          yPercent: -30,
          ease: 'none',
          scrollTrigger: {
            trigger: wm.parentElement || wm,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.4,
          },
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Navigation items linking to in-page landing sections & developer page
  const navItems = [
    { name: 'Simulasi AI', url: '#simulasi' },
    { name: 'Pilar Fitur', url: '#fitur' },
    { name: 'Arsitektur', url: '#arsitektur' },
    { name: 'Alur', url: '#alur' },
    { name: 'FAQ', url: '#faq' },
    { name: 'Pengembang', url: '/developers' },
  ];

  const rightActions = (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Link
        to="/download"
        className="text-[13px] font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg transition-colors"
      >
        Unduh
      </Link>
      <Link
        to="/login"
        className="text-[13px] font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg transition-colors"
      >
        Masuk
      </Link>
      <Link
        to="/register"
        className="text-[13px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-xl transition-all shadow-xs"
      >
        Daftar Santri
      </Link>
    </div>
  );

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 scroll-smooth pt-16"
    >
      {/* Editorial Navbar Header for Landing Page */}
      <LandingNavbar items={navItems} rightActions={rightActions} />

      {/* Hero Section & Live Simulation Sandbox with Parallax Depth */}
      <section id="simulasi" className="relative scroll-mt-24 overflow-hidden">
        <HeroBackground className="pt-14 sm:pt-20 lg:pt-24 pb-20 sm:pb-28 relative">
          {/* Subtle Floating Arabic Calligraphy Watermark (Drifts on scroll) */}
          <div
            aria-hidden="true"
            className="hero-watermark-parallax absolute -right-8 sm:right-8 top-10 font-quran text-8xl sm:text-[140px] text-emerald-950/[0.035] pointer-events-none select-none whitespace-nowrap z-0"
          >
            اقْرَأْ وَارْتَقِ وَرَتِّلْ
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Clean, Balanced, Restrained Scholarly Content with Kinetic Typography */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-7 text-left">
                {/* Restrained Category Kicker with subtle live dot */}
                <div className="hero-kinetic-kicker flex items-center space-x-2.5 text-xs font-bold tracking-widest text-emerald-800 uppercase font-sans">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                  <span>AI Voice &amp; Spaced Repetition • Tim FIFA</span>
                </div>

                {/* Symmetrical High-Impact Kinetic Headline (Words reveal with kinetic mask wipe) */}
                <h1 className="hero-kinetic-title text-4xl sm:text-5xl lg:text-[56px] font-black text-slate-900 tracking-tight leading-[1.12]">
                  <span className="block overflow-hidden py-0.5">
                    <span className="hero-split-word inline-block mr-3">Hafalan</span>
                    <span className="hero-split-word inline-block mr-3">Lebih</span>
                    <span className="hero-split-word inline-block">Kuat.</span>
                  </span>
                  <span className="block overflow-hidden py-0.5 mt-2">
                    <span className="hero-split-word inline-block text-emerald-800 mr-3">Presisi</span>
                    <span className="hero-split-word inline-block text-emerald-800 mr-3">Kata</span>
                    <span className="hero-split-word inline-block text-emerald-800 mr-3">demi</span>
                    <span className="hero-split-word inline-block text-emerald-800">Kata.</span>
                  </span>
                </h1>

                {/* Clear, Spacious Subtitle */}
                <p className="hero-kinetic-subtitle text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
                  Asisten AI cerdas yang menyimak tilawah secara real-time, mendeteksi keliru huruf dan harakat, serta menjadwalkan murojaah adaptif berbasis kurva lupa ilmiah.
                </p>

                {/* Action Buttons: React Bits Ultra-Elegant CTA (Strictly Zero Icons) */}
                <div className="hero-kinetic-cta pt-1 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <ElegantCta
                    to="/app"
                    variant="emerald"
                    size="md"
                  >
                    Mulai Murojaah Mandiri
                  </ElegantCta>

                  <ElegantCta
                    to="/app/tajwid"
                    variant="secondary"
                    size="md"
                  >
                    Tajwid Academy
                  </ElegantCta>
                </div>

                {/* Minimalist Trust Indicators Row with Subtle Divider */}
                <div className="pt-4 border-t border-slate-200/70 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 font-medium">
                  <span className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Standar Kemenag RI</span>
                  </span>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Tarteel QUL Mutasyabihat</span>
                  </span>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Privasi Suara Memory-Only</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Perfectly Balanced Interactive Recitation Sandbox with Parallax Depth */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="hero-sandbox-lag lg:col-span-5 flex justify-center lg:justify-end relative w-full"
              >
                {/* Soft Symmetrical Ambient Glow behind sandbox */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-2 bg-gradient-to-r from-emerald-500/12 via-teal-500/10 to-emerald-500/12 rounded-[32px] blur-2xl pointer-events-none"
                />
                <div className="relative w-full flex justify-center lg:justify-end">
                  <HeroSandbox />
                </div>
              </motion.div>
            </div>
          </div>
        </HeroBackground>
      </section>

      {/* ── Kinetic Typographic Parallax Marquee Ribbon (Unique Scroll Experience) ── */}
      <section className="kinetic-marquee-section py-8 sm:py-12 bg-slate-900 text-white overflow-hidden select-none border-y border-slate-800">
        <div className="space-y-2.5 sm:space-y-3.5">
          {/* Track 1: Latin Uppercase Typography — Moves Left on Scroll */}
          <div className="marquee-track-left flex whitespace-nowrap gap-6 text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-100/15">
            <span>TARTIL AL-QUR'AN</span>
            <span className="text-emerald-500/40">/</span>
            <span>SPEECH RECOGNITION</span>
            <span className="text-emerald-500/40">/</span>
            <span>FSRS RETENTION</span>
            <span className="text-emerald-500/40">/</span>
            <span>RASM UTSMANI</span>
            <span className="text-emerald-500/40">/</span>
            <span>ZERO LATENCY</span>
            <span className="text-emerald-500/40">/</span>
            <span>TARTIL AL-QUR'AN</span>
            <span className="text-emerald-500/40">/</span>
            <span>SPEECH RECOGNITION</span>
            <span className="text-emerald-500/40">/</span>
            <span>FSRS RETENTION</span>
          </div>

          {/* Track 2: Arabic Calligraphy Ribbon — Moves Right on Scroll */}
          <div className="marquee-track-right flex whitespace-nowrap gap-8 font-quran text-2xl sm:text-3xl lg:text-4xl text-emerald-400/25 -translate-x-16">
            <span>وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا</span>
            <span className="text-white/20">۞</span>
            <span>حِفْظُ اللِّسَانِ</span>
            <span className="text-white/20">۞</span>
            <span>سَنَدُ الرِّوَايَةِ</span>
            <span className="text-white/20">۞</span>
            <span>إِتْقَانُ التِّلَاوَةِ</span>
            <span className="text-white/20">۞</span>
            <span>تَثْبِيتُ الصُّدُورِ</span>
            <span className="text-white/20">۞</span>
            <span>وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا</span>
            <span className="text-white/20">۞</span>
            <span>حِفْظُ اللِّسَانِ</span>
          </div>
        </div>
      </section>

      {/* Scholarly Scientific Metrics Section */}
      <ScholarlyStats />

      {/* Asymmetrical Bento Features Section (Live Audio Waveform, Mutasyabihat, Streak, Tajwid Quiz) */}
      <div id="fitur" className="scroll-mt-24 relative">
        <BentoFeatures />
      </div>

      {/* ── Editorial Scholarly Manifesto Section with Word-by-Word Scroll Scrub ── */}
      <section className="py-24 sm:py-32 bg-[#090D12] text-white relative overflow-hidden select-none border-y border-slate-800">
        {/* Giant Arabic Watermark drifting on parallax */}
        <div
          aria-hidden="true"
          className="section-watermark-drift absolute -right-20 top-1/2 -translate-y-1/2 font-quran text-[120px] sm:text-[200px] text-white/[0.02] pointer-events-none whitespace-nowrap select-none"
        >
          إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ
        </div>

        <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10 space-y-8">
          <div className="flex items-center space-x-3 text-xs font-mono font-bold uppercase tracking-[0.25em] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Manifesto Ilmiah &amp; Adab Talaqqi</span>
          </div>

          <div className="manifesto-quote-wrap">
            <h2 className="text-2xl sm:text-4xl lg:text-[44px] font-black tracking-tight leading-[1.3] text-slate-600">
              {[
                '"Al-Qur\'an',
                'diturunkan',
                'dengan',
                'tartil,',
                'dihafal',
                'dengan',
                'dawam,',
                'dan',
                'dijaga',
                'dengan',
                'sanad',
                'yang',
                'bersambung."',
              ].map((word, wIdx) => (
                <span key={wIdx} className="manifesto-word inline-block mr-2.5 transition-colors">
                  {word}
                </span>
              ))}
            </h2>
          </div>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed font-normal">
            Kecerdasan buatan kami hadirkan bukan untuk menggantikan Ustadz dan Musyrif, melainkan menjadi cermin mandiri yang menyimak lisan santri di sepertiga malam terakhir — menjaga hafalan tetap hidup dan presisi tanpa sebutir pun data suara yang direkam ke server luar.
          </p>

          <div className="pt-6 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-mono text-slate-500 border-t border-slate-800/80">
            <span className="text-slate-400">Standar Sanad Hafsh 'an 'Ashim</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">Evaluasi Suara Memory-Only</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">FSRS v4.5 Adaptive Decay</span>
          </div>
        </div>
      </section>

      {/* Scroll Timeline Section ("Terus Gulir, Selami Arsitektur Evaluasi Hifzhly") */}
      <div id="arsitektur" className="scroll-mt-24 relative overflow-hidden">
        {/* Subtle Background Watermark */}
        <div
          aria-hidden="true"
          className="section-watermark-drift absolute -right-24 top-24 font-quran text-[140px] text-slate-900/[0.02] pointer-events-none whitespace-nowrap select-none"
        >
          وَاتْلُ مَا أُوحِيَ إِلَيْكَ
        </div>
        <MushafScrollytelling />
      </div>

      {/* Step-by-Step Interactive Workflow Timeline */}
      <div id="alur" className="scroll-mt-24">
        <TimelineWorkflow />
      </div>

      {/* Interactive FAQ Section */}
      <div id="faq" className="scroll-mt-24">
        <FaqSection />
      </div>

      {/* Closing Call to Action Banner (Moneta-style split layout with physical cards & zero icons) */}
      <ClosingCtaBanner />

      {/* Masterpiece Editorial Islamic Footer */}
      <EditorialFooter />
    </div>
  );
}
