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
} from 'lucide-react';
import type { SurahSummary, SurahDetail, MutashabihaItem } from '../types';

// Fallback high-fidelity data for Surah An-Naba' (78) with Tarteel QUL Mutasyabihat
const FALLBACK_AN_NABA: SurahDetail = {
  number: 78,
  nameArabic: 'النبإ',
  nameLatin: "An-Naba'",
  numberOfAyahs: 40,
  revelationType: 'Makkiyyah',
  translation: 'Berita Besar',
  audioFull: 'https://equran.nos.wjv-1.neo.id/audio-full/Misyari-Rasyid-Al-Afasi/078.mp3',
  ayahs: [
    {
      ayahNumber: 1,
      textArabic: 'عَمَّ يَتَسَآءَلُونَ',
      textLatin: "'Amma yatasaa'aluun",
      translation: 'Tentang apakah mereka saling bertanya-tanya?',
      audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/078001.mp3',
      mutashabihat: [
        {
          surahNumber: 77,
          surahName: 'Al-Mursalat',
          ayahNumber: 1,
          textArabic: 'وَالْمُرْسَلَٰتِ عُرْفًا',
          similarity: 'Kemiripan Irama Pembuka Surah',
          note: "Hati-hati waqaf; akhir ayat An-Naba' 1 menggunakan madd wajib muttashil panjang, jangan melompat ke surah Al-Mursalat.",
        },
      ],
    },
    {
      ayahNumber: 2,
      textArabic: 'عَنِ النَّبَإِ الْعَظِيمِ',
      textLatin: "'Anin-naba'il-'azhiim",
      translation: 'Tentang berita yang besar (hari berbangkit),',
      audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/078002.mp3',
      mutashabihat: [],
    },
    {
      ayahNumber: 3,
      textArabic: 'الَّذِي هُمْ فِيهِ مُخْتَلِفُونَ',
      textLatin: "Alladzii hum fiihi mukhtalifuun",
      translation: 'yang dalam hal itu mereka berselisih.',
      audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/078003.mp3',
      mutashabihat: [],
    },
    {
      ayahNumber: 4,
      textArabic: 'كَلَّا سَيَعْلَمُونَ',
      textLatin: 'Kallaa saya’lamuun',
      translation: 'Sekali-kali tidak! Kelak mereka akan mengetahui,',
      audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/078004.mp3',
      mutashabihat: [
        {
          surahNumber: 78,
          surahName: "An-Naba'",
          ayahNumber: 5,
          textArabic: 'ثُمَّ كَلَّا سَيَعْلَمُونَ',
          similarity: 'Penekanan Berulang (Tawkid)',
          note: "Ayat 4 diawali langsung dengan 'كَلَّا', sedangkan ayat 5 ada tambahan kata penegas 'ثُمَّ'. Jangan terbalik urutannya.",
        },
      ],
    },
    {
      ayahNumber: 5,
      textArabic: 'ثُمَّ كَلَّا سَيَعْلَمُونَ',
      textLatin: 'Tsumma kallaa saya’lamuun',
      translation: 'kemudian sekali-kali tidak! Kelak mereka akan mengetahui.',
      audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/078005.mp3',
      mutashabihat: [
        {
          surahNumber: 78,
          surahName: "An-Naba'",
          ayahNumber: 4,
          textArabic: 'كَلَّا سَيَعْلَمُونَ',
          similarity: 'Penekanan Berulang (Tawkid)',
          note: "Ayat 5 menggunakan awalan 'ثُمَّ', sebagai penguat dari ayat 4 sebelumnya.",
        },
        {
          surahNumber: 102,
          surahName: 'At-Takatsur',
          ayahNumber: 3,
          textArabic: 'كَلَّا سَوْفَ تَعْلَمُونَ',
          similarity: 'Wazan Ancaman / Peringatan',
          note: "QS. At-Takatsur menggunakan lafal 'سَوْفَ تَعْلَمُونَ' (huruf Ta), sedangkan An-Naba' menggunakan 'سَيَعْلَمُونَ' (huruf Sin + Ya).",
        },
      ],
    },
  ],
};

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
  { number: 11, nameArabic: 'الجزء ١١', startSurahNumber: 9, startSurahName: "At-Taubah", startAyah: 93, endSurahName: 'Hud', endAyah: 5 },
  { number: 12, nameArabic: 'الجزء ١٢', startSurahNumber: 11, startSurahName: 'Hud', startAyah: 6, endSurahName: 'Yusuf', endAyah: 52 },
  { number: 13, nameArabic: 'الجزء ١٣', startSurahNumber: 12, startSurahName: 'Yusuf', startAyah: 53, endSurahName: 'Ibrahim', endAyah: 52 },
  { number: 14, nameArabic: 'الجزء ١٤', startSurahNumber: 15, startSurahName: 'Al-Hijr', startAyah: 1, endSurahName: 'An-Nahl', endAyah: 128 },
  { number: 15, nameArabic: 'الجزء ١٥', startSurahNumber: 17, startSurahName: "Al-Isra'", startAyah: 1, endSurahName: 'Al-Kahf', endAyah: 74 },
  { number: 16, nameArabic: 'الجزء ١٦', startSurahNumber: 18, startSurahName: 'Al-Kahf', startAyah: 75, endSurahName: 'Ta-Ha', endAyah: 135 },
  { number: 17, nameArabic: 'الجزء ١٧', startSurahNumber: 21, startSurahName: 'Al-Anbiya', startAyah: 1, endSurahName: 'Al-Hajj', endAyah: 78 },
  { number: 18, nameArabic: 'الجزء ١٨', startSurahNumber: 23, startSurahName: "Al-Mu'minun", startAyah: 1, endSurahName: 'Al-Furqan', endAyah: 20 },
  { number: 19, nameArabic: 'الجزء ١٩', startSurahNumber: 25, startSurahName: 'Al-Furqan', startAyah: 21, endSurahName: 'An-Naml', endAyah: 55 },
  { number: 20, nameArabic: 'الجزء ٢٠', startSurahNumber: 27, startSurahName: 'An-Naml', startAyah: 56, endSurahName: "Al-'Ankabut", endAyah: 45 },
  { number: 21, nameArabic: 'الجزء ٢١', startSurahNumber: 29, startSurahName: "Al-'Ankabut", startAyah: 46, endSurahName: 'Al-Ahzab', endAyah: 30 },
  { number: 22, nameArabic: 'الجزء ٢٢', startSurahNumber: 33, startSurahName: 'Al-Ahzab', startAyah: 31, endSurahName: 'Ya-Sin', endAyah: 27 },
  { number: 23, nameArabic: 'الجزء ٢٣', startSurahNumber: 36, startSurahName: 'Ya-Sin', startAyah: 28, endSurahName: 'Az-Zumar', endAyah: 31 },
  { number: 24, nameArabic: 'الجزء ٢٤', startSurahNumber: 39, startSurahName: 'Az-Zumar', startAyah: 32, endSurahName: 'Fussilat', endAyah: 46 },
  { number: 25, nameArabic: 'الجزء ٢٥', startSurahNumber: 41, startSurahName: 'Fussilat', startAyah: 47, endSurahName: 'Al-Jasiyah', endAyah: 37 },
  { number: 26, nameArabic: 'الجزء ٢٦', startSurahNumber: 46, startSurahName: 'Al-Ahqaf', startAyah: 1, endSurahName: 'Az-Zariyat', endAyah: 30 },
  { number: 27, nameArabic: 'الجزء ٢٧', startSurahNumber: 51, startSurahName: 'Az-Zariyat', startAyah: 31, endSurahName: 'Al-Hadid', endAyah: 29 },
  { number: 28, nameArabic: 'الجزء ٢٨', startSurahNumber: 58, startSurahName: 'Al-Mujadilah', startAyah: 1, endSurahName: 'At-Tahrim', endAyah: 12 },
  { number: 29, nameArabic: 'الجزء ٢٩', startSurahNumber: 67, startSurahName: 'Al-Mulk', startAyah: 1, endSurahName: 'Al-Mursalat', endAyah: 50 },
  { number: 30, nameArabic: 'الجزء ٣٠', startSurahNumber: 78, startSurahName: "An-Naba'", startAyah: 1, endSurahName: 'An-Nas', endAyah: 6 },
];

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

  // Audio & Modals
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [isPlayingFull, setIsPlayingFull] = useState(false);
  const [activeMutashabih, setActiveMutashabih] = useState<MutashabihaItem[] | null>(null);
  const [activeAyahText, setActiveAyahText] = useState<{ number: number; text: string } | null>(null);
  const [bookmarkedFeedback, setBookmarkedFeedback] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fullAudioRef = useRef<HTMLAudioElement | null>(null);

  // Terakhir Baca State (loaded from localStorage or default Surah ke-14 Ayat 25)
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
      surahNumber: 14,
      surahName: 'Surah ke-14',
      ayahNumber: 25,
    };
  });

  // Fetch Surah List from Backend Proxy
  useEffect(() => {
    fetch('/api/v1/quran/surahs')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load surah list');
        return res.json();
      })
      .then((data: SurahSummary[]) => {
        setSurahs(data);
      })
      .catch((err) => {
        console.warn('Backend proxy offline, loading standard surahs:', err);
        // Fallback Juz 'Amma / standard surahs
        const fallbackList: SurahSummary[] = [
          { number: 1, nameArabic: 'الفاتحة', nameLatin: 'Al-Fatihah', numberOfAyahs: 7, revelationType: 'Makkiyyah', translation: 'Pembukaan' },
          { number: 2, nameArabic: 'البقرة', nameLatin: 'Al-Baqarah', numberOfAyahs: 286, revelationType: 'Madaniyyah', translation: 'Sapi Betina' },
          { number: 3, nameArabic: 'آل عمران', nameLatin: "Ali 'Imran", numberOfAyahs: 200, revelationType: 'Madaniyyah', translation: "Keluarga 'Imran" },
          { number: 4, nameArabic: 'النساء', nameLatin: "An-Nisa'", numberOfAyahs: 176, revelationType: 'Madaniyyah', translation: 'Wanita' },
          { number: 14, nameArabic: 'إبراهيم', nameLatin: 'Ibrahim', numberOfAyahs: 52, revelationType: 'Makkiyyah', translation: 'Nabi Ibrahim' },
          { number: 78, nameArabic: 'النبإ', nameLatin: "An-Naba'", numberOfAyahs: 40, revelationType: 'Makkiyyah', translation: 'Berita Besar' },
          { number: 79, nameArabic: 'النازعات', nameLatin: "An-Nazi'at", numberOfAyahs: 46, revelationType: 'Makkiyyah', translation: 'Malaikat Pencabut' },
          { number: 80, nameArabic: 'عبس', nameLatin: "'Abasa", numberOfAyahs: 42, revelationType: 'Makkiyyah', translation: 'Ia Bermuka Masam' },
          { number: 112, nameArabic: 'الإخلاص', nameLatin: 'Al-Ikhlas', numberOfAyahs: 4, revelationType: 'Makkiyyah', translation: 'Kemurnian Keesaan Allah' },
          { number: 113, nameArabic: 'الفلق', nameLatin: 'Al-Falaq', numberOfAyahs: 5, revelationType: 'Makkiyyah', translation: 'Waktu Subuh' },
          { number: 114, nameArabic: 'الناس', nameLatin: 'An-Nas', numberOfAyahs: 6, revelationType: 'Makkiyyah', translation: 'Manusia' },
        ];
        setSurahs(fallbackList);
      })
      .finally(() => setLoadingList(false));
  }, []);

  // Fetch Surah Detail when selected
  useEffect(() => {
    if (!selectedSurahNumber) {
      setCurrentSurah(null);
      return;
    }

    // Stop existing audio
    if (audioRef.current) audioRef.current.pause();
    if (fullAudioRef.current) fullAudioRef.current.pause();
    setPlayingAyah(null);
    setIsPlayingFull(false);

    if (selectedSurahNumber === 78) {
      setCurrentSurah(FALLBACK_AN_NABA);
      return;
    }

    setLoadingDetail(true);
    fetch(`/api/v1/quran/surahs/${selectedSurahNumber}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load surah detail');
        return res.json();
      })
      .then((data: SurahDetail) => {
        setCurrentSurah(data);
      })
      .catch((err) => {
        console.warn('Failed to load online detail, showing fallback:', err);
        setCurrentSurah(FALLBACK_AN_NABA);
      })
      .finally(() => setLoadingDetail(false));
  }, [selectedSurahNumber]);

  // Scroll to target ayah if requested
  useEffect(() => {
    if (targetAyahToScroll && currentSurah && !loadingDetail) {
      setTimeout(() => {
        const el = document.getElementById(`ayah-${targetAyahToScroll}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [targetAyahToScroll, currentSurah, loadingDetail]);

  // Normalize revelation type helper
  const getNormRevelation = (type: string | undefined): 'Makkiyyah' | 'Madaniyyah' => {
    if (!type) return 'Makkiyyah';
    const lower = type.toLowerCase();
    if (lower.includes('mad')) return 'Madaniyyah';
    return 'Makkiyyah';
  };

  // Filtered Surahs
  const filteredSurahs = useMemo(() => {
    return surahs.filter((surah) => {
      // 1. Text Search Filter (nameLatin or number)
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        surah.nameLatin.toLowerCase().includes(q) ||
        surah.number.toString() === q ||
        (surah.translation && surah.translation.toLowerCase().includes(q));

      // 2. Revelation Type Filter (Makiyyah vs Madaniyyah)
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
    <div className="space-y-6 max-w-4xl mx-auto font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* If a surah is selected, show the Active Ayah Reader View */}
      {selectedSurahNumber !== null ? (
        <div className="space-y-6">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setSelectedSurahNumber(null);
                setTargetAyahToScroll(null);
              }}
              className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Surah / Juz</span>
            </button>

            {bookmarkedFeedback && (
              <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl animate-in fade-in flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{bookmarkedFeedback}</span>
              </div>
            )}
          </div>

          {loadingDetail ? (
            <div className="flex items-center justify-center py-24 text-emerald-700 space-x-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm font-semibold">Membuka lembaran surah...</span>
            </div>
          ) : currentSurah ? (
            <div className="space-y-6">
              {/* Surah Header Card */}
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

                  <div className="text-center sm:text-right space-y-3">
                    <span className="font-quran text-4xl sm:text-5xl text-emerald-200 block leading-tight">
                      {currentSurah.nameArabic}
                    </span>

                    {currentSurah.audioFull && (
                      <button
                        type="button"
                        onClick={handleToggleFullAudio}
                        className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xs transition-all cursor-pointer"
                      >
                        {isPlayingFull ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>Jeda Murottal Full</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Putar Full Surah</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Bismillah Header (except Surah At-Taubah 9) */}
                {currentSurah.number !== 9 && currentSurah.number !== 1 && (
                  <div className="mt-6 pt-6 border-t border-emerald-700/60 text-center">
                    <span className="font-quran text-3xl sm:text-4xl text-emerald-100 tracking-wider">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </span>
                  </div>
                )}
              </div>

              {/* Ayah List */}
              <div className="space-y-4">
                {currentSurah.ayahs.map((ayah) => {
                  const isCurrentPlaying = playingAyah === ayah.ayahNumber;
                  const isLastReadAyah =
                    lastRead.surahNumber === currentSurah.number &&
                    lastRead.ayahNumber === ayah.ayahNumber;

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
                      {/* Top Bar Ayah: Actions & Mutasyabihat */}
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center space-x-2">
                          <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xs font-black text-slate-800">
                            {ayah.ayahNumber}
                          </span>

                          {/* Audio Player Button */}
                          {ayah.audioUrl && (
                            <button
                              type="button"
                              onClick={() => handleToggleAudio(ayah.ayahNumber, ayah.audioUrl)}
                              className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
                                isCurrentPlaying
                                  ? 'bg-emerald-600 text-white'
                                  : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title="Dengarkan Qari"
                            >
                              {isCurrentPlaying ? (
                                <Pause className="w-3.5 h-3.5 fill-current" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current" />
                              )}
                            </button>
                          )}

                          {/* Bookmark as Last Read */}
                          <button
                            type="button"
                            onClick={() =>
                              handleSetLastRead(
                                currentSurah.number,
                                currentSurah.nameLatin,
                                ayah.ayahNumber
                              )
                            }
                            className={`p-1.5 rounded-lg text-xs transition-all flex items-center space-x-1 cursor-pointer ${
                              isLastReadAyah
                                ? 'bg-emerald-100 text-emerald-800 font-bold'
                                : 'text-slate-400 hover:text-emerald-700 hover:bg-slate-100'
                            }`}
                            title="Tandai Sebagai Terakhir Dibaca"
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isLastReadAyah ? 'fill-current' : ''}`} />
                            <span className="text-[11px] hidden sm:inline">
                              {isLastReadAyah ? 'Terakhir Dibaca' : 'Tandai Baca'}
                            </span>
                          </button>
                        </div>

                        {/* Mutasyabihat Detection Badge */}
                        {ayah.mutashabihat && ayah.mutashabihat.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMutashabih(ayah.mutashabihat || null);
                              setActiveAyahText({
                                number: ayah.ayahNumber,
                                text: ayah.textArabic,
                              });
                            }}
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer shadow-2xs"
                            title="Lihat Peringatan Ayat Serupa (Tarteel QUL)"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Peringatan Ayat Serupa ({ayah.mutashabihat.length})</span>
                          </button>
                        )}
                      </div>

                      {/* Arabic Verse */}
                      <div className="py-6 text-right">
                        <p className="font-quran text-2xl sm:text-3xl text-slate-900 leading-loose tracking-wide">
                          {ayah.textArabic}
                        </p>
                      </div>

                      {/* Translation & Latin */}
                      <div className="space-y-1 pt-2 border-t border-slate-100 text-left">
                        {ayah.textLatin && (
                          <p className="text-xs font-medium text-emerald-800 italic">
                            {ayah.textLatin}
                          </p>
                        )}
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {ayah.translation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        /* Main Catalog View (Matches User's Design Image) */
        <div className="space-y-5">
          {/* Centered Main Title: Al-Qur'an */}
          <div className="text-center pt-2">
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight">
              Al-Qur'an
            </h1>
          </div>

          {/* Banner: TERAKHIR BACA (Matches User's Design Image) */}
          <div
            onClick={() => {
              setSelectedSurahNumber(lastRead.surahNumber);
              setTargetAyahToScroll(lastRead.ayahNumber);
            }}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-3xl p-5 sm:p-6 shadow-md shadow-emerald-500/15 cursor-pointer relative overflow-hidden transition-all group"
          >
            {/* Watermark Book Icon */}
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

          {/* Segmented Switcher: [ Surah ] | [ Juz ] (Matches User's Design Image) */}
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

          {/* Search Bar Input (Matches User's Design Image) */}
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

          {/* Category Filter Pills: [ Semua ] [ Makiyyah ] [ Madaniyyah ] (Only on Surah Tab) */}
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
              <span className="text-sm font-semibold">Memuat daftar Al-Qur'an...</span>
            </div>
          ) : activeTab === 'surah' ? (
            /* SURAH LIST (Matches User's Design Image) */
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
                      {/* Left: Number + Title + Revelation Meta */}
                      <div className="flex items-center space-x-3.5">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-xs sm:text-sm group-hover:bg-emerald-50 group-hover:text-emerald-800 group-hover:border-emerald-200 transition-colors shrink-0">
                          {surah.number}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-800 transition-colors">
                            {surah.nameLatin}
                          </h3>
                          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            {normRev.toUpperCase()} • {surah.numberOfAyahs} AYAT
                          </span>
                        </div>
                      </div>

                      {/* Right: Arabic Calligraphy */}
                      <div className="text-right">
                        <span className="font-quran text-2xl sm:text-3xl text-emerald-700 leading-tight block">
                          {surah.nameArabic}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* JUZ LIST (Matches User's Request: 'filter persurat terus juga perjuz') */
            <div className="space-y-2.5">
              {filteredJuz.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
                  Juz tidak ditemukan untuk kata kunci "{searchQuery}".
                </div>
              ) : (
                filteredJuz.map((juz) => (
                  <div
                    key={juz.number}
                    onClick={() => {
                      setSelectedSurahNumber(juz.startSurahNumber);
                      setTargetAyahToScroll(juz.startAyah);
                    }}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-emerald-300 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center font-bold text-teal-800 text-xs sm:text-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                        {juz.number}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-800 transition-colors">
                          Juz {juz.number}
                        </h3>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          {juz.startSurahName} {juz.startAyah} - {juz.endSurahName} {juz.endAyah}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-quran text-xl sm:text-2xl text-teal-700 leading-tight block">
                        {juz.nameArabic}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Tarteel QUL Mutasyabihat Comparison Modal */}
      {activeMutashabih && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Peringatan Ayat Mutasyabihat (Tarteel QUL)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveMutashabih(null);
                  setActiveAyahText(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Currently Active Ayah */}
            {activeAyahText && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Ayat yang Sedang Anda Baca (Ayat {activeAyahText.number}):
                </span>
                <p className="font-quran text-xl text-right text-slate-900 leading-relaxed">
                  {activeAyahText.text}
                </p>
              </div>
            )}

            {/* List of Similar Comparison Verses */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                Perbandingan dengan Surah / Ayat Lain:
              </span>
              {activeMutashabih.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800">
                      QS. {item.surahName} (Surah {item.surahNumber}): Ayat {item.ayahNumber}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {item.similarity}
                    </span>
                  </div>

                  <p className="font-quran text-lg text-right text-slate-900 leading-relaxed">
                    {item.textArabic}
                  </p>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 text-slate-600 text-[11px] leading-relaxed">
                    <span className="font-bold text-slate-800">Catatan Pembeda: </span>
                    {item.note}
                  </div>
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
              Tutup Perbandingan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
