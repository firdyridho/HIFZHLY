import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Bookmark,
  Search,
  BookOpen,
  ArrowLeft,
  Play,
  Pause,
  AlertTriangle,
  Loader2,
  X,
  Check,
  AlignJustify,
  Type,
  Languages,
  Highlighter,
  Palette,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { SurahSummary, SurahDetail, MutashabihaItem } from '../types';

// 30 Juz Mapping Data
interface JuzInfo {
  number: number;
  nameArabic: string;
  startSurahNumber: number;
  startSurahName: string;
  startAyah: number;
  endSurahName: string;
  endAyah: number;
}

const JUZ_LIST: JuzInfo[] = [
  { number: 1, nameArabic: 'الجزء ١', startSurahNumber: 1, startSurahName: 'Al-Fatihah', startAyah: 1, endSurahName: 'Al-Baqarah', endAyah: 141 },
  { number: 2, nameArabic: 'الجزء ٢', startSurahNumber: 2, startSurahName: 'Al-Baqarah', startAyah: 142, endSurahName: 'Al-Baqarah', endAyah: 252 },
  { number: 3, nameArabic: 'الجزء ٣', startSurahNumber: 2, startSurahName: 'Al-Baqarah', startAyah: 253, endSurahName: "Ali 'Imran", endAyah: 92 },
  { number: 4, nameArabic: 'الجزء ٤', startSurahNumber: 3, startSurahName: "Ali 'Imran", startAyah: 93, endSurahName: "An-Nisa'", endAyah: 23 },
  { number: 5, nameArabic: 'الجزء ٥', startSurahNumber: 4, startSurahName: "An-Nisa'", startAyah: 24, endSurahName: "An-Nisa'", endAyah: 147 },
  { number: 6, nameArabic: 'الجزء ٦', startSurahNumber: 4, startSurahName: "An-Nisa'", startAyah: 148, endSurahName: "Al-Ma'idah", endAyah: 81 },
  { number: 7, nameArabic: 'الجزء ٧', startSurahNumber: 5, startSurahName: "Al-Ma'idah", startAyah: 82, endSurahName: "Al-An'am", endAyah: 110 },
  { number: 8, nameArabic: 'الجزء ٨', startSurahNumber: 6, startSurahName: "Al-An'am", startAyah: 111, endSurahName: "Al-A'raf", endAyah: 87 },
  { number: 9, nameArabic: 'الجزء ٩', startSurahNumber: 7, startSurahName: "Al-A'raf", startAyah: 88, endSurahName: "Al-Anfal", endAyah: 40 },
  { number: 10, nameArabic: 'الجزء ١٠', startSurahNumber: 8, startSurahName: "Al-Anfal", startAyah: 41, endSurahName: "At-Taubah", endAyah: 92 },
  { number: 11, nameArabic: 'الجزء ١١', startSurahNumber: 9, startSurahName: "At-Taubah", startAyah: 93, endSurahName: "Hud", endAyah: 5 },
  { number: 12, nameArabic: 'الجزء ١٢', startSurahNumber: 11, startSurahName: "Hud", startAyah: 6, endSurahName: "Yusuf", endAyah: 52 },
  { number: 13, nameArabic: 'الجزء ١٣', startSurahNumber: 12, startSurahName: "Yusuf", startAyah: 53, endSurahName: "Ibrahim", endAyah: 52 },
  { number: 14, nameArabic: 'الجزء ١٤', startSurahNumber: 15, startSurahName: "Al-Hijr", startAyah: 1, endSurahName: "An-Nahl", endAyah: 128 },
  { number: 15, nameArabic: 'الجزء ١٥', startSurahNumber: 17, startSurahName: "Al-Isra'", startAyah: 1, endSurahName: "Al-Kahf", endAyah: 74 },
  { number: 16, nameArabic: 'الجزء ١٦', startSurahNumber: 18, startSurahName: "Al-Kahf", startAyah: 75, endSurahName: "Ta-Ha", endAyah: 135 },
  { number: 17, nameArabic: 'الجزء ١٧', startSurahNumber: 21, startSurahName: "Al-Anbiya", startAyah: 1, endSurahName: "Al-Hajj", endAyah: 78 },
  { number: 18, nameArabic: 'الجزء ١٨', startSurahNumber: 23, startSurahName: "Al-Mu'minun", startAyah: 1, endSurahName: "Al-Furqan", endAyah: 20 },
  { number: 19, nameArabic: 'الجزء ١٩', startSurahNumber: 25, startSurahName: "Al-Furqan", startAyah: 21, endSurahName: "An-Naml", endAyah: 55 },
  { number: 20, nameArabic: 'الجزء ٢٠', startSurahNumber: 27, startSurahName: "An-Naml", startAyah: 56, endSurahName: "Al-'Ankabut", endAyah: 45 },
  { number: 21, nameArabic: 'الجزء ٢١', startSurahNumber: 29, startSurahName: "Al-'Ankabut", startAyah: 46, endSurahName: "Al-Ahzab", endAyah: 30 },
  { number: 22, nameArabic: 'الجزء ٢٢', startSurahNumber: 33, startSurahName: "Al-Ahzab", startAyah: 31, endSurahName: "Ya-Sin", endAyah: 27 },
  { number: 23, nameArabic: 'الجزء ٢٣', startSurahNumber: 36, startSurahName: "Ya-Sin", startAyah: 28, endSurahName: "Az-Zumar", endAyah: 31 },
  { number: 24, nameArabic: 'الجزء ٢٤', startSurahNumber: 39, startSurahName: "Az-Zumar", startAyah: 32, endSurahName: "Fussilat", endAyah: 46 },
  { number: 25, nameArabic: 'الجزء ٢٥', startSurahNumber: 41, startSurahName: "Fussilat", startAyah: 47, endSurahName: "Al-Jasiyah", endAyah: 37 },
  { number: 26, nameArabic: 'الجزء ٢٦', startSurahNumber: 46, startSurahName: "Al-Ahqaf", startAyah: 1, endSurahName: "Az-Zariyat", endAyah: 30 },
  { number: 27, nameArabic: 'الجزء ٢٧', startSurahNumber: 51, startSurahName: "Az-Zariyat", startAyah: 31, endSurahName: "Al-Hadid", endAyah: 29 },
  { number: 28, nameArabic: 'الجزء ٢٨', startSurahNumber: 58, startSurahName: "Al-Mujadilah", startAyah: 1, endSurahName: "At-Tahrim", endAyah: 12 },
  { number: 29, nameArabic: 'الجزء ٢٩', startSurahNumber: 67, startSurahName: "Al-Mulk", startAyah: 1, endSurahName: "Al-Mursalat", endAyah: 50 },
  { number: 30, nameArabic: 'الجزء ٣٠', startSurahNumber: 78, startSurahName: "An-Naba'", startAyah: 1, endSurahName: "An-Nas", endAyah: 6 },
];

// Start pages mapping for all 114 Surahs in Madinah Mushaf (604 pages)
const SURAH_START_PAGES = [
  0, 1, 2, 50, 77, 106, 128, 151, 177, 187, 208, 221, 235, 249, 255, 262, 267, 282, 293, 305, 312,
  322, 332, 342, 350, 359, 367, 377, 385, 396, 404, 411, 415, 418, 428, 434, 440, 446, 453, 458, 467,
  477, 483, 489, 496, 499, 502, 507, 511, 515, 518, 520, 523, 526, 528, 531, 534, 537, 542, 545, 549,
  551, 553, 554, 556, 558, 560, 562, 564, 566, 568, 570, 572, 574, 575, 577, 578, 580, 582, 583, 585,
  586, 587, 587, 589, 590, 591, 591, 592, 593, 594, 595, 595, 596, 596, 597, 597, 598, 598, 599, 599,
  600, 600, 601, 601, 601, 602, 602, 602, 603, 603, 603, 604, 604, 604,
];

// Tajweed Rule Tooltip and Colors
const TAJWEED_RULES: Record<string, { label: string; desc: string; color: string; example: string }> = {
  ghunnah: { label: 'Ghunnah', desc: 'Dengung 2 harakat pada Nun/Mim bertasydid', color: 'text-amber-600', example: 'إِنَّ / عَمَّ' },
  idgham_ghunnah: { label: 'Idgham Bighunnah', desc: 'Nun sukun / tanwin melebur dengan dengung ke ya, nun, mim, waw', color: 'text-emerald-600', example: 'مَن يَقُولُ' },
  idgham_wo_ghunnah: { label: 'Idgham Bilaghunnah', desc: 'Melebur tanpa dengung ke lam atau ra', color: 'text-slate-400', example: 'مِّن رَّبِّهِمْ' },
  iqlab: { label: 'Iqlab', desc: 'Mengubah bunyi nun sukun/tanwin menjadi mim sukun jika bertemu ba', color: 'text-cyan-600', example: 'مِنۢ بَعْدِ' },
  ikhafa: { label: 'Ikhfa Haqiqi', desc: 'Menyamarkan bacaan antara izhar dan idgham dengan dengung', color: 'text-blue-600', example: 'مِن قَبْلُ' },
  ikhafa_shafawi: { label: 'Ikhfa Syafawi', desc: 'Mim sukun bertemu ba disamarkan di bibir', color: 'text-blue-600', example: 'تَرْمِيهِم بِحِجَارَةٍ' },
  idgham_shafawi: { label: 'Idgham Mimi / Syafawi', desc: 'Mim sukun melebur dengan mim berikutnya', color: 'text-teal-600', example: 'لَهُم مَّا' },
  qalaqah: { label: 'Qalqalah', desc: 'Memantulkan huruf saat sukun (ba, jim, dal, tha, qaf)', color: 'text-sky-500', example: 'قُلْ هُوَ اللَّهُ أَحَدٌ' },
  madda_normal: { label: 'Mad Thabi’i', desc: 'Panjang 2 harakat', color: 'text-red-600', example: 'قَالَ / يَقُولُ' },
  madda_permissible: { label: 'Mad Jaiz Munfashil', desc: 'Panjang 4-5 harakat (mad bertemu hamzah beda kata)', color: 'text-rose-600', example: 'بِمَا أُنزِلَ' },
  madda_obligatory: { label: 'Mad Wajib Muttashil', desc: 'Panjang 4-5 harakat (mad bertemu hamzah satu kata)', color: 'text-red-700', example: 'جَآءَ' },
  madda_necessary: { label: 'Mad Lazim', desc: 'Panjang 6 harakat penuh', color: 'text-purple-600', example: 'الضَّآلِّينَ' },
  ham_wasl: { label: 'Hamzah Wasal', desc: 'Dilebur saat disambung', color: 'text-slate-400', example: 'ٱلَّذِينَ' },
  laam_shamsiyah: { label: 'Lam Syamsiyah', desc: 'Lam tidak dibaca / langsung ke huruf berikutnya', color: 'text-slate-400', example: 'ٱلشَّمْسُ' },
  slnt: { label: 'Huruf Dilebur (Silent)', desc: 'Tertulis tetapi tidak dibaca', color: 'text-slate-400', example: 'كَفَرُوا۟' },
};

function formatTajweedHtml(rawHtml: string): string {
  if (!rawHtml) return '';
  return rawHtml
    .replace(/<tajweed class=([a-z_]+)>/g, '<span class="tajweed-$1 hover:underline cursor-pointer" data-rule="$1">')
    .replace(/<\/tajweed>/g, '</span>')
    .replace(/<span class=end>(.*?)<\/span>/g, '<span class="inline-flex items-center justify-center text-amber-700 font-bold px-1.5 text-sm select-none">($1)</span>');
}

export default function MushafPage() {
  const [activeTab, setActiveTab] = useState<'surah' | 'juz'>('surah');
  const [revelationFilter, setRevelationFilter] = useState<'all' | 'makiyyah' | 'madaniyyah'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Active Reading View State
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null);
  const [currentSurah, setCurrentSurah] = useState<SurahDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [targetAyahToScroll, setTargetAyahToScroll] = useState<number | null>(null);

  // Header Toolbar Controls State
  const [readingMode, setReadingMode] = useState<'ayat' | 'mushaf'>('ayat');
  const [fontSize, setFontSize] = useState<number>(28); // 20px - 44px
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [showTajwid, setShowTajwid] = useState<boolean>(true);
  const [showTajwidGuide, setShowTajwidGuide] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [chapterInfo, setChapterInfo] = useState<{ shortText?: string; fullText?: string } | null>(null);
  const [loadingInfo, setLoadingInfo] = useState<boolean>(false);

  // Tajweed Per-Ayah Cached Map
  const [tajweedMap, setTajweedMap] = useState<Record<number, string>>({});

  // Mushaf Per Halaman (604 Pages) State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageVerses, setPageVerses] = useState<any[]>([]);
  const [loadingPage, setLoadingPage] = useState<boolean>(false);
  const [selectedMushafAyah, setSelectedMushafAyah] = useState<any | null>(null);

  // Tafsir State (EQuran.id API v2 Tafsir Kemenag RI)
  const [expandedTafsir, setExpandedTafsir] = useState<Record<number, boolean>>({});
  const [tafsirCache, setTafsirCache] = useState<Record<number, Record<number, string>>>({});
  const [loadingTafsirAyah, setLoadingTafsirAyah] = useState<number | null>(null);

  // Audio & Modals State
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [isPlayingFull, setIsPlayingFull] = useState(false);
  const [activeMutashabih, setActiveMutashabih] = useState<MutashabihaItem[] | null>(null);
  const [activeAyahText, setActiveAyahText] = useState<{ number: number; text: string } | null>(null);
  const [bookmarkedFeedback, setBookmarkedFeedback] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fullAudioRef = useRef<HTMLAudioElement | null>(null);

  // Terakhir Baca State (loaded from localStorage)
  const [lastRead, setLastRead] = useState<{
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
  }>(() => {
    const cached = localStorage.getItem('hifzhly_last_read');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return {
      surahNumber: 1,
      surahName: 'Al-Fatihah',
      ayahNumber: 1,
    };
  });

  // 1. Fetch 114 Surahs from EQuran.id API v2
  useEffect(() => {
    setLoadingList(true);
    fetch('https://equran.id/api/v2/surat')
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat daftar surah');
        return res.json();
      })
      .then((json) => {
        if (json.code === 200 && Array.isArray(json.data)) {
          const mapped: SurahSummary[] = json.data.map((item: any) => ({
            number: item.nomor,
            nameArabic: item.nama,
            nameLatin: item.namaLatin,
            numberOfAyahs: item.jumlahAyat,
            revelationType: item.tempatTurun === 'Mekah' ? 'Makkiyyah' : 'Madaniyyah',
            translation: item.arti,
          }));
          setSurahs(mapped);
        }
      })
      .catch((err) => {
        console.warn('Fallback ke backend proxy:', err);
        fetch('/api/v1/quran/surahs')
          .then((res) => res.json())
          .then((data: SurahSummary[]) => setSurahs(data))
          .catch(() => {});
      })
      .finally(() => setLoadingList(false));
  }, []);

  // 2. Fetch Surah Detail from EQuran.id API v2 + Tajweed from Quran.com
  useEffect(() => {
    if (!selectedSurahNumber) {
      setCurrentSurah(null);
      return;
    }

    if (audioRef.current) audioRef.current.pause();
    if (fullAudioRef.current) fullAudioRef.current.pause();
    setPlayingAyah(null);
    setIsPlayingFull(false);
    setExpandedTafsir({});
    setChapterInfo(null);

    // Set starting page for mushaf mode
    const startPg = SURAH_START_PAGES[selectedSurahNumber] || 1;
    setCurrentPage(startPg);

    setLoadingDetail(true);

    // Fetch detail from EQuran.id
    fetch(`https://equran.id/api/v2/surat/${selectedSurahNumber}`)
      .then((res) => res.json())
      .then(async (json) => {
        if (json.code === 200 && json.data) {
          const d = json.data;
          const detail: SurahDetail = {
            number: d.nomor,
            nameArabic: d.nama,
            nameLatin: d.namaLatin,
            numberOfAyahs: d.jumlahAyat,
            revelationType: d.tempatTurun === 'Mekah' ? 'Makkiyyah' : 'Madaniyyah',
            translation: d.arti,
            audioFull: d.audioFull?.['05'] || d.audioFull?.['01'] || '',
            ayahs: d.ayat.map((a: any) => ({
              ayahNumber: a.nomorAyat,
              textArabic: a.teksArab,
              textLatin: a.teksLatin,
              translation: a.teksIndonesia,
              audioUrl: a.audio?.['05'] || a.audio?.['01'] || '',
            })),
          };

          // Enrich with mutasyabihat if available
          try {
            const enrichedAyahs = await Promise.all(
              detail.ayahs.map(async (ayah) => {
                try {
                  const mRes = await fetch(`/api/v1/quran/mutashabihat/${detail.number}/${ayah.ayahNumber}`);
                  if (mRes.ok) {
                    const mData = await mRes.json();
                    if (mData.mutashabihat && mData.mutashabihat.length > 0) {
                      return { ...ayah, mutashabihat: mData.mutashabihat };
                    }
                  }
                } catch {}
                return ayah;
              })
            );
            setCurrentSurah({ ...detail, ayahs: enrichedAyahs });
          } catch {
            setCurrentSurah(detail);
          }
        }
      })
      .catch((err) => console.warn('Gagal memuat detail:', err))
      .finally(() => setLoadingDetail(false));

    // Fetch interactive Tajweed tags from Quran.com
    fetch(`https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?chapter_number=${selectedSurahNumber}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.verses && Array.isArray(data.verses)) {
          const tMap: Record<number, string> = {};
          data.verses.forEach((v: any, idx: number) => {
            tMap[idx + 1] = formatTajweedHtml(v.text_uthmani_tajweed);
          });
          setTajweedMap(tMap);
        }
      })
      .catch(() => {});
  }, [selectedSurahNumber]);

  // 3. Fetch Verses by Page for Mushaf Mode
  useEffect(() => {
    if (readingMode !== 'mushaf' || !currentPage) return;

    setLoadingPage(true);
    fetch(`https://api.quran.com/api/v4/verses/by_page/${currentPage}?translations=33&fields=text_uthmani,text_uthmani_tajweed,chapter_id,page_number,juz_number`)
      .then((res) => res.json())
      .then((data) => {
        if (data.verses) {
          setPageVerses(data.verses);
        }
      })
      .catch((err) => console.error('Gagal memuat halaman mushaf:', err))
      .finally(() => setLoadingPage(false));
  }, [readingMode, currentPage]);

  // 4. Fetch Asbabun Nuzul & Surah Info when requested
  const handleOpenInfoModal = () => {
    setShowInfoModal(true);
    if (chapterInfo || !selectedSurahNumber) return;

    setLoadingInfo(true);
    fetch(`https://api.quran.com/api/v4/chapters/${selectedSurahNumber}/info?language=id`)
      .then((res) => res.json())
      .then((data) => {
        if (data.chapter_info) {
          setChapterInfo({
            shortText: data.chapter_info.short_text,
            fullText: data.chapter_info.text,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingInfo(false));
  };

  // 5. Scroll to target ayah if requested
  useEffect(() => {
    if (targetAyahToScroll && currentSurah && !loadingDetail && readingMode === 'ayat') {
      setTimeout(() => {
        const el = document.getElementById(`ayah-${targetAyahToScroll}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [targetAyahToScroll, currentSurah, loadingDetail, readingMode]);

  // 6. Handle Tafsir Toggle
  const handleToggleTafsir = async (ayahNumber: number) => {
    if (!selectedSurahNumber) return;

    if (expandedTafsir[ayahNumber]) {
      setExpandedTafsir((prev) => ({ ...prev, [ayahNumber]: false }));
      return;
    }

    if (tafsirCache[selectedSurahNumber]) {
      setExpandedTafsir((prev) => ({ ...prev, [ayahNumber]: true }));
      return;
    }

    setLoadingTafsirAyah(ayahNumber);
    try {
      const res = await fetch(`https://equran.id/api/v2/tafsir/${selectedSurahNumber}`);
      const json = await res.json();
      if (json.code === 200 && json.data?.tafsir) {
        const map: Record<number, string> = {};
        json.data.tafsir.forEach((item: { ayat: number; teks: string }) => {
          map[item.ayat] = item.teks;
        });
        setTafsirCache((prev) => ({ ...prev, [selectedSurahNumber]: map }));
        setExpandedTafsir((prev) => ({ ...prev, [ayahNumber]: true }));
      }
    } catch (err) {
      console.error('Gagal mengambil data tafsir:', err);
    } finally {
      setLoadingTafsirAyah(null);
    }
  };

  // Helper normalize revelation type
  const getNormRevelation = (type: string | undefined): 'Makkiyyah' | 'Madaniyyah' => {
    if (!type) return 'Makkiyyah';
    const lower = type.toLowerCase();
    if (lower.includes('mad')) return 'Madaniyyah';
    return 'Makkiyyah';
  };

  // Filtered Surahs
  const filteredSurahs = useMemo(() => {
    return surahs.filter((surah) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        surah.nameLatin.toLowerCase().includes(q) ||
        surah.number.toString() === q ||
        (surah.translation && surah.translation.toLowerCase().includes(q));

      const normRev = getNormRevelation(surah.revelationType);
      let matchRev = true;
      if (revelationFilter === 'makiyyah') {
        matchRev = normRev === 'Makkiyyah';
      } else if (revelationFilter === 'madaniyyah') {
        matchRev = normRev === 'Madaniyyah';
      }

      return matchSearch && matchRev;
    });
  }, [surahs, searchQuery, revelationFilter]);

  // Filtered Juz
  const filteredJuz = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return JUZ_LIST;
    return JUZ_LIST.filter(
      (j) =>
        j.number.toString() === q ||
        `juz ${j.number}`.includes(q) ||
        j.startSurahName.toLowerCase().includes(q) ||
        j.endSurahName.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Handle Play/Pause Full Surah
  const handleToggleFullAudio = () => {
    if (!currentSurah?.audioFull) return;
    if (isPlayingFull) {
      if (fullAudioRef.current) fullAudioRef.current.pause();
      setIsPlayingFull(false);
    } else {
      if (audioRef.current) audioRef.current.pause();
      setPlayingAyah(null);

      const audio = new Audio(currentSurah.audioFull);
      fullAudioRef.current = audio;
      audio.play();
      setIsPlayingFull(true);
      audio.onended = () => setIsPlayingFull(false);
      audio.onerror = () => setIsPlayingFull(false);
    }
  };

  // Handle Play/Pause Single Ayah
  const handleToggleAudio = (ayahNumber: number, url: string) => {
    if (fullAudioRef.current) fullAudioRef.current.pause();
    setIsPlayingFull(false);

    if (playingAyah === ayahNumber) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingAyah(null);
      return;
    }

    if (audioRef.current) audioRef.current.pause();

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play();
    setPlayingAyah(ayahNumber);
    audio.onended = () => setPlayingAyah(null);
    audio.onerror = () => setPlayingAyah(null);
  };

  // Handle Bookmark "Tandai Terakhir Baca"
  const handleSetLastRead = (surahNum: number, surahName: string, ayahNum: number) => {
    const newRecord = {
      surahNumber: surahNum,
      surahName: surahName,
      ayahNumber: ayahNum,
    };
    setLastRead(newRecord);
    localStorage.setItem('hifzhly_last_read', JSON.stringify(newRecord));
    setBookmarkedFeedback(`Tersimpan: QS. ${surahName} Ayat ${ayahNum}`);
    setTimeout(() => setBookmarkedFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Dynamic CSS for Interactive Tajweed */}
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

      {/* 1. DEDICATED IN-QURAN READING HEADER & TOOLBAR (When Surah is Selected) */}
      {selectedSurahNumber !== null && (
        <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 -mx-4 px-4 sm:px-6 py-2.5 shadow-xs">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
            {/* Left: Back Arrow + Surah Name */}
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedSurahNumber(null);
                  setTargetAyahToScroll(null);
                  if (audioRef.current) audioRef.current.pause();
                  if (fullAudioRef.current) fullAudioRef.current.pause();
                  setIsPlayingFull(false);
                  setPlayingAyah(null);
                }}
                className="p-1.5 rounded-xl text-slate-600 hover:text-emerald-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Kembali ke Daftar Surah / Juz"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight flex items-center space-x-1.5">
                  <span>{currentSurah?.nameLatin || 'Al-Qur\'an'}</span>
                </h2>
                <span className="text-[11px] text-slate-500 font-medium">
                  {currentSurah?.numberOfAyahs} Ayat • {getNormRevelation(currentSurah?.revelationType)}
                </span>
              </div>
            </div>

            {/* Right: Controls Toolbar (Matches User's Design Image) */}
            <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
              {/* 1. View Switcher Pill: [ Ayat ] | [ Mushaf ] */}
              <div className="bg-slate-100 p-0.5 rounded-xl flex items-center border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setReadingMode('ayat')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    readingMode === 'ayat'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                  <span>Ayat</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReadingMode('mushaf');
                    if (currentSurah) {
                      const startPg = SURAH_START_PAGES[currentSurah.number] || 1;
                      setCurrentPage(startPg);
                    }
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    readingMode === 'mushaf'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Mushaf</span>
                </button>
              </div>

              {/* 2. Ukuran Font [- Aa +] */}
              <div className="flex items-center bg-slate-100 border border-slate-200/80 rounded-xl px-1 py-0.5">
                <button
                  type="button"
                  onClick={() => setFontSize((prev) => Math.max(20, prev - 2))}
                  disabled={fontSize <= 20}
                  className="px-2 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                  title="Perkecil Ukuran Huruf Arab"
                >
                  -
                </button>
                <span className="text-xs font-bold text-slate-700 px-1 select-none flex items-center space-x-0.5">
                  <Type className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Aa</span>
                </span>
                <button
                  type="button"
                  onClick={() => setFontSize((prev) => Math.min(48, prev + 2))}
                  disabled={fontSize >= 48}
                  className="px-2 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                  title="Perbesar Ukuran Huruf Arab"
                >
                  +
                </button>
              </div>

              {/* 3. On/Off Terjemah [ Languages / A-Z ] */}
              <button
                type="button"
                onClick={() => setShowTranslation((prev) => !prev)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  showTranslation
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                }`}
                title={showTranslation ? 'Sembunyikan Terjemahan' : 'Tampilkan Terjemahan'}
              >
                <Languages className="w-4 h-4" />
              </button>

              {/* 4. On/Off Tajwid Interaktif [ Highlighter ] */}
              <button
                type="button"
                onClick={() => setShowTajwid((prev) => !prev)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  showTajwid
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                }`}
                title={showTajwid ? 'Nonaktifkan Warna Tajwid' : 'Aktifkan Warna Tajwid Interaktif'}
              >
                <Highlighter className="w-4 h-4" />
              </button>

              {/* 5. Panduan Warna Tajwid [ Palette ] */}
              <button
                type="button"
                onClick={() => setShowTajwidGuide(true)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 transition-all cursor-pointer"
                title="Buka Panduan Warna Tajwid"
              >
                <Palette className="w-4 h-4" />
              </button>

              {/* 6. Play All Full Surah [ Play / Pause ] */}
              <button
                type="button"
                onClick={handleToggleFullAudio}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isPlayingFull
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300'
                }`}
                title={isPlayingFull ? 'Jeda Audio Murottal Full' : 'Putar Murottal Full Surah (Misyari Rasyid)'}
              >
                {isPlayingFull ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
              </button>

              {/* 7. Info Surah & Asbabun Nuzul [ Info ] */}
              <button
                type="button"
                onClick={handleOpenInfoModal}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 transition-all cursor-pointer"
                title="Info Surah & Asbabun Nuzul"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookmarked Notification Feedback */}
      {bookmarkedFeedback && (
        <div className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-50 text-xs font-bold text-emerald-900 bg-white border border-emerald-200 px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{bookmarkedFeedback}</span>
        </div>
      )}

      {/* 2. MAIN CONTENT AREA */}
      {selectedSurahNumber !== null ? (
        readingMode === 'ayat' ? (
          /* ======================================================== */
          /* MODE 1: TAMPILAN PER AYAT (Card View dengan Tafsir Kemenag) */
          /* ======================================================== */
          <div className="space-y-6">
            {loadingDetail ? (
              <div className="flex items-center justify-center py-24 text-emerald-700 space-x-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-semibold">Membuka lembaran surah dari EQuran.id...</span>
              </div>
            ) : currentSurah ? (
              <div className="space-y-6">
                {/* Surah Hero Banner */}
                <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 sm:p-8 rounded-3xl shadow-md border border-emerald-700/60 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
                    <BookOpen className="w-56 h-56" />
                  </div>

                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest block">
                        Surah Ke-{currentSurah.number} • {getNormRevelation(currentSurah.revelationType)}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        {currentSurah.nameLatin}
                      </h2>
                      <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
                        "{currentSurah.translation}" • {currentSurah.numberOfAyahs} Ayat
                      </p>
                    </div>

                    <div className="text-center sm:text-right space-y-2">
                      <span className="font-quran text-4xl sm:text-5xl text-emerald-200 block leading-tight">
                        {currentSurah.nameArabic}
                      </span>
                    </div>
                  </div>

                  {/* Bismillah Header (kecuali Surah At-Taubah 9 & Al-Fatihah 1) */}
                  {currentSurah.number !== 9 && currentSurah.number !== 1 && (
                    <div className="mt-6 pt-6 border-t border-emerald-700/60 text-center">
                      <span className="font-quran text-3xl sm:text-4xl text-emerald-100 tracking-wider">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </span>
                    </div>
                  )}
                </div>

                {/* Ayat Cards List */}
                <div className="space-y-4">
                  {currentSurah.ayahs.map((ayah) => {
                    const isCurrentPlaying = playingAyah === ayah.ayahNumber;
                    const isLastReadAyah =
                      lastRead.surahNumber === currentSurah.number &&
                      lastRead.ayahNumber === ayah.ayahNumber;
                    const isTafsirOpen = !!expandedTafsir[ayah.ayahNumber];
                    const isLoadingTafsirThis = loadingTafsirAyah === ayah.ayahNumber;
                    const tajweedHtml = tajweedMap[ayah.ayahNumber];

                    return (
                      <div
                        key={ayah.ayahNumber}
                        id={`ayah-${ayah.ayahNumber}`}
                        className={`p-5 sm:p-6 rounded-3xl bg-white border transition-all ${
                          isLastReadAyah
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                            : 'border-slate-200/90 shadow-xs hover:border-slate-300'
                        }`}
                      >
                        {/* Top Bar: Ayah Number on Left, Action Buttons on Right */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                          {/* Ayah Number Badge */}
                          <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                            {ayah.ayahNumber}
                          </span>

                          {/* Action Icons: [ Buku/Tafsir ] [ Bookmark ] [ Play/Pause Audio ] */}
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            {/* 1. Logo Buku: Tampilkan Tafsir Kemenag RI */}
                            <button
                              type="button"
                              onClick={() => handleToggleTafsir(ayah.ayahNumber)}
                              className={`p-2 rounded-xl transition-all flex items-center space-x-1 cursor-pointer ${
                                isTafsirOpen
                                  ? 'bg-emerald-100 text-emerald-800 font-bold'
                                  : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title="Tampilkan Tafsir Kemenag RI"
                            >
                              {isLoadingTafsirThis ? (
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                              ) : (
                                <BookOpen className="w-4 h-4" />
                              )}
                            </button>

                            {/* 2. Bookmark: Tandai Terakhir Baca */}
                            <button
                              type="button"
                              onClick={() =>
                                handleSetLastRead(
                                  currentSurah.number,
                                  currentSurah.nameLatin,
                                  ayah.ayahNumber
                                )
                              }
                              className={`p-2 rounded-xl transition-all flex items-center space-x-1 cursor-pointer ${
                                isLastReadAyah
                                  ? 'bg-emerald-100 text-emerald-800 font-bold'
                                  : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title="Tandai Terakhir Dibaca"
                            >
                              <Bookmark className={`w-4 h-4 ${isLastReadAyah ? 'fill-current text-emerald-700' : ''}`} />
                            </button>

                            {/* 3. Audio Play/Pause */}
                            {ayah.audioUrl && (
                              <button
                                type="button"
                                onClick={() => handleToggleAudio(ayah.ayahNumber, ayah.audioUrl)}
                                className={`p-2 rounded-xl transition-all flex items-center space-x-1 cursor-pointer ${
                                  isCurrentPlaying
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
                                }`}
                                title="Dengarkan Qari (Misyari Rasyid Al-Afasy)"
                              >
                                {isCurrentPlaying ? (
                                  <Pause className="w-4 h-4 fill-current" />
                                ) : (
                                  <Play className="w-4 h-4 fill-current" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Arabic Verse (Interactive Tajweed Support + Dynamic Font Size) */}
                        <div className="py-6 text-right">
                          {showTajwid && tajweedHtml ? (
                            <p
                              style={{ fontSize: `${fontSize}px` }}
                              className="font-quran text-slate-900 leading-loose tracking-wide"
                              dangerouslySetInnerHTML={{ __html: tajweedHtml }}
                            />
                          ) : (
                            <p
                              style={{ fontSize: `${fontSize}px` }}
                              className="font-quran text-slate-900 leading-loose tracking-wide"
                            >
                              {ayah.textArabic}
                            </p>
                          )}
                        </div>

                        {/* Transliteration & Indonesian Translation (Toggleable) */}
                        {showTranslation && (
                          <div className="space-y-1.5 pt-2 text-left">
                            {ayah.textLatin && (
                              <p className="text-xs sm:text-sm font-medium text-emerald-800 leading-relaxed">
                                {ayah.textLatin}
                              </p>
                            )}
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                              {ayah.translation}
                            </p>
                          </div>
                        )}

                        {/* Mutasyabihat Warning (if available) */}
                        {ayah.mutashabihat && ayah.mutashabihat.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMutashabih(ayah.mutashabihat || null);
                                setActiveAyahText({
                                  number: ayah.ayahNumber,
                                  text: ayah.textArabic,
                                });
                              }}
                              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-all cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Peringatan Ayat Serupa ({ayah.mutashabihat.length})</span>
                            </button>
                          </div>
                        )}

                        {/* Expandable Tafsir Section (Kemenag RI) */}
                        {isTafsirOpen && (
                          <div className="mt-4 pt-4 border-t border-emerald-100 bg-emerald-50/50 rounded-2xl p-4 sm:p-5 text-left animate-in fade-in duration-200">
                            <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-200/70">
                              <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs">
                                <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
                                <span>Tafsir Kemenag RI • QS. {currentSurah.nameLatin} Ayat {ayah.ayahNumber}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggleTafsir(ayah.ayahNumber)}
                                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 px-2 py-0.5 rounded-md hover:bg-emerald-100/70 transition-colors cursor-pointer"
                              >
                                Tutup Tafsir
                              </button>
                            </div>

                            {tafsirCache[currentSurah.number]?.[ayah.ayahNumber] ? (
                              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-sans">
                                {tafsirCache[currentSurah.number][ayah.ayahNumber]}
                              </p>
                            ) : (
                              <p className="text-xs text-slate-500 italic">
                                Tafsir untuk ayat ini sedang diproses atau tidak tersedia.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          /* ======================================================== */
          /* MODE 2: MUSHAF PER HALAMAN (Madinah Mushaf 604 Halaman)  */
          /* ======================================================== */
          <div className="space-y-6">
            {/* Mushaf Page Container */}
            <div className="relative bg-[#FCFBF7] rounded-3xl border-2 border-emerald-700/20 p-5 sm:p-10 shadow-lg shadow-emerald-900/5 min-h-[640px]">
              {/* Mushaf Top Frame Header */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-emerald-700/20 text-xs font-bold text-slate-700">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  {pageVerses[0]?.juz_number ? `Juz ${pageVerses[0].juz_number}` : 'Juz Al-Qur\'an'}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="p-1 rounded-lg hover:bg-emerald-100 disabled:opacity-30 cursor-pointer"
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4 text-emerald-800" />
                  </button>

                  <div className="text-center">
                    <span className="font-bold text-emerald-900 text-sm block">
                      {currentSurah?.nameLatin || 'Al-Qur\'an'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Hal. {currentPage} / 604
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(604, p + 1))}
                    disabled={currentPage >= 604}
                    className="p-1 rounded-lg hover:bg-emerald-100 disabled:opacity-30 cursor-pointer"
                    title="Halaman Selanjutnya"
                  >
                    <ChevronRight className="w-4 h-4 text-emerald-800" />
                  </button>
                </div>

                <span className="text-slate-500 font-medium hidden sm:inline">
                  Mushaf Madinah
                </span>
              </div>

              {/* Page Content: Continuous Quran Text */}
              {loadingPage ? (
                <div className="flex flex-col items-center justify-center py-32 text-emerald-700 space-y-2">
                  <Loader2 className="w-7 h-7 animate-spin" />
                  <span className="text-sm font-semibold">Membuka Halaman {currentPage}...</span>
                </div>
              ) : pageVerses.length > 0 ? (
                <div className="space-y-4">
                  {/* Bismillah Header jika awal surah di halaman ini */}
                  {pageVerses.some((v) => v.verse_key?.endsWith(':1')) && currentPage !== 1 && currentPage !== 187 && (
                    <div className="text-center py-4 border-y border-emerald-700/15 mb-4">
                      <span className="font-quran text-2xl sm:text-3xl text-emerald-900">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </span>
                    </div>
                  )}

                  {/* 15 Lines Aesthetic Quran Flow */}
                  <div
                    style={{ fontSize: `${fontSize}px` }}
                    className="font-quran text-slate-900 leading-[2.6] sm:leading-[2.8] text-justify text-right tracking-wide selection:bg-emerald-200"
                  >
                    {pageVerses.map((verse) => {
                      const parts = verse.verse_key.split(':');
                      const surahNum = parseInt(parts[0], 10);
                      const ayahNum = parseInt(parts[1], 10);
                      const isSelected = selectedMushafAyah?.verse_key === verse.verse_key;
                      const tajweedHtml = verse.text_uthmani_tajweed ? formatTajweedHtml(verse.text_uthmani_tajweed) : null;

                      return (
                        <span
                          key={verse.verse_key}
                          onClick={() => setSelectedMushafAyah(verse)}
                          className={`inline cursor-pointer transition-colors px-1 rounded-lg ${
                            isSelected ? 'bg-emerald-100/80 ring-2 ring-emerald-500/40' : 'hover:bg-emerald-50/70'
                          }`}
                          title={`QS. ${surahNum}:${ayahNum} - Klik untuk audio & terjemah`}
                        >
                          {showTajwid && tajweedHtml ? (
                            <span dangerouslySetInnerHTML={{ __html: tajweedHtml }} />
                          ) : (
                            <span>{verse.text_uthmani}</span>
                          )}{' '}
                          <span className="inline-flex items-center justify-center w-7 h-7 mx-1 rounded-full border border-amber-600/60 bg-amber-50/80 text-[11px] font-sans font-bold text-amber-900 select-none shadow-2xs align-middle">
                            {ayahNum}
                          </span>{' '}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-24 text-slate-500 text-sm">
                  Gagal memuat ayat untuk halaman {currentPage}.
                </div>
              )}

              {/* Bottom Caption */}
              <div className="mt-8 pt-4 border-t border-emerald-700/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
                <span>
                  Gunakan tombol panah atau tombol kiri-kanan untuk pindah halaman
                </span>
                <span className="font-medium text-emerald-800">
                  Ketuk teks ayat untuk memutar audio, tafsir, & terjemahan
                </span>
              </div>
            </div>

            {/* Quick Action Drawer for Selected Verse in Mushaf View */}
            {selectedMushafAyah && (
              <div className="p-5 rounded-3xl bg-white border border-emerald-200 shadow-xl space-y-3 animate-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs">
                      QS. {selectedMushafAyah.verse_key}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Halaman {selectedMushafAyah.page_number} • Juz {selectedMushafAyah.juz_number}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {/* Audio Play for Mushaf Selected Verse */}
                    <button
                      type="button"
                      onClick={() => {
                        const parts = selectedMushafAyah.verse_key.split(':');
                        const sPad = String(parts[0]).padStart(3, '0');
                        const aPad = String(parts[1]).padStart(3, '0');
                        const audioUrl = `https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/${sPad}${aPad}.mp3`;
                        handleToggleAudio(parseInt(parts[1], 10), audioUrl);
                      }}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Audio</span>
                    </button>

                    {/* Bookmark */}
                    <button
                      type="button"
                      onClick={() => {
                        const parts = selectedMushafAyah.verse_key.split(':');
                        handleSetLastRead(
                          parseInt(parts[0], 10),
                          currentSurah?.nameLatin || `Surah ${parts[0]}`,
                          parseInt(parts[1], 10)
                        );
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Simpan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMushafAyah(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {selectedMushafAyah.translations?.[0]?.text || 'Terjemahan Kemenag RI'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        /* ======================================================== */
        /* 3. MAIN CATALOG VIEW (Al-Qur'an Daftar Surah & Juz)     */
        /* ======================================================== */
        <div className="space-y-5">
          {/* Centered Main Title: Al-Qur'an */}
          <div className="text-center pt-2">
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight">
              Al-Qur'an
            </h1>
          </div>

          {/* Banner: TERAKHIR BACA */}
          <div
            onClick={() => {
              setSelectedSurahNumber(lastRead.surahNumber);
              setTargetAyahToScroll(lastRead.ayahNumber);
            }}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-3xl p-5 sm:p-6 shadow-md shadow-emerald-600/15 cursor-pointer relative overflow-hidden transition-all group"
          >
            <div className="absolute right-4 bottom-2 opacity-15 pointer-events-none group-hover:scale-105 transition-transform">
              <BookOpen className="w-28 h-28" />
            </div>

            <div className="relative z-10 space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-100 text-xs font-bold tracking-wider uppercase">
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                <span>TERAKHIR BACA</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {lastRead.surahName}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-50 font-medium">
                Berhenti di Ayat {lastRead.ayahNumber}
              </p>
            </div>
          </div>

          {/* Segmented Switcher: [ Surah ] | [ Juz ] */}
          <div className="bg-slate-200/70 p-1 rounded-2xl grid grid-cols-2 text-xs sm:text-sm font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('surah')}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'surah'
                  ? 'bg-white text-emerald-800 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Surah
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('juz')}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'juz'
                  ? 'bg-white text-emerald-800 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Juz
            </button>
          </div>

          {/* Search Bar Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'surah' ? 'Cari nama surah atau nomor...' : 'Cari nomor juz atau nama surah...'}
              className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills: [ Semua ] [ Makiyyah ] [ Madaniyyah ] */}
          {activeTab === 'surah' && (
            <div className="flex items-center space-x-2 pt-0.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setRevelationFilter('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  revelationFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setRevelationFilter('makiyyah')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  revelationFilter === 'makiyyah'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Makiyyah
              </button>
              <button
                type="button"
                onClick={() => setRevelationFilter('madaniyyah')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  revelationFilter === 'madaniyyah'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Madaniyyah
              </button>
            </div>
          )}

          {/* List Content: Surah List or Juz List */}
          {loadingList ? (
            <div className="flex items-center justify-center py-20 text-emerald-700 space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-semibold">Memuat 114 Surah dari EQuran.id...</span>
            </div>
          ) : activeTab === 'surah' ? (
            /* SURAH LIST */
            <div className="space-y-2.5">
              {filteredSurahs.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
                  Surah tidak ditemukan untuk kata kunci "{searchQuery}".
                </div>
              ) : (
                filteredSurahs.map((surah) => {
                  const normRev = getNormRevelation(surah.revelationType);
                  return (
                    <div
                      key={surah.number}
                      onClick={() => {
                        setSelectedSurahNumber(surah.number);
                        setTargetAyahToScroll(1);
                      }}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-emerald-300 transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-xs sm:text-sm group-hover:bg-emerald-50 group-hover:text-emerald-800 group-hover:border-emerald-200 transition-colors shrink-0">
                          {surah.number}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-800 transition-colors">
                            {surah.nameLatin}
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium">
                            <span className="text-emerald-700 font-semibold">{normRev}</span> • {surah.numberOfAyahs} Ayat • {surah.translation}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-quran text-xl sm:text-2xl text-emerald-800 block">
                          {surah.nameArabic}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* JUZ LIST (30 JUZ) */
            <div className="space-y-2.5">
              {filteredJuz.map((juz) => (
                <div
                  key={juz.number}
                  onClick={() => {
                    setSelectedSurahNumber(juz.startSurahNumber);
                    setTargetAyahToScroll(juz.startAyah);
                  }}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-emerald-300 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-800 text-xs sm:text-sm shrink-0">
                      {juz.number}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-800 transition-colors">
                        Juz {juz.number}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Mulai: <span className="font-semibold text-slate-700">QS. {juz.startSurahName}:{juz.startAyah}</span> s.d. <span className="font-semibold text-slate-700">QS. {juz.endSurahName}:{juz.endAyah}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-quran text-xl sm:text-2xl text-emerald-800 block">
                      {juz.nameArabic}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. MODALS: PANDUAN WARNA TAJWID                          */}
      {/* ======================================================== */}
      {showTajwidGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-emerald-900">
                <Palette className="w-5 h-5 text-emerald-600 shrink-0" />
                <h3 className="font-bold text-base">Panduan Warna Tajwid Interaktif</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTajwidGuide(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Warna tajwid otomatis menandai hukum bacaan pada ayat Al-Qur'an untuk memudahkan tilawah dengan tartil yang benar:
            </p>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {Object.entries(TAJWEED_RULES).map(([key, item]) => (
                <div
                  key={key}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full shrink-0 ${
                        key === 'ghunnah' ? 'bg-amber-600' :
                        key.includes('idgham_ghunnah') ? 'bg-emerald-600' :
                        key.includes('iqlab') ? 'bg-cyan-600' :
                        key.includes('ikhafa') ? 'bg-blue-600' :
                        key.includes('qalaqah') ? 'bg-sky-500' :
                        key.includes('necessary') ? 'bg-purple-600' :
                        key.includes('madda') ? 'bg-red-600' :
                        'bg-slate-400'
                      }`} />
                      <span className={`font-bold ${item.color}`}>{item.label}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed pl-5">
                      {item.desc}
                    </p>
                  </div>
                  <span className="font-quran text-base text-slate-800 text-right shrink-0">
                    {item.example}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowTajwidGuide(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Mengerti & Lanjutkan Membaca
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODALS: INFO SURAH & ASBABUN NUZUL                     */}
      {/* ======================================================== */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-emerald-900">
                <Info className="w-5 h-5 text-emerald-600 shrink-0" />
                <h3 className="font-bold text-base">
                  Info Surah & Asbabun Nuzul • {currentSurah?.nameLatin}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metadata Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block">Nomor Surah</span>
                <span className="font-bold text-slate-900 text-sm">Ke-{currentSurah?.number}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block">Golongan</span>
                <span className="font-bold text-emerald-800 text-sm">{getNormRevelation(currentSurah?.revelationType)}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block">Jumlah Ayat</span>
                <span className="font-bold text-slate-900 text-sm">{currentSurah?.numberOfAyahs} Ayat</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block">Arti Nama</span>
                <span className="font-bold text-slate-900 text-sm truncate">{currentSurah?.translation}</span>
              </div>
            </div>

            {/* Content Body */}
            {loadingInfo ? (
              <div className="flex items-center justify-center py-12 text-emerald-700 space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs font-semibold">Memuat Asbabun Nuzul & penjelasan surah...</span>
              </div>
            ) : chapterInfo?.fullText ? (
              <div
                className="prose prose-xs sm:prose-sm text-slate-700 max-h-80 overflow-y-auto pr-2 space-y-3 font-sans leading-relaxed"
                dangerouslySetInnerHTML={{ __html: chapterInfo.fullText }}
              />
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 text-xs text-slate-700 leading-relaxed">
                <p className="font-semibold text-slate-900">Deskripsi Surah:</p>
                <p>
                  Surah {currentSurah?.nameLatin} ({currentSurah?.nameArabic}) terdiri atas {currentSurah?.numberOfAyahs} ayat dan diturunkan di {getNormRevelation(currentSurah?.revelationType)}.
                </p>
                <p className="text-slate-500 italic">
                  Sumber data kajian resmi Kementerian Agama Republik Indonesia (Kemenag RI) & King Fahad Complex.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Tutup Informasi
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODALS: MUTASYABIHAT (Ayat Serupa)                    */}
      {/* ======================================================== */}
      {activeMutashabih && activeAyahText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <h3 className="font-bold text-base">Peringatan Ayat Mutasyabihat</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveMutashabih(null);
                  setActiveAyahText(null);
                }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Ayat yang sedang dibaca (Ayat {activeAyahText.number}):
              </span>
              <p className="font-quran text-lg text-slate-800 text-right leading-relaxed">
                {activeAyahText.text}
              </p>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {activeMutashabih.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-amber-900 font-bold">
                    <span>
                      QS. {m.surahName} : Ayat {m.ayahNumber}
                    </span>
                    <span className="text-[10px] bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                      Kemiripan {m.similarity}
                    </span>
                  </div>
                  <p className="font-quran text-base text-slate-900 text-right leading-relaxed">
                    {m.textArabic}
                  </p>
                  <p className="text-[11px] text-amber-950/80 italic font-medium pt-1 border-t border-amber-200/40">
                    💡 Perhatian: {m.note}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveMutashabih(null);
                setActiveAyahText(null);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Mengerti & Lanjutkan Membaca
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
