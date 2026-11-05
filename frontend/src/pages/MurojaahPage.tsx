import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic,
  Square,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Search,
  Bookmark,
  RotateCcw,
  CheckCircle2,
  Loader2,
  X,
  Volume2,
  Pause,
  Menu,
  HelpCircle,
  Home,
  BookOpen,
} from 'lucide-react';
import type { SrsDueItem, SurahSummary } from '../types';
import { recordMurojaahSingleAyah, recordMutabaahReport } from '../lib/mutabaahService';
import {
  getJuzFromPage,
  getHizbFromPage,
  getSurahStartPage,
  toArabicDigits,
  SURAH_ARABIC_NAMES,
  normalizeArabicQuran,
  isArabicWordMatch,
} from '../lib/quranMeta';
import { TilawaVoiceService } from '../lib/tilawaService';
import ExitMutabaahModal, { ExitMutabaahPayload } from '../components/mutabaah/ExitMutabaahModal';
import MistakesDetailModal, { MistakeItem } from '../components/murojaah/MistakesDetailModal';

interface QuranWordItem {
  id: number;
  position: number;
  text_uthmani: string;
  line_number: number;
  char_type_name: string; // 'word' | 'end'
  verse_key: string;      // e.g. '1:1'
  clean: string;
}

export default function MurojaahPage() {
  // Navigation Flow State: 'catalog' (Daftar 114 Surah) | 'mushaf' (Halaman Mushaf Madinah 1-604)
  const [viewState, setViewState] = useState<'catalog' | 'mushaf'>('mushaf');

  // Madinah Mushaf Page (1 - 604)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageVerses, setPageVerses] = useState<any[]>([]);
  const [loadingPage, setLoadingPage] = useState<boolean>(false);

  // Strict Per-Ayat Flow State:
  const [activeVerseIndex, setActiveVerseIndex] = useState<number>(0);
  const [completedVerseKeys, setCompletedVerseKeys] = useState<Set<string>>(new Set());

  // 114 Surahs catalog list
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [surahSearchQuery, setSurahSearchQuery] = useState('');
  const [pageJumpInput, setPageJumpInput] = useState<string>('');
  const [isJumpModalOpen, setIsJumpModalOpen] = useState(false);

  // Mode Murojaah: Dimulai dari KOSONG / Ghaib total (semua kata tertutup)
  const [isBlindMode, setIsBlindMode] = useState<boolean>(true);

  // Tombol Bantuan (Intip Teks / Petunjuk Hafalan)
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Set of revealed word keys on current page: `${verse_key}_${position}`
  const [revealedWordKeys, setRevealedWordKeys] = useState<Set<string>>(new Set());

  // Real-time Voice & Audio State
  const [isLiveListening, setIsLiveListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveStatusText, setLiveStatusText] = useState('...Menunggu suara hafalan');
  const [mistakesCount, setMistakesCount] = useState(0);
  const [mistakesList, setMistakesList] = useState<MistakeItem[]>([]);
  const [isMistakesModalOpen, setIsMistakesModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Audio Qari Player State
  const [isPlayingQari, setIsPlayingQari] = useState(false);
  const qariAudioRef = useRef<HTMLAudioElement | null>(null);

  // Synchronized Refs for Web Speech API and Tilawa AI
  const revealedWordsRef = useRef<Set<string>>(new Set());
  const activeVerseIndexRef = useRef<number>(0);
  const pageVersesRef = useRef<any[]>([]);
  const isLiveListeningRef = useRef<boolean>(false);
  const isTransitioningRef = useRef<boolean>(false);
  const lastAyahTransitionTimeRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);
  const lastRecordedMistakeSpokenRef = useRef<string>('');
  const tilawaServiceRef = useRef<TilawaVoiceService | null>(null);

  useEffect(() => {
    revealedWordsRef.current = revealedWordKeys;
  }, [revealedWordKeys]);

  useEffect(() => {
    activeVerseIndexRef.current = activeVerseIndex;
  }, [activeVerseIndex]);

  useEffect(() => {
    pageVersesRef.current = pageVerses;
  }, [pageVerses]);

  useEffect(() => {
    isLiveListeningRef.current = isLiveListening;
  }, [isLiveListening]);

  // Mutabaah Session & Exit-Intent Modal
  const sessionStartTimeRef = useRef<number>(Date.now());
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [exitPayload, setExitPayload] = useState<ExitMutabaahPayload | null>(null);
  const [dueAyahs, setDueAyahs] = useState<SrsDueItem[]>([]);

  // Fetch 114 Surahs catalog from Backend API
  useEffect(() => {
    fetch('/api/v1/quran/surahs')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: SurahSummary[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setSurahs(data);
        }
      })
      .catch((err) => console.warn('Failed to fetch surah list:', err));

    // Fetch SRS due items
    const token = localStorage.getItem('hifzhly_auth_token') || localStorage.getItem('token');
    fetch('/api/v1/srs/today', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.items && Array.isArray(data.items)) {
          setDueAyahs(data.items);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Madinah Mushaf Page Verses (1 - 604)
  useEffect(() => {
    setLoadingPage(true);
    // Reset state saat halaman berganti: mulai kosong/ghaib
    revealedWordsRef.current = new Set();
    setRevealedWordKeys(new Set());
    setActiveVerseIndex(0);
    setCompletedVerseKeys(new Set());
    setLiveTranscript('');
    setShowHelp(false);

    fetch(
      `https://api.quran.com/api/v4/verses/by_page/${currentPage}?words=true&word_fields=text_uthmani,line_number,char_type_name&translations=33&fields=chapter_id,page_number,juz_number`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.verses) {
          setPageVerses(data.verses);
        }
      })
      .catch((err) => console.warn('Failed to fetch page verses:', err))
      .finally(() => {
        setLoadingPage(false);
      });
  }, [currentPage]);

  // 15 Baris Presisi Madinah Mushaf Page
  const pageLines = useMemo(() => {
    const linesMap: Record<number, any[]> = {};
    pageVerses.forEach((verse: any, vIdx: number) => {
      const parts = verse.verse_key?.split(':') || [];
      const surahNum = parseInt(parts[0], 10);
      const ayahNum = parseInt(parts[1], 10);
      const surahName = surahs.find((s) => s.number === surahNum)?.nameLatin || `Surah ${surahNum}`;

      const ayahObj = {
        ...verse,
        vIdx,
        surahNumber: surahNum,
        surahName: surahName,
        ayahNumber: ayahNum,
      };

      if (verse.words && Array.isArray(verse.words)) {
        verse.words.forEach((w: any, wIdx: number) => {
          const lineNum = w.line_number || 1;
          if (!linesMap[lineNum]) linesMap[lineNum] = [];
          linesMap[lineNum].push({
            ...w,
            wIdx,
            vIdx,
            verse_key: verse.verse_key,
            ayahObj,
          });
        });
      }
    });
    return linesMap;
  }, [pageVerses, surahs]);

  // Map starting line to surah metadata for exact inline placement before each surah
  const surahsStartingByLine = useMemo(() => {
    const map: Record<number, any> = {};
    pageVerses.forEach((verse: any) => {
      if (verse.verse_key?.endsWith(':1')) {
        const parts = verse.verse_key.split(':');
        const sNum = parseInt(parts[0], 10);
        const sMeta = surahs.find((s) => s.number === sNum);
        if (sMeta) {
          const minLine = Math.min(
            ...(verse.words?.map((w: any) => w.line_number || 1) || [1])
          );
          map[minLine] = sMeta;
        }
      }
    });
    return map;
  }, [pageVerses, surahs]);

  // Current Page Metadata
  const currentJuz = getJuzFromPage(currentPage);
  const currentHizb = getHizbFromPage(currentPage);
  const firstSurahNumOnPage = pageVerses[0]?.chapter_id || 1;
  const currentSurahMeta = surahs.find((s) => s.number === firstSurahNumOnPage) || {
    number: firstSurahNumOnPage,
    nameLatin: firstSurahNumOnPage === 1 ? 'Al-Fatihah' : `Surah ${firstSurahNumOnPage}`,
    nameArabic: SURAH_ARABIC_NAMES[firstSurahNumOnPage] || 'الفاتحة',
    numberOfAyahs: 7,
  };

  const currentMushafSurahName = useMemo(() => {
    if (pageVerses.length > 0 && pageVerses[0].chapter_id) {
      const s = surahs.find((item) => item.number === pageVerses[0].chapter_id);
      if (s) return s.nameLatin;
    }
    return currentSurahMeta?.nameLatin || 'Al-Qur\'an';
  }, [pageVerses, surahs, currentSurahMeta]);

  // Active Ayah Object for helper & audio
  const activeAyahObj = useMemo(() => {
    return pageVerses[activeVerseIndex] || pageVerses[0] || null;
  }, [pageVerses, activeVerseIndex]);

  // Inisialisasi Tilawa AI Voice Service
  useEffect(() => {
    const tilawa = new TilawaVoiceService();
    tilawaServiceRef.current = tilawa;

    return () => {
      tilawa.stopListening();
    };
  }, []);

  /**
   * ALGORITMA PENCOCOKAN STRICT PER-AYAT MUROJAAH:
   * Menangani santri membaca cepat, jeda nafas, dan pemanjangan madd tajwid.
   */
  const processSpokenArabic = (spokenText: string) => {
    if (!spokenText || isTransitioningRef.current || Date.now() - lastAyahTransitionTimeRef.current < 1500) {
      return;
    }

    const normalizedSpoken = normalizeArabicQuran(spokenText);
    if (!normalizedSpoken) return;

    const spokenTokens = normalizedSpoken.split(/\s+/).filter((t) => t.length >= 2);
    if (spokenTokens.length === 0) return;

    const currentVerses = pageVersesRef.current;
    const curIdx = activeVerseIndexRef.current;
    if (curIdx >= currentVerses.length) return;

    const targetVerse = currentVerses[curIdx];
    if (!targetVerse || !targetVerse.words) return;

    // Filter kata-kata ayat aktif
    const targetWords: QuranWordItem[] = targetVerse.words
      .filter((w: any) => w.char_type_name !== 'end')
      .map((w: any) => ({
        id: w.id,
        position: w.position,
        text_uthmani: w.text_uthmani,
        line_number: w.line_number || 1,
        char_type_name: 'word',
        verse_key: targetVerse.verse_key,
        clean: normalizeArabicQuran(w.text_uthmani),
      }));

    if (targetWords.length === 0) return;

    const currentRevealed = revealedWordsRef.current;
    const nextSet = new Set(currentRevealed);

    const unrevealedWords = targetWords.filter(
      (w) => !nextSet.has(`${targetVerse.verse_key}_${w.position}`)
    );

    if (unrevealedWords.length === 0) {
      advanceToNextAyah(curIdx, currentVerses);
      return;
    }

    let spokenPtr = 0;
    let matchedAny = false;

    // Periksa token pelafalan secara berurutan
    for (let u = 0; u < unrevealedWords.length; u++) {
      const targetWord = unrevealedWords[u];
      const isLastWord = u === unrevealedWords.length - 1;
      let foundIdx = -1;

      // Scan seluruh sisa token suara yang masuk (agar bicara cepat langsung cocok seketika)
      for (let s = spokenPtr; s < spokenTokens.length; s++) {
        if (isArabicWordMatch(targetWord.clean, spokenTokens[s], isLastWord)) {
          foundIdx = s;
          break;
        }
      }

      if (foundIdx !== -1) {
        nextSet.add(`${targetVerse.verse_key}_${targetWord.position}`);
        matchedAny = true;
        spokenPtr = foundIdx + 1;
      } else {
        break;
      }
    }

    if (matchedAny) {
      revealedWordsRef.current = nextSet;
      setRevealedWordKeys(new Set(nextSet));

      const remainingInActiveVerse = targetWords.filter(
        (w) => !nextSet.has(`${targetVerse.verse_key}_${w.position}`)
      );

      if (remainingInActiveVerse.length === 0) {
        // Ayat aktif selesai 100%!
        setCompletedVerseKeys((prev) => new Set(prev).add(targetVerse.verse_key));

        // Sinkronisasi evaluasi ke VPS Backend AI Worker
        const refText = targetWords.map((w) => w.text_uthmani).join(' ');
        fetch('/api/v1/voice/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            surahNumber: currentSurahMeta.number,
            ayahNumber: parseInt(targetVerse.verse_key.split(':')[1] || '1', 10),
            referenceText: refText,
            spokenText: spokenText,
          }),
        }).catch(() => {});

        advanceToNextAyah(curIdx, currentVerses);
      }
    } else if (
      spokenTokens.length >= 3 &&
      !isTransitioningRef.current &&
      Date.now() - lastAyahTransitionTimeRef.current > 3000
    ) {
      // Rekam kesalahan hanya bila kata yang diucapkan sama sekali tidak cocok dengan kata target ayat aktif
      const curAyahWords = targetWords.map((w) => w.clean);
      const isAnyMatch = spokenTokens.some((st) => curAyahWords.some((cw) => isArabicWordMatch(cw, st, false)));
      if (!isAnyMatch && targetVerse) {
        // Cegah duplikasi kesalahan jika suara belum berubah
        if (lastRecordedMistakeSpokenRef.current !== normalizedSpoken) {
          lastRecordedMistakeSpokenRef.current = normalizedSpoken;

          setMistakesList((prev) => {
            // Debounce per-ayat: maksimal 1 kesalahan setiap 5 detik untuk ayat yang sama
            if (
              prev.length > 0 &&
              prev[prev.length - 1].verseKey === targetVerse.verse_key &&
              Date.now() - new Date(prev[prev.length - 1].timestamp).getTime() < 5000
            ) {
              return prev;
            }

            const newMistake: MistakeItem = {
              id: `${targetVerse.verse_key}-${Date.now()}`,
              verseKey: targetVerse.verse_key,
              ayahNumber: targetVerse.ayahNumber || parseInt(targetVerse.verse_key.split(':')[1] || '1', 10),
              surahNumber: targetVerse.chapter_id || currentSurahMeta.number,
              surahName: currentSurahMeta.nameLatin,
              expectedText: targetVerse.text_uthmani || targetWords.map((w) => w.text_uthmani).join(' '),
              spokenText: spokenText,
              timestamp: new Date(),
            };

            const nextList = [...prev, newMistake];
            setMistakesCount(nextList.length);
            return nextList;
          });
        }
      }
    }
  };

  /**
   * Pindah ke Ayat Berikutnya secara Otomatis dan Mulus
   */
  const advanceToNextAyah = (currentIdx: number, verses: any[]) => {
    // Kunci transisi dan catat timestamp agar sisa buffer suara ayat sebelumnya tidak bocor ke ayat baru
    isTransitioningRef.current = true;
    lastAyahTransitionTimeRef.current = Date.now();
    lastRecordedMistakeSpokenRef.current = '';
    setLiveTranscript('');
    setLiveStatusText('...Beralih ke ayat berikutnya');
    setShowHelp(false);

    // Abort speech recognition saat ini seketika agar buffer teks lama terhapus bersih
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    const nextIdx = currentIdx + 1;
    if (nextIdx < verses.length) {
      // Otomatis pindah fokus ke ayat setelahnya
      setActiveVerseIndex(nextIdx);
      activeVerseIndexRef.current = nextIdx;
      // Berikan masa tenggang 1.2 detik agar mesin suara mulai mengevaluasi ayat baru dari kondisi bersih
      setTimeout(() => {
        isTransitioningRef.current = false;
        setLiveTranscript('');
        setLiveStatusText('...Menunggu suara pelafalan');
        if (isLiveListeningRef.current) {
          startRecognitionInstance();
        }
      }, 1200);
    } else {
      // Seluruh ayat pada halaman mushaf ini sudah selesai!
      isTransitioningRef.current = true;
      recordMurojaahSingleAyah(currentSurahMeta.number, currentSurahMeta.nameLatin, 1, 100);

      // Pindah otomatis ke halaman berikutnya setelah jeda 2 detik
      setTimeout(() => {
        if (currentPage < 604) {
          setCurrentPage((p) => p + 1);
        }
        isTransitioningRef.current = false;
        if (isLiveListeningRef.current) {
          startRecognitionInstance();
        }
      }, 2000);
    }
  };

  const processSpokenArabicRef = useRef(processSpokenArabic);
  useEffect(() => {
    processSpokenArabicRef.current = processSpokenArabic;
  });

  // Instansiasi SpeechRecognition bersih dan terisolasi
  const startRecognitionInstance = () => {
    if (!isLiveListeningRef.current) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA';

      recognition.onstart = () => {
        if (!isTransitioningRef.current) {
          setLiveStatusText('...Menunggu suara pelafalan');
        }
      };

      recognition.onresult = (event: any) => {
        if (isTransitioningRef.current) return;

        // Ambil frasa aktif yang diucapkan (dimulai dari resultIndex terbaru)
        let activePhrase = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          activePhrase += event.results[i][0].transcript + ' ';
        }

        const currentSpoken = activePhrase.trim();
        if (currentSpoken) {
          setLiveTranscript(currentSpoken);
          setLiveStatusText(currentSpoken);
          processSpokenArabicRef.current(currentSpoken);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('Speech recognition status:', event.error);
        }
      };

      recognition.onend = () => {
        if (isLiveListeningRef.current && !isTransitioningRef.current) {
          try {
            recognition.start();
          } catch {
            setTimeout(() => {
              if (isLiveListeningRef.current && !isTransitioningRef.current) {
                startRecognitionInstance();
              }
            }, 300);
          }
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition error:', e);
    }
  };

  // Start / Stop Live Listening (Web Speech API + Tilawa AI)
  const startLiveListening = async () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    

    setIsLiveListening(true);
    isLiveListeningRef.current = true;
    lastRecordedMistakeSpokenRef.current = '';

    if (!SpeechRecognition) {
      setLiveStatusText('Engine suara aktif mendengarkan...');
      return;
    }

    startRecognitionInstance();
  };

  const stopLiveListening = () => {
    setIsLiveListening(false);
    isLiveListeningRef.current = false;
    setLiveStatusText('...Menunggu suara');
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

  // Dengarkan Tilawah Qari Misyari Rasyid Al-Afasi
  const handleToggleQari = () => {
    if (isPlayingQari) {
      if (qariAudioRef.current) {
        qariAudioRef.current.pause();
        qariAudioRef.current = null;
      }
      setIsPlayingQari(false);
      return;
    }

    if (!activeAyahObj) return;
    const parts = activeAyahObj.verse_key?.split(':') || ['1', '1'];
    const sPad = parts[0].padStart(3, '0');
    const aPad = parts[1].padStart(3, '0');
    const audioUrl = `https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/${sPad}${aPad}.mp3`;

    const audio = new Audio(audioUrl);
    qariAudioRef.current = audio;
    audio.play().catch(() => {});
    setIsPlayingQari(true);

    audio.onended = () => {
      setIsPlayingQari(false);
      qariAudioRef.current = null;
    };
    audio.onerror = () => {
      setIsPlayingQari(false);
      qariAudioRef.current = null;
    };
  };

  // Fitur Bantuan: Buka 1 Kata Berikutnya yang belum terbuka
  const handleRevealNextWord = () => {
    if (!activeAyahObj || !activeAyahObj.words) return;
    const targetWords = activeAyahObj.words.filter((w: any) => w.char_type_name !== 'end');
    const currentRevealed = revealedWordsRef.current;

    for (const w of targetWords) {
      const key = `${activeAyahObj.verse_key}_${w.position}`;
      if (!currentRevealed.has(key)) {
        setRevealedWordKeys((prev) => {
          const next = new Set(prev).add(key);
          revealedWordsRef.current = next;
          return next;
        });
        break;
      }
    }
  };

  // Klik kata langsung untuk membuka kata tersebut bila mentok
  const handleRevealWord = (wordKey: string, vIdx: number, ayahObj: any) => {
    setRevealedWordKeys((prev) => {
      const next = new Set(prev).add(wordKey);
      revealedWordsRef.current = next;

      // Cek apakah ayat ini sudah selesai
      if (ayahObj?.words) {
        const remaining = ayahObj.words
          .filter((w: any) => w.char_type_name !== 'end')
          .filter((w: any) => !next.has(`${ayahObj.verse_key}_${w.position}`));
        if (remaining.length === 0) {
          setCompletedVerseKeys((c) => new Set(c).add(ayahObj.verse_key));
          advanceToNextAyah(vIdx, pageVersesRef.current);
        }
      }
      return next;
    });
  };

  // Selesai Sesi Murojaah & Catat Mutabaah
  const handleOpenExitModal = () => {
    const duration = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
    const ayahsCount = completedVerseKeys.size;
    setExitPayload({
      activityType: 'murojaah',
      surahNumber: currentSurahMeta.number,
      surahName: currentSurahMeta.nameLatin,
      startAyah: 1,
      endAyah: Math.max(1, ayahsCount),
      totalAyahs: Math.max(1, ayahsCount),
      pagesCount: 1,
      durationSeconds: Math.max(duration, 10),
      score: Math.max(80, 100 - mistakesCount * 2),
    });
    setIsExitModalOpen(true);
  };

  // Filter surahs for catalog view
  const filteredSurahs = surahs.filter((s) => {
    const q = surahSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.number.toString().includes(q) ||
      s.nameLatin.toLowerCase().includes(q) ||
      s.nameArabic.includes(q) ||
      s.translation.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 pb-28 font-sans select-none">
      {/* FLOW 1: DAFTAR 114 SURAH (KATALOG SURAT MUROJAAH) */}
      {viewState === 'catalog' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  Murojaah Hafalan
                </span>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Katalog Surah Al-Qur'an</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Pilih surah untuk memulai murojaah mandiri dari lembaran kosong (Halaman 1 - 604)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/app"
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Kembali ke Beranda"
              >
                <Home className="w-4 h-4 text-emerald-600" />
                <span>Beranda</span>
              </Link>
              <button
                type="button"
                onClick={() => setViewState('mushaf')}
                className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Buka Halaman {currentPage}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Kolom Pencarian Surah */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={surahSearchQuery}
              onChange={(e) => setSurahSearchQuery(e.target.value)}
              placeholder="Cari nama surat (contoh: Al-Mulk, An-Naba, Yasin)..."
              className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs text-slate-800"
            />
          </div>

          {/* Grid 114 Surahs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredSurahs.map((s) => {
              const startPg = getSurahStartPage(s.number);
              return (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => {
                    setCurrentPage(startPg);
                    setViewState('mushaf');
                  }}
                  className="p-3.5 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all text-left flex items-center justify-between shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-800 flex items-center justify-center text-xs font-bold font-sans transition-colors">
                      {s.number}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                        {s.nameLatin}
                      </p>
                      <p className="text-xs text-slate-500">
                        {s.translation} • {s.numberOfAyahs} Ayat • Hal. {startPg}
                      </p>
                    </div>
                  </div>
                  <span className="font-quran text-2xl text-slate-800 group-hover:text-emerald-950 transition-colors" dir="rtl">
                    {s.nameArabic}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Bar Khusus Mobile di Mode Katalog */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-4 py-2 flex items-center justify-between">
            <Link
              to="/app"
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <Home className="w-4 h-4 text-emerald-600" />
              <span>Beranda</span>
            </Link>
            <button
              type="button"
              onClick={() => setViewState('mushaf')}
              className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition cursor-pointer"
            >
              <span>Buka Hal {currentPage}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* FLOW 2: TAMPILAN MUSHAF MADINAH ASLI 15 BARIS KHUSUS MUROJAAH (DIMULAI DARI KOSONG) */}
      {viewState === 'mushaf' && (
        <div className="space-y-2 animate-in fade-in">
          {/* Top Bar: Navigasi Surah, Tombol Bantuan, dan Selesai Sesi */}
          <header className="flex items-center justify-between gap-2 px-1 py-1">
            {/* Navigasi Kiri: Tombol Beranda & Buka Katalog */}
            <div className="flex items-center gap-0.5">
              <Link
                to="/app"
                className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                title="Kembali ke Beranda Santri"
              >
                <Home className="w-5 h-5" />
              </Link>
              <button
                type="button"
                onClick={() => setViewState('catalog')}
                className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                title="Buka Daftar 114 Surah"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Center Pill: Info Surah, Hal, Juz */}
            <div className="flex-1 max-w-sm bg-slate-100/90 border border-slate-200/90 rounded-2xl px-3 sm:px-4 py-1.5 flex items-center justify-between shadow-2xs">
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {currentSurahMeta.nameLatin} (Murojaah)
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Halaman {currentPage} | Juz {currentJuz} | Hizb {currentHizb} • Mode Ghaib
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBookmarked((b) => !b)}
                className="p-1 text-slate-400 hover:text-emerald-600 transition cursor-pointer"
                title="Tandai Halaman Ini"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-emerald-600 text-emerald-600' : ''}`} />
              </button>
            </div>

            {/* Action Buttons: Tombol Bantuan + Selesai Sesi */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowHelp((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  showHelp
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                }`}
                title="Buka / Tutup teks bantuan jika lupa hafalan"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{showHelp ? 'Tutup Bantuan' : 'Bantuan Teks'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenExitModal}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                title="Selesaikan sesi Murojaah dan catat ke Mutabaah"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Selesai</span>
              </button>
            </div>
          </header>

          {/* Panel Bantuan (Muncul saat tombol Bantuan ditekan) */}
          {showHelp && activeAyahObj && (
            <div className="bg-amber-50/95 border-2 border-amber-300/90 rounded-2xl p-4 text-center space-y-2 shadow-md animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900 border-b border-amber-200/80 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-700" />
                  Bantuan Hafalan: Ayat {activeAyahObj.verse_key?.split(':')[1] || activeVerseIndex + 1}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRevealNextWord}
                    className="text-[11px] bg-amber-200 hover:bg-amber-300 text-amber-900 px-2 py-0.5 rounded-md font-semibold transition"
                    title="Buka hanya 1 kata berikutnya sebagai petunjuk"
                  >
                    Buka 1 Kata
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowHelp(false)}
                    className="text-amber-800 hover:text-amber-950 font-bold hover:underline"
                  >
                    Tutup
                  </button>
                </div>
              </div>
              <p className="font-quran text-2xl sm:text-3xl text-amber-950 leading-relaxed select-text" dir="rtl">
                {activeAyahObj.words?.filter((w: any) => w.char_type_name !== 'end').map((w: any) => w.text_uthmani).join(' ')}
              </p>
              {activeAyahObj.translations?.[0]?.text && (
                <p className="text-xs text-slate-600 font-sans italic" dir="ltr">
                  "{activeAyahObj.translations[0].text.replace(/<[^>]*>?/gm, '')}"
                </p>
              )}
            </div>
          )}

          {/* Lembaran Mushaf Madinah 15 Baris (Format Identik Hafalan, Mulai Kosong) */}
          <div
            className={`w-full max-w-[580px] sm:max-w-[620px] mx-auto py-2 px-2 sm:px-4 space-y-3 pb-28 sm:pb-32 ${
              currentPage === 1 || currentPage === 2
                ? 'rounded-3xl border-2 border-amber-600/40 p-3 sm:p-5 bg-[#FFFDF8]'
                : ''
            }`}
          >
            {/* Navigasi Header Lembaran Halaman */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs font-bold text-slate-700">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold">
                {pageVerses[0]?.juz_number ? `Juz ${pageVerses[0].juz_number}` : `Juz ${currentJuz}`}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage((p) => p - 1);
                      setActiveVerseIndex(0);
                      activeVerseIndexRef.current = 0;
                    }
                  }}
                  disabled={currentPage <= 1}
                  className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4 text-emerald-800" />
                </button>

                <div
                  className="text-center cursor-pointer"
                  onClick={() => setIsJumpModalOpen(true)}
                  title="Klik untuk loncat nomor halaman"
                >
                  <span className="font-bold text-slate-900 text-sm block">
                    {currentMushafSurahName}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Hal. {currentPage} / 604
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (currentPage < 604) {
                      setCurrentPage((p) => p + 1);
                      setActiveVerseIndex(0);
                      activeVerseIndexRef.current = 0;
                    }
                  }}
                  disabled={currentPage >= 604}
                  className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4 text-emerald-800" />
                </button>
              </div>

              <span className="text-slate-400 font-medium text-[11px] hidden sm:inline">
                Standar Madinah 15 Baris
              </span>
            </div>

            {/* Page Content: 15 Lines Structure Mulai Kosong */}
            {loadingPage ? (
              <div className="flex flex-col items-center justify-center py-24 text-emerald-700 space-y-2">
                <Loader2 className="w-7 h-7 animate-spin" />
                <span className="text-sm font-semibold">Membuka Lembaran Halaman {currentPage}...</span>
              </div>
            ) : Object.keys(pageLines).length > 0 ? (
              <div className="space-y-0.5 sm:space-y-1 py-1">
                {Object.entries(pageLines).map(([lineStr, words]) => {
                  const lineNum = parseInt(lineStr, 10);
                  const totalLines = Object.keys(pageLines).length;
                  const isShortLine =
                    words.length <= 4 ||
                    (lineNum === totalLines && words.length <= 8) ||
                    currentPage === 1 ||
                    currentPage === 2;
                  const startingSurah = surahsStartingByLine[lineNum];

                  return (
                    <div key={lineNum} className="space-y-1">
                      {/* Kepala Surat & Bismillah */}
                      {startingSurah && (
                        <div className="space-y-1.5 my-2 sm:my-3">
                          <div className="relative rounded-xl border border-amber-600/50 bg-[#FDFBF7] p-1.5 sm:p-2 shadow-2xs">
                            <div className="border border-amber-600/25 rounded-lg py-1 px-2.5 sm:px-3 flex items-center justify-between text-xs font-semibold">
                              <div className="text-left text-amber-950 font-sans min-w-[65px]">
                                <span className="block text-[11px] sm:text-xs font-bold text-amber-950">
                                  {startingSurah.numberOfAyahs} Ayat
                                </span>
                                <span className="text-[10px] text-amber-800/80 font-quran">
                                  {startingSurah.numberOfAyahs.toLocaleString('ar-EG')} آية
                                </span>
                              </div>

                              <div className="text-center">
                                <div className="font-quran text-lg sm:text-xl font-bold text-emerald-950 tracking-wider leading-tight">
                                  سُورَةُ {startingSurah.nameArabic ? startingSurah.nameArabic.replace('سورة ', '') : (SURAH_ARABIC_NAMES[startingSurah.number] || '')}
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-sans font-medium text-slate-600 -mt-0.5">
                                  Surat {startingSurah.nameLatin}
                                </div>
                              </div>

                              <div className="text-right text-amber-950 font-sans min-w-[65px]">
                                <span className="block text-[11px] sm:text-xs font-bold text-amber-950">
                                  {startingSurah.revelationType === 'Mekah' || startingSurah.revelationType?.toLowerCase() === 'makiyyah' ? 'Makkiyah' : 'Madaniyah'}
                                </span>
                                <span className="text-[10px] text-amber-800/80 font-quran">
                                  {startingSurah.revelationType === 'Mekah' || startingSurah.revelationType?.toLowerCase() === 'makiyyah' ? 'مَكِّيَّةٌ' : 'مَدَنِيَّةٌ'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {startingSurah.number !== 9 && startingSurah.number !== 1 && (
                            <div className="flex items-center justify-center my-2 sm:my-2.5 px-3 text-center select-none">
                              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-600/40 to-amber-700/60" />
                              <span className="font-quran text-lg sm:text-2xl text-emerald-950 tracking-wider px-3">
                                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                              </span>
                              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-600/40 to-amber-700/60" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Baris 15 Madinah Words (Mulai dari Kosong) */}
                      <div
                        dir="rtl"
                        style={{
                          fontSize: `clamp(13px, calc(10px + 1.2vw), 22px)`,
                          lineHeight: '2.3',
                        }}
                        className={`w-full flex items-center font-quran select-none whitespace-nowrap transition-all ${
                          isShortLine ? 'justify-center gap-2.5 sm:gap-4' : 'justify-between'
                        }`}
                      >
                        {words.map((w: any, idx: number) => {
                          const isAyahEnd = w.char_type_name === 'end';
                          const verseKey = w.verse_key;
                          const vIdx = w.vIdx;
                          const isCurrentActive = vIdx === activeVerseIndex;
                          const isCompleted = completedVerseKeys.has(verseKey);
                          const ayahNumber = w.ayahObj?.ayahNumber;

                          if (isAyahEnd) {
                            return (
                              <span
                                key={`end-${idx}-${verseKey}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveVerseIndex(vIdx);
                                  activeVerseIndexRef.current = vIdx;
                                }}
                                className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 mx-0.5 rounded-full border text-[10px] sm:text-xs font-sans font-bold shadow-2xs cursor-pointer hover:scale-110 transition-all shrink-0 align-middle ${
                                  isCompleted
                                    ? 'border-emerald-600 bg-emerald-100 text-emerald-900 font-bold'
                                    : isCurrentActive
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-300'
                                    : 'border-amber-600/70 bg-amber-50/90 text-amber-900 hover:bg-amber-100'
                                }`}
                                title={`Ayat ${ayahNumber} (Klik untuk pilih)`}
                              >
                                {ayahNumber ? toArabicDigits(ayahNumber) : w.text_uthmani}
                              </span>
                            );
                          }

                          // Kata Normal Murojaah
                          const wordKey = `${verseKey}_${w.position}`;
                          const isRevealed = revealedWordKeys.has(wordKey);

                          // Khusus Murojaah: Mulai dari Kosong (Ghaib total)
                          // Terbuka hanya bila sudah dilafalkan lewat mic (isRevealed),
                          // atau ayat sudah komplit (isCompleted),
                          // atau tombol bantuan sedang diaktifkan untuk ayat ini (showHelp && isCurrentActive)
                          const isVisible =
                            !isBlindMode ||
                            isRevealed ||
                            isCompleted ||
                            (showHelp && isCurrentActive);

                          return (
                            <span
                              key={`w-${idx}-${w.id || w.position}-${verseKey}`}
                              onClick={() => {
                                setActiveVerseIndex(vIdx);
                                activeVerseIndexRef.current = vIdx;
                                if (!isRevealed) {
                                  handleRevealWord(wordKey, vIdx, w.ayahObj);
                                }
                              }}
                              className={`cursor-pointer transition-colors inline-block select-text px-0.5 rounded ${
                                isRevealed
                                  ? 'text-emerald-700 bg-emerald-100/90 font-bold shadow-2xs'
                                  : isCurrentActive
                                  ? 'text-emerald-950 font-semibold hover:text-emerald-700'
                                  : isCompleted
                                  ? 'text-slate-800'
                                  : 'text-slate-900 hover:text-emerald-800'
                              } ${
                                !isVisible
                                  ? 'blur-xs opacity-20 select-none hover:blur-none hover:opacity-100 transition-all'
                                  : ''
                              }`}
                              title={
                                !isVisible
                                  ? 'Kata terselubung (Lafalkan lewat mic atau klik langsung jika mentok)'
                                  : w.text_uthmani
                              }
                            >
                              {w.text_uthmani}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400 text-xs">
                Gagal memuat lembaran mushaf halaman {currentPage}.
              </div>
            )}
          </div>

          {/* 3. DEDICATED RECITATION BOTTOM BAR (Responsive Mobile Bottom Bar & Floating Desktop Console) */}
          <div className="fixed bottom-0 md:bottom-6 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl z-50 bg-white/95 backdrop-blur-md border-t md:border border-slate-200/90 md:rounded-3xl shadow-xl px-3 py-1.5 sm:px-5 sm:py-2 pb-safe">
            {/* Status Suara Ringkas Khusyu' (Melayang tepat di tengah atas bar) */}
            {isLiveListening && (
              <div className="absolute -top-11 left-1/2 -translate-x-1/2 max-w-[90vw] sm:max-w-sm bg-slate-900/95 backdrop-blur-md text-white text-xs px-3.5 py-1.5 rounded-full text-center truncate shadow-xl border border-slate-700/60 animate-in fade-in slide-in-from-bottom-2 pointer-events-none">
                {liveTranscript ? `Mendengarkan: "${liveTranscript}"` : liveStatusText}
              </div>
            )}

            <div className="flex items-center justify-between gap-1 sm:gap-3">
              {/* SISI KIRI: Katalog Surah & Hitungan Kesalahan */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setViewState('catalog')}
                  className="flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
                  title="Buka Daftar 114 Surah"
                >
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[9px] sm:text-[10px] font-medium mt-0.5">Surah</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMistakesModalOpen(true)}
                  className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 active:scale-95 transition cursor-pointer"
                  title="Lihat rincian kesalahan hafalan"
                >
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-700">Salah</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      mistakesList.length > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {mistakesList.length}
                  </span>
                </button>
              </div>

              {/* TENGAH: TOMBOL MIKROFON UTAMA (HERO ACTION - Tepat di Bawah Ibu Jari) */}
              <div className="flex flex-col items-center -mt-6 sm:-mt-7">
                <button
                  type="button"
                  onClick={handleToggleListening}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer transition-all duration-300 border-4 border-white active:scale-95 ${
                    isLiveListening
                      ? 'bg-rose-600 hover:bg-rose-700 ring-4 ring-rose-200 shadow-rose-600/40 animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-700 ring-4 ring-emerald-200 shadow-emerald-600/30'
                  }`}
                  title={isLiveListening ? 'Hentikan Mendengarkan' : 'Mulai Murojaah Suara'}
                >
                  {isLiveListening ? (
                    <Square className="w-5 h-5 fill-white" />
                  ) : (
                    <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
                  )}
                </button>
                <span
                  className={`text-[10px] font-bold mt-0.5 ${
                    isLiveListening ? 'text-rose-600 animate-pulse' : 'text-emerald-800'
                  }`}
                >
                  {isLiveListening ? 'Hentikan' : 'Simak'}
                </span>
              </div>

              {/* SISI KANAN: Bantuan, Mode Ghaib, Audio Qari, Reset, dan Navigasi Halaman */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Tombol Bantuan (Intip Teks Ayat Aktif) */}
                <button
                  type="button"
                  onClick={() => setShowHelp((prev) => !prev)}
                  className={`flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-xl transition cursor-pointer active:scale-95 ${
                    showHelp
                      ? 'text-amber-800 font-bold bg-amber-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={showHelp ? 'Tutup Bantuan Teks' : 'Bantuan (Lihat Teks Ayat)'}
                >
                  <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                  <span className="text-[9px] sm:text-[10px] font-medium mt-0.5">Bantuan</span>
                </button>

                {/* Tombol Toggle Mode Ghaib (Tutup / Buka Semua) */}
                <button
                  type="button"
                  onClick={() => setIsBlindMode((b) => !b)}
                  className={`flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-xl transition cursor-pointer active:scale-95 ${
                    isBlindMode
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-emerald-800 font-bold bg-emerald-50'
                  }`}
                  title={isBlindMode ? 'Mode Ghaib Aktif (Klik untuk Buka Semua Teks)' : 'Mode Terbuka (Klik untuk Tutup Semua Teks)'}
                >
                  {isBlindMode ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
                  )}
                  <span className="text-[9px] sm:text-[10px] font-medium mt-0.5">
                    {isBlindMode ? 'Ghaib' : 'Terbuka'}
                  </span>
                </button>

                {/* Dengarkan Tilawah Qari Misyari */}
                <button
                  type="button"
                  onClick={handleToggleQari}
                  className={`flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-xl transition cursor-pointer active:scale-95 ${
                    isPlayingQari ? 'text-emerald-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={isPlayingQari ? 'Jeda Qari' : 'Dengarkan Tilawah Qari Misyari'}
                >
                  <div className={`p-1 rounded-full ${isPlayingQari ? 'bg-emerald-600 text-white shadow-xs' : ''}`}>
                    {isPlayingQari ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-medium mt-0.5">Qari</span>
                </button>

                {/* Tombol Ulangi Halaman */}
                <button
                  type="button"
                  onClick={() => {
                    revealedWordsRef.current = new Set();
                    setRevealedWordKeys(new Set());
                    setActiveVerseIndex(0);
                    setCompletedVerseKeys(new Set());
                    setMistakesCount(0);
                    setLiveTranscript('');
                  }}
                  className="hidden sm:flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                  title="Ulangi Murojaah Halaman Ini"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[9px] sm:text-[10px] font-medium mt-0.5">Reset</span>
                </button>

                {/* Navigasi Halaman Sebelumnya & Selanjutnya */}
                <div className="flex items-center bg-slate-100/90 rounded-xl p-0.5 border border-slate-200/80">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage((p) => p - 1);
                        setActiveVerseIndex(0);
                        activeVerseIndexRef.current = 0;
                      }
                    }}
                    className="p-1 sm:p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-25 transition cursor-pointer"
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= 604}
                    onClick={() => {
                      if (currentPage < 604) {
                        setCurrentPage((p) => p + 1);
                        setActiveVerseIndex(0);
                        activeVerseIndexRef.current = 0;
                      }
                    }}
                    className="p-1 sm:p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-25 transition cursor-pointer"
                    title="Halaman Selanjutnya"
                  >
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LOMPAT NOMOR HALAMAN */}
      {isJumpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-xs p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Buka Halaman Mushaf</h3>
              <button
                type="button"
                onClick={() => setIsJumpModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Masukkan nomor halaman Madinah Mushaf (1 - 604):
            </p>
            {dueAyahs.length > 0 && (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                <strong>{dueAyahs.length} Ayat</strong> terjadwal untuk diulang di SRS hari ini.
              </p>
            )}
            <input
              type="number"
              min={1}
              max={604}
              value={pageJumpInput}
              onChange={(e) => setPageJumpInput(e.target.value)}
              placeholder="Contoh: 1, 78, 604"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsJumpModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const pg = parseInt(pageJumpInput, 10);
                  if (pg >= 1 && pg <= 604) {
                    setCurrentPage(pg);
                    setViewState('mushaf');
                    setIsJumpModalOpen(false);
                    setPageJumpInput('');
                  }
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                Buka
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit-Intent Modal Logger Mutabaah */}
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

      {/* MODAL DETAIL KESALAHAN & KOREKSI MAKHRAJ */}
      <MistakesDetailModal
        isOpen={isMistakesModalOpen}
        onClose={() => setIsMistakesModalOpen(false)}
        mistakes={mistakesList}
        onPlayAyah={(ayahNum) => {
          const sNum = currentSurahMeta.number;
          const sPad = String(sNum).padStart(3, '0');
          const aPad = String(ayahNum).padStart(3, '0');
          const audioUrl = `https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/${sPad}${aPad}.mp3`;
          if (qariAudioRef.current) {
            qariAudioRef.current.pause();
          }
          const audio = new Audio(audioUrl);
          qariAudioRef.current = audio;
          audio.play();
          setIsPlayingQari(true);
          audio.onended = () => setIsPlayingQari(false);
          audio.onerror = () => setIsPlayingQari(false);
        }}
        onClearMistakes={() => {
          setMistakesList([]);
          setMistakesCount(0);
        }}
      />
    </div>
  );
}
