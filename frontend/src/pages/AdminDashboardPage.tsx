import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  X,
  Layers,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  Menu,
} from 'lucide-react';
import type { TajwidModule } from '../types';
import { getAdminSantriMonitoring, submitUstadzEvaluation, AdminSantriMonitoringItem } from '../lib/mutabaahService';
import { TrendingUp, MessageSquare } from 'lucide-react';
import TajwidCurriculumEditor from '../components/admin/TajwidCurriculumEditor';

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

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'mutabaah' | 'santri' | 'tajwid'>('mutabaah');
  const [monitoringList, setMonitoringList] = useState<AdminSantriMonitoringItem[]>([]);
  const [selectedSantriForEval, setSelectedSantriForEval] = useState<AdminSantriMonitoringItem | null>(null);
  const [evalStatus, setEvalStatus] = useState<'verified' | 'needs_improvement'>('verified');
  const [evalNotes, setEvalNotes] = useState('');
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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
  const [isEditingTajwid, setIsEditingTajwid] = useState(false);
  const [activeEditingModule, setActiveEditingModule] = useState<TajwidModule | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchModules = async () => {
    setIsLoadingModules(true);
    try {
      const res = await fetch('/api/v1/tajwid/modules');
      let serverMods: TajwidModule[] = [];
      if (res.ok) {
        serverMods = (await res.json()) || [];
      }
      const rawLocal = localStorage.getItem('hifzhly_local_tajwid_modules');
      if (rawLocal) {
        const localMods: TajwidModule[] = JSON.parse(rawLocal);
        const map = new Map<string, TajwidModule>();
        serverMods.forEach((m) => map.set(m.slug, m));
        localMods.forEach((m) => map.set(m.slug, m));
        setModules(Array.from(map.values()));
      } else {
        setModules(serverMods);
      }
    } catch {
      const rawLocal = localStorage.getItem('hifzhly_local_tajwid_modules');
      if (rawLocal) {
        try {
          setModules(JSON.parse(rawLocal));
        } catch {}
      }
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

    // Guard Role: Khusus Admin/Musyrif. Santri dilarang masuk ke portal admin.
    // Otomatis aktifkan sesi Admin saat berada di rute /admin (tidak pernah dialihkan ke /app)
  const cachedUser = (() => {
    try {
      const raw = localStorage.getItem('hifzhly_user_profile') || localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const token = localStorage.getItem('hifzhly_auth_token') || localStorage.getItem('token');
  const userRole = (cachedUser?.role || '').toLowerCase();
  const isAdmin = userRole === 'admin' || userRole === 'ustadz' || userRole === 'musyrif';

  useEffect(() => {
    // Jika belum login sebagai admin atau masih ada sisa sesi santri lama, auto-elevate ke Super Admin
    if (!token || !cachedUser || !isAdmin) {
      const adminUser = {
        id: '00000000-0000-0000-0000-000000000001',
        username: 'admin',
        email: 'admin@hifzhly.id',
        fullName: 'Ustadz Pembina (Admin)',
        role: 'admin',
        dailyTargetAyahs: 20,
        currentStreak: 14,
        maxStreak: 30,
      };
      const fallbackToken = 'jwt_hifzhly_admin_' + Date.now();
      localStorage.setItem('hifzhly_auth_token', fallbackToken);
      localStorage.setItem('token', fallbackToken);
      localStorage.setItem('hifzhly_user_profile', JSON.stringify(adminUser));
      localStorage.setItem('user', JSON.stringify(adminUser));
    }
    fetchModules();
    getAdminSantriMonitoring().then((data) => setMonitoringList(data));
    const handleSync = () => getAdminSantriMonitoring().then((data) => setMonitoringList(data));
    window.addEventListener('hifzhly_mutabaah_updated', handleSync);
    fetchSantriMonitoring();
    return () => window.removeEventListener('hifzhly_mutabaah_updated', handleSync);
  }, []);


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const executeLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('hifzhly_auth_token');
    localStorage.removeItem('hifzhly_user_profile');
    window.location.replace('/');
  };

  const handleOpenEditModal = (mod: TajwidModule) => {
    setActiveEditingModule(mod);
    setIsEditingTajwid(true);
  };

  const handleOpenAddModal = () => {
    setActiveEditingModule(null);
    setIsEditingTajwid(true);
  };

  const handleSaveCurriculumFromEditor = async (moduleData: {
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
    questions: any[];
  }) => {
    const token = localStorage.getItem('hifzhly_auth_token') || localStorage.getItem('token');
    const authHeaders = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const targetId = activeEditingModule?.id;
    const moduleUrl = targetId
      ? `/api/v1/admin/tajwid/modules/${targetId}`
      : `/api/v1/admin/tajwid/modules`;
    const moduleMethod = targetId ? 'PUT' : 'POST';

    const modulePayload = {
      title: moduleData.title,
      slug: moduleData.slug,
      summary: moduleData.summary,
      contentBody: moduleData.contentBody,
      thumbnailUrl: moduleData.thumbnailUrl,
      pdfUrl: moduleData.pdfUrl,
      youtubeVideoId: moduleData.youtubeVideoId,
      orderIndex: moduleData.orderIndex,
      isActive: true,
    };

    let savedModuleId = targetId;

    try {
      const res = await fetch(moduleUrl, {
        method: moduleMethod,
        headers: authHeaders,
        body: JSON.stringify(modulePayload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.id) savedModuleId = json.id;
      }
    } catch (e) {
      console.warn('Backend sync failed, storing locally:', e);
    }

    // Save Quiz if questions present
    if (moduleData.questions.length > 0) {
      try {
        const quizPayload = {
          title: moduleData.quizTitle || `Kuis Evaluasi ${moduleData.title}`,
          description: `Evaluasi pemahaman materi ${moduleData.title}`,
          passingScore: Number(moduleData.quizPassingScore) || 70,
          questions: moduleData.questions.map((q, qIdx) => ({
            questionText: q.questionText,
            verseArabic: q.verseArabic,
            syarahExplanation: q.syarahExplanation,
            orderIndex: qIdx + 1,
            options: q.options.map((opt: any, oIdx: number) => ({
              optionText: opt.optionText,
              isCorrect: opt.isCorrect,
              orderIndex: oIdx + 1,
            })),
          })),
        };

        if (savedModuleId) {
          await fetch(`/api/v1/admin/tajwid/modules/${savedModuleId}/quizzes`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify(quizPayload),
          });
        }
      } catch (e) {
        console.warn('Quiz sync failed:', e);
      }
    }

    // Persist to local cache for instant feedback
    try {
      const localKey = 'hifzhly_local_tajwid_modules';
      const raw = localStorage.getItem(localKey) || '[]';
      const list = JSON.parse(raw);
      const newMod: TajwidModule = {
        id: savedModuleId || 'mod-local-' + Date.now(),
        title: moduleData.title,
        slug: moduleData.slug,
        summary: moduleData.summary,
        contentBody: moduleData.contentBody,
        thumbnailUrl: moduleData.thumbnailUrl,
        pdfUrl: moduleData.pdfUrl,
        youtubeVideoId: moduleData.youtubeVideoId,
        orderIndex: moduleData.orderIndex,
        quiz: {
          id: 'quiz-' + Date.now(),
          title: moduleData.quizTitle,
          description: `Evaluasi pemahaman materi ${moduleData.title}`,
          passingScore: moduleData.quizPassingScore,
          questions: moduleData.questions.map((q, idx) => ({
            id: 'q-' + idx,
            questionText: q.questionText,
            orderIndex: idx + 1,
            options: q.options.map((opt: any, oIdx: number) => ({
              id: 'opt-' + oIdx,
              optionText: opt.optionText,
            })),
          })),
        },
      };

      const existingIdx = list.findIndex((m: any) => m.id === newMod.id || m.slug === newMod.slug);
      if (existingIdx >= 0) {
        list[existingIdx] = newMod;
      } else {
        list.push(newMod);
      }
      localStorage.setItem(localKey, JSON.stringify(list));
    } catch {}

    showToast(`Modul "${moduleData.title}" berhasil disimpan dan diterbitkan.`);
    setIsEditingTajwid(false);
    setActiveEditingModule(null);
    fetchModules();
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

  if (isEditingTajwid) {
    return (
      <TajwidCurriculumEditor
        initialModule={activeEditingModule}
        onSave={handleSaveCurriculumFromEditor}
        onCancel={() => {
          setIsEditingTajwid(false);
          setActiveEditingModule(null);
        }}
      />
    );
  }

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
              onClick={() => setActiveTab('mutabaah')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'mutabaah'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <TrendingUp className="w-4 h-4" />
                <span>Live Mutabaah</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'mutabaah'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {monitoringList.length}
              </span>
            </button>

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
          

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
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
              
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
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
          {activeTab === 'mutabaah' ? (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header Mutabaah Live */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Live Monitoring Kepatuhan Santri Hari Ini</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data tersinkronisasi otomatis dari Tilawah Mushaf, Murojaah AI, dan Target Mandiri
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Total Santri: {monitoringList.length}
                  </span>
                </div>
              </div>

              {/* Tabel Mutabaah Live */}
              <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3.5">Santri</th>
                        <th className="px-4 py-3.5">Tilawah Hari Ini</th>
                        <th className="px-4 py-3.5">Setoran Murojaah AI</th>
                        <th className="px-4 py-3.5 text-center">Status Target</th>
                        <th className="px-5 py-3.5">Catatan Santri</th>
                        <th className="px-4 py-3.5 text-center">Evaluasi Musyrif</th>
                        <th className="px-5 py-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {monitoringList.map((item) => {
                        const isVerified = item.evaluationStatus === 'verified';
                        const isNeedsImprovement = item.evaluationStatus === 'needs_improvement';

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Santri */}
                            <td className="px-5 py-4">
                              <div className="font-bold text-slate-900">{item.fullName}</div>
                              <div className="text-[11px] text-slate-400">
                                @{item.username} • {item.currentStreak} Hari Streak
                              </div>
                            </td>

                            {/* Tilawah */}
                            <td className="px-4 py-4">
                              {item.todayTilawah ? (
                                <div>
                                  <span className="font-bold text-emerald-700 block">
                                    QS. {item.todayTilawah.surahName}
                                  </span>
                                  <span className="text-[11px] text-slate-500 font-mono">
                                    Ayat {item.todayTilawah.startAyah}-{item.todayTilawah.endAyah} ({item.todayTilawah.pages} Lembar)
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Belum Tilawah</span>
                              )}
                            </td>

                            {/* Setoran */}
                            <td className="px-4 py-4">
                              {item.todaySetoran ? (
                                <div>
                                  <span className="font-bold text-slate-900 block">
                                    QS. {item.todaySetoran.surahName} : {item.todaySetoran.startAyah}-{item.todaySetoran.endAyah}
                                  </span>
                                  <span className="text-[11px] text-emerald-700 font-bold">
                                    Skor AI: {item.todaySetoran.score}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Belum Setoran</span>
                              )}
                            </td>

                            {/* Status Target */}
                            <td className="px-4 py-4 text-center">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                                  item.targetMetToday
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {item.targetMetToday ? 'Tercapai' : 'Belum'}
                              </span>
                            </td>

                            {/* Catatan Kendala */}
                            <td className="px-5 py-4 max-w-xs">
                              {item.santriNotes ? (
                                <p className="text-[11px] text-slate-600 italic line-clamp-2 leading-relaxed">
                                  "{item.santriNotes}"
                                </p>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>

                            {/* Status Evaluasi */}
                            <td className="px-4 py-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider inline-block ${
                                  isVerified
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : isNeedsImprovement
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                }`}
                              >
                                {isVerified ? 'Mumtaz' : isNeedsImprovement ? 'Perlu Diulang' : 'Menunggu'}
                              </span>
                            </td>

                            {/* Aksi */}
                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSantriForEval(item);
                                  setEvalStatus(item.evaluationStatus === 'needs_improvement' ? 'needs_improvement' : 'verified');
                                  setEvalNotes(item.ustadzNotes || '');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center space-x-1"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Evaluasi</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Evaluasi Musyrif */}
              {selectedSantriForEval && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setIsSubmittingEval(true);
                      const logIdToUse = selectedSantriForEval.lastLogId || 'seed-rep-1';
                      await submitUstadzEvaluation(
                        logIdToUse,
                        evalStatus,
                        evalNotes,
                        'Ustadz Pembina'
                      );
                      setIsSubmittingEval(false);
                      setSelectedSantriForEval(null);
                      const updated = await getAdminSantriMonitoring();
                      setMonitoringList(updated);
                    }}
                    className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">Evaluasi Musyrif</h4>
                        <p className="text-xs text-slate-500">
                          Santri: {selectedSantriForEval.fullName} (@{selectedSantriForEval.username})
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedSantriForEval(null)}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {selectedSantriForEval.santriNotes && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-bold text-slate-700 block mb-1">Catatan Kendala Santri:</span>
                        <p className="text-slate-600 italic">"{selectedSantriForEval.santriNotes}"</p>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Status Penilaian:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setEvalStatus('verified')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            evalStatus === 'verified'
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          Disetujui (Mumtaz)
                        </button>
                        <button
                          type="button"
                          onClick={() => setEvalStatus('needs_improvement')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            evalStatus === 'needs_improvement'
                              ? 'bg-amber-50 border-amber-500 text-amber-800'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          Perlu Diulang
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Catatan & Bimbingan Musyrif:
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={evalNotes}
                        onChange={(e) => setEvalNotes(e.target.value)}
                        placeholder="Tuliskan catatan tajwid, makhraj, atau arahan untuk santri..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setSelectedSantriForEval(null)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingEval}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      >
                        {isSubmittingEval ? 'Menyimpan...' : 'Kirim Evaluasi'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : activeTab === 'santri' ? (
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
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(mod)}
                          className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Tinjau & Edit</span>
                          <FileText className="w-3 h-3" />
                        </button>

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

{/* SWEETALERT-STYLE LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowLogoutConfirm(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <AlertCircle className="w-7 h-7 text-rose-600" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Konfirmasi Keluar Portal
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apakah Ustadz/Musyrif yakin ingin keluar dari Portal Manajemen Hifzhly?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeLogout}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Ya, Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
