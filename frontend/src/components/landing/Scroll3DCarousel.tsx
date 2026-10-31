import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Check,
  ChevronDown,
} from "lucide-react";
import { InteractiveCard } from "@/components/lightswind/interactive-card";

interface CarouselCardData {
  id: number;
  badge: string;
  badgeColor: string;
  title: string;
  desc: string;
  interactiveColor: string;
  ctaText: string;
  ctaLink: string;
  content: React.ReactNode;
}

export default function Scroll3DCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isHoveredWave, setIsHoveredWave] = useState(false);

  // Scroll tracking across the sticky section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [currentIdx, setCurrentIdx] = useState(0);

  smoothProgress.on("change", (latest) => {
    const idx = Math.min(3, Math.max(0, Math.round(latest * 3)));
    if (idx !== currentIdx) {
      setCurrentIdx(idx);
    }
  });

  // 4 Core Pillar Cards
  const CARDS: CarouselCardData[] = [
    {
      id: 0,
      badge: "Pilar 01 • Evaluasi Suara Real-Time",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      title: "Smart Murojaah AI Kata demi Kata",
      desc: "Mengevaluasi suara pelafalan per ayat dengan penyejajaran Levenshtein. Deteksi kesalahan kata tertukar, terlewat, atau pengulangan berlebih secara seketika (< 3 detik).",
      interactiveColor: "rgba(16, 185, 129, 0.32)",
      ctaText: "Uji Evaluasi Suara",
      ctaLink: "/app",
      content: (
        <div
          onMouseEnter={() => setIsHoveredWave(true)}
          onMouseLeave={() => setIsHoveredWave(false)}
          className="space-y-4 font-sans"
        >
          <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 transition-colors hover:bg-emerald-50/30">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
              <span className="font-semibold text-slate-800">Visualizer Gelombang Suara (16 kHz Mono)</span>
              <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                {isHoveredWave ? "Frekuensi Aktif..." : "Hover untuk Simulasi Gelombang"}
              </span>
            </div>

            <div className="flex items-center justify-between h-12 px-2 gap-1.5">
              {[35, 65, 45, 95, 75, 40, 85, 100, 60, 50, 75, 85, 55, 70, 45, 90, 70, 50, 80, 60].map(
                (h, i) => (
                  <span
                    key={i}
                    className={`w-full rounded-full transition-all duration-300 ${
                      isHoveredWave ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                    style={{
                      height: isHoveredWave
                        ? `${Math.min(100, Math.max(25, h + Math.sin(i + 1) * 20))}%`
                        : `${h * 0.45}%`,
                    }}
                  />
                )
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Tingkat Kesalahan (WER)</span>
              <span className="text-base font-bold text-slate-900">&lt; 10% Tartil</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] text-emerald-800 block">Privasi Suara</span>
              <span className="text-base font-bold text-emerald-900 flex items-center justify-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 inline" />
                <span>Memory-Only</span>
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 1,
      badge: "Pilar 02 • Tarteel QUL Standard",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      title: "Peringatan Dini Ayat Mutasyabihat",
      desc: "Hafalan tidak akan melompat ke surah lain. Sistem memetakan ayat-ayat berirama serupa di Juz 30 dan menandai perbedaannya secara visual.",
      interactiveColor: "rgba(245, 158, 11, 0.32)",
      ctaText: "Buka Mushaf Mutasyabihat",
      ctaLink: "/app/mushaf",
      content: (
        <div className="space-y-3 font-sans">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-xs text-slate-800 space-y-2">
            <div className="flex items-center justify-between font-semibold text-amber-900 text-[11px]">
              <span className="flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Ayat yang Sedang Dilafalkan:</span>
              </span>
              <span className="font-mono">QS. An-Naba' [78: 1]</span>
            </div>
            <p className="font-quran text-2xl text-right text-slate-900 leading-relaxed" dir="rtl">
              عَمَّ يَتَسَآءَلُونَ ۝١
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Ayat Serupa Pembanding di Juz 30:
            </span>
            <p className="font-quran text-lg text-right text-slate-700" dir="rtl">
              وَالْمُرْسَلَٰتِ عُرْفًا ۝١
            </p>
            <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 leading-snug">
              Catatan: Jangan tertukar waqaf dengan surah Al-Mursalat. Akhir ayat ini adalah madd wajib muttashil.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      badge: "Pilar 03 • Retensi SuperMemo-2",
      badgeColor: "bg-sky-50 text-sky-800 border-sky-200",
      title: "Mutabaah Yaumi & Analitik Hafalan",
      desc: "Pencatatan mutabaah digital otomatis. Pantau streak konsistensi harian, grafik kurva lupa, dan status retensi ayat mutqin secara transparan.",
      interactiveColor: "rgba(14, 165, 233, 0.32)",
      ctaText: "Pantau Mutabaah",
      ctaLink: "/app/mutabaah",
      content: (
        <div className="space-y-4 font-sans bg-slate-50/90 p-5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">Streak Mingguan Santri</span>
            <span className="font-bold text-sky-700 font-mono text-sm">7 Hari Beruntun</span>
          </div>

          {/* 7 Days Circles */}
          <div className="flex items-center justify-between">
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Ahad"].map((day, idx) => (
              <div key={day} className="text-center space-y-1">
                <span className="block text-[10px] text-slate-500">{day}</span>
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    idx <= 5
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  }`}
                >
                  <Check className="w-4 h-4" />
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-200">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Retensi Ayat Mutqin (Interval &gt; 14 Hari)</span>
              <span className="font-bold text-slate-900 font-mono">88%</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div className="bg-sky-600 h-full rounded-full transition-all duration-700" style={{ width: "88%" }} />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      badge: "Pilar 04 • Silabus Kemenag RI",
      badgeColor: "bg-teal-50 text-teal-800 border-teal-200",
      title: "Tajwid Academy & Kuis Interaktif",
      desc: "Kuasai hukum bacaan tajwid lewat modul terstruktur, video pembelajaran, kuis interaktif, dan layar review pembahasan mendalam per butir soal.",
      interactiveColor: "rgba(20, 184, 166, 0.32)",
      ctaText: "Mulai Belajar Tajwid",
      ctaLink: "/app/tajwid",
      content: (
        <div className="space-y-3 font-sans bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">Uji Interaktif Tajwid:</span>
            <span className="text-slate-500 text-[11px]">Nun Sukun &amp; Tanwin</span>
          </div>

          <p className="text-xs font-medium text-slate-800">
            Pada lafal <span className="font-quran text-lg px-2 py-0.5 bg-white rounded border border-slate-200 font-normal">مَن يَقُولُ</span>, apa hukum tajwid yang berlaku?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 0, label: "A. Idgham Bighunnah", correct: true },
              { id: 1, label: "B. Idzhar Halqi", correct: false },
              { id: 2, label: "C. Ikhfa Haqiqi", correct: false },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOption(opt.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border ${
                  selectedOption === opt.id
                    ? opt.correct
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-rose-600 text-white border-rose-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {selectedOption !== null && (
            <div
              className={`p-3 rounded-xl text-xs leading-relaxed transition-all ${
                selectedOption === 0
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                  : "bg-amber-50 text-amber-900 border border-amber-200"
              }`}
            >
              {selectedOption === 0 ? (
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Tepat!</strong> Terjadi pertemuan Nun Sukun (نْ) dengan huruf Ya (ي). Dibaca melebur dengan dengung 2 harakat.
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Belum Tepat.</strong> Nun Sukun bertemu huruf Ya (ي) adalah Idgham Bighunnah.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <section ref={containerRef} className="relative w-full h-[320vh]">
      {/* Sticky Viewport Container */}
      <div className="sticky top-20 min-h-[calc(100vh-5rem)] flex flex-col justify-center items-center px-4 overflow-hidden py-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 z-30">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 mb-3">
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span>3D Scroll-Driven Carousel</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Semua yang Kamu Butuhkan untuk Menjaga Hafalan
          </h2>

          <p className="text-slate-600 text-xs sm:text-sm mt-2">
            Gulir ke bawah untuk memajukan kartu pilar 3D; gulir ke atas untuk kembali ke kartu sebelumnya.
          </p>

          {/* Stepper Dots & Active Card Indicator */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            {CARDS.map((c, i) => (
              <span
                key={c.id}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIdx === i ? "w-8 bg-emerald-600" : "w-2 bg-slate-300"
                }`}
              />
            ))}
            <span className="text-[11px] font-mono text-slate-500 font-semibold ml-2">
              0{currentIdx + 1} / 04
            </span>
          </div>
        </div>

        {/* 3D Stack Carousel Container */}
        <div className="relative w-full max-w-3xl h-[490px] sm:h-[470px] perspective-1000 flex items-center justify-center">
          {CARDS.map((card, index) => {
            // Calculate scroll thresholds for this card
            const startP = index * 0.25;
            const endP = (index + 1) * 0.25;

            // Opacity: becomes visible, stays full, then fades when scrolling past
            const opacity = useTransform(
              smoothProgress,
              [startP - 0.12, startP, endP, endP + 0.12],
              [0, 1, 1, index === 3 ? 1 : 0]
            );

            // 3D Y Translation: slides in from bottom, centers, then floats up and away
            const y = useTransform(
              smoothProgress,
              [startP - 0.15, startP, endP, endP + 0.15],
              [index === 0 ? 0 : 80, 0, 0, index === 3 ? 0 : -90]
            );

            // Scale: subtle 3D depth layer
            const scale = useTransform(
              smoothProgress,
              [startP - 0.15, startP, endP, endP + 0.15],
              [0.92, 1, 1, index === 3 ? 1 : 1.05]
            );

            // 3D Tilt RotateX
            const rotateX = useTransform(
              smoothProgress,
              [startP - 0.15, startP, endP, endP + 0.15],
              [index === 0 ? 0 : 12, 0, 0, index === 3 ? 0 : -10]
            );

            // Z-Index hierarchy
            const zIndex = currentIdx === index ? 30 : 20 - Math.abs(currentIdx - index);

            return (
              <motion.div
                key={card.id}
                style={{
                  opacity,
                  y,
                  scale,
                  rotateX,
                  zIndex,
                  pointerEvents: currentIdx === index ? "auto" : "none",
                }}
                className="absolute inset-0 flex items-center justify-center will-change-transform"
              >
                <InteractiveCard
                  InteractiveColor={card.interactiveColor}
                  borderRadius="28px"
                  rotationFactor={0.2}
                  className="p-7 sm:p-9 flex flex-col justify-between h-full w-full"
                  containerClassName="w-full h-full shadow-2xl shadow-slate-200/70"
                >
                  <div>
                    {/* Card Top Meta */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`text-[11px] font-semibold px-3 py-1 rounded-md border ${card.badgeColor}`}
                      >
                        {card.badge}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-semibold">
                        Scroll Triggered Deck
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                      {card.title}
                    </h3>

                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5 max-w-2xl">
                      {card.desc}
                    </p>

                    {/* Interactive Body Content */}
                    <div className="pt-1">{card.content}</div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-4">
                    <span className="text-xs text-slate-500 flex items-center space-x-1.5">
                      <ChevronDown className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                      <span>Gulir untuk kartu selanjutnya</span>
                    </span>

                    <Link
                      to={card.ctaLink}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 group/link"
                    >
                      <span>{card.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </InteractiveCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
