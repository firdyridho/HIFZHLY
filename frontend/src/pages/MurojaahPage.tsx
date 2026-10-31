import { useState, useEffect, useRef } from 'react';
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
  Layers
} from 'lucide-react';
import type { SrsDueItem } from '../types';

interface AyahWord {
  raw: string;       // Lafal asli berharakat lengkap (contoh: ذَٰلِكَ)
  clean: string;     // Teks Arab tanpa harakat untuk pencocokan (contoh: ذلك)
  dashed: string;    // Placeholder bergaris (contoh: --------)
}

interface MushafAyah {
  ayahNumber: number;
  textArabic: string;
  textLatin: string;
  translation: string;
  audioUrl: string;
  words: AyahWord[];
}

// Helper normalisasi teks Arab untuk pencocokan real-time
function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '') // hapus harakat & tanda waqaf
    .replace(/[إأآٱ]/g, 'ا') // satukan alif
    .replace(/ة/g, 'ه') // satukan ta marbuthah
    .replace(/ى/g, 'ي') // satukan alif maqsura
    .replace(/[^\u0621-\u064A\s]/g, '') // buang karakter non-arab
    .trim();
}

function parseAyahWords(textArabic: string): AyahWord[] {
  const tokens = textArabic.trim().split(/\s+/);
  return tokens.map((token) => {
    const clean = normalizeArabic(token);
    // Buat panjang garis putus-putus proporsional dengan panjang kata
    const dashLen = Math.max(3, clean.length * 2);
    const dashed = '-'.repeat(dashLen);
    return {
      raw: token,
      clean,
      dashed,
    };
  });
}

// Data awal Al-Baqarah (seperti di screenshot) & An-Naba'
const DEFAULT_SURAHS: { number: number; name: string; page: number; juz: number; ayahs: MushafAyah[] }[] = [
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
  const [selectedSurahIndex, setSelectedSurahIndex] = useState(0);
  const currentSurah = DEFAULT_SURAHS[selectedSurahIndex];

  const [activeAyahIndex, setActiveAyahIndex] = useState(0);
  const activeAyah = currentSurah.ayahs[activeAyahIndex] || currentSurah.ayahs[0];

  // State Mode Ghaib (Tebak kata: kata tertutup '------' vs terbuka semua)
  const [isBlindMode, setIsBlindMode] = useState(true);

  // Kata yang sudah berhasil dibuka/dilafalkan benar pada ayat aktif
  // Set of word indices yang sudah revealed pada activeAyah
  const [revealedWordIndices, setRevealedWordIndices] = useState<Set<number>>(new Set());

  // Real-time Voice Recognition State
  const [isLiveListening, setIsLiveListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveStatusText, setLiveStatusText] = useState('...Menunggu suara');
  const [isCompletedAyah, setIsCompletedAyah] = useState(false);
  const [scoreNotification, setScoreNotification] = useState<string | null>(null);

  // SRS due items from backend
  const [dueAyahs, setDueAyahs] = useState<SrsDueItem[]>([]);
  const [isLoadingSrs, setIsLoadingSrs] = useState(false);

  // Audio Qari player
  const [isPlayingQari, setIsPlayingQari] = useState(false);
  const qariAudioRef = useRef<HTMLAudioElement | null>(null);

  // Web Speech API recognition reference
  const recognitionRef = useRef<any>(null);

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
  }, []);

  // Reset kata terbuka setiap ganti ayat
  useEffect(() => {
    setRevealedWordIndices(new Set());
    setIsCompletedAyah(false);
    setLiveTranscript('');
    setLiveStatusText(isLiveListening ? '...Menunggu suara' : 'Tekan mikrofon untuk melafalkan');
  }, [activeAyahIndex, selectedSurahIndex]);

  // Sync selesai ayat ke backend SRS
  const handleAyahCompleted = async (ayah: MushafAyah) => {
    setIsCompletedAyah(true);
    setScoreNotification(`Alhamdulillah! Ayat ${ayah.ayahNumber} Mutqin (Skor 100%)`);

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
    } catch {
      // background sync
    }

    // Pindah ke ayat berikutnya otomatis setelah 1.8 detik
    setTimeout(() => {
      setScoreNotification(null);
      if (activeAyahIndex < currentSurah.ayahs.length - 1) {
        setActiveAyahIndex((prev) => prev + 1);
      }
    }, 1800);
  };

  // Algoritma Pencocokan Real-time Kata Suara vs Ayat
  const processSpokenArabic = (spokenText: string) => {
    if (!spokenText || isCompletedAyah) return;

    const normalizedSpoken = normalizeArabic(spokenText);
    const spokenTokens = normalizedSpoken.split(/\s+/).filter(Boolean);

    setRevealedWordIndices((prevSet) => {
      const nextSet = new Set(prevSet);
      let newlyFound = false;

      // Cari kecocokan kata demi kata
      activeAyah.words.forEach((targetWord, wordIdx) => {
        if (nextSet.has(wordIdx)) return;

        // Cek apakah ada token suara yang cocok dengan targetWord.clean
        const isMatched = spokenTokens.some((token) => {
          if (token === targetWord.clean) return true;
          // toleransi imbuhan wawu atau alif lam
          if (token.startsWith('و') && token.slice(1) === targetWord.clean) return true;
          if (token.startsWith('ف') && token.slice(1) === targetWord.clean) return true;
          if (targetWord.clean.startsWith(token) && token.length >= 3) return true;
          return false;
        });

        if (isMatched) {
          nextSet.add(wordIdx);
          newlyFound = true;
        }
      });

      // Cek apakah seluruh kata dalam ayat sudah terbuka
      if (nextSet.size === activeAyah.words.length && !isCompletedAyah) {
        handleAyahCompleted(activeAyah);
      }

      return newlyFound ? nextSet : prevSet;
    });
  };

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
        setLiveStatusText('...Menunggu suara');
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
          setLiveStatusText(currentSpoken);
          processSpokenArabic(currentSpoken);
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
        // Otomatis restart jika user masih dalam mode live listening
        if (isLiveListening && !isCompletedAyah) {
          try {
            recognition.start();
          } catch {
            setIsLiveListening(false);
          }
        } else {
          setIsLiveListening(false);
          setLiveStatusText('Tekan mikrofon untuk melafalkan');
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Error starting live speech recognition:', err);
      setIsLiveListening(false);
    }
  };

  const stopLiveListening = () => {
    setIsLiveListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
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

  // Simulasi jika testing tanpa mic
  const handleSimulateWordReveal = () => {
    setRevealedWordIndices((prev) => {
      const next = new Set(prev);
      for (let i = 0; i < activeAyah.words.length; i++) {
        if (!next.has(i)) {
          next.add(i);
          setLiveStatusText(`Mendengarkan: "${activeAyah.words[i].raw}"`);
          if (next.size === activeAyah.words.length) {
            handleAyahCompleted(activeAyah);
          }
          break;
        }
      }
      return next;
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-28 font-sans">
      {/* Toast Notifikasi Keberhasilan Ayat */}
      {scoreNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-400 text-sm font-semibold animate-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{scoreNotification}</span>
        </div>
      )}

      {/* Surah & SRS Queue Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Layers className="w-4 h-4 text-emerald-700" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pilih Surah:
          </span>
          <select
            value={selectedSurahIndex}
            onChange={(e) => {
              setSelectedSurahIndex(Number(e.target.value));
              setActiveAyahIndex(0);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {DEFAULT_SURAHS.map((s, idx) => (
              <option key={s.number} value={idx}>
                {s.number}. {s.name} (Halaman {s.page})
              </option>
            ))}
          </select>
        </div>

        {/* SRS Due Badge */}
        {dueAyahs.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg w-full sm:w-auto justify-center sm:justify-end">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>
              <strong>{dueAyahs.length} Ayat</strong> terjadwal di SRS hari ini {isLoadingSrs ? '...' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Mushaf Page Container (Layout persis seperti aplikasi referensi) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Mushaf Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            onClick={() => {
              if (activeAyahIndex > 0) setActiveAyahIndex((prev) => prev - 1);
            }}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Ayat Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {currentSurah.name}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Halaman {currentSurah.page} | Juz {currentSurah.juz}
            </p>
          </div>

          <button
            onClick={() => {
              if (activeAyahIndex < currentSurah.ayahs.length - 1) {
                setActiveAyahIndex((prev) => prev + 1);
              }
            }}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Ayat Selanjutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Mushaf Body: Basmalah & Ayahs */}
        <div className="p-6 sm:p-10 flex-1 flex flex-col justify-center space-y-8 select-none">
          {/* Basmalah */}
          {currentSurah.number !== 9 && (
            <div className="text-center py-2">
              <p className="font-quran text-2xl sm:text-3xl text-slate-800 tracking-wide" dir="rtl">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </p>
            </div>
          )}

          {/* Tampilan Teks Mushaf & Kata Ghaib (Real-time Word by Word) */}
          <div className="space-y-8" dir="rtl">
            {currentSurah.ayahs.map((ayah, aIdx) => {
              const isCurrent = aIdx === activeAyahIndex;
              const isPast = aIdx < activeAyahIndex;

              return (
                <div
                  key={ayah.ayahNumber}
                  className={`p-4 rounded-2xl transition-all ${
                    isCurrent
                      ? 'bg-emerald-50/50 border border-emerald-200/60 shadow-xs'
                      : isPast
                      ? 'opacity-85'
                      : 'opacity-40'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-3 font-quran text-2xl sm:text-3xl leading-relaxed text-right justify-start">
                    {ayah.words.map((w, wIdx) => {
                      const isWordRevealed =
                        isPast ||
                        !isBlindMode ||
                        (isCurrent && revealedWordIndices.has(wIdx));

                      return (
                        <span
                          key={wIdx}
                          className={`inline-block transition-all duration-300 ${
                            isWordRevealed
                              ? isCurrent && revealedWordIndices.has(wIdx)
                                ? 'text-emerald-700 font-semibold scale-105 animate-in fade-in'
                                : 'text-slate-800'
                              : 'text-slate-300 font-mono tracking-tighter text-xl font-normal select-none'
                          }`}
                        >
                          {isWordRevealed ? w.raw : w.dashed}
                        </span>
                      );
                    })}

                    {/* Nomor Ayat Mushaf ۝ */}
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-slate-300 font-sans text-xs font-bold text-slate-700 mx-2 select-none">
                      {ayah.ayahNumber}
                    </span>
                  </div>

                  {/* Terjemahan & Latin hanya pada ayat aktif saat tidak blind mode */}
                  {isCurrent && !isBlindMode && (
                    <div className="mt-3 pt-3 border-t border-emerald-100 text-left font-sans" dir="ltr">
                      <p className="text-xs font-semibold text-emerald-800">{ayah.textLatin}</p>
                      <p className="text-xs text-slate-500 italic mt-0.5">{ayah.translation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Indikator Mode Ghaib */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isBlindMode ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            <span>
              {isBlindMode
                ? 'Mode Hafalan Ghaib: Kata tertutup sampai dilafalkan'
                : 'Mode Bimbingan Teks: Seluruh kata ditampilkan'}
            </span>
          </div>

          <button
            onClick={handleSimulateWordReveal}
            className="text-[11px] text-slate-400 hover:text-emerald-700 transition underline"
            title="Uji coba buka 1 kata jika tanpa mikrofon"
          >
            Uji Buka Kata
          </button>
        </div>
      </div>

      {/* Floating Bottom Live Dock (Persis seperti screenshot aplikasi) */}
      <div className="fixed bottom-6 left-0 right-0 z-40 px-4">
        <div className="max-w-xl mx-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-3 shadow-2xl shadow-slate-950/15 flex flex-col items-center space-y-3">
          {/* Status Bar Suara Real-time: "...Menunggu suara" */}
          <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-2 px-4 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-600">
              {isLiveListening && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
              <span className="truncate font-sans">{liveTranscript && isLiveListening ? liveTranscript : liveStatusText}</span>
            </div>
          </div>

          {/* Action Dock Controls */}
          <div className="flex items-center justify-between w-full px-4 sm:px-6">
            {/* Tombol Mata (Eye Toggle): Mode Hafalan Ghaib vs Buka Teks */}
            <button
              type="button"
              onClick={() => setIsBlindMode(!isBlindMode)}
              className={`p-3 rounded-2xl border transition ${
                isBlindMode
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  : 'bg-emerald-100 border-emerald-300 text-emerald-800'
              }`}
              title={isBlindMode ? 'Buka Teks Bantuan' : 'Tutup Kata (Uji Hafalan)'}
            >
              {isBlindMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            {/* Tombol Ayat Sebelumnya */}
            <button
              type="button"
              disabled={activeAyahIndex === 0}
              onClick={() => setActiveAyahIndex((prev) => Math.max(0, prev - 1))}
              className="p-3 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 transition"
              title="Ayat Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Tombol Mikrofon Utama (Pulsing glowing button) */}
            <button
              type="button"
              onClick={handleToggleListening}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 active:scale-95 cursor-pointer ${
                isLiveListening
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

            {/* Tombol Ayat Selanjutnya */}
            <button
              type="button"
              disabled={activeAyahIndex === currentSurah.ayahs.length - 1}
              onClick={() =>
                setActiveAyahIndex((prev) =>
                  Math.min(currentSurah.ayahs.length - 1, prev + 1)
                )
              }
              className="p-3 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 transition"
              title="Ayat Selanjutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Tombol Audio Qari */}
            <button
              type="button"
              onClick={handleToggleQari}
              className={`p-3 rounded-2xl border transition ${
                isPlayingQari
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title={isPlayingQari ? 'Jeda Qari' : 'Dengar Pelafalan Qari'}
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
    </div>
  );
}
