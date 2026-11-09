import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import StarBorder from '../reactbits/StarBorder';

export default function ClosingCtaBanner() {
  return (
    <section className="max-w-6xl mx-auto px-4 w-full pb-24">
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#043d2e] text-white shadow-2xl shadow-emerald-950/30 border border-emerald-700/40"
      >
        {/* Subtle Architectural Grid Pattern (Exact match to Moneta reference) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-40 z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '36px 36px',
          }}
        />

        {/* Subtle Ambient Radial Glow */}
        <div
          aria-hidden="true"
          className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none z-0"
        />

        {/* 2-Column Split Layout */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[400px] sm:min-h-[440px]">
          {/* Left Column: Editorial Serif Headline, Description, & Pill CTA (Strictly Zero Icons) */}
          <div className="lg:col-span-7 p-8 sm:p-14 lg:pr-4 flex flex-col justify-center text-left space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-normal font-translit text-white tracking-tight leading-[1.16]">
              Siap Menjaga &amp; Menguatkan{' '}
              <span className="italic font-serif font-light text-emerald-200 block sm:inline">
                Hafalan Kalamullah?
              </span>
            </h2>

            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed max-w-lg font-sans font-normal">
              Bergabunglah bersama ribuan santri dan penghafal mandiri dalam merawat kalamullah dengan bimbingan kecerdasan buatan, akurasi tajwid real-time, dan kurva lupa ilmiah.
            </p>

            {/* Pill CTA Button (Zero Icons, React Bits Star Border, Pill Shape matching reference) */}
            <div className="pt-2">
              <StarBorder
                as={Link}
                to="/register"
                color="#34d399"
                speed="4s"
                className="rounded-full shadow-lg shadow-emerald-950/40"
              >
                <span className="px-7 py-3.5 rounded-full bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-sm sm:text-[15px] tracking-wide transition-all duration-200 select-none">
                  Daftar Akun Santri
                </span>
              </StarBorder>
            </div>
          </div>

          {/* Right Column: Overlapping Physical Cards (Matching Moneta Reference) */}
          <div className="lg:col-span-5 relative w-full h-[320px] sm:h-[380px] lg:h-full min-h-[340px] flex items-end justify-center lg:justify-end overflow-hidden pt-4 lg:pt-0 pointer-events-none select-none">
            {/* Card 1: Back Card (Tilted Left -10deg, Layered Behind) */}
            <div
              className="absolute bottom-[-18px] sm:bottom-[-24px] right-[40px] sm:right-[110px] w-64 sm:w-72 h-[340px] sm:h-[380px] rounded-3xl bg-slate-100/95 backdrop-blur-md border border-white/80 p-6 flex flex-col justify-between shadow-xl shadow-emerald-950/30 transform -rotate-[10deg] translate-y-6 z-10 transition-transform duration-500 hover:-translate-y-2"
            >
              {/* Back Card Top Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img src="/logo saja.png" alt="Hifzhly" className="w-5 h-5 object-contain" />
                  <span className="font-bold text-slate-800 tracking-tight text-xs">AI Voice Evaluator</span>
                </div>
                {/* Silver Chip */}
                <div className="w-8 h-6 rounded-md bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 border border-slate-300 relative overflow-hidden shadow-xs">
                  <div className="w-full h-[0.5px] bg-slate-400/50 absolute top-1/2 -translate-y-1/2" />
                  <div className="h-full w-[0.5px] bg-slate-400/50 absolute left-1/2 -translate-x-1/2" />
                </div>
              </div>

              {/* Back Card Middle Audio Wavelet Preview */}
              <div className="space-y-2 my-auto opacity-75">
                <div className="flex items-center space-x-1 h-8">
                  {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 65].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-emerald-600/60 rounded-full"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Phoneme Match: 98.4% Mutqin</p>
              </div>

              {/* Back Card Bottom */}
              <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Spaced Repetition</span>
                <span className="font-semibold text-emerald-800">SRS Level 5</span>
              </div>
            </div>

            {/* Card 2: Front Card (Tilted Right 6deg, Crisp Pure White, High Elevation) */}
            <div
              className="absolute bottom-[-24px] sm:bottom-[-30px] right-[10px] sm:right-[20px] w-64 sm:w-72 h-[340px] sm:h-[380px] rounded-3xl bg-white border border-slate-100 p-6 flex flex-col justify-between shadow-2xl shadow-emerald-950/60 transform rotate-[6deg] translate-y-4 z-20 transition-transform duration-500 hover:-translate-y-2"
            >
              {/* Front Card Header: Hifzhly Brand & Gold EMV Chip */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img src="/logo saja.png" alt="Hifzhly" className="w-5 h-5 object-contain" />
                  <span className="font-black text-emerald-900 tracking-tight text-sm font-sans">Hifzhly</span>
                </div>
                {/* Gold Metallic EMV Smart Chip */}
                <div className="w-8 h-6 rounded-md bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300 border border-amber-400/60 relative overflow-hidden shadow-xs flex items-center justify-center">
                  <div className="w-full h-[0.5px] bg-amber-600/40 absolute top-1/2 -translate-y-1/2" />
                  <div className="h-full w-[0.5px] bg-amber-600/40 absolute left-1/2 -translate-x-1/2" />
                  <div className="w-3 h-3 rounded-full border border-amber-600/30" />
                </div>
              </div>

              {/* NFC Contactless Wave Symbol */}
              <div className="flex justify-end pt-1">
                <svg
                  className="w-4 h-4 text-slate-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M8.5 16.5a5 5 0 0 1 0-7" strokeLinecap="round" />
                  <path d="M12 19a8.5 8.5 0 0 0 0-14" strokeLinecap="round" />
                  <path d="M15.5 21.5a12 12 0 0 0 0-19" strokeLinecap="round" />
                </svg>
              </div>

              {/* Front Card Center Info */}
              <div className="space-y-1 my-auto">
                <p className="text-[10px] tracking-wider text-slate-400 font-mono font-semibold uppercase">
                  Nomor Induk Santri
                </p>
                <p className="text-sm font-mono font-black tracking-widest text-slate-800">
                  HIF-2026-0891
                </p>
              </div>

              {/* Front Card Bottom Info: Santri Name & Mutqin Badge */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    Santri Mutqin
                  </p>
                  <p className="text-xs font-bold text-slate-900 tracking-tight">
                    Ahmad Rayhan
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[10px] font-extrabold text-emerald-800 border border-emerald-200/80">
                  Juz 30
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

