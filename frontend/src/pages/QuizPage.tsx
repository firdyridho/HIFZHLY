import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Medal,
  Award,
  ArrowLeft,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  HelpCircle,
  Check,
  ChevronRight,
  Send,
  RefreshCw,
  Flame,
} from 'lucide-react';

interface QuestionItem {
  id: number;
  promptArab: string;
  questionText: string;
  options: {
    id: string;
    text: string;
    isArabic?: boolean;
    surahName?: string;
    ayahNumber?: number;
  }[];
  correctOptionId: string;
  explanation: string;
  surahName: string;
  ayahNumber: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  fullName: string;
  totalScore: number;
  gamesPlayed: number;
  highestScore: number;
}

// Koleksi data ayat representatif dari Juz 1 sampai Juz 30 untuk generator soal mandiri offline & online
const SAMPLE_AYAH_CORPUS = [
  // Juz 1
  { juz: 1, surahNum: 1, surahName: 'Al-Fatihah', ayahNum: 2, arab: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ', nextArab: 'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ' },
  { juz: 1, surahNum: 2, surahName: 'Al-Baqarah', ayahNum: 5, arab: 'أُو۟لَـٰٓئِكَ عَلَىٰ هُدًۭى مِّن رَّبِّهِمْ ۖ وَأُو۟لَـٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ', nextArab: 'إِنَّ ٱلَّذِينَ كَفَرُوا۟ سَوَآءٌ عَلَيْهِمْ' },
  { juz: 1, surahNum: 2, surahName: 'Al-Baqarah', ayahNum: 21, arab: 'يَـٰٓأَيُّهَا ٱلنَّاسُ ٱعْبُدُوا۟ رَبَّكُمُ ٱلَّذِى خَلَقَكُمْ وَٱلَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ', nextArab: 'ٱلَّذِى جَعَلَ لَكُمُ ٱلْأَرْضَ فِرَٰشًۭا' },

  // Juz 2
  { juz: 2, surahNum: 2, surahName: 'Al-Baqarah', ayahNum: 153, arab: 'يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّـٰبِرِينَ', nextArab: 'وَلَا تَقُولُوا۟ لِمَن يُقْتَلُ فِى سَبِيلِ ٱللَّهِ أَمْوَٰتٌۢ' },
  { juz: 2, surahNum: 2, surahName: 'Al-Baqarah', ayahNum: 183, arab: 'يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ كُتِبَ عَلَيْكُمُ ٱلصِّيَامُ كَمَا كُتِبَ عَلَى ٱلَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ', nextArab: 'أَيَّامًۭا مَّعْدُودَٰتٍۢ' },

  // Juz 3
  { juz: 3, surahNum: 2, surahName: 'Al-Baqarah', ayahNum: 255, arab: 'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌۭ وَلَا نَوْمٌۭ', nextArab: 'لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ' },
  { juz: 3, surahNum: 3, surahName: "Ali 'Imran", ayahNum: 18, arab: 'شَهِدَ ٱللَّهُ أَنَّهُۥ لَآ إِلَـٰهَ إِلَّا هُوَ وَٱلْمَلَـٰٓئِكَةُ وَأُو۟لُوا۟ ٱلْعِلْمِ قَآئِمًۢا بِٱلْقِسْطِ', nextArab: 'إِنَّ ٱلدِّينَ عِندَ ٱللَّهِ ٱلْإِسْلَـٰمُ' },

  // Juz 29
  { juz: 29, surahNum: 67, surahName: 'Al-Mulk', ayahNum: 1, arab: 'تَبَـٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍۢ قَدِيرٌ', nextArab: 'ٱلَّذِى خَلَقَ ٱلْمَوْتَ وَٱلْحَيَوٰةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًۭا' },
  { juz: 29, surahNum: 67, surahName: 'Al-Mulk', ayahNum: 13, arab: 'وَأَسِرُّوا۟ قَوْلَكُمْ أَوِ ٱجْهَرُوا۟ بِهِۦٓ ۖ إِنَّهُۥ عَلِيمٌۢ بِذَاتِ ٱلصُّدُورِ', nextArab: 'أَلَا يَعْلَمُ مَنْ خَلَقَ وَهُوَ ٱللَّطِيفُ ٱلْخَبِيرُ' },
  { juz: 29, surahNum: 71, surahName: 'Nuh', ayahNum: 10, arab: 'فَقُلْتُ ٱسْتَغْفِرُوا۟ رَبَّكُمْ إِنَّهُۥ كَانَ غَفَّارًۭا', nextArab: 'يُرْسِلِ ٱلسَّمَآءَ عَلَيْكُم مِّدْرَارًۭا' },

  // Juz 30
  { juz: 30, surahNum: 78, surahName: 'An-Naba', ayahNum: 1, arab: 'عَمَّ يَتَسَآءَلُونَ', nextArab: 'عَنِ ٱلنَّبَإِ ٱلْعَظِيمِ' },
  { juz: 30, surahNum: 87, surahName: "Al-A'la", ayahNum: 1, arab: 'سَبِّحِ ٱسْمَ رَبِّكَ ٱلْأَعْلَى', nextArab: 'ٱلَّذِى خَلَقَ فَسَوَّىٰ' },
  { juz: 30, surahNum: 93, surahName: 'Ad-Duha', ayahNum: 3, arab: 'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ', nextArab: 'وَلَلْـَٔاخِرَةُ خَيْرٌۭ لَّكَ مِنَ ٱلْأُولَىٰ' },
  { juz: 30, surahNum: 94, surahName: 'Asy-Syarh', ayahNum: 5, arab: 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا', nextArab: 'إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا' },
  { juz: 30, surahNum: 97, surahName: 'Al-Qadr', ayahNum: 1, arab: 'إِنَّآ أَنزَلْنَـٰهُ فِى لَيْلَةِ ٱلْقَدْرِ', nextArab: 'وَمَآ أَدْرَىٰكَ مَا لَيْلَةُ ٱلْقَدْرِ' },
  { juz: 30, surahNum: 112, surahName: 'Al-Ikhlas', ayahNum: 1, arab: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ', nextArab: 'ٱللَّهُ ٱلصَّمَدُ' },
  { juz: 30, surahNum: 113, surahName: 'Al-Falaq', ayahNum: 1, arab: 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ', nextArab: 'مِن شَرِّ مَا خَلَقَ' },
  { juz: 30, surahNum: 114, surahName: 'An-Nas', ayahNum: 1, arab: 'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ', nextArab: 'مَلِكِ ٱلنَّاسِ' },
];

export default function QuizPage() {
  const token = localStorage.getItem('hifzhly_auth_token');

  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'quiz' | 'leaderboard'>('quiz');

  // Game Configuration State
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'completed'>('setup');
  const [quizMode, setQuizMode] = useState<'guess_surah_ayah' | 'continue_verse'>('guess_surah_ayah');
  const [juzStart, setJuzStart] = useState<number>(30);
  const [juzEnd, setJuzEnd] = useState<number>(30);
  const [totalQuestionsConfig, setTotalQuestionsConfig] = useState<number>(10);

  // Gameplay State
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(25);
  const timerRef = useRef<any>(null);

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState<boolean>(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState<boolean>(false);
  const [scoreSubmitted, setScoreSubmitted] = useState<boolean>(false);

  // Load Leaderboard on Tab Change
  useEffect(() => {
    if (activeTab === 'leaderboard') {
      loadLeaderboard();
    }
  }, [activeTab]);

  const loadLeaderboard = () => {
    setLeaderboardLoading(true);
    fetch('/api/v1/quiz/leaderboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      })
      .catch((err) => console.warn('Gagal memuat leaderboard:', err))
      .finally(() => setLeaderboardLoading(false));
  };

  // Timer per Soal
  useEffect(() => {
    if (gameState === 'playing' && !isAnswerSubmitted) {
      setTimeLeft(25);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [gameState, currentQuestionIndex, isAnswerSubmitted]);

  const handleTimeExpired = () => {
    setIsAnswerSubmitted(true);
    setSelectedOptionId('TIME_OUT');
  };

  // Generator Paket Soal Dinamis
  const generateQuizQuestions = () => {
    const minJuz = Math.min(juzStart, juzEnd);
    const maxJuz = Math.max(juzStart, juzEnd);

    // Filter corpus sesuai rentang juz yang ditentukan
    let eligible = SAMPLE_AYAH_CORPUS.filter((a) => a.juz >= minJuz && a.juz <= maxJuz);
    if (eligible.length < 4) {
      eligible = SAMPLE_AYAH_CORPUS; // Fallback jika rentang sempit
    }

    // Acak corpus
    const shuffled = [...eligible].sort(() => 0.5 - Math.random());
    const count = Math.min(totalQuestionsConfig, shuffled.length);
    const generated: QuestionItem[] = [];

    for (let i = 0; i < count; i++) {
      const target = shuffled[i];

      if (quizMode === 'guess_surah_ayah') {
        // MODE 1: Tebak Nama Surah & Nomor Ayat
        const correctOptId = `opt-${target.surahNum}-${target.ayahNum}`;
        const correctText = `QS. ${target.surahName} [${target.surahNum}] : Ayat ${target.ayahNum}`;

        // Cari 3 pengecoh acak dari corpus lain
        const distractors = SAMPLE_AYAH_CORPUS.filter(
          (c) => !(c.surahNum === target.surahNum && c.ayahNum === target.ayahNum)
        )
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .map((d) => ({
            id: `opt-${d.surahNum}-${d.ayahNum}`,
            text: `QS. ${d.surahName} [${d.surahNum}] : Ayat ${d.ayahNum}`,
            isArabic: false,
          }));

        const options = [...distractors, { id: correctOptId, text: correctText, isArabic: false }].sort(
          () => 0.5 - Math.random()
        );

        generated.push({
          id: i + 1,
          promptArab: target.arab,
          questionText: 'Potongan ayat berikut ini termaktub dalam surah dan ayat apa?',
          options,
          correctOptionId: correctOptId,
          explanation: `Ayat tersebut merupakan bagian dari QS. ${target.surahName} ayat ke-${target.ayahNum}.`,
          surahName: target.surahName,
          ayahNumber: target.ayahNum,
        });
      } else {
        // MODE 2: Sambung / Lanjut Ayat
        const correctOptId = `next-${target.surahNum}-${target.ayahNum}`;
        const correctText = target.nextArab;

        // Ambil pengecoh potongan ayat berikutnya dari ayat lain
        const distractors = SAMPLE_AYAH_CORPUS.filter(
          (c) => !(c.surahNum === target.surahNum && c.ayahNum === target.ayahNum)
        )
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .map((d) => ({
            id: `next-${d.surahNum}-${d.ayahNum}`,
            text: d.nextArab,
            isArabic: true,
          }));

        const options = [...distractors, { id: correctOptId, text: correctText, isArabic: true }].sort(
          () => 0.5 - Math.random()
        );

        generated.push({
          id: i + 1,
          promptArab: target.arab,
          questionText: 'Manakah kelanjutan ayat yang benar dari potongan kalamullah di atas?',
          options,
          correctOptionId: correctOptId,
          explanation: `Lanjutan ayat yang benar adalah: "${target.nextArab}" (QS. ${target.surahName}: ${target.ayahNum + 1}).`,
          surahName: target.surahName,
          ayahNumber: target.ayahNum,
        });
      }
    }

    return generated;
  };

  const handleStartGame = () => {
    const list = generateQuizQuestions();
    setQuestions(list);
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setCorrectAnswersCount(0);
    setScoreSubmitted(false);
    setGameState('playing');
  };

  const handleSelectOption = (optId: string) => {
    if (isAnswerSubmitted) return;
    clearInterval(timerRef.current);
    setSelectedOptionId(optId);
    setIsAnswerSubmitted(true);

    const currentQ = questions[currentQuestionIndex];
    if (optId === currentQ.correctOptionId) {
      // Poin dasar 100 + bonus sisa waktu hingga 50 poin
      const bonus = Math.floor((timeLeft / 25) * 50);
      const points = 100 + bonus;
      setScore((prev) => prev + points);
      setCorrectAnswersCount((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    } else {
      setGameState('completed');
    }
  };

  // Submit Hasil Kuis ke Server untuk Masuk Top 10 Bulanan
  const handleSubmitScore = async () => {
    if (scoreSubmitted || !token) return;
    setIsSubmittingScore(true);

    try {
      const res = await fetch('/api/v1/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mode: quizMode,
          juzStart: Math.min(juzStart, juzEnd),
          juzEnd: Math.max(juzStart, juzEnd),
          totalQuestions: questions.length,
          correctAnswers: correctAnswersCount,
          score,
        }),
      });

      if (res.ok) {
        setScoreSubmitted(true);
        loadLeaderboard();
      }
    } catch (err) {
      console.warn('Gagal submit skor:', err);
    } finally {
      setIsSubmittingScore(false);
    }
  };

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/app/dashboard"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-800" />
              <span>Kuis & Asah Retensi Al-Qur'an</span>
            </h1>
            <p className="text-xs text-slate-500">
              Uji ketepatan hafalan, sambung ayat, dan tebak nama surah dengan klasemen bulanan
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Permainan Kuis</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Top 10 Bulanan</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PERMAINAN KUIS                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'quiz' && (
        <div>
          {/* FLOW A: SETUP SCREEN */}
          {gameState === 'setup' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-slate-900">Konfigurasi Sesi Kuis</h2>
                <p className="text-xs text-slate-500">Tentukan mode, rentang juz, dan jumlah soal sebelum memulai</p>
              </div>

              {/* Mode Selection */}
              <div className="space-y-2 text-xs">
                <label className="font-semibold text-slate-700 block">Pilih Mode Permainan</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setQuizMode('guess_surah_ayah')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer space-y-1 ${
                      quizMode === 'guess_surah_ayah'
                        ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">1. Tebak Surah & Ayat</span>
                      {quizMode === 'guess_surah_ayah' && <Check className="w-4 h-4 text-emerald-700" />}
                    </div>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      Diberikan potongan ayat Al-Qur'an, tentukan nama surah dan nomor ayat yang tepat.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuizMode('continue_verse')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer space-y-1 ${
                      quizMode === 'continue_verse'
                        ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">2. Sambung / Lanjut Ayat</span>
                      {quizMode === 'continue_verse' && <Check className="w-4 h-4 text-emerald-700" />}
                    </div>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      Diberikan potongan ayat pembuka, pilih lanjutan ayat berikutnya yang tepat dalam bahasa Arab.
                    </p>
                  </button>
                </div>
              </div>

              {/* Juz Range Selection */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Rentang Juz Soal</label>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    Juz {Math.min(juzStart, juzEnd)} s/d Juz {Math.max(juzStart, juzEnd)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500">Mulai dari Juz:</span>
                    <select
                      value={juzStart}
                      onChange={(e) => setJuzStart(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                        <option key={j} value={j}>
                          Juz {j}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500">Sampai dengan Juz:</span>
                    <select
                      value={juzEnd}
                      onChange={(e) => setJuzEnd(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                        <option key={j} value={j}>
                          Juz {j}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Number of Questions */}
              <div className="space-y-2 text-xs">
                <label className="font-semibold text-slate-700 block">Jumlah Soal</label>
                <div className="grid grid-cols-4 gap-2.5">
                  {[5, 10, 15, 20].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setTotalQuestionsConfig(count)}
                      className={`py-2 rounded-xl font-bold border transition cursor-pointer ${
                        totalQuestionsConfig === count
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {count} Soal
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleStartGame}
                  className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Mulai Kuis Sekarang</span>
                </button>
              </div>
            </div>
          )}

          {/* FLOW B: PLAYING SCREEN */}
          {gameState === 'playing' && currentQ && (
            <div className="space-y-4">
              {/* Progress & Live Header */}
              <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Soal {currentQuestionIndex + 1} dari {questions.length}
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {quizMode === 'guess_surah_ayah' ? 'Tebak Surah & Ayat' : 'Sambung Ayat'}
                  </p>
                </div>

                {/* Timer Bar & Counter */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 font-mono font-bold text-slate-800">
                    <Clock className={`w-3.5 h-3.5 ${timeLeft <= 5 ? 'text-rose-600 animate-pulse' : 'text-slate-500'}`} />
                    <span className={timeLeft <= 5 ? 'text-rose-600' : ''}>{timeLeft}s</span>
                  </div>

                  <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>{score} Poin</span>
                  </div>
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
                <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-700" />
                  <span>{currentQ.questionText}</span>
                </p>

                {/* Arabic Prompt Card */}
                <div className="p-6 rounded-2xl bg-[#FFFDF8] border-2 border-amber-200/60 text-center shadow-inner">
                  <p className="font-quran text-2xl sm:text-3xl text-slate-900 leading-[2.2]" dir="rtl">
                    {currentQ.promptArab}
                  </p>
                </div>

                {/* Multiple Choice Options (4 Choices) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {currentQ.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    const isCorrect = opt.id === currentQ.correctOptionId;

                    let btnStyle = 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50';

                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/30';
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-500/20';
                      } else {
                        btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(opt.id)}
                        disabled={isAnswerSubmitted}
                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${btnStyle}`}
                      >
                        <span
                          className={`flex-1 font-semibold leading-relaxed ${
                            opt.isArabic ? 'font-quran text-lg text-right' : 'text-xs'
                          }`}
                          dir={opt.isArabic ? 'rtl' : 'ltr'}
                        >
                          {opt.text}
                        </span>

                        {isAnswerSubmitted && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                        )}
                        {isAnswerSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Answer Feedback & Advance Button */}
                {isAnswerSubmitted && (
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                    <div className="space-y-0.5 text-xs">
                      <p
                        className={`font-bold flex items-center gap-1.5 ${
                          selectedOptionId === currentQ.correctOptionId
                            ? 'text-emerald-700'
                            : 'text-rose-600'
                        }`}
                      >
                        {selectedOptionId === currentQ.correctOptionId ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Jawaban Tepat!
                          </>
                        ) : selectedOptionId === 'TIME_OUT' ? (
                          <>
                            <Clock className="w-4 h-4" /> Waktu Habis!
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" /> Kurang Tepat
                          </>
                        )}
                      </p>
                      <p className="text-slate-500 text-[11px]">{currentQ.explanation}</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 self-end sm:self-auto shrink-0 shadow-xs"
                    >
                      <span>{currentQuestionIndex < questions.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil Akhir'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FLOW C: COMPLETED / SCORE RESULTS SCREEN */}
          {gameState === 'completed' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
                <Trophy className="w-8 h-8 text-amber-500" />
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Sesi Kuis Selesai!</h2>
                <p className="text-xs text-slate-500">
                  Alhamdulillah, berikut adalah hasil evaluasi ketepatan daya ingat Al-Qur'an Anda
                </p>
              </div>

              {/* Score Highlight Box */}
              <div className="p-5 rounded-2xl bg-[#FFFDF8] border-2 border-amber-200/70 space-y-2">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Total Skor Diperoleh</span>
                <p className="text-4xl font-black font-mono text-emerald-900">{score}</p>
                <div className="flex items-center justify-center gap-4 pt-2 text-xs text-slate-600 border-t border-amber-200/50">
                  <span>
                    Benar: <strong>{correctAnswersCount}</strong> / {questions.length}
                  </span>
                  <span>•</span>
                  <span>
                    Akurasi: <strong>{Math.round((correctAnswersCount / questions.length) * 100)}%</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {!scoreSubmitted ? (
                  <button
                    type="button"
                    onClick={handleSubmitScore}
                    disabled={isSubmittingScore}
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-2xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    {isSubmittingScore ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Simpan Skor ke Klasemen Top 10 Bulanan</span>
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Skor Anda telah berhasil dicatat pada Klasemen Bulan Ini!</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleStartGame}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Main Lagi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGameState('setup');
                      setActiveTab('leaderboard');
                    }}
                    className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>Lihat Klasemen</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TOP 10 KLASEMEN BULANAN                                            */}
      {/* ========================================================================= */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Papan Peringkat Santri Teratas Bulan Ini</span>
              </h2>
              <p className="text-xs text-slate-500">
                Nilai akumulasi diperbarui setiap Anda bermain dan otomatis di-reset setiap awal bulan baru
              </p>
            </div>

            <button
              type="button"
              onClick={loadLeaderboard}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer self-start sm:self-auto"
              title="Perbarui Klasemen"
            >
              <RefreshCw className={`w-4 h-4 ${leaderboardLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {leaderboardLoading ? (
            <div className="py-16 text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-emerald-700 animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Memuat peringkat santri teratas...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Belum Ada Skor Bulan Ini</h3>
              <p className="text-xs text-slate-400">
                Jadilah yang pertama bermain kuis dan menempati posisi puncak klasemen bulan ini!
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('quiz');
                  setGameState('setup');
                }}
                className="mt-3 px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Mulai Kuis Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry) => {
                let rankBadge = (
                  <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-mono font-bold text-xs">
                    {entry.rank}
                  </span>
                );

                if (entry.rank === 1) {
                  rankBadge = (
                    <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-amber-600" />
                    </span>
                  );
                } else if (entry.rank === 2) {
                  rankBadge = (
                    <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center">
                      <Medal className="w-4 h-4 text-slate-600" />
                    </span>
                  );
                } else if (entry.rank === 3) {
                  rankBadge = (
                    <span className="w-7 h-7 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center">
                      <Award className="w-4 h-4 text-amber-700" />
                    </span>
                  );
                }

                return (
                  <div
                    key={entry.userId}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between text-xs ${
                      entry.rank <= 3
                        ? 'bg-emerald-50/30 border-emerald-200/80'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {rankBadge}
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{entry.fullName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">@{entry.username} • {entry.gamesPlayed} kali main</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold font-mono text-emerald-900 text-sm">{entry.totalScore} Poin</p>
                      <p className="text-[10px] text-slate-400">Tertinggi: {entry.highestScore}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

