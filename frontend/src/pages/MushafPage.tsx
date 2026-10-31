import { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Loader2,
  Pause,
  Play,
  X,
  Info,
  ChevronDown,
} from 'lucide-react';
import type { SurahSummary, SurahDetail, AyahDetail, MutashabihaItem } from '../types';

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
    {
      ayahNumber: 6,
      textArabic: 'أَلَمْ نَجْعَلِ الْأَرْضَ مِهَٰدًا',
      textLatin: "Alam naj'alil-ardha mihaadaa",
      translation: 'Bukankah Kami telah menjadikan bumi sebagai hamparan,',
      audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/078006.mp3',
      mutashabihat: [
        {
          surahNumber: 20,
          surahName: 'Taha',
          ayahNumber: 53,
          textArabic: 'الَّذِي جَعَلَ لَكُمُ الْأَرْضَ مَهْدًا',
          similarity: 'Penyebutan Hamparan Bumi',
          note: "Di An-Naba' menggunakan bentuk wazan 'مِهَٰدًا' (dengan kasrah dan alif), sedangkan di Surah Taha menggunakan 'مَهْدًا'.",
        },
      ],
    },
    {
      ayahNumber: 7,
      textArabic: 'وَالْجِبَالَ أَوْتَادًا',
      textLatin: "Wal-jibaala awtaadaa",
      translation: 'dan gunung-gunung sebagai pasak?',
      audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/078007.mp3',
      mutashabihat: [],
    },
    {
      ayahNumber: 8,
      textArabic: 'وَخَلَقْنَٰكُمْ أَزْوَٰجًا',
      textLatin: "Wa khalaqnaakum azwaajaa",
      translation: 'Dan Kami menciptakan kamu berpasang-pasangan,',
      audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/078008.mp3',
      mutashabihat: [],
    },
    {
      ayahNumber: 9,
      textArabic: 'وَجَعَلْنَا نَوْمَكُمْ سُبَاتًا',
      textLatin: "Wa ja'alnaa nawmakum subaataa",
      translation: 'dan Kami menjadikan tidurmu untuk istirahat,',
      audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/078009.mp3',
      mutashabihat: [],
    },
    {
      ayahNumber: 10,
      textArabic: 'وَجَعَلْنَا الَّيْلَ لِبَاسًا',
      textLatin: "Wa ja'alnal-layla libaasaa",
      translation: 'dan Kami menjadikan malam sebagai pakaian,',
      audioUrl: 'https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/078010.mp3',
      mutashabihat: [],
    },
  ],
};

export default function MushafPage() {
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(78);
  const [currentSurah, setCurrentSurah] = useState<SurahDetail | null>(FALLBACK_AN_NABA);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Audio playing state
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Mutasyabihat Drawer state
  const [activeMutasyabihModal, setActiveMutasyabihModal] = useState<{
    ayah: AyahDetail;
    items: MutashabihaItem[];
  } | null>(null);

  // Fetch Surah list for Juz 'Amma (Surah 78 - 114)
  useEffect(() => {
    fetch('/api/v1/quran/surahs')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch surahs');
        return res.json();
      })
      .then((data: SurahSummary[]) => {
        const juzAmma = data.filter((s) => s.number >= 78 && s.number <= 114);
        setSurahs(juzAmma.length > 0 ? juzAmma : data.slice(77, 114));
      })
      .catch((err) => {
        console.warn('Using fallback surah list:', err);
        setSurahs([
          { number: 78, nameArabic: 'النبإ', nameLatin: "An-Naba'", numberOfAyahs: 40, revelationType: 'Makkiyyah', translation: 'Berita Besar' },
          { number: 79, nameArabic: 'النازعات', nameLatin: "An-Nazi'at", numberOfAyahs: 46, revelationType: 'Makkiyyah', translation: 'Malaikat yang Mencabut' },
          { number: 80, nameArabic: 'عبس', nameLatin: "'Abasa", numberOfAyahs: 42, revelationType: 'Makkiyyah', translation: 'Ia Bermuka Masam' },
          { number: 81, nameArabic: 'التكوير', nameLatin: 'At-Takwir', numberOfAyahs: 29, revelationType: 'Makkiyyah', translation: 'Menggulung' },
          { number: 82, nameArabic: 'الانفطار', nameLatin: 'Al-Infitar', numberOfAyahs: 19, revelationType: 'Makkiyyah', translation: 'Terbelah' },
          { number: 112, nameArabic: 'الإخلاص', nameLatin: 'Al-Ikhlas', numberOfAyahs: 4, revelationType: 'Makkiyyah', translation: 'Memurnikan Keesaan Allah' },
          { number: 113, nameArabic: 'الفلق', nameLatin: 'Al-Falaq', numberOfAyahs: 5, revelationType: 'Makkiyyah', translation: 'Waktu Subuh' },
          { number: 114, nameArabic: 'الناس', nameLatin: 'An-Nas', numberOfAyahs: 6, revelationType: 'Makkiyyah', translation: 'Manusia' },
        ]);
      })
      .finally(() => setLoadingList(false));
  }, []);

  // Fetch detail for selected Surah
  useEffect(() => {
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
      })
      .finally(() => setLoadingDetail(false));
  }, [selectedSurahNumber]);

  // Audio playback handler
  const handleToggleAudio = (ayahNumber: number, url: string) => {
    if (playingAyah === ayahNumber) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAyah(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play();
    setPlayingAyah(ayahNumber);

    audio.onended = () => {
      setPlayingAyah(null);
    };

    audio.onerror = () => {
      setPlayingAyah(null);
    };
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Mushaf Digital &amp; Deteksi Mutasyabihat
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Teks rujukan resmi Mushaf Kemenag RI terintegrasi standar Tarteel QUL untuk mencegah hafalan tertukar.
          </p>
        </div>

        {/* Surah Selector Dropdown */}
        <div className="relative min-w-[200px]">
          <select
            value={selectedSurahNumber}
            onChange={(e) => setSelectedSurahNumber(Number(e.target.value))}
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 shadow-xs appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {surahs.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.nameLatin} ({s.nameArabic})
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {loadingList || loadingDetail ? (
        <div className="flex items-center justify-center p-16 text-emerald-700 space-x-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-semibold">Memuat lembaran Mushaf Al-Qur'an...</span>
        </div>
      ) : currentSurah ? (
        <div className="space-y-6">
          {/* Active Surah Hero Header Card */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-md border border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-mono font-semibold text-emerald-300 tracking-wider uppercase">
                Surah Ke-{currentSurah.number} • {currentSurah.revelationType}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {currentSurah.nameLatin}
              </h3>
              <p className="text-emerald-100 text-xs sm:text-sm">
                "{currentSurah.translation}" • {currentSurah.numberOfAyahs} Ayat
              </p>
            </div>

            <div className="text-center sm:text-right">
              <span className="font-quran text-4xl sm:text-5xl text-emerald-200 block mb-2 leading-none">
                {currentSurah.nameArabic}
              </span>
              <span className="text-[11px] text-emerald-300 font-mono">
                Juz 'Amma (Juz 30)
              </span>
            </div>
          </div>

          {/* Ayah List */}
          <div className="space-y-4">
            {currentSurah.ayahs.map((ayah) => {
              const hasMutasyabihat = ayah.mutashabihat && ayah.mutashabihat.length > 0;
              const isPlaying = playingAyah === ayah.ayahNumber;

              return (
                <div
                  key={ayah.ayahNumber}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Top Ayah Meta & Actions */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold font-mono text-slate-800">
                        {ayah.ayahNumber}
                      </div>

                      {/* REQ-FE-03: Mutasyabihat Alert Indicator Button (Zero Emojis!) */}
                      {hasMutasyabihat && (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMutasyabihModal({
                              ayah,
                              items: ayah.mutashabihat || [],
                            })
                          }
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300/80 text-amber-900 text-xs font-semibold transition-all shadow-xs"
                          title="Klik untuk melihat ayat pembanding serupa"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Ayat Mutasyabih ({ayah.mutashabihat?.length})</span>
                        </button>
                      )}
                    </div>

                    {/* Audio Player Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleAudio(ayah.ayahNumber, ayah.audioUrl)}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isPlaying
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                      title={isPlaying ? 'Jeda Audio Qari' : 'Dengarkan Audio Qari'}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Menyimak</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Audio Qari</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Arabic Text (Amiri Quran, high contrast, readable) */}
                  <div className="text-right py-2" dir="rtl">
                    <p className="font-quran text-2xl sm:text-3xl text-slate-900 leading-loose select-text">
                      {ayah.textArabic}{' '}
                      <span className="inline-block text-amber-600 font-sans text-xl mr-2">
                        ۝{ayah.ayahNumber}
                      </span>
                    </p>
                  </div>

                  {/* Transliteration and Translation */}
                  <div className="pt-2 border-t border-slate-100 space-y-1 text-left">
                    <p className="text-xs font-semibold text-emerald-800">
                      {ayah.textLatin}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      "{ayah.translation}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* REQ-FE-03: Mutasyabihat Slide-over Drawer / Modal (Tarteel QUL Standard) */}
      {activeMutasyabihModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-amber-50/80 border-b border-amber-200/80 flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Peringatan Ayat Mutasyabihat
                  </h3>
                  <p className="text-xs text-amber-900 font-medium mt-0.5">
                    Standar Tarteel QUL (Quranic Universal Library) • Ayat Serupa
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveMutasyabihModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-white/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Active Verse vs Comparative Verses */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
              {/* Currently Selected Verse */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Ayat yang Sedang Anda Baca:
                </span>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>
                    QS. {currentSurah?.nameLatin} [{currentSurah?.number}: {activeMutasyabihModal.ayah.ayahNumber}]
                  </span>
                </div>
                <p className="font-quran text-2xl text-right text-slate-900 leading-relaxed" dir="rtl">
                  {activeMutasyabihModal.ayah.textArabic}
                </p>
              </div>

              {/* Comparative List */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-600" />
                  <span>Daftar Ayat Pembanding di Al-Qur'an:</span>
                </span>

                {activeMutasyabihModal.items.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/90 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-950">
                        QS. {comp.surahName} [{comp.surahNumber}: {comp.ayahNumber}]
                      </span>
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300">
                        {comp.similarity}
                      </span>
                    </div>

                    <p className="font-quran text-xl text-right text-slate-800 leading-relaxed" dir="rtl">
                      {comp.textArabic}
                    </p>

                    <div className="pt-2 border-t border-amber-200/60 text-xs text-slate-700 space-y-1">
                      <span className="font-bold text-amber-900 text-[11px] block">
                        Catatan Pembeda Tajwid &amp; Lafal:
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        {comp.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Latih kefasihan hafalan agar tidak melompat surah
              </span>
              <button
                type="button"
                onClick={() => setActiveMutasyabihModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all"
              >
                Tutup Peringatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
