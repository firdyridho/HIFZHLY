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
  AlertCircle,
  Brain
} from 'lucide-react';
import type { SrsDueItem, SurahSummary } from '../types';
import { recordMurojaahSingleAyah, recordMutabaahReport } from '../lib/mutabaahService';
import { calculateAyahPage, getJuzFromPage } from '../lib/quranMeta';
import ExitMutabaahModal, { ExitMutabaahPayload } from '../components/mutabaah/ExitMutabaahModal';
import { playTengChime } from '../lib/soundUtils';
import {
  MushafAyah,
  DEFAULT_SURAHS,
  parseAyahWords,
  normalizeArabic,
  getSpokenArabicWithHarakat
} from './MurojaahPage';

export default function HafalanPage() {
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(78);
  const [currentSurah, setCurrentSurah] = useState<{ number: number; name: string; page: number; juz: number; ayahs: MushafAyah[] }>(DEFAULT_SURAHS[1]);

  const [activeAyahIndex, setActiveAyahIndex] = useState(0);
  const activeAyah = currentSurah.ayahs[activeAyahIndex] || currentSurah.ayahs[0];

  // Dynamic Madinah Mushaf Page & Juz calculation for the current active ayah
  const activeAyahPage = calculateAyahPage(
    currentSurah.number,
    activeAyah ? activeAyah.ayahNumber : 1,
    currentSurah.ayahs ? currentSurah.ayahs.length : 1
  );
  const activeAyahJuz = getJuzFromPage(activeAyahPage);

  // Mode Ghaib: kata tertutup '...' vs terbuka semua
  const [isBlindMode, setIsBlindMode] = useState(true);

  // Kata yang sudah berhasil dibuka/dilafalkan benar pada ayat aktif
  const [revealedWordIndices, setRevealedWordIndices] = useState<Set<number>>(new Set());

  // Indeks kata yang salah diucapkan (memicu pemisahan card segmen merah + getaran + audio 'teng')
  const [wrongWordIndex, setWrongWordIndex] = useState<number | null>(null);
  const [shakeIteration, setShakeIteration] = useState(0);

  // Real-time Voice Recognition State
  const [isLiveListening, setIsLiveListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isCompletedAyah, setIsCompletedAyah] = useState(false);
  const [scoreNotification, setScoreNotification] = useState<string | null>(null);

  // Synchronized Refs to avoid stale closures in Web Speech API callbacks
  const activeAyahRef = useRef<MushafAyah>(activeAyah);
  const activeAyahIndexRef = useRef<number>(activeAyahIndex);
  const currentSurahRef = useRef(currentSurah);
  const isCompletedAyahRef = useRef<boolean>(false);
  const isTransitioningRef = useRef<boolean>(false);
  const revealedWordsRef = useRef<Set<number>>(new Set());
  const isLiveListeningRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);

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
      activityType: 'murojaah',
      surahNumber: currentSurah.number,
      surahName: currentSurah.name,
      startAyah: 1,
      endAyah: ayahsCount,
      totalAyahs: ayahsCount,
      pagesCount: Math.max(1, Math.ceil(ayahsCount / 15)),
      durationSeconds: Math.max(duration, 10),
      score: 96.5,
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
    setIsCompletedAyah(true);
    isCompletedAyahRef.current = true;
    isTransitioningRef.current = true;
    setWrongWordIndex(null);
    setScoreNotification(`Alhamdulillah! Hafalan Ayat ${ayah.ayahNumber} Selesai & Mutqin`);

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

  // Algoritma Pencocokan Real-time Kata Suara vs Ayat (Perkata Muncul Langsung)
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

    const isMatched =
      latestToken === targetWord.clean ||
      (latestToken.startsWith('و') && latestToken.slice(1) === targetWord.clean) ||
      (latestToken.startsWith('ف') && latestToken.slice(1) === targetWord.clean) ||
      (targetWord.clean.startsWith(latestToken) && latestToken.length >= 3) ||
      (latestToken.startsWith(targetWord.clean) && targetWord.clean.length >= 3);

    if (isMatched) {
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
      if (latestToken.length >= 2) {
        setWrongWordIndex(targetIndex);
        setShakeIteration((prev) => prev + 1);
        playTengChime();
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

  // Simulasi testing: Uji salah kata (menampilkan card merah bergetar + suara teng)
  const handleSimulateWordError = () => {
    for (let i = 0; i < activeAyah.words.length; i++) {
      if (!revealedWordIndices.has(i)) {
        setWrongWordIndex(i);
        setShakeIteration((prev) => prev + 1);
        playTengChime();
        break;
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-28 font-sans">
      {/* Toast Notifikasi Keberhasilan Ayat */}
      {scoreNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-400 text-sm font-semibold animate-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{scoreNotification}</span>
        </div>
      )}

      {/* Surah & SRS Queue Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <Brain className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Hafalan Baru:
          </span>
          <select
            value={selectedSurahNumber}
            onChange={(e) => {
              setSelectedSurahNumber(Number(e.target.value));
              setActiveAyahIndex(0);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 cursor-pointer"
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

        {/* Tombol Selesai Sesi & Catat Mutabaah */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenExitModal}
            className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Selesai Sesi &amp; Catat</span>
          </button>
        </div>

        {/* SRS Due Badge */}
        {dueAyahs.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg w-full sm:w-auto justify-center sm:justify-end">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>
              <strong>{dueAyahs.length} Ayat</strong> target hafalan hari ini {isLoadingSrs ? '...' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Mushaf Page Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Mushaf Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            onClick={() => {
              if (activeAyahIndex > 0) setActiveAyahIndex((prev) => prev - 1);
            }}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Ayat Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {currentSurah.name}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Ayat {activeAyah.ayahNumber} dari {currentSurah.ayahs.length} | Halaman {activeAyahPage} • Juz {activeAyahJuz}
            </p>
          </div>

          <button
            onClick={() => {
              if (activeAyahIndex < currentSurah.ayahs.length - 1) {
                setActiveAyahIndex((prev) => prev + 1);
              }
            }}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Ayat Selanjutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Mushaf Body: Basmalah & Ayah Card Utama */}
        <div className="p-6 sm:p-10 flex-1 flex flex-col justify-center space-y-6 select-none">
          {/* Basmalah */}
          {currentSurah.number !== 9 && (
            <div className="text-center py-1">
              <p className="font-quran text-2xl sm:text-3xl text-slate-800 tracking-wide" dir="rtl">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </p>
            </div>
          )}

          {/* CARD IJO PER AYAT (Satu card utuh per ayat, bukan perbaris) */}
          <div className="space-y-6">
            {currentSurah.ayahs.map((ayah, aIdx) => {
              const isCurrent = aIdx === activeAyahIndex;
              const isPast = aIdx < activeAyahIndex;

              if (!isCurrent && !isPast && aIdx > activeAyahIndex + 1) {
                return null;
              }

              return (
                <div
                  key={ayah.ayahNumber}
                  className={`p-6 rounded-3xl transition-all duration-300 ${
                    isCurrent
                      ? 'bg-emerald-50/80 border-2 border-emerald-300 shadow-sm'
                      : isPast
                      ? 'bg-white border border-slate-200/90 opacity-70'
                      : 'bg-slate-50/50 border border-slate-200/50 opacity-40'
                  }`}
                >
                  {/* Status header ayat aktif */}
                  {isCurrent && (
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-100 text-xs font-semibold text-emerald-800">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                        Sedang Menghafal: Ayat {ayah.ayahNumber}
                      </span>
                      <span className="text-slate-400 font-sans font-normal text-[11px]">
                        Kata terbuka: {revealedWordIndices.size}/{ayah.words.length}
                      </span>
                    </div>
                  )}

                  {/* KONTEN AYAT: CARD TERPISAH BILA SALAH SEBUT (SEGMENTED CARD) */}
                  {isCurrent && wrongWordIndex !== null ? (
                    <div className="flex flex-row-reverse flex-wrap items-center gap-2 font-quran text-3xl sm:text-4xl leading-loose" dir="rtl">
                      {/* Segmen 1: Kata-kata benar di awal (sebelum kata yang salah) */}
                      {wrongWordIndex > 0 && (
                        <div className="bg-emerald-100/90 border-2 border-emerald-400 text-emerald-950 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xs">
                          {ayah.words.slice(0, wrongWordIndex).map((w, idx) => (
                            <span key={idx} className="transition-all text-emerald-950 font-medium">
                              {w.raw}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Segmen 2: Kata yang salah (Warna Merah, Memisah bersebelahan, Bergetar + Audio 'Teng') */}
                      <div
                        key={`error-seg-${shakeIteration}`}
                        onClick={() => handleRevealSingleWord(wrongWordIndex)}
                        className="bg-rose-100/95 border-2 border-rose-500 text-rose-800 px-4 py-2 rounded-2xl animate-shake shadow-md shadow-rose-500/15 flex items-center gap-2.5 cursor-pointer hover:bg-rose-200 transition-all"
                        title="Salah sebut kata! Klik kata ini jika mentok untuk membuka"
                      >
                        <AlertCircle className="w-4 h-4 text-rose-600 inline shrink-0" />
                        <span className="text-rose-700 font-bold">
                          {revealedWordIndices.has(wrongWordIndex) ? ayah.words[wrongWordIndex].raw : '...'}
                        </span>
                        <span className="text-[10px] font-sans font-bold bg-rose-200 text-rose-800 px-2 py-0.5 rounded-lg border border-rose-300">
                          Ulangi kata ini (klik jika mentok)
                        </span>
                      </div>

                      {/* Segmen 3: Kata-kata sisa berikutnya yang belum dibaca */}
                      {wrongWordIndex < ayah.words.length - 1 && (
                        <div className="bg-emerald-50/60 border border-emerald-200/80 text-slate-400 px-4 py-2 rounded-2xl flex items-center gap-3">
                          {ayah.words.slice(wrongWordIndex + 1).map((w, sliceIdx) => {
                            const actualIdx = wrongWordIndex + 1 + sliceIdx;
                            const isWordRevealed = revealedWordIndices.has(actualIdx);
                            return (
                              <span
                                key={actualIdx}
                                onClick={() => handleRevealSingleWord(actualIdx)}
                                className="cursor-pointer hover:text-emerald-700 transition-colors"
                                title="Klik jika mentok untuk membuka kata ini"
                              >
                                {isWordRevealed ? w.raw : '...'}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Nomor Ayat */}
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-emerald-400 bg-white font-sans text-xs font-bold text-emerald-900 mx-2 shadow-xs select-none">
                        {ayah.ayahNumber}
                      </span>
                    </div>
                  ) : (
                    /* KONTEN AYAT NORMAL: SATU CARD PER AYAT */
                    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-3 font-quran text-3xl sm:text-4xl leading-loose justify-start text-right" dir="rtl">
                      {ayah.words.map((w, wIdx) => {
                        const isWordRevealed =
                          isPast ||
                          !isBlindMode ||
                          (isCurrent && revealedWordIndices.has(wIdx));

                        return (
                          <span
                            key={wIdx}
                            onClick={() => {
                              if (isCurrent && !isWordRevealed) {
                                handleRevealSingleWord(wIdx);
                              }
                            }}
                            className={`inline-block transition-all duration-300 ${
                              isWordRevealed
                                ? isCurrent && revealedWordIndices.has(wIdx)
                                  ? 'text-emerald-950 font-medium scale-100 animate-in fade-in'
                                  : 'text-slate-800'
                                : 'text-slate-400 hover:text-emerald-700 bg-emerald-100/60 hover:bg-emerald-200/70 border border-emerald-200/80 px-3 py-0.5 rounded-xl text-2xl font-normal cursor-pointer select-none'
                            }`}
                            title={isWordRevealed ? w.raw : 'Klik jika mentok untuk melihat kata ini'}
                          >
                            {isWordRevealed ? w.raw : '...'}
                          </span>
                        );
                      })}

                      {/* Nomor Ayat Mushaf ۝ */}
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-emerald-400 bg-white font-sans text-xs font-bold text-emerald-900 mx-2 shadow-xs select-none">
                        {ayah.ayahNumber}
                      </span>
                    </div>
                  )}

                  {/* Terjemahan & Latin hanya pada ayat aktif saat tidak blind mode */}
                  {isCurrent && !isBlindMode && (
                    <div className="mt-4 pt-3 border-t border-emerald-100 text-left font-sans" dir="ltr">
                      <p className="text-xs font-semibold text-emerald-800">{ayah.textLatin}</p>
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
                isBlindMode ? 'bg-teal-500' : 'bg-emerald-500'
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
              title="Uji coba efek salah sebut kata (card merah bergetar + suara teng)"
            >
              Uji Salah Sebut
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Live Dock (Responsive bottom spacing to avoid bottom nav overlap on mobile) */}
      <div className="fixed bottom-20 md:bottom-6 left-0 right-0 z-40 px-4">
        <div className="max-w-xl mx-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-3 shadow-2xl shadow-slate-950/15 flex flex-col items-center space-y-3">
          {/* Kotak Pendeteksi Suara User dengan Font Al-Qur'an & Harakat Lengkap */}
          <div className="w-full bg-emerald-950/95 border border-emerald-800 rounded-2xl py-2.5 px-4 text-center shadow-inner">
            <div className="flex flex-col items-center justify-center gap-1" dir="rtl">
              {isLiveListening && (
                <div className="flex items-center gap-2 self-center mb-0.5" dir="ltr">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                  <span className="text-[10px] font-semibold text-teal-300 uppercase tracking-wider">
                    Suara Terdeteksi (Al-Qur'an):
                  </span>
                </div>
              )}
              <div className="font-quran text-2xl sm:text-3xl text-emerald-100 tracking-wide leading-relaxed min-h-[38px] flex items-center justify-center">
                {getSpokenArabicWithHarakat(liveTranscript, activeAyah.words)}
              </div>
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
                  : 'bg-emerald-100 border-emerald-300 text-emerald-800'
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
              className="p-3 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 transition"
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
              disabled={activeAyahIndex === currentSurah.ayahs.length - 1}
              onClick={() =>
                setActiveAyahIndex((prev) =>
                  Math.min(currentSurah.ayahs.length - 1, prev + 1)
                )
              }
              className="p-3 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 transition"
              title="Ayat Selanjutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Tombol Audio Qari */}
            <button
              type="button"
              onClick={handleToggleQari}
              className={`p-3 rounded-2xl border transition ${
                isPlayingQari
                  ? 'bg-teal-600 text-white border-teal-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title={isPlayingQari ? 'Jeda Qari' : 'Dengar Pelafalan Qari'}
            >
              {isPlayingQari ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
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
              activityType: 'murojaah',
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
