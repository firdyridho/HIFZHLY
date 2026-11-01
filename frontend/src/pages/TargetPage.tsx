import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Compass,
  BookOpen,
  Mic,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import type { SurahSummary } from '../types';
import {
  getUserCommitments,
  saveUserCommitments,
  UserCommitment,
  getStoredMutabaahLogs,
  DayMutabaahData,
} from '../lib/mutabaahService';
import { SURAH_ARABIC_NAMES } from '../lib/quranMeta';

export default function TargetPage() {
  const navigate = useNavigate();

  // 114 Surahs catalog
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [loadingSurahs, setLoadingSurahs] = useState(true);

  // Form State
  const [commitment, setCommitment] = useState<UserCommitment>(getUserCommitments());
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Today's Activity summary
  const [todayData, setTodayData] = useState<DayMutabaahData | null>(null);

  useEffect(() => {
    // 1. Fetch 114 surahs
    fetch('/api/v1/quran/surahs')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: SurahSummary[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setSurahs(data);
        }
      })
      .catch((err) => console.warn('Failed to fetch surahs:', err))
      .finally(() => setLoadingSurahs(false));

    // 2. Fetch commitments from backend
    const token = localStorage.getItem('hifzhly_auth_token');
    fetch('/api/v1/mutabaah/targets', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: UserCommitment | null) => {
        if (data && data.dailyTargetAyahsTilawah) {
          setCommitment(data);
        }
      })
      .catch(() => {});

    // 3. Load today's log
    const todayStr = new Date().toISOString().split('T')[0];
    const logs = getStoredMutabaahLogs();
    if (logs[todayStr]) {
      setTodayData(logs[todayStr]);
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await saveUserCommitments(commitment);
      setCommitment(updated);
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 4000);
    } catch (err) {
      console.error('Failed to save commitment:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Surah target metadata
  const selectedSurahMeta = surahs.find((s) => s.number === commitment.targetSurahNumber);
  const maxAyahsInTargetSurah = selectedSurahMeta ? selectedSurahMeta.numberOfAyahs : 286;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 pb-28 pt-4 sm:pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Top Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
              title="Kembali"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <Target className="w-3.5 h-3.5" />
                <span>Pengaturan Target Mandiri</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Target & Komitmen Ibadah Santri
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/app/mutabaah')}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-emerald-800 hover:border-emerald-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>Lihat Mutabaah</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {showSavedToast && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <p className="font-bold">Target Berhasil Disimpan & Disinkronkan!</p>
              <p className="text-emerald-700">
                Data mutabaah, kartu evaluasi, dan heatmap otomatis menyesuaikan dengan target baru Anda.
              </p>
            </div>
          </div>
        )}

        {/* Progress Tracker Card Hari Ini */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Capaian Target Hari Ini</h3>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Murojaah Progress */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                  Murojaah
                </span>
                <span className="font-bold text-slate-900">
                  Target: {commitment.dailyTargetMurojaahCount || 1} {commitment.murojaahTargetUnit || 'surah'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-900">
                  {todayData?.ayahsReviewed || 0}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Ayat Dimurojaah</span>
              </div>
            </div>

            {/* 2. Ziyadah (Hafalan Baru) Progress */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold flex items-center gap-1">
                  <Mic className="w-3.5 h-3.5 text-emerald-600" />
                  Hafalan Baru
                </span>
                <span className="font-bold text-slate-900">
                  Target: {commitment.dailyTargetAyahsHafalan} Ayat
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-900">
                  {todayData?.reports.filter((r) => r.type === 'hafalan_baru').reduce((acc, r) => acc + r.totalAyahs, 0) || 0}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Ayat Baru</span>
              </div>
            </div>

            {/* 3. Tilawah (Ngaji) Progress */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  Tilawah
                </span>
                <span className="font-bold text-slate-900">
                  Target: {commitment.dailyTargetPagesTilawah} Lembar
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-900">
                  {todayData?.reports.filter((r) => r.type === 'tilawah').reduce((acc, r) => acc + (r.pagesCount || 1), 0) || 0}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Lembar Dibaca</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Pengaturan Komitmen Target */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* SECTION 1: Alur Program & Urutan Belajar */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Compass className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-slate-900 text-sm">
                1. Alur & Titik Mulai Program Tahfidz
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tentukan urutan dan fokus program hafalan Anda. Pilihan ini akan otomatis menyesuaikan daftar surah prioritas dan Heatmap di Mutabaah:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                  commitment.progressionOrder === 'juz_30'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="progressionOrder"
                  value="juz_30"
                  checked={commitment.progressionOrder === 'juz_30' || !commitment.progressionOrder}
                  onChange={() => setCommitment({ ...commitment, progressionOrder: 'juz_30', targetJuzNumber: 30 })}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <p className="font-bold text-slate-900">Mulai dari Juz 30 (Juz 'Amma)</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Standar kurikulum santri tahfidz pemula (QS. An-Naba' s.d. An-Nas). Setelah Juz 30 selesai, beralih ke Juz 1, 2, dst.
                  </p>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                  commitment.progressionOrder === 'juz_1_asc'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="progressionOrder"
                  value="juz_1_asc"
                  checked={commitment.progressionOrder === 'juz_1_asc'}
                  onChange={() => setCommitment({ ...commitment, progressionOrder: 'juz_1_asc', targetJuzNumber: 1 })}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <p className="font-bold text-slate-900">Mulai dari Juz 1 Berurutan</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Mulai dari Al-Fatihah & Al-Baqarah berurutan maju hingga Juz 30.
                  </p>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 sm:col-span-2 ${
                  commitment.progressionOrder === 'custom_surah'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="progressionOrder"
                  value="custom_surah"
                  checked={commitment.progressionOrder === 'custom_surah'}
                  onChange={() => setCommitment({ ...commitment, progressionOrder: 'custom_surah' })}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <p className="font-bold text-slate-900">Fokus Surah Pilihan Mandiri</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Bebas menentukan surah atau juz apa saja yang sedang ingin dimurojaah/dihafal intensif (misal: Al-Kahfi, Al-Mulk, Yasin, dll).
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* SECTION 2: Target Harian Murojaah Fleksibel */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <RotateCcw className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-slate-900 text-sm">
                2. Target Harian Murojaah (Pengulangan Hafalan)
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pilih satuan target murojaah yang paling cocok untuk ritme harian Anda:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Opsi Satuan: Surat */}
              <button
                type="button"
                onClick={() => setCommitment({ ...commitment, murojaahTargetUnit: 'surah' })}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                  commitment.murojaahTargetUnit === 'surah' || !commitment.murojaahTargetUnit
                    ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-950'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold">Per Surat</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Cocok untuk surat pendek Juz 30</div>
              </button>

              {/* Opsi Satuan: Ayat */}
              <button
                type="button"
                onClick={() => setCommitment({ ...commitment, murojaahTargetUnit: 'ayah' })}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                  commitment.murojaahTargetUnit === 'ayah'
                    ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-950'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold">Per Ayat</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Cocok untuk surat panjang (Al-Baqarah, dll.)</div>
              </button>

              {/* Opsi Satuan: Halaman / Lembar */}
              <button
                type="button"
                onClick={() => setCommitment({ ...commitment, murojaahTargetUnit: 'page' })}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                  commitment.murojaahTargetUnit === 'page'
                    ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-950'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold">Per Halaman Mushaf</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Standar 15 baris mushaf Madinah</div>
              </button>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jumlah Target Murojaah per Hari:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={commitment.dailyTargetMurojaahCount || 1}
                  onChange={(e) =>
                    setCommitment({
                      ...commitment,
                      dailyTargetMurojaahCount: Math.max(1, parseInt(e.target.value, 10) || 1),
                    })
                  }
                  className="w-32 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-600 font-semibold">
                  {commitment.murojaahTargetUnit === 'ayah'
                    ? 'Ayat / Hari'
                    : commitment.murojaahTargetUnit === 'page'
                    ? 'Halaman / Hari'
                    : 'Surah / Hari'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: Target Ziyadah & Tilawah */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-slate-900 text-sm">
                3. Target Hafalan Baru (Ziyadah) & Tilawah Harian
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Hafalan Baru (Ayat / Hari)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={commitment.dailyTargetAyahsHafalan}
                  onChange={(e) =>
                    setCommitment({
                      ...commitment,
                      dailyTargetAyahsHafalan: Math.max(1, parseInt(e.target.value, 10) || 1),
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Disarankan: 3 s.d. 10 ayat per hari</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Tilawah Ngaji (Lembar / Hari)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={commitment.dailyTargetPagesTilawah}
                  onChange={(e) =>
                    setCommitment({
                      ...commitment,
                      dailyTargetPagesTilawah: Math.max(1, parseInt(e.target.value, 10) || 1),
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">1 lembar = 2 halaman mushaf</p>
              </div>
            </div>
          </div>

          {/* SECTION 4: Surah Target Khusus & Tenggat Waktu */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-slate-900 text-sm">
                4. Surah Target Khusus & Tenggat Waktu (Deadline)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-3">
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih Surah Target Utama:
                </label>
                <select
                  value={commitment.targetSurahNumber}
                  onChange={(e) => {
                    const sNum = parseInt(e.target.value, 10);
                    const meta = surahs.find((s) => s.number === sNum);
                    setCommitment({
                      ...commitment,
                      targetSurahNumber: sNum,
                      targetSurahName: meta ? meta.nameLatin : `Surah ${sNum}`,
                      targetStartAyah: 1,
                      targetEndAyah: meta ? meta.numberOfAyahs : 20,
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {loadingSurahs ? (
                    <option value={78}>Memuat daftar surat...</option>
                  ) : (
                    surahs.map((s) => (
                      <option key={s.number} value={s.number}>
                        {s.number}. {s.nameLatin} ({s.numberOfAyahs} Ayat) — {s.nameArabic || SURAH_ARABIC_NAMES[s.number]}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ayat Mulai</label>
                <input
                  type="number"
                  min={1}
                  max={maxAyahsInTargetSurah}
                  value={commitment.targetStartAyah}
                  onChange={(e) =>
                    setCommitment({
                      ...commitment,
                      targetStartAyah: Math.max(1, parseInt(e.target.value, 10) || 1),
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ayat Selesai</label>
                <input
                  type="number"
                  min={commitment.targetStartAyah}
                  max={maxAyahsInTargetSurah}
                  value={commitment.targetEndAyah}
                  onChange={(e) =>
                    setCommitment({
                      ...commitment,
                      targetEndAyah: Math.min(
                        maxAyahsInTargetSurah,
                        Math.max(commitment.targetStartAyah, parseInt(e.target.value, 10) || 1)
                      ),
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tenggat Target (Deadline)</label>
                <input
                  type="date"
                  value={commitment.targetDeadline}
                  onChange={(e) => setCommitment({ ...commitment, targetDeadline: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/app/mutabaah')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Target & Komitmen'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

