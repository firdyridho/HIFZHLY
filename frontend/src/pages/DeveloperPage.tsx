/**
 * DeveloperPage — editorial typographic experience
 * Design direction: Cinematic Editorial × Islamic Scholarly
 * Scroll engine: Lenis inertial + GSAP ScrollTrigger cinematic scenes
 * No badges. No icon spam. No gradient cards. Pure type + photo + space.
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowUpRight, Mail } from 'lucide-react';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ─── Data ────────────────────────────────────────────────────────────────────

interface Developer {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  verse: string;
  verseSource: string;
  bio: string[];
  disciplines: string[];
  imageSrc: string;
  monogram: string;
  social: { github: string; linkedin: string; email: string };
}

const DEVS: Developer[] = [
  {
    id: 'firdy',
    name: 'Firdy Ridho Fillah',
    nameAr: 'فردي رضا الله',
    role: 'Co-Founder · Fullstack AI & Systems Architect',
    verse: 'وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ',
    verseSource: 'QS. Hud: 88',
    bio: [
      'Membangun pipeline evaluasi suara tilawah kata-demi-kata dengan latensi ultra-rendah — seluruh pemrosesan berlangsung di memori perangkat, tanpa sebutir data suara yang menyentuh server.',
      'Merumuskan model matematika FSRS Spaced Repetition adaptif agar hafalan santri dijadwalkan tepat sebelum kurva lupa menyentuh ambang kritis.',
    ],
    disciplines: [
      'Real-time Speech Recognition',
      'Web Audio API & DSP',
      'ONNX Runtime Web',
      'FSRS Retention Modelling',
      'React 19 & TypeScript',
      'Linux & Docker Orchestration',
    ],
    imageSrc: '/images/developers/firdy.webp',
    monogram: 'FRF',
    social: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      email: 'mailto:firdyridho@gmail.com',
    },
  },
  {
    id: 'faeyza',
    name: 'Faeyza Ardellein Yaradhitya',
    nameAr: 'فائزة أرديلين يرضيثا',
    role: 'Co-Founder · Product Designer & Islamic UX Lead',
    verse: 'إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ',
    verseSource: 'HR. Muslim',
    bio: [
      'Merancang pengalaman antarmuka yang khusyu\' — setiap piksel ditimbang: apakah ia membantu hafalan ataukah mengganggunya.',
      'Memimpin standardisasi rasm Utsmani dan tanda baca sesuai pedoman Lajnah Pentashihan Mushaf Al-Qur\'an Kemenag RI, agar yang tertulis di layar setara dengan yang tercetak di kertas.',
    ],
    disciplines: [
      'Islamic UI/UX Architecture',
      'Mushaf Rasm Standardization',
      'Design Systems & Tokens',
      'Human-Centered Research',
      'Accessibility Engineering',
      'Quranic Typography Systems',
    ],
    imageSrc: '/images/developers/faeyza.webp?v=2',
    monogram: 'FAY',
    social: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      email: 'mailto:faeyzardellein@gmail.com',
    },
  },
];

// ─── Helper: Monogram SVG fallback avatar ────────────────────────────────────

function MonogramAvatar({ initials }: { initials: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 select-none">
      <span
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        className="text-3xl font-black tracking-tight text-slate-100 leading-none"
      >
        {initials}
      </span>
    </div>
  );
}

// ─── Helper: GithubSVG (lucide-react lacks this) ─────────────────────────────

function GitHubSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedInSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v7.6h2.8v-7.6h-2.8M7.86 6.5a1.63 1.63 0 0 0-1.63 1.62c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63A1.63 1.63 0 0 0 7.86 6.5z" />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DeveloperPage() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const heroLineRef = useRef<HTMLDivElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const heroArabicRef = useRef<HTMLParagraphElement>(null);
  const scrollLineRef = useRef<HTMLDivElement>(null);

  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // ── Lenis per-page smooth scroll (not global to avoid conflict with App.tsx) ──
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
    });

    // Tie Lenis raf to ScrollTrigger
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

  // ── GSAP Cinematic Scroll Animations ──────────────────────────────────────
  useEffect(() => {
    if (!wrapRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Hero: words split & stagger in
      const heroLine = heroLineRef.current;
      if (heroLine) {
        const words = heroLine.querySelectorAll('.hero-word');
        gsap.fromTo(
          words,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.0,
            ease: 'expo.out',
            stagger: 0.07,
            delay: 0.1,
          }
        );
      }

      // 2. Hero sub-text: mask reveal
      if (heroSubRef.current) {
        gsap.fromTo(
          heroSubRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.6 }
        );
      }

      // 3. Arabic verse: fade from right
      if (heroArabicRef.current) {
        gsap.fromTo(
          heroArabicRef.current,
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out', delay: 0.9 }
        );
      }

      // 4. Animated scroll indicator line
      if (scrollLineRef.current) {
        gsap.fromTo(
          scrollLineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 1.2,
            ease: 'power2.inOut',
            delay: 1.5,
            transformOrigin: 'top center',
          }
        );
      }

      // 5. Developer sections — cinematic clip-path reveal from bottom
      const devSections = document.querySelectorAll('.dev-section');
      devSections.forEach((section) => {
        // Photo: clip-path wipe in from bottom
        const photo = section.querySelector('.dev-photo-wrap');
        if (photo) {
          gsap.fromTo(
            photo,
            { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
            {
              clipPath: 'inset(0% 0 0 0)',
              opacity: 1,
              duration: 1.2,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: photo,
                start: 'top 80%',
              },
            }
          );
        }

        // Name: large type scrubs in letter-by-letter
        const nameEl = section.querySelector('.dev-name');
        if (nameEl) {
          gsap.fromTo(
            nameEl,
            { yPercent: 60, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 1.0,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: nameEl,
                start: 'top 85%',
              },
            }
          );
        }

        // Role line: subtle fade up
        const roleEl = section.querySelector('.dev-role');
        if (roleEl) {
          gsap.fromTo(
            roleEl,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: roleEl,
                start: 'top 88%',
              },
            }
          );
        }

        // Bio paragraphs: stagger line by line
        const bios = section.querySelectorAll('.dev-bio-p');
        if (bios.length) {
          gsap.fromTo(
            bios,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
              stagger: 0.15,
              scrollTrigger: {
                trigger: bios[0],
                start: 'top 88%',
              },
            }
          );
        }

        // Disciplines: horizontal scroll-reveal row
        const tags = section.querySelectorAll('.dev-tag');
        if (tags.length) {
          gsap.fromTo(
            tags,
            { opacity: 0, x: -20 },
            {
              opacity: 1,
              x: 0,
              duration: 0.6,
              ease: 'power3.out',
              stagger: 0.07,
              scrollTrigger: {
                trigger: tags[0],
                start: 'top 90%',
              },
            }
          );
        }

        // Verse: scale + fade
        const verseEl = section.querySelector('.dev-verse');
        if (verseEl) {
          gsap.fromTo(
            verseEl,
            { opacity: 0, scale: 0.97 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: verseEl,
                start: 'top 88%',
              },
            }
          );
        }
      });

      // 6. Manifesto section — large type parallax
      const manifestoWords = document.querySelectorAll('.manifesto-word');
      if (manifestoWords.length) {
        gsap.fromTo(
          manifestoWords,
          { yPercent: 50, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'expo.out',
            stagger: 0.05,
            scrollTrigger: {
              trigger: manifestoWords[0],
              start: 'top 85%',
            },
          }
        );
      }

      // 7. Divider lines — draw in
      const dividers = document.querySelectorAll('.anim-divider');
      dividers.forEach((d) => {
        gsap.fromTo(
          d,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.2,
            ease: 'expo.out',
            transformOrigin: 'left center',
            scrollTrigger: { trigger: d, start: 'top 90%' },
          }
        );
      });

      // 8. Stats counter
      const statNums = document.querySelectorAll('.stat-num');
      statNums.forEach((el) => {
        const target = parseFloat(el.getAttribute('data-target') || '0');
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
          onUpdate: () => {
            el.textContent = Number.isInteger(target)
              ? Math.round(obj.v).toLocaleString('id-ID')
              : obj.v.toFixed(0);
          },
        });
      });
    }, wrapRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div ref={wrapRef} className="bg-white text-slate-900 min-h-screen flex flex-col overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      {/* ── HEADER: ultra-minimal line, nothing more ─────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 mix-blend-multiply">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Hifzhly
          </Link>
          <Link
            to="/app"
            className="text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5"
          >
            Buka Aplikasi
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ── HERO: full typographic opening spread ────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-end px-5 sm:px-8 lg:px-16 pb-16 pt-32 overflow-hidden bg-white">
        {/* Scroll progress line, left edge */}
        <div
          ref={scrollLineRef}
          className="absolute left-5 sm:left-8 top-20 bottom-16 w-px bg-slate-200 origin-top"
        />

        {/* Quranic inscription — right edge, vertical */}
        <div className="absolute right-5 sm:right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4">
          <div className="w-px h-20 bg-emerald-300" />
          <p
            ref={heroArabicRef}
            className="font-quran text-sm text-emerald-800 opacity-70 leading-loose"
            style={{ writingMode: 'vertical-rl' }}
          >
            وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ
          </p>
          <div className="w-px h-20 bg-emerald-300" />
        </div>

        {/* Main headline — word-by-word split */}
        <div ref={heroLineRef} className="max-w-5xl overflow-hidden">
          {['Dua', 'Pemikir.', 'Satu', 'Platform.'].map((word) => (
            <span
              key={word}
              className="hero-word inline-block mr-[0.2em] text-[clamp(3rem,9vw,8rem)] font-black tracking-tight text-slate-900 leading-[0.95]"
            >
              {word}
            </span>
          ))}
        </div>

        <div className="mt-10 max-w-2xl">
          <p
            ref={heroSubRef}
            className="text-base sm:text-lg text-slate-500 leading-relaxed font-normal"
          >
            Mengenal Firdy Ridho Fillah &amp; Faeyza Ardellein Yaradhitya — dua orang yang membangun Hifzhly dari nol: dari kode ASR phoneme, algoritma FSRS, hingga antarmuka yang sunyi.
          </p>
        </div>

        {/* Scroll cue */}
        <div className="mt-16 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          <div className="w-8 h-px bg-slate-300" />
          Gulir untuk membaca
        </div>
      </section>

      {/* ── DEVELOPER SECTIONS ───────────────────────────────────────────── */}
      {DEVS.map((dev, idx) => {
        const isEven = idx % 2 === 0;
        return (
          <section
            key={dev.id}
            className={`dev-section relative py-24 sm:py-32 px-5 sm:px-8 lg:px-16 ${
              isEven ? 'bg-white' : 'bg-slate-50'
            }`}
          >
            {/* Section index number */}
            <div className="absolute top-10 right-5 sm:right-8 text-[8rem] font-black text-slate-100 leading-none select-none pointer-events-none hidden lg:block">
              0{idx + 1}
            </div>

            <hr className="anim-divider w-full border-0 h-px bg-slate-200 mb-16 sm:mb-24 origin-left" />

            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start`}>
              {/* Photo — always first on mobile, alternates on desktop */}
              <div className={`lg:col-span-5 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                <div className="dev-photo-wrap relative overflow-hidden rounded-2xl bg-slate-100 aspect-[4/5] max-w-sm w-full mx-auto lg:mx-0">
                  {!imgErrors[dev.id] ? (
                    <img
                      src={dev.imageSrc}
                      alt={dev.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        const t = e.currentTarget;
                        if (t.src.includes('.webp')) {
                          t.src = t.src.replace('.webp', '.jpg');
                        } else {
                          setImgErrors((p) => ({ ...p, [dev.id]: true }));
                        }
                      }}
                    />
                  ) : (
                    <MonogramAvatar initials={dev.monogram} />
                  )}

                  {/* Arabic name watermark over bottom of photo */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                    <p className="font-quran text-white/90 text-lg leading-loose text-right">
                      {dev.nameAr}
                    </p>
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className={`lg:col-span-7 flex flex-col gap-8 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                {/* Role */}
                <p className="dev-role text-xs font-bold uppercase tracking-widest text-emerald-700">
                  {dev.role}
                </p>

                {/* Name — large display type */}
                <h2 className="dev-name text-[clamp(2rem,5vw,3.75rem)] font-black text-slate-900 tracking-tight leading-[1.0] -mt-2">
                  {dev.name}
                </h2>

                {/* Quranic verse as a design element, not a badge */}
                <div className="dev-verse border-l-2 border-emerald-500 pl-5 space-y-1">
                  <p className="font-quran text-xl sm:text-2xl text-emerald-900 leading-loose">
                    {dev.verse}
                  </p>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600">
                    {dev.verseSource}
                  </p>
                </div>

                {/* Bio */}
                <div className="space-y-4">
                  {dev.bio.map((para, i) => (
                    <p
                      key={i}
                      className="dev-bio-p text-sm sm:text-base text-slate-600 leading-relaxed"
                    >
                      {para}
                    </p>
                  ))}
                </div>

                {/* Disciplines — plain text list, no pill badges */}
                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Bidang Keahlian
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {dev.disciplines.map((d) => (
                      <span
                        key={d}
                        className="dev-tag text-sm text-slate-700 font-medium"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social links — text only, no button shapes */}
                <div className="pt-4 flex items-center gap-6 border-t border-slate-100">
                  <a
                    href={dev.social.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider"
                  >
                    <GitHubSVG />
                    GitHub
                  </a>
                  <a
                    href={dev.social.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider"
                  >
                    <LinkedInSVG />
                    LinkedIn
                  </a>
                  <a
                    href={dev.social.email}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ── MANIFESTO SECTION — editorial full-bleed type ────────────────── */}
      <section className="relative py-32 px-5 sm:px-8 lg:px-16 bg-slate-900 text-white overflow-hidden">
        <hr className="anim-divider w-full border-0 h-px bg-slate-700 mb-16 origin-left" />

        {/* Large background Arabic motif */}
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04]"
        >
          <span className="font-quran text-[20rem] leading-none text-white">
            ح
          </span>
        </div>

        <div className="relative max-w-4xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 mb-10">
            Manifesto Pembangunan
          </p>

          <div className="overflow-hidden">
            <p className="text-[clamp(1.5rem,4vw,3rem)] font-black text-white leading-tight tracking-tight">
              {[
                'Hifzhly', 'tidak', 'hadir', 'untuk', 'menggantikan',
                'ustadz', 'dan', 'musyrif', 'bersanad.'
              ].map((w) => (
                <span key={w} className="manifesto-word inline-block mr-[0.25em]">{w}</span>
              ))}
            </p>
            <p className="text-[clamp(1.5rem,4vw,3rem)] font-black text-emerald-400 leading-tight tracking-tight mt-2">
              {[
                'Ia', 'adalah', 'teman', 'latihan', 'mandiri',
                'yang', 'menemani', 'santri', 'di', 'kala', 'malam.'
              ].map((w) => (
                <span key={w} className="manifesto-word inline-block mr-[0.25em]">{w}</span>
              ))}
            </p>
          </div>

          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-10 border-t border-slate-800 pt-14">
            {[
              { label: 'Juz', value: '30', note: 'Peta Mushaf Lengkap' },
              { label: 'Surah', value: '114', note: 'Validasi Rasm & Sanad' },
              { label: 'Ayat', value: '6236', note: 'Retensi FSRS Terindeks' },
              { label: 'Detik', value: '0', note: 'Simpan Suara ke Server' },
            ].map((s) => (
              <div key={s.label} className="space-y-1">
                <p className="text-4xl sm:text-5xl font-black text-white leading-none">
                  <span
                    className="stat-num"
                    data-target={s.value}
                  >
                    {s.value}
                  </span>
                  {s.label === 'Detik' && (
                    <span className="text-xl font-semibold text-slate-400 ml-1">ms</span>
                  )}
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                  {s.label}
                </p>
                <p className="text-xs text-slate-500">{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER: typographic, no icon spam ───────────────────────────── */}
      <footer className="bg-white border-t border-slate-100 py-16 px-5 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Quranic verse — the footer's visual anchor */}
          <div className="mb-14 max-w-2xl">
            <p className="font-quran text-2xl sm:text-3xl text-emerald-900 leading-loose">
              وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ
            </p>
            <p className="mt-2 text-xs text-slate-500 italic">
              Dan sungguh, telah Kami mudahkan Al-Qur'an untuk peringatan, maka adakah orang yang mau mengambil pelajaran? — QS. Al-Qamar: 17
            </p>
          </div>

          <hr className="anim-divider border-0 h-px bg-slate-100 mb-12 origin-left" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-sm text-slate-500">
            {/* Col 1: Brand */}
            <div className="space-y-3">
              <Link to="/" className="inline-flex items-center gap-2.5 group">
                <img src="/logo saja.png" alt="Hifzhly" className="w-8 h-8 object-contain" />
                <span className="font-black text-slate-900 tracking-tight text-base">Hifzhly</span>
              </Link>
              <p className="text-xs leading-relaxed text-slate-500 max-w-xs">
                Platform asistensi murojaah Al-Qur'an — kecerdasan buatan yang tunduk pada adab ilmiah dan sanad mushaf.
              </p>
            </div>

            {/* Col 2: Navigasi */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Navigasi</p>
              <ul className="space-y-2">
                {[
                  { label: 'Beranda', to: '/' },
                  { label: 'Aplikasi Murojaah', to: '/app' },
                  { label: 'Mushaf & Tajwid', to: '/app/mushaf' },
                  { label: 'Unduh Aplikasi', to: '/download' },
                  { label: 'Portal Musyrif', to: '/login?role=admin' },
                ].map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="hover:text-slate-900 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Legal */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Privasi & Legal</p>
              <ul className="space-y-2">
                {[
                  { label: 'Ketentuan Layanan', to: '/terms' },
                  { label: 'Privasi Suara (Memory-Only)', to: '/terms' },
                  { label: 'Halaman Pengembang', to: '/developers' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="hover:text-slate-900 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <hr className="anim-divider border-0 h-px bg-slate-100 my-10 origin-left" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
            <p>
              &copy; 2026 Hifzhly &mdash; Diciptakan dengan khidmah oleh{' '}
              <Link to="/developers" className="text-slate-600 hover:text-slate-900 font-semibold transition-colors">
                Faeyza Ardellein Yaradhitya
              </Link>{' '}
              &amp;{' '}
              <Link to="/developers" className="text-slate-600 hover:text-slate-900 font-semibold transition-colors">
                Firdy Ridho Fillah
              </Link>
              .
            </p>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors inline-flex items-center gap-2"
            >
              Ke atas
              <span className="inline-block rotate-[-90deg]">
                <ArrowLeft className="w-3 h-3" />
              </span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
