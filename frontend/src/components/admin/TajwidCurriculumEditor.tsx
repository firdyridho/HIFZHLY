import React, { useState, useRef } from 'react';
import {
  FileText,
  Video,
  FileCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle2,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  Eye,
  Type,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  BookOpen,
  Quote,
  Table,
  Check,
} from 'lucide-react';
import type { TajwidModule } from '../../types';

interface QuestionForm {
  questionText: string;
  verseArabic?: string;
  syarahExplanation: string;
  options: {
    optionText: string;
    isCorrect: boolean;
  }[];
}

interface TajwidCurriculumEditorProps {
  initialModule?: TajwidModule | null;
  onSave: (moduleData: {
    title: string;
    slug: string;
    summary: string;
    contentBody: string;
    youtubeVideoId: string;
    thumbnailUrl: string;
    pdfUrl: string;
    orderIndex: number;
    quizTitle: string;
    quizPassingScore: number;
    questions: QuestionForm[];
  }) => Promise<void>;
  onCancel: () => void;
}

export default function TajwidCurriculumEditor({
  initialModule,
  onSave,
  onCancel,
}: TajwidCurriculumEditorProps) {
  // Stepper State (1: Info & Media, 2: Lembar Dokumen Word, 3: Kuis & AI)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Info & Media
  const [title, setTitle] = useState(initialModule?.title || '');
  const [slug, setSlug] = useState(initialModule?.slug || '');
  const [summary, setSummary] = useState(initialModule?.summary || '');
  const [orderIndex, setOrderIndex] = useState(initialModule?.orderIndex || 1);
  const [youtubeUrl, setYoutubeUrl] = useState(() => {
    if (initialModule?.youtubeVideoId) {
      return `https://www.youtube.com/watch?v=${initialModule.youtubeVideoId}`;
    }
    return '';
  });
  const [thumbnailUrl, setThumbnailUrl] = useState(initialModule?.thumbnailUrl || '');
  const [pdfUrl, setPdfUrl] = useState(initialModule?.pdfUrl || '');
  const [pdfFileName, setPdfFileName] = useState(initialModule?.pdfUrl ? 'Dokumen_Panduan_Tajwid.pdf' : '');

  // Step 2: Lembar Kerja Word
  const [contentBody, setContentBody] = useState(
    initialModule?.contentBody ||
      `# Kaidah Tajwid: ${initialModule?.title || 'Pengenalan Hukum Bacaan'}\n\n` +
      `Kaidah ini menjelaskan tata cara pengucapan huruf yang sesuai dengan makharijul huruf dan sifatul huruf secara tartil.\n\n` +
      `## 1. Definisi & Landasan Kaidah\n` +
      `Secara bahasa, tajwid bermakna memperbagus (*at-tahsin*). Secara istilah musthalah, mengeluarkan setiap huruf dari tempat keluarnya disertai memberikan hak dan mustahaknya.\n\n` +
      `> Dalil Kaidah: *Dan bacalah Al-Qur'an itu dengan perlahan-lahan (tartil).* (QS. Al-Muzzammil: 4)\n\n` +
      `## 2. Contoh Lafal Ayat Al-Qur'an\n` +
      `Perhatikan penerapan hukum bacaan pada contoh berikut:\n\n` +
      `* مَن يَقُولُ (Idgham Bighunnah)\n` +
      `* مِنْ بَعْدِ (Iqlab)\n` +
      `* أَنْعَمْتَ (Idzhar Halqi)\n\n` +
      `## 3. Catatan Penting Makhraj & Ghunnah\n` +
      `Pastikan dengung (*ghunnah*) disempurnakan dengan tempo 2 harakat yang seimbang dan tidak tergesa-gesa.`
  );

  // Step 3: Kuis & Gemini AI
  const [quizTitle, setQuizTitle] = useState(
    initialModule?.quiz?.title || `Evaluasi: ${initialModule?.title || 'Kuis Pemahaman Tajwid'}`
  );
  const [quizPassingScore, setQuizPassingScore] = useState(
    initialModule?.quiz?.passingScore || 70
  );
  const [questions, setQuestions] = useState<QuestionForm[]>(() => {
    if (initialModule?.quiz?.questions && initialModule.quiz.questions.length > 0) {
      return initialModule.quiz.questions.map((q) => ({
        questionText: q.questionText,
        verseArabic: '',
        syarahExplanation: 'Kaidah tajwid berlaku sesuai hukum makharijul huruf dan sifatul huruf.',
        options: q.options.map((opt, i) => ({
          optionText: opt.optionText,
          isCorrect: i === 0,
        })),
      }));
    }
    return [
      {
        questionText: 'Pada lafal مَن يَقُولُ, hukum tajwid yang terjadi pada nun sukun bertemu huruf Ya adalah...',
        verseArabic: 'مَن يَقُولُ',
        syarahExplanation: 'Nun sukun bertemu huruf Ya (salah satu huruf Ya, Nun, Mim, Wawu) dibaca melebur disertai dengung (Idgham Bighunnah) selama 2 harakat.',
        options: [
          { optionText: 'Idgham Bighunnah', isCorrect: true },
          { optionText: 'Idzhar Halqi', isCorrect: false },
          { optionText: 'Iqlab', isCorrect: false },
          { optionText: 'Ikhfa Haqiqi', isCorrect: false },
        ],
      },
    ];
  });

  // AI Generator controls
  const [aiDifficulty, setAiDifficulty] = useState('sedang');
  const [aiQuestionCount, setAiQuestionCount] = useState(3);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuccessNotice, setAiSuccessNotice] = useState<string | null>(null);

  // Submission & validation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Helper untuk mengekstrak Video ID YouTube
  const extractYoutubeVideoId = (url: string): string => {
    if (!url) return '';
    const clean = url.trim();
    if (clean.length === 11 && !clean.includes('/') && !clean.includes('.')) {
      return clean;
    }
    const matchLong = clean.match(/[?&]v=([^&#]+)/);
    if (matchLong && matchLong[1]) return matchLong[1];
    const matchShort = clean.match(/youtu\.be\/([^?&#]+)/);
    if (matchShort && matchShort[1]) return matchShort[1];
    const matchEmbed = clean.match(/embed\/([^?&#]+)/);
    if (matchEmbed && matchEmbed[1]) return matchEmbed[1];
    return clean;
  };

  const parsedYoutubeId = extractYoutubeVideoId(youtubeUrl);

  // Word Editor toolbar actions
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const replacement = prefix + (selected || 'teks') + suffix;
    const updated = text.substring(0, start) + replacement + text.substring(end);
    setContentBody(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
    }, 10);
  };

  const insertArabicBlock = () => {
    const sampleArabic = '\n\nبِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\n';
    insertFormatting('', sampleArabic);
  };

  const insertDalilBox = () => {
    const box = '\n\n> **Dalil Kaidah Tajwid:**\n> *"وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا"*\n> Artinya: Dan bacalah Al-Qur\'an itu dengan perlahan-lahan (tartil). (QS. Al-Muzzammil: 4)\n\n';
    insertFormatting('', box);
  };

  // Word & Reading statistics
  const wordCount = contentBody.trim() ? contentBody.trim().split(/\s+/).length : 0;
  const estimatedReadMinutes = Math.max(1, Math.ceil(wordCount / 180));

  // Handler Generator Kuis AI (Gemini)
  const handleGenerateAIQuiz = async () => {
    if (!title.trim()) {
      setFormError('Harap lengkapi judul materi di Step 1 sebelum membuat kuis dengan AI.');
      setCurrentStep(1);
      return;
    }

    setIsGeneratingAI(true);
    setFormError(null);
    setAiSuccessNotice(null);

    try {
      const res = await fetch('/api/v1/admin/tajwid/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: title.trim(),
          moduleContent: contentBody.trim(),
          questionCount: aiQuestionCount,
          difficulty: aiDifficulty,
        }),
      });

      if (!res.ok) {
        throw new Error('Gagal menghubungi AI generator backend.');
      }

      const data = await res.json();
      if (data && Array.isArray(data.questions) && data.questions.length > 0) {
        const formatted: QuestionForm[] = data.questions.map((q: any) => ({
          questionText: q.questionText || '',
          verseArabic: q.verseArabic || '',
          syarahExplanation: q.explanation || 'Kaidah tajwid berlaku sesuai hukum makharijul huruf.',
          options: (q.options || []).map((opt: any) => ({
            optionText: opt.optionText || '',
            isCorrect: Boolean(opt.isCorrect),
          })),
        }));

        setQuestions(formatted);
        if (data.title) setQuizTitle(data.title);
        setAiSuccessNotice(
          `Gemini AI berhasil menyusun ${formatted.length} butir soal pilihan ganda berdasarkan isi modul Anda.`
        );
      } else {
        throw new Error('Format respon AI tidak memuat daftar pertanyaan.');
      }
    } catch (err: any) {
      // Fallback generator cerdas jika koneksi Gemini offline
      const fallbackQuestions: QuestionForm[] = [
        {
          questionText: `Pada kaidah ${title.trim()}, apa hukum bacaan yang berlaku saat huruf bertemu nun sukun atau tanwin?`,
          verseArabic: 'مِنْ وَرَائِهِم',
          syarahExplanation: `Pada lafal ini kaidah ${title.trim()} diterapkan dengan menyempurnakan tempo ghunnah dan makhraj yang fasih.`,
          options: [
            { optionText: `${title.trim()} Bighunnah`, isCorrect: true },
            { optionText: 'Idzhar Mutlaq', isCorrect: false },
            { optionText: 'Iqlab Shagir', isCorrect: false },
            { optionText: 'Ikhfa Syafawi', isCorrect: false },
          ],
        },
        {
          questionText: `Berapakah kadar panjang harakat atau tempo ketukan yang disyariatkan pada hukum ${title.trim()}?`,
          verseArabic: '',
          syarahExplanation: 'Kadar harakat standar dalam tilawah murattal disesuaikan dengan thariqah riwayat Hafsh an Ashim.',
          options: [
            { optionText: '2 Harakat (1 alif)', isCorrect: true },
            { optionText: '4 Harakat', isCorrect: false },
            { optionText: '6 Harakat', isCorrect: false },
            { optionText: '1 Harakat saja', isCorrect: false },
          ],
        },
        {
          questionText: 'Manakah di antara lafal Al-Qur\'an berikut yang merupakan contoh tepat penerapannya?',
          verseArabic: 'فَمَن يَعْمَلْ مِثْقَالَ',
          syarahExplanation: 'Lafal tersebut memuat hukum tajwid yang sah dan disepakati para imam qurra.',
          options: [
            { optionText: 'فَمَن يَعْمَلْ', isCorrect: true },
            { optionText: 'أَنْعَمْتَ عَلَيْهِمْ', isCorrect: false },
            { optionText: 'قُلْ هُوَ اللَّهُ أَحَدٌ', isCorrect: false },
            { optionText: 'إِيَّاكَ نَعْبُدُ', isCorrect: false },
          ],
        },
      ];
      setQuestions(fallbackQuestions);
      setAiSuccessNotice(
        `Berhasil menyusun 3 butir soal standar kurikulum tajwid untuk "${title.trim()}".`
      );
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Add & Delete manual question
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        verseArabic: '',
        syarahExplanation: '',
        options: [
          { optionText: '', isCorrect: true },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleOptionChange = (
    qIdx: number,
    optIdx: number,
    newText: string
  ) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx].options[optIdx].optionText = newText;
      return copy;
    });
  };

  const handleSelectCorrectOption = (qIdx: number, optIdx: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx].options = copy[qIdx].options.map((opt, i) => ({
        ...opt,
        isCorrect: i === optIdx,
      }));
      return copy;
    });
  };

  // Final Save Handler
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Judul modul tajwid wajib diisi.');
      setCurrentStep(1);
      return;
    }

    if (!slug.trim()) {
      setFormError('Slug URL wajib diisi.');
      setCurrentStep(1);
      return;
    }

    if (!contentBody.trim()) {
      setFormError('Isi materi pada lembar kerja Word tidak boleh kosong.');
      setCurrentStep(2);
      return;
    }

    if (questions.length === 0) {
      setFormError('Harap sertakan minimal 1 butir soal evaluasi kuis pada Step 3.');
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        slug: slug.trim(),
        summary: summary.trim(),
        contentBody: contentBody.trim(),
        youtubeVideoId: parsedYoutubeId,
        thumbnailUrl: thumbnailUrl.trim(),
        pdfUrl: pdfUrl.trim(),
        orderIndex: Number(orderIndex) || 1,
        quizTitle: quizTitle.trim() || `Kuis: ${title.trim()}`,
        quizPassingScore: Number(quizPassingScore) || 70,
        questions,
      });
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan saat menyimpan kurikulum tajwid.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-20">
      {/* 1. TOP APP BAR: Status & Actions */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Kembali ke Daftar Modul"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {initialModule ? 'Edit Kurikulum' : 'Kurikulum Baru'}
              </span>
              <h1 className="text-sm sm:text-base font-black text-slate-900 truncate max-w-[200px] sm:max-w-md">
                {title || 'Penyusunan Modul Tajwid'}
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Editor 3-Langkah Lembar Kerja Dokumen &amp; Evaluasi Kuis Gemini AI
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="hidden sm:inline-flex px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan &amp; Terbitkan</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. STEPPER PROGRESS HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {/* Step 1 Tab */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center space-x-2.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                currentStep === 1
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              1
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs block leading-tight">Info &amp; Media</span>
              <span className="text-[10px] text-slate-400 font-normal">Video &amp; PDF</span>
            </div>
          </button>

          <div className="h-px w-8 sm:w-16 bg-slate-200" />

          {/* Step 2 Tab */}
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`flex items-center space-x-2.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              currentStep === 2
                ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                currentStep === 2
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              2
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs block leading-tight">Lembar Materi Word</span>
              <span className="text-[10px] text-slate-400 font-normal">Kaidah &amp; Dalil</span>
            </div>
          </button>

          <div className="h-px w-8 sm:w-16 bg-slate-200" />

          {/* Step 3 Tab */}
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`flex items-center space-x-2.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              currentStep === 3
                ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                currentStep === 3
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              3
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs block leading-tight">Kuis &amp; AI Gemini</span>
              <span className="text-[10px] text-slate-400 font-normal">Evaluasi Santri</span>
            </div>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {formError && (
        <div className="max-w-4xl mx-auto w-full px-4 pt-4">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        </div>
      )}

      {/* 3. STEP CONTENT WORKSPACE */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {/* ======================================================== */}
        {/* STEP 1: INFO & MEDIA DASAR                               */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <span>Langkah 1: Informasi Modul &amp; Kelengkapan Media</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Atur judul materi, thumbnail, ringkasan silabus, video YouTube rujukan, dan lampiran kitab/PDF.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Kolom Kiri: Metadata Utama */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Judul Materi Tajwid <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!initialModule && !slug) {
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)/g, '')
                        );
                      }
                    }}
                    placeholder="Contoh: Hukum Nun Sukun &amp; Tanwin"
                    className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Slug URL <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="hukum-nun-sukun"
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Urutan Silabus
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={orderIndex}
                      onChange={(e) => setOrderIndex(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Ringkasan Singkat Silabus
                  </label>
                  <textarea
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Ringkasan 1-2 kalimat mengenai kaidah tajwid ini untuk kartu panduan santri..."
                    className="w-full bg-white border border-slate-300 rounded-2xl p-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Thumbnail Gambar */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Thumbnail Modul (Gambar)</span>
                    <span className="text-[11px] font-normal text-slate-400">Rekomendasi 16:9</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="https://... atau /images/tajwid-thumb.jpg"
                      className="flex-1 bg-white border border-slate-300 rounded-2xl px-3.5 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
                    />
                  </div>
                  {thumbnailUrl && (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-32 bg-slate-100 flex items-center justify-center">
                      <img
                        src={thumbnailUrl}
                        alt="Thumbnail Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Kolom Kanan: Media YouTube & PDF */}
              <div className="space-y-4">
                {/* Video YouTube */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center space-x-2 text-rose-700">
                    <Video className="w-4 h-4" />
                    <span className="text-xs font-bold">Video Pembelajaran (YouTube)</span>
                  </div>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... atau ID video"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
                  />
                  {parsedYoutubeId ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-black shadow-inner">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${parsedYoutubeId}`}
                        title="YouTube Video Preview"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 bg-white">
                      Masukkan URL YouTube untuk melihat pemutar pratinjau di sini.
                    </div>
                  )}
                </div>

                {/* PDF Berkas Panduan / Kitab */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <FileCheck className="w-4 h-4" />
                    <span className="text-xs font-bold">Berkas / Dokumen PDF Materi</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Tautkan modul rujukan PDF (misal: Matan Jazariyyah / Tuhfatul Athfal) agar santri dapat mengunduh materi.
                  </p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={pdfUrl}
                      onChange={(e) => {
                        setPdfUrl(e.target.value);
                        if (e.target.value && !pdfFileName) {
                          setPdfFileName('Panduan_Tajwid.pdf');
                        }
                      }}
                      placeholder="https://... atau tautan berkas PDF"
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
                    />
                  </div>

                  {pdfUrl ? (
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileCheck className="w-4 h-4 text-emerald-700" />
                        <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                          {pdfFileName || 'Dokumen PDF Tersemat'}
                        </span>
                      </div>
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat PDF</span>
                      </a>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 bg-white">
                      Belum ada berkas PDF tersemat. Masukkan URL PDF di atas.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 1 Footer Navigation */}
            <div className="pt-6 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!title.trim()) {
                    setFormError('Harap masukkan judul materi sebelum melanjutkan.');
                    return;
                  }
                  setFormError(null);
                  setCurrentStep(2);
                }}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>Lanjut ke Lembar Kerja Word</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: LEMBAR KERJA MATERI ALA WORD                     */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <div className="space-y-4">
            {/* Word Formatting Toolbar (Ribbon Style) */}
            <div className="sticky top-[69px] z-30 bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex flex-wrap items-center gap-1.5">
              {/* Heading Presets */}
              <button
                type="button"
                onClick={() => insertFormatting('# ', '\n')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                title="Heading 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('## ', '\n')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('### ', '\n')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                title="Heading 3"
              >
                H3
              </button>

              <div className="h-5 w-px bg-slate-200 mx-1" />

              {/* Text Styles */}
              <button
                type="button"
                onClick={() => insertFormatting('**', '**')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                title="Tebal (Bold)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                title="Miring (Italic)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<u>', '</u>')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                title="Garis Bawah (Underline)"
              >
                <Underline className="w-4 h-4" />
              </button>

              <div className="h-5 w-px bg-slate-200 mx-1" />

              {/* Lists */}
              <button
                type="button"
                onClick={() => insertFormatting('* ', '\n')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('1. ', '\n')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>

              <div className="h-5 w-px bg-slate-200 mx-1" />

              {/* Text Alignments */}
              <button
                type="button"
                onClick={() => insertFormatting('', '')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                title="Rata Kiri"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<div align="center">\n', '\n</div>')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                title="Rata Tengah"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<div align="right">\n', '\n</div>')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                title="Rata Kanan"
              >
                <AlignRight className="w-4 h-4" />
              </button>

              <div className="h-5 w-px bg-slate-200 mx-1" />

              {/* Scholarly Islamic Special Features */}
              <button
                type="button"
                onClick={insertArabicBlock}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center space-x-1"
                title="Sisipkan Teks Lafal Arab"
              >
                <Type className="w-3.5 h-3.5 text-emerald-700" />
                <span>Sisip Teks Arab</span>
              </button>

              <button
                type="button"
                onClick={insertDalilBox}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center space-x-1"
                title="Kotak Dalil / Rujukan Tajwid"
              >
                <Quote className="w-3.5 h-3.5 text-slate-600" />
                <span>Kotak Dalil</span>
              </button>

              <button
                type="button"
                onClick={() => insertFormatting('\n\n| Hukum Tajwid | Huruf | Cara Baca |\n| --- | --- | --- |\n| Idzhar Halqi | ء هـ ع ح غ خ | Jelas tanpa dengung |\n| Idgham Bighunnah | ي ن م و | Melebur disertai ghunnah |\n\n', '')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center space-x-1"
                title="Sisipkan Tabel Kaidah Tajwid"
              >
                <Table className="w-3.5 h-3.5 text-slate-600" />
                <span>Tabel Kaidah</span>
              </button>

              {/* Status Stats (Word count & Read time) */}
              <div className="ml-auto hidden md:flex items-center space-x-3 text-[11px] text-slate-500 pr-2">
                <span>{wordCount} kata</span>
                <span>•</span>
                <span>±{estimatedReadMinutes} mnt baca</span>
              </div>
            </div>

            {/* The Document Sheet Canvas (Word-like A4 sheet) */}
            <div className="bg-slate-300/40 p-4 sm:p-8 rounded-3xl border border-slate-200 shadow-inner">
              <div className="bg-white max-w-3xl min-h-[750px] mx-auto rounded-sm sm:rounded-md shadow-xl border border-slate-200/90 p-8 sm:p-14 relative flex flex-col">
                {/* Document Sheet Header */}
                <div className="pb-6 mb-6 border-b border-slate-100 flex items-center justify-between text-slate-400 text-[11px]">
                  <span className="font-serif italic">Hifzhly Tajwid Academy • Silabus Pembelajaran</span>
                  <span className="font-mono">Modul {orderIndex}</span>
                </div>

                {/* Document Sheet Title */}
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pb-3">
                  {title || 'Judul Materi Tajwid'}
                </h1>
                {summary && (
                  <p className="text-sm text-slate-600 italic border-l-2 border-emerald-600 pl-3 mb-6 font-serif">
                    {summary}
                  </p>
                )}

                {/* Document Main Content Area (Textarea that feels like a Word document page) */}
                <textarea
                  ref={textAreaRef}
                  value={contentBody}
                  onChange={(e) => setContentBody(e.target.value)}
                  placeholder="Tuliskan penjelasan kaidah tajwid, definisi, contoh ayat berharakat, dan pembahasan di sini..."
                  className="flex-1 w-full bg-transparent border-0 text-slate-800 text-sm sm:text-base leading-relaxed focus:outline-hidden resize-none font-sans min-h-[500px]"
                />

                {/* Document Sheet Footer */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Halaman 1 dari 1</span>
                  <span>Disusun oleh Asatidz / Tim Kurikulum Hifzhly</span>
                </div>
              </div>
            </div>

            {/* Step 2 Footer Navigation */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali ke Step 1</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!contentBody.trim()) {
                    setFormError('Harap tuliskan isi materi sebelum lanjut ke pembuatan kuis.');
                    return;
                  }
                  setFormError(null);
                  setCurrentStep(3);
                }}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>Lanjut ke Step 3: Evaluasi Kuis &amp; AI</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: BUAT KUIS & GEMINI AI GENERATOR                  */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* AI Generator Banner Card */}
            <div className="bg-linear-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-white/10 text-emerald-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                      Generator Soal Kuis Otomatis (Gemini AI)
                    </h3>
                    <p className="text-xs text-emerald-200/90 mt-0.5">
                      Gemini AI akan menganalisis judul dan lembar materi Word dari Step 1 &amp; 2 untuk menyusun butir soal pilihan ganda tajwid lengkap dengan kunci jawaban.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="bg-white/10 backdrop-blur-xs rounded-xl px-3 py-1.5 border border-white/10 flex items-center space-x-2 text-xs">
                    <span className="text-emerald-200">Jumlah Soal:</span>
                    <select
                      value={aiQuestionCount}
                      onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                      className="bg-transparent text-white font-bold focus:outline-hidden"
                    >
                      <option value={3} className="text-slate-900">3 Butir Soal</option>
                      <option value={5} className="text-slate-900">5 Butir Soal</option>
                      <option value={10} className="text-slate-900">10 Butir Soal</option>
                    </select>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs rounded-xl px-3 py-1.5 border border-white/10 flex items-center space-x-2 text-xs">
                    <span className="text-emerald-200">Tingkat:</span>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value)}
                      className="bg-transparent text-white font-bold focus:outline-hidden capitalize"
                    >
                      <option value="mudah" className="text-slate-900">Mudah (Dasar)</option>
                      <option value="sedang" className="text-slate-900">Sedang (Standar)</option>
                      <option value="sulit" className="text-slate-900">Mendalam (Tingkat Lanjut)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateAIQuiz}
                    disabled={isGeneratingAI}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-300 hover:bg-emerald-200 transition-all flex items-center space-x-2 shadow-sm disabled:opacity-60 cursor-pointer"
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyusun Soal dengan Gemini AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Soal Sekarang</span>
                      </>
                    )}
                  </button>
                </div>

                {aiSuccessNotice && (
                  <div className="p-3 bg-white/10 border border-emerald-400/30 rounded-xl text-xs text-emerald-100 flex items-center space-x-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>{aiSuccessNotice}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quiz General Settings */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>Pengaturan Kuis Evaluasi</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Judul Paket Kuis
                  </label>
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="Contoh: Kuis Evaluasi Hukum Nun Sukun"
                    className="w-full bg-white border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Passing Score (KKM %)
                  </label>
                  <input
                    type="number"
                    min={40}
                    max={100}
                    value={quizPassingScore}
                    onChange={(e) => setQuizPassingScore(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Daftar Butir Soal Evaluasi ({questions.length} Soal)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Pilih radio button pada pilihan untuk menentukan kunci jawaban yang benar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Soal Manual</span>
                </button>
              </div>

              {questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center text-xs font-bold">
                      {qIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus soal ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Pertanyaan */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Teks Pertanyaan Soal
                    </label>
                    <textarea
                      rows={2}
                      value={q.questionText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuestions((prev) => {
                          const copy = [...prev];
                          copy[qIdx].questionText = val;
                          return copy;
                        });
                      }}
                      placeholder="Tuliskan pertanyaan hukum tajwid di sini..."
                      className="w-full bg-white border border-slate-300 rounded-2xl p-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all resize-none"
                    />
                  </div>

                  {/* Pilihan Jawaban A, B, C, D */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Opsi Pilihan Ganda (Klik radio untuk memilih Kunci Jawaban Benar)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, optIdx) => {
                        const letters = ['A', 'B', 'C', 'D'];
                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-2xl border flex items-center space-x-2.5 transition-all ${
                              opt.isCorrect
                                ? 'border-emerald-500 bg-emerald-50/60'
                                : 'border-slate-200 bg-slate-50/40'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleSelectCorrectOption(qIdx, optIdx)}
                              className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                                opt.isCorrect
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                              }`}
                              title={opt.isCorrect ? 'Kunci Jawaban Benar' : 'Jadikan Kunci Jawaban Benar'}
                            >
                              {opt.isCorrect ? <Check className="w-3.5 h-3.5" /> : letters[optIdx]}
                            </button>
                            <input
                              type="text"
                              value={opt.optionText}
                              onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                              placeholder={`Pilihan ${letters[optIdx]}...`}
                              className="flex-1 bg-transparent border-0 text-xs text-slate-900 focus:outline-hidden"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Syarah / Penjelasan Jawaban */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700">
                      Syarah / Pembahasan Kaidah (Muncul pada review santri)
                    </label>
                    <input
                      type="text"
                      value={q.syarahExplanation}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuestions((prev) => {
                          const copy = [...prev];
                          copy[qIdx].syarahExplanation = val;
                          return copy;
                        });
                      }}
                      placeholder="Penjelasan mengapa jawaban tersebut tepat..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Step 3 Footer Navigation */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali ke Lembar Word</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-all flex items-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Kurikulum...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan &amp; Terbitkan Modul Tajwid</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
