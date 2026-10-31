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
  GraduationCap
} from 'lucide-react';
import type { TajwidModule } from '../types';
import { getAdminSantriMonitoring, submitUstadzEvaluation, AdminSantriMonitoringItem } from '../lib/mutabaahService';
import { TrendingUp, ShieldCheck, AlertCircle, MessageSquare } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'mutabaah' | 'santri' | 'tajwid'>('mutabaah');
  // Live Mutabaah Monitoring State
  const [monitoringList, setMonitoringList] = useState<AdminSantriMonitoringItem[]>([]);
  const [selectedSantriForEval, setSelectedSantriForEval] = useState<AdminSantriMonitoringItem | null>(null);
  const [evalStatus, setEvalStatus] = useState<'verified' | 'needs_improvement'>('verified');
  const [evalNotes, setEvalNotes] = useState('');
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);

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
    getAdminSantriMonitoring().then((data) => setMonitoringList(data));
    const handleSync = () => getAdminSantriMonitoring().then((data) => setMonitoringList(data));
    window.addEventListener('hifzhly_mutabaah_updated', handleSync);
    fetchSantriMonitoring();
  }, []);


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Notification Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-emerald-400/30 text-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-100" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/app" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg font-serif">
                ح
              </div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Hifzhly Admin
              </span>
            </Link>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
              Portal Asatidz & Musyrif
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/app"
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition"
            >
              Lihat Aplikasi Santri
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-md border border-slate-800 transition flex items-center gap-1.5 text-xs"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6">
          <button
            onClick={() => setActiveTab('mutabaah')}
            className={`py-3.5 text-sm font-medium border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'mutabaah'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Live Mutabaah & Evaluasi</span>
          </button>
          <button
            onClick={() => setActiveTab('santri')}
            className={`py-3.5 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'santri'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Monitoring Santri</span>
          </button>
          <button
            onClick={() => setActiveTab('tajwid')}
            className={`py-3.5 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'tajwid'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Kurikulum & Kuis Tajwid AI</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeTab === 'mutabaah' ? (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header Mutabaah Live */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span>Live Rekapitulasi Mutabaah Yaumiyyah Santri</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Pantau kepatuhan target tilawah lembar, setoran suara AI, dan berikan catatan evaluasi langsung ke santri.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                  Total Santri Terpantau: {monitoringList.length}
                </span>
              </div>
            </div>

            {/* Table of Live Monitoring */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-700/60">
                    <tr>
                      <th className="px-5 py-3.5">Santri</th>
                      <th className="px-4 py-3.5">Tilawah Hari Ini</th>
                      <th className="px-4 py-3.5">Setoran Murojaah AI</th>
                      <th className="px-4 py-3.5 text-center">Status Target</th>
                      <th className="px-5 py-3.5">Catatan Kendala Santri</th>
                      <th className="px-4 py-3.5 text-center">Evaluasi Musyrif</th>
                      <th className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {monitoringList.map((item) => {
                      const isVerified = item.evaluationStatus === 'verified';
                      const isNeedsImprovement = item.evaluationStatus === 'needs_improvement';

                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                          {/* Santri */}
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-100">{item.fullName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              @{item.username} • {item.currentStreak} Hari Streak
                            </div>
                          </td>

                          {/* Tilawah */}
                          <td className="px-4 py-4">
                            {item.todayTilawah ? (
                              <div>
                                <span className="font-bold text-teal-400 block">
                                  QS. {item.todayTilawah.surahName}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  Ayat {item.todayTilawah.startAyah}-{item.todayTilawah.endAyah} ({item.todayTilawah.pages} Lembar)
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-500 font-mono italic">Belum Tilawah</span>
                            )}
                          </td>

                          {/* Setoran */}
                          <td className="px-4 py-4">
                            {item.todaySetoran ? (
                              <div>
                                <span className="font-bold text-emerald-400 block">
                                  QS. {item.todaySetoran.surahName} : {item.todaySetoran.startAyah}-{item.todaySetoran.endAyah}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  Skor AI: <strong className="text-emerald-400">{item.todaySetoran.score}%</strong>
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-500 font-mono italic">Belum Setoran</span>
                            )}
                          </td>

                          {/* Target */}
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold inline-block ${
                                item.targetMetToday
                                  ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                                  : 'bg-amber-950 border border-amber-800 text-amber-300'
                              }`}
                            >
                              {item.targetMetToday ? 'Tercapai' : 'Belum'}
                            </span>
                          </td>

                          {/* Catatan Santri */}
                          <td className="px-5 py-4 max-w-xs">
                            {item.santriNotes ? (
                              <p className="text-[11px] text-slate-300 italic line-clamp-2 leading-relaxed">
                                "{item.santriNotes}"
                              </p>
                            ) : (
                              <span className="text-slate-600 font-mono text-[11px]">-</span>
                            )}
                          </td>

                          {/* Evaluasi Musyrif Status */}
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block ${
                                isVerified
                                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                                  : isNeedsImprovement
                                  ? 'bg-amber-900/60 text-amber-300 border border-amber-700/60'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {isVerified ? 'Mumtaz' : isNeedsImprovement ? 'Perlu Diulang' : 'Menunggu Review'}
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
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center space-x-1"
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
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmittingEval(true);
                    await submitUstadzEvaluation(
                      selectedSantriForEval.lastLogId || 'seed-rep-1',
                      evalStatus,
                      evalNotes,
                      'Ustadz Ahmad, Lc.'
                    );
                    setIsSubmittingEval(false);
                    setSelectedSantriForEval(null);
                    getAdminSantriMonitoring().then((data) => setMonitoringList(data));
                    showToast(`Catatan evaluasi untuk ${selectedSantriForEval.fullName} berhasil dikirim!`);
                  }}
                  className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-200"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="font-bold text-white text-base">
                        Evaluasi Mutabaah Santri
                      </h3>
                      <p className="text-xs text-slate-400">
                        {selectedSantriForEval.fullName} (@{selectedSantriForEval.username})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSantriForEval(null)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-xl cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Ringkasan Setoran & Catatan Santri */}
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1.5 text-xs">
                    <div className="font-bold text-slate-100">
                      Aktivitas Terakhir: QS. {selectedSantriForEval.todaySetoran?.surahName || selectedSantriForEval.todayTilawah?.surahName || "Al-Qur'an"}
                    </div>
                    {selectedSantriForEval.santriNotes && (
                      <div className="text-slate-300 italic pt-1 border-t border-slate-700/50">
                        Catatan Santri: "{selectedSantriForEval.santriNotes}"
                      </div>
                    )}
                  </div>

                  {/* Radio Pilihan Status */}
                  <div className="space-y-2 text-xs">
                    <label className="font-bold text-slate-300 block">Status Penilaian Musyrif:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEvalStatus('verified')}
                        className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                          evalStatus === 'verified'
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 mb-1 text-emerald-400" />
                        <div>Disetujui (Mumtaz)</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEvalStatus('needs_improvement')}
                        className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                          evalStatus === 'needs_improvement'
                            ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-sm'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4 mb-1 text-amber-400" />
                        <div>Perlu Diulang</div>
                      </button>
                    </div>
                  </div>

                  {/* Input Catatan Evaluasi Ustadz */}
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-slate-300 block">
                      Catatan Arahan &amp; Bimbingan Ustadz:
                    </label>
                    <textarea
                      rows={3}
                      value={evalNotes}
                      onChange={(e) => setEvalNotes(e.target.value)}
                      required
                      placeholder="Contoh: Maa syaa Allah lancar, perhatikan mad jaiz munfashil di ayat 158..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
                    />
                    <p className="text-[10px] text-slate-400">
                      Catatan ini akan langsung tampil di kartu mutabaah dan timeline jurnal santri.
                    </p>
                  </div>

                  {/* Footer Modal */}
                  <div className="pt-2 flex justify-end space-x-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSelectedSantriForEval(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingEval}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      {isSubmittingEval ? 'Mengirim...' : 'Kirim Catatan Evaluasi'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : activeTab === 'santri' ? (
          <div>
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                    Total Santri Aktif
                  </span>
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-slate-100">{metrics.totalSantri} Santri</div>
                <div className="text-xs text-slate-400 mt-1">92% aktif dalam 24 jam terakhir</div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                    Setoran Hari Ini
                  </span>
                  <BookOpen className="w-5 h-5 text-teal-400" />
                </div>
                <div className="text-2xl font-bold text-slate-100">{metrics.totalSessionsToday} Sesi</div>
                <div className="text-xs text-emerald-400 mt-1">Murojaah mandiri via Audio SRS</div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                    Perlu Pembinaan
                  </span>
                  <Flame className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-400">{metrics.needReviewCount} Santri</div>
                <div className="text-xs text-slate-400 mt-1">Skor tajwid di bawah ambang 70%</div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                    Rata-rata Akurasi
                  </span>
                  <Award className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-slate-100">{metrics.averageAccuracyScore.toFixed(1)}%</div>
                <div className="text-xs text-emerald-400 mt-1">+3.2% dari pekan lalu</div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari santri berdasarkan nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    filterStatus === 'all'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  Semua ({santriList.length})
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    filterStatus === 'active'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  Lancar
                </button>
                <button
                  onClick={() => setFilterStatus('need_review')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    filterStatus === 'need_review'
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  Perlu Tasmi'
                </button>
              </div>
            </div>

            {/* Santri Table */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800 border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-4">Nama Santri</th>
                      <th className="px-6 py-4">Murojaah Terakhir</th>
                      <th className="px-6 py-4">Akurasi Tajwid</th>
                      <th className="px-6 py-4">Streak</th>
                      <th className="px-6 py-4">Status Evaluasi</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredSantri.map((santri) => (
                      <tr key={santri.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-200">{santri.fullName}</div>
                          <div className="text-xs text-slate-400">@{santri.username}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-200">{santri.lastSurah}</div>
                          <div className="text-xs text-slate-400">{santri.lastActive}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold ${
                                santri.lastScore >= 80
                                  ? 'text-emerald-400'
                                  : santri.lastScore >= 65
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {santri.lastScore}%
                            </span>
                            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
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
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded">
                            <Flame className="w-3.5 h-3.5" />
                            <span>{santri.currentStreak} hari</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {santri.status === 'active' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-0.5 rounded">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Lancar
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/40 border border-amber-800/50 px-2.5 py-0.5 rounded">
                              Perlu Tasmi'
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              showToast(`Catatan pembinaan untuk ${santri.fullName} telah dibuka.`)
                            }
                            className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                          >
                            <span>Detail</span>
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
          /* Tajwid Curriculum & AI Quiz Generator Tab */
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  <span>Manajemen Kurikulum Tajwid & Kuis AI</span>
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Kelola materi tajwid, video pembelajaran, serta hasilkan soal kuis otomatis menggunakan Gemini AI.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchModules}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 flex items-center gap-1.5 transition"
                  title="Segarkan data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingModules ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Modul & Kuis AI</span>
                </button>
              </div>
            </div>

            {/* Modules List */}
            {isLoadingModules ? (
              <div className="p-12 text-center text-slate-400 bg-slate-800/30 rounded-xl border border-slate-800">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
                <p className="text-sm">Memuat daftar modul tajwid...</p>
              </div>
            ) : modules.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-slate-800/30 rounded-xl border border-slate-800">
                <BookOpen className="w-8 h-8 mx-auto mb-3 text-slate-500" />
                <p className="text-sm font-semibold text-slate-300">Belum ada modul tajwid di database</p>
                <p className="text-xs text-slate-500 mt-1">
                  Klik tombol "Tambah Modul & Kuis AI" di atas untuk membuat modul materi pertama Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((mod) => (
                  <div
                    key={mod.id}
                    className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 flex flex-col justify-between hover:border-slate-600 transition group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          Urutan #{mod.orderIndex}
                        </span>
                        {mod.youtubeVideoId && (
                          <span className="inline-flex items-center gap-1 text-rose-400">
                            <Video className="w-3.5 h-3.5" />
                            <span>Video</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-100 text-base mb-1.5 group-hover:text-emerald-400 transition">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {mod.summary || 'Tidak ada ringkasan materi.'}
                      </p>

                      <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>
                            {mod.quiz ? `${mod.quiz.questions?.length || 0} Soal Kuis` : 'Belum ada kuis'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">/{mod.slug}</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <a
                        href={`/app/tajwid?module=${mod.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                      >
                        <span>Tinjau</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => handleDeleteModule(mod.id, mod.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded transition"
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

      {/* Modal: Tambah Modul & Kuis AI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  <span>Tambah Modul Pembelajaran & Kuis Evaluasi</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Lengkapi materi tajwid, video panduan, dan generate soal pilihan ganda dengan Gemini AI.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveModuleAndQuiz} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Section 1: Data Modul */}
              <div>
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>1. Data Modul Tajwid</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Judul Modul <span className="text-rose-400">*</span>
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
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Slug URL <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="hukum-mim-sukun"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Ringkasan Materi (Singkat)
                    </label>
                    <input
                      type="text"
                      placeholder="Membahas 3 hukum mim sukun: Ikhfa Syafawi, Idgham Mimi, dan Idzhar Syafawi."
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Urutan Tampil (Order Index)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={orderIndex}
                      onChange={(e) => setOrderIndex(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-rose-400" />
                    <span>YouTube Video ID (Opsional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 7kK84x4_uY8 (dari URL youtube.com/watch?v=...)"
                    value={youtubeVideoId}
                    onChange={(e) => setYoutubeVideoId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Isi Materi Tajwid (Mendukung Markdown & Teks Arab)
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Tuliskan kaidah tajwid, penjelasan makhraj, dan contoh ayat di sini..."
                    value={contentBody}
                    onChange={(e) => setContentBody(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* Section 2: Gemini AI Quiz Generator */}
              <div className="border-t border-slate-800 pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h4 className="text-xs font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>2. Generator Soal Kuis Otomatis (Gemini AI)</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      AI akan menyusun soal pilihan ganda lengkap dengan potongan ayat Al-Qur'an dan syarah/pembahasan ilmiah.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-300 mb-1">
                        Topik Kaidah Tajwid untuk AI
                      </label>
                      <input
                        type="text"
                        placeholder={title || 'Contoh: Iqlab dan Idgham Bighunnah'}
                        value={aiPromptTopic}
                        onChange={(e) => setAiPromptTopic(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Tingkat Kesulitan</label>
                      <select
                        value={aiDifficulty}
                        onChange={(e) => setAiDifficulty(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
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
                        className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Judul Kuis Evaluasi
                    </label>
                    <input
                      type="text"
                      placeholder={`Kuis Evaluasi ${title || 'Tajwid'}`}
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Nilai Kelulusan (Passing Score)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={quizPassingScore}
                      onChange={(e) => setQuizPassingScore(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      Daftar Soal ({questions.length} Soal)
                    </span>
                    <button
                      type="button"
                      onClick={handleAddQuestionManual}
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Soal Manual</span>
                    </button>
                  </div>

                  {questions.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 bg-slate-800/20 border border-dashed border-slate-700 rounded-xl text-xs">
                      Belum ada soal. Klik tombol "Generate Soal AI" di atas atau tambah soal manual.
                    </div>
                  ) : (
                    questions.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-xs font-bold text-emerald-400 bg-slate-800 px-2 py-0.5 rounded">
                            Soal #{qIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="text-slate-400 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Teks Pertanyaan</label>
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
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1">
                            Lafal / Potongan Ayat Arab (Opsional)
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
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-base font-serif text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-right"
                          />
                        </div>

                        {/* Options */}
                        <div>
                          <label className="block text-xs text-slate-300 mb-1.5">
                            Pilihan Jawaban (Pilih satu yang BENAR)
                          </label>
                          <div className="space-y-2">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-2">
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
                                  className="w-4 h-4 text-emerald-500 accent-emerald-500"
                                />
                                <input
                                  type="text"
                                  required
                                  placeholder={`Opsi ${String.fromCharCode(65 + oIdx)}`}
                                  value={opt.optionText}
                                  onChange={(e) => {
                                    const updated = [...questions];
                                    updated[qIdx].options[oIdx].optionText = e.target.value;
                                    setQuestions(updated);
                                  }}
                                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1">
                            Syarah / Penjelasan Jawaban (Ditampilkan saat santri selesai)
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
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-800 pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Modul & Kuis</span>
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
