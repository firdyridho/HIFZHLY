import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import {
  ArrowLeft,
  BookOpen,
  Code2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Award,
  Terminal,
  Mail,
  Zap,
  HeartHandshake,
  Compass,
} from 'lucide-react';
import EditorialFooter from '../components/landing/EditorialFooter';

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v7.6h2.8v-7.6h-2.8M7.86 6.5a1.63 1.63 0 0 0-1.63 1.62c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63A1.63 1.63 0 0 0 7.86 6.5z" />
    </svg>
  );
}

interface DeveloperProfile {
  id: string;
  name: string;
  role: string;
  subtitle: string;
  bio: string;
  quote: string;
  imageSrc: string;
  monogram: string;
  location: string;
  tags: string[];
  contributions: {
    title: string;
    description: string;
  }[];
  social: {
    github?: string;
    linkedin?: string;
    email?: string;
  };
}

const DEVELOPERS: DeveloperProfile[] = [
  {
    id: 'firdy',
    name: 'Firdy Ridho Fillah',
    role: 'Co-Founder & Lead Fullstack AI Architect',
    subtitle: 'Real-time Audio Processing, ASR Phoneme Alignment & Systems Engineering',
    bio: 'Insinyur perangkat lunak yang berfokus pada arsitektur kecerdasan buatan, pemrosesan sinyal audio digital, dan rekayasa sistem skala penuh. Merancang pipeline evaluasi suara tilawah kata-demi-kata, integrasi ONNX Runtime Web, dan algoritma retensi memori FSRS adaptif pada Hifzhly.',
    quote:
      'Setiap milidetik latensi suara dan setiap fonem tajwid yang dievaluasi adalah ikhtiar saintifik untuk menjaga keaslian bacaan Al-Qur\'an tanpa kompromi privasi pengguna.',
    imageSrc: '/images/developers/firdy.webp',
    monogram: 'FRF',
    location: 'Indonesia',
    tags: [
      'Speech Recognition (ASR)',
      'Web Audio API & DSP',
      'ONNX Runtime Web',
      'React 19 & TypeScript',
      'FSRS Spaced Repetition',
      'Linux VPS & Docker',
      'Capacitor Native Bridge',
    ],
    contributions: [
      {
        title: 'Voice Evaluation & Phoneme Engine',
        description:
          'Membangun engine pendeteksi keliru huruf dan harakat secara streaming dengan latensi ultra-rendah dan isolasi memori lokal.',
      },
      {
        title: 'FSRS Mathematical Retention Graph',
        description:
          'Merumuskan algoritma spaced repetition adaptif untuk menjadwalkan repetisi ayat sebelum hafalan santri memudar.',
      },
      {
        title: 'End-to-End Multiplatform Architecture',
        description:
          'Mengorkestrasi sistem web, desktop, dan mobile Android dengan arsitektur sinkronisasi offline-first yang andal.',
      },
    ],
    social: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      email: 'mailto:firdyridho@gmail.com',
    },
  },
  {
    id: 'faeyza',
    name: 'Faeyza Ardellein Yaradhitya',
    role: 'Co-Founder & Lead Product Designer',
    subtitle: 'Islamic UX Architecture, Sanad & Mushaf Standardization',
    bio: 'Desainer produk dan perancang interaksi yang mendedikasikan keahliannya pada antarmuka Islami yang khusyu\'. Memimpin standardisasi rasm Usmani Kemenag RI, rancangan sistem tipografi mushaf beresolusi tinggi, serta pengalaman pengguna yang tenang dan bermakna bagi santri dan musyrif.',
    quote:
      'Antarmuka terbaik untuk Al-Qur\'an adalah antarmuka yang hening—tidak mendikte dan tidak mengaburkan fokus pembacanya, melainkan menghadirkan kekhusyukan dan kemudahan dalam setiap tilawah.',
    imageSrc: '/images/developers/faeyza.webp',
    monogram: 'FAY',
    location: 'Indonesia',
    tags: [
      'Islamic UI/UX Architecture',
      'Mushaf Rasm Standardization',
      'Quranic Typography',
      'Design Systems & Tokens',
      'Human-Centered Research',
      'Accessibility (a11y)',
      'Educational Pedagogics',
    ],
    contributions: [
      {
        title: 'Khusyu\' Sacred Interface Design',
        description:
          'Merancang antarmuka tanpa distraksi dengan panduan tipografi Arab standar mushaf dan kontras warna yang menyejukkan mata.',
      },
      {
        title: 'LPMQ & Sanad Verification Pipeline',
        description:
          'Menyelaraskan struktur surah, ayat, waqaf, dan tanda baca sesuai pedoman resmi Lajnah Pentashihan Mushaf Al-Qur\'an Kemenag RI.',
      },
      {
        title: 'Visual Retention & Mutabaah System',
        description:
          'Mengembangkan visualisasi heatmap retensi hafalan yang memberikan kejelasan progres tanpa menimbulkan rasa cemas bagi santri.',
      },
    ],
    social: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      email: 'mailto:faeyzardellein@gmail.com',
    },
  },
];

export default function DeveloperPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroKickerRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const heroBadgesRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLDivElement>(null);

  // Fallback states for images if files are not yet uploaded by user
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({
    faeyza: false,
    firdy: false,
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // GSAP Entrance & Scroll Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero Entrance Timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (heroKickerRef.current) {
        tl.fromTo(
          heroKickerRef.current,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.6 }
        );
      }

      if (heroTitleRef.current) {
        tl.fromTo(
          heroTitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.3'
        );
      }

      if (heroSubRef.current) {
        tl.fromTo(
          heroSubRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          '-=0.4'
        );
      }

      if (heroBadgesRef.current) {
        tl.fromTo(
          heroBadgesRef.current.children,
          { opacity: 0, y: 15, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1 },
          '-=0.4'
        );
      }

      // 2. Developer Cards Stagger Reveal
      if (cardsContainerRef.current) {
        const cards = cardsContainerRef.current.querySelectorAll('.developer-card');
        gsap.fromTo(
          cards,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.25,
            ease: 'power3.out',
            delay: 0.2,
          }
        );
      }

      // 3. Ambient Floating Background Elements (Infinite smooth GSAP float)
      const floaters = document.querySelectorAll('.ambient-floater');
      if (floaters.length > 0) {
        gsap.to(floaters, {
          y: -14,
          duration: 3.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          stagger: 0.5,
        });
      }

      // 4. Numbers count-up animation for scholarly stats
      if (statsRef.current) {
        const numbers = statsRef.current.querySelectorAll('.stat-number');
        numbers.forEach((el) => {
          const target = parseFloat(el.getAttribute('data-target') || '0');
          const isDec = el.getAttribute('data-decimal') === 'true';
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
            },
            onUpdate: () => {
              el.textContent = isDec ? obj.val.toFixed(1) : Math.floor(obj.val).toLocaleString('id-ID');
            },
          });
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // 3D Tilt Card Interaction via GSAP
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: string) => {
    const card = document.getElementById(`card-${cardId}`);
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 1000,
      duration: 0.4,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = (cardId: string) => {
    const card = document.getElementById(`card-${cardId}`);
    if (!card) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: 'power2.out',
    });
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900"
    >
      {/* 1. Dedicated Minimalist Navigation Bar */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-emerald-800 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Beranda</span>
          </Link>

          <Link to="/" className="flex items-center space-x-2.5">
            <img
              src="/logo saja.png"
              alt="Hifzhly Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-extrabold text-base tracking-tight text-slate-900 hidden sm:inline">
              Hifzhly <span className="text-xs font-semibold text-emerald-700 font-sans">Engineering</span>
            </span>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              to="/app"
              className="text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              Buka Aplikasi
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Grand Scholarly Editorial Hero */}
      <section className="relative pt-16 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-50">
        {/* Subtle Decorative Background Ambient Gradients */}
        <div
          aria-hidden="true"
          className="ambient-floater absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-emerald-200/30 via-teal-100/20 to-amber-100/20 rounded-full blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="ambient-floater absolute top-40 right-10 w-72 h-72 bg-emerald-100/25 rounded-full blur-2xl pointer-events-none"
        />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          {/* Scholarly Kicker */}
          <div
            ref={heroKickerRef}
            className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-xs font-bold text-emerald-800 uppercase tracking-widest font-sans shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>Tim Rekayasa &amp; Desain Produk • Hifzhly</span>
          </div>

          {/* Grand Headline */}
          <h1
            ref={heroTitleRef}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]"
          >
            Dua Pemikir, Satu Khidmah:{' '}
            <span className="text-emerald-700 block mt-2">
              Sinergi AI &amp; Kemurnian Kalamullah.
            </span>
          </h1>

          {/* Spacious Scholarly Lead */}
          <p
            ref={heroSubRef}
            className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal"
          >
            Mengenal figur di balik rancang bangun <strong>Hifzhly</strong> — perpaduan harmonis antara riset kecerdasan buatan, pemrosesan fonem tilawah real-time, dan desain antarmuka khusyu' yang memuliakan para penghafal Al-Qur'an.
          </p>

          {/* Trust Badges Strip */}
          <div
            ref={heroBadgesRef}
            className="pt-4 flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-xs font-semibold text-slate-600"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Standar LPMQ Kemenag RI</span>
            </div>
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Zero-Lag Audio Processing</span>
            </div>
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>On-Device Memory Privacy</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Developers Showcase Grid (Faeyza & Firdy) */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div
          ref={cardsContainerRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch"
        >
          {DEVELOPERS.map((dev) => {
            const hasImageError = imageErrors[dev.id];

            return (
              <div
                key={dev.id}
                id={`card-${dev.id}`}
                onMouseMove={(e) => handleMouseMove(e, dev.id)}
                onMouseLeave={() => handleMouseLeave(dev.id)}
                className="developer-card group relative bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgb(16,185,129,0.08)] transition-all duration-300"
              >
                {/* Subtle Card Header Corner Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100/40 via-transparent to-transparent rounded-tr-3xl pointer-events-none" />

                <div className="space-y-6">
                  {/* Top Bar: Portrait & Identity Info */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    {/* Portrait Avatar Container */}
                    <div className="relative shrink-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-emerald-600/30 bg-slate-100 shadow-md relative flex items-center justify-center">
                        {!hasImageError ? (
                          <img
                            src={dev.imageSrc}
                            alt={dev.name}
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (target.src.endsWith('.webp')) {
                                target.src = target.src.replace('.webp', '.jpg');
                              } else {
                                setImageErrors((prev) => ({ ...prev, [dev.id]: true }));
                              }
                            }}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          // Bespoke Scholarly Monogram Fallback Avatar with Islamic Geometric Accent
                          <div className="w-full h-full bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 flex flex-col items-center justify-center text-white relative p-3">
                            <div className="absolute inset-1 border border-emerald-400/30 rounded-xl pointer-events-none" />
                            <span className="font-extrabold text-2xl tracking-wider text-emerald-200">
                              {dev.monogram}
                            </span>
                            <span className="text-[9px] uppercase tracking-widest text-emerald-300/80 mt-1 font-mono">
                              Hifzhly Dev
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Active Status Badge */}
                      <div className="absolute -bottom-2 -right-2 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-xs flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                        <span>Kreator</span>
                      </div>
                    </div>

                    {/* Developer Name & Designation */}
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/70">
                        <Code2 className="w-3 h-3 text-emerald-700" />
                        <span>{dev.role.split('&')[0]}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                        {dev.name}
                      </h2>
                      <p className="text-xs sm:text-sm font-semibold text-emerald-800 leading-snug">
                        {dev.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Biography */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {dev.bio}
                  </p>

                  {/* Dedicated Scholarly Quote Box */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border-l-3 border-emerald-600 text-xs sm:text-sm text-emerald-950 italic leading-relaxed">
                    "{dev.quote}"
                  </div>

                  {/* Core Contributions List */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center space-x-2">
                      <Award className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Fokus Rekayasa &amp; Kontribusi Inti</span>
                    </h3>
                    <div className="space-y-2.5">
                      {dev.contributions.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1"
                        >
                          <span className="font-bold text-slate-900 block">
                            {item.title}
                          </span>
                          <span className="text-slate-600 leading-relaxed block font-normal">
                            {item.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack & Focus Tags */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Keahlian &amp; Perkakas Utama:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dev.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200/70 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Social / Contact Bar */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">
                    Tim Pengembang Utama &bull; Hifzhly
                  </span>

                  <div className="flex items-center space-x-2">
                    {dev.social.github && (
                      <a
                        href={dev.social.github}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-600 transition-colors cursor-pointer"
                        aria-label={`GitHub ${dev.name}`}
                      >
                        <GithubIcon className="w-4 h-4" />
                      </a>
                    )}
                    {dev.social.linkedin && (
                      <a
                        href={dev.social.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-600 transition-colors cursor-pointer"
                        aria-label={`LinkedIn ${dev.name}`}
                      >
                        <LinkedinIcon className="w-4 h-4" />
                      </a>
                    )}
                    {dev.social.email && (
                      <a
                        href={dev.social.email}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-600 transition-colors cursor-pointer"
                        aria-label={`Kirim Email ke ${dev.name}`}
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Scholarly Scientific Stats Strip */}
      <section ref={statsRef} className="py-12 bg-white border-y border-slate-200/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                <span className="stat-number" data-target="30">30</span> Juz
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Peta Mushaf Madinah &amp; Kemenag
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">
                <span className="stat-number" data-target="114">114</span> Surah
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Validasi Lafadz &amp; Sanad Rasm
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                <span className="stat-number" data-target="6236">6236</span> Ayat
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Data Retensi FSRS Terindeks
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">
                0 <span className="text-lg font-bold text-slate-700">ms</span>
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Penyimpanan Suara di Server (Zero Leak)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. The Origin Story & Manifesto ("Kisah Kolaborasi Firdy & Faeyza") */}
      <section
        ref={manifestoRef}
        className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10"
      >
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-700" />
            <span>Manifesto &amp; Kisah di Balik Layar</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Menjawab Kegelisahan Penghafal: Mengapa Hifzhly Diciptakan?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-widest font-semibold">
            Ditulis Bersama oleh Firdy Ridho Fillah &amp; Faeyza Ardellein Yaradhitya
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base space-y-5 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs">
          <p>
            Menghafal Al-Qur'an adalah salah satu karunia teragung, namun menjaga hafalan tersebut (<em>murojaah</em>) adalah jihad konsistensi seumur hidup. Hampir setiap santri tahfizh menghadapi tantangan yang sama: <strong>"cepat hafal, namun mudah lupa"</strong> karena keterbatasan waktu musyrif untuk menyimak secara privat setiap hari.
          </p>

          <p>
            Berangkat dari kenyataan tersebut, <strong>Faeyza Ardellein Yaradhitya</strong> dan <strong>Firdy Ridho Fillah</strong> berkolaborasi memadukan dua disiplin ilmu yang saling melengkapi:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 not-prose">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                <Compass className="w-4 h-4 text-emerald-700" />
                <span>Adab &amp; Antarmuka Khusyu'</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Faeyza memastikan setiap elemen tampilan menjaga kesucian tilawah—tidak ada iklan yang mengganggu, tidak ada animasi yang berlebihan, dan rasm mushaf tunduk pada kaidah LPMQ Kementerian Agama RI.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-emerald-700" />
                <span>Kecerdasan Buatan &amp; Sains Memori</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Firdy merekayasa pipeline pemrosesan sinyal suara on-device dan model matematika kurva lupa FSRS, sehingga aplikasi mampu mendeteksi fonem keliru dan menyarankan jadwal murojaah secara presisi.
              </p>
            </div>
          </div>

          <p>
            Hifzhly tidak hadir untuk menggantikan posisi mulia para ustadz dan musyrif bersanad. Sebaliknya, Hifzhly adalah <em>partner latihan mandiri</em> yang setia menemani santri di kala malam, menguatkan hafalan sebelum disetorkan kepada para guru di majelis talaqqi.
          </p>

          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
            <span>Didedikasikan untuk para penghafal Al-Qur'an nusantara.</span>
            <span className="text-emerald-800 font-bold">Semoga bernilai jariyah lillahi ta'ala.</span>
          </div>
        </div>
      </section>

      {/* 6. Closing Call to Action Banner */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-8 sm:p-12 text-white text-center space-y-5 shadow-xl relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"
          />

          <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
            <span>Mulai Perjalanan Murojaah Anda</span>
          </span>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight max-w-xl mx-auto leading-tight">
            Rasakan Pengalaman Murojaah Modern yang Dibangun Penuh Khidmah.
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-md mx-auto leading-relaxed">
            Akses mushaf interaktif, uji tilawah dengan AI pendengar kata-demi-kata, dan petakan kurva retensi hafalan Anda hari ini.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/app"
              className="w-full sm:w-auto text-xs font-bold text-emerald-950 bg-white hover:bg-emerald-50 px-6 py-3 rounded-xl transition-colors shadow-md"
            >
              Buka Murojaah Mandiri
            </Link>
            <Link
              to="/download"
              className="w-full sm:w-auto text-xs font-bold text-white bg-emerald-700/60 hover:bg-emerald-700 border border-emerald-400/30 px-6 py-3 rounded-xl transition-colors"
            >
              Unduh Aplikasi Desktop / Mobile
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Masterpiece Editorial Footer */}
      <EditorialFooter />
    </div>
  );
}
