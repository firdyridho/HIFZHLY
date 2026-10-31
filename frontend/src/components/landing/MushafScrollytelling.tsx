import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Calendar, Layers, ChevronRight, ChevronLeft } from 'lucide-react';
import { InteractiveCard } from '@/components/lightswind/interactive-card';

interface StageData {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  points: string[];
  color: string;
}

const STAGES: StageData[] = [
  {
    id: 0,
    badge: 'Kecerdasan Buatan & Evaluator Suara',
    title: 'Penyejajaran Levenshtein Kata demi Kata',
    subtitle: 'Mendeteksi substitusi, delesi, dan insersi kata secara presisi matematis.',
    description:
      'Setiap suku kata Arab yang dilafalkan dinormalisasi dan dibandingkan terhadap teks rujukan Mushaf Madinah (EQuran.id API v2). Kesalahan tidak lagi terlewat seperti saat murojaah sendiri di rumah.',
    points: [
      'Normalisasi huruf otomatis (penyelarasan alif hamzah, ta marbuthah, dan tanda waqaf)',
      'Identifikasi kata tertukar (Substituted), kata terlewat (Deleted), dan kata berlebih (Inserted)',
      'Formula penskoran objektif: Skor = max(0, 1 - (S+D+I)/N) * 100',
    ],
    color: 'rgba(16, 185, 129, 0.28)',
  },
  {
    id: 1,
    badge: 'Standar Tarteel QUL (Quranic Universal Library)',
    title: 'Peringatan Dini Ayat Mutasyabihat',
    subtitle: 'Menjaga hafalan agar tidak tertukar dengan ayat serupa di juz lain.',
    description:
      'Hafizhul Qur’an sering kali terselip pada ayat yang memiliki lafal pembuka atau penutup serupa. Hifzhly mengadopsi standar pemetaan Mutasyabihat untuk memunculkan peringatan langsung sebelum santri melompat ayat.',
    points: [
      'Pemetaan otomatis kemiripan teks di seluruh surah Juz 30',
      'Penandaan kata pembeda dengan sorotan visual kontras',
      'Catatan kaidah perbandingan surah rujukan agar hafalan mantap',
    ],
    color: 'rgba(245, 158, 11, 0.28)',
  },
  {
    id: 2,
    badge: 'Sains Kognitif & Pedagogi',
    title: 'Jadwal Murojaah Adaptif (Spaced Repetition)',
    subtitle: 'Menghentikan kurva kelupaan hafalan dengan pengulangan berjarak ilmiah.',
    description:
      'Berdasarkan riset Distributed Practice (Cepeda et al., 2006) dan algoritma SuperMemo-2, sistem secara otomatis menentukan kapan setiap ayat harus diulang. Santri tidak perlu lagi menebak surah mana yang harus dibaca hari ini.',
    points: [
      'Pemetaan skor AI ke skala kualitas memori (Rating 0 - 5)',
      'Interval pengulangan adaptif: 1 hari -> 3 hari -> 7 hari -> 14 hari -> 30 hari',
      'Antrean ayat jatuh tempo otomatis tersaji begitu aplikasi dibuka',
    ],
    color: 'rgba(20, 184, 166, 0.28)',
  },
];

export default function MushafScrollytelling() {
  const [activeStage, setActiveStage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollPos = window.scrollY + window.innerHeight / 2;

      stageRefs.current.forEach((el, index) => {
        if (!el) return;
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          setActiveStage(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToStage = (index: number) => {
    setActiveStage(index);
    stageRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section ref={containerRef} className="py-24 max-w-6xl mx-auto px-4 w-full relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 mb-3">
          <Layers className="w-3.5 h-3.5 text-emerald-700" />
          <span>Scrollytelling Interaktif</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Terus Gulir, Selami Arsitektur Evaluasi Hifzhly
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-2">
          Bagaimana sinergi Speech Recognition, Pemetaan Mutasyabihat, dan Algoritma SRS bekerja bersama dalam satu lembaran Mushaf.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative">
        {/* Left Side: 3 Informative Stages */}
        <div className="lg:col-span-6 space-y-24 py-8">
          {STAGES.map((stage, idx) => (
            <motion.div
              key={stage.id}
              ref={(el) => { stageRefs.current[idx] = el; }}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`p-6 sm:p-8 rounded-3xl border transition-all duration-500 cursor-pointer ${
                activeStage === idx
                  ? 'bg-white border-emerald-500/60 shadow-lg shadow-emerald-950/5 ring-1 ring-emerald-500/20'
                  : 'bg-white/60 border-slate-200/80 hover:bg-white hover:border-slate-300'
              }`}
              onClick={() => scrollToStage(idx)}
            >
              <div className="flex items-center space-x-2 text-[11px] font-semibold text-emerald-800 mb-2">
                <span className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center font-mono">
                  0{idx + 1}
                </span>
                <span>{stage.badge}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1">
                {stage.title}
              </h3>
              <p className="text-xs font-medium text-slate-500 mb-4">{stage.subtitle}</p>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
                {stage.description}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                {stage.points.map((pt, pIdx) => (
                  <div key={pIdx} className="flex items-start space-x-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Side: Sticky 3D Perspective Mushaf Flip Card with InteractiveCard */}
        <div className="lg:col-span-6 sticky top-28">
          <InteractiveCard
            InteractiveColor={STAGES[activeStage].color}
            borderRadius="28px"
            rotationFactor={0.18}
            containerClassName="w-full shadow-xl shadow-slate-200/60"
            className="p-6 sm:p-8 relative overflow-hidden"
          >
            {/* Card Header Bar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  Tampilan Mushaf &amp; Analisis Cerdas
                </span>
              </div>

              {/* Stage Step Indicator Dots */}
              <div className="flex items-center space-x-1.5">
                {STAGES.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => scrollToStage(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeStage === idx ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
                    }`}
                    title={`Pindah ke tahapan ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* 3D Animated Card Content */}
            <div
              className="relative transition-all duration-500 ease-out"
              style={{
                transform: `rotateX(${activeStage === 1 ? '4deg' : activeStage === 2 ? '-4deg' : '0deg'}) scale(${
                  activeStage !== null ? '1' : '0.98'
                })`,
              }}
            >
              {/* PAGE 0: Levenshtein Word Diff View */}
              {activeStage === 0 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">QS. An-Naba' [78: 1-3]</span>
                    <span className="text-[11px] bg-emerald-50 text-emerald-800 font-mono px-2 py-0.5 rounded border border-emerald-200">
                      Evaluasi Kata: 100% Selesai
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-200/80 font-quran text-3xl leading-loose select-none" dir="rtl">
                    <span className="text-emerald-900 bg-emerald-100/80 px-2.5 py-1 rounded-lg">عَمَّ</span>{' '}
                    <span className="text-emerald-900 bg-emerald-100/80 px-2.5 py-1 rounded-lg">يَتَسَآءَلُونَ</span>{' '}
                    <span className="text-amber-600 mx-1 font-sans text-2xl">۝١</span>{' '}
                    <span className="text-emerald-900 bg-emerald-100/80 px-2.5 py-1 rounded-lg">عَنِ</span>{' '}
                    <span className="text-emerald-900 bg-emerald-100/80 px-2.5 py-1 rounded-lg">النَّبَإِ</span>{' '}
                    <span className="text-emerald-900 bg-emerald-100/80 px-2.5 py-1 rounded-lg">الْعَظِيمِ</span>{' '}
                    <span className="text-amber-600 mx-1 font-sans text-2xl">۝٢</span>{' '}
                    <span className="text-slate-800 px-2 py-1">الَّذِي هُمْ فِيهِ مُخْتَلِفُونَ</span>{' '}
                    <span className="text-amber-600 mx-1 font-sans text-2xl">۝٣</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-700 space-y-1">
                    <div className="flex items-center space-x-2 font-semibold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Hasil Penyejajaran: 6 Kata Cocok Sempurna (C)</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      S = 0 (Substitusi), D = 0 (Delesi), I = 0 (Insersi). Skor Levenshtein: 100/100.
                    </p>
                  </div>
                </div>
              )}

              {/* PAGE 1: Mutasyabihat Warning View */}
              {activeStage === 1 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">Peringatan Mutasyabihat Terpadu</span>
                    <span className="text-[11px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-200 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>2 Ayat Serupa</span>
                    </span>
                  </div>

                  <div className="space-y-3 font-sans">
                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-amber-900">QS. An-Naba' [78: 1]</span>
                        <span className="text-[10px] text-amber-700">Ayat Saat Ini</span>
                      </div>
                      <p className="font-quran text-2xl text-slate-900 text-right leading-relaxed" dir="rtl">
                        عَمَّ يَتَسَآءَلُونَ ۝١
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-800">QS. Al-Mursalat [77: 1-2]</span>
                        <span className="text-[10px] text-slate-500">Pembanding (Tarteel QUL)</span>
                      </div>
                      <p className="font-quran text-2xl text-slate-700 text-right leading-relaxed" dir="rtl">
                        وَالْمُرْسَلَٰتِ عُرْفًا ۝١ فَالْعَٰصِفَٰتِ عَصْفًا ۝٢
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <strong>Catatan Perbedaan:</strong> Perhatikan jeda waqaf dan jangan sampai melompat ke surah lain karena kesamaan wazan pada juz 30.
                  </p>
                </div>
              )}

              {/* PAGE 2: Adaptive SRS Projection View */}
              {activeStage === 2 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">Proyeksi Kurva Lupa (SuperMemo-2)</span>
                    <span className="text-[11px] bg-teal-50 text-teal-800 font-semibold px-2 py-0.5 rounded border border-teal-200">
                      Quality Rating: 5 (Sempurna)
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-500">Ease Factor (EF)</span>
                        <p className="text-xl font-bold text-slate-900 font-mono">2.50 → 2.60</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500">Interval Review Berikutnya</span>
                        <p className="text-xl font-bold text-emerald-700 font-mono">+7 Hari</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                        <span>Hari ke-1 (Lolos)</span>
                        <span>Hari ke-3 (Lolos)</span>
                        <span className="text-emerald-700">Hari ke-7 (Jadwal Aktif)</span>
                        <span>Hari ke-14</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full transition-all duration-700" style={{ width: '60%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-slate-700 flex items-center space-x-2.5">
                    <Calendar className="w-4 h-4 text-teal-700 shrink-0" />
                    <p className="leading-relaxed">
                      Ayat ini dijadwalkan kembali pada <strong>07 November 2026</strong>. Pengulangan berjarak terbukti meningkatkan retensi memori jangka panjang hingga 47.3%.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Card Navigation Controller */}
            <div className="flex items-center justify-between pt-5 mt-6 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => scrollToStage(Math.max(0, activeStage - 1))}
                disabled={activeStage === 0}
                className="inline-flex items-center space-x-1 font-semibold text-slate-700 hover:text-emerald-700 disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Tahap Sebelumnya</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToStage(Math.min(STAGES.length - 1, activeStage + 1))}
                disabled={activeStage === STAGES.length - 1}
                className="inline-flex items-center space-x-1 font-semibold text-emerald-700 hover:text-emerald-800 disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                <span>Tahap Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </InteractiveCard>
        </div>
      </div>
    </section>
  );
}
