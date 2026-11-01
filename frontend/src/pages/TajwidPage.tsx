import { useState, useEffect } from 'react';
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
  Video,  AlertCircle,
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

// Animated Donut Chart Component with Counting Number Animation
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
  const radius = (size - strokeWidth) / 2; // 65
  const circumference = 2 * Math.PI * radius; // ≈ 408.4

  useEffect(() => {
    let start = 0;
    const target = Math.max(0, Math.min(100, Math.round(score)));
    const duration = 1200; // 1.2s smooth count-up
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic for natural slowing down
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
        {/* Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-white/20"
        />
        {/* Animated Progress Circle */}
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
      {/* Center Percentage Display */}
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

// Playful, Colorful, Interactive Appreciation Generator based on Score Tiers
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
        'Selamat atas pencapaian luar biasa ini! Seluruh butir kaidah tajwid pada modul ini Anda kuasai dengan sempurna tanpa ada kesalahan sedikitpun. Terus pertahankan ketelitian dan keistiqomahan membaca Al-Qur’an secara tartil.',
      icon: Award,
      iconBg: 'bg-emerald-500/30 text-amber-300 border-amber-300/40',
      borderColor: 'border-emerald-300/40',
      bgGradient: 'from-emerald-600 via-teal-600 to-green-700',
    };
  }
  if (percentage >= 70) {
    return {
      headline: 'Alhamdulillah, Berhasil Lulus KKM!',
      subheadline: `Status: Lulus KKM 70% • Nilai ${percentage}%`,
      description:
        'Alhamdulillah, pemahaman dasar kaidah tajwid Anda sudah memenuhi syarat kelulusan modul ini. Pelajari ulasan refleksi di bawah agar bacaan sehari-hari semakin mutqin dan percaya diri.',
      icon: CheckCircle2,
      iconBg: 'bg-teal-500/30 text-emerald-200 border-teal-300/40',
      borderColor: 'border-teal-300/40',
      bgGradient: 'from-teal-600 via-emerald-600 to-cyan-700',
    };
  }
  if (percentage >= 50) {
    return {
      headline: 'Sedikit Lagi Menuju Kelulusan!',
      subheadline: `Perlu Penguatan • Nilai ${percentage}%`,
      description:
        'Usaha yang sangat baik! Anda hanya selisih sedikit dari batas kelulusan 70%. Tinjau kembali kunci jawaban dan poin refleksi di bawah ini, lalu coba ulangi kuis untuk meraih hasil terbaik.',
      icon: AlertCircle,
      iconBg: 'bg-amber-500/30 text-amber-200 border-amber-300/40',
      borderColor: 'border-orange-300/40',
      bgGradient: 'from-amber-500 via-orange-500 to-amber-600',
    };
  }
  return {
    headline: 'Setiap Langkah Thalabul ‘Ilmi Bernilai Pahala',
    subheadline: 'Mari Ulangi Materi • Tetap Semangat',
    description:
      'Mempelajari ilmu tajwid memang memerlukan ketelatenan dan pembiasaan. Jangan berkecil hati, tonton kembali materi penjelasannya dan cermati ulasan kunci jawaban di bawah sebelum mencoba lagi ya!',
    icon: RotateCcw,
    iconBg: 'bg-rose-500/30 text-rose-200 border-rose-300/40',
    borderColor: 'border-rose-400/40',
    bgGradient: 'from-rose-600 via-red-600 to-pink-700',
  };
}

export default function TajwidPage() {
  // Initialize immediately from persistent storage so admin inputs NEVER wipe or reset
  const [modules, setModules] = useState<TajwidModule[]>(() => getStoredTajwidModules());
  const [activeModule, setActiveModule] = useState<TajwidModule | null>(null);

  // Active view tab in module: 'lesson' | 'quiz'
  const [activeTab, setActiveTab] = useState<'lesson' | 'quiz'>('lesson');

  // Interactive Card Quiz State (5 Questions Stepper)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [quizReview, setQuizReview] = useState<QuizSubmitResponse | null>(null);

  // Reflection review filter: 'all' | 'wrong' | 'correct'
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'correct'>('all');

  // Synchronize modules with backend while preserving all local admin uploads & edits
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
    };

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('hifzhly_tajwid_sync_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'TAJWID_UPDATED' && Array.isArray(event.data?.modules)) {
            setModules(event.data.modules);
          }
        };
      }
    } catch {}

    window.addEventListener(TAJWID_UPDATED_EVENT, handleTajwidUpdated);
    window.addEventListener('storage', handleStorage);
    return () => {
      isMounted = false;
      window.removeEventListener(TAJWID_UPDATED_EVENT, handleTajwidUpdated);
      window.removeEventListener('storage', handleStorage);
      channel?.close();
    };
  }, []);

  const handleOpenModule = async (mod: TajwidModule) => {
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
    if (quizReview) return; // Locked if already submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Submit quiz attempt (with reliable score calculation that NEVER bugs out to 0%)
  const handleSubmitQuiz = async () => {
    if (!activeModule?.quiz) return;
    const quiz = activeModule.quiz;

    // Check if any question remains unanswered
    const unanswered = quiz.questions.filter((q) => !selectedAnswers[q.id]);
    if (unanswered.length > 0) {
      const firstUnansweredIdx = quiz.questions.findIndex((q) => !selectedAnswers[q.id]);
      if (firstUnansweredIdx >= 0) {
        setCurrentQuestionIndex(firstUnansweredIdx);
      }
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

      // Combine backend evaluation with local truth keys so NO answers or points are lost
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

      // Trust accurately computed score over a false 0 from backend ID mismatch
      const finalScore =
        backendScore !== null && backendScore > 0 ? Math.round(backendScore) : computedScore;

      setQuizReview({
        quizId: quiz.id,
        attemptId,
        score: finalScore,
        totalQuestions: quiz.questions.length,
        correctAnswers: correctCount,
        passed: finalScore >= quiz.passingScore,
        passingScore: quiz.passingScore,
        completedAt: new Date().toISOString(),
        review: mappedReviews,
        reviews: mappedReviews,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryQuiz = () => {
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

  // Active Module View
  if (activeModule) {
    const quiz = activeModule.quiz;
    const currentQ = quiz?.questions[currentQuestionIndex];
    const totalQ = quiz?.questions.length || 0;
    const answeredCount = quiz ? quiz.questions.filter((q) => selectedAnswers[q.id]).length : 0;
    const isAllAnswered = quiz ? answeredCount === quiz.questions.length : false;

    // Review statistics and appreciation
    const finalScore = quizReview ? Math.round(quizReview.score) : 0;
    const appreciation = getAppreciationMessage(finalScore);
    const AppreciationIcon = appreciation.icon;
    const reviewList = quizReview?.review || quizReview?.reviews || [];
    const filteredReviewList = reviewList.filter((item) => {
      if (reviewFilter === 'wrong') return !item.isCorrect;
      if (reviewFilter === 'correct') return item.isCorrect;
      return true;
    });

    return (
      <div className="space-y-6">
        {/* Module Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setActiveModule(null)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-white text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
              title="Kembali ke Daftar Modul"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 block">
                Modul {activeModule.orderIndex} • Tajwid Academy
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {activeModule.title}
              </h2>
            </div>
          </div>

          {/* Module Mode Switcher */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('lesson')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'lesson'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Materi &amp; Video
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kuis Evaluasi Tajwid {quizReview && '• Hasil & Refleksi'}
            </button>
          </div>
        </div>

        {/* Tab 1: Lesson & Video */}
        {activeTab === 'lesson' && (
          <div className="space-y-6">
            {/* YouTube Embed Player or Prominent Cover Image */}
            {activeModule.youtubeVideoId ? (
              <div className="aspect-video w-full rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
                <iframe
                  src={`https://www.youtube.com/embed/${activeModule.youtubeVideoId}`}
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

            {/* Lesson Body Content */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-emerald-700" />
                <span>Rangkuman Kaidah Tajwid</span>
              </h3>

              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-sans">
                {activeModule.contentBody}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('quiz')}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <span>Mulai Uji Pemahaman di Kuis Tajwid</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Card Quiz & Post-Quiz Reflection Screen */}
        {activeTab === 'quiz' && quiz && (
          <div className="space-y-6">
            {/* Taking Quiz Mode: Interactive Stepper Card */}
            {!quizReview ? (
              <div className="max-w-3xl mx-auto space-y-5">
                {/* Stepper Header & Progress Bar */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 block">
                          Kuis Evaluasi Tajwid • 5 Soal Pemahaman
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
                          onClick={() => setCurrentQuestionIndex(idx)}
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

                {/* THE ACTIVE QUESTION CARD */}
                {currentQ && (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 transition-all animate-in fade-in duration-200">
                    <div className="space-y-2">
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
                        const optionLetter = String.fromCharCode(65 + optIdx); // A, B, C, D

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption(currentQ.id, opt.id)}
                            className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center space-x-3 cursor-pointer group ${
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
                        onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center space-x-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Sebelumnya</span>
                      </button>

                      {currentQuestionIndex < totalQ - 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentQuestionIndex((prev) => Math.min(totalQ - 1, prev + 1))
                          }
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

                    {/* Bottom Status Hint */}
                    {!isAllAnswered && (
                      <p className="text-[11px] text-slate-400 text-center font-medium">
                        Tersisa {totalQ - answeredCount} pertanyaan yang belum Anda jawab.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* POST-QUIZ REVIEW & COLORFUL PLAYFUL HERO REFLECTION SCREEN */
              <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
                {/* 1. Score & Playful Humanized Appreciation Canvas Card */}
                <div
                  className={`p-5 sm:p-7 rounded-3xl border shadow-xl bg-gradient-to-br ${appreciation.bgGradient} ${appreciation.borderColor} text-white space-y-5 animate-in zoom-in-95 fade-in duration-500`}
                >
                  <div className="flex flex-col-reverse sm:flex-row items-center sm:items-start justify-between gap-6">
                    <div className="space-y-3 text-center sm:text-left flex-1 w-full">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2.5 sm:space-y-0 sm:space-x-3.5">
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border shadow-inner backdrop-blur-md shrink-0 ${appreciation.iconBg}`}
                        >
                          <AppreciationIcon className="w-5 h-5 sm:w-6 sm:h-6" />
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

                    {/* Animated Donut Chart */}
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
                        Tinjau setiap butir pertanyaan untuk memahami mengapa jawaban tersebut benar dan di mana letak ketelitiannya.
                      </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setReviewFilter('all')}
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
                        onClick={() => setReviewFilter('correct')}
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
                        onClick={() => setReviewFilter('wrong')}
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
                  <div className="space-y-5 pt-1">
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
                          className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 space-y-4 bg-slate-50/50"
                        >
                          {/* Question Header & Verification Badge */}
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

                          {/* Selected Option vs Correct Option Cards */}
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

                          {/* Refleksi & Penjelasan Kaidah Tajwid */}
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

                  {/* 3. Action Buttons */}
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

  // Module Grid Overview (User View with prominent cover thumbnail)
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Tajwid Academy &amp; Evaluasi Teori
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pelajari kaidah hukum bacaan Al-Qur'an secara ilmiah melalui video panduan, teks rujukan, dan kuis interaktif berbobot.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((module) => (
          <div
            key={module.id}
            onClick={() => handleOpenModule(module)}
            className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
          >
            <div>
              {/* Cover Thumbnail Image */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-200/60 flex items-center justify-center">
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
                  <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-teal-900 flex flex-col items-center justify-center text-white/80 p-3 text-center">
                    <BookOpen className="w-8 h-8 text-emerald-300 mb-1" />
                    <span className="text-xs font-bold text-white tracking-wide">Tajwid Academy</span>
                  </div>
                )}
                <span className="absolute top-2.5 left-2.5 font-mono bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-lg text-[10px] font-bold">
                  Modul 0{module.orderIndex}
                </span>
                {module.youtubeVideoId && (
                  <span className="absolute top-2.5 right-2.5 bg-rose-600/90 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1">
                    <Video className="w-3 h-3" />
                    <span>Video</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                  Silabus Tajwid
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {module.quiz?.questions?.length || 5} Soal Kuis
                </span>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-1">
                {module.title}
              </h3>

              <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                {module.summary}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>KKM: {module.quiz?.passingScore || 70}%</span>
              </span>

              <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform">
                <span>Buka Materi</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      </div>
  );
}



