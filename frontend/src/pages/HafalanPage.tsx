import { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Volume2,
  Pause,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Layers,
  BookOpen,
  FileText
} from 'lucide-react';
import type { SrsDueItem, SurahSummary } from '../types';
import { recordMurojaahSingleAyah, recordMutabaahReport } from '../lib/mutabaahService';
import { calculateAyahPage, getJuzFromPage } from '../lib/quranMeta';
import ExitMutabaahModal, { ExitMutabaahPayload } from '../components/mutabaah/ExitMutabaahModal';
import { playDengSound } from '../lib/soundUtils';
import {
  MushafAyah,
  DEFAULT_SURAHS,
  parseAyahWords,
  normalizeArabic,
  getSpokenArabicWithHarakat,
  getSurahFromPage
} from './MurojaahPage';

export default function HafalanPage() {
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(78);
  const [currentSurah, setCurrentSurah] = useState<{ number: number; name: string; page: number; juz: number; ayahs: MushafAyah[] }>(DEFAULT_SURAHS[1]);

  // Mode Tampilan: Mode Ayat (fokus card per ayat) vs Mode Halaman Mushaf (tampilan perhalaman sesuai Mushaf Madinah)
  const [viewMode, setViewMode] = useState<'ayah' | 'mushaf'>('ayah');
  const [currentMushafPage, setCurrentMushafPage] = useState<number>(582);

  const [activeAyahIndex, setActiveAyahIndex] = useState(0);
  const activeAyah = currentSurah.ayahs[activeAyahIndex] || currentSurah.ayahs[0];

  // Dynamic Madinah Mushaf Page & Juz calculation
  const activeAyahPage = calculateAyahPage(
    currentSurah.number,
    activeAyah ? activeAyah.ayahNumber : 1,
    currentSurah.ayahs ? currentSurah.ayahs.length : 1
  );
  const activeAyahJuz = getJuzFromPage(viewMode === 'mushaf' ? currentMushafPage : activeAyahPage);

  // Sinkronisasi halaman mushaf saat ayat aktif berganti
  useEffect(() => {
    if (activeAyahPage) {
      setCurrentMushafPage(activeAyahPage);
    }
  }, [activeAyahPage]);

  // Mode Ghaib: kata tertutup '...' vs terbuka semua
  const [isBlindMode, setIsBlindMode] = useState(true);

  // Kata yang sudah berhasil dibuka/dilafalkan benar pada ayat aktif
  const [revealedWordIndices, setRevealedWordIndices] = useState<Set<number>>(new Set());

  // Indeks kata yang salah diucapkan (ganti warna merah + getar dikit + audio 'deng' tanpa merusak layout card)
  const [wrongWordIndex, setWrongWordIndex] = useState<number | null>(null);
  const [shakeIteration, setShakeIteration] = useState(0);

  // Real-time Voice Recognition State
  const [isLiveListening, setIsLiveListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isCompletedAyah, setIsCompletedAyah] = useState(false);
  const [scoreNotification, setScoreNotification] = useState<string | null>(null);

  // Refs untuk mencegah stale closure & debounce audio salah
  const activeAyahRef = useRef<MushafAyah>(activeAyah);
  const activeAyahIndexRef = useRef<number>(activeAyahIndex);
  const currentSurahRef = useRef(currentSurah);
  const isCompletedAyahRef = useRef<boolean>(false);
  const isTransitioningRef = useRef<boolean>(false);
  const revealedWordsRef = useRef<Set<number>>(new Set());
  const isLiveListeningRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Debounce & Cooldown Timer untuk audio kesalahan ('deng')
  const pendingErrorTimerRef = useRef<any>(null);
  const lastErrorSoundTimeRef = useRef<number>(0);

  useEffect(() => {
    activeAyahRef.current = activeAyah;
    activeAyahIndexRef.current = activeAyahIndex;
  }, [activeAyah, activeAyahIndex]);

  useEffect(() => {
    currentSurahRef.current = currentSurah;
  }, [currentSurah]);

  useEffect(() => {
    isLiveListeningRef.current = isLiveListening;
  }, [isLiveListening]);

  useEffect(() => {
    isCompletedAyahRef.current = isCompletedAyah;
  }, [isCompletedAyah]);

  useEffect(() => {
    revealedWordsRef.current = revealedWordIndices;
  }, [revealedWordIndices]);

  // Mutabaah Session & Exit-Intent Modal
  const sessionStartTimeRef = useRef<number>(Date.now());
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [exitPayload, setExitPayload] = useState<ExitMutabaahPayload | null>(null);

  const handleOpenExitModal = () => {
    const duration = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
    const ayahsCount = activeAyahIndex + 1;
    setExitPayload({
      activityType: 'hafalan_baru',
      surahNumber: currentSurah.number,
      surahName: currentSurah.name,
      startAyah: 1,
      endAyah: ayahsCount,
      totalAyahs: ayahsCount,
      pagesCount: Math.max(1, Math.ceil(ayahsCount / 15)),
      durationSeconds: Math.max(duration, 10),
      score: 97.0,
    });
    setIsExitModalOpen(true);
  };

  // SRS due items from backend
  const [dueAyahs, setDueAyahs] = useState<SrsDueItem[]>([]);
  const [isLoadingSrs, setIsLoadingSrs] = useState(false);

  // Audio Qari player
  const [isPlayingQari, setIsPlayingQari] = useState(false);
  const qariAudioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch SRS due items from PostgreSQL
  const fetchSrsQueue = async () => {
    setIsLoadingSrs(true);
    try {
      const token = localStorage.getItem('hifzhly_auth_token') || localStorage.getItem('token');
      const res = await fetch('/api/v1/srs/today', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          setDueAyahs(data.items);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingSrs(false);
    }
  };

  useEffect(() => {
    fetchSrsQueue();

    fetch('/api/v1/quran/surahs')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: SurahSummary[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setSurahs(data);
        }
      })
      .catch((err) => console.warn('Failed to fetch surah list from backend:', err));
  }, []);

  // Fetch Real Surah Ayahs from Backend API
  useEffect(() => {
    fetch(`/api/v1/quran/surahs/${selectedSurahNumber}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.ayahs && Array.isArray(data.ayahs)) {
          const parsed: MushafAyah[] = data.ayahs.map((a: any) => ({
            ayahNumber: a.ayahNumber,
            textArabic: a.textArabic,
            textLatin: a.textLatin,
            translation: a.translation,
            audioUrl: a.audioUrl,
            words: parseAyahWords(a.textArabic),
          }));
          setCurrentSurah({
            number: data.number,
            name: data.nameLatin,
            page: 1,
            juz: 30,
            ayahs: parsed,
          });
        }
      })
      .catch((err) => console.warn('Failed to load surah detail from backend:', err));
  }, [selectedSurahNumber]);

  // Reset status kata setiap ganti ayat
  useEffect(() => {
    if (pendingErrorTimerRef.current) {
      clearTimeout(pendingErrorTimerRef.current);
      pendingErrorTimerRef.current = null;
    }
    revealedWordsRef.current = new Set();
    setRevealedWordIndices(new Set());
    setWrongWordIndex(null);
    setIsCompletedAyah(false);
    isCompletedAyahRef.current = false;
    isTransitioningRef.current = false;
    setLiveTranscript('');
  }, [activeAyahIndex, selectedSurahNumber]);

  // Sync selesai ayat ke backend SRS & Mutabaah
  const handleAyahCompleted = async (ayah: MushafAyah) => {
    if (pendingErrorTimerRef.current) {
      clearTimeout(pendingErrorTimerRef.current);
      pendingErrorTimerRef.current = null;
    }

    setIsCompletedAyah(true);
    isCompletedAyahRef.current = true;
    isTransitioningRef.current = true;
    setWrongWordIndex(null);
    setScoreNotification(`Alhamdulillah! Hafalan Ayat ${ayah.ayahNumber} Mutqin (100%)`);

    try {
      recordMurojaahSingleAyah(
        currentSurah.number,
        currentSurah.name,
        ayah.ayahNumber,
        100
      );
    } catch (e) {
      console.warn('Failed to record mutabaah locally:', e);
    }

    try {
      const token = localStorage.getItem('hifzhly_auth_token') || localStorage.getItem('token');
      await fetch('/api/v1/murojaah/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          surahNumber: currentSurah.number,
          ayahNumber: ayah.ayahNumber,
          userText: ayah.textArabic,
        }),
      });
      fetchSrsQueue();
    } catch {}

    setTimeout(() => {
      setScoreNotification(null);
      isTransitioningRef.current = false;
      if (activeAyahIndexRef.current < currentSurahRef.current.ayahs.length - 1) {
        setActiveAyahIndex((prev) => prev + 1);
      }
    }, 1800);
  };

  // User klik kata yang kosong/mentok -> Buka perkata saja bukan seayat
  const handleRevealSingleWord = (wordIndex: number) => {
    if (pendingErrorTimerRef.current) {
      clearTimeout(pendingErrorTimerRef.current);
      pendingErrorTimerRef.current = null;
    }

    setRevealedWordIndices((prev) => {
      const next = new Set(prev);
      next.add(wordIndex);
      if (wrongWordIndex === wordIndex) {
        setWrongWordIndex(null);
      }
      if (next.size === activeAyah.words.length && !isCompletedAyahRef.current) {
        handleAyahCompleted(activeAyah);
      }
      return next;
    });
  };

  // Navigasi halaman Mushaf Madinah
  const handleMushafPageChange = (newPage: number) => {
    if (newPage < 1 || newPage > 604) return;
    setCurrentMushafPage(newPage);

    const targetSurah = getSurahFromPage(newPage);
    if (targetSurah !== selectedSurahNumber) {
      setSelectedSurahNumber(targetSurah);
      setActiveAyahIndex(0);
    } else {
      const matchIdx = currentSurah.ayahs.findIndex(
        (a) => calculateAyahPage(currentSurah.number, a.ayahNumber, currentSurah.ayahs.length) === newPage
      );
      if (matchIdx !== -1) {
        setActiveAyahIndex(matchIdx);
      }
    }
  };

  // Algoritma Pencocokan Real-time Kata Suara vs Ayat (Dengan jeda validasi dan cooldown suara 'deng')
  const processSpokenArabic = (spokenText: string) => {
    if (!spokenText || isCompletedAyahRef.current || isTransitioningRef.current) return;

    const currentTargetAyah = activeAyahRef.current;
    if (!currentTargetAyah || !currentTargetAyah.words) return;

    const normalizedSpoken = normalizeArabic(spokenText);
    const spokenTokens = normalizedSpoken.split(/\s+/).filter(Boolean);
    if (spokenTokens.length === 0) return;

    const currentRevealed = revealedWordsRef.current;
    let targetIndex = -1;
    for (let i = 0; i < currentTargetAyah.words.length; i++) {
      if (!currentRevealed.has(i)) {
        targetIndex = i;
        break;
      }
    }

    if (targetIndex === -1) return;

    const targetWord = currentTargetAyah.words[targetIndex];
    const latestToken = spokenTokens[spokenTokens.length - 1];

    // Cek apakah suara cocok dengan kata target
    const isMatched =
      latestToken === targetWord.clean ||
      (latestToken.startsWith('و') && latestToken.slice(1) === targetWord.clean) ||
      (latestToken.startsWith('ف') && latestToken.slice(1) === targetWord.clean) ||
      (latestToken.startsWith('ب') && latestToken.slice(1) === targetWord.clean) ||
      (latestToken.startsWith('ل') && latestToken.slice(1) === targetWord.clean) ||
      (targetWord.clean.startsWith(latestToken) && latestToken.length >= 3) ||
      (latestToken.startsWith(targetWord.clean) && targetWord.clean.length >= 3);

    if (isMatched) {
      // Benar: batalkan timer error jika ada yang tertunda
      if (pendingErrorTimerRef.current) {
        clearTimeout(pendingErrorTimerRef.current);
        pendingErrorTimerRef.current = null;
      }

      setWrongWordIndex(null);
      setRevealedWordIndices((prev) => {
        const next = new Set(prev);
        next.add(targetIndex);
        if (next.size === currentTargetAyah.words.length && !isCompletedAyahRef.current) {
          handleAyahCompleted(currentTargetAyah);
        }
        return next;
      });
    } else {
      // Salah / Belum selesai lafal: Berikan jeda (debounce 1600ms) untuk memastikan user benar-benar salah
      if (latestToken.length >= 2) {
        if (!pendingErrorTimerRef.current) {
          pendingErrorTimerRef.current = setTimeout(() => {
            const now = Date.now();
            // Cooldown minimal 2.8 detik agar tidak berbunyi terlalu sering
            if (now - lastErrorSoundTimeRef.current >= 2800) {
              setWrongWordIndex(targetIndex);
              setShakeIteration((prev) => prev + 1);
              playDengSound(); // Bunyi 'deng' bass resonan ala Netflix
              lastErrorSoundTimeRef.current = now;
            }
            pendingErrorTimerRef.current = null;
          }, 1600);
        }
      }
    }
  };

  // Web Speech Recognition
  const startLiveListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Browser Anda belum mendukung Web Speech API real-time. Silakan gunakan Google Chrome, Microsoft Edge, atau Safari iOS terbaru.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA';

      recognition.onstart = () => {
        setIsLiveListening(true);
        isLiveListeningRef.current = true;
      };

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript + ' ';
          } else {
            interimText += transcript;
          }
        }

        const currentSpoken = (finalText + ' ' + interimText).trim();
        if (currentSpoken) {
          setLiveTranscript(currentSpoken);
          processSpokenArabic(currentSpoken);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition warning:', event.error);
      };

      recognition.onend = () => {
        if (isLiveListeningRef.current && !isCompletedAyahRef.current && !isTransitioningRef.current) {
          try {
            recognition.start();
          } catch {
            setIsLiveListening(false);
            isLiveListeningRef.current = false;
          }
        } else if (!isLiveListeningRef.current) {
          setIsLiveListening(false);
          isLiveListeningRef.current = false;
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Error starting live speech recognition:', err);
      setIsLiveListening(false);
      isLiveListeningRef.current = false;
    }
  };

  const stopLiveListening = () => {
    setIsLiveListening(false);
    isLiveListeningRef.current = false;
    if (pendingErrorTimerRef.current) {
      clearTimeout(pendingErrorTimerRef.current);
      pendingErrorTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
  };

  const handleToggleListening = () => {
    if (isLiveListening) {
      stopLiveListening();
    } else {
      startLiveListening();
    }
  };

  // Play audio qari resmi
  const handleToggleQari = () => {
    if (isPlayingQari) {
      if (qariAudioRef.current) qariAudioRef.current.pause();
      setIsPlayingQari(false);
      return;
    }

    const audio = new Audio(activeAyah.audioUrl);
    qariAudioRef.current = audio;
    audio.play();
    setIsPlayingQari(true);

    audio.onended = () => setIsPlayingQari(false);
    audio.onerror = () => setIsPlayingQari(false);
  };

  // Simulasi testing: Buka kata perkata
  const handleSimulateWordReveal = () => {
    for (let i = 0; i < activeAyah.words.length; i++) {
      if (!revealedWordIndices.has(i)) {
        handleRevealSingleWord(i);
        break;
      }
    }
  };

  // Simulasi testing: Uji salah kata (warna merah + getar dikit + suara 'deng')
  const handleSimulateWordError = () => {
    for (let i = 0; i < activeAyah.words.length; i++) {
      if (!revealedWordIndices.has(i)) {
        setWrongWordIndex(i);
        setShakeIteration((prev) => prev + 1);
        playDengSound();
        break;
      }
    }
  };

  // Filter ayat-ayat yang berada di halaman mushaf aktif
  const mushafPageAyahs = currentSurah.ayahs.filter(
    (a) => calculateAyahPage(currentSurah.number, a.ayahNumber, currentSurah.ayahs.length) === currentMushafPage
  );
  const displayAyahs = viewMode === 'mushaf' && mushafPageAyahs.length > 0 ? mushafPageAyahs : currentSurah.ayahs;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-36 font-sans">
      {/* Toast Notifikasi Keberhasilan Ayat */}
      {scoreNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-teal-700 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-teal-400 text-sm font-semibold animate-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5 text-teal-200" />
          <span>{scoreNotification}</span>
        </div>
      )}

      {/* Surah, Mode Switcher & Sesi Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Pemilihan Surah */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-teal-700" />
            <select
              value={selectedSurahNumber}
              onChange={(e) => {
                setSelectedSurahNumber(Number(e.target.value));
                setActiveAyahIndex(0);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 cursor-pointer"
            >
              {surahs.length > 0
                ? surahs.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.nameLatin} ({s.numberOfAyahs} Ayat)
                    </option>
                  ))
                : DEFAULT_SURAHS.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.name}
                    </option>
                  ))}
            </select>
          </div>

          {/* Toggle Mode: Mode Ayat vs Mode Halaman Mushaf */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('ayah')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'ayah'
                  ? 'bg-white text-teal-800 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Mode Ayat</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mushaf')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'mushaf'
                  ? 'bg-white text-teal-800 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Halaman Mushaf</span>
            </button>
          </div>
        </div>

        {/* Tombol Selesai Hafalan & Catat Mutabaah */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleOpenExitModal}
            className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Selesai Sesi &amp; Catat</span>
          </button>
        </div>
      </div>

      {/* SRS Due Banner bila ada */}
      {dueAyahs.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>{dueAyahs.length} Ayat</strong> target hafalan baru hari ini {isLoadingSrs ? '...' : ''}
          </span>
        </div>
      )}

      {/* Mushaf Page Container */}
      <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px] ${viewMode === 'mushaf' ? 'bg-[#FFFDF9]' : ''}`}>
        {/* Mushaf Top Header Navigation */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <button
            onClick={() => {
              if (viewMode === 'mushaf') {
                handleMushafPageChange(currentMushafPage - 1);
              } else if (activeAyahIndex > 0) {
                setActiveAyahIndex((prev) => prev - 1);
              }
            }}
            disabled={viewMode === 'mushaf' ? currentMushafPage <= 1 : activeAyahIndex === 0}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent"
            title={viewMode === 'mushaf' ? 'Halaman Sebelumnya' : 'Ayat Sebelumnya'}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {currentSurah.name}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {viewMode === 'mushaf'
                ? `Halaman Mushaf ${currentMushafPage} / 604 • Juz ${activeAyahJuz}`
                : `Ayat ${activeAyah.ayahNumber} dari ${currentSurah.ayahs.length} • Halaman ${activeAyahPage} • Juz ${activeAyahJuz}`}
            </p>
          </div>

          <button
            onClick={() => {
              if (viewMode === 'mushaf') {
                handleMushafPageChange(currentMushafPage + 1);
              } else if (activeAyahIndex < currentSurah.ayahs.length - 1) {
                setActiveAyahIndex((prev) => prev + 1);
              }
            }}
            disabled={viewMode === 'mushaf' ? currentMushafPage >= 604 : activeAyahIndex >= currentSurah.ayahs.length - 1}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent"
            title={viewMode === 'mushaf' ? 'Halaman Selanjutnya' : 'Ayat Selanjutnya'}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Mushaf Body: Basmalah & Konten Ayat */}
        <div className="p-5 sm:p-9 flex-1 flex flex-col justify-center space-y-6 select-none">
          {/* Basmalah */}
          {currentSurah.number !== 9 && (
            <div className="text-center py-1">
              <p className="font-quran text-2xl sm:text-3xl text-slate-800 tracking-wide" dir="rtl">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </p>
            </div>
          )}

          {/* DAFTAR AYAT DENGAN LAYOUT STABIL (TIDAK BERUBAH BENTUK SAAT SALAH) */}
          <div className="space-y-6">
            {displayAyahs.map((ayah, aIdx) => {
              const isCurrent = ayah.ayahNumber === activeAyah.ayahNumber;
              const isPast = ayah.ayahNumber < activeAyah.ayahNumber;

              if (viewMode === 'ayah' && !isCurrent && !isPast && aIdx > activeAyahIndex + 1) {
                return null;
              }

              return (
                <div
                  key={ayah.ayahNumber}
                  onClick={() => {
                    if (viewMode === 'mushaf' && !isCurrent) {
                      const foundIdx = currentSurah.ayahs.findIndex((x) => x.ayahNumber === ayah.ayahNumber);
                      if (foundIdx !== -1) setActiveAyahIndex(foundIdx);
                    }
                  }}
                  className={`p-5 sm:p-6 rounded-3xl transition-all duration-300 ${
                    isCurrent
                      ? 'bg-teal-50/80 border-2 border-teal-300 shadow-sm ring-1 ring-teal-200/50'
                      : isPast
                      ? 'bg-white border border-slate-200/90 opacity-75'
                      : 'bg-slate-50/40 border border-slate-200/50 opacity-40 hover:opacity-70 cursor-pointer'
                  }`}
                >
                  {/* Status header ayat aktif */}
                  {isCurrent && (
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-teal-100 text-xs font-semibold text-teal-800">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                        Sedang Menghafal: Ayat {ayah.ayahNumber}
                      </span>
                      <span className="text-slate-400 font-sans font-normal text-[11px]">
                        Kata terbuka: {revealedWordIndices.size}/{ayah.words.length}
                      </span>
                    </div>
                  )}

                  {/* KONTEN AYAT: LAYOUT TETAP STABIL DAN TERUSAN, HANYA KATA SALAH YANG MENJADI MERAH */}
                  <div
                    className="flex flex-wrap items-center gap-x-3.5 gap-y-3 font-quran text-3xl sm:text-4xl leading-loose justify-start text-right select-none"
                    dir="rtl"
                  >
                    {ayah.words.map((w, wIdx) => {
                      const isWordRevealed =
                        isPast ||
                        !isBlindMode ||
                        (isCurrent && revealedWordIndices.has(wIdx));

                      const isWordWrong = isCurrent && wrongWordIndex === wIdx;

                      return (
                        <span
                          key={isWordWrong ? `wrong-${shakeIteration}-${wIdx}` : wIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isCurrent && !isWordRevealed) {
                              handleRevealSingleWord(wIdx);
                            }
                          }}
                          className={`inline-block transition-all duration-200 select-none ${
                            isWordRevealed
                              ? 'text-teal-950 font-medium scale-100 animate-in fade-in'
                              : isWordWrong
                              ? 'bg-rose-100/95 text-rose-800 border-2 border-rose-500 rounded-2xl px-3 py-0.5 animate-shake shadow-xs cursor-pointer'
                              : 'text-slate-400 hover:text-teal-700 bg-teal-100/60 hover:bg-teal-200/70 border border-teal-200/80 px-3 py-0.5 rounded-xl text-2xl font-normal cursor-pointer'
                          }`}
                          title={
                            isWordRevealed
                              ? w.raw
                              : isWordWrong
                              ? 'Salah sebut kata ini (klik jika mentok untuk membuka)'
                              : 'Klik jika mentok untuk melihat kata ini'
                          }
                        >
                          {isWordRevealed ? w.raw : '...'}
                        </span>
                      );
                    })}

                    {/* Nomor Ayat Mushaf ۝ */}
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-teal-400 bg-white font-sans text-xs font-bold text-teal-900 mx-2 shadow-xs select-none">
                      {ayah.ayahNumber}
                    </span>
                  </div>

                  {/* Terjemahan & Latin hanya pada ayat aktif saat tidak blind mode */}
                  {isCurrent && !isBlindMode && (
                    <div className="mt-4 pt-3 border-t border-teal-100 text-left font-sans" dir="ltr">
                      <p className="text-xs font-semibold text-teal-800">{ayah.textLatin}</p>
                      <p className="text-xs text-slate-500 italic mt-0.5">{ayah.translation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Indikator Mode & Bantuan Testing */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isBlindMode ? 'bg-amber-500' : 'bg-teal-500'
              }`}
            />
            <span>
              {isBlindMode
                ? 'Mode Hafalan Mandiri: Kata muncul seketika setelah dilafalkan (Klik kata jika mentok)'
                : 'Mode Bimbingan Teks: Seluruh kata ditampilkan'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSimulateWordReveal}
              className="text-[11px] text-teal-700 hover:underline font-semibold"
              title="Uji coba buka 1 kata berikutnya bila tanpa mikrofon"
            >
              Uji Buka Kata
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={handleSimulateWordError}
              className="text-[11px] text-rose-600 hover:underline font-semibold"
              title="Uji coba efek salah sebut kata (warna merah + getar dikit + bunyi 'deng')"
            >
              Uji Salah Sebut
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Live Dock (Responsive bottom spacing to avoid bottom nav overlap on mobile) */}
      <div className="fixed bottom-20 md:bottom-6 left-0 right-0 z-40 px-4">
        <div className="max-w-xl mx-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-3 shadow-2xl shadow-slate-950/15 flex flex-col items-center space-y-3">
          {/* Kotak Pendeteksi Suara User: Bahasa Indonesia saat menunggu, Font Quran & Harakat saat user mulai melafalkan */}
          <div className="w-full bg-teal-950/95 border border-teal-800 rounded-2xl py-2.5 px-4 text-center shadow-inner">
            <div className="flex flex-col items-center justify-center gap-1">
              {isLiveListening && (
                <div className="flex items-center gap-2 self-center mb-0.5" dir="ltr">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                  <span className="text-[10px] font-semibold text-teal-300 uppercase tracking-wider">
                    Pendeteksi Suara Real-time
                  </span>
                </div>
              )}

              {liveTranscript && isLiveListening ? (
                /* Saat user sudah menyebutkan ayat: Tampilkan dengan font Al-Qur'an dan harakat lengkap */
                <div
                  className="font-quran text-2xl sm:text-3xl text-teal-100 tracking-wide leading-relaxed min-h-[38px] flex items-center justify-center animate-in fade-in"
                  dir="rtl"
                >
                  {getSpokenArabicWithHarakat(liveTranscript, activeAyah.words)}
                </div>
              ) : (
                /* Saat belum ada suara / sedang menunggu suara: Gunakan Bahasa Indonesia */
                <div className="text-xs sm:text-sm font-medium text-teal-200/80 min-h-[38px] flex items-center justify-center font-sans tracking-wide">
                  {isLiveListening
                    ? 'Mendengarkan lantunan hafalan Anda...'
                    : 'Tekan tombol mikrofon untuk mulai melafalkan'}
                </div>
              )}
            </div>
          </div>

          {/* Action Dock Controls */}
          <div className="flex items-center justify-between w-full px-4 sm:px-6">
            {/* Tombol Mata (Eye Toggle): Mode Hafalan Ghaib vs Buka Teks */}
            <button
              type="button"
              onClick={() => setIsBlindMode(!isBlindMode)}
              className={`p-3 rounded-2xl border transition ${
                isBlindMode
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  : 'bg-teal-100 border-teal-300 text-teal-800'
              }`}
              title={isBlindMode ? 'Buka Teks Bantuan' : 'Tutup Kata (Uji Hafalan)'}
            >
              {isBlindMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            {/* Tombol Ayat Sebelumnya */}
            <button
              type="button"
              disabled={activeAyahIndex === 0}
              onClick={() => setActiveAyahIndex((prev) => Math.max(0, prev - 1))}
              className="p-3 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 transition cursor-pointer"
              title="Ayat Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Tombol Mikrofon Utama */}
            <button
              type="button"
              onClick={handleToggleListening}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 active:scale-95 cursor-pointer ${
                isLiveListening
                  ? 'bg-rose-600 hover:bg-rose-700 ring-4 ring-rose-300 animate-pulse'
                  : 'bg-teal-600 hover:bg-teal-700 ring-4 ring-teal-200'
              }`}
              title={isLiveListening ? 'Hentikan Live Listening' : 'Mulai Hafalan Real-time'}
            >
              {isLiveListening ? (
                <Square className="w-6 h-6 fill-white" />
              ) : (
                <Mic className="w-7 h-7" />
              )}
            </button>

            {/* Tombol Ayat Selanjutnya */}
            <button
              type="button"
              disabled={activeAyahIndex >= currentSurah.ayahs.length - 1}
              onClick={() =>
                setActiveAyahIndex((prev) =>
                  Math.min(currentSurah.ayahs.length - 1, prev + 1)
                )
              }
              className="p-3 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 transition cursor-pointer"
              title="Ayat Selanjutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Tombol Dengarkan Audio Qari Resmi */}
            <button
              type="button"
              onClick={handleToggleQari}
              className={`p-3 rounded-2xl border transition ${
                isPlayingQari
                  ? 'bg-amber-100 border-amber-300 text-amber-800 animate-pulse'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title={isPlayingQari ? 'Hentikan Audio Qari' : 'Dengarkan Bacaan Murottal Qari'}
            >
              {isPlayingQari ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Exit-Intent Logger Modal Mutabaah */}
      {exitPayload && (
        <ExitMutabaahModal
          isOpen={isExitModalOpen}
          onClose={() => setIsExitModalOpen(false)}
          onSave={(payload) => {
            recordMutabaahReport({
              activityType: 'hafalan_baru',
              surahNumber: payload.surahNumber,
              surahName: payload.surahName,
              ayahStart: payload.startAyah,
              ayahEnd: payload.endAyah,
              durationSeconds: payload.durationSeconds,
              pagesCount: payload.pagesCount,
              score: payload.score,
              santriNotes: payload.santriNotes,
            });
            setIsExitModalOpen(false);
            setScoreNotification('Alhamdulillah! Laporan sesi hafalan tersimpan ke Mutabaah Yaumi.');
            setTimeout(() => setScoreNotification(null), 3000);
          }}
          activityType={exitPayload.activityType}
          surahNumber={exitPayload.surahNumber}
          surahName={exitPayload.surahName}
          startAyah={exitPayload.startAyah}
          endAyah={exitPayload.endAyah}
          totalAyahs={exitPayload.totalAyahs}
          pagesCount={exitPayload.pagesCount}
          durationSeconds={exitPayload.durationSeconds}
          score={exitPayload.score}
        />
      )}
    </div>
  );
}
