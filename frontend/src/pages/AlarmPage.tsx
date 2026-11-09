import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ArrowLeft,
  Plus,
  Trash2,
  Play,
  Square,
  Upload,
  Volume2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import {
  AlarmItem,
  getAlarms,
  addAlarm,
  deleteAlarm,
  toggleAlarm,
  saveCustomAudio,
  getCustomAudio,
} from '../lib/alarmService';

const DAYS_NAME = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function AlarmPage() {
  const navigate = useNavigate();
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [time, setTime] = useState('04:30');
  const [label, setLabel] = useState('Murojaah Pagi');
  const [description, setDescription] = useState('Persiapan sholat dan murojaah hafalan mandiri.');
  const [soundType, setSoundType] = useState<'built-in' | 'custom'>('built-in');
  const [soundBuiltInId, setSoundBuiltInId] = useState<'adzan_subuh' | 'adzan' | 'bel_santri' | 'chime'>('adzan_subuh');
  const [customAudioName, setCustomAudioName] = useState('');
  const [customAudioDataUrl, setCustomAudioDataUrl] = useState('');
  const [repeatDays, setRepeatDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const refreshList = () => {
    setAlarms(getAlarms());
  };

  useEffect(() => {
    refreshList();
    const handleUpdate = () => refreshList();
    window.addEventListener('hifzhly_alarms_updated', handleUpdate);
    return () => {
      stopPreviewAudio();
      window.removeEventListener('hifzhly_alarms_updated', handleUpdate);
    };
  }, []);

  const stopPreviewAudio = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
      previewAudioRef.current = null;
    }
    setPreviewingId(null);
  };

  const handleTogglePreview = async (alarm: AlarmItem) => {
    if (previewingId === alarm.id) {
      stopPreviewAudio();
      return;
    }

    stopPreviewAudio();
    setPreviewingId(alarm.id);

    let src = '/audio/adzan.mp3';
    if (alarm.soundType === 'custom') {
      const customData = await getCustomAudio(alarm.id);
      if (customData?.dataUrl) {
        src = customData.dataUrl;
      }
    } else if (alarm.soundBuiltInId === 'adzan_subuh') {
      src = '/audio/adzan_subuh.mp3';
    }

    const audio = new Audio(src);
    previewAudioRef.current = audio;
    audio.play().catch(() => {});
    audio.onended = () => setPreviewingId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('Ukuran file audio maksimal 20MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomAudioName(file.name);
      setCustomAudioDataUrl(result);
      setSoundType('custom');
    };
    reader.readAsDataURL(file);
  };

  const toggleDay = (dayIdx: number) => {
    if (repeatDays.includes(dayIdx)) {
      setRepeatDays(repeatDays.filter((d) => d !== dayIdx));
    } else {
      setRepeatDays([...repeatDays, dayIdx].sort());
    }
  };

  const handleSaveAlarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!time) return;

    // 1. Simpan objek alarm bersih (tanpa data URL raksasa di localStorage)
    const newCreated = addAlarm({
      time,
      label: label.trim() || 'Alarm Baru',
      description: description.trim(),
      soundType,
      soundBuiltInId,
      soundCustomName: soundType === 'custom' ? customAudioName : undefined,
      repeatDays,
      enabled: true,
    });

    // 2. Simpan audio kustom secara terpisah ke IndexedDB tanpa batasan kuota
    if (soundType === 'custom' && customAudioDataUrl) {
      await saveCustomAudio(newCreated.id, customAudioName, customAudioDataUrl);
    }

    setSuccessMsg(`Alarm "${label.trim()}" jam ${time} berhasil ditambahkan!`);
    setIsAdding(false);
    refreshList();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDelete = (id: string) => {
    deleteAlarm(id);
    refreshList();
  };

  const handleToggle = (id: string) => {
    toggleAlarm(id);
    refreshList();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/app')}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors p-2 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs font-bold">Kembali ke Beranda</span>
          </button>

          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Pengaturan Alarm
          </h2>

          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {/* Cool Hero Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/30">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                <Bell className="w-3.5 h-3.5" />
                <span>Pengingat Mandiri Santri</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Alarm &amp; Pengingat Rutin
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
                Kelola jadwal murojaah, hafalan ayat baru, qiyamullail, dan ibadah harian dengan notifikasi audio bersuara jernih.
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
              <span className="text-[11px] text-slate-400 font-medium">Total Jadwal</span>
              <span className="text-3xl font-black text-emerald-400 font-mono">
                {alarms.filter((a) => a.enabled).length}
                <span className="text-sm text-slate-400 font-sans font-normal"> / {alarms.length} Aktif</span>
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Message */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-xs text-emerald-900 font-medium animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Action Header */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Daftar Alarm Tersimpan
          </span>

          {!isAdding && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Alarm Baru</span>
            </button>
          )}
        </div>

        {/* In-Page Form: Tambah Alarm Baru (No Popup) */}
        {isAdding && (
          <div className="bg-white rounded-3xl border-2 border-emerald-500/50 p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Buat Alarm Baru</h3>
                  <p className="text-[11px] text-slate-500">Tentukan jam dan deskripsi di banner notifikasi</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Batal
              </button>
            </div>

            <form onSubmit={handleSaveAlarm} className="space-y-4">
              {/* Jam Alarm */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Waktu Alarm
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 font-mono text-2xl font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                />
              </div>

              {/* Judul & Preset */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Judul Aktivitas
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['Murojaah Pagi', 'Hafalan Baru', 'Tahajjud & Sahur', 'Tilawah Mandiri'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLabel(preset)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        label === preset
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Contoh: Murojaah Surat Al-Baqarah"
                  className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                />
              </div>

              {/* Deskripsi di Notifikasi Banner HP */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Deskripsi di Banner Notifikasi HP
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Teks ini akan muncul jelas di banner notifikasi ponsel saat jam berdering..."
                  className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed shadow-2xs resize-none"
                />
                <p className="text-[11px] text-slate-400">
                  Contoh: "Waktunya murojaah 1 juz sebelum sholat Subuh tiba."
                </p>
              </div>

              {/* Pilihan Nada Dering */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pilihan Nada Dering
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSoundType('built-in');
                      setSoundBuiltInId('adzan_subuh');
                    }}
                    className={`py-3 px-4 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      soundType === 'built-in' && soundBuiltInId === 'adzan_subuh'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Adzan Subuh (Lengkap)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSoundType('built-in');
                      setSoundBuiltInId('adzan');
                    }}
                    className={`py-3 px-4 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      soundType === 'built-in' && soundBuiltInId === 'adzan'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Adzan Makkah
                  </button>
                </div>

                {/* Upload Nada Dering Sendiri */}
                <div className="pt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full py-2.5 px-4 rounded-xl border-2 border-dashed flex items-center justify-center space-x-2 text-xs font-semibold transition-all cursor-pointer ${
                      soundType === 'custom'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                        : 'border-slate-300 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>
                      {soundType === 'custom' && customAudioName
                        ? `File Tersedia: ${customAudioName}`
                        : 'Upload File Audio Anda Sendiri (MP3 / WAV)'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Pengulangan Hari */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pengulangan Hari
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {DAYS_NAME.map((dName, idx) => {
                    const isSelected = repeatDays.includes(idx);
                    return (
                      <button
                        key={dName}
                        type="button"
                        onClick={() => toggleDay(idx)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {dName.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400">
                  {repeatDays.length === 7
                    ? 'Berdering Setiap Hari'
                    : repeatDays.length === 0
                    ? 'Berdering Sekali Saja (otomatis nonaktif setelah berdering)'
                    : `Berdering pada: ${repeatDays.map((d) => DAYS_NAME[d]).join(', ')}`}
                </p>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  Simpan Alarm Ini
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="py-3 px-5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List of Alarms */}
        {alarms.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Belum Ada Alarm yang Dibuat</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Buat pengingat jadwal tilawah dan murojaah pertama Anda dengan menekan tombol "Tambah Alarm Baru" di atas.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alarms.map((alarm) => (
              <div
                key={alarm.id}
                className={`p-5 rounded-3xl border transition-all ${
                  alarm.enabled
                    ? 'bg-white border-slate-200 shadow-sm hover:border-emerald-300'
                    : 'bg-slate-100/70 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-baseline space-x-2.5">
                      <span className="text-3xl font-black font-mono tracking-tight text-slate-900">
                        {alarm.time}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {alarm.label}
                      </span>
                    </div>

                    {alarm.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {alarm.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1 font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                        <Volume2 className="w-3 h-3" />
                        {alarm.soundType === 'custom'
                          ? alarm.soundCustomName || 'Audio Kustom'
                          : alarm.soundBuiltInId === 'adzan_subuh'
                          ? 'Adzan Subuh'
                          : 'Adzan Makkah'}
                      </span>

                      <span className="text-slate-300">•</span>

                      <span className="font-medium text-slate-600">
                        {alarm.repeatDays.length === 7
                          ? 'Setiap Hari'
                          : alarm.repeatDays.length === 0
                          ? 'Sekali Saja'
                          : alarm.repeatDays.map((d) => DAYS_NAME[d]).join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTogglePreview(alarm)}
                      title="Pratinjau Nada Dering"
                      className="p-2.5 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors cursor-pointer"
                    >
                      {previewingId === alarm.id ? (
                        <Square className="w-4 h-4 fill-current text-emerald-600" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggle(alarm.id)}
                      className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                        alarm.enabled ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5.5 h-5.5 rounded-full bg-white shadow-xs transition-transform ${
                          alarm.enabled ? 'translate-x-5.5' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(alarm.id)}
                      title="Hapus Alarm"
                      className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Info Box */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 space-y-1">
          <div className="flex items-center space-x-1.5 font-bold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sinkronisasi Alarm Native Mandiri</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Alarm disimpan secara lokal pada smartphone Anda dan disinkronkan langsung ke Android Local Notifications. Suara alarm dirancang resilien dan tidak akan mati saat Anda menaikkan volume ponsel atau membuka bilah status bar.
          </p>
        </div>
      </main>
    </div>
  );
}

