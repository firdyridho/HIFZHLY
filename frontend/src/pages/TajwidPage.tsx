import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Award,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  BookOpen,
  ArrowLeft,
  Info,
  Sparkles,
  Check,
  Video,
  AlertCircle,
  Download,
  Volume2,
  Search,
  GraduationCap,
  FileText,
  Layers,
  Square,
} from 'lucide-react';
import type {
  TajwidModule,
  QuizSubmitResponse,
  QuizQuestionReview,
} from '../types';
import {
  getStoredTajwidModules,
  fetchSynchronizedTajwidModules,
  TAJWID_UPDATED_EVENT,
  TAJWID_STORAGE_KEY,
  resolveQuestionCorrectAnswer,
} from '../lib/tajwidStore';
import {
  playSuccessChime,
  playClickTone,
  playCelebrationChime,
  playDengSound,
} from '../lib/soundUtils';
import {
  useQariPreference,
  getAyahAudioUrl,
  playManagedAudio,
  stopManagedAudio,
} from '../lib/qariPreferences';

// Local storage key for santri progress
const TAJWID_USER_PROGRESS_KEY = 'hifzhly_tajwid_user_progress';

interface ModuleProgressData {
  bestScore: number;
  passed: boolean;
  completedAt: string;
}

// Curated Arabic Letter Matrices and Verses by Module Slug
interface TajwidRuleDetail {
  arabicSymbol: string;
  category: string;
  letters: { group: string; letters: string; note: string }[];
  examples: {
    verseArabic: string;
    surahInfo: string;
    surahNumber: number;
    ayahNumber: number;
    tajwidType: string;
    caraBaca: string;
  }[];
}

const TAJWID_CURATED_DETAILS: Record<string, TajwidRuleDetail> = {
  'hukum-nun-sukun-dan-tanwin': {
    arabicSymbol: 'نْ / ــًــٍــٌ',
    category: 'Nun & Tanwin',
    letters: [
      { group: 'Idzhar Halqi (6 Huruf)', letters: 'ء ، هـ ، ع ، ح ، غ ، خ', note: 'Jelas tanpa dengung dari tenggorokan' },
      { group: 'Idgham Bighunnah (4 Huruf)', letters: 'ي ، ن ، م ، و', note: 'Melebur disertai dengung 2 harakat' },
      { group: 'Idgham Bilaghunnah (2 Huruf)', letters: 'ل ، ر', note: 'Melebur murni tanpa dengung' },
      { group: 'Iqlab (1 Huruf)', letters: 'ب', note: 'Ditukar menjadi bunyi mim samar berghunnah' },
      { group: 'Ikhfa Haqiqi (15 Huruf)', letters: 'ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك', note: 'Samar-samar antara idzhar dan idgham' },
    ],
    examples: [
      {
        verseArabic: 'مَن يَقُولُ ءَامَنَّا',
        surahInfo: 'QS. Al-Baqarah: 8',
        surahNumber: 2,
        ayahNumber: 8,
        tajwidType: 'Idgham Bighunnah',
        caraBaca: 'Nun sukun melebur ke huruf Ya dengan dengung 2 harakat (Mayyaquulu).',
      },
      {
        verseArabic: 'مِن بَعْدِ مَا جَآءَتْهُمُ',
        surahInfo: 'QS. Al-Baqarah: 213',
        surahNumber: 2,
        ayahNumber: 213,
        tajwidType: 'Iqlab',
        caraBaca: 'Nun sukun ditukar menjadi bunyi Mim dengan rongga bibir rapat halus berghunnah (Mimba\'di).',
      },
      {
        verseArabic: 'فَمَنْ خَفَّتْ مَوَازِينُهُ',
        surahInfo: 'QS. Al-Mu\'minun: 103',
        surahNumber: 23,
        ayahNumber: 103,
        tajwidType: 'Idzhar Halqi',
        caraBaca: 'Nun sukun dibaca terang dan tegas tanpa ditahan/didengungkan saat bertemu Kha (Man khaffat).',
      },
    ],
  },
  'hukum-mim-sukun': {
    arabicSymbol: 'مْ',
    category: 'Mim Sukun',
    letters: [
      { group: 'Ikhfa Syafawi (1 Huruf)', letters: 'ب', note: 'Bibir dirapatkan samar disertai ghunnah' },
      { group: 'Idgham Mimi / Mitslain (1 Huruf)', letters: 'م', note: 'Memasukkan mim ke mim berikutnya dengan dengung' },
      { group: 'Idzhar Syafawi (26 Huruf)', letters: 'Seluruh huruf hijaiyah selain ب dan م', note: 'Jelas di bibir tanpa dengung' },
    ],
    examples: [
      {
        verseArabic: 'تَرْمِيهِم بِحِجَارَةٍ',
        surahInfo: 'QS. Al-Fil: 4',
        surahNumber: 105,
        ayahNumber: 4,
        tajwidType: 'Ikhfa Syafawi',
        caraBaca: 'Mim sukun bertemu Ba dibaca samar di kedua bibir dengan dengung (Tarmiihim bihijaarah).',
      },
      {
        verseArabic: 'لَهُم مَّا يَشَآءُونَ',
        surahInfo: 'QS. Qaf: 35',
        surahNumber: 50,
        ayahNumber: 35,
        tajwidType: 'Idgham Mimi',
        caraBaca: 'Mim sukun melebur utuh ke Mim berharakat di depannya dengan ghunnah 2 harakat (Lahumma yasyaa\'uun).',
      },
      {
        verseArabic: 'أَلَمْ تَرَ كَيْفَ فَعَلَ',
        surahInfo: 'QS. Al-Fil: 1',
        surahNumber: 105,
        ayahNumber: 1,
        tajwidType: 'Idzhar Syafawi',
        caraBaca: 'Mim sukun bertemu Ta dibaca jelas tanpa jeda maupun dengung (Alam tara).',
      },
    ],
  },
  'hukum-mad': {
    arabicSymbol: 'آ / ــَـا / ــُـوْ / ــِـيْ',
    category: 'Hukum Mad',
    letters: [
      { group: 'Huruf Mad Asli (3 Huruf)', letters: 'ا (setelah fathah) ، و (setelah dhammah) ، ي (setelah kasrah)', note: 'Dipanjangkan 2 harakat (1 alif)' },
      { group: 'Mad Wajib Muttashil', letters: 'Mad + Hamzah dalam satu kata', note: 'Dipanjangkan 4 s/d 5 harakat' },
      { group: 'Mad Jaiz Munfashil', letters: 'Mad + Hamzah di kata terpisah', note: 'Boleh 2, 4, atau 5 harakat' },
      { group: 'Mad Lazim', letters: 'Mad bertemu sukun asli / tasydid', note: 'Wajib 6 harakat penuh' },
    ],
    examples: [
      {
        verseArabic: 'إِذَا جَآءَ نَصْرُ اللَّهِ',
        surahInfo: 'QS. An-Nasr: 1',
        surahNumber: 110,
        ayahNumber: 1,
        tajwidType: 'Mad Wajib Muttashil',
        caraBaca: 'Huruf mad bertemu hamzah dalam kata جَآءَ wajib dipanjangkan 4-5 harakat saat washal.',
      },
      {
        verseArabic: 'إِنَّآ أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ',
        surahInfo: 'QS. Al-Qadr: 1',
        surahNumber: 97,
        ayahNumber: 1,
        tajwidType: 'Mad Jaiz Munfashil',
        caraBaca: 'Kata إِنَّآ terpisah dengan أَنزَلْنَاهُ, dibaca panjang 4-5 harakat riwayat Hafsh.',
      },
      {
        verseArabic: 'وَلَا الضَّآلِّينَ',
        surahInfo: 'QS. Al-Fatihah: 7',
        surahNumber: 1,
        ayahNumber: 7,
        tajwidType: 'Mad Lazim Kilmi Mutsaqqal',
        caraBaca: 'Mad bertemu huruf bertasydid (Lam), wajib dipanjangkan 6 harakat dengan tekanan (nabr).',
      },
    ],
  },
  'hukum-qalqalah': {
    arabicSymbol: 'ق ط ب ج د',
    category: 'Qalqalah',
    letters: [
      { group: 'Huruf Qalqalah (5 Huruf)', letters: 'ق ، ط ، ب ، ج ، د (Baju Di Toko)', note: 'Bunyi pantulan makhraj saat sukun atau waqaf' },
      { group: 'Qalqalah Sughra', letters: 'Sukun asli di tengah kata', note: 'Pantulan ringan mengalir' },
      { group: 'Qalqalah Kubra', letters: 'Sukun karena waqaf di akhir ayat', note: 'Pantulan kuat dan tegas' },
      { group: 'Qalqalah Akbar', letters: 'Huruf qalqalah bertasydid saat waqaf', note: 'Pantulan paling kuat setelah penekanan' },
    ],
    examples: [
      {
        verseArabic: 'لَقَدْ خَلَقْنَا الْإِنسَانَ',
        surahInfo: 'QS. At-Tin: 4',
        surahNumber: 95,
        ayahNumber: 4,
        tajwidType: 'Qalqalah Sughra',
        caraBaca: 'Huruf Dal (دْ) dan Qaf (قْ) sukun di tengah kalimat dipantulkan ringan tanpa memutus nafas.',
      },
      {
        verseArabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        surahInfo: 'QS. Al-Ikhlas: 1',
        surahNumber: 112,
        ayahNumber: 1,
        tajwidType: 'Qalqalah Kubra',
        caraBaca: 'Huruf Dal di akhir ayat dihentikan (waqaf) sehingga terpantul secara jelas dan tebal (Ahad).',
      },
      {
        verseArabic: 'تَبَّتْ يَدَآ أَبِي لَهَبٍ وَتَبَّ',
        surahInfo: 'QS. Al-Lahab: 1',
        surahNumber: 111,
        ayahNumber: 1,
        tajwidType: 'Qalqalah Akbar',
        caraBaca: 'Huruf Ba bertasydid saat waqaf ditahan sesaat (nabr) lalu dipantulkan dengan getaran mantap.',
      },
    ],
  },
  'makharijul-huruf': {
    arabicSymbol: 'مَخَارِجُ الْحُرُوفِ',
    category: 'Makhraj',
    letters: [
      { group: 'Al-Jauf (Rongga Mulut & Tenggorokan)', letters: 'Huruf mad (ا ، و ، ي)', note: 'Udara lepas mengalir bebas' },
      { group: 'Al-Halq (Tenggorokan)', letters: 'ء هـ (bawah) ، ع ح (tengah) ، غ خ (atas)', note: 'Makhraj tenggorokan' },
      { group: 'Al-Lisan (Lidah - 18 Huruf)', letters: 'ق ك ج ش ي ض ل ن ر ط د ت ص ز س ظ ذ ث', note: 'Pangkal, tepi, hingga ujung lidah' },
      { group: 'Asy-Syafatain (Dua Bibir)', letters: 'ف ، ب ، م ، و', note: 'Pertemuan dua bibir' },
      { group: 'Al-Khaisyum (Pangkal Hidung)', letters: 'Ghunnah (dengung nun & mim)', note: 'Dengung suara dari hidung' },
    ],
    examples: [
      {
        verseArabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        surahInfo: 'QS. Al-Fatihah: 2',
        surahNumber: 1,
        ayahNumber: 2,
        tajwidType: 'Makhraj Al-Halq (Huruf Ha & \'Ain)',
        caraBaca: 'Huruf Ha (ح) dan \'Ain (ع) keluar tepat dari tengah tenggorokan (wasathul halq) dengan bersih.',
      },
    ],
  },
};

// Fallback rule detail for dynamically uploaded admin modules
function getRuleDetail(mod: TajwidModule): TajwidRuleDetail {
  if (TAJWID_CURATED_DETAILS[mod.slug]) {
    return TAJWID_CURATED_DETAILS[mod.slug];
  }
  // Search partial slug match
  for (const key of Object.keys(TAJWID_CURATED_DETAILS)) {
    if (mod.slug.includes(key) || key.includes(mod.slug)) {
      return TAJWID_CURATED_DETAILS[key];
    }
  }
  return {
    arabicSymbol: 'تَجْوِيدٌ',
    category: 'Kaidah Tajwid',
    letters: [
      {
        group: 'Kaidah Inti Modul Ini',
        letters: mod.title,
        note: mod.summary || 'Pelajari materi dan contoh penerapannya dalam Al-Qur\'an.',
      },
    ],
    examples: [],
  };
}

// Animated Donut Chart Component
function ScoreDonutChart({
  score,
  correct,
  total,
}: {
  score: number;
  correct: number;
  total: number;
}) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    let start = 0;
    const target = Math.max(0, Math.min(100, Math.round(score)));
    const duration = 1200;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(start + (target - start) * easeProgress);
      setAnimatedScore(val);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    const animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [score]);

  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-28 h-28 sm:w-36 sm:h-36 transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-white/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-white transition-all duration-100 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
        <span className="text-2xl sm:text-3xl font-black font-mono leading-none tracking-tight">
          {animatedScore}%
        </span>
        <span className="text-[10px] font-bold text-white/80 mt-1 uppercase tracking-wider">
          {correct}/{total} Benar
        </span>
      </div>
    </div>
  );
}

// Scholarly Appreciation Generator based on score tiers (Zero emoji)
function getAppreciationMessage(percentage: number): {
  headline: string;
  subheadline: string;
  description: string;
  icon: typeof Award;
  iconBg: string;
  borderColor: string;
  bgGradient: string;
} {
  if (percentage === 100) {
    return {
      headline: 'Masya Allah, Mumtaz!',
      subheadline: 'Pemahaman Sempurna (100%)',
      description:
        'Alhamdulillah, seluruh butir kaidah tajwid pada modul ini Anda kuasai dengan sempurna. Pertahankan ketelitian dan keistiqomahan membaca Al-Qur’an secara tartil.',
      icon: Award,
      iconBg: 'bg-emerald-500/30 text-amber-300 border-amber-300/40',
      borderColor: 'border-emerald-300/40',
      bgGradient: 'from-emerald-700 via-teal-700 to-green-800',
    };
  }
  if (percentage >= 70) {
    return {
      headline: 'Alhamdulillah, Lulus KKM!',
      subheadline: `Status: Lulus KKM 70% • Nilai ${percentage}%`,
      description:
        'Pemahaman dasar kaidah tajwid Anda telah memenuhi syarat kelulusan modul ini. Cermati ulasan ilmiah di bawah agar bacaan sehari-hari semakin mutqin.',
      icon: CheckCircle2,
      iconBg: 'bg-teal-500/30 text-emerald-200 border-teal-300/40',
      borderColor: 'border-teal-300/40',
      bgGradient: 'from-teal-700 via-emerald-700 to-cyan-800',
    };
  }
  if (percentage >= 50) {
    return {
      headline: 'Sedikit Lagi Menuju Kelulusan!',
      subheadline: `Perlu Penguatan • Nilai ${percentage}%`,
      description:
        'Usaha yang sangat baik! Anda hanya selisih sedikit dari batas kelulusan 70%. Tinjau kunci jawaban dan syarah penjelasan di bawah, lalu ulangi kuis untuk hasil terbaik.',
      icon: AlertCircle,
      iconBg: 'bg-amber-500/30 text-amber-200 border-amber-300/40',
      borderColor: 'border-orange-300/40',
      bgGradient: 'from-amber-600 via-orange-600 to-amber-700',
    };
  }
  return {
    headline: 'Setiap Langkah Tholabul ‘Ilmi Bernilai Pahala',
    subheadline: 'Mari Ulangi Materi • Tetap Semangat',
    description:
      'Mempelajari ilmu tajwid memerlukan ketelatenan dan pembiasaan makhraj. Pelajari kembali materi penjelasannya dan cermati ulasan kunci jawaban di bawah sebelum mencoba lagi.',
    icon: RotateCcw,
    iconBg: 'bg-rose-500/30 text-rose-200 border-rose-300/40',
    borderColor: 'border-rose-400/40',
    bgGradient: 'from-rose-700 via-red-700 to-pink-800',
  };
}

export default function TajwidPage() {
  const [modules, setModules] = useState<TajwidModule[]>(() => getStoredTajwidModules());
  const [activeModule, setActiveModule] = useState<TajwidModule | null>(null);

  // Active view tab in module: 'lesson' | 'examples' | 'quiz'
  const [activeTab, setActiveTab] = useState<'lesson' | 'examples' | 'quiz'>('lesson');

  // Search & Category Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Santri progress store: Record<moduleId, ModuleProgressData>
  const [userProgress, setUserProgress] = useState<Record<string, ModuleProgressData>>(() => {
    try {
      const saved = localStorage.getItem(TAJWID_USER_PROGRESS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Interactive Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [quizReview, setQuizReview] = useState<QuizSubmitResponse | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'correct'>('all');

  // Interactive Qari Audio playback state for example verses
  const { qariId: selectedQari, qariOption: activeQariOption } = useQariPreference();
  const [playingExampleIndex, setPlayingExampleIndex] = useState<number | null>(null);
  const [loadingExampleIndex, setLoadingExampleIndex] = useState<number | null>(null);
  const [audioExampleError, setAudioExampleError] = useState('');
  const exampleAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopExampleAudio = () => {
    stopManagedAudio(exampleAudioRef);
    setPlayingExampleIndex(null);
    setLoadingExampleIndex(null);
  };

  useEffect(() => {
    stopExampleAudio();
    setAudioExampleError('');
  }, [selectedQari, activeTab, activeModule?.id]);

  useEffect(() => {
    return () => {
      stopManagedAudio(exampleAudioRef);
    };
  }, []);

  // Synchronize modules with backend & cross-tab events
  useEffect(() => {
    let isMounted = true;
    fetchSynchronizedTajwidModules().then((synced) => {
      if (isMounted && Array.isArray(synced) && synced.length > 0) {
        setModules(synced);
      }
    });

    const handleTajwidUpdated = (e: any) => {
      if (Array.isArray(e.detail) && e.detail.length > 0) {
        setModules(e.detail);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === TAJWID_STORAGE_KEY) {
        setModules(getStoredTajwidModules());
      }
      if (e.key === TAJWID_USER_PROGRESS_KEY && e.newValue) {
        try {
          setUserProgress(JSON.parse(e.newValue));
        } catch {}
      }
    };

    window.addEventListener(TAJWID_UPDATED_EVENT, handleTajwidUpdated);
    window.addEventListener('storage', handleStorage);
    return () => {
      isMounted = false;
      window.removeEventListener(TAJWID_UPDATED_EVENT, handleTajwidUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Save santri progress helper
  const saveProgress = (moduleId: string, score: number, passed: boolean) => {
    setUserProgress((prev) => {
      const existing = prev[moduleId];
      const newBest = existing ? Math.max(existing.bestScore, score) : score;
      const updated = {
        ...prev,
        [moduleId]: {
          bestScore: newBest,
          passed: passed || (existing ? existing.passed : false),
          completedAt: new Date().toISOString(),
        },
      };
      try {
        localStorage.setItem(TAJWID_USER_PROGRESS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Overall Santri Stats
  const stats = useMemo(() => {
    const totalModules = modules.length;
    let completedCount = 0;
    let totalScore = 0;
    let attemptsCount = 0;

    modules.forEach((mod) => {
      const prog = userProgress[mod.id];
      if (prog && prog.passed) {
        completedCount++;
      }
      if (prog) {
        totalScore += prog.bestScore;
        attemptsCount++;
      }
    });

    const avgScore = attemptsCount > 0 ? Math.round(totalScore / attemptsCount) : 0;
    const completionPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

    return { totalModules, completedCount, avgScore, completionPercent };
  }, [modules, userProgress]);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set<string>();
    modules.forEach((m) => {
      const detail = getRuleDetail(m);
      if (detail.category) cats.add(detail.category);
    });
    return Array.from(cats);
  }, [modules]);

  // Filtered modules
  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      const matchesSearch =
        searchQuery === '' ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.summary && m.summary.toLowerCase().includes(searchQuery.toLowerCase()));

      const detail = getRuleDetail(m);
      const matchesCategory =
        selectedCategory === 'all' || detail.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [modules, searchQuery, selectedCategory]);

  const handleOpenModule = async (mod: TajwidModule) => {
    playClickTone();
    setActiveTab('lesson');
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizReview(null);
    setReviewFilter('all');

    try {
      const res = await fetch(`/api/v1/tajwid/modules/${mod.slug}`);
      if (res.ok) {
        const data = await res.json();
        const serverMod = data.module || data;
        const serverQuiz = data.quiz || serverMod.quiz;

        setActiveModule({
          ...mod,
          ...serverMod,
          thumbnailUrl: serverMod.thumbnailUrl || mod.thumbnailUrl,
          contentBody: serverMod.contentBody || mod.contentBody,
          quiz: serverQuiz || mod.quiz,
        });
        return;
      }
    } catch {
      // Backend unavailable; use local module
    }

    setActiveModule(mod);
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (quizReview) return;
    playClickTone();
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeModule?.quiz) return;
    const quiz = activeModule.quiz;

    const unanswered = quiz.questions.filter((q) => !selectedAnswers[q.id]);
    if (unanswered.length > 0) {
      const firstUnansweredIdx = quiz.questions.findIndex((q) => !selectedAnswers[q.id]);
      if (firstUnansweredIdx >= 0) {
        setCurrentQuestionIndex(firstUnansweredIdx);
      }
      playDengSound();
      alert(`Mohon lengkapi seluruh ${quiz.questions.length} butir pertanyaan kuis.`);
      return;
    }

    setIsSubmitting(true);
    const answersPayload = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: selectedAnswers[q.id],
    }));

    try {
      let backendReviews: any[] = [];
      let backendScore: number | null = null;
      let attemptId = `attempt-${Date.now()}`;

      try {
        const token = localStorage.getItem('hifzhly_auth_token') || localStorage.getItem('token');
        const res = await fetch(`/api/v1/tajwid/quizzes/${quiz.id}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ answers: answersPayload }),
        });

        if (res.ok) {
          const data = await res.json();
          backendReviews = data.reviews || data.review || [];
          if (typeof data.score === 'number') backendScore = data.score;
          if (data.attemptId) attemptId = data.attemptId;
        }
      } catch (networkErr) {
        console.warn('Backend submit unavailable, evaluating locally:', networkErr);
      }

      const mappedReviews: QuizQuestionReview[] = quiz.questions.map((q) => {
        const userChoiceId = selectedAnswers[q.id];
        const backendItem = backendReviews.find((r) => r.questionId === q.id);
        const resolved = resolveQuestionCorrectAnswer(q, userChoiceId, backendItem);

        return {
          questionId: q.id,
          questionText: q.questionText,
          selectedOptionId: userChoiceId,
          correctOptionId: resolved.correctOptionId,
          isCorrect: resolved.isCorrect,
          explanation: resolved.explanation,
        };
      });

      const correctCount = mappedReviews.filter((r) => r.isCorrect).length;
      const computedScore =
        quiz.questions.length > 0
          ? Math.round((correctCount / quiz.questions.length) * 100)
          : 0;

      const finalScore =
        backendScore !== null && backendScore > 0 ? Math.round(backendScore) : computedScore;
      const isPassed = finalScore >= quiz.passingScore;

      setQuizReview({
        quizId: quiz.id,
        attemptId,
        score: finalScore,
        totalQuestions: quiz.questions.length,
        correctAnswers: correctCount,
        passed: isPassed,
        passingScore: quiz.passingScore,
        completedAt: new Date().toISOString(),
        review: mappedReviews,
        reviews: mappedReviews,
      });

      // Save santri best score
      saveProgress(activeModule.id, finalScore, isPassed);

      // Audio feedback
      if (finalScore === 100) {
        playCelebrationChime();
      } else if (isPassed) {
        playSuccessChime();
      } else {
        playDengSound();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryQuiz = () => {
    playClickTone();
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setQuizReview(null);
    setReviewFilter('all');
  };

  const handleNextModule = () => {
    if (!activeModule) return;
    const currentIndex = modules.findIndex((m) => m.id === activeModule.id);
    const nextIndex = (currentIndex + 1) % modules.length;
    handleOpenModule(modules[nextIndex]);
  };

  const handleToggleExampleAudio = (
    index: number,
    surahNumber: number,
    ayahNumber: number
  ) => {
    setAudioExampleError('');

    if (playingExampleIndex === index || loadingExampleIndex === index) {
      stopExampleAudio();
      return;
    }

    stopExampleAudio();

    const audioUrl = getAyahAudioUrl(surahNumber, ayahNumber, selectedQari);
    setLoadingExampleIndex(index);
    playManagedAudio(exampleAudioRef, audioUrl, {
      onPlaying: () => {
        setLoadingExampleIndex(null);
        setPlayingExampleIndex(index);
      },
      onEnded: () => {
        setPlayingExampleIndex(null);
        setLoadingExampleIndex(null);
      },
      onError: () => {
        setPlayingExampleIndex(null);
        setLoadingExampleIndex(null);
        setAudioExampleError(
          `Gagal memutar audio contoh ayat (${activeQariOption.name}). Periksa koneksi internet Anda.`
        );
      },
    });
  };

  // ==========================================
  // VIEW: INSIDE ACTIVE MODULE
  // ==========================================
  if (activeModule) {
    const quiz = activeModule.quiz;
    const currentQ = quiz?.questions[currentQuestionIndex];
    const totalQ = quiz?.questions.length || 0;
    const answeredCount = quiz ? quiz.questions.filter((q) => selectedAnswers[q.id]).length : 0;
    const isAllAnswered = quiz ? answeredCount === quiz.questions.length : false;

    const finalScore = quizReview ? Math.round(quizReview.score) : 0;
    const appreciation = getAppreciationMessage(finalScore);
    const AppreciationIcon = appreciation.icon;
    const reviewList = quizReview?.review || quizReview?.reviews || [];
    const filteredReviewList = reviewList.filter((item) => {
      if (reviewFilter === 'wrong') return !item.isCorrect;
      if (reviewFilter === 'correct') return item.isCorrect;
      return true;
    });

    const ruleDetail = getRuleDetail(activeModule);
    const activeModuleProgress = userProgress[activeModule.id];

    return (
      <div className="space-y-6">
        {/* Module Header Bar with Breadcrumbs & Score Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => {
                playClickTone();
                setActiveModule(null);
              }}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
              title="Kembali ke Silabus Tajwid"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800">
                  Modul 0{activeModule.orderIndex} • {ruleDetail.category}
                </span>
                {activeModuleProgress && activeModuleProgress.passed && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    <span>Lulus ({activeModuleProgress.bestScore}%)</span>
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {activeModule.title}
              </h2>
            </div>
          </div>

          {/* Module Sub-tabs: Lesson, Kaidah & Contoh, Quiz */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                playClickTone();
                setActiveTab('lesson');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'lesson'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Materi &amp; Video</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playClickTone();
                setActiveTab('examples');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'examples'
                  ? 'bg-white text-emerald-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kaidah &amp; Ayat Tartil</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playClickTone();
                setActiveTab('quiz');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'quiz'
                  ? 'bg-white text-emerald-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>
                Kuis Evaluasi {quizReview && `(${finalScore}%)`}
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: MATERI & VIDEO PEMBELAJARAN */}
        {activeTab === 'lesson' && (
          <div className="space-y-6">
            {/* Video Player or Cover Presentation */}
            {activeModule.youtubeVideoId ? (
              <div className="aspect-video w-full rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-950 relative">
                <iframe
                  src={`https://www.youtube.com/embed/${activeModule.youtubeVideoId}?rel=0`}
                  title={activeModule.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            ) : activeModule.thumbnailUrl ? (
              <div className="aspect-video w-full rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative">
                <img
                  src={activeModule.thumbnailUrl}
                  alt={activeModule.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            {/* Official PDF Document Card if uploaded in Admin */}
            {activeModule.pdfUrl && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Dokumen Silabus &amp; Diktat Tajwid Resmi
                    </h4>
                    <p className="text-xs text-slate-600">
                      Unduh naskah panduan rujukan materi kaidah tajwid berformat PDF.
                    </p>
                  </div>
                </div>
                <a
                  href={activeModule.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 font-bold text-xs shadow-2xs transition-all self-start sm:self-auto cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Unduh Diktat PDF</span>
                </a>
              </div>
            )}

            {/* Structured Text Content */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-emerald-700" />
                  <span>Rangkuman Kaidah &amp; Sanad Teori</span>
                </h3>
                <span className="text-xs font-mono font-bold text-slate-400">
                  Riwayat Imam ‘Ashim Thariq Asy-Syathibiyyah
                </span>
              </div>

              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-sans space-y-2">
                {activeModule.contentBody || activeModule.summary}
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playClickTone();
                    setActiveTab('examples');
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <span>Lihat Matriks Huruf &amp; Contoh Ayat</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClickTone();
                    setActiveTab('quiz');
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Mulai Uji Pemahaman di Kuis Tajwid</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KAIDAH & CONTOH AYAT TARTIL */}
        {activeTab === 'examples' && (
          <div className="space-y-6">
            {/* Visual Hijaiyah Matrix Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-emerald-700" />
                    <span>Matriks Huruf Hijaiyah &amp; Pembagian Hukum</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rujukan cepat huruf-huruf hijaiyah yang terlibat dalam bab ini beserta makhraj artikulasinya.
                  </p>
                </div>
                <div className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs font-mono self-start sm:self-auto">
                  {ruleDetail.arabicSymbol}
                </div>
              </div>

              {/* Group Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ruleDetail.letters.map((grp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-emerald-300 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 font-sans">
                        {grp.group}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-center font-quran text-2xl text-emerald-950 font-bold tracking-wider select-text shadow-2xs">
                      {grp.letters}
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                      {grp.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Quranic Verses Practice */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-emerald-700" />
                    <span>Contoh Potongan Ayat Al-Qur'an &amp; Kaidah Tartil</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Perhatikan lafadz dan dengarkan pelafalan ayat di bawah untuk melatih makhraj Anda.
                  </p>
                </div>
                <span className="text-[11px] font-medium text-slate-500 self-start sm:self-auto shrink-0">
                  Qari: <strong className="text-slate-700">{activeQariOption.name}</strong>
                </span>
              </div>

              {audioExampleError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{audioExampleError}</span>
                </div>
              )}

              <div className="space-y-4">
                {ruleDetail.examples.length > 0 ? (
                  ruleDetail.examples.map((ex, idx) => {
                    const isPlaying = playingExampleIndex === idx;
                    const isLoading = loadingExampleIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-emerald-50/20 transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 text-xs font-bold font-sans">
                              {ex.tajwidType}
                            </span>
                            <span className="text-xs font-mono font-semibold text-slate-500">
                              {ex.surahInfo}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleExampleAudio(idx, ex.surahNumber, ex.ayahNumber)}
                            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all self-start sm:self-auto cursor-pointer shadow-2xs ${
                              isPlaying
                                ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-white border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300'
                            }`}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                                <span>Memuat...</span>
                              </>
                            ) : isPlaying ? (
                              <>
                                <Square className="w-3 h-3 fill-white" />
                                <span>Hentikan</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Dengar Contoh</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Large Crisp Arabic Calligraphy Card */}
                        <div className="py-3 px-4 rounded-xl bg-white border border-emerald-100/90 shadow-2xs text-right">
                          <span className="font-quran text-2xl sm:text-3xl font-bold text-slate-900 leading-loose tracking-wide">
                            {ex.verseArabic}
                          </span>
                        </div>

                        {/* Pronunciation Explanation */}
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                          <strong className="text-slate-900">Cara Membaca: </strong>
                          {ex.caraBaca}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    Materi contoh potongan ayat untuk bab ini dapat Anda pelajari langsung melalui ringkasan silabus di atas.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    playClickTone();
                    setActiveTab('quiz');
                  }}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Siap Lanjut ke Kuis Evaluasi (5 Soal)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KUIS EVALUASI TAJWID */}
        {activeTab === 'quiz' && quiz && (
          <div className="space-y-6">
            {!quizReview ? (
              <div className="max-w-3xl mx-auto space-y-5">
                {/* Stepper Header & Progress Indicator */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                        <Award className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 block">
                          Kuis Tajwid • 5 Butir Pemahaman
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                          {quiz.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-start sm:self-auto">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                        Soal {currentQuestionIndex + 1} / {totalQ}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
                        KKM: {quiz.passingScore}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Progres Pengerjaan</span>
                      <span>
                        {answeredCount} dari {totalQ} terjawab ({Math.round((answeredCount / totalQ) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                        style={{ width: `${(answeredCount / totalQ) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Question Selector Strip */}
                  <div className="flex items-center justify-between pt-1 gap-1.5 overflow-x-auto pb-1">
                    {quiz.questions.map((q, idx) => {
                      const isAnswered = Boolean(selectedAnswers[q.id]);
                      const isCurrent = idx === currentQuestionIndex;

                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => {
                            playClickTone();
                            setCurrentQuestionIndex(idx);
                          }}
                          className={`flex-1 min-w-[50px] py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer border ${
                            isCurrent
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : isAnswered
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span>{idx + 1}</span>
                          {isAnswered && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ACTIVE QUESTION CARD */}
                {currentQ && (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 transition-all">
                    <div className="space-y-3">
                      <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Pertanyaan Nomor {currentQuestionIndex + 1}
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {currentQ.questionText}
                      </h4>
                    </div>

                    {/* Options Stack (A, B, C, D) */}
                    <div className="space-y-3">
                      {currentQ.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[currentQ.id] === opt.id;
                        const optionLetter = String.fromCharCode(65 + optIdx);

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption(currentQ.id, opt.id)}
                            className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center space-x-3.5 cursor-pointer group ${
                              isSelected
                                ? 'bg-emerald-50/90 border-emerald-600 text-slate-900 ring-2 ring-emerald-600/20 shadow-xs'
                                : 'bg-white border-slate-200/90 text-slate-700 hover:border-emerald-300 hover:bg-slate-50/60'
                            }`}
                          >
                            <span
                              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800'
                              }`}
                            >
                              {optionLetter}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold flex-1 leading-relaxed">
                              {opt.optionText}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Card Navigation Controls */}
                    <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          playClickTone();
                          setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                        }}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center space-x-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Sebelumnya</span>
                      </button>

                      {currentQuestionIndex < totalQ - 1 ? (
                        <button
                          type="button"
                          onClick={() => {
                            playClickTone();
                            setCurrentQuestionIndex((prev) => Math.min(totalQ - 1, prev + 1));
                          }}
                          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                        >
                          <span>Selanjutnya</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmitQuiz}
                          disabled={isSubmitting || !isAllAnswered}
                          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-60 disabled:pointer-events-none flex items-center space-x-2 cursor-pointer"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Mengevaluasi Kuis...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Selesaikan &amp; Buka Refleksi</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {!isAllAnswered && (
                      <p className="text-[11px] text-slate-400 text-center font-medium">
                        Tersisa {totalQ - answeredCount} butir pertanyaan yang belum Anda pilih jawabannya.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* POST-QUIZ REFLECTION SCREEN */
              <div className="max-w-3xl mx-auto space-y-6">
                {/* 1. Score & Humanized Appreciation Card */}
                <div
                  className={`p-6 sm:p-8 rounded-3xl border shadow-xl bg-gradient-to-br ${appreciation.bgGradient} ${appreciation.borderColor} text-white space-y-5`}
                >
                  <div className="flex flex-col-reverse sm:flex-row items-center sm:items-start justify-between gap-6">
                    <div className="space-y-3 text-center sm:text-left flex-1 w-full">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2.5 sm:space-y-0 sm:space-x-3.5">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner backdrop-blur-md shrink-0 ${appreciation.iconBg}`}
                        >
                          <AppreciationIcon className="w-6 h-6" />
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                            {appreciation.headline}
                          </h3>
                          <p className="text-xs sm:text-sm font-semibold text-white/90">
                            {appreciation.subheadline}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-xl pt-1">
                        {appreciation.description}
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20 shadow-inner shrink-0">
                      <ScoreDonutChart
                        score={finalScore}
                        correct={quizReview.correctAnswers}
                        total={quizReview.totalQuestions}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Review Filter & Heading */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                        <Info className="w-4 h-4 text-emerald-700" />
                        <span>Review Jawaban &amp; Refleksi Ilmiah Tajwid</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tinjau setiap butir soal untuk memahami kaidah yang mendasari kebenaran jawabannya.
                      </p>
                    </div>

                    <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          playClickTone();
                          setReviewFilter('all');
                        }}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          reviewFilter === 'all'
                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Semua ({reviewList.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playClickTone();
                          setReviewFilter('correct');
                        }}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          reviewFilter === 'correct'
                            ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Benar ({quizReview.correctAnswers})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playClickTone();
                          setReviewFilter('wrong');
                        }}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          reviewFilter === 'wrong'
                            ? 'bg-white text-rose-800 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Salah ({quizReview.totalQuestions - quizReview.correctAnswers})
                      </button>
                    </div>
                  </div>

                  {/* Question Review Items List */}
                  <div className="space-y-4 pt-1">
                    {filteredReviewList.map((item, idx) => {
                      const questionObj = quiz.questions.find((q) => q.id === item.questionId);
                      const selectedOptObj = questionObj?.options.find(
                        (o) => o.id === item.selectedOptionId
                      );
                      const correctOptObj =
                        questionObj?.options.find((o) => o.id === item.correctOptionId) ||
                        (item.isCorrect ? selectedOptObj : undefined);

                      return (
                        <div
                          key={item.questionId}
                          className="p-5 rounded-2xl border border-slate-200/90 space-y-3.5 bg-slate-50/50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start space-x-2.5">
                              <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <h5 className="text-sm font-bold text-slate-900 leading-snug">
                                {item.questionText}
                              </h5>
                            </div>

                            <span
                              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${
                                item.isCorrect
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {item.isCorrect ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Benar</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-rose-700" />
                                  <span>Kurang Tepat</span>
                                </>
                              )}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div
                              className={`p-3.5 rounded-xl border ${
                                item.isCorrect
                                  ? 'bg-emerald-50/40 border-emerald-200'
                                  : 'bg-rose-50/50 border-rose-200'
                              }`}
                            >
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Jawaban Anda:
                              </span>
                              <span
                                className={`font-bold text-xs sm:text-sm block ${
                                  item.isCorrect ? 'text-emerald-800' : 'text-rose-800'
                                }`}
                              >
                                {selectedOptObj?.optionText || 'Tidak dijawab'}
                              </span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-white border border-emerald-200/90 shadow-2xs">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Kunci Jawaban Resmi:
                              </span>
                              <span className="font-bold text-xs sm:text-sm text-emerald-800 block">
                                {item.isCorrect
                                  ? selectedOptObj?.optionText || correctOptObj?.optionText || '-'
                                  : correctOptObj?.optionText || '-'}
                              </span>
                            </div>
                          </div>

                          {/* Refleksi & Penjelasan Kaidah */}
                          <div className="p-4 rounded-2xl bg-teal-50/90 border border-teal-200 text-xs text-teal-950 space-y-1.5 font-sans">
                            <span className="font-bold text-teal-900 flex items-center space-x-1.5 text-xs">
                              <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
                              <span>Refleksi Ilmiah: Mengapa Jawaban Ini Benar?</span>
                            </span>
                            <p className="text-teal-950 leading-relaxed pl-5">
                              {item.explanation}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleRetryQuiz}
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-500" />
                      <span>Ulangi Kuis Ini</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextModule}
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Lanjut ke Modul Berikutnya</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: MAIN OVERVIEW & SILABUS JOURNEY
  // ==========================================
  return (
    <div className="space-y-6">
      {/* 1. Scholarly Hero Banner & Learning Journey Stats */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white border border-emerald-800/40 shadow-xl relative overflow-hidden">
        {/* Decorative Islamic Background Pattern */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-4 right-8 font-quran text-7xl text-emerald-400/10 select-none pointer-events-none hidden sm:block">
          وَرَتِّلِ الْقُرْءَانَ تَرْتِيلًا
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold font-mono tracking-wider uppercase">
                Tajwid Academy &amp; Tahsin Sanad
              </span>
              <span className="text-xs text-emerald-200/80 font-medium hidden sm:inline">
                • Riwayat Hafsh ‘An ‘Ashim
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Kurikulum Kaidah Tilawah Al-Qur'an
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-sans">
              Pelajari hukum bacaan Al-Qur'an secara ilmiah dan menyenangkan melalui video kajian asatidz, visualisasi matriks huruf hijaiyah, dan kuis uji pemahaman bersanad.
            </p>
          </div>

          {/* KPI Santri Learning Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="flex items-center space-x-2 text-emerald-300 mb-1">
                <GraduationCap className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Modul Tuntas</span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono">
                {stats.completedCount} <span className="text-xs text-white/60 font-sans">/ {stats.totalModules} Bab</span>
              </div>
              <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionPercent}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="flex items-center space-x-2 text-amber-300 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Rata-Rata Nilai</span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono">
                {stats.avgScore > 0 ? `${stats.avgScore}%` : '-'}
              </div>
              <span className="text-[10px] text-white/70 block mt-1">
                {stats.avgScore >= 85 ? 'Predikat: Mumtaz' : stats.avgScore >= 70 ? 'Predikat: Jayyid' : 'Target: KKM 70%'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 col-span-2 sm:col-span-1">
              <div className="flex items-center space-x-2 text-teal-300 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Standar KKM</span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono">
                70% <span className="text-xs text-white/60 font-sans">Minimal Lulus</span>
              </div>
              <span className="text-[10px] text-white/70 block mt-1">
                Evaluasi 5 Soal per Bab
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => {
              playClickTone();
              setSelectedCategory('all');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            Semua Bab ({modules.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                playClickTone();
                setSelectedCategory(cat);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kaidah atau bab..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>

      {/* 3. Modules Grid (Revamped & Rich) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModules.map((module) => {
          const detail = getRuleDetail(module);
          const prog = userProgress[module.id];
          const isPassed = prog && prog.passed;

          return (
            <div
              key={module.id}
              onClick={() => handleOpenModule(module)}
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer group relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className={`h-1.5 absolute top-0 left-0 right-0 ${isPassed ? 'bg-emerald-500' : 'bg-slate-200 group-hover:bg-emerald-400'} transition-colors`} />

              <div>
                {/* Cover Thumbnail Image */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 mb-4 border border-slate-200/60 flex items-center justify-center">
                  {module.thumbnailUrl || module.youtubeVideoId ? (
                    <img
                      src={
                        module.thumbnailUrl ||
                        `https://img.youtube.com/vi/${module.youtubeVideoId}/hqdefault.jpg`
                      }
                      alt={module.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (
                          module.youtubeVideoId &&
                          target.src !== `https://img.youtube.com/vi/${module.youtubeVideoId}/hqdefault.jpg`
                        ) {
                          target.src = `https://img.youtube.com/vi/${module.youtubeVideoId}/hqdefault.jpg`;
                        } else {
                          target.style.display = 'none';
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-teal-950 flex flex-col items-center justify-center text-white/80 p-3 text-center">
                      <BookOpen className="w-8 h-8 text-emerald-300 mb-1" />
                      <span className="text-xs font-bold text-white tracking-wide">Tajwid Academy</span>
                    </div>
                  )}

                  {/* Badges on Thumbnail */}
                  <span className="absolute top-2.5 left-2.5 font-mono bg-slate-900/85 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-lg text-[10px] font-bold">
                    Modul 0{module.orderIndex}
                  </span>

                  {module.youtubeVideoId && (
                    <span className="absolute top-2.5 right-2.5 bg-rose-600/90 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1">
                      <Video className="w-3 h-3" />
                      <span>Video</span>
                    </span>
                  )}

                  {/* Arabic Watermark Symbol inside thumbnail */}
                  <div className="absolute bottom-2 right-2.5 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md text-emerald-300 font-quran text-sm font-bold">
                    {detail.arabicSymbol}
                  </div>
                </div>

                {/* Status & Category Info */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                    {detail.category}
                  </span>

                  {prog ? (
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isPassed
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {isPassed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>Skor {prog.bestScore}%</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-amber-700" />
                          <span>Ulangi ({prog.bestScore}%)</span>
                        </>
                      )}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">
                      Belum Diuji
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-1">
                  {module.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {module.summary}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{module.quiz?.questions?.length || 5} Soal Evaluasi</span>
                </span>

                <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold group-hover:translate-x-1 transition-transform">
                  <span>Pelajari Materi</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">
            Tidak ada modul tajwid yang sesuai
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian Anda atau kembalikan filter kategori ke "Semua Bab".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            Reset Pencarian
          </button>
        </div>
      )}
    </div>
  );
}
