import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Copy,
  Check,
  Bookmark,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

interface DoaItem {
  id: string | number;
  nama: string;
  ar: string;
  tr: string;
  idn: string;
  tentang?: string;
  grup?: string;
  tag?: string[];
}

const DEFAULT_DOA_LIST: DoaItem[] = [
  {
    id: 'doa-1',
    nama: 'Doa Sebelum Menghafal & Murojaah',
    ar: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي',
    tr: "Rabbisyrah lii shadrii, wa yassir lii amrii, wahlul 'uqdatan mil lisaanii, yafqahuu qawlii.",
    idn: 'Ya Tuhanku, lapangkanlah dadaku, dan mudahkanlah untukku urusanku, dan lepaskanlah kekakuan dari lidahku, agar mereka mengerti perkataanku.',
    tentang: 'QS. Thaha: 25-28. Doa memohon kelancaran lisan dan ketenangan hati dalam menghafal kalamullah.',
    grup: 'Doa Murojaah & Hafalan',
  },
  {
    id: 'doa-2',
    nama: 'Doa Memohon Ketetapan Hafalan Qur\'an',
    ar: 'اللَّهُمَّ ذَكِّرْنَا مِنْهُ مَا نَسِينَا وَعَلِّمْنَا مِنْهُ مَا جَهِلْنَا وَارْزُقْنَا تِلَاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ',
    tr: "Allahumma dzakkirnaa minhu maa nasiinaa, wa 'allimnaa minhu maa jahilnaa, warzuqnaa tilaawatahu aanaa-al layli wa athraafan nahaar.",
    idn: 'Ya Allah, ingatkanlah kami apa yang kami lupa dari Al-Qur\'an, ajarkanlah kami apa yang belum kami ketahui darinya, dan anugerahkanlah kami kemampuan membacanya sepanjang malam dan di ujung-ujung siang.',
    tentang: 'Doa ahlul Qur\'an memohon penjagaan ayat-ayat yang telah dihafal agar tidak pudar dari ingatan.',
    grup: 'Doa Murojaah & Hafalan',
  },
  {
    id: 'doa-3',
    nama: 'Doa Tambah Ilmu & Kekuatan Pemahaman',
    ar: 'رَبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا وَاجْعَلْنِي مِنَ الصَّالِحِينَ',
    tr: "Rabbi zidnii 'ilman, warzuqnii fahman, waj'alnii minash-shaalihiin.",
    idn: 'Ya Tuhanku, tambahkanlah ilmu kepadaku, dan berilah aku karunia untuk memahaminya, serta jadikanlah aku termasuk golongan orang-orang yang saleh.',
    tentang: 'Doa memohon keterbukaan akal dan hati dalam memahami makna ayat serta kaidah tajwid.',
    grup: 'Doa Belajar & Tholabul Ilmi',
  },
  {
    id: 'doa-4',
    nama: 'Doa Khotmil Qur\'an (Khatam)',
    ar: 'اللَّهُمَّ ارْحَمْنَا بِالْقُرْآنِ وَاجْعَلْهُ لَنَا إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً',
    tr: "Allahummar-hamnaa bil-qur'aan, waj'alhu lanaa imaaman wa nuuran wa hudan wa rahmah.",
    idn: 'Ya Allah, limpahkanlah rahmat kepada kami dengan Al-Qur\'an, dan jadikanlah ia sebagai pemimpin, cahaya, petunjuk, dan rahmat bagi kami.',
    tentang: 'Doa agung para sahabat dan tabi\'in seusai menyelesaikan khatam tilawah dan murojaah.',
    grup: 'Doa Khatam & Keberkahan',
  },
  {
    id: 'doa-5',
    nama: 'Sayyidul Istighfar (Penghulu Istighfar)',
    ar: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    tr: "Allahumma anta rabbii laa ilaaha illaa anta khalaqtanii wa ana 'abduka wa ana 'ala 'ahdika wa wa'dika mastatha'tu...",
    idn: 'Ya Allah, Engkau adalah Rabb-ku, tidak ada Tuhan yang berhak disembah selain Engkau. Engkau yang menciptakanku dan aku adalah hamba-Mu...',
    tentang: 'HR. Bukhari no. 6306. Siapa yang membacanya dengan yakin di pagi atau petang hari lalu meninggal, ia termasuk penghuni surga.',
    grup: 'Dzikir Pagi & Petang',
  },
  {
    id: 'doa-6',
    nama: 'Doa Kebaikan Dunia & Akhirat (Sapu Jagat)',
    ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    tr: "Rabbanaa aatinaa fid-dunyaa hasanah, wa fil-aakhirati hasanah, wa qinaa 'adzaaban-naar.",
    idn: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari siksa neraka.',
    tentang: 'QS. Al-Baqarah: 201. Doa yang paling sering dibaca oleh Rasulullah shallallahu \'alaihi wa sallam.',
    grup: 'Doa Mustajab Al-Qur\'an',
  },
  {
    id: 'doa-7',
    nama: 'Doa Memohon Keteguhan Iman & Hati',
    ar: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً إِنَّكَ أَنتَ الْوَهَّابُ',
    tr: "Rabbanaa laa tuzigh quluubanaa ba'da idz hadaytanaa wa hab lanaa mil ladunka rahmah, innaka antal-wahhaab.",
    idn: 'Ya Tuhan kami, janganlah Engkau jadikan hati kami condong kepada kesesatan sesudah Engkau beri petunjuk kepada kami, dan karuniakanlah kepada kami rahmat dari sisi-Mu.',
    tentang: 'QS. Ali \'Imran: 8. Doa agar hati senantiasa istiqomah di jalan Al-Qur\'an dan sunnah.',
    grup: 'Doa Mustajab Al-Qur\'an',
  },
  {
    id: 'doa-8',
    nama: 'Doa Masuk Masjid',
    ar: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    tr: 'Allahummaf-tah lii abwaaba rahmatik.',
    idn: 'Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.',
    tentang: 'HR. Muslim no. 713. Dibaca ketika melangkahkan kaki kanan masuk ke dalam masjid.',
    grup: 'Doa Harian & Adab',
  },
  {
    id: 'doa-9',
    nama: 'Doa Keluar Masjid',
    ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    tr: 'Allahumma innii as-aluka min fadhlik.',
    idn: 'Ya Allah, sesungguhnya aku memohon karunia-Mu.',
    tentang: 'HR. Muslim no. 713. Dibaca ketika melangkahkan kaki kiri keluar dari masjid.',
    grup: 'Doa Harian & Adab',
  },
  {
    id: 'doa-10',
    nama: 'Doa untuk Kedua Orang Tua',
    ar: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    tr: 'Rabbigh-fir lii wa liwaalidayya warhamhumaa kamaa rabbayaanii shaghiiraa.',
    idn: 'Ya Tuhanku, ampunilah aku dan kedua orang tuaku, dan sayangilah keduanya sebagaimana mereka telah mendidik aku di waktu kecil.',
    tentang: 'QS. Al-Isra\': 24. Birrul walidain, salah satu kunci terbukanya keberkahan menghafal Al-Qur\'an.',
    grup: 'Doa Mustajab Al-Qur\'an',
  },
  {
    id: 'doa-11',
    nama: 'Dzikir Pagi: Perlindungan dari Mara Bahaya',
    ar: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    tr: "Bismillaahil-ladzii laa yadhurru ma'as-mihii syay-un fil-ardhi wa laa fis-samaa-i wa huwas-samii'ul 'aliim.",
    idn: 'Dengan nama Allah yang tidak ada sesuatu pun di bumi maupun di langit yang dapat mendatangkan mudharat bersama nama-Nya, dan Dia Maha Mendengar lagi Maha Mengetahui.',
    tentang: 'HR. Abu Dawud & Tirmidzi. Dibaca 3 kali di pagi dan petang hari.',
    grup: 'Dzikir Pagi & Petang',
  },
  {
    id: 'doa-12',
    nama: 'Doa Bangun Tidur',
    ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    tr: 'Alhamdu lillaahil-ladzii ahyaanaa ba\'da maa amaatanaa wa ilayhin-nusyuur.',
    idn: 'Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami, dan hanya kepada-Nya kami kembali.',
    tentang: 'HR. Bukhari no. 6312. Memulai hari dengan syukur dan kesadaran spiritual.',
    grup: 'Doa Harian & Adab',
  },
];

export default function DoaPage() {
  const [allDoa, setAllDoa] = useState<DoaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string | number>>(() => {
    try {
      const saved = localStorage.getItem('hifzhly_bookmarked_doa');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch('/api/v1/doa')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!isMounted) return;
        const list = Array.isArray(json)
          ? json
          : Array.isArray(json?.doa)
          ? json.doa
          : Array.isArray(json?.data)
          ? json.data
          : [];

        if (list.length > 0) {
          const mapped: DoaItem[] = list.map((d: any, idx: number) => ({
            id: d.id || `doa-${idx}`,
            nama: d.title || d.nama || 'Doa Murojaah',
            ar: d.arabic || d.ar || '',
            tr: d.latin || d.tr || '',
            idn: d.translation || d.idn || '',
            tentang: d.fadhilah || d.tentang || '',
            grup: d.category || d.grup || 'Doa Murojaah & Hafalan',
            tag: d.tag || [],
          }));

          const existingTitles = new Set(mapped.map((m) => m.nama));
          const additions = DEFAULT_DOA_LIST.filter((d) => !existingTitles.has(d.nama));
          setAllDoa([...mapped, ...additions]);
        } else {
          setAllDoa(DEFAULT_DOA_LIST);
        }
      })
      .catch(() => {
        if (isMounted) setAllDoa(DEFAULT_DOA_LIST);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopy = (item: DoaItem) => {
    const text = `${item.nama}\n\n${item.ar}\n\n${item.tr}\n\nArtinya:\n"${item.idn}"\n\n(Dikutip dari Hifzhly - Platform Murojaah Al-Qur'an)`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleBookmark = (id: string | number) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem('hifzhly_bookmarked_doa', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // Categories extraction
  const categories = useMemo(() => {
    const set = new Set<string>();
    allDoa.forEach((d) => {
      if (d.grup) set.add(d.grup);
    });
    return ['Semua', 'Tersimpan', ...Array.from(set)];
  }, [allDoa]);

  // Filtered Doa
  const filteredDoa = useMemo(() => {
    return allDoa.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (item.nama && item.nama.toLowerCase().includes(q)) ||
        (item.idn && item.idn.toLowerCase().includes(q)) ||
        (item.tr && item.tr.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (selectedCategory === 'Semua') return true;
      if (selectedCategory === 'Tersimpan') return bookmarkedIds.has(item.id);
      return item.grup === selectedCategory;
    });
  }, [allDoa, searchQuery, selectedCategory, bookmarkedIds]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 select-none">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/app/dashboard"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-800" />
              <span>Koleksi Doa & Dzikir Al-Qur'an</span>
            </h1>
            <p className="text-xs text-slate-500">
              Kumpulan doa harian, dzikir mutabaah, dan munajat shahih bersumber dari Al-Qur'an dan Sunnah
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold">
            {allDoa.length} Doa Terhimpun
          </span>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari doa (misal: doa tidur, doa orang tua, istikharah, fajar)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer shrink-0 border ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Doa Cards */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-emerald-700 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Memuat kumpulan doa & dzikir dari API...</p>
        </div>
      ) : filteredDoa.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-2 shadow-2xs">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Doa Tidak Ditemukan</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Coba gunakan kata kunci pencarian yang berbeda atau periksa filter kategori yang Anda pilih.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDoa.map((doa) => {
            const isBookmarked = bookmarkedIds.has(doa.id);
            return (
              <div
                key={doa.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {doa.grup || 'Doa Harian'}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{doa.nama}</h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleBookmark(doa.id)}
                        className={`p-1.5 rounded-xl border transition cursor-pointer ${
                          isBookmarked
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : 'bg-slate-50 text-slate-400 hover:text-slate-700 border-slate-200'
                        }`}
                        title={isBookmarked ? 'Hapus Simpanan' : 'Simpan Doa'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-600' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(doa)}
                        className="p-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 border border-slate-200 transition cursor-pointer"
                        title="Salin Teks Doa"
                      >
                        {copiedId === doa.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Arabic Text */}
                  <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-amber-200/50 text-right">
                    <p className="font-quran text-2xl sm:text-3xl text-slate-900 leading-[2.2]" dir="rtl">
                      {doa.ar}
                    </p>
                  </div>

                  {/* Transliteration Latin */}
                  {doa.tr && (
                    <p className="text-xs text-emerald-900 font-medium italic leading-relaxed">
                      {doa.tr}
                    </p>
                  )}

                  {/* Translation Indonesian */}
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    <span className="font-semibold text-slate-700">Artinya: </span>
                    "{doa.idn}"
                  </p>
                </div>

                {/* Footer notes / Hadits reference */}
                {doa.tentang && (
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                    {doa.tentang}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
