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

  // Tafsir Feature State (EQuran.id API v2 Tafsir Kemenag RI)
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

  // Fetch 114 Surahs from EQuran.id API v2
  useEffect(() => {
    setLoadingList(true);
    fetch('https://equran.id/api/v2/surat')
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat daftar surah dari EQuran.id');
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
        } else {
          throw new Error('Format data tidak sesuai');
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

  // Fetch Surah Detail from EQuran.id API v2 when selected
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
    setExpandedTafsir({}); // Reset tafsir toggle when changing surah

    setLoadingDetail(true);
    fetch(`https://equran.id/api/v2/surat/${selectedSurahNumber}`)
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat detail surah');
        return res.json();
      })
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

          // Enrich ayahs with Mutasyabihat detection from backend if available
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
      .catch((err) => {
        console.warn('Gagal memuat detail online dari EQuran.id:', err);
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

  // Handle Toggle Tafsir per Ayah (Kemenag RI)
  const handleToggleTafsir = async (ayahNumber: number) => {
    if (!selectedSurahNumber) return;

    // If currently open, toggle to close
    if (expandedTafsir[ayahNumber]) {
      setExpandedTafsir((prev) => ({ ...prev, [ayahNumber]: false }));
      return;
    }

    // If already cached for this surah, immediately open
    if (tafsirCache[selectedSurahNumber]) {
      setExpandedTafsir((prev) => ({ ...prev, [ayahNumber]: true }));
      return;
    }

    // Fetch tafsir from https://equran.id/api/v2/tafsir/{selectedSurahNumber}
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
    <div className="space-y-6 max-w-4xl mx-auto font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. ACTIVE AYAH READER VIEW (Ketika Surah Dipilih) */}
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

                {/* Bismillah Header (kecuali Surah At-Taubah 9 & Al-Fatihah 1) */}
                {currentSurah.number !== 9 && currentSurah.number !== 1 && (
                  <div className="mt-6 pt-6 border-t border-emerald-700/60 text-center">
                    <span className="font-quran text-3xl sm:text-4xl text-emerald-100 tracking-wider">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </span>
                  </div>
                )}
              </div>

              {/* Ayah List (Matches the User's Image Reference with Tafsir Feature) */}
              <div className="space-y-4">
                {currentSurah.ayahs.map((ayah) => {
                  const isCurrentPlaying = playingAyah === ayah.ayahNumber;
                  const isLastReadAyah =
                    lastRead.surahNumber === currentSurah.number &&
                    lastRead.ayahNumber === ayah.ayahNumber;
                  const isTafsirOpen = !!expandedTafsir[ayah.ayahNumber];
                  const isLoadingTafsirThis = loadingTafsirAyah === ayah.ayahNumber;

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

                      {/* Arabic Verse */}
                      <div className="py-6 text-right">
                        <p className="font-quran text-2xl sm:text-3xl text-slate-900 leading-loose tracking-wide">
                          {ayah.textArabic}
                        </p>
                      </div>

                      {/* Transliteration & Indonesian Translation */}
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

                      {/* Tafsir Expandable Panel (Muncul tepat di bawah artinya saat logo buku diklik) */}
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
        /* 2. MAIN CATALOG VIEW (Al-Qur'an Daftar Surah & Juz) */
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
                      {/* Left: Number + Title + Revelation Meta */}
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

                      {/* Right: Arabic Name */}
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

      {/* Mutasyabihat Modal Dialog */}
      {activeMutashabih && activeAyahText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <h3 className="font-black text-sm sm:text-base">
                  Peringatan Ayat Mutasyabihat
                </h3>
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
