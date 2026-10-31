import { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
  Eye,
  EyeOff,
  BookOpen,
  Search,
  Settings,
  Bookmark,
  RotateCcw,
  X,
  Volume2,
  Pause,
  CheckCircle2,
  Menu,
} from 'lucide-react';
import type { SrsDueItem, SurahSummary } from '../types';
import { recordMurojaahSingleAyah, recordMutabaahReport } from '../lib/mutabaahService';
import {
  calculateAyahPage,
  getJuzFromPage,
  getHizbFromPage,
  getSurahStartPage,
  toArabicDigits,
  SURAH_ARABIC_NAMES,
  normalizeArabicQuran,
  isArabicWordMatch,
} from '../lib/quranMeta';
import ExitMutabaahModal, { ExitMutabaahPayload } from '../components/mutabaah/ExitMutabaahModal';

interface AyahWord {
  raw: string;       // Lafal asli Uthmani (contoh: ٱلرَّحْمَـٰنِ)
  clean: string;     // Teks Arab normalisasi QUL untuk pencocokan (contoh: الرحمن)
  dashed: string;    // Placeholder bergaris
}

interface MushafAyah {
  ayahNumber: number;
  textArabic: string;
  textLatin: string;
  translation: string;
  audioUrl: string;
  words: AyahWord[];
}

function parseAyahWords(textArabic: string): AyahWord[] {
  const tokens = textArabic.trim().split(/\s+/);
  return tokens.map((token) => {
    const clean = normalizeArabicQuran(token);
    const dashLen = Math.max(3, clean.length * 2);
    const dashed = '-'.repeat(dashLen);
    return {
      raw: token,
      clean,
      dashed,
    };
  });
}

// Data awal Al-Fatihah (7 Ayat, persis seperti screenshot aplikasi referensi)
const DEFAULT_SURAHS: { number: number; name: string; page: number; juz: number; ayahs: MushafAyah[] }[] = [
  {
    number: 1,
    name: 'Al-Fatihah',
    page: 1,
    juz: 1,
    ayahs: [
      {
        ayahNumber: 1,
        textArabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
        textLatin: 'Bismillaahir-rahmaanir-rahiim',
        translation: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.',
        audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/001001.mp3',
        words: parseAyahWords('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ'),
      },
      {
        ayahNumber: 2,
        textArabic: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
        textLatin: "Al-hamdu lillaahi rabbil-'aalamiin",
        translation: 'Segala puji bagi Allah, Tuhan seluruh alam,',
        audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/001002.mp3',
        words: parseAyahWords('ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ'),
      },
      {
        ayahNumber: 3,
        textArabic: 'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
        textLatin: 'Ar-rahmaanir-rahiim',
        translation: 'Yang Maha Pengasih, Maha Penyayang,',
        audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/001003.mp3',
        words: parseAyahWords('ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ'),
      },
      {
        ayahNumber: 4,
        textArabic: 'مَـٰلِكِ يَوْمِ ٱلدِّينِ',
        textLatin: 'Maaliki yawmid-diin',
        translation: 'Pemilik hari pembalasan.',
        audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/001004.mp3',
        words: parseAyahWords('مَـٰلِكِ يَوْمِ ٱلدِّينِ'),
      },
      {
        ayahNumber: 5,
        textArabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        textLatin: "Iyyaaka na'budu wa iyyaaka nasta'iin",
        translation: 'Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan.',
        audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/001005.mp3',
        words: parseAyahWords('إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ'),
      },
      {
        ayahNumber: 6,
        textArabic: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
        textLatin: 'Ihdinash-shiraathal-mustaqiim',
        translation: 'Tunjukilah kami jalan yang lurus,',
        audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/001006.mp3',
        words: parseAyahWords('ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ'),
      },
      {
        ayahNumber: 7,
        textArabic: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
        textLatin: "Shiraathal-ladziina an'amta 'alayhim ghayril-maghdhuubi 'alayhim wa ladh-dhaalliin",
        translation: '(yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat.',
        audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/001007.mp3',
        words: parseAyahWords('صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ'),
      },
    ],
  },
];

export default function MurojaahPage() {
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [currentSurah, setCurrentSurah] = useState<{ number: number; name: string; page: number; juz: number; ayahs: MushafAyah[] }>(DEFAULT_SURAHS[0]);

  const [activeAyahIndex, setActiveAyahIndex] = useState(0);
  const activeAyah = currentSurah.ayahs[activeAyahIndex] || currentSurah.ayahs[0];

  // Dynamic Madinah Mushaf Page, Juz, & Hizb calculation for the active ayah
  const activeAyahPage = calculateAyahPage(
    currentSurah.number,
    activeAyah ? activeAyah.ayahNumber : 1,
    currentSurah.ayahs ? currentSurah.ayahs.length : 1
  );
  const activeAyahJuz = getJuzFromPage(activeAyahPage);
  const activeAyahHizb = getHizbFromPage(activeAyahPage);

  // Progressive Memorization Mode (3 Levels - Tadrij Hafalan):
  // 1 = Teks Lengkap (semua kata terlihat berharakat)
  // 2 = Sebagian Samar (kata genap tertutup garis, kata ganjil terlihat sebagai pemantik)
  // 3 = Ghaib Total (semua kata tertutup garis tipis elegan persis screenshot!)
  const [memorizationLevel, setMemorizationLevel] = useState<1 | 2 | 3>(3);

  // Set of revealed word indices in the active ayah
  const [revealedWordIndices, setRevealedWordIndices] = useState<Set<number>>(new Set());

  // Real-time Voice Recognition State
  const [isLiveListening, setIsLiveListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveStatusText, setLiveStatusText] = useState('...Menunggu suara');
  const [isCompletedAyah, setIsCompletedAyah] = useState(false);
  const [mistakesCount, setMistakesCount] = useState(0);

  // Modals & Controls State
  const [isSurahModalOpen, setIsSurahModalOpen] = useState(false);
  const [surahSearchQuery, setSurahSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [viewMode, setViewMode] = useState<'mushaf' | 'detailed'>('mushaf');

  // Synchronized Refs to avoid stale closures in Web Speech API callbacks
  const activeAyahRef = useRef<MushafAyah>(activeAyah);
  const activeAyahIndexRef = useRef<number>(activeAyahIndex);
  const currentSurahRef = useRef(currentSurah);
  const isCompletedAyahRef = useRef<boolean>(false);
  const isTransitioningRef = useRef<boolean>(false);
  const revealedWordsRef = useRef<Set<number>>(new Set());
  const isLiveListeningRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const transitionTimeoutRef = useRef<any>(null);

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
      score: Math.max(80, 100 - mistakesCount * 2),
    });
    setIsExitModalOpen(true);
  };

  // SRS due items from backend
  const [dueAyahs, setDueAyahs] = useState<SrsDueItem[]>([]);

  // Audio Qari player
  const [isPlayingQari, setIsPlayingQari] = useState(false);
  const qariAudioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch SRS due items
  const fetchSrsQueue = async () => {
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
    }
  };

  useEffect(() => {
    fetchSrsQueue();

    // Fetch Full 114 Surahs list from Backend Proxy API
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
    if (selectedSurahNumber === 1 && currentSurah.number === 1 && currentSurah.ayahs.length === 7) {
      return; // Already initialized with default Al-Fatihah
    }

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
          const startPage = getSurahStartPage(data.number);
          const startJuz = getJuzFromPage(startPage);
          setCurrentSurah({
            number: data.number,
            name: data.nameLatin,
            page: startPage,
            juz: startJuz,
            ayahs: parsed,
          });
          setActiveAyahIndex(0);
        }
      })
      .catch((err) => console.warn('Failed to load surah detail from backend:', err));
  }, [selectedSurahNumber]);

  // Reset kata terbuka setiap kali ganti ayat
  useEffect(() => {
    revealedWordsRef.current = new Set();
    setRevealedWordIndices(new Set());
    isCompletedAyahRef.current = false;
    setIsCompletedAyah(false);
    setLiveTranscript('');
    setLiveStatusText(isLiveListening ? '...Menunggu suara' : 'Tekan mikrofon untuk melafalkan');
  }, [activeAyahIndex, selectedSurahNumber]);

  // Sync selesai ayat ke backend SRS tanpa bunyi bising
  const handleAyahCompleted = async (ayah: MushafAyah) => {
    setIsCompletedAyah(true);
    isCompletedAyahRef.current = true;
    isTransitioningRef.current = true;

    // Hentikan sejenak input mikrofon agar speech buffer browser bersih dari audio ayat sebelumnya
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }

    // Rekam langsung ke Mutabaah Yaumi persistent storage
    try {
      recordMurojaahSingleAyah(
        currentSurahRef.current.number,
        currentSurahRef.current.name,
        ayah.ayahNumber,
        Math.max(85, 100 - mistakesCount * 3)
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
          surahNumber: currentSurahRef.current.number,
          ayahNumber: ayah.ayahNumber,
          userText: ayah.textArabic,
        }),
      });
      fetchSrsQueue();
    } catch {
      // background sync
    }

    // Pindah ke ayat berikutnya otomatis setelah jeda jeda khusyu' 1.8 detik
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      const curIndex = activeAyahIndexRef.current;
      const totalAyahs = currentSurahRef.current.ayahs.length;

      if (curIndex < totalAyahs - 1) {
        setActiveAyahIndex(curIndex + 1);
        revealedWordsRef.current = new Set();
        setRevealedWordIndices(new Set());
        setLiveTranscript('');
        setLiveStatusText(isLiveListeningRef.current ? '...Menunggu suara' : 'Tekan mikrofon untuk melafalkan');

        // Buka kembali listening setelah ayat berganti dan audio buffer bersih
        setTimeout(() => {
          isCompletedAyahRef.current = false;
          setIsCompletedAyah(false);
          isTransitioningRef.current = false;
          if (isLiveListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {
              // ignore
            }
          }
        }, 400);
      } else {
        isTransitioningRef.current = false;
        setLiveStatusText('Alhamdulillah, seluruh surah telah selesai dimurojaah!');
      }
    }, 1800);
  };

  // Algoritma Pencocokan Multi-Kata Real-time (Standar QUL & Tilawa Yazin Sai)
  const processSpokenArabic = (spokenText: string) => {
    if (!spokenText || isTransitioningRef.current || isCompletedAyahRef.current) return;

    const targetAyah = activeAyahRef.current;
    if (!targetAyah || !targetAyah.words || targetAyah.words.length === 0) return;

    // Normalisasi lafal suara santri menggunakan standar QUL / Tilawa
    const normalizedSpoken = normalizeArabicQuran(spokenText);
    if (!normalizedSpoken) return;

    const spokenTokens = normalizedSpoken.split(/\s+/).filter((t) => t.length >= 2);
    if (spokenTokens.length === 0) return;

    const currentRevealed = revealedWordsRef.current;
    const nextSet = new Set(currentRevealed);
    let newlyFound = false;

    // Pencocokan multi-kata berurutan dalam satu nafas / tarikan bacaan
    let tokenPointer = 0;
    for (let wIdx = 0; wIdx < targetAyah.words.length && tokenPointer < spokenTokens.length; wIdx++) {
      if (nextSet.has(wIdx)) {
        continue;
      }

      const targetWord = targetAyah.words[wIdx];
      // Cari apakah ada token suara dalam window 3 token yang cocok dengan kata ini
      let matchedTokenIdx = -1;
      const searchEnd = Math.min(spokenTokens.length, tokenPointer + 3);
      for (let t = tokenPointer; t < searchEnd; t++) {
        if (isArabicWordMatch(targetWord.clean, spokenTokens[t])) {
          matchedTokenIdx = t;
          break;
        }
      }

      if (matchedTokenIdx !== -1) {
        nextSet.add(wIdx);
        newlyFound = true;
        tokenPointer = matchedTokenIdx + 1; // Majukan pointer token suara
      }
    }

    if (newlyFound) {
      revealedWordsRef.current = nextSet;
      setRevealedWordIndices(new Set(nextSet));

      // Jika seluruh kata dalam ayat telah berhasil dilafalkan
      if (nextSet.size === targetAyah.words.length && targetAyah.words.length > 0 && !isCompletedAyahRef.current) {
        isCompletedAyahRef.current = true;
        isTransitioningRef.current = true;
        handleAyahCompleted(targetAyah);
      }
    } else {
      // Jika suara santri terdengar jelas tapi belum cocok dengan kata berikutnya
      if (spokenTokens.length >= 2 && !isTransitioningRef.current) {
        setMistakesCount((prev) => prev + 1);
      }
    }
  };

  const processSpokenArabicRef = useRef(processSpokenArabic);
  useEffect(() => {
    processSpokenArabicRef.current = processSpokenArabic;
  });

  // Inisialisasi & Pengaturan Real-time Web Speech Recognition
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
      recognition.lang = 'ar-SA'; // Dialek Bahasa Arab (Saudi Arabia)

      recognition.onstart = () => {
        setIsLiveListening(true);
        isLiveListeningRef.current = true;
        setLiveStatusText('...Menunggu suara');
      };

      recognition.onresult = (event: any) => {
        if (isTransitioningRef.current || isCompletedAyahRef.current) return;

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
        if (event.error === 'no-speech') {
          setLiveStatusText('...Menunggu suara');
        } else {
          console.warn('Speech recognition status:', event.error);
        }
      };

      recognition.onend = () => {
        // Otomatis restart hanya jika user masih mode mendengarkan dan tidak sedang transisi
        if (isLiveListeningRef.current && !isTransitioningRef.current && !isCompletedAyahRef.current) {
          try {
            recognition.start();
          } catch {
            setIsLiveListening(false);
            isLiveListeningRef.current = false;
          }
        } else if (!isLiveListeningRef.current) {
          setIsLiveListening(false);
          isLiveListeningRef.current = false;
          setLiveStatusText('Tekan mikrofon untuk melafalkan');
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
      } catch {
        // ignore
      }
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

  // Reset aktifitas ayat ini
  const handleResetActiveAyah = () => {
    revealedWordsRef.current = new Set();
    setRevealedWordIndices(new Set());
    setIsCompletedAyah(false);
    isCompletedAyahRef.current = false;
    setLiveTranscript('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (qariAudioRef.current) {
        try {
          qariAudioRef.current.pause();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Filter surahs untuk modal pemilih surat
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

  const surahArabicName = SURAH_ARABIC_NAMES[currentSurah.number] || currentSurah.name;

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-28 font-sans select-none">
      {/* 1. TOP HEADER (Persis screenshot: ≡  [Al-Fatihah | Hal 1 | Juz 1 | Hizb 1  🔖]  🔍 ⚙) */}
      <header className="flex items-center justify-between gap-2 px-1 py-1">
        {/* Tombol Menu / Buka Daftar Surah */}
        <button
          type="button"
          onClick={() => setIsSurahModalOpen(true)}
          className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          title="Pilih Surah"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center Pill: Kartu Surat & Info Halaman / Juz / Hizb (Klik untuk memilih surah) */}
        <button
          type="button"
          onClick={() => setIsSurahModalOpen(true)}
          className="flex-1 max-w-sm bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 rounded-2xl px-4 py-1.5 transition-all cursor-pointer flex items-center justify-between shadow-2xs"
          title="Klik untuk mengganti surah"
        >
          <div className="text-left">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
              {currentSurah.name}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Halaman {activeAyahPage} | Juz {activeAyahJuz} | Hizb {activeAyahHizb}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
            }}
            className="p-1 text-slate-400 hover:text-amber-600 transition"
            title={isBookmarked ? 'Tersimpan di Bookmark' : 'Tandai Halaman'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>
        </button>

        {/* Action Buttons: Search & Settings */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsSurahModalOpen(true)}
            className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Cari Surah"
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

      {/* 2. MUSHAF PAGE CONTAINER (Persis screenshot: bingkai ornamen surah & lembaran mushaf uthmani) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col min-h-[580px] p-4 sm:p-8">
        {/* Frame Ornamen Judul Surah Klasik (Persis seperti screenshot pengguna) */}
        <div className="relative mx-auto w-full max-w-lg my-2 px-6 py-3 rounded-2xl border-2 border-slate-900 bg-amber-50/15 text-center select-none shadow-xs">
          {/* Ornamen Sudut Arabesque */}
          <span className="absolute top-1.5 left-2.5 text-xs text-slate-800 font-serif">۞</span>
          <span className="absolute top-1.5 right-2.5 text-xs text-slate-800 font-serif">۞</span>
          <span className="absolute bottom-1.5 left-2.5 text-xs text-slate-800 font-serif">۞</span>
          <span className="absolute bottom-1.5 right-2.5 text-xs text-slate-800 font-serif">۞</span>

          <h2 className="font-quran text-2xl sm:text-3xl font-bold text-slate-900 tracking-wide" dir="rtl">
            سُورَةُ {surahArabicName}
          </h2>
          <p className="text-[10px] font-sans text-slate-500 uppercase tracking-widest mt-0.5">
            {currentSurah.name} • {currentSurah.ayahs.length} Ayat
          </p>
        </div>

        {/* Basmalah (Ditampilkan untuk seluruh surat kecuali At-Taubah no 9) */}
        {currentSurah.number !== 9 && (
          <div className="text-center py-2 select-none">
            <p className="font-quran text-2xl sm:text-3xl text-slate-800 tracking-wide" dir="rtl">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </p>
          </div>
        )}

        {/* Mushaf Body: Aliran Teks Ayat & Mode Hafalan Bertingkat */}
        <div className="flex-1 py-4 sm:py-6 px-1 text-right leading-loose select-none" dir="rtl">
          <div className="space-y-4">
            {currentSurah.ayahs.map((ayah, aIdx) => {
              const isCurrent = aIdx === activeAyahIndex;
              const isPast = aIdx < activeAyahIndex;

              return (
                <div
                  key={ayah.ayahNumber}
                  onClick={() => setActiveAyahIndex(aIdx)}
                  className={`inline transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-50/50 rounded-xl py-1 px-1.5 ring-1 ring-emerald-200/50'
                      : ''
                  }`}
                >
                  {ayah.words.map((w, wIdx) => {
                    // Level 1: Teks Lengkap (semua terlihat)
                    // Level 2: Sebagian Samar (kata genap tertutup garis)
                    // Level 3: Ghaib Penuh (semua kata tertutup garis tipis halus, persis screenshot!)
                    let isWordRevealed = false;
                    if (isPast) {
                      isWordRevealed = true;
                    } else if (memorizationLevel === 1) {
                      isWordRevealed = true;
                    } else if (memorizationLevel === 2) {
                      isWordRevealed = wIdx % 2 === 0 || (isCurrent && revealedWordIndices.has(wIdx));
                    } else {
                      // Level 3 (Ghaib Penuh)
                      isWordRevealed = isCurrent && revealedWordIndices.has(wIdx);
                    }

                    if (isWordRevealed) {
                      return (
                        <span
                          key={wIdx}
                          className={`inline-block mx-1 font-quran text-2xl sm:text-3xl leading-relaxed transition-colors duration-200 ${
                            isCurrent && revealedWordIndices.has(wIdx)
                              ? 'text-emerald-700 font-semibold'
                              : 'text-slate-800'
                          }`}
                        >
                          {w.raw}
                        </span>
                      );
                    }

                    // Tampilan kata tersembunyi (garis halus tipis elegan di atas baseline, persis screenshot!)
                    return (
                      <span
                        key={wIdx}
                        className="inline-block mx-1.5 align-middle border-b-2 border-slate-300 w-10 sm:w-14 h-6 transition-all"
                        title="Kata tersembunyi (lafalkan untuk membuka)"
                      />
                    );
                  })}

                  {/* Ornamen Nomor Ayat ۝ dengan angka Arab Uthmani */}
                  <span className="inline-flex items-center justify-center font-quran text-lg w-8 h-8 rounded-full border border-slate-300 text-slate-800 mx-2 align-middle select-none bg-slate-50/50 shadow-2xs">
                    ۝{toArabicDigits(ayah.ayahNumber)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Terjemahan & Latin jika Mode Teks Detail Aktif */}
          {viewMode === 'detailed' && activeAyah && (
            <div className="mt-8 pt-4 border-t border-slate-100 text-left font-sans" dir="ltr">
              <p className="text-xs font-semibold text-emerald-800">{activeAyah.textLatin}</p>
              <p className="text-xs text-slate-500 italic mt-0.5">{activeAyah.translation}</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. FLOATING BOTTOM ACTION BAR (Persis screenshot: [Kesalahan]  [📖] [👁️] [<] [<<]  + [MIC HIJAU GLOWING]) */}
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

          {/* TENGAH: Dock Navigasi & Mode Tampilan */}
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-full px-2 py-1 shadow-md">
            {/* Toggle Mode Tampilan Mushaf vs Detail */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'mushaf' ? 'detailed' : 'mushaf')}
              className={`p-2.5 rounded-full transition cursor-pointer ${
                viewMode === 'detailed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={viewMode === 'mushaf' ? 'Buka Terjemahan' : 'Tutup Terjemahan (Tampilan Mushaf)'}
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Toggle Mode Hafalan Bertingkat (1: Lengkap -> 2: Samar -> 3: Ghaib) */}
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

            {/* Dengarkan Lafal Qari Resmi */}
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

            {/* Ulangi Ayat Ini */}
            <button
              type="button"
              onClick={handleResetActiveAyah}
              className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              title="Ulangi Ayat Ini"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Ayat Sebelumnya (<) */}
            <button
              type="button"
              disabled={activeAyahIndex === 0}
              onClick={() => setActiveAyahIndex((prev) => Math.max(0, prev - 1))}
              className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
              title="Ayat Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Ayat Selanjutnya (>) */}
            <button
              type="button"
              disabled={activeAyahIndex >= currentSurah.ayahs.length - 1}
              onClick={() => setActiveAyahIndex((prev) => Math.min(currentSurah.ayahs.length - 1, prev + 1))}
              className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
              title="Ayat Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Kembali ke Awal Surah (<<) */}
            <button
              type="button"
              disabled={activeAyahIndex === 0}
              onClick={() => setActiveAyahIndex(0)}
              className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
              title="Kembali ke Ayat 1"
            >
              <ChevronsLeft className="w-4 h-4" />
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

      {/* 4. MODAL PEMILIH SURAT (Direct Surah Selector) */}
      {isSurahModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Pilih Surah Al-Qur'an</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSurahModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input Filter */}
            <div className="p-3 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={surahSearchQuery}
                  onChange={(e) => setSurahSearchQuery(e.target.value)}
                  placeholder="Cari nama surah (contoh: Al-Baqarah, Yasin, 36)..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  autoFocus
                />
              </div>
            </div>

            {/* List 114 Surahs */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredSurahs.map((s) => {
                const isSelected = s.number === currentSurah.number;
                return (
                  <button
                    key={s.number}
                    type="button"
                    onClick={() => {
                      setSelectedSurahNumber(s.number);
                      setIsSurahModalOpen(false);
                      setSurahSearchQuery('');
                    }}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold font-sans">
                        {s.number}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{s.nameLatin}</p>
                        <p className="text-xs text-slate-500">
                          {s.translation} • {s.numberOfAyahs} Ayat • {s.revelationType}
                        </p>
                      </div>
                    </div>
                    <span className="font-quran text-xl text-slate-800" dir="rtl">
                      {s.nameArabic}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL PENGATURAN HAFALAN & CATAT MUTABAAH */}
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

            {/* Info Antrean SRS */}
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

      {/* 6. MODAL SIMPAN SESI MUTABAAH YAUMI */}
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
