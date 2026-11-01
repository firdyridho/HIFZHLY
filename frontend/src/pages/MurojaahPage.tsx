import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Mic,
  Square,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  BookOpen,
  Search,
  Settings,
  Bookmark,
  RotateCcw,
  CheckCircle2,
  Loader2,
  X,
  Volume2,
  Pause,
  Menu,
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
import { TilawaVoiceService, TilawaProgressEvent } from '../lib/tilawaService';
import ExitMutabaahModal, { ExitMutabaahPayload } from '../components/mutabaah/ExitMutabaahModal';

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
  // activeVerseIndex: index ayat yang SEDANG dibaca/dites pada halaman ini (0..pageVerses.length - 1)
  const [activeVerseIndex, setActiveVerseIndex] = useState<number>(0);
  const [completedVerseKeys, setCompletedVerseKeys] = useState<Set<string>>(new Set());

  // 114 Surahs catalog list
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [surahSearchQuery, setSurahSearchQuery] = useState('');
  const [pageJumpInput, setPageJumpInput] = useState<string>('');
  const [isJumpModalOpen, setIsJumpModalOpen] = useState(false);

  // Progressive Memorization Mode (3 Levels - Tadrij Hafalan):
  // 1 = Teks Penuh (DEFAULT - semua kata terlihat agar tidak langsung kosong!)
  // 2 = Sebagian Samar (kata tertentu disamarkan)
  // 3 = Ghaib Penuh (garis horizontal per-ayat persis screenshot referensi!)
  const [memorizationLevel, setMemorizationLevel] = useState<1 | 2 | 3>(1);

  // Set of revealed word keys on current page: `${verse_key}_${position}`
  const [revealedWordKeys, setRevealedWordKeys] = useState<Set<string>>(new Set());

  // Real-time Voice & Audio State
  const [isLiveListening, setIsLiveListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveStatusText, setLiveStatusText] = useState('...Menunggu suara');
  const [mistakesCount, setMistakesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // AI Model Status & Download Progress (Hugging Face / Tilawa)
  const [aiProgress, setAiProgress] = useState<TilawaProgressEvent | null>(null);

  // Audio Qari Player State
  const [isPlayingQari, setIsPlayingQari] = useState(false);
  const qariAudioRef = useRef<HTMLAudioElement | null>(null);

  // Synchronized Refs for Web Speech API and Tilawa AI
  const revealedWordsRef = useRef<Set<string>>(new Set());
  const activeVerseIndexRef = useRef<number>(0);
  const pageVersesRef = useRef<any[]>([]);
  const isLiveListeningRef = useRef<boolean>(false);
  const isTransitioningRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);
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
    // Reset state saat halaman berganti
    revealedWordsRef.current = new Set();
    setRevealedWordKeys(new Set());
    setActiveVerseIndex(0);
    setCompletedVerseKeys(new Set());
    setLiveTranscript('');

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

  // Parse surahs starting on the current Madinah Mushaf page
  const { surahsStartingByVerse } = useMemo(() => {
    const surahStartMap: Record<string, { number: number; nameLatin: string; nameArabic: string; totalAyahs: number }> = {};

    pageVerses.forEach((verse: any) => {
      const parts = verse.verse_key?.split(':') || [];
      const surahNum = parseInt(parts[0], 10);
      const ayahNum = parseInt(parts[1], 10);

      // Cek apakah surah baru dimulai di ayat ini (ayat 1)
      if (ayahNum === 1) {
        const sMeta = surahs.find((s) => s.number === surahNum);
        surahStartMap[verse.verse_key] = {
          number: surahNum,
          nameLatin: sMeta?.nameLatin || `Surah ${surahNum}`,
          nameArabic: SURAH_ARABIC_NAMES[surahNum] || sMeta?.nameArabic || '',
          totalAyahs: sMeta?.numberOfAyahs || 7,
        };
      }
    });

    return {
      surahsStartingByVerse: surahStartMap,
    };
  }, [pageVerses, surahs]);

  // Current Page Metadata (Juz, Hizb, Active Surah)
  const currentJuz = getJuzFromPage(currentPage);
  const currentHizb = getHizbFromPage(currentPage);
  const firstSurahNumOnPage = pageVerses[0]?.chapter_id || 1;
  const currentSurahMeta = surahs.find((s) => s.number === firstSurahNumOnPage) || {
    number: firstSurahNumOnPage,
    nameLatin: firstSurahNumOnPage === 1 ? 'Al-Fatihah' : `Surah ${firstSurahNumOnPage}`,
    nameArabic: SURAH_ARABIC_NAMES[firstSurahNumOnPage] || 'الفاتحة',
    numberOfAyahs: 7,
  };

  // Inisialisasi Tilawa AI Engine (Model Hugging Face dengan Progress Monitoring)
  useEffect(() => {
    const tilawa = new TilawaVoiceService();
    tilawaServiceRef.current = tilawa;

    tilawa.onProgress((p) => {
      setAiProgress(p);
    });



    return () => {
      tilawa.stopListening();
    };
  }, []);

  /**
   * ALGORITMA PENCOCOKAN STRICT PER-AYAT:
   * Hanya mencocokkan kata-kata pada activeVerseIndex.
   * Ayat setelahnya TIDAK AKAN PERNAH tersentuh sebelum ayat aktif selesai 100%!
   */
  const processSpokenArabic = (spokenText: string) => {
    if (!spokenText || isTransitioningRef.current) return;

    const normalizedSpoken = normalizeArabicQuran(spokenText);
    if (!normalizedSpoken) return;

    const spokenTokens = normalizedSpoken.split(/\s+/).filter((t) => t.length >= 2);
    if (spokenTokens.length === 0) return;

    const currentVerses = pageVersesRef.current;
    const curIdx = activeVerseIndexRef.current;
    if (curIdx >= currentVerses.length) return;

    const targetVerse = currentVerses[curIdx];
    if (!targetVerse || !targetVerse.words) return;

    // Filter kata-kata ayat aktif yang bukan nomor ayat
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

    // Cari kata-kata ayat aktif yang belum terbuka secara berurutan
    const unrevealedWords = targetWords.filter(
      (w) => !nextSet.has(`${targetVerse.verse_key}_${w.position}`)
    );

    if (unrevealedWords.length === 0) {
      // Ayat aktif ini sudah selesai seluruhnya! Otomatis lanjut ke ayat berikutnya
      advanceToNextAyah(curIdx, currentVerses);
      return;
    }

    let matchedAny = false;
    let spokenPtr = 0;

    // Periksa token pelafalan secara berurutan hanya pada kata-kata ayat aktif
    for (let u = 0; u < unrevealedWords.length && spokenPtr < spokenTokens.length; u++) {
      const targetWord = unrevealedWords[u];
      let foundIdx = -1;

      // Window pencarian 3 token suara
      const limit = Math.min(spokenTokens.length, spokenPtr + 3);
      for (let s = spokenPtr; s < limit; s++) {
        if (isArabicWordMatch(targetWord.clean, spokenTokens[s])) {
          foundIdx = s;
          break;
        }
      }

      if (foundIdx !== -1) {
        nextSet.add(`${targetVerse.verse_key}_${targetWord.position}`);
        matchedAny = true;
        spokenPtr = foundIdx + 1;
      } else {
        // Jika kata berikutnya belum cocok, jangan melompati kata di dalam ayat
        break;
      }
    }

    if (matchedAny) {
      revealedWordsRef.current = nextSet;
      setRevealedWordKeys(new Set(nextSet));

      // Cek apakah seluruh kata pada ayat aktif ini sudah lengkap terbuka
      const remainingInActiveVerse = targetWords.filter(
        (w) => !nextSet.has(`${targetVerse.verse_key}_${w.position}`)
      );

      if (remainingInActiveVerse.length === 0) {
        // Ayat aktif selesai 100%!
        setCompletedVerseKeys((prev) => new Set(prev).add(targetVerse.verse_key));
        advanceToNextAyah(curIdx, currentVerses);
      }
    } else if (spokenTokens.length >= 2 && !isTransitioningRef.current) {
      setMistakesCount((prev) => prev + 1);
    }
  };

  /**
   * Pindah ke Ayat Berikutnya secara Otomatis dan Mulus
   */
  const advanceToNextAyah = (currentIdx: number, verses: any[]) => {
    const nextIdx = currentIdx + 1;
    if (nextIdx < verses.length) {
      // Otomatis pindah fokus ke ayat setelahnya
      setActiveVerseIndex(nextIdx);
      activeVerseIndexRef.current = nextIdx;
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
      }, 2000);
    }
  };

  const processSpokenArabicRef = useRef(processSpokenArabic);
  useEffect(() => {
    processSpokenArabicRef.current = processSpokenArabic;
  });

  // Start / Stop Live Listening (Web Speech API + Tilawa AI)
  const startLiveListening = async () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    // Aktifkan Tilawa AI Microphone Stream
    if (tilawaServiceRef.current) {
      tilawaServiceRef.current.startListening().catch(() => {});
    }

    if (!SpeechRecognition) {
      setIsLiveListening(true);
      isLiveListeningRef.current = true;
      setLiveStatusText('Tilawa AI Engine aktif mendengarkan...');
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
        setLiveStatusText('...Menunggu suara pelafalan');
      };

      recognition.onresult = (event: any) => {
        if (isTransitioningRef.current) return;

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
          setLiveStatusText(currentSpoken);
          processSpokenArabicRef.current(currentSpoken);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition status:', event.error);
        }
      };

      recognition.onend = () => {
        if (isLiveListeningRef.current && !isTransitioningRef.current) {
          try {
            recognition.start();
          } catch {
            setIsLiveListening(false);
            isLiveListeningRef.current = false;
          }
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      setIsLiveListening(true);
      isLiveListeningRef.current = true;
    }
  };

  const stopLiveListening = () => {
    setIsLiveListening(false);
    isLiveListeningRef.current = false;
    setLiveStatusText('...Menunggu suara');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (tilawaServiceRef.current) {
      tilawaServiceRef.current.stopListening();
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
      }
      setIsPlayingQari(false);
      return;
    }

    const curAyah = pageVerses[activeVerseIndex];
    const surahNum = curAyah?.chapter_id || currentSurahMeta.number;
    const ayahNum = parseInt(curAyah?.verse_key?.split(':')[1] || '1', 10);

    const sPad = String(surahNum).padStart(3, '0');
    const aPad = String(ayahNum).padStart(3, '0');
    const audioUrl = `https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/${sPad}${aPad}.mp3`;

    const audio = new Audio(audioUrl);
    qariAudioRef.current = audio;
    audio.play();
    setIsPlayingQari(true);

    audio.onended = () => setIsPlayingQari(false);
    audio.onerror = () => setIsPlayingQari(false);
  };

  // Reset active page state
  const handleResetPage = () => {
    revealedWordsRef.current = new Set();
    setRevealedWordKeys(new Set());
    setActiveVerseIndex(0);
    setCompletedVerseKeys(new Set());
    setLiveTranscript('');
  };

  const handleOpenExitModal = () => {
    const duration = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
    setExitPayload({
      activityType: 'murojaah',
      surahNumber: currentSurahMeta.number,
      surahName: currentSurahMeta.nameLatin,
      startAyah: 1,
      endAyah: pageVerses.length || 7,
      totalAyahs: pageVerses.length || 7,
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
    <div className="max-w-2xl mx-auto space-y-3 pb-28 font-sans select-none">
      {/* ========================================================================= */}
      {/* FLOW 1: DAFTAR 114 SURAH PENUH (KATALOG SURAT - TANPA POP-UP)             */}
      {/* ========================================================================= */}
      {viewState === 'catalog' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Header Katalog */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Katalog Surah Al-Qur'an</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih surah untuk langsung membuka lembaran Mushaf Madinah per halaman (Halaman 1 - 604)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setViewState('mushaf')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>Buka Halaman {currentPage}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Kolom Pencarian Surah */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={surahSearchQuery}
              onChange={(e) => setSurahSearchQuery(e.target.value)}
              placeholder="Cari nama surat (contoh: Al-Baqarah, Yasin, 36)..."
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOW 2: TAMPILAN MUSHAF MADINAH ASLI (PERSIS SCREENSHOT REFERENSI)         */}
      {/* ========================================================================= */}
      {viewState === 'mushaf' && (
        <div className="space-y-2 animate-in fade-in">
          {/* 1. TOP HEADER (Persis screenshot: ≡ [Al-Fatihah | Hal 1 | Juz 1 | Hizb 1 🔖] 🔍 ⚙) */}
          <header className="flex items-center justify-between gap-2 px-1 py-1">
            {/* Tombol Menu / Kembali ke Katalog 114 Surah */}
            <button
              type="button"
              onClick={() => setViewState('catalog')}
              className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Buka Daftar 114 Surah"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Center Pill: Kartu Surah & Info Halaman / Juz / Hizb (Persis screenshot) */}
            <div className="flex-1 max-w-sm bg-slate-100/90 border border-slate-200/90 rounded-2xl px-4 py-1.5 flex items-center justify-between shadow-2xs">
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {currentSurahMeta.nameLatin}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Halaman {currentPage} | Juz {currentJuz} | Hizb {currentHizb}
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

            {/* Tombol Cari Halaman (🔍) & Pengaturan (⚙) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsJumpModalOpen(true)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                title="Lompat ke Nomor Halaman (1-604)"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                title="Pengaturan Mode Hafalan"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* 2. LEMBARAN MUSHAF MADINAH ASLI (Persis Format Mushaf - Rata Tengah Al-Fatihah & RTL) */}
          <div
            className="bg-[#fcfbf7] border-x-4 border-double border-slate-800 px-3 sm:px-6 py-4 sm:py-6 min-h-[82vh] relative select-none shadow-xs"
            dir="rtl"
          >
            {/* Fine Inner Page Margin Border (Bingkai Ganda Khas Mushaf Madinah) */}
            <div className="border-2 border-slate-700/70 p-3 sm:p-5 min-h-[74vh] flex flex-col justify-start">
              {loadingPage ? (
                <div className="py-32 flex flex-col items-center justify-center gap-3 text-slate-400" dir="ltr">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  <p className="text-xs">Memuat lembaran Mushaf Halaman {currentPage}...</p>
                </div>
              ) : pageVerses.length > 0 ? (
                <div className="space-y-4">
                  {pageVerses.map((verse: any, vIdx: number) => {
                    const startingSurah = surahsStartingByVerse[verse.verse_key];
                    const isCurrentActive = vIdx === activeVerseIndex;
                    const isCompleted = completedVerseKeys.has(verse.verse_key);
                    const words: any[] = verse.words || [];
                    const ayahNum = parseInt(verse.verse_key?.split(':')[1] || String(vIdx + 1), 10);

                    return (
                      <div key={verse.verse_key || vIdx} className="space-y-3" dir="rtl">
                        {/* Frame Ornamen Judul Surah Klasik (Persis Mushaf - Bukan Box Web) */}
                        {startingSurah && (
                          <div className="relative mx-auto w-full max-w-xl my-4 text-center select-none" dir="rtl">
                            <div className="border-2 border-slate-900 py-2.5 px-4 bg-[#fbf9f4] flex items-center justify-between">
                              {/* Ornamen Rosette Kanan (dalam RTL) */}
                              <div className="text-slate-800">
                                <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 40 40" fill="none" stroke="currentColor">
                                  <circle cx="20" cy="20" r="15" strokeWidth="1.5" />
                                  <circle cx="20" cy="20" r="11" strokeWidth="1" strokeDasharray="2,2" />
                                  <path d="M20 5 L23 15 L33 15 L25 21 L28 31 L20 25 L12 31 L15 21 L7 15 L17 15 Z" strokeWidth="1" />
                                </svg>
                              </div>

                              {/* Kaligrafi Judul Surah */}
                              <div className="flex-1 text-center">
                                <h2 className="font-quran text-2xl sm:text-3xl font-bold text-slate-900 tracking-wide">
                                  سُورَةُ {startingSurah.nameArabic}
                                </h2>
                              </div>

                              {/* Ornamen Rosette Kiri (dalam RTL) */}
                              <div className="text-slate-800">
                                <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 40 40" fill="none" stroke="currentColor">
                                  <circle cx="20" cy="20" r="15" strokeWidth="1.5" />
                                  <circle cx="20" cy="20" r="11" strokeWidth="1" strokeDasharray="2,2" />
                                  <path d="M20 5 L23 15 L33 15 L25 21 L28 31 L20 25 L12 31 L15 21 L7 15 L17 15 Z" strokeWidth="1" />
                                </svg>
                              </div>
                            </div>

                            {/* Basmalah Klasik (Khusus Surah 2-114 selain At-Tawbah. Al-Fatihah ayat 1 sudah merupakan basmalah) */}
                            {startingSurah.number !== 1 && startingSurah.number !== 9 && (
                              <p className="font-quran text-xl sm:text-2xl text-slate-900 mt-3 tracking-wide text-center">
                                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                              </p>
                            )}
                          </div>
                        )}

                        {/* MODE GHAIB PENUH (Level 3) PADA AYAT YANG BELUM AKTIF / BELUM SELESAI */}
                        {memorizationLevel === 3 && !isCompleted && !isCurrentActive ? (
                          <div
                            onClick={() => {
                              setActiveVerseIndex(vIdx);
                              activeVerseIndexRef.current = vIdx;
                            }}
                            className={`flex items-center gap-3 py-3 px-2 cursor-pointer hover:bg-slate-50/70 rounded-lg transition group ${
                              currentPage === 1 ? 'justify-center' : 'justify-start'
                            }`}
                            dir="rtl"
                            title={`Ayat ${ayahNum} (Klik untuk aktifkan)`}
                          >
                            <div className="flex-1 border-b-2 border-slate-300 max-w-xs sm:max-w-md group-hover:border-emerald-400 transition-colors" />
                            <span className="font-quran text-lg w-8 h-8 rounded-full border border-slate-300 text-slate-700 flex items-center justify-center select-none bg-slate-50/60 shadow-2xs group-hover:border-emerald-500 group-hover:text-emerald-700 transition-colors shrink-0">
                              ۝{toArabicDigits(ayahNum)}
                            </span>
                          </div>
                        ) : (
                          /* TAMPILAN KATA AYAT (Level 1, Level 2, atau Ayat Aktif Level 3) */
                          <div
                            onClick={() => {
                              setActiveVerseIndex(vIdx);
                              activeVerseIndexRef.current = vIdx;
                            }}
                            className={`leading-[2.8] sm:leading-[3.2] py-2 px-3 rounded-xl transition cursor-pointer ${
                              currentPage === 1 ? 'text-center' : 'text-right'
                            } ${
                              isCurrentActive
                                ? 'bg-emerald-50/50 ring-1 ring-emerald-300/60'
                                : 'hover:bg-slate-50/50'
                            }`}
                            dir="rtl"
                          >
                            {words.map((w: any, wIdx: number) => {
                              if (w.char_type_name === 'end') {
                                return (
                                  <span
                                    key={w.id || wIdx}
                                    className={`inline-flex items-center justify-center font-quran text-lg w-8 h-8 rounded-full border mx-1.5 align-middle select-none transition-colors ${
                                      isCompleted
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                                        : isCurrentActive
                                        ? 'border-emerald-400 bg-emerald-50/60 text-emerald-700'
                                        : 'border-slate-300 text-slate-800 bg-slate-50/50'
                                    }`}
                                  >
                                    ۝{toArabicDigits(ayahNum)}
                                  </span>
                                );
                              }

                              const wordKey = `${verse.verse_key}_${w.position}`;
                              const isRevealed = revealedWordKeys.has(wordKey);

                              let isVisible = false;
                              if (memorizationLevel === 1) {
                                isVisible = true;
                              } else if (memorizationLevel === 2) {
                                isVisible = w.position % 2 === 1 || isRevealed || isCompleted;
                              } else {
                                // Level 3: Terlihat jika sudah dilafalkan atau ayat sudah komplit
                                isVisible = isRevealed || isCompleted;
                              }

                              if (isVisible) {
                                return (
                                  <span
                                    key={w.id || wIdx}
                                    className={`inline-block mx-1 font-quran text-2xl sm:text-3xl transition-colors duration-200 ${
                                      isRevealed
                                        ? 'text-emerald-700 font-bold'
                                        : 'text-slate-800'
                                    }`}
                                  >
                                    {w.text_uthmani}
                                  </span>
                                );
                              }

                              // Garis halus kata yang belum terlafalkan
                              return (
                                <span
                                  key={w.id || wIdx}
                                  className="inline-block mx-1.5 align-middle border-b-2 border-slate-300 w-10 sm:w-14 h-6 transition-all"
                                  title="Kata tersembunyi (lafalkan untuk membuka)"
                                />
                              );
                            })}
                          </div>
                        )}
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
          </div>

          {/* 3. FLOATING BOTTOM ACTION BAR (Persis screenshot referensi: [Kesalahan] [📖] [👁️] [<] [>] + [MIC HIJAU]) */}
          <div className="fixed bottom-20 md:bottom-6 left-0 right-0 z-40 px-4 pointer-events-none">
            <div className="max-w-xl mx-auto flex items-center justify-between pointer-events-auto">
              {/* KIRI: Badge Kesalahan */}
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md text-xs font-semibold text-slate-700">
                <span>Kesalahan</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] ${
                    mistakesCount > 0
                      ? 'bg-amber-100 text-amber-800 font-bold'
                      : 'bg-emerald-100 text-emerald-800 font-bold'
                  }`}
                >
                  {mistakesCount}
                </span>
              </div>

              {/* TENGAH: Dock Navigasi Lembar & Mode Tampilan */}
              <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-full px-2 py-1 shadow-md">
                {/* Mode Baca Mushaf (Teks Penuh) */}
                <button
                  type="button"
                  onClick={() => setMemorizationLevel((prev) => (prev === 1 ? 3 : 1))}
                  className={`p-2.5 rounded-full transition cursor-pointer ${
                    memorizationLevel === 1
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={memorizationLevel === 1 ? 'Beralih ke Mode Ghaib' : 'Tampilkan Teks Penuh (Mode Baca)'}
                >
                  <BookOpen className="w-4 h-4" />
                </button>

                {/* Dengarkan Qari Resmi */}
                <button
                  type="button"
                  onClick={handleToggleQari}
                  className={`p-2.5 rounded-full transition cursor-pointer ${
                    isPlayingQari
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={isPlayingQari ? 'Jeda Audio Qari' : 'Dengarkan Bacaan Qari'}
                >
                  {isPlayingQari ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Siklus Mode Hafalan Bertingkat (1: Teks Lengkap -> 2: Samar -> 3: Ghaib) */}
                <button
                  type="button"
                  onClick={() => {
                    setMemorizationLevel((prev) => (prev === 3 ? 1 : ((prev + 1) as 1 | 2 | 3)));
                  }}
                  className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer relative"
                  title={`Mode Hafalan: Level ${memorizationLevel} (${
                    memorizationLevel === 1 ? 'Teks Lengkap' : memorizationLevel === 2 ? 'Sebagian Samar' : 'Ghaib Total'
                  })`}
                >
                  {memorizationLevel === 1 ? (
                    <Eye className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-700" />
                  )}
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">
                    {memorizationLevel}
                  </span>
                </button>

                {/* Ulangi Halaman / Reset Hafalan Halaman Ini */}
                <button
                  type="button"
                  onClick={handleResetPage}
                  className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                  title="Ulangi dari Awal Halaman Ini"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Halaman Sebelumnya (<) */}
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Halaman Selanjutnya (>) */}
                <button
                  type="button"
                  disabled={currentPage >= 604}
                  onClick={() => setCurrentPage((p) => Math.min(604, p + 1))}
                  className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* KANAN: Tombol Mikrofon Utama (Persis screenshot: floating green glowing circle) */}
              <button
                type="button"
                onClick={handleToggleListening}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer transition-all duration-300 ${
                  isLiveListening
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 ring-4 ring-emerald-300/60 shadow-emerald-500/40 animate-pulse scale-105'
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:scale-105 active:scale-95 shadow-emerald-900/20'
                }`}
                title={isLiveListening ? 'Hentikan Mendengarkan' : 'Mulai Hafalan Suara'}
              >
                {isLiveListening ? (
                  <Square className="w-5 h-5 fill-white" />
                ) : (
                  <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
                )}
              </button>
            </div>

            {/* Status Suara Ringkas Khusyu' (Tanpa Bunyi) */}
            {isLiveListening && (
              <div className="max-w-xs mx-auto mt-2 bg-slate-900/80 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full text-center truncate pointer-events-auto shadow-md">
                {liveTranscript ? `Mendengarkan: "${liveTranscript}"` : liveStatusText}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL LOMPAT KE NOMOR HALAMAN (1 - 604) */}
      {isJumpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-xs p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Buka Halaman Mushaf</h3>
              <button
                type="button"
                onClick={() => setIsJumpModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-500">Nomor Halaman (1 - 604):</label>
              <input
                type="number"
                min={1}
                max={604}
                value={pageJumpInput}
                onChange={(e) => setPageJumpInput(e.target.value)}
                placeholder="Contoh: 1, 50, 582"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center font-bold"
                autoFocus
              />
            </div>
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
              className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
            >
              Buka Halaman
            </button>
          </div>
        </div>
      )}

      {/* MODAL PENGATURAN HAFALAN & CATAT MUTABAAH */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Pengaturan Hafalan</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pilihan Level Hafalan (Tadrij) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Tingkat Kesulitan Hafalan:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMemorizationLevel(1)}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    memorizationLevel === 1
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold">Level 1</p>
                  <p className="text-[10px] text-slate-500">Teks Penuh</p>
                </button>
                <button
                  type="button"
                  onClick={() => setMemorizationLevel(2)}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    memorizationLevel === 2
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold">Level 2</p>
                  <p className="text-[10px] text-slate-500">Sebagian Samar</p>
                </button>
                <button
                  type="button"
                  onClick={() => setMemorizationLevel(3)}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    memorizationLevel === 3
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold">Level 3</p>
                  <p className="text-[10px] text-slate-500">Ghaib Total</p>
                </button>
              </div>
            </div>

            {/* Status Engine AI Suara */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Engine Suara:</span>
                <span className="text-emerald-700 font-bold">Web Speech (ar-SA) + QUL Matcher</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Model Neural Tilawa AI:</span>
                <span>{aiProgress?.message || 'Siap dihubungkan'}</span>
              </div>
            </div>

            {/* Info SRS Queue */}
            {dueAyahs.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                <strong>{dueAyahs.length} Ayat</strong> terjadwal untuk diulang di SRS hari ini.
              </div>
            )}

            {/* Reset Counter Kesalahan */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setMistakesCount(0);
                  setIsSettingsOpen(false);
                }}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Reset Hitungan Kesalahan
              </button>
            </div>

            {/* Selesai Sesi & Simpan Mutabaah */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                  handleOpenExitModal();
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Selesaikan Sesi & Catat ke Mutabaah</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SIMPAN SESI MUTABAAH YAUMI */}
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
    </div>
  );
}
