import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Flame,
  Award,
  LogOut,
  Search,
  CheckCircle2,
  ChevronRight,
  Plus,
  Trash2,
  Sparkles,
  Video,
  FileText,
  HelpCircle,
  RefreshCw,
  ExternalLink,
  Save,
  X,
  Layers,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  Menu,
} from 'lucide-react';
import type { TajwidModule } from '../types';

interface SantriOverview {
  id: string;
  fullName: string;
  username: string;
  currentStreak: number;
  lastSurah: string;
  lastScore: number;
  lastActive: string;
  status: 'active' | 'need_review';
}

interface QuestionForm {
  questionText: string;
  verseArabic?: string;
  syarahExplanation: string;
  options: {
    optionText: string;
    isCorrect: boolean;
  }[];
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'santri' | 'tajwid'>('santri');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Santri state
  const [metrics, setMetrics] = useState({
    totalSantri: 128,
    totalSessionsToday: 47,
    needReviewCount: 8,
    averageAccuracyScore: 88.4,
  });

  const [santriList, setSantriList] = useState<SantriOverview[]>([
    {
      id: '1',
      fullName: 'Ahmad Al-Hafizh',
      username: 'ahmad_hifzh',
      currentStreak: 5,
      lastSurah: "QS. An-Naba' : Ayat 1-10",
      lastScore: 92.5,
      lastActive: '10 menit lalu',
      status: 'active',
    },
    {
      id: '2',
      fullName: 'Muhammad Bilal',
      username: 'mbilal_santri',
      currentStreak: 3,
      lastSurah: "QS. An-Nazi'at : Ayat 1-15",
      lastScore: 68.0,
      lastActive: '1 jam lalu',
      status: 'need_review',
    },
    {
      id: '3',
      fullName: 'Fatimah Az-Zahra',
      username: 'fatimah_z',
      currentStreak: 12,
      lastSurah: "QS. 'Abasa : Ayat 1-20",
      lastScore: 98.0,
      lastActive: '2 jam lalu',
      status: 'active',
    },
    {
      id: '4',
      fullName: 'Zaid bin Tsabit',
      username: 'zaid_t',
      currentStreak: 1,
      lastSurah: 'QS. At-Takwir : Ayat 1-14',
      lastScore: 54.0,
      lastActive: '1 hari lalu',
      status: 'need_review',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'need_review'>('all');

  // Tajwid Modules state
  const [modules, setModules] = useState<TajwidModule[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPromptTopic, setAiPromptTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('sedang');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);
  const [contentBody, setContentBody] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizPassingScore, setQuizPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuestionForm[]>([]);

  const fetchModules = async () => {
    setIsLoadingModules(true);
    try {
      const res = await fetch('/api/v1/tajwid/modules');
      if (res.ok) {
        const data = await res.json();
        setModules(data || []);
      }
    } catch {
      // silently fallback
    } finally {
      setIsLoadingModules(false);
    }
  };

  const fetchSantriMonitoring = async () => {
    try {
      const token = localStorage.getItem('hifzhly_auth_token') || localStorage.getItem('token');
      const res = await fetch('/api/v1/admin/santri', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.santri && Array.isArray(data.santri) && data.santri.length > 0) {
          setSantriList(data.santri);
          setMetrics({
            totalSantri: data.totalSantri || data.santri.length,
            totalSessionsToday: data.totalSessionsToday || 0,
            needReviewCount: data.needReviewCount || 0,
            averageAccuracyScore: data.averageAccuracyScore || 85.0,
          });
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchModules();
    fetchSantriMonitoring();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('hifzhly_auth_token');
    localStorage.removeItem('hifzhly_user_profile');
    navigate('/login');
  };

  const handleOpenAddModal = () => {
    setModuleId(null);
    setTitle('');
    setSlug('');
    setSummary('');
    setYoutubeVideoId('');
    setOrderIndex(modules.length + 1);
    setContentBody('');
    setQuizTitle('');
    setQuizPassingScore(70);
    setQuestions([]);
    setAiPromptTopic('');
    setIsModalOpen(true);
  };

  const handleGenerateAIQuiz = async () => {
    const topicToUse = aiPromptTopic || title || 'Hukum Nun Sukun dan Tanwin';
    setIsGeneratingAI(true);
    try {
      const token = localStorage.getItem('hifzhly_auth_token') || localStorage.getItem('token');
      const res = await fetch('/api/v1/admin/tajwid/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          topic: topicToUse,
          difficulty: aiDifficulty,
          questionCount: 3,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions && Array.isArray(data.questions)) {
          const generatedForms: QuestionForm[] = data.questions.map((q: any) => ({
            questionText: q.questionText,
            verseArabic: q.verseArabic || '',
            syarahExplanation: q.syarahExplanation || '',
            options: (q.options || []).map((opt: any) => ({
              optionText: opt.optionText,
              isCorrect: !!opt.isCorrect,
            })),
          }));
          setQuestions((prev) => [...prev, ...generatedForms]);
          if (!quizTitle) {
            setQuizTitle(`Kuis Evaluasi ${topicToUse}`);
          }
          showToast(`Berhasil menghasilkan ${generatedForms.length} soal kuis dari Gemini AI.`);
        }
      } else {
        showToast('Gagal memanggil generator AI. Gunakan input manual atau periksa konfigurasi.');
      }
    } catch {
      showToast('Koneksi terputus saat memanggil generator kuis AI.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddQuestionManual = () => {
    setQuestions([
      ...questions,
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
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSaveModuleAndQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) {
      alert('Judul dan slug wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('hifzhly_auth_token') || localStorage.getItem('token');
      const authHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // 1. Save or Update Module
      const modulePayload = {
        title,
        slug,
        summary,
        youtubeVideoId,
        orderIndex: Number(orderIndex),
        contentBody,
      };

      const moduleUrl = moduleId
        ? `/api/v1/admin/tajwid/modules/${moduleId}`
        : `/api/v1/admin/tajwid/modules`;
      const moduleMethod = moduleId ? 'PUT' : 'POST';

      const modRes = await fetch(moduleUrl, {
        method: moduleMethod,
        headers: authHeaders,
        body: JSON.stringify(modulePayload),
      });

      if (!modRes.ok) {
        throw new Error('Gagal menyimpan modul tajwid.');
      }

      const savedModule = await modRes.json();
      const targetModuleId = savedModule.id || moduleId;

      // 2. If questions present, save Quiz
      if (questions.length > 0 && targetModuleId) {
        const quizPayload = {
          title: quizTitle || `Kuis Evaluasi ${title}`,
          description: `Evaluasi pemahaman materi ${title}`,
          passingScore: Number(quizPassingScore),
          questions: questions.map((q, qIdx) => ({
            questionText: q.questionText,
            verseArabic: q.verseArabic,
            syarahExplanation: q.syarahExplanation,
            orderIndex: qIdx + 1,
            options: q.options.map((opt, oIdx) => ({
              optionText: opt.optionText,
              isCorrect: opt.isCorrect,
              orderIndex: oIdx + 1,
            })),
          })),
        };

        await fetch(`/api/v1/admin/tajwid/modules/${targetModuleId}/quizzes`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(quizPayload),
        });
      }

      showToast('Modul dan kurikulum kuis berhasil disimpan.');
      setIsModalOpen(false);
      fetchModules();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async (id: string, modTitle: string) => {
    if (!confirm(`Hapus modul "${modTitle}" beserta kuis terkait?`)) return;
    try {
      const token = localStorage.getItem('hifzhly_auth_token') || localStorage.getItem('token');
      const res = await fetch(`/api/v1/admin/tajwid/modules/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        showToast(`Modul "${modTitle}" berhasil dihapus.`);
        fetchModules();
      } else {
        alert('Gagal menghapus modul.');
      }
    } catch {
      alert('Koneksi terputus.');
    }
  };

  const filteredSantri = santriList.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Notification Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-emerald-700 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-white/70 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. PERMANENT DESKTOP SIDEBAR (Clean White & Emerald) */}
      <aside className="w-64 bg-white border-r border-slate-200/90 flex-col justify-between shrink-0 h-screen sticky top-0 hidden md:flex z-30">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <Link to="/admin" className="flex items-center space-x-2.5">
              <img src="/logo saja.png" alt="Hifzhly" className="w-8 h-8 object-contain" />
              <div>
                <span className="font-black text-lg text-slate-900 tracking-tight block leading-none">
                  Hifzhly<span className="text-emerald-600">.</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-1 mt-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Portal Musyrif</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Musyrif Profile Summary Card */}
          <div className="p-4 mx-3 my-3 bg-emerald-50/60 rounded-2xl border border-emerald-100/80 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
              UP
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 truncate">Ustadz Pembina</h4>
              <p className="text-[10px] text-slate-500 truncate">Musyrif Pesantren</p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-semibold text-emerald-700">Aktif Bertugas</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 mt-2">
            <button
              type="button"
              onClick={() => setActiveTab('santri')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'santri'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Users className="w-4 h-4" />
                <span>Monitoring Santri</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'santri'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {santriList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tajwid')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tajwid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <GraduationCap className="w-4 h-4" />
                <span>Kurikulum Tajwid</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'tajwid'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {modules.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('tajwid');
                handleOpenAddModal();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>Buat Kuis AI</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Gemini
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 space-y-1">
          <Link
            to="/app"
            className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-slate-400" />
            <span>Lihat Aplikasi Santri</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-64 bg-white h-full p-4 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <img src="/logo saja.png" alt="Hifzhly" className="w-7 h-7 object-contain" />
                  <span className="font-bold text-base text-slate-900">Portal Musyrif</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('santri');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                    activeTab === 'santri' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Monitoring Santri</span>
                  </div>
                  <span>{santriList.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('tajwid');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                    activeTab === 'tajwid' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>Kurikulum Tajwid</span>
                  </div>
                  <span>{modules.length}</span>
                </button>
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-1">
              <Link
                to="/app"
                className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-600"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Lihat Aplikasi Santri</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-rose-600"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE CONTENT */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 md:hidden"
              title="Buka menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {activeTab === 'santri'
                  ? 'Monitoring Hafalan & Mutabaah Santri'
                  : 'Manajemen Kurikulum Tajwid & Kuis AI'}
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {activeTab === 'santri'
                  ? 'Pantau progres setoran murojaah mandiri, akurasi tajwid AI, dan status bimbingan'
                  : 'Kelola modul teori, video pembelajaran, dan buat soal pilihan ganda interaktif'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                fetchModules();
                fetchSantriMonitoring();
                showToast('Data berhasil diperbarui');
              }}
              className="p-2 sm:px-3 sm:py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              title="Segarkan data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingModules ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {activeTab === 'tajwid' && (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Modul</span>
              </button>
            )}
          </div>
        </header>

        {/* Workspace Body */}
        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6 flex-1">
          {activeTab === 'santri' ? (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* 4 KPI Metrics Cards (Light White & Emerald) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Total Santri
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {metrics.totalSantri}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Santri terdaftar aktif</p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Setoran Hari Ini
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {metrics.totalSessionsToday}
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Sesi Murojaah AI</p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Perlu Tasmi'
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-amber-700 tracking-tight">
                    {metrics.needReviewCount} Santri
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Skor akurasi &lt; 70%</p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Akurasi Rata-rata
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-800 tracking-tight">
                    {metrics.averageAccuracyScore.toFixed(1)}%
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Akurasi tajwid & makhraj</p>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari santri berdasarkan nama..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex items-center space-x-1.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      filterStatus === 'all'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua ({santriList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('active')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      filterStatus === 'active'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Lancar
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('need_review')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      filterStatus === 'need_review'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Perlu Tasmi'
                  </button>
                </div>
              </div>

              {/* Santri Table (Clean Light Surface) */}
              <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-5 py-3.5">Santri</th>
                        <th className="px-5 py-3.5">Murojaah Terakhir</th>
                        <th className="px-5 py-3.5">Akurasi Tajwid</th>
                        <th className="px-5 py-3.5">Streak</th>
                        <th className="px-5 py-3.5">Status Evaluasi</th>
                        <th className="px-5 py-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSantri.map((santri) => (
                        <tr key={santri.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                                {santri.fullName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">{santri.fullName}</span>
                                <span className="text-[10px] text-slate-400">@{santri.username}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-semibold text-slate-800 block">{santri.lastSurah}</span>
                            <span className="text-[10px] text-slate-400">{santri.lastActive}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`font-bold font-mono text-xs ${
                                  santri.lastScore >= 80
                                    ? 'text-emerald-700'
                                    : santri.lastScore >= 65
                                    ? 'text-amber-700'
                                    : 'text-rose-700'
                                }`}
                              >
                                {santri.lastScore}%
                              </span>
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <div
                                  className={`h-full rounded-full ${
                                    santri.lastScore >= 80
                                      ? 'bg-emerald-500'
                                      : santri.lastScore >= 65
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${santri.lastScore}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                              <Flame className="w-3.5 h-3.5 text-amber-600" />
                              <span>{santri.currentStreak} hari</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {santri.status === 'active' ? (
                              <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Lancar</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span>Perlu Tasmi'</span>
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                showToast(`Catatan pembinaan untuk ${santri.fullName} telah dibuka.`)
                              }
                              className="px-2.5 py-1.5 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 font-bold transition-colors cursor-pointer inline-flex items-center space-x-1"
                            >
                              <span>Bimbing</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Tajwid Management Workspace */
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-emerald-600" />
                    <span>Daftar Modul Kurikulum Tajwid</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kelola materi tajwid dan bank soal kuis AI yang tersinkronisasi langsung ke halaman Tajwid Santri
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Modul & Kuis AI</span>
                  </button>
                </div>
              </div>

              {/* Modules Grid */}
              {isLoadingModules ? (
                <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                  <p className="text-xs font-semibold">Memuat kurikulum tajwid...</p>
                </div>
              ) : modules.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 space-y-3">
                  <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm font-bold text-slate-700">Belum Ada Modul Tajwid</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Klik tombol "Tambah Modul & Kuis AI" di atas untuk menambahkan modul pertama.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {modules.map((mod) => (
                    <div
                      key={mod.id}
                      className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-300 hover:shadow-xs transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
                          <span className="font-mono bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                            Modul #{mod.orderIndex}
                          </span>
                          {mod.youtubeVideoId && (
                            <span className="inline-flex items-center space-x-1 text-rose-600 font-semibold text-[11px]">
                              <Video className="w-3.5 h-3.5" />
                              <span>Video YouTube</span>
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-1">
                          {mod.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                          {mod.summary || 'Tidak ada ringkasan materi.'}
                        </p>

                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>
                              {mod.quiz ? `${mod.quiz.questions?.length || 0} Soal Kuis` : 'Belum ada kuis'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">/{mod.slug}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <Link
                          to={`/app/tajwid?module=${mod.slug}`}
                          target="_blank"
                          className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center space-x-1"
                        >
                          <span>Tinjau Modul</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDeleteModule(mod.id, mod.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Modul"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 4. MODAL: TAMBAH MODUL & KUIS GEMINI AI (Clean White Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-linear-to-b from-emerald-50/50 to-white flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <span>Tambah Modul &amp; Kuis Evaluasi AI</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lengkapi kaidah tajwid, materi video, dan generate bank soal kuis dengan Gemini AI
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveModuleAndQuiz} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Section 1: Data Modul */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 pb-2 border-b border-slate-100">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>1. Informasi Materi Modul</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Judul Modul <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Hukum Mim Sukun"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (!slug) {
                          setSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/(^-|-$)/g, '')
                          );
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Slug URL <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="hukum-mim-sukun"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-[11px] focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Ringkasan Singkat
                    </label>
                    <input
                      type="text"
                      placeholder="Ringkasan 1-2 kalimat untuk kartu materi..."
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Urutan Tampil
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={orderIndex}
                      onChange={(e) => setOrderIndex(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <Video className="w-3.5 h-3.5 text-rose-500" />
                    <span>YouTube Video ID (Opsional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 7kK84x4_uY8"
                    value={youtubeVideoId}
                    onChange={(e) => setYoutubeVideoId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Isi Materi Tajwid Lengkap (Mendukung Markdown &amp; Teks Arab)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tuliskan penjelasan kaidah tajwid, contoh ayat, dan pembahasannya di sini..."
                    value={contentBody}
                    onChange={(e) => setContentBody(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 font-sans focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed resize-none"
                  />
                </div>
              </div>

              {/* Section 2: Generator Kuis Gemini AI */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>2. Bank Soal &amp; Generator Kuis (Gemini AI)</span>
                  </h4>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-[11px] font-bold text-emerald-950">
                        Topik Soal Tajwid untuk AI
                      </label>
                      <input
                        type="text"
                        placeholder={title || 'Contoh: Iqlab dan Idgham Bighunnah'}
                        value={aiPromptTopic}
                        onChange={(e) => setAiPromptTopic(e.target.value)}
                        className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-emerald-950">
                        Tingkat Kesulitan
                      </label>
                      <select
                        value={aiDifficulty}
                        onChange={(e) => setAiDifficulty(e.target.value)}
                        className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="mudah">Mudah (Dasar)</option>
                        <option value="sedang">Sedang (Standar)</option>
                        <option value="sulit">Sulit (Mendalam)</option>
                      </select>
                    </div>

                    <div>
                      <button
                        type="button"
                        disabled={isGeneratingAI}
                        onClick={handleGenerateAIQuiz}
                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        {isGeneratingAI ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Menyusun...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Generate Soal AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quiz Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Judul Kuis Evaluasi
                    </label>
                    <input
                      type="text"
                      placeholder={`Kuis Evaluasi ${title || 'Tajwid'}`}
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Nilai Kelulusan Minimal
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={quizPassingScore}
                      onChange={(e) => setQuizPassingScore(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Daftar Pertanyaan ({questions.length} Soal)
                    </span>
                    <button
                      type="button"
                      onClick={handleAddQuestionManual}
                      className="text-xs text-emerald-700 hover:text-emerald-900 flex items-center space-x-1 font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Soal Manual</span>
                    </button>
                  </div>

                  {questions.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-xs">
                      Belum ada soal kuis. Gunakan tombol "Generate Soal AI" di atas atau tambahkan manual.
                    </div>
                  ) : (
                    questions.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-2.5"
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-lg">
                            Soal #{qIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Hapus soal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            Pertanyaan
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Tuliskan pertanyaan kuis..."
                            value={q.questionText}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[qIdx].questionText = e.target.value;
                              setQuestions(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            Potongan Ayat Al-Qur'an (Opsional)
                          </label>
                          <input
                            type="text"
                            dir="rtl"
                            placeholder="Contoh: مَن يَقُولُ"
                            value={q.verseArabic || ''}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[qIdx].verseArabic = e.target.value;
                              setQuestions(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-quran text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-right"
                          />
                        </div>

                        {/* Options */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Pilihan Jawaban (Pilih radio untuk jawaban BENAR)
                          </label>
                          <div className="space-y-1.5">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name={`correct-option-${qIdx}`}
                                  checked={opt.isCorrect}
                                  onChange={() => {
                                    const updated = [...questions];
                                    updated[qIdx].options.forEach((o, i) => {
                                      o.isCorrect = i === oIdx;
                                    });
                                    setQuestions(updated);
                                  }}
                                  className="w-4 h-4 text-emerald-600 accent-emerald-600"
                                />
                                <input
                                  type="text"
                                  required
                                  placeholder={`Pilihan ${String.fromCharCode(65 + oIdx)}`}
                                  value={opt.optionText}
                                  onChange={(e) => {
                                    const updated = [...questions];
                                    updated[qIdx].options[oIdx].optionText = e.target.value;
                                    setQuestions(updated);
                                  }}
                                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            Syarah &amp; Pembahasan
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Alasan mengapa jawaban tersebut benar menurut kaidah tajwid..."
                            value={q.syarahExplanation}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[qIdx].syarahExplanation = e.target.value;
                              setQuestions(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Modul &amp; Kuis</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
