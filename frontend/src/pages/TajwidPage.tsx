import { useState, useEffect } from 'react';
import {
  Award,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  BookOpen,
  ArrowLeft,
  Info,
} from 'lucide-react';
import type {
  TajwidModule,
  QuizSubmitResponse,
} from '../types';

// Fallback comprehensive modules & quizzes
const FALLBACK_MODULES: TajwidModule[] = [
  {
    id: '1d8b5a04-9426-47b8-b4b3-d2a93ff7ef21',
    title: 'Hukum Nun Sukun dan Tanwin',
    slug: 'hukum-nun-sukun-dan-tanwin',
    summary: 'Mempelajari 4 kaidah hukum: Idzhar Halqi, Idgham, Ikhfa Haqiqi, dan Iqlab.',
    youtubeVideoId: '7kK84x4_uY8',
    orderIndex: 1,
    contentBody: `Nun sukun (نْ) atau tanwin (ـًـٍـٌ) apabila bertemu dengan salah satu huruf hijaiyah memiliki 4 ketentuan hukum bacaan:
1. **Idzhar Halqi**: Dibaca jelas tanpa mendengung jika bertemu 6 huruf halq (ء، هـ، ع، ح، غ، خ).
2. **Idgham**: Dibaca melebur. Terbagi menjadi *Bighunnah* (berdengung pada huruf ي، ن، م، و) dan *Bilaghunnah* (tanpa dengung pada huruf ل، ر).
3. **Iqlab**: Menukar bunyi nun/tanwin menjadi mim (م) disertai dengung 2 harakat saat bertemu huruf Ba (ب).
4. **Ikhfa Haqiqi**: Dibaca samar-samar antara idzhar dan idgham disertai dengung jika bertemu 15 huruf ikhfa.`,
    quiz: {
      id: '8f1a2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
      title: 'Kuis Evaluasi Nun Sukun & Tanwin',
      description: 'Jawablah 3 soal pilihan ganda berikut untuk menguji pemahaman kaidah tajwid Anda.',
      passingScore: 70,
      questions: [
        {
          id: 'q1-uuid-001',
          questionText: 'Jika nun sukun (نْ) bertemu dengan huruf Ba (ب), hukum bacaannya adalah...',
          orderIndex: 1,
          options: [
            { id: 'opt-1', optionText: 'Idzhar Halqi' },
            { id: 'opt-2', optionText: 'Iqlab' },
            { id: 'opt-3', optionText: 'Idgham Bilaghunnah' },
            { id: 'opt-4', optionText: 'Ikhfa Haqiqi' },
          ],
        },
        {
          id: 'q1-uuid-002',
          questionText: 'Pada lafal مَن يَقُولُ, hukum tajwid yang berlaku pada nun sukun bertemu Ya adalah...',
          orderIndex: 2,
          options: [
            { id: 'opt-21', optionText: 'Idgham Bighunnah' },
            { id: 'opt-22', optionText: 'Idgham Bilaghunnah' },
            { id: 'opt-23', optionText: 'Idzhar Halqi' },
            { id: 'opt-24', optionText: 'Iqlab' },
          ],
        },
        {
          id: 'q1-uuid-003',
          questionText: 'Berapakah jumlah huruf Idzhar Halqi yang keluar dari tenggorokan?',
          orderIndex: 3,
          options: [
            { id: 'opt-31', optionText: '4 Huruf' },
            { id: 'opt-32', optionText: '5 Huruf' },
            { id: 'opt-33', optionText: '6 Huruf (ء، هـ، ع، ح، غ، خ)' },
            { id: 'opt-34', optionText: '15 Huruf' },
          ],
        },
      ],
    },
  },
  {
    id: '2b7c4d1e-8f3a-5b9c-0d2e-4f6a8b1c3d5e',
    title: 'Hukum Mim Sukun (Al-Ahkam Al-Mimiyah)',
    slug: 'hukum-mim-sukun',
    summary: 'Mempelajari 3 hukum: Ikhfa Syafawi, Idgham Mimi, dan Idzhar Syafawi.',
    youtubeVideoId: 'wR4Cg3t_9jQ',
    orderIndex: 2,
    contentBody: `Mim sukun (مْ) memiliki 3 hukum bacaan berdasarkan makhraj bibir:
1. **Ikhfa Syafawi**: Mim sukun bertemu huruf Ba (ب). Dibaca samar dengan dengung.
2. **Idgham Mimi / Mitslain**: Mim sukun bertemu huruf Mim (م). Dibaca melebur dengan dengung sempurna.
3. **Idzhar Syafawi**: Mim sukun bertemu seluruh huruf hijaiyah selain Ba dan Mim. Dibaca jelas di bibir tanpa dengung.`,
    quiz: {
      id: '9a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
      title: 'Kuis Evaluasi Mim Sukun',
      description: 'Uji kemampuan membedakan Ikhfa Syafawi dan Idzhar Syafawi.',
      passingScore: 70,
      questions: [
        {
          id: 'q2-uuid-001',
          questionText: 'Mim sukun (مْ) bertemu huruf Ba (ب) dihukumi...',
          orderIndex: 1,
          options: [
            { id: 'opt-m1', optionText: 'Ikhfa Syafawi' },
            { id: 'opt-m2', optionText: 'Idgham Mimi' },
            { id: 'opt-m3', optionText: 'Idzhar Syafawi' },
          ],
        },
        {
          id: 'q2-uuid-002',
          questionText: 'Pada lafal لَهُم مَّا يَشَآءُونَ, hukum bacaan yang terjadi adalah...',
          orderIndex: 2,
          options: [
            { id: 'opt-m21', optionText: 'Idgham Mimi (Mitslain)' },
            { id: 'opt-m22', optionText: 'Idzhar Halqi' },
            { id: 'opt-m23', optionText: 'Iqlab' },
          ],
        },
      ],
    },
  },
  {
    id: '3c8d5e2f-9a4b-6c0d-1e3f-5a7b9c2d4e6f',
    title: 'Hukum Madd Asli dan Madd Far’i',
    slug: 'hukum-madd',
    summary: 'Klasifikasi panjang harakat bacaan: Thabi’i, Wajib Muttashil, dan Jaiz Munfashil.',
    youtubeVideoId: 'dQw4w9WgXcQ',
    orderIndex: 3,
    contentBody: `Madd secara bahasa berarti memanjangkan suara. Terbagi atas:
1. **Madd Asli (Thabi’i)**: Dipanjangkan 2 harakat (1 alif).
2. **Madd Wajib Muttashil**: Huruf madd bertemu hamzah dalam satu kata. Dipanjangkan 4-5 harakat.
3. **Madd Jaiz Munfashil**: Huruf madd bertemu hamzah di lain kata. Dipanjangkan 4-5 harakat.`,
    quiz: {
      id: '7b8c9d0e-1f2a-3b4c-5d6e-7f8a9b0c1d2e',
      title: 'Kuis Evaluasi Hukum Madd',
      description: 'Uji pemahaman panjang harakat madd wajib vs jaiz munfashil.',
      passingScore: 70,
      questions: [
        {
          id: 'q3-uuid-001',
          questionText: 'Berapakah panjang harakat Madd Thabi’i (Asli)?',
          orderIndex: 1,
          options: [
            { id: 'opt-md1', optionText: '2 Harakat (1 Alif)' },
            { id: 'opt-md2', optionText: '4 Harakat' },
            { id: 'opt-md3', optionText: '6 Harakat' },
          ],
        },
      ],
    },
  },
];

// Offline answers repository for fallback quiz evaluation
const MOCK_CORRECT_KEYS: Record<string, { correctOptionId: string; explanation: string }> = {
  'q1-uuid-001': {
    correctOptionId: 'opt-2',
    explanation:
      'Benar! Apabila nun sukun atau tanwin bertemu huruf Ba (ب), maka dibaca Iqlab, yaitu bunyi nun/tanwin diganti menjadi bunyi mim (م) disertai ghunnah (berdengung) 2 harakat.',
  },
  'q1-uuid-002': {
    correctOptionId: 'opt-21',
    explanation:
      'Tepat! Pertemuan nun sukun dengan huruf Ya (ي) termasuk Idgham Bighunnah, dibaca memasukkan bunyi nun ke dalam huruf ya disertai dengung sempurna.',
  },
  'q1-uuid-003': {
    correctOptionId: 'opt-33',
    explanation:
      'Tepat! Huruf Idzhar Halqi berjumlah 6 huruf: Hamzah (ء), Ha (هـ), ‘Ain (ع), Hha (ح), Ghain (غ), dan Kha (خ). Semua keluar dari makhraj tenggorokan.',
  },
  'q2-uuid-001': {
    correctOptionId: 'opt-m1',
    explanation:
      'Tepat! Mim sukun bertemu huruf Ba (ب) dinamakan Ikhfa Syafawi. Bibir dirapatkan ringan disertai dengung samar.',
  },
  'q2-uuid-002': {
    correctOptionId: 'opt-m21',
    explanation:
      'Tepat! Mim sukun bertemu mim berharakat adalah Idgham Mimi (Idgham Mitslain Shaghir), dibaca melebur dengan dengung.',
  },
  'q3-uuid-001': {
    correctOptionId: 'opt-md1',
    explanation:
      'Tepat! Madd Asli (Thabi’i) dibaca panjang 2 harakat atau setara 1 alif ayunan suara normal.',
  },
};

export default function TajwidPage() {
  const [modules, setModules] = useState<TajwidModule[]>(FALLBACK_MODULES);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeModule, setActiveModule] = useState<TajwidModule | null>(null);

  // Active view tab in module: 'lesson' | 'quiz'
  const [activeTab, setActiveTab] = useState<'lesson' | 'quiz'>('lesson');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [quizReview, setQuizReview] = useState<QuizSubmitResponse | null>(null);

  useEffect(() => {
    fetch('/api/v1/tajwid/modules')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch modules');
        return res.json();
      })
      .then((data: TajwidModule[]) => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge with fallback quizzes if backend only returned brief summaries
          const merged = data.map((mod, idx) => ({
            ...mod,
            quiz: mod.quiz || FALLBACK_MODULES[idx]?.quiz || FALLBACK_MODULES[0].quiz,
            contentBody: mod.contentBody || FALLBACK_MODULES[idx]?.contentBody,
          }));
          setModules(merged);
        }
      })
      .catch((err) => {
        console.warn('Using fallback tajwid modules:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleOpenModule = async (mod: TajwidModule) => {
    setActiveTab('lesson');
    setSelectedAnswers({});
    setQuizReview(null);
    try {
      const res = await fetch(`/api/v1/tajwid/modules/${mod.slug}`);
      if (res.ok) {
        const data = await res.json();
        setActiveModule({
          ...mod,
          contentBody: data.contentBody || mod.contentBody,
          quiz: data.quiz || mod.quiz,
        });
        return;
      }
    } catch (e) {
      console.warn('Failed to load real module detail from backend:', e);
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

  // Submit quiz attempt (REQ-FE-01)
  const handleSubmitQuiz = async () => {
    if (!activeModule?.quiz) return;
    const quiz = activeModule.quiz;

    // Check if all questions have answers
    const unanswered = quiz.questions.filter((q) => !selectedAnswers[q.id]);
    if (unanswered.length > 0) {
      alert(`Mohon lengkapi seluruh ${quiz.questions.length} pertanyaan kuis.`);
      return;
    }

    setIsSubmitting(true);
    const answersPayload = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: selectedAnswers[q.id],
    }));

    try {
      const token = localStorage.getItem('hifzhly_auth_token');
      const res = await fetch(`/api/v1/tajwid/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ answers: answersPayload }),
      });

      if (res.ok) {
        const data: QuizSubmitResponse = await res.json();
        setQuizReview(data);
      } else {
        throw new Error('Fallback to local evaluation');
      }
    } catch {
      // Local evaluation fallback matching API.md 6.3 contract
      let correctCount = 0;
      const reviews = quiz.questions.map((q) => {
        const userChoice = selectedAnswers[q.id];
        const correctInfo = MOCK_CORRECT_KEYS[q.id] || {
          correctOptionId: q.options[0].id,
          explanation: 'Kaidah tajwid berlaku sesuai hukum makharijul huruf dan sifatul huruf.',
        };
        const isCorrect = userChoice === correctInfo.correctOptionId;
        if (isCorrect) correctCount++;

        return {
          questionId: q.id,
          questionText: q.questionText,
          selectedOptionId: userChoice,
          correctOptionId: correctInfo.correctOptionId,
          isCorrect,
          explanation: correctInfo.explanation,
        };
      });

      const score = Math.round((correctCount / quiz.questions.length) * 100);
      const passed = score >= quiz.passingScore;

      const fallbackResult: QuizSubmitResponse = {
        attemptId: `attempt-${Date.now()}`,
        score,
        totalQuestions: quiz.questions.length,
        correctAnswers: correctCount,
        passed,
        passingScore: quiz.passingScore,
        completedAt: new Date().toISOString(),
        review: reviews,
      };

      setQuizReview(fallbackResult);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setQuizReview(null);
  };

  const handleNextModule = () => {
    if (!activeModule) return;
    const currentIndex = modules.findIndex((m) => m.id === activeModule.id);
    const nextIndex = (currentIndex + 1) % modules.length;
    handleOpenModule(modules[nextIndex]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-emerald-700 space-x-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-semibold">Memuat kurikulum Tajwid Academy...</span>
      </div>
    );
  }

  // Active Module View
  if (activeModule) {
    const quiz = activeModule.quiz;

    return (
      <div className="space-y-6">
        {/* Module Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setActiveModule(null)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-white text-slate-600 hover:text-slate-900 transition-all"
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
              className={`px-3 py-1.5 rounded-lg transition-all ${
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
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'quiz'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kuis Evaluasi {quizReview && '• Hasil Review'}
            </button>
          </div>
        </div>

        {/* Tab 1: Lesson & Video */}
        {activeTab === 'lesson' && (
          <div className="space-y-6">
            {/* YouTube Embed Player */}
            {activeModule.youtubeVideoId && (
              <div className="aspect-video w-full rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
                <iframe
                  src={`https://www.youtube.com/embed/${activeModule.youtubeVideoId}`}
                  title={activeModule.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            )}

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
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <span>Mulai Uji Pemahaman di Kuis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Quiz & Post-Quiz Review Screen (REQ-FE-01) */}
        {activeTab === 'quiz' && quiz && (
          <div className="space-y-6">
            {/* If Quiz is NOT submitted yet: Taking Quiz UI */}
            {!quizReview ? (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {quiz.description} (Skor kelulusan: minimal {quiz.passingScore}%)
                  </p>
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                  {quiz.questions.map((q, qIndex) => (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3"
                    >
                      <div className="flex items-start space-x-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">
                          {qIndex + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {q.questionText}
                        </h4>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {q.options.map((opt) => {
                          const isSelected = selectedAnswers[q.id] === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectOption(q.id, opt.id)}
                              className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center space-x-2 ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                                  isSelected
                                    ? 'border-white bg-white text-emerald-800 font-bold'
                                    : 'border-slate-300 bg-slate-50'
                                }`}
                              >
                                {isSelected ? '✓' : ''}
                              </span>
                              <span>{opt.optionText}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    disabled={isSubmitting}
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengevaluasi Kuis...</span>
                      </>
                    ) : (
                      <>
                        <span>Kumpulkan &amp; Lihat Pembahasan</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* REQ-FE-01: Post-Quiz Review Screen */
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* 1. Score Recap Card */}
                <div
                  className={`p-6 sm:p-8 rounded-3xl border shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 ${
                    quizReview.passed
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50/80 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="space-y-2 text-center sm:text-left">
                    <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider">
                      {quizReview.passed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-800">Status: Lulus</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-4 h-4 text-amber-600" />
                          <span className="text-amber-800">Status: Coba Lagi</span>
                        </>
                      )}
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                      {quizReview.passed
                        ? 'Masya Allah, Pemahaman Tajwid Sangat Baik!'
                        : 'Tetap Semangat, Pelajari Kembali Rangkuman Kaidah!'}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
                      {quizReview.passed
                        ? `Anda berhasil menjawab ${quizReview.correctAnswers} dari ${quizReview.totalQuestions} soal dengan tepat dan melampaui batas nilai kelulusan ${quizReview.passingScore}%.`
                        : `Skor Anda belum mencapai ambang batas ${quizReview.passingScore}%. Tinjau kembali kunci jawaban dan penjelasan di bawah ini sebelum mencoba ulang.`}
                    </p>
                  </div>

                  {/* Big Numeric Score */}
                  <div className="text-center sm:text-right shrink-0">
                    <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs inline-block text-center min-w-[130px]">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Skor Akhir
                      </span>
                      <span className="text-4xl sm:text-5xl font-black text-slate-900 font-mono tabular-nums leading-none block my-1">
                        {Math.round(quizReview.score)}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Skor KKM: {quizReview.passingScore}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Question-by-Question Review List with Soft Teal Explanation Box */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="text-base font-bold text-slate-900">
                      Ulasan Pembahasan Per Butir Pertanyaan
                    </h4>
                    <span className="text-xs text-slate-500 font-mono">
                      {quizReview.correctAnswers} / {quizReview.totalQuestions} Benar
                    </span>
                  </div>

                  <div className="space-y-6">
                    {quizReview.review.map((item, idx) => {
                      const questionObj = quiz.questions.find((q) => q.id === item.questionId);
                      const selectedOptObj = questionObj?.options.find(
                        (o) => o.id === item.selectedOptionId
                      );
                      const correctOptObj = questionObj?.options.find(
                        (o) => o.id === item.correctOptionId
                      );

                      return (
                        <div
                          key={item.questionId}
                          className="p-5 rounded-2xl border border-slate-200/90 space-y-3.5 bg-slate-50/50"
                        >
                          {/* Question Header & Verification Badge */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start space-x-2">
                              <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <h5 className="text-sm font-bold text-slate-900 leading-snug">
                                {item.questionText}
                              </h5>
                            </div>

                            <span
                              className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-bold shrink-0 ${
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

                          {/* Selected Option vs Correct Option */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="p-3 rounded-xl bg-white border border-slate-200">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                Jawaban Anda:
                              </span>
                              <span
                                className={`font-semibold ${
                                  item.isCorrect ? 'text-emerald-700' : 'text-rose-700'
                                }`}
                              >
                                {selectedOptObj?.optionText || 'Tidak dijawab'}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-white border border-slate-200">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                Kunci Jawaban Resmi:
                              </span>
                              <span className="font-semibold text-emerald-800">
                                {correctOptObj?.optionText || '-'}
                              </span>
                            </div>
                          </div>

                          {/* Soft Teal Explanation Box (REQ-FE-01) */}
                          <div className="p-3.5 rounded-2xl bg-teal-50/90 border border-teal-200 text-xs text-teal-950 space-y-1 font-sans">
                            <span className="font-bold text-teal-900 flex items-center space-x-1.5 text-[11px]">
                              <Info className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                              <span>Penjelasan Kaidah Tajwid:</span>
                            </span>
                            <p className="text-teal-900/90 leading-relaxed pl-5">
                              {item.explanation}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 3. Action Buttons: Ulangi Kuis & Lanjut ke Modul Berikutnya */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleRetryQuiz}
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-500" />
                      <span>Ulangi Kuis Ini</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextModule}
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
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

  // Module Grid Overview
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Tajwid Academy &amp; Evaluasi Teori
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pelajari kaidah hukum bacaan Al-Qur'an secara ilmiah melalui video panduan, teks rujukan, dan kuis berbobot.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <div
            key={module.id}
            onClick={() => handleOpenModule(module)}
            className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                  Modul 0{module.orderIndex}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Video &amp; Kuis
                </span>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                {module.title}
              </h3>

              <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                {module.summary}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>KKM: 70%</span>
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
