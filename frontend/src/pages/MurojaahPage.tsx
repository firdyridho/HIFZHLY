import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  FileText,
  Loader2
} from 'lucide-react';
import type { SrsDueItem, SurahSummary } from '../types';
import { recordMurojaahSingleAyah, recordMutabaahReport } from '../lib/mutabaahService';
import { calculateAyahPage, getJuzFromPage, SURAH_START_PAGES } from '../lib/quranMeta';
import ExitMutabaahModal, { ExitMutabaahPayload } from '../components/mutabaah/ExitMutabaahModal';
import { playDengSound } from '../lib/soundUtils';

export interface AyahWord {
  raw: string;       // Lafal asli berharakat lengkap (contoh: ذَٰلِكَ)
  clean: string;     // Teks Arab tanpa harakat untuk pencocokan (contoh: ذلك)
}

export interface MushafAyah {
  ayahNumber: number;
  textArabic: string;
  textLatin: string;
  translation: string;
  audioUrl: string;
  words: AyahWord[];
}

export interface PageWordToken {
  key: string;               // e.g. "1:1_1"
  verseKey: string;          // e.g. "1:1"
  position: number;
  lineNumber: number;
  textUthmani: string;
  textTajweed?: string;
  clean: string;
  surahNumber: number;
  ayahNumber: number;
}

// Helper normalisasi teks Arab untuk pencocokan suara
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\u0621-\u064A\s]/g, '')
    .trim();
}

export function parseAyahWords(textArabic: string): AyahWord[] {
  const tokens = textArabic.trim().split(/\s+/);
  return tokens.map((token) => ({
    raw: token,
    clean: normalizeArabic(token),
  }));
}

// Menemukan nomor surah dari nomor halaman Mushaf Madinah
export function getSurahFromPage(page: number): number {
  if (page <= 1) return 1;
  if (page >= 604) return 114;
  for (let s = 114; s >= 1; s--) {
    if (page >= (SURAH_START_PAGES[s] || 1)) {
      return s;
    }
  }
  return 1;
}

// Tajweed HTML Formatter
export function formatTajweedHtml(rawHtml: string, stripEndBadge = false): string {
  if (!rawHtml) return '';
  let res = rawHtml
    .replace(/<(?:tajweed|rule) class=([a-z_]+)>/g, '<span class="tajweed-$1" data-rule="$1">')
    .replace(/<\/(?:tajweed|rule)>/g, '</span>');

  if (stripEndBadge) {
    res = res.replace(/<span class=end>(.*?)<\/span>/g, '');
  } else {
    res = res.replace(
      /<span class=end>(.*?)<\/span>/g,
      '<span class="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 mx-0.5 rounded-full border border-amber-600/70 bg-amber-50/90 text-[10px] sm:text-xs font-sans font-bold text-amber-900 shadow-2xs select-none">$1</span>'
    );
  }
  return res;
}

// Ubah suara user menjadi teks Arab berharakat sesuai ayat Al-Qur'an
export function getSpokenArabicWithHarakat(spokenText: string, words: { raw: string; clean: string }[]): string {
  if (!spokenText || !spokenText.trim() || !words || words.length === 0) {
    return '';
  }

  const spokenTokens = normalizeArabic(spokenText).split(/\s+/).filter(Boolean);
  if (spokenTokens.length === 0) {
    return '';
  }

  const resultWords: string[] = [];
  spokenTokens.forEach((token) => {
    const matched = words.find((w) => {
      if (w.clean === token) return true;
      if (token.startsWith('و') && token.slice(1) === w.clean) return true;
      if (token.startsWith('ف') && token.slice(1) === w.clean) return true;
      if (token.startsWith('ب') && token.slice(1) === w.clean) return true;
      if (token.startsWith('ل') && token.slice(1) === w.clean) return true;
      if (w.clean.startsWith(token) && token.length >= 3) return true;
      return false;
    });

    if (matched) {
      resultWords.push(matched.raw);
    } else {
      resultWords.push(token);
    }
  });

  return resultWords.join(' ');
}

// Data fallback Al-Baqarah & An-Naba'
export const DEFAULT_SURAHS: { number: number; name: string; page: number; juz: number; ayahs: MushafAyah[] }[] = [
  {
    number: 2,
    name: 'Al-Baqarah',
    page: 2,
    juz: 1,
    ayahs: [
      {
        ayahNumber: 1,
        textArabic: 'الٓمٓ',
        textLatin: 'Alif Laam Miim',
        translation: 'Alif Lam Mim.',
        audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/002001.mp3',
        words: parseAyahWords('الٓمٓ'),
      },
      {
        ayahNumber: 2,
        textArabic: 'ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًۭى لِّلْمُتَّقِينَ',
        textLatin: "Dzaalikal-kitaabu laa rayba fiih, hudal lil-muttaqiin",
        translation: 'Kitab (Al-Qur\'an) ini tidak ada keraguan padanya; petunjuk bagi mereka yang bertakwa,',
        audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/002002.mp3',
        words: parseAyahWords('ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًۭى لِّلْمُتَّقِينَ'),
      },
      {
        ayahNumber: 3,
        textArabic: 'ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَـٰهُمْ يُنفِقُونَ',
        textLatin: "Alladziina yu'minuuna bil-ghaybi wa yuqiimuunash-shalaata wa mimmaa razaqnaahum yunfiquun",
        translation: '(yaitu) mereka yang beriman kepada yang gaib, melaksanakan salat, dan menginfakkan sebagian rezeki yang Kami berikan kepada mereka,',
        audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/002003.mp3',
        words: parseAyahWords('ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَـٰهُمْ يُنفِقُونَ'),
      },
      {
        ayahNumber: 4,
        textArabic: 'وَٱلَّذِينَ يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ مِن قَبْلِكَ وَبِٱلْـَٔاخِرَةِ هُمْ يُوقِنُونَ',
        textLatin: "Walladziina yu'minuuna bimaa unzila ilayka wa maa unzila min qablika wa bil-aakhirati hum yuuqinuun",
        translation: 'dan mereka yang beriman kepada (Al-Qur\'an) yang diturunkan kepadamu dan (kitab-kitab) yang telah diturunkan sebelum engkau, serta mereka yakin akan adanya akhirat.',
        audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/002004.mp3',
        words: parseAyahWords('وَٱلَّذِينَ يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ مِن قَبْلِكَ وَبِٱلْـَٔاخِرَةِ هُمْ يُوقِنُونَ'),
      },
      {
        ayahNumber: 5,
        textArabic: 'أُو۟لَـٰٓئِكَ عَلَىٰ هُدًۭى مِّن رَّبِّهِمْ ۖ وَأُو۟لَـٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ',
        textLatin: "Ulaa'ika 'alaa hudam mir rabbihim wa ulaa'ika humul-muflihuun",
        translation: 'Merekalah yang mendapat petunjuk dari Tuhannya, dan mereka itulah orang-orang yang beruntung.',
        audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/002005.mp3',
        words: parseAyahWords('أُو۟لَـٰٓئِكَ عَلَىٰ هُدًۭى مِّن رَّبِّهِمْ ۖ وَأُو۟لَـٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ'),
      },
    ],
  },
  {
    number: 78,
    name: "An-Naba'",
    page: 582,
    juz: 30,
    ayahs: [
      {
        ayahNumber: 1,
        textArabic: 'عَمَّ يَتَسَآءَلُونَ',
        textLatin: "'Amma yatasaa'aluun",
        translation: 'Tentang apakah mereka saling bertanya-tanya?',
        audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/078001.mp3',
        words: parseAyahWords('عَمَّ يَتَسَآءَلُونَ'),
      },
      {
        ayahNumber: 2,
        textArabic: 'عَنِ النَّبَإِ الْعَظِيمِ',
        textLatin: "'Anin-naba'il-'azhiim",
        translation: 'Tentang berita yang besar (hari berbangkit),',
        audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/078002.mp3',
        words: parseAyahWords('عَنِ النَّبَإِ الْعَظِيمِ'),
      },
      {
        ayahNumber: 3,
        textArabic: 'الَّذِي هُمْ فِيهِ مُخْتَلِفُونَ',
        textLatin: 'Alladzii hum fiihi mukhtalifuun',
        translation: 'yang dalam hal itu mereka berselisih.',
        audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/078003.mp3',
        words: parseAyahWords('الَّذِي هُمْ فِيهِ مُخْتَلِفُونَ'),
      },
    ],
  },
];

export default function MurojaahPage() {
  const [searchParams] = useSearchParams();

  // Mode Tampilan: Mode Ayat (fokus card per ayat) vs Mode Halaman Mushaf (tampilan 15 baris perhalaman seperti Al-Qur'an)
  const initialMode = searchParams.get('mode') === 'mushaf' ? 'mushaf' : 'ayah';
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialSurah = Number(searchParams.get('surah')) || 1;

  const [viewMode, setViewMode] = useState<'ayah' | 'mushaf'>(initialMode);
  const [currentMushafPage, setCurrentMushafPage] = useState<number>(initialPage);

  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(initialSurah);
  const [currentSurah, setCurrentSurah] = useState<{ number: number; name: string; page: number; juz: number; ayahs: MushafAyah[] }>(DEFAULT_SURAHS[0]);

  const [activeAyahIndex, setActiveAyahIndex] = useState(0);
  const activeAyah = currentSurah.ayahs[activeAyahIndex] || currentSurah.ayahs[0];

  // Dynamic Madinah Mushaf Page & Juz calculation for active ayah
  const activeAyahPage = calculateAyahPage(
    currentSurah.number,
    activeAyah ? activeAyah.ayahNumber : 1,
    currentSurah.ayahs ? currentSurah.ayahs.length : 1
  );
  const activeAyahJuz = getJuzFromPage(viewMode === 'mushaf' ? currentMushafPage : activeAyahPage);

  // Mushaf 15 Baris Page Data State
  const [pageVerses, setPageVerses] = useState<any[]>([]);
  const [loadingPage, setLoadingPage] = useState<boolean>(false);
  const pageCacheRef = useRef<Record<number, any[]>>({});

  // Mode Ghaib: kata tertutup '...' vs terbuka semua
  const [isBlindMode, setIsBlindMode] = useState(false);

  // Kata yang sudah berhasil dibuka/dilafalkan benar pada ayat aktif (Mode Ayat)
  const [revealedWordIndices, setRevealedWordIndices] = useState<Set<number>>(new Set());

  // Kata yang sudah berhasil dibuka/dilafalkan benar pada lembaran mushaf aktif (Mode Mushaf)
  const [revealedWordKeys, setRevealedWordKeys] = useState<Set<string>>(new Set());

  // Indeks kata yang salah diucapkan
  const [wrongWordIndex, setWrongWordIndex] = useState<number | null>(null);
  const [wrongWordKey, setWrongWordKey] = useState<string | null>(null);
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
  const revealedWordKeysRef = useRef<Set<string>>(new Set());
  const isLiveListeningRef = useRef<boolean>(false);
  const lastMistakeSoundTimeRef = useRef<number>(0);
  const [isAyahShaking, setIsAyahShaking] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const viewModeRef = useRef<'ayah' | 'mushaf'>(viewMode);

  // Sintesis audio feedback nada bass rendah "deng" (ala Netflix/Duolingo)
  const playDengErrorSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Frekuensi bass hangat 125Hz turun ke 55Hz
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(125, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {}
  };

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
    viewModeRef.current = viewMode;
  }, [viewMode]);

  useEffect(() => {
    revealedWordsRef.current = revealedWordIndices;
  }, [revealedWordIndices]);

  useEffect(() => {
    revealedWordKeysRef.current = revealedWordKeys;
  }, [revealedWordKeys]);

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
      score: 98.0,
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

  // Fetch Real Surah Ayahs from Backend API (Mode Ayat)
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

  // Fetch Madinah Mushaf Page Verses (Mode Mushaf 1-604 Halaman)
  useEffect(() => {
    if (viewMode !== 'mushaf' && !searchParams.get('page')) return;

    if (pageCacheRef.current[currentMushafPage]) {
      setPageVerses(pageCacheRef.current[currentMushafPage]);
      return;
    }

    setLoadingPage(true);
    fetch(
      `https://api.quran.com/api/v4/verses/by_page/${currentMushafPage}?words=true&word_fields=text_uthmani,line_number,char_type_name,text_uthmani_tajweed&translations=33&fields=chapter_id,page_number,juz_number`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.verses) {
          pageCacheRef.current[currentMushafPage] = data.verses;
          setPageVerses(data.verses);
        }
      })
      .catch((err) => {
        console.warn('Gagal memuat ayat halaman mushaf dari API:', err);
      })
      .finally(() => setLoadingPage(false));
  }, [currentMushafPage, viewMode, searchParams]);

  // Hitung 15 Baris Presisi Mushaf Madinah
  const pageLines = useMemo(() => {
    const linesMap: Record<number, any[]> = {};
    pageVerses.forEach((verse: any) => {
      const parts = verse.verse_key?.split(':') || [];
      const surahNum = parseInt(parts[0], 10);
      const ayahNum = parseInt(parts[1], 10);
      const sPad = String(surahNum).padStart(3, '0');
      const aPad = String(ayahNum).padStart(3, '0');
      const surahName = surahs.find((s) => s.number === surahNum)?.nameLatin || `Surah ${surahNum}`;

      const ayahObj = {
        ...verse,
        surahNumber: surahNum,
        surahName: surahName,
        ayahNumber: ayahNum,
        audioUrl: `https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/${sPad}${aPad}.mp3`,
      };

      if (verse.words && Array.isArray(verse.words)) {
        verse.words.forEach((w: any) => {
          const lineNum = w.line_number || 1;
          if (!linesMap[lineNum]) linesMap[lineNum] = [];
          linesMap[lineNum].push({
            ...w,
            ayahObj,
          });
        });
      }
    });
    return linesMap;
  }, [pageVerses, surahs]);

  // Daftar kata pada lembaran mushaf aktif
  const allPageWords = useMemo<PageWordToken[]>(() => {
    const list: PageWordToken[] = [];
    pageVerses.forEach((verse: any) => {
      const parts = verse.verse_key?.split(':') || [];
      const surahNum = parseInt(parts[0], 10);
      const ayahNum = parseInt(parts[1], 10);
      if (verse.words && Array.isArray(verse.words)) {
        verse.words.forEach((w: any) => {
          if (w.char_type_name === 'word') {
            list.push({
              key: `${w.verse_key}_${w.position}`,
              verseKey: w.verse_key,
              position: w.position,
              lineNumber: w.line_number || 1,
              textUthmani: w.text_uthmani,
              textTajweed: w.text_uthmani_tajweed,
              clean: normalizeArabic(w.text_uthmani),
              surahNumber: surahNum,
              ayahNumber: ayahNum,
            });
          }
        });
      }
    });
    return list;
  }, [pageVerses]);

  // Kepala Surat pada baris awal
  const surahsStartingByLine = useMemo(() => {
    const map: Record<number, SurahSummary> = {};
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

  const currentMushafSurahName = useMemo(() => {
    if (pageVerses.length > 0 && pageVerses[0].chapter_id) {
      const s = surahs.find((item) => item.number === pageVerses[0].chapter_id);
      if (s) return s.nameLatin;
    }
    return currentSurah.name;
  }, [pageVerses, surahs, currentSurah]);

  // Reset status kata saat ganti ayat atau ganti halaman
  useEffect(() => {
    if (pendingErrorTimerRef.current) {
      clearTimeout(pendingErrorTimerRef.current);
      pendingErrorTimerRef.current = null;
    }
    revealedWordsRef.current = new Set();
    revealedWordKeysRef.current = new Set();
    setRevealedWordIndices(new Set());
    setRevealedWordKeys(new Set());
    setWrongWordIndex(null);
    setWrongWordKey(null);
    setIsCompletedAyah(false);
    isCompletedAyahRef.current = false;
    isTransitioningRef.current = false;
    setLiveTranscript('');
  }, [activeAyahIndex, selectedSurahNumber, currentMushafPage, viewMode]);

  // Navigasi halaman Mushaf Madinah
  const handleMushafPageChange = (newPage: number) => {
    if (newPage < 1 || newPage > 604) return;
    setCurrentMushafPage(newPage);
    setWrongWordKey(null);

    const targetSurah = getSurahFromPage(newPage);
    if (targetSurah !== selectedSurahNumber) {
      setSelectedSurahNumber(targetSurah);
      setActiveAyahIndex(0);
    }
  };

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
    setScoreNotification(`Alhamdulillah! Ayat ${ayah.ayahNumber} Mutqin (Skor 100%)`);

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
    } catch { }

    setTimeout(() => {
      setScoreNotification(null);
      isTransitioningRef.current = false;
      if (activeAyahIndexRef.current < currentSurahRef.current.ayahs.length - 1) {
        setActiveAyahIndex((prev) => prev + 1);
      }
    }, 1800);
  };

  // User klik kata yang kosong/mentok di Mode Ayat -> Buka perkata saja
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

  // User klik kata yang kosong/mentok di Mode Mushaf -> Buka perkata saja
  const handleRevealSingleWordByKey = (wordKey: string) => {
    if (pendingErrorTimerRef.current) {
      clearTimeout(pendingErrorTimerRef.current);
      pendingErrorTimerRef.current = null;
    }

    setRevealedWordKeys((prev) => {
      const next = new Set(prev);
      next.add(wordKey);
      if (wrongWordKey === wordKey) {
        setWrongWordKey(null);
      }
      return next;
    });
  };

  // Algoritma Pencocokan Real-time Kata Suara vs Ayat (Dengan jeda validasi dan cooldown suara 'deng')
  const processSpokenArabic = (spokenText: string) => {
    if (!spokenText || isCompletedAyahRef.current || isTransitioningRef.current) return;

    const normalizedSpoken = normalizeArabic(spokenText);
    const spokenTokens = normalizedSpoken.split(/\s+/).filter(Boolean);
    if (spokenTokens.length === 0) return;
    const latestToken = spokenTokens[spokenTokens.length - 1];

    if (viewModeRef.current === 'mushaf') {
      // PENCETAKAN DI MODE MUSHAF: Menilai kata per kata pada 15 baris halaman
      if (allPageWords.length === 0) return;
      const currentRevealed = revealedWordKeysRef.current;

      let targetWord: PageWordToken | null = null;
      for (const w of allPageWords) {
        if (!currentRevealed.has(w.key)) {
          targetWord = w;
          break;
        }
      }
      if (!targetWord) return;

      const isMatched =
        latestToken === targetWord.clean ||
        (latestToken.startsWith('و') && latestToken.slice(1) === targetWord.clean) ||
        (latestToken.startsWith('ف') && latestToken.slice(1) === targetWord.clean) ||
        (latestToken.startsWith('ب') && latestToken.slice(1) === targetWord.clean) ||
        (latestToken.startsWith('ل') && latestToken.slice(1) === targetWord.clean) ||
        (targetWord.clean.startsWith(latestToken) && latestToken.length >= 3) ||
        (latestToken.startsWith(targetWord.clean) && targetWord.clean.length >= 3);

      if (isMatched) {
        if (pendingErrorTimerRef.current) {
          clearTimeout(pendingErrorTimerRef.current);
          pendingErrorTimerRef.current = null;
        }
        setWrongWordKey(null);
        setRevealedWordKeys((prev) => {
          const next = new Set(prev);
          next.add(targetWord!.key);

          // Cek apakah seluruh ayat pada halaman ini selesai
          const ayahWords = allPageWords.filter((x) => x.verseKey === targetWord!.verseKey);
          const ayahDone = ayahWords.every((x) => next.has(x.key));
          if (ayahDone) {
            setScoreNotification(`Alhamdulillah! Ayat ${targetWord!.ayahNumber} Mutqin (100%)`);
            recordMurojaahSingleAyah(
              targetWord!.surahNumber,
              surahs.find((s) => s.number === targetWord!.surahNumber)?.nameLatin || `Surah ${targetWord!.surahNumber}`,
              targetWord!.ayahNumber,
              100
            );
            setTimeout(() => setScoreNotification(null), 2500);
          }

          // Cek apakah seluruh halaman selesai
          if (next.size === allPageWords.length) {
            setScoreNotification(`Maa Syaa Allah! Halaman ${currentMushafPage} Selesai & Mutqin (100%)`);
            setTimeout(() => {
              setScoreNotification(null);
              if (currentMushafPage < 604) {
                handleMushafPageChange(currentMushafPage + 1);
              }
            }, 2200);
          }
          return next;
        });
      } else {
        if (latestToken.length >= 2) {
          if (!pendingErrorTimerRef.current) {
            pendingErrorTimerRef.current = setTimeout(() => {
              const now = Date.now();
              if (now - lastErrorSoundTimeRef.current >= 2800) {
                setWrongWordKey(targetWord!.key);
                setShakeIteration((prev) => prev + 1);
                playDengSound();
                lastErrorSoundTimeRef.current = now;
              }
              pendingErrorTimerRef.current = null;
            }, 1600);
          }
        }
      }
    } else {
      // PENCETAKAN DI MODE AYAT: Menilai kata per kata pada ayat aktif
      const currentTargetAyah = activeAyahRef.current;
      if (!currentTargetAyah || !currentTargetAyah.words) return;

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

      const isMatched =
        latestToken === targetWord.clean ||
        (latestToken.startsWith('و') && latestToken.slice(1) === targetWord.clean) ||
        (latestToken.startsWith('ف') && latestToken.slice(1) === targetWord.clean) ||
        (latestToken.startsWith('ب') && latestToken.slice(1) === targetWord.clean) ||
        (latestToken.startsWith('ل') && latestToken.slice(1) === targetWord.clean) ||
        (targetWord.clean.startsWith(latestToken) && latestToken.length >= 3) ||
        (latestToken.startsWith(targetWord.clean) && targetWord.clean.length >= 3);

      if (isMatched) {
        if (pendingErrorTimerRef.current) {
          clearTimeout(pendingErrorTimerRef.current);
          pendingErrorTimerRef.current = null;
        }

        advanceToNextAyah(curIdx, currentVerses);
      }
    } else if (spokenTokens.length >= 3 && !isTransitioningRef.current && Date.now() - lastAyahTransitionTimeRef.current > 2000) {
      // Rekam kesalahan hanya bila kata yang diucapkan sama sekali tidak cocok dengan kata target ayat aktif
      const curAyahWords = targetWords.map((w) => w.clean);
      const isAnyMatch = spokenTokens.some((st) => curAyahWords.some((cw) => isArabicWordMatch(cw, st, false)));
      if (!isAnyMatch && targetVerse) {
        setMistakesCount((prev) => prev + 1);

        // Berikan jeda wajar (3.5s) agar audio "deng" & getar tidak keseringan berbunyi saat jeda nafas
        const now = Date.now();
        if (now - lastMistakeSoundTimeRef.current > 3500) {
          lastMistakeSoundTimeRef.current = now;
          playDengErrorSound();
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([60, 30, 60]);
          }
          setIsAyahShaking(true);
          setTimeout(() => setIsAyahShaking(false), 800);
        }

        setMistakesList((prev) => {
          if (
            prev.length > 0 &&
            prev[prev.length - 1].verseKey === targetVerse.verse_key &&
            Date.now() - new Date(prev[prev.length - 1].timestamp).getTime() < 4000
          ) {
            return prev;
          }
          return next;
        });
      } else {
        if (latestToken.length >= 2) {
          if (!pendingErrorTimerRef.current) {
            pendingErrorTimerRef.current = setTimeout(() => {
              const now = Date.now();
              if (now - lastErrorSoundTimeRef.current >= 2800) {
                setWrongWordIndex(targetIndex);
                setShakeIteration((prev) => prev + 1);
                playDengSound();
                lastErrorSoundTimeRef.current = now;
              }
              pendingErrorTimerRef.current = null;
            }, 1600);
          }
        }
      }
    }
  };

  /**
   * Pindah ke Ayat Berikutnya secara Otomatis dan Mulus
   */
  const advanceToNextAyah = (currentIdx: number, verses: any[]) => {
    if (!verses || verses.length === 0) return;
    // Kunci transisi dan catat timestamp agar sisa buffer suara ayat sebelumnya tidak bocor ke ayat baru
    isTransitioningRef.current = true;
    lastAyahTransitionTimeRef.current = Date.now();
    setLiveTranscript('');
    setLiveStatusText('...Menunggu suara');
    setShowHelp(false);

    const nextIdx = currentIdx + 1;
    if (nextIdx < verses.length) {
      setActiveVerseIndex(nextIdx);
      activeVerseIndexRef.current = nextIdx;
      // Berikan masa tenggang 1.5 detik agar mesin suara mulai mengevaluasi ayat baru dari kondisi bersih
      setTimeout(() => {
        isTransitioningRef.current = false;
        setLiveTranscript('');
      }, 1500);
    } else {
      isTransitioningRef.current = true;
      recordMurojaahSingleAyah(currentSurahMeta.number, currentSurahMeta.nameLatin, 1, 100);

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

  // Start / Stop Live Listening (Web Speech API)
  const startLiveListening = async () => {
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
      } catch { }
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

    const audioUrl =
      viewMode === 'mushaf' && pageVerses[0]
        ? `https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/${String(pageVerses[0].chapter_id || 1).padStart(3, '0')}001.mp3`
        : activeAyah.audioUrl;

    const audio = new Audio(audioUrl);
    qariAudioRef.current = audio;
    audio.play();
    setIsPlayingQari(true);

    audio.onended = () => setIsPlayingQari(false);
    audio.onerror = () => setIsPlayingQari(false);
  };

  // Simulasi testing: Buka kata perkata
  const handleSimulateWordReveal = () => {
    if (viewMode === 'mushaf') {
      for (const w of allPageWords) {
        if (!revealedWordKeys.has(w.key)) {
          handleRevealSingleWordByKey(w.key);
          break;
        }
      }
    } else {
      for (let i = 0; i < activeAyah.words.length; i++) {
        if (!revealedWordIndices.has(i)) {
          handleRevealSingleWord(i);
          break;
        }
      }
    }
  };

  // Simulasi testing: Uji salah kata
  const handleSimulateWordError = () => {
    if (viewMode === 'mushaf') {
      for (const w of allPageWords) {
        if (!revealedWordKeys.has(w.key)) {
          setWrongWordKey(w.key);
          setShakeIteration((prev) => prev + 1);
          playDengSound();
          break;
        }
      }
    } else {
      for (let i = 0; i < activeAyah.words.length; i++) {
        if (!revealedWordIndices.has(i)) {
          setWrongWordIndex(i);
          setShakeIteration((prev) => prev + 1);
          playDengSound();
          break;
        }
      }
    }
  };

  // Daftar kata aktif untuk translasi audio kotak deteksi suara bawah
  const currentListeningWords = useMemo(() => {
    if (viewMode === 'mushaf') {
      return allPageWords.map((w) => ({ raw: w.textUthmani, clean: w.clean }));
    }
    return activeAyah.words;
  }, [viewMode, allPageWords, activeAyah]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-36 font-sans">
      {/* Tajweed CSS Rule Highlighting */}
      <style>{`
        .tajweed-ham_wasl, .tajweed-laam_shamsiyah, .tajweed-slnt { color: #94A3B8; }
        .tajweed-ghunnah { color: #D97706; font-weight: 700; }
        .tajweed-idgham_ghunnah { color: #059669; font-weight: 700; }
        .tajweed-idgham_wo_ghunnah { color: #64748B; }
        .tajweed-iqlab { color: #0284C7; font-weight: 700; }
        .tajweed-ikhafa, .tajweed-ikhafa_shafawi { color: #2563EB; font-weight: 700; }
        .tajweed-idgham_shafawi { color: #0D9488; font-weight: 700; }
        .tajweed-qalaqah { color: #06B6D4; font-weight: 700; }
        .tajweed-madda_normal { color: #DC2626; font-weight: 600; }
        .tajweed-madda_permissible { color: #E11D48; font-weight: 700; }
        .tajweed-madda_necessary { color: #7C3AED; font-weight: 700; }
        .tajweed-madda_obligatory { color: #991B1B; font-weight: 700; }
      `}</style>

      {/* Toast Notifikasi Keberhasilan Ayat */}
      {scoreNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-400 text-sm font-semibold animate-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{scoreNotification}</span>
        </div>
      )}

      {/* Top Bar: Pemilihan Surah, Mode Switcher & Tombol Selesai */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Pemilihan Surah */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-700" />
            <select
              value={selectedSurahNumber}
              onChange={(e) => {
                const sNum = Number(e.target.value);
                setSelectedSurahNumber(sNum);
                setActiveAyahIndex(0);
                if (viewMode === 'mushaf') {
                  setCurrentMushafPage(SURAH_START_PAGES[sNum] || 1);
                }
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
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
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${viewMode === 'ayah'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Mode Ayat</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mushaf')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${viewMode === 'mushaf'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Halaman Mushaf</span>
            </button>
          </div>
        </div>

        {/* Tombol Selesai Murojaah & Catat Mutabaah */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleOpenExitModal}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
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
            <strong>{dueAyahs.length} Ayat</strong> terjadwal di SRS hari ini {isLoadingSrs ? '...' : ''}
          </span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* KONTEN UTAMA: MODE MUSHAF 15 BARIS (SESUAI GAMBAR) vs MODE AYAT      */}
      {/* ==================================================================== */}
      {viewMode === 'mushaf' ? (
        /* ==================================================================== */
        /* MODE MUSHAF: PERSIS SEPERTI FITUR AL-QUR'AN (STANDAR MADINAH 15 BARIS)*/
        /* ==================================================================== */
        <div className="w-full max-w-[580px] sm:max-w-[620px] mx-auto py-2 px-2 sm:px-3 space-y-4 rounded-3xl border-2 border-amber-400/80 p-3 sm:p-6 bg-[#FFFDF8] shadow-sm select-none">
          {/* Mushaf Header Navigation Bar (Top Frame Header persis screenshot) */}
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/50 text-xs font-bold text-slate-700">
            {/* Left: Juz Badge */}
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold">
              {pageVerses[0]?.juz_number ? `Juz ${pageVerses[0].juz_number}` : `Juz ${activeAyahJuz}`}
            </span>

            {/* Center: Surah & Page Navigation */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleMushafPageChange(currentMushafPage - 1)}
                disabled={currentMushafPage <= 1}
                className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4 text-emerald-800" />
              </button>

              <div className="text-center">
                <span className="font-bold text-slate-900 text-sm block">
                  {currentMushafSurahName}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Hal. {currentMushafPage} / 604
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleMushafPageChange(currentMushafPage + 1)}
                disabled={currentMushafPage >= 604}
                className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4 text-emerald-800" />
              </button>
            </div>

            {/* Right: Standar Madinah 15 Baris */}
            <span className="text-slate-400 font-medium text-[11px] hidden sm:inline">
              Standar Madinah 15 Baris
            </span>
          </div>

          {/* Mushaf Body: Exact 15 Lines Structure with Ornate Surah Box */}
          {loadingPage ? (
            <div className="flex flex-col items-center justify-center py-24 text-emerald-700 space-y-2">
              <Loader2 className="w-7 h-7 animate-spin" />
              <span className="text-sm font-semibold">Membuka Halaman Mushaf {currentMushafPage}...</span>
            </div>
          ) : Object.keys(pageLines).length > 0 ? (
            <div className="space-y-0.5 sm:space-y-1 py-1">
              {Object.entries(pageLines).map(([lineStr, words]) => {
                const lineNum = parseInt(lineStr, 10);
                const totalLines = Object.keys(pageLines).length;
                const isShortLine = words.length <= 4 || (lineNum === totalLines && words.length <= 8);
                const startingSurah = surahsStartingByLine[lineNum];

                return (
                  <div key={lineNum} className="space-y-1">
                    {/* Kepala Surat: Ornate Islamic Frame Box jika surat baru dimulai */}
                    {startingSurah && (
                      <div className="space-y-1.5 my-2 sm:my-3">
                        <div className="relative rounded-xl border border-amber-600/50 bg-[#FDFBF7] p-1.5 sm:p-2 shadow-2xs">
                          <div className="border border-amber-600/25 rounded-lg py-1 px-2.5 sm:px-3 flex items-center justify-between text-xs font-semibold">
                            {/* Left: Info Jumlah Ayat */}
                            <div className="text-left text-amber-950 font-sans min-w-[65px]">
                              <span className="block text-[11px] sm:text-xs font-bold text-amber-950">
                                {startingSurah.numberOfAyahs} Ayat
                              </span>
                              <span className="text-[10px] text-amber-800/80 font-quran">
                                {startingSurah.numberOfAyahs.toLocaleString('ar-EG')} آية
                              </span>
                            </div>

                            {/* Center: Nama Surat Calligraphy & Latin */}
                            <div className="text-center">
                              <div className="font-quran text-lg sm:text-xl font-bold text-emerald-950 tracking-wider leading-tight">
                                سُورَةُ {startingSurah.nameArabic?.replace('سورة ', '') || startingSurah.nameLatin}
                              </div>
                              <div className="text-[10px] sm:text-[11px] font-sans font-medium text-slate-600 -mt-0.5">
                                Surat {startingSurah.nameLatin}
                              </div>
                            </div>

                            {/* Right: Tempat Turun */}
                            <div className="text-right text-amber-950 font-sans min-w-[65px]">
                              <span className="block text-[11px] sm:text-xs font-bold text-amber-950">
                                {startingSurah.revelationType === 'Madaniyyah' ? 'Madaniyyah' : 'Makkiyyah'}
                              </span>
                              <span className="text-[10px] text-amber-800/80 font-quran">
                                {startingSurah.revelationType === 'Madaniyyah' ? 'مَدَنِيَّةٌ' : 'مَكِّيَّةٌ'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bismillah Header Flanked with Elegant Divider Lines */}
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

                    {/* 15 Baris Mushaf Presisi */}
                    <div
                      dir="rtl"
                      style={{
                        fontSize: 'clamp(14px, calc(10px + 1.2vw), 22px)',
                        lineHeight: '2.4',
                      }}
                      className={`w-full flex items-center font-quran select-none whitespace-nowrap transition-all ${isShortLine ? 'justify-center gap-2.5 sm:gap-4' : 'justify-between'
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
                                    ? isAyahShaking
                                      ? 'border-rose-500 bg-rose-100 text-rose-900 ring-2 ring-rose-400 animate-pulse'
                                      : 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-300'
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
                                  ? isAyahShaking
                                    ? 'text-rose-950 bg-rose-50 font-semibold'
                                    : 'text-emerald-950 font-semibold hover:text-emerald-700'
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
                        }

                        // Kata Mushaf (Mendukung Evaluasi Suara Real-time, Tajwid, dan Error Highlight)
                        const wordKey = `${w.verse_key}_${w.position}`;
                        const isWordRevealed = !isBlindMode || revealedWordKeys.has(wordKey);
                        const isWordWrong = wrongWordKey === wordKey;
                        const tajweedHtml = w.text_uthmani_tajweed ? formatTajweedHtml(w.text_uthmani_tajweed, true) : null;

                        return (
                          <span
                            key={isWordWrong ? `wrong-mushaf-${shakeIteration}-${wordKey}` : wordKey}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isWordRevealed || isWordWrong) {
                                handleRevealSingleWordByKey(wordKey);
                              }
                            }}
                            className={`inline-block transition-all duration-200 cursor-pointer select-none ${isWordWrong
                              ? 'bg-rose-100/95 text-rose-800 border-2 border-rose-500 rounded-lg px-1.5 animate-shake shadow-xs'
                              : isWordRevealed
                                ? 'hover:text-emerald-700'
                                : 'text-slate-400 bg-amber-100/50 hover:bg-amber-200/70 border border-amber-200/80 px-2 rounded-lg text-sm font-sans'
                              }`}
                            title={
                              isWordRevealed
                                ? w.text_uthmani
                                : isWordWrong
                                  ? 'Salah sebut kata ini (klik jika mentok untuk membuka)'
                                  : 'Klik jika mentok untuk melihat kata ini'
                            }
                          >
                            {isWordRevealed ? (
                              tajweedHtml ? (
                                <span dangerouslySetInnerHTML={{ __html: tajweedHtml }} />
                              ) : (
                                w.text_uthmani
                              )
                            ) : (
                              '...'
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 text-sm">
              Memuat lembaran mushaf Madinah...
            </div>
          )}

          {/* Indikator Mode Bantuan / Uji Coba */}
          <div className="pt-3 border-t border-amber-200/50 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isBlindMode ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span>
                {isBlindMode
                  ? 'Mode Hafalan Ghaib: Kata muncul seketika setelah dilafalkan (Klik kata jika mentok)'
                  : 'Mode Bimbingan Teks: Seluruh kata ditampilkan'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSimulateWordReveal}
                className="text-[11px] text-emerald-700 hover:underline font-semibold"
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
      ) : (
        /* ==================================================================== */
        /* MODE AYAT: CARD PER AYAT (LAYOUT STABIL DENGAN GETAR DAN AUDIO DENG) */
        /* ==================================================================== */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          {/* Header Navigasi Ayat */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <button
              onClick={() => {
                if (activeAyahIndex > 0) setActiveAyahIndex((prev) => prev - 1);
              }}
              disabled={activeAyahIndex === 0}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent"
              title="Ayat Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {currentSurah.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Ayat {activeAyah.ayahNumber} dari {currentSurah.ayahs.length} • Halaman {activeAyahPage} • Juz {activeAyahJuz}
              </p>
            </div>

            <button
              onClick={() => {
                if (activeAyahIndex < currentSurah.ayahs.length - 1) {
                  setActiveAyahIndex((prev) => prev + 1);
                }
              }}
              disabled={activeAyahIndex >= currentSurah.ayahs.length - 1}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent"
              title="Ayat Selanjutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Ayah Card Body */}
          <div className="p-5 sm:p-9 flex-1 flex flex-col justify-center space-y-6 select-none">
            {currentSurah.number !== 9 && (
              <div className="text-center py-1">
                <p className="font-quran text-2xl sm:text-3xl text-slate-800 tracking-wide" dir="rtl">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                </p>
              </div>
            )}

            <div className="space-y-6">
              {currentSurah.ayahs.map((ayah, aIdx) => {
                const isCurrent = ayah.ayahNumber === activeAyah.ayahNumber;
                const isPast = ayah.ayahNumber < activeAyah.ayahNumber;

                if (!isCurrent && !isPast && aIdx > activeAyahIndex + 1) {
                  return null;
                }

                return (
                  <div
                    key={ayah.ayahNumber}
                    className={`p-5 sm:p-6 rounded-3xl transition-all duration-300 ${isCurrent
                      ? 'bg-emerald-50/80 border-2 border-emerald-300 shadow-sm ring-1 ring-emerald-200/50'
                      : isPast
                        ? 'bg-white border border-slate-200/90 opacity-75'
                        : 'bg-slate-50/40 border border-slate-200/50 opacity-40'
                      }`}
                  >
                    {isCurrent && (
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-100 text-xs font-semibold text-emerald-800">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                          Sedang Murojaah: Ayat {ayah.ayahNumber}
                        </span>
                        <span className="text-slate-400 font-sans font-normal text-[11px]">
                          Kata terbuka: {revealedWordIndices.size}/{ayah.words.length}
                        </span>
                      </div>
                    )}

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
                            className={`inline-block transition-all duration-200 select-none ${isWordRevealed
                              ? 'text-emerald-950 font-medium scale-100 animate-in fade-in'
                              : isWordWrong
                                ? 'bg-rose-100/95 text-rose-800 border-2 border-rose-500 rounded-2xl px-3 py-0.5 animate-shake shadow-xs cursor-pointer'
                                : 'text-slate-400 hover:text-emerald-700 bg-emerald-100/60 hover:bg-emerald-200/70 border border-emerald-200/80 px-3 py-0.5 rounded-xl text-2xl font-normal cursor-pointer'
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
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-emerald-400 bg-white font-sans text-xs font-bold text-emerald-900 mx-2 shadow-xs select-none">
                        {ayah.ayahNumber}
                      </span>
                    </div>

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

          <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isBlindMode ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span>
                {isBlindMode
                  ? 'Mode Hafalan Ghaib: Kata muncul seketika setelah dilafalkan (Klik kata jika mentok)'
                  : 'Mode Bimbingan Teks: Seluruh kata ditampilkan'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSimulateWordReveal}
                className="text-[11px] text-emerald-700 hover:underline font-semibold"
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
      )}

      {/* ==================================================================== */}
      {/* FLOATING BOTTOM LIVE DOCK (RESPONSIVE DOCK MOBILE & DESKTOP)          */}
      {/* ==================================================================== */}
      <div className="fixed bottom-20 md:bottom-6 left-0 right-0 z-40 px-4">
        <div className="max-w-xl mx-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-3 shadow-2xl shadow-slate-950/15 flex flex-col items-center space-y-3">
          {/* Kotak Pendeteksi Suara User: Bahasa Indonesia saat menunggu, Font Quran & Harakat saat user mulai melafalkan */}
          <div className="w-full bg-emerald-950/95 border border-emerald-800 rounded-2xl py-2.5 px-4 text-center shadow-inner">
            <div className="flex flex-col items-center justify-center gap-1">
              {isLiveListening && (
                <div className="flex items-center gap-2 self-center mb-0.5" dir="ltr">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">
                    Pendeteksi Suara Real-time
                  </span>
                </div>
              )}

              {liveTranscript && isLiveListening ? (
                /* Saat user sudah menyebutkan ayat: Tampilkan dengan font Al-Qur'an dan harakat lengkap */
                <div
                  className="font-quran text-2xl sm:text-3xl text-emerald-100 tracking-wide leading-relaxed min-h-[38px] flex items-center justify-center animate-in fade-in"
                  dir="rtl"
                >
                  {getSpokenArabicWithHarakat(liveTranscript, currentListeningWords)}
                </div>
              ) : (
                /* Saat belum ada suara / sedang menunggu suara: Gunakan Bahasa Indonesia */
                <div className="text-xs sm:text-sm font-medium text-emerald-200/80 min-h-[38px] flex items-center justify-center font-sans tracking-wide">
                  {isLiveListening
                    ? 'Mendengarkan lantunan ayat Anda...'
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
              className={`p-3 rounded-2xl border transition ${isBlindMode
                ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                }`}
              title={isBlindMode ? 'Buka Teks Bantuan' : 'Tutup Kata (Uji Hafalan)'}
            >
              {isBlindMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            {/* Tombol Ayat / Halaman Sebelumnya */}
            <button
              type="button"
              disabled={viewMode === 'mushaf' ? currentMushafPage <= 1 : activeAyahIndex === 0}
              onClick={() => {
                if (viewMode === 'mushaf') {
                  handleMushafPageChange(currentMushafPage - 1);
                } else {
                  setActiveAyahIndex((prev) => Math.max(0, prev - 1));
                }
              }}
              className="p-3 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 transition cursor-pointer"
              title={viewMode === 'mushaf' ? 'Halaman Sebelumnya' : 'Ayat Sebelumnya'}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Tombol Mikrofon Utama */}
            <button
              type="button"
              onClick={handleToggleListening}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 active:scale-95 cursor-pointer ${isLiveListening
                ? 'bg-rose-600 hover:bg-rose-700 ring-4 ring-rose-300 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 ring-4 ring-emerald-200'
                }`}
              title={isLiveListening ? 'Hentikan Live Listening' : 'Mulai Hafalan Real-time'}
            >
              {isLiveListening ? (
                <Square className="w-6 h-6 fill-white" />
              ) : (
                <Mic className="w-7 h-7" />
              )}
            </button>

            {/* Tombol Ayat / Halaman Selanjutnya */}
            <button
              type="button"
              disabled={
                viewMode === 'mushaf'
                  ? currentMushafPage >= 604
                  : activeAyahIndex >= currentSurah.ayahs.length - 1
              }
              onClick={() => {
                if (viewMode === 'mushaf') {
                  handleMushafPageChange(currentMushafPage + 1);
                } else {
                  setActiveAyahIndex((prev) =>
                    Math.min(currentSurah.ayahs.length - 1, prev + 1)
                  );
                }
              }}
              className="p-3 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 transition cursor-pointer"
              title={viewMode === 'mushaf' ? 'Halaman Selanjutnya' : 'Ayat Selanjutnya'}
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Tombol Dengarkan Audio Qari Resmi */}
            <button
              type="button"
              onClick={handleToggleQari}
              className={`p-3 rounded-2xl border transition ${isPlayingQari
                ? 'bg-amber-100 border-amber-300 text-amber-800 animate-pulse'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              title={isPlayingQari ? 'Jeda Audio Qari' : 'Dengar Pelafalan Murottal Qari'}
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
            setScoreNotification('Alhamdulillah! Laporan sesi murojaah tersimpan ke Mutabaah Yaumi.');
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
