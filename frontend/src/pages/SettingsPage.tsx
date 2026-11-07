import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  User,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ArrowLeft,
  RefreshCw,
  ShieldAlert,
  QrCode,
  MapPin,
  Volume2,
  Play,
  Square,
  Navigation,
  Download,
  Bell,
  Clock,
} from 'lucide-react';
import type { UserProfile } from '../types';
import { APP_VERSION, APP_BUILD, APP_DEVELOPER } from '../version';
import { checkForUpdate, executeAppUpdate, type UpdateInfo } from '../lib/appUpdateService';
import {
  isAdzanNotificationEnabled,
  setAdzanNotificationEnabled,
  requestNotificationPermission,
  triggerTestAdzanNotification,
  stopAdzanAudio,
} from '../lib/adzanNotificationService';

export default function SettingsPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('hifzhly_auth_token');

  // User Profile State
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('hifzhly_user_profile');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Profile Form State
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // App Update & Developer State
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateCheckStatus, setUpdateCheckStatus] = useState('');
  const [foundUpdateInfo, setFoundUpdateInfo] = useState<UpdateInfo | null>(null);

  const handleManualCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setUpdateCheckStatus('Memeriksa server rilis...');
    setFoundUpdateInfo(null);
    try {
      const res = await checkForUpdate();
      if (res.hasUpdate) {
        setFoundUpdateInfo(res);
        setUpdateCheckStatus(`Pembaruan v${res.latestVersion} tersedia!`);
      } else {
        setUpdateCheckStatus('Hifzhly sudah menggunakan versi terbaru.');
      }
    } catch {
      setUpdateCheckStatus('Gagal terhubung ke server pembaruan.');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  // Notifikasi Adzan & Jadwal Sholat Mobile State
  const [adzanEnabled, setAdzanEnabled] = useState(() => isAdzanNotificationEnabled());
  const [testAdzanStatus, setTestAdzanStatus] = useState<string | null>(null);
  const [isTestingAdzan, setIsTestingAdzan] = useState(false);

  const handleToggleAdzan = async () => {
    const next = !adzanEnabled;
    if (next) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setTestAdzanStatus('Izin notifikasi belum diizinkan di sistem HP');
        return;
      }
    }
    await setAdzanNotificationEnabled(next);
    setAdzanEnabled(next);
    setTestAdzanStatus(next ? 'Notifikasi Adzan & Jadwal Sholat aktif' : 'Notifikasi Adzan dinonaktifkan');
  };

  const handleTestAdzan = async () => {
    setIsTestingAdzan(true);
    setTestAdzanStatus('Mengirimkan notifikasi adzan (2 detik)... Cek bilah status bar HP');
    const ok = await triggerTestAdzanNotification();
    if (ok) {
      setTimeout(() => {
        setIsTestingAdzan(false);
        setTestAdzanStatus('Notifikasi adzan berhasil terkirim ke HP!');
      }, 2500);
    } else {
      setIsTestingAdzan(false);
      setTestAdzanStatus('Izin notifikasi tidak aktif');
    }
  };

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(profile?.twoFactorEnabled || false);
  const [show2FASetupModal, setShow2FASetupModal] = useState(false);
  const [show2FADisableModal, setShow2FADisableModal] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [twoFactorErrorMsg, setTwoFactorErrorMsg] = useState('');
  const [twoFactorSuccessMsg, setTwoFactorSuccessMsg] = useState('');

  // Location & Sholat API State (equran.id shalat)
  const [provinsiList, setProvinsiList] = useState<string[]>([]);
  const [selectedProvinsi, setSelectedProvinsi] = useState<string>(() => {
    return localStorage.getItem('hifzhly_prayer_provinsi') || 'BANTEN';
  });
  const [kabkotaList, setKabkotaList] = useState<string[]>([]);
  const [selectedKabkota, setSelectedKabkota] = useState<string>(() => {
    return localStorage.getItem('hifzhly_prayer_kabkota') || 'KOTA SERANG';
  });
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [locationSavedMsg, setLocationSavedMsg] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({ lat: -6.12, lon: 106.15 });

  // Qari Audio Preference State
  const [selectedQari, setSelectedQari] = useState<string>(() => {
    return localStorage.getItem('hifzhly_qari_preference') || 'Misyari-Rasyid-Al-Afasi';
  });
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [qariSavedMsg, setQariSavedMsg] = useState('');
  const sampleAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load Provinces from equran.id API
  useEffect(() => {
    fetch('https://equran.id/api/v2/shalat/provinsi')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        if (list.length > 0) {
          setProvinsiList(list);
        } else {
          setProvinsiList(['BANTEN', 'DKI JAKARTA', 'JAWA BARAT', 'JAWA TENGAH', 'JAWA TIMUR', 'DI YOGYAKARTA', 'SUMATERA BARAT', 'SUMATERA UTARA']);
        }
      })
      .catch(() => {
        setProvinsiList(['BANTEN', 'DKI JAKARTA', 'JAWA BARAT', 'JAWA TENGAH', 'JAWA TIMUR', 'DI YOGYAKARTA', 'SUMATERA BARAT', 'SUMATERA UTARA']);
      });
  }, []);

  // Load Regencies/Cities when province changes
  useEffect(() => {
    if (!selectedProvinsi) return;
    fetch('https://equran.id/api/v2/shalat/kabkota', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provinsi: selectedProvinsi }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        if (list.length > 0) {
          setKabkotaList(list);
          if (!list.includes(selectedKabkota)) {
            setSelectedKabkota(list[0]);
          }
        }
      })
      .catch(() => {});
  }, [selectedProvinsi]);

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung deteksi lokasi otomatis.');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        setIsDetectingGps(false);
        setLocationSavedMsg(`GPS terdeteksi (${latitude.toFixed(4)}, ${longitude.toFixed(4)}). Silakan simpan lokasi.`);
        setTimeout(() => setLocationSavedMsg(''), 4000);
      },
      () => {
        setIsDetectingGps(false);
        alert('Gagal mendeteksi lokasi GPS. Pastikan izin akses lokasi diizinkan di browser Anda.');
      }
    );
  };

  const handleSaveLocation = () => {
    localStorage.setItem('hifzhly_prayer_provinsi', selectedProvinsi);
    localStorage.setItem('hifzhly_prayer_kabkota', selectedKabkota);
    window.dispatchEvent(new Event('hifzhly_location_updated'));
    setLocationSavedMsg('Lokasi jadwal sholat berhasil diperbarui!');
    setTimeout(() => setLocationSavedMsg(''), 3000);
  };

  const QARI_LIST = [
    { id: 'Misyari-Rasyid-Al-Afasi', name: 'Syaikh Misyari Rasyid Al-Afasi', subtitle: 'Imam Masjid Al-Kabir Kuwait (Hafsh)' },
    { id: 'Abdurrahman-As-Sudais', name: 'Syaikh Abdurrahman As-Sudais', subtitle: 'Imam Besar Masjidil Haram Mekkah' },
    { id: 'Abdullah-Al-Juhany', name: 'Syaikh Abdullah Al-Juhany', subtitle: 'Imam Masjidil Haram Mekkah' },
    { id: 'Abdul-Muhsin-Al-Qasim', name: 'Syaikh Abdul Muhsin Al-Qasim', subtitle: 'Imam Masjid Nabawi Madinah' },
    { id: 'Ibrahim-Al-Dossari', name: 'Syaikh Ibrahim Al-Dossari', subtitle: 'Qari & Dewan Lajnah Mushaf' },
  ];

  const handleTogglePlaySample = (qariId: string) => {
    if (isPlayingSample) {
      if (sampleAudioRef.current) sampleAudioRef.current.pause();
      setIsPlayingSample(false);
      return;
    }

    const audioUrl = `https://cdn.equran.id/audio-partial/${qariId}/001001.mp3`;
    const audio = new Audio(audioUrl);
    sampleAudioRef.current = audio;
    setIsPlayingSample(true);
    audio.play().catch(() => setIsPlayingSample(false));
    audio.onended = () => setIsPlayingSample(false);
    audio.onerror = () => setIsPlayingSample(false);
  };

  const handleSaveQari = (qariId: string) => {
    setSelectedQari(qariId);
    localStorage.setItem('hifzhly_qari_preference', qariId);
    window.dispatchEvent(new Event('hifzhly_qari_updated'));
    setQariSavedMsg('Preferensi suara Qari berhasil disimpan!');
    setTimeout(() => setQariSavedMsg(''), 3000);
  };

  // Fetch Latest Profile from API on mount
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('/api/v1/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Sesi kedaluwarsa');
        return res.json();
      })
      .then((data: UserProfile) => {
        setProfile(data);
        setFullName(data.fullName || '');
        setUsername(data.username || '');
        setTwoFactorEnabled(!!data.twoFactorEnabled);
        localStorage.setItem('hifzhly_user_profile', JSON.stringify(data));
      })
      .catch((err) => {
        console.warn('Gagal memuat profil pengguna:', err);
      });
  }, [token, navigate]);

  // Password Strength Calculation
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);

  let strengthScore = 0;
  if (hasMinLength) strengthScore += 1;
  if (hasUpperCase) strengthScore += 1;
  if (hasLowerCase) strengthScore += 1;
  if (hasNumberOrSymbol) strengthScore += 1;

  const getStrengthLabel = () => {
    if (newPassword.length === 0) return { label: 'Kosong', color: 'bg-slate-200', text: 'text-slate-400' };
    if (strengthScore <= 1) return { label: 'Sangat Lemah', color: 'bg-rose-500', text: 'text-rose-600' };
    if (strengthScore === 2) return { label: 'Cukup', color: 'bg-amber-500', text: 'text-amber-600' };
    if (strengthScore === 3) return { label: 'Kuat', color: 'bg-blue-500', text: 'text-blue-600' };
    return { label: 'Sangat Kuat', color: 'bg-emerald-600', text: 'text-emerald-700' };
  };

  const strengthInfo = getStrengthLabel();
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  // Handle Update Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg('');
    setProfileSuccessMsg('');

    if (!fullName.trim() || !username.trim()) {
      setProfileErrorMsg('Nama lengkap dan nama pengguna (username) wajib diisi');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          username: username.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui profil');
      }

      setProfileSuccessMsg('Profil berhasil diperbarui');
      if (data.user) {
        setProfile(data.user);
        localStorage.setItem('hifzhly_user_profile', JSON.stringify(data.user));
        window.dispatchEvent(new Event('hifzhly_profile_updated'));
      }
    } catch (err: any) {
      setProfileErrorMsg(err.message || 'Terjadi kesalahan sistem saat memperbarui profil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (!oldPassword) {
      setPasswordErrorMsg('Kata sandi saat ini wajib diisi');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordErrorMsg('Kata sandi baru minimal harus 8 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('Konfirmasi kata sandi baru tidak cocok');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch('/api/v1/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengubah kata sandi');
      }

      setPasswordSuccessMsg('Kata sandi berhasil diperbarui');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordErrorMsg(err.message || 'Terjadi kesalahan sistem saat mengubah kata sandi');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Initiate 2FA Setup
  const handleStart2FASetup = async () => {
    setTwoFactorErrorMsg('');
    setTwoFactorSuccessMsg('');
    setVerificationCode('');
    setIs2FALoading(true);

    try {
      const res = await fetch('/api/v1/auth/2fa/setup', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyiapkan autentikasi dua faktor');
      }

      setTwoFactorSecret(data.secret);

      // Generate real scannable QR Code image data URL
      try {
        const qrUrl = await QRCode.toDataURL(data.qrCode, {
          width: 240,
          margin: 1.5,
          color: {
            dark: '#064e3b', // emerald-900 for serious Islamic aesthetic
            light: '#ffffff',
          },
        });
        setQrCodeDataUrl(qrUrl);
      } catch (qrErr) {
        console.warn('Gagal membuat gambar QR code:', qrErr);
      }

      setShow2FASetupModal(true);
    } catch (err: any) {
      setTwoFactorErrorMsg(err.message || 'Gagal memulai setup 2FA');
    } finally {
      setIs2FALoading(false);
    }
  };

  // Verify and Confirm 2FA Activation
  const handleConfirm2FA = async (enable: boolean) => {
    if (!verificationCode || verificationCode.trim().length !== 6) {
      setTwoFactorErrorMsg('Masukkan 6 digit kode autentikasi yang valid');
      return;
    }

    setIs2FALoading(true);
    setTwoFactorErrorMsg('');
    try {
      const res = await fetch('/api/v1/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: verificationCode.trim(),
          enable,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Kode verifikasi tidak valid atau telah kedaluwarsa');
      }

      setTwoFactorEnabled(enable);
      setTwoFactorSuccessMsg(enable ? 'Autentikasi dua faktor (2FA) berhasil diaktifkan' : 'Autentikasi dua faktor (2FA) telah dinonaktifkan');
      setShow2FASetupModal(false);
      setShow2FADisableModal(false);
      setVerificationCode('');

      if (profile) {
        const updated = { ...profile, twoFactorEnabled: enable };
        setProfile(updated);
        localStorage.setItem('hifzhly_user_profile', JSON.stringify(updated));
        window.dispatchEvent(new Event('hifzhly_profile_updated'));
      }
    } catch (err: any) {
      setTwoFactorErrorMsg(err.message || 'Gagal memverifikasi kode 2FA');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleCopySecret = () => {
    if (!twoFactorSecret) return;
    navigator.clipboard.writeText(twoFactorSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 select-none">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/app/dashboard"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pengaturan Akun</h1>
            <p className="text-xs text-slate-500">Kelola identitas, keamanan sandi, dan proteksi 2FA santri</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card Overview */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-2xl shadow-inner">
                {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{profile?.fullName || 'Santri Hifzhly'}</h2>
                <p className="text-xs text-slate-500 font-mono">@{profile?.username || 'santri'}</p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{profile?.role === 'admin' ? 'Musyrif / Ustaz' : 'Santri Aktif'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Alamat Email:</span>
                <span className="font-medium text-slate-900 truncate max-w-[170px]" title={profile?.email}>
                  {profile?.email || '-'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Status 2FA:</span>
                <span
                  className={`font-semibold ${
                    twoFactorEnabled ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {twoFactorEnabled ? 'Aktif Terlindungi' : 'Belum Aktif'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Target Harian:</span>
                <span className="font-medium text-slate-900">{profile?.dailyTargetAyahs || 5} Ayat / Hari</span>
              </div>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="bg-emerald-50/60 rounded-3xl border border-emerald-200/80 p-5 text-xs text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Keamanan Berstandar Tinggi</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Pastikan Anda mengaktifkan Autentikasi Dua Faktor (2FA) untuk mencegah akses tidak sah ke data mutabaah dan riwayat hafalan Al-Qur'an Anda.
            </p>
          </div>

          {/* SECTION: DETAIL APLIKASI & PENGEMBANG */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/icon_favicon.png"
                alt="Hifzhly Logo"
                className="w-11 h-11 object-contain rounded-2xl border border-slate-200/80 p-1.5 bg-emerald-50/80 shadow-xs"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hifzhly Mobile</h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  Versi {APP_VERSION} (Build {APP_BUILD})
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Pengembang:</span>
                <span className="font-bold text-emerald-800">{APP_DEVELOPER}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Perizinan:</span>
                <span className="font-medium text-slate-700">Mikrofon, Notifikasi, Maps</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Platform:</span>
                <span className="font-medium text-slate-700">Android APK &amp; PWA</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleManualCheckUpdate}
                disabled={isCheckingUpdate}
                className="w-full py-2.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                <span>{isCheckingUpdate ? 'Memeriksa Server...' : 'Periksa Pembaruan Aplikasi'}</span>
              </button>

              {foundUpdateInfo && foundUpdateInfo.hasUpdate && (
                <button
                  type="button"
                  onClick={() => executeAppUpdate(foundUpdateInfo.downloadUrl)}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 animate-in fade-in"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Pembaruan v{foundUpdateInfo.latestVersion}</span>
                </button>
              )}

              {updateCheckStatus && (
                <p className="text-[11px] text-center text-slate-600 font-medium animate-in fade-in">
                  {updateCheckStatus}
                </p>
              )}
            </div>
          </div>

          {/* SECTION: NOTIFIKASI ADZAN & JADWAL SHOLAT MOBILE */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  <Bell className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Notifikasi Adzan</h3>
                  <p className="text-[11px] text-slate-500">Pengingat 5 waktu sholat</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={handleToggleAdzan}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  adzanEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
                title={adzanEnabled ? 'Matikan Pengingat Adzan' : 'Aktifkan Pengingat Adzan'}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    adzanEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Smartphone Anda akan otomatis menampilkan notifikasi dan bersuara saat adzan Subuh, Dzuhur, Ashar, Maghrib, dan Isya tiba.
            </p>

            <div className="pt-1 space-y-2">
              <button
                type="button"
                onClick={handleTestAdzan}
                disabled={isTestingAdzan}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
              >
                <Clock className={`w-3.5 h-3.5 ${isTestingAdzan ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
                <span>{isTestingAdzan ? 'Mengirim Notifikasi...' : 'Uji Notifikasi Adzan (2 Detik)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopAdzanAudio();
                  setTestAdzanStatus('Suara adzan dihentikan');
                }}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>Hentikan Suara Adzan</span>
              </button>

              {testAdzanStatus && (
                <p className="text-[11px] text-center text-emerald-700 font-medium animate-in fade-in">
                  {testAdzanStatus}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Columns: Forms (Profile, Password, 2FA) */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 1: PROFIL PENGGUNA */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Profil & Identitas</h2>
                <p className="text-xs text-slate-500">Perbarui nama lengkap dan username akun Anda</p>
              </div>
            </div>

            {profileSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {profileErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Muhammad Fatih"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Nama Pengguna (Username)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="fatih_hifzhly"
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs font-mono"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500">Hanya karakter huruf kecil, angka, garis bawah (_), dan tanda hubung (-).</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Alamat Email (Permanen)</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs cursor-not-allowed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl font-semibold transition cursor-pointer flex items-center gap-2"
                >
                  {isUpdatingProfile && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>
            </form>
          </div>

          {/* SECTION 2: GANTI KATA SANDI */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Keamanan & Kata Sandi</h2>
                <p className="text-xs text-slate-500">Ubah kata sandi akun secara berkala untuk menjaga kerahasiaan</p>
              </div>
            </div>

            {passwordSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}

            {passwordErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{passwordErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
              {/* Old Password */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Kata Sandi Saat Ini</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan kata sandi lama Anda"
                    className="w-full pl-4 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    title={showOldPassword ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Kata Sandi Baru</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter unik"
                    className="w-full pl-4 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    title={showNewPassword ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator Bar */}
                {newPassword.length > 0 && (
                  <div className="pt-1.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Kekuatan Sandi:</span>
                      <span className={`font-semibold ${strengthInfo.text}`}>{strengthInfo.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 rounded-full ${strengthScore >= 1 ? strengthInfo.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${strengthScore >= 2 ? strengthInfo.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${strengthScore >= 3 ? strengthInfo.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${strengthScore >= 4 ? strengthInfo.color : 'bg-slate-200'}`} />
                    </div>

                    {/* Criteria Checklist */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-500">
                      <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-medium' : ''}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                        <span>Min. 8 karakter</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-emerald-700 font-medium' : ''}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${hasUpperCase ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                        <span>Huruf besar (A-Z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasLowerCase ? 'text-emerald-700 font-medium' : ''}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${hasLowerCase ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                        <span>Huruf kecil (a-z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasNumberOrSymbol ? 'text-emerald-700 font-medium' : ''}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${hasNumberOrSymbol ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                        <span>Angka / Simbol unik</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Konfirmasi Kata Sandi Baru</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi baru"
                    className={`w-full pl-4 pr-11 py-2.5 bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 text-xs ${
                      passwordMismatch
                        ? 'border-rose-400 focus:ring-rose-500'
                        : passwordsMatch
                        ? 'border-emerald-400 focus:ring-emerald-500'
                        : 'border-slate-200 focus:ring-emerald-500'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    title={showConfirmPassword ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordMismatch && (
                  <p className="text-[11px] text-rose-600 font-medium">Konfirmasi kata sandi tidak sesuai dengan sandi baru.</p>
                )}
                {passwordsMatch && (
                  <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Kata sandi cocok
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingPassword || (newPassword.length > 0 && !passwordsMatch)}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl font-semibold transition cursor-pointer flex items-center gap-2"
                >
                  {isUpdatingPassword && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Perbarui Kata Sandi</span>
                </button>
              </div>
            </form>
          </div>

          {/* SECTION 3: TWO-FACTOR AUTHENTICATION (2FA) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Autentikasi Dua Faktor (2FA)</h2>
                  <p className="text-xs text-slate-500">Lapisan keamanan ganda dengan aplikasi Google Authenticator / Authy</p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  twoFactorEnabled
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {twoFactorEnabled ? '2FA Aktif' : 'Nonaktif'}
              </span>
            </div>

            {twoFactorSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{twoFactorSuccessMsg}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">
                  {twoFactorEnabled
                    ? 'Perlindungan Akun Sedang Aktif'
                    : 'Tingkatkan Keamanan Akun Anda'}
                </p>
                <p className="text-slate-500 leading-relaxed">
                  {twoFactorEnabled
                    ? 'Setiap kali masuk atau melakukan tindakan krusial, sistem akan memvalidasi kode TOTP 6 digit dari perangkat ponsel Anda.'
                    : 'Gunakan aplikasi Authenticator standar RFC 6238 untuk mendapatkan kode sandi sekali pakai yang berubah setiap 30 detik.'}
                </p>
              </div>

              <div className="shrink-0">
                {twoFactorEnabled ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorErrorMsg('');
                      setVerificationCode('');
                      setShow2FADisableModal(true);
                    }}
                    className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-semibold transition cursor-pointer text-xs"
                  >
                    Nonaktifkan 2FA
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStart2FASetup}
                    disabled={is2FALoading}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-semibold transition cursor-pointer text-xs flex items-center gap-2"
                  >
                    {is2FALoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Aktifkan 2FA Sekarang</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: LOKASI & JADWAL SHOLAT (API EQURAN.ID & MAPS) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Lokasi Sholat & Peta Geografis</h2>
                  <p className="text-xs text-slate-500">Tentukan kota jadwal sholat akurat dari API Bimas Islam (equran.id)</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDetectGps}
                disabled={isDetectingGps}
                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-xl font-semibold transition cursor-pointer text-xs flex items-center gap-1.5 border border-slate-200"
                title="Deteksi Otomatis Lokasi GPS"
              >
                {isDetectingGps ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                ) : (
                  <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                )}
                <span>GPS Otomatis</span>
              </button>
            </div>

            {locationSavedMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{locationSavedMsg}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Provinsi</label>
                  <select
                    value={selectedProvinsi}
                    onChange={(e) => setSelectedProvinsi(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                  >
                    {provinsiList.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Kabupaten / Kota</label>
                  <select
                    value={selectedKabkota}
                    onChange={(e) => setSelectedKabkota(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                  >
                    {kabkotaList.map((kab) => (
                      <option key={kab} value={kab}>
                        {kab}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interactive OpenStreetMap Preview */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                <div className="p-3 bg-white/90 backdrop-blur-xs border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{selectedKabkota}, {selectedProvinsi}</span>
                  </span>
                  <span className="font-mono text-slate-400">
                    Lat: {coords.lat.toFixed(4)}, Lon: {coords.lon.toFixed(4)}
                  </span>
                </div>
                <iframe
                  title="Peta Geografis Lokasi Sholat"
                  width="100%"
                  height="160"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.1}%2C${coords.lat - 0.1}%2C${coords.lon + 0.1}%2C${coords.lat + 0.1}&amp;layer=mapnik&amp;marker=${coords.lat}%2C${coords.lon}`}
                  className="w-full opacity-90"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveLocation}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-semibold transition cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Lokasi Jadwal Sholat</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 5: PREFERENSI SUARA QARI AL-QUR'AN */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Preferensi Suara Qari Al-Qur'an</h2>
                  <p className="text-xs text-slate-500">Pilih qari favorit yang akan diputar pada Mushaf dan Murojaah</p>
                </div>
              </div>
            </div>

            {qariSavedMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{qariSavedMsg}</span>
              </div>
            )}

            <div className="space-y-2.5 text-xs">
              {QARI_LIST.map((qari) => {
                const isSelected = selectedQari === qari.id;
                return (
                  <div
                    key={qari.id}
                    onClick={() => handleSaveQari(qari.id)}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-emerald-700 bg-emerald-700' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{qari.name}</p>
                        <p className="text-[11px] text-slate-500">{qari.subtitle}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePlaySample(qari.id);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 rounded-xl font-semibold transition cursor-pointer text-[11px] flex items-center gap-1.5 shrink-0"
                    >
                      {isPlayingSample && sampleAudioRef.current?.src.includes(qari.id) ? (
                        <>
                          <Square className="w-3 h-3 fill-slate-700" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-slate-700" />
                          <span>Dengar</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: SETUP 2FA (TOTP Activation)                                      */}
      {/* ========================================================================= */}
      {show2FASetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Setup Autentikasi 2FA</h3>
                  <p className="text-xs text-slate-500">Hubungkan dengan Google Authenticator atau Authy</p>
                </div>
              </div>
            </div>

            {twoFactorErrorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{twoFactorErrorMsg}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Step 1: Scan QR Code with Smartphone Authenticator */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <QrCode className="w-4 h-4 text-emerald-800" />
                  <span>Langkah 1: Pindai Kode QR Menggunakan HP</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Buka aplikasi <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, atau <strong>Authy</strong> di HP Anda, tekan tanda <strong>(+)</strong> dan pilih <strong>"Pindai kode QR"</strong>:
                </p>

                {qrCodeDataUrl ? (
                  <div className="flex flex-col items-center justify-center pt-1 pb-2">
                    <div className="p-3 bg-white rounded-2xl border-2 border-emerald-100 shadow-xs inline-block">
                      <img
                        src={qrCodeDataUrl}
                        alt="Kode QR Autentikasi 2FA Hifzhly"
                        className="w-44 h-44 rounded-xl"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 mt-2 font-medium">Arahkan kamera aplikasi ke kode QR di atas</span>
                  </div>
                ) : (
                  <div className="w-44 h-44 mx-auto flex items-center justify-center bg-white rounded-2xl border border-slate-200">
                    <RefreshCw className="w-5 h-5 text-emerald-700 animate-spin" />
                  </div>
                )}

                {/* Option for manual secret key */}
                <div className="pt-2 border-t border-slate-200 space-y-1.5">
                  <p className="text-slate-600 font-medium">
                    Tidak bisa memindai? Masukkan kunci penyiapan ini secara manual:
                  </p>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs">
                    <span className="font-bold text-emerald-900 tracking-wider break-all">{twoFactorSecret}</span>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="p-1.5 ml-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer shrink-0"
                      title="Salin Kunci Manual"
                    >
                      {copiedSecret ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2: Verification Input */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-800 block">
                  Langkah 2: Masukkan 6 Digit Kode Verifikasi dari Aplikasi
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Contoh: 123456"
                  className="w-full text-center text-xl font-mono tracking-widest py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  autoFocus
                />
                <p className="text-[11px] text-slate-500 text-center">
                  Masukkan kode angka 6 digit yang sedang aktif di aplikasi Anda untuk memastikan konfigurasi berhasil.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShow2FASetupModal(false);
                  setTwoFactorErrorMsg('');
                  setVerificationCode('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleConfirm2FA(true)}
                disabled={is2FALoading || verificationCode.length !== 6}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl font-semibold transition cursor-pointer text-xs flex items-center gap-2"
              >
                {is2FALoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Verifikasi & Aktifkan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DISABLE 2FA CONFIRMATION                                         */}
      {/* ========================================================================= */}
      {show2FADisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Nonaktifkan 2FA?</h3>
                <p className="text-xs text-slate-500">Konfirmasi autentikasi keamanan akun</p>
              </div>
            </div>

            {twoFactorErrorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{twoFactorErrorMsg}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Menonaktifkan 2FA akan mengurangi keamanan akun Anda. Masukkan 6 digit kode dari aplikasi authenticator untuk melanjutkan:
              </p>
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center text-xl font-mono tracking-widest py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShow2FADisableModal(false);
                  setTwoFactorErrorMsg('');
                  setVerificationCode('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleConfirm2FA(false)}
                disabled={is2FALoading || verificationCode.length !== 6}
                className="px-5 py-2 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white rounded-xl font-semibold transition cursor-pointer text-xs flex items-center gap-2"
              >
                {is2FALoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Konfirmasi Nonaktifkan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
