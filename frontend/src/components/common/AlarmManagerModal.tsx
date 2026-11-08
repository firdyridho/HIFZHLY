import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  Play,
  Square,
  Upload,
  Clock,
  X,
  Volume2,
} from 'lucide-react';
import {
  AlarmItem,
  getAlarms,
  addAlarm,
  deleteAlarm,
  toggleAlarm,
  saveCustomAudio,
} from '../../lib/alarmService';

interface AlarmManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAYS_NAME = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function AlarmManagerModal({ isOpen, onClose }: AlarmManagerModalProps) {
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  // New Alarm Form States
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
    if (isOpen) {
      refreshList();
    } else {
      stopPreviewAudio();
    }
  }, [isOpen]);

  const stopPreviewAudio = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
      previewAudioRef.current = null;
    }
    setPreviewingId(null);
  };

  const handleTogglePreview = (alarm: AlarmItem) => {
    if (previewingId === alarm.id) {
      stopPreviewAudio();
      return;
    }

    stopPreviewAudio();
    setPreviewingId(alarm.id);

    let src = '/audio/adzan.mp3';
    if (alarm.soundType === 'custom' && alarm.soundCustomDataUrl) {
      src = alarm.soundCustomDataUrl;
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

    if (file.size > 15 * 1024 * 1024) {
      alert('Ukuran file audio maksimal 15MB');
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

  const handleSaveNewAlarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!time) return;

    const newCreated = addAlarm({
      time,
      label: label.trim() || 'Alarm Baru',
      description: description.trim(),
      soundType,
      soundBuiltInId,
      soundCustomName: soundType === 'custom' ? customAudioName : undefined,
      soundCustomDataUrl: soundType === 'custom' ? customAudioDataUrl : undefined,
      repeatDays,
      enabled: true,
    });

    if (soundType === 'custom' && customAudioDataUrl) {
      await saveCustomAudio(newCreated.id, customAudioName, customAudioDataUrl);
    }

    setIsAdding(false);
    refreshList();
  };

  const handleDelete = (id: string) => {
    deleteAlarm(id);
    refreshList();
  };

  const handleToggle = (id: string) => {
    toggleAlarm(id);
    refreshList();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Pengaturan Alarm Mandiri</h3>
              <p className="text-[11px] text-slate-500">Murojaah, hafalan, jadwal belajar &amp; ibadah</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!isAdding ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Daftar Alarm Aktif ({alarms.length})
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Alarm</span>
                </button>
              </div>

              {alarms.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">Belum ada alarm yang diatur.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alarms.map((alarm) => (
                    <div
                      key={alarm.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        alarm.enabled
                          ? 'bg-white border-slate-200 shadow-2xs hover:border-emerald-300'
                          : 'bg-slate-50/70 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-baseline space-x-2">
                            <span className="text-2xl font-black font-mono tracking-tight text-slate-900">
                              {alarm.time}
                            </span>
                            <span className="text-xs font-bold text-slate-700">{alarm.label}</span>
                          </div>

                          {alarm.description && (
                            <p className="text-xs text-slate-500 leading-snug line-clamp-2">
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

                            <span className="text-slate-400">•</span>

                            <span>
                              {alarm.repeatDays.length === 7
                                ? 'Setiap Hari'
                                : alarm.repeatDays.length === 0
                                ? 'Sekali Saja'
                                : alarm.repeatDays.map((d) => DAYS_NAME[d]).join(', ')}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleTogglePreview(alarm)}
                            title="Pratinjau Suara"
                            className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors cursor-pointer"
                          >
                            {previewingId === alarm.id ? (
                              <Square className="w-3.5 h-3.5 fill-current text-emerald-600" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggle(alarm.id)}
                            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                              alarm.enabled ? 'bg-emerald-600' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                                alarm.enabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(alarm.id)}
                            title="Hapus Alarm"
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Add New Alarm Form */
            <form onSubmit={handleSaveNewAlarm} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Waktu Alarm
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 font-mono text-xl font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Judul Aktivitas
                </label>
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  {['Murojaah Pagi', 'Hafalan Baru', 'Tahajjud'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLabel(preset)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        label === preset
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
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
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Deskripsi di Notifikasi
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Pesan motivasi atau rincian ayat yang akan tampil di banner notifikasi HP"
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-snug resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Pilihan Nada Dering
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSoundType('built-in');
                      setSoundBuiltInId('adzan_subuh');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-left transition-colors cursor-pointer ${
                      soundType === 'built-in' && soundBuiltInId === 'adzan_subuh'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Adzan Subuh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSoundType('built-in');
                      setSoundBuiltInId('adzan');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-left transition-colors cursor-pointer ${
                      soundType === 'built-in' && soundBuiltInId === 'adzan'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Adzan Makkah
                  </button>
                </div>

                {/* Upload Custom Audio */}
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
                    className={`w-full py-2 px-3 rounded-xl border border-dashed flex items-center justify-center space-x-2 text-xs font-semibold transition-colors cursor-pointer ${
                      soundType === 'custom'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800'
                        : 'border-slate-300 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {soundType === 'custom' && customAudioName
                        ? `Audio: ${customAudioName}`
                        : 'Upload Nada Dering Sendiri (MP3 / WAV)'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Repeat Days */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Pengulangan Hari
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS_NAME.map((dName, idx) => {
                    const isSelected = repeatDays.includes(idx);
                    return (
                      <button
                        key={dName}
                        type="button"
                        onClick={() => toggleDay(idx)}
                        className={`py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {dName.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Simpan Alarm
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Alarm tersimpan lokal &amp; bersinkronisasi ke sistem notifikasi</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
