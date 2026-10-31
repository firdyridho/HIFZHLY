import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, BookOpen, Flame, Award, LogOut, Search, CheckCircle2, ChevronRight } from 'lucide-react';

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
  const navigate = useNavigate();
  const [santriList] = useState<SantriOverview[]>([
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
      lastSurah: 'QS. At-Takwir : Ayat 1-10',
      lastScore: 74.0,
      lastActive: 'Hari ini',
      status: 'need_review',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredSantri = santriList.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('hifzhly_auth_token');
    localStorage.removeItem('hifzhly_user_profile');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Admin Navbar */}
      <header className="sticky top-0 z-40 bg-teal-900 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo saja.png" alt="Hifzhly" className="w-8 h-8 object-contain brightness-0 invert" />
              <span className="font-extrabold text-lg tracking-tight">Hifzhly Admin</span>
            </Link>
            <span className="hidden sm:inline text-[11px] bg-teal-800 text-teal-200 px-2.5 py-0.5 rounded-md font-semibold border border-teal-700">
              Portal Musyrif & Ustaz
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/app"
              className="text-xs font-semibold bg-teal-800 hover:bg-teal-700 text-teal-100 px-3 py-1.5 rounded-lg transition-all"
            >
              Mode Santri
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 text-xs font-semibold bg-red-600/80 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Panel Pengawasan Murojaah Santri
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau perkembangan hafalan, nilai AI voice evaluator, dan konsistensi mutabaah santri secara terukur.
          </p>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Santri Binaan</span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">128 <span className="text-xs font-normal text-slate-500">Santri</span></p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Ayat Dimurojaah Hari Ini</span>
              <p className="text-2xl font-black text-emerald-700 mt-0.5">1,420 <span className="text-xs font-normal text-slate-500">Ayat</span></p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Rata-rata Streak</span>
              <p className="text-2xl font-black text-amber-600 mt-0.5">5.2 <span className="text-xs font-normal text-slate-500">Hari</span></p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Rata-rata Skor AI</span>
              <p className="text-2xl font-black text-sky-700 mt-0.5">88.2%</p>
            </div>
          </div>
        </div>

        {/* Table of Santri */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Aktivitas Murojaah Santri Terbaru</h2>
              <p className="text-xs text-slate-500">Daftar santri yang menyelesaikan sesi evaluasi AI dalam 24 jam terakhir</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama santri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-6">Nama Santri</th>
                  <th className="py-3 px-6">Sesi Terakhir</th>
                  <th className="py-3 px-6">Skor AI</th>
                  <th className="py-3 px-6">Streak</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSantri.map((santri) => (
                  <tr key={santri.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{santri.fullName}</div>
                      <div className="text-[11px] text-slate-400">@{santri.username} • {santri.lastActive}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-700">{santri.lastSurah}</td>
                    <td className="py-4 px-6">
                      <span className={`font-bold px-2 py-0.5 rounded-md ${
                        santri.lastScore >= 85 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {santri.lastScore}%
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-800 inline-flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        <span>{santri.currentStreak} Hari</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {santri.status === 'active' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Lancar (Mutqin)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          <span>Butuh Bimbingan</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-teal-700 hover:text-teal-900 font-bold hover:underline inline-flex items-center space-x-0.5">
                        <span>Lihat Detail</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
