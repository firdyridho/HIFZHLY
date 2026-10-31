import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { InteractiveCard } from '@/components/lightswind/interactive-card';

interface RecitationWord {
  arabic: string;
  transliteration: string;
  rule: string;
  status: 'pending' | 'active' | 'correct' | 'substituted';
  mistakeInfo?: string;
}

const ACCURATE_WORDS: RecitationWord[] = [
  { arabic: 'عَمَّ', transliteration: "'Amma", rule: "Ghunnah Musyaddadah", status: 'pending' },
  { arabic: 'يَتَسَآءَلُونَ', transliteration: 'Yatasaa-aluun', rule: 'Madd Wajib Muttashil', status: 'pending' },
  { arabic: 'عَنِ', transliteration: "'Ani", rule: 'Harf Jar', status: 'pending' },
  { arabic: 'النَّبَإِ', transliteration: 'An-Naba-i', rule: 'Al-Syamsiyyah', status: 'pending' },
  { arabic: 'الْعَظِيمِ', transliteration: "Al-'Azhiim", rule: "Madd 'Aridh Lissukun", status: 'pending' },
];

const MISTAKE_SIMULATION_WORDS: RecitationWord[] = [
  { arabic: 'عَمَّ', transliteration: "'Amma", rule: "Ghunnah Musyaddadah", status: 'pending' },
  { 
    arabic: 'يَتَسَآءَلُونَ', 
    transliteration: 'Yatasaa-aluu (Keliru: Huruf Nun hilang)', 
    rule: 'Madd Wajib Muttashil', 
    status: 'pending',
    mistakeInfo: 'Pelafalan: يَتَسَاءَلُ (Delesi huruf akhir نَ)' 
  },
  { arabic: 'عَنِ', transliteration: "'Ani", rule: 'Harf Jar', status: 'pending' },
  { arabic: 'النَّبَإِ', transliteration: 'An-Naba-i', rule: 'Al-Syamsiyyah', status: 'pending' },
  { arabic: 'الْعَظِيمِ', transliteration: "Al-'Azhiim", rule: "Madd 'Aridh Lissukun", status: 'pending' },
];

export default function HeroSandbox() {
  const [simulationMode, setSimulationMode] = useState<'accurate' | 'mistake'>('accurate');
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  const words = simulationMode === 'accurate' ? ACCURATE_WORDS : MISTAKE_SIMULATION_WORDS;
  const targetScore = simulationMode === 'accurate' ? 98.8 : 84.5;

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPlaying && !isCompleted) {
      timer = setTimeout(() => {
        if (currentWordIndex < words.length) {
          setCurrentWordIndex((prev) => prev + 1);
          const progressRatio = (currentWordIndex + 1) / words.length;
          setAccuracyScore(Math.round(progressRatio * targetScore * 10) / 10);
        } else {
          setIsCompleted(true);
          setIsPlaying(false);
        }
      }, 950);
    }

    return () => clearTimeout(timer);
  }, [isPlaying, currentWordIndex, isCompleted, words.length, targetScore]);

  const handleRestart = () => {
    setCurrentWordIndex(0);
    setAccuracyScore(0);
    setIsCompleted(false);
    setIsPlaying(true);
    setActiveTooltip(null);
  };

  const toggleMode = (mode: 'accurate' | 'mistake') => {
    setSimulationMode(mode);
    setCurrentWordIndex(0);
    setAccuracyScore(0);
    setIsCompleted(false);
    setIsPlaying(true);
    setActiveTooltip(null);
  };

  return (
    <InteractiveCard
      InteractiveColor="rgba(16, 185, 129, 0.28)"
      borderRadius="28px"
      rotationFactor={0.18}
      containerClassName="w-full max-w-xl mx-auto shadow-xl shadow-slate-200/50"
      className="p-5 sm:p-7 relative overflow-hidden"
    >
      {/* Top Banner Status Bar */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-2.5 w-2.5">
            {isPlaying && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPlaying ? 'bg-emerald-600' : 'bg-slate-400'}`} />
          </span>
          <span className="text-xs font-semibold text-slate-800 tracking-tight">
            {isPlaying ? 'Sedang Mengevaluasi Suara...' : isCompleted ? 'Evaluasi AI Selesai' : 'Simulasi Dijeda'}
          </span>
          <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-mono border border-slate-200">
            16 kHz Mono
          </span>
        </div>

        {/* Audio Waveform Visualization */}
        <div className="flex items-end space-x-1 h-5 px-2">
          {[40, 75, 55, 95, 60, 85, 45, 100, 65, 80, 50, 70].map((h, i) => (
            <span
              key={i}
              className={`w-0.5 rounded-full transition-all duration-300 ${
                isPlaying ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
              style={{
                height: isPlaying ? `${Math.max(20, (h * ((i + currentWordIndex) % 3 + 1)) / 3)}%` : '20%',
              }}
            />
          ))}
        </div>
      </div>

      {/* Recitation Info Header */}
      <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
        <div className="flex items-center space-x-1.5">
          <span className="font-semibold text-slate-800">QS. An-Naba' [78: 1-2]</span>
          <span className="text-slate-300">•</span>
          <span>Juz 'Amma</span>
        </div>

        {/* Simulation Scenario Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => toggleMode('accurate')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
              simulationMode === 'accurate'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tartil Standar
          </button>
          <button
            type="button"
            onClick={() => toggleMode('mistake')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
              simulationMode === 'mistake'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Uji Koreksi AI
          </button>
        </div>
      </div>

      {/* Interactive Quranic Sandbox Display (Amiri Quran) */}
      <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-5 sm:p-6 mb-5 text-center relative">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-4 font-quran text-3xl sm:text-4xl text-slate-800 select-none leading-loose" dir="rtl">
          {words.map((item, index) => {
            const isWordActive = index === currentWordIndex && isPlaying;
            const isWordEvaluated = index < currentWordIndex || isCompleted;
            const isMistake = simulationMode === 'mistake' && index === 1;

            let badgeClass = 'text-slate-400 bg-transparent';
            if (isWordActive) {
              badgeClass = 'text-emerald-900 bg-emerald-100/90 ring-2 ring-emerald-500/50 scale-105';
            } else if (isWordEvaluated) {
              if (isMistake) {
                badgeClass = 'text-rose-900 bg-rose-100 ring-1 ring-rose-400';
              } else {
                badgeClass = 'text-slate-900 bg-white shadow-xs border border-slate-200/60';
              }
            }

            return (
              <div key={index} className="relative inline-block group">
                <span
                  onMouseEnter={() => setActiveTooltip(index)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className={`inline-block px-3 py-1 rounded-xl cursor-pointer transition-all duration-300 ${badgeClass}`}
                >
                  {item.arabic}
                </span>

                {index === 1 && (
                  <span className="inline-block text-amber-600/80 mx-2 text-2xl font-sans" title="Akhir Ayat 1">
                    ۝١
                  </span>
                )}
                {index === 4 && (
                  <span className="inline-block text-amber-600/80 mx-2 text-2xl font-sans" title="Akhir Ayat 2">
                    ۝٢
                  </span>
                )}

                {(activeTooltip === index || isWordActive) && (
                  <div
                    className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white rounded-lg text-[11px] font-sans text-left shadow-xl pointer-events-none transition-all duration-200"
                    dir="ltr"
                  >
                    <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-700">
                      <span className="font-semibold text-emerald-400">{item.transliteration}</span>
                      {isMistake ? (
                        <span className="text-rose-400 font-medium text-[10px]">Perlu Koreksi</span>
                      ) : (
                        <span className="text-emerald-300 font-medium text-[10px]">Tepat</span>
                      )}
                    </div>
                    <p className="text-slate-300 text-[10px] leading-tight">
                      {item.mistakeInfo || `Kaidah: ${item.rule}`}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200/60 italic font-sans">
          "Tentang apakah mereka saling bertanya-tanya? Tentang berita yang besar (hari berbangkit)."
        </p>
      </div>

      {/* Live AI Metric Counters */}
      <div className="grid grid-cols-3 gap-3 mb-5 text-center font-sans">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="block text-[11px] text-slate-600 font-medium">Akurasi Kata</span>
          <span className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
            {accuracyScore}%
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="block text-[11px] text-slate-600 font-medium">Algoritma</span>
          <span className="text-base sm:text-lg font-bold text-slate-900">
            Levenshtein
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="block text-[11px] text-slate-600 font-medium">Jadwal SRS</span>
          <span className="text-base sm:text-lg font-bold text-emerald-700">
            {simulationMode === 'accurate' ? '+3 Hari' : '+1 Hari'}
          </span>
        </div>
      </div>

      {isCompleted && (
        <div
          className={`p-3 rounded-xl mb-5 flex items-center space-x-2.5 text-xs transition-all duration-300 ${
            simulationMode === 'accurate'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-amber-50 text-amber-900 border border-amber-200'
          }`}
        >
          {simulationMode === 'accurate' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <p className="leading-snug">
            {simulationMode === 'accurate'
              ? 'Hafalan sangat lancar dan makhraj tepat. Ayat ini diproyeksikan otomatis ke interval review 3 hari berikutnya.'
              : 'Terdeteksi 1 ketidaksesuaian fonetik pada ayat 1. Jadwal murojaah diatur besok pagi untuk memperkuat ingatan.'}
          </p>
        </div>
      )}

      {/* Interactive Controls Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600 font-sans">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium transition-all"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Jeda' : 'Lanjutkan'}</span>
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-all"
            title="Ulangi simulasi dari awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ulangi</span>
          </button>
        </div>

        <div className="flex items-center space-x-1 text-[11px] text-slate-600">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Privasi Suara Memory-Only</span>
        </div>
      </div>
    </InteractiveCard>
  );
}
