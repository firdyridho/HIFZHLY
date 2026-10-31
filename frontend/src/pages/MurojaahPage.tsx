import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Mic,
  Square,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Search,
  Settings,
  Bookmark,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  X,
  Volume2,
  Pause,
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
  // Navigation Flow State: 'catalog' (Daftar 114 Surah tanpa popup) | 'mushaf' (Lembaran Mushaf Per Halaman 1-604)
  const [viewState, setViewState] = useState<'catalog' | 'mushaf'>('mushaf');

  // Madinah Mushaf Page (1 - 604)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageVerses, setPageVerses] = useState<any[]>([]);
  const [loadingPage, setLoadingPage] = useState<boolean>(false);

  // 114 Surahs catalog list
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [surahSearchQuery, setSurahSearchQuery] = useState('');
  const [pageJumpInput, setPageJumpInput] = useState<string>('');
  const [isJumpModalOpen, setIsJumpModalOpen] = useState(false);

  // Progressive Memorization Mode (3 Levels - Tadrij Hafalan):
  // 1 = Teks Penuh (semua kata terlihat berharakat)
  // 2 = Sebagian Samar (kata genap tertutup garis, kata ganjil terlihat sebagai pemantik)
  // 3 = Ghaib Penuh (semua kata tertutup garis tipis elegan persis screenshot!)
  const [memorizationLevel, setMemorizationLevel] = useState<1 | 2 | 3>(3);

  // Set of revealed word keys on current page: `${verse_key}_${position}`
  const [revealedWordKeys, setRevealedWordKeys] = useState<Set<string>>(new Set());

  // Real-time Voice & Audio State
  const [isLiveListening, setIsLiveListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveStatusText, setLiveStatusText] = useState('...Menunggu suara');
  const [mistakesCount, setMistakesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Audio Qari Player State
  const [isPlayingQari, setIsPlayingQari] = useState(false);
  const qariAudioRef = useRef<HTMLAudioElement | null>(null);

  // Synchronized Refs for Web Speech API and Tilawa AI
  const revealedWordsRef = useRef<Set<string>>(new Set());
  const isLiveListeningRef = useRef<boolean>(false);
  const isTransitioningRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const tilawaServiceRef = useRef<TilawaVoiceService | null>(null);

  useEffect(() => {
    revealedWordsRef.current = revealedWordKeys;
  }, [revealedWordKeys]);

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
    // Reset revealed words for the new page
    revealedWordsRef.current = new Set();
    setRevealedWordKeys(new Set());
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
      .catch((err) => {
        console.warn('Gagal memuat halaman mushaf dari API:', err);
      })
      .finally(() => {
        setLoadingPage(false);
      });
  }, [currentPage]);

  // Parse lines for the current Madinah Mushaf page (15 Lines Standard)
  const { pageLines, surahsStartingByLine, allWordsOnPage } = useMemo(() => {
    const linesMap: Record<number, QuranWordItem[]> = {};
    const surahStartMap: Record<number, { number: number; nameLatin: string; nameArabic: string; totalAyahs: number }> = {};
    const wordsList: QuranWordItem[] = [];

    pageVerses.forEach((verse: any) => {
      const parts = verse.verse_key?.split(':') || [];
      const surahNum = parseInt(parts[0], 10);
      const ayahNum = parseInt(parts[1], 10);

      // Cek apakah surah baru dimulai di ayat ini (ayat 1)
      if (ayahNum === 1 && verse.words?.[0]?.line_number) {
        const line = verse.words[0].line_number;
        const sMeta = surahs.find((s) => s.number === surahNum);
        surahStartMap[line] = {
          number: surahNum,
          nameLatin: sMeta?.nameLatin || `Surah ${surahNum}`,
          nameArabic: SURAH_ARABIC_NAMES[surahNum] || sMeta?.nameArabic || '',
          totalAyahs: sMeta?.numberOfAyahs || 7,
        };
      }

      if (verse.words && Array.isArray(verse.words)) {
        verse.words.forEach((w: any) => {
          const lineNum = w.line_number || 1;
          const clean = normalizeArabicQuran(w.text_uthmani);
          const item: QuranWordItem = {
            id: w.id,
            position: w.position,
            text_uthmani: w.text_uthmani,
            line_number: lineNum,
            char_type_name: w.char_type_name || 'word',
            verse_key: verse.verse_key,
            clean,
          };

          if (!linesMap[lineNum]) linesMap[lineNum] = [];
          linesMap[lineNum].push(item);

          if (w.char_type_name !== 'end') {
            wordsList.push(item);
          }
        });
      }
    });

    return {
      pageLines: linesMap,
      surahsStartingByLine: surahStartMap,
      allWordsOnPage: wordsList,
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

  // Inisialisasi Tilawa AI Engine (Model Zipformer / Hugging Face)
  useEffect(() => {
    const tilawa = new TilawaVoiceService();
    tilawaServiceRef.current = tilawa;

    // Callback saat Tilawa mendeteksi kecocokan ayat
    tilawa.onMatch((event) => {
      console.log('Tilawa AI detected recitation:', event.surah, event.ayah);
      const targetVerseKey = `${event.surah}:${event.ayah}`;

      // Buka seluruh kata dalam ayat tersebut pada halaman aktif
      setRevealedWordKeys((prev) => {
        const next = new Set(prev);
        allWordsOnPage.forEach((w) => {
          if (w.verse_key === targetVerseKey) {
            next.add(`${w.verse_key}_${w.position}`);
          }
        });
        return next;
      });

      // Jika ayat yang dilafalkan berada di halaman berikutnya, otomatis beralih halaman
      const targetStartPage = getSurahStartPage(event.surah);
      if (targetStartPage > currentPage && targetStartPage <= 604) {
        setTimeout(() => {
          setCurrentPage(targetStartPage);
        }, 1500);
      }
    });

    // Inisialisasi model di background
    tilawa.initEngine().catch(() => {});

    return () => {
      tilawa.stopListening();
    };
  }, [currentPage, allWordsOnPage]);

  // Algoritma Pencocokan Multi-Kata Real-time QUL (Streaming Client Matcher)
  const processSpokenArabic = (spokenText: string) => {
    if (!spokenText || isTransitioningRef.current) return;

    const normalizedSpoken = normalizeArabicQuran(spokenText);
    if (!normalizedSpoken) return;

    const spokenTokens = normalizedSpoken.split(/\s+/).filter((t) => t.length >= 2);
    if (spokenTokens.length === 0) return;

    const currentRevealed = revealedWordsRef.current;
    const nextSet = new Set(currentRevealed);
    let newlyFound = false;

    // Cari kata-kata yang belum terbuka di lembaran halaman ini
    let tokenPointer = 0;
    for (let i = 0; i < allWordsOnPage.length && tokenPointer < spokenTokens.length; i++) {
      const wordItem = allWordsOnPage[i];
      const wordKey = `${wordItem.verse_key}_${wordItem.position}`;

      if (nextSet.has(wordKey)) continue;

      // Periksa kecocokan dengan token suara dalam window 3 kata
      let matchedTokenIdx = -1;
      const searchLimit = Math.min(spokenTokens.length, tokenPointer + 3);
      for (let t = tokenPointer; t < searchLimit; t++) {
        if (isArabicWordMatch(wordItem.clean, spokenTokens[t])) {
          matchedTokenIdx = t;
          break;
        }
      }

      if (matchedTokenIdx !== -1) {
        nextSet.add(wordKey);
        newlyFound = true;
        tokenPointer = matchedTokenIdx + 1;
      }
    }

    if (newlyFound) {
      revealedWordsRef.current = nextSet;
      setRevealedWordKeys(new Set(nextSet));

      // Jika seluruh kata pada halaman ini sudah berhasil terbuka
      if (nextSet.size === allWordsOnPage.length && allWordsOnPage.length > 0) {
        isTransitioningRef.current = true;
        // Catat mutabaah halaman selesai
        recordMurojaahSingleAyah(currentSurahMeta.number, currentSurahMeta.nameLatin, 1, 100);

        // Pindah otomatis ke halaman berikutnya setelah 2 detik
        setTimeout(() => {
          if (currentPage < 604) {
            setCurrentPage((p) => p + 1);
          }
          isTransitioningRef.current = false;
        }, 2000);
      }
    } else if (spokenTokens.length >= 2 && !isTransitioningRef.current) {
      setMistakesCount((prev) => prev + 1);
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

    if (tilawaServiceRef.current) {
      tilawaServiceRef.current.stopListening();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    setLiveStatusText('Tekan mikrofon untuk melafalkan');
  };

  const handleToggleListening = () => {
    if (isLiveListening) {
      stopLiveListening();
    } else {
      startLiveListening();
    }
  };

  // Play Official Qari Audio for the first verse on page
  const handleToggleQari = () => {
    if (isPlayingQari) {
      if (qariAudioRef.current) qariAudioRef.current.pause();
      setIsPlayingQari(false);
      return;
    }

    const firstVerse = pageVerses[0];
    if (!firstVerse) return;

    const parts = (firstVerse.verse_key || '1:1').split(':');
    const sPad = String(parts[0]).padStart(3, '0');
    const aPad = String(parts[1]).padStart(3, '0');
    const audioUrl = `https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/${sPad}${aPad}.mp3`;

    const audio = new Audio(audioUrl);
    qariAudioRef.current = audio;
    audio.play();
    setIsPlayingQari(true);

    audio.onended = () => setIsPlayingQari(false);
    audio.onerror = () => setIsPlayingQari(false);
  };

  // Reset active page revealed state
  const handleResetPage = () => {
    revealedWordsRef.current = new Set();
    setRevealedWordKeys(new Set());
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
    <div className="max-w-3xl mx-auto space-y-4 pb-28 font-sans select-none">
      {/* ========================================================================= */}
      {/* FLOW 1: DAFTAR 114 SURAH PENUH (KATALOG SURAT - TANPA POP-UP)             */}
      {/* ========================================================================= */}
      {viewState === 'catalog' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Header Katalog */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
      {/* FLOW 2: TAMPILAN MUSHAF PER HALAMAN (604 Halaman Madinah - Persis Screenshot)*/}
      {/* ========================================================================= */}
      {viewState === 'mushaf' && (
        <div className="space-y-4 animate-in fade-in">
          {/* 1. TOP HEADER (Persis screenshot: ≡ [Al-Fatihah | Hal 1 | Juz 1 | Hizb 1 🔖] 🔍 ⚙) */}
          <header className="flex items-center justify-between gap-2 px-1 py-1">
            {/* Tombol Kembali ke Daftar Surah (Tanpa Pop-up) */}
            <button
              type="button"
              onClick={() => setViewState('catalog')}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer text-xs font-bold"
              title="Kembali ke Daftar 114 Surah"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Daftar Surah</span>
            </button>

            {/* Center Pill: Kartu Surah & Info Halaman / Juz / Hizb (Persis screenshot) */}
            <div className="flex-1 max-w-sm bg-slate-100 border border-slate-200/80 rounded-2xl px-4 py-1.5 flex items-center justify-between shadow-2xs">
              <div className="text-left">
                <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
                  {currentSurahMeta.nameLatin}
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  Halaman {currentPage} | Juz {currentJuz} | Hizb {currentHizb}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="p-1 text-slate-400 hover:text-amber-600 transition cursor-pointer"
                title={isBookmarked ? 'Tersimpan di Bookmark' : 'Tandai Halaman Ini'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>
            </div>

            {/* Action Buttons: Lompat Halaman (🔍) & Pengaturan (⚙) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsJumpModalOpen(true)}
                className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                title="Lompat ke Nomor Halaman (1-604)"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                title="Pengaturan Hafalan"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* 2. LEMBARAN MUSHAF MADINAH PER HALAMAN (Persis Screenshot) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col min-h-[580px] p-4 sm:p-8">
            {loadingPage ? (
              <div className="flex flex-col items-center justify-center py-32 text-emerald-700 space-y-2">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm font-semibold">Membuka Halaman {currentPage} / 604...</span>
              </div>
            ) : Object.keys(pageLines).length > 0 ? (
              <div className="space-y-2 py-1 select-none" dir="rtl">
                {/* 15 Baris Presisi Mushaf Madinah */}
                {Object.entries(pageLines).map(([lineStr, words]) => {
                  const lineNum = parseInt(lineStr, 10);
                  const startingSurah = surahsStartingByLine[lineNum];

                  return (
                    <div key={lineNum} className="space-y-2">
                      {/* Frame Ornamen Judul Surah Klasik jika ada surah yang dimulai di baris ini */}
                      {startingSurah && (
                        <div className="relative mx-auto w-full max-w-lg my-3 px-6 py-3 rounded-2xl border-2 border-slate-900 bg-amber-50/15 text-center select-none shadow-xs">
                          {/* Ornamen Sudut Arabesque */}
                          <span className="absolute top-1.5 left-2.5 text-xs text-slate-800 font-serif">۞</span>
                          <span className="absolute top-1.5 right-2.5 text-xs text-slate-800 font-serif">۞</span>
                          <span className="absolute bottom-1.5 left-2.5 text-xs text-slate-800 font-serif">۞</span>
                          <span className="absolute bottom-1.5 right-2.5 text-xs text-slate-800 font-serif">۞</span>

                          <h2 className="font-quran text-2xl sm:text-3xl font-bold text-slate-900 tracking-wide" dir="rtl">
                            سُورَةُ {startingSurah.nameArabic}
                          </h2>
                          <p className="text-[10px] font-sans text-slate-500 uppercase tracking-widest mt-0.5">
                            {startingSurah.nameLatin} • {startingSurah.totalAyahs} Ayat
                          </p>

                          {/* Basmalah */}
                          {startingSurah.number !== 9 && (
                            <p className="font-quran text-xl sm:text-2xl text-slate-800 mt-2 tracking-wide" dir="rtl">
                              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                            </p>
                          )}
                        </div>
                      )}

                      {/* Baris Ayat Madinah: Format Fleksibel Sesuai Mode Hafalan Bertingkat */}
                      <div className="text-right leading-loose">
                        {words.map((w, wIdx) => {
                          if (w.char_type_name === 'end') {
                            // Ornamen Nomor Ayat ۝ dengan angka Arab Uthmani
                            const ayahNum = parseInt(w.verse_key.split(':')[1] || '1', 10);
                            return (
                              <span
                                key={w.id || wIdx}
                                className="inline-flex items-center justify-center font-quran text-lg w-8 h-8 rounded-full border border-slate-300 text-slate-800 mx-1.5 align-middle select-none bg-slate-50/50 shadow-2xs"
                              >
                                ۝{toArabicDigits(ayahNum)}
                              </span>
                            );
                          }

                          // Mode Hafalan Bertingkat (3 Levels):
                          // Level 1: Teks Lengkap (semua terlihat)
                          // Level 2: Sebagian Samar (kata genap tertutup garis)
                          // Level 3: Ghaib Penuh (semua kata tertutup garis tipis halus, persis screenshot!)
                          const wordKey = `${w.verse_key}_${w.position}`;
                          const isRevealedByVoice = revealedWordKeys.has(wordKey);

                          let isVisible = false;
                          if (memorizationLevel === 1) {
                            isVisible = true;
                          } else if (memorizationLevel === 2) {
                            isVisible = w.position % 2 === 1 || isRevealedByVoice;
                          } else {
                            // Level 3 (Ghaib Penuh)
                            isVisible = isRevealedByVoice;
                          }

                          if (isVisible) {
                            return (
                              <span
                                key={w.id || wIdx}
                                className={`inline-block mx-1 font-quran text-2xl sm:text-3xl transition-colors duration-200 ${
                                  isRevealedByVoice
                                    ? 'text-emerald-700 font-semibold'
                                    : 'text-slate-800'
                                }`}
                              >
                                {w.text_uthmani}
                              </span>
                            );
                          }

                          // Tampilan kata tersembunyi: garis halus tipis elegan persis screenshot!
                          return (
                            <span
                              key={w.id || wIdx}
                              className="inline-block mx-1.5 align-middle border-b-2 border-slate-300 w-10 sm:w-14 h-6 transition-all"
                              title="Kata tersembunyi (lafalkan untuk membuka)"
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400">
                Gagal memuat lembaran mushaf halaman {currentPage}.
              </div>
            )}
          </div>

          {/* 3. FLOATING BOTTOM ACTION BAR (Persis screenshot: [Kesalahan] [📖] [👁️] [<] [>] + [MIC HIJAU GLOWING]) */}
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

                {/* Siklus Mode Hafalan Bertingkat (1: Lengkap -> 2: Samar -> 3: Ghaib) */}
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

                {/* Ulangi Lembaran Halaman Ini */}
                <button
                  type="button"
                  onClick={handleResetPage}
                  className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                  title="Ulangi Hafalan Lembar Ini"
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
                title={isLiveListening ? 'Hentikan Mendengarkan' : 'Mulai Hafalan Suara (Tilawa AI)'}
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
                Tingkat Kesulitan Hafalan (Tadrij):
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
