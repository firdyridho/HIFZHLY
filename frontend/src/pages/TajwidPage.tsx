import { useState, useEffect } from 'react';
import {
  Award,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  BookOpen,
  ArrowLeft,
  Info,
  Sparkles,
  Check,
  Video,
} from 'lucide-react';
import type {
  TajwidModule,
  QuizSubmitResponse,
  QuizQuestionReview,
} from '../types';

// Fallback comprehensive modules & 5-question quizzes
const FALLBACK_MODULES: TajwidModule[] = [
  {
    id: '1d8b5a04-9426-47b8-b4b3-d2a93ff7ef21',
    title: 'Hukum Nun Sukun dan Tanwin',
    slug: 'hukum-nun-sukun-dan-tanwin',
    summary: 'Mempelajari 4 kaidah hukum: Idzhar Halqi, Idgham, Ikhfa Haqiqi, dan Iqlab.',
    youtubeVideoId: '7kK84x4_uY8',
    thumbnailUrl: 'https://img.youtube.com/vi/7kK84x4_uY8/hqdefault.jpg',
    orderIndex: 1,
    contentBody: `Nun sukun (نْ) atau tanwin (ـًـٍـٌ) apabila bertemu dengan salah satu huruf hijaiyah memiliki 4 ketentuan hukum bacaan:
1. **Idzhar Halqi**: Dibaca jelas tanpa mendengung jika bertemu 6 huruf halq (ء، هـ، ع، ح، غ، خ).
2. **Idgham**: Dibaca melebur. Terbagi menjadi *Bighunnah* (berdengung pada huruf ي، ن، م، و) dan *Bilaghunnah* (tanpa dengung pada huruf ل، ر).
3. **Iqlab**: Menukar bunyi nun/tanwin menjadi mim (م) disertai dengung 2 harakat saat bertemu huruf Ba (ب).
4. **Ikhfa Haqiqi**: Dibaca samar-samar antara idzhar dan idgham disertai dengung jika bertemu 15 huruf ikhfa.`,
    quiz: {
      id: '8f1a2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
      title: 'Kuis Evaluasi Nun Sukun & Tanwin',
      description: 'Jawablah 5 soal pilihan ganda berikut untuk menguji pemahaman kaidah tajwid Anda ala Gemini AI.',
      passingScore: 70,
      questions: [
        {
          id: 'q1-uuid-001',
          questionText: 'Jika nun sukun (نْ) bertemu dengan huruf Ba (ب), hukum bacaannya adalah...',
          orderIndex: 1,
          options: [
            { id: 'opt-1-1', optionText: 'Idzhar Halqi' },
            { id: 'opt-1-2', optionText: 'Iqlab' },
            { id: 'opt-1-3', optionText: 'Idgham Bilaghunnah' },
            { id: 'opt-1-4', optionText: 'Ikhfa Haqiqi' },
          ],
        },
        {
          id: 'q1-uuid-002',
          questionText: 'Pada lafal مَن يَقُولُ, hukum tajwid yang berlaku pada nun sukun bertemu Ya adalah...',
          orderIndex: 2,
          options: [
            { id: 'opt-1-21', optionText: 'Idgham Bighunnah' },
            { id: 'opt-1-22', optionText: 'Idgham Bilaghunnah' },
            { id: 'opt-1-23', optionText: 'Idzhar Halqi' },
            { id: 'opt-1-24', optionText: 'Iqlab' },
          ],
        },
        {
          id: 'q1-uuid-003',
          questionText: 'Berapakah jumlah huruf Idzhar Halqi yang keluar dari tenggorokan?',
          orderIndex: 3,
          options: [
            { id: 'opt-1-31', optionText: '4 Huruf' },
            { id: 'opt-1-32', optionText: '5 Huruf' },
            { id: 'opt-1-33', optionText: '6 Huruf (ء، هـ، ع، ح، غ، خ)' },
            { id: 'opt-1-34', optionText: '15 Huruf' },
          ],
        },
        {
          id: 'q1-uuid-004',
          questionText: 'Pada lafal أَنْعَمْتَ عَلَيْهِمْ, cara membaca nun sukun pada kata أَنْعَمْتَ adalah...',
          orderIndex: 4,
          options: [
            { id: 'opt-1-41', optionText: 'Jelas tanpa dengung (Idzhar Halqi)' },
            { id: 'opt-1-42', optionText: 'Melebur dengan dengung sempurna' },
            { id: 'opt-1-43', optionText: 'Samar-samar disertai dengung tebal' },
            { id: 'opt-1-44', optionText: 'Berubah menjadi bunyi huruf mim' },
          ],
        },
        {
          id: 'q1-uuid-005',
          questionText: 'Manakah contoh di bawah ini yang termasuk penerapan hukum Ikhfa Haqiqi?',
          orderIndex: 5,
          options: [
            { id: 'opt-1-51', optionText: 'مِن قَبْلُ (Nun sukun bertemu Qaf)' },
            { id: 'opt-1-52', optionText: 'مَنْ آمَنَ (Nun sukun bertemu Hamzah)' },
            { id: 'opt-1-53', optionText: 'مِنْ رَّبِّهِمْ (Nun sukun bertemu Ra)' },
            { id: 'opt-1-54', optionText: 'أَنْ بُورِكَ (Nun sukun bertemu Ba)' },
          ],
        },
      ],
    },
  },
  {
    id: '2b7c4d1e-8f3a-5b9c-0d2e-4f6a8b1c3d5e',
    title: 'Hukum Mim Sukun (Al-Ahkam Al-Mimiyah)',
    slug: 'hukum-mim-sukun',
    summary: 'Mempelajari 3 hukum: Ikhfa Syafawi, Idgham Mimi, dan Idzhar Syafawi.',
    youtubeVideoId: 'wR4Cg3t_9jQ',
    thumbnailUrl: 'https://img.youtube.com/vi/wR4Cg3t_9jQ/hqdefault.jpg',
    orderIndex: 2,
    contentBody: `Mim sukun (مْ) memiliki 3 hukum bacaan berdasarkan makhraj bibir:
1. **Ikhfa Syafawi**: Mim sukun bertemu huruf Ba (ب). Dibaca samar dengan dengung.
2. **Idgham Mimi / Mitslain**: Mim sukun bertemu huruf Mim (م). Dibaca melebur dengan dengung sempurna.
3. **Idzhar Syafawi**: Mim sukun bertemu seluruh huruf hijaiyah selain Ba dan Mim. Dibaca jelas di bibir tanpa dengung.`,
    quiz: {
      id: '9a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
      title: 'Kuis Evaluasi Mim Sukun',
      description: 'Uji kemampuan membedakan Ikhfa Syafawi, Idgham Mimi, dan Idzhar Syafawi.',
      passingScore: 70,
      questions: [
        {
          id: 'q2-uuid-001',
          questionText: 'Mim sukun (مْ) bertemu huruf Ba (ب) dihukumi...',
          orderIndex: 1,
          options: [
            { id: 'opt-2-1', optionText: 'Ikhfa Syafawi' },
            { id: 'opt-2-2', optionText: 'Idgham Mimi' },
            { id: 'opt-2-3', optionText: 'Idzhar Syafawi' },
            { id: 'opt-2-4', optionText: 'Idgham Bilaghunnah' },
          ],
        },
        {
          id: 'q2-uuid-002',
          questionText: 'Pada lafal لَهُم مَّا يَشَآءُونَ, hukum bacaan yang terjadi adalah...',
          orderIndex: 2,
          options: [
            { id: 'opt-2-21', optionText: 'Idgham Mimi (Mitslain)' },
            { id: 'opt-2-22', optionText: 'Idzhar Halqi' },
            { id: 'opt-2-23', optionText: 'Iqlab' },
            { id: 'opt-2-24', optionText: 'Ikhfa Haqiqi' },
          ],
        },
        {
          id: 'q2-uuid-003',
          questionText: 'Huruf apa sajakah yang menjadi sebab berlakunya hukum Idzhar Syafawi?',
          orderIndex: 3,
          options: [
            { id: 'opt-2-31', optionText: 'Seluruh huruf hijaiyah selain Mim dan Ba' },
            { id: 'opt-2-32', optionText: 'Hanya huruf alif dan wau saja' },
            { id: 'opt-2-33', optionText: '6 huruf tenggorokan halqi' },
            { id: 'opt-2-34', optionText: '15 huruf ikhfa haqiqi' },
          ],
        },
        {
          id: 'q2-uuid-004',
          questionText: 'Mengapa qari harus berhati-hati agar mim sukun tidak terbaca ikhfa saat bertemu huruf Wau (و) atau Fa (ف)?',
          orderIndex: 4,
          options: [
            { id: 'opt-2-41', optionText: 'Karena kedekatan dan kesamaan makhraj pada bibir' },
            { id: 'opt-2-42', optionText: 'Karena hukum asalnya wajib dengung 3 harakat' },
            { id: 'opt-2-43', optionText: 'Karena termasuk huruf pembatal tajwid' },
            { id: 'opt-2-44', optionText: 'Karena kedua huruf tersebut merupakan huruf halq' },
          ],
        },
        {
          id: 'q2-uuid-005',
          questionText: 'Pada lafal عَلَيْهِمْ وَلَا الضَّآلِّينَ, hukum mim sukun bertemu wau wajib dibaca...',
          orderIndex: 5,
          options: [
            { id: 'opt-2-51', optionText: 'Idzhar Syafawi secara tegas dan jelas' },
            { id: 'opt-2-52', optionText: 'Ikhfa Syafawi dengan dengung 2 harakat' },
            { id: 'opt-2-53', optionText: 'Idgham Mimi melebur sempurna' },
            { id: 'opt-2-54', optionText: 'Iqlab dengan bibir merenggang' },
          ],
        },
      ],
    },
  },
  {
    id: '3c8d5e2f-9a4b-6c0d-1e3f-5a7b9c2d4e6f',
    title: 'Hukum Madd Asli dan Madd Far’i',
    slug: 'hukum-madd',
    summary: 'Klasifikasi panjang harakat bacaan: Thabi’i, Wajib Muttashil, dan Jaiz Munfashil.',
    youtubeVideoId: 'dQw4w9WgXcQ',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    orderIndex: 3,
    contentBody: `Madd secara bahasa berarti memanjangkan suara. Terbagi atas:
1. **Madd Asli (Thabi’i)**: Dipanjangkan 2 harakat (1 alif).
2. **Madd Wajib Muttashil**: Huruf madd bertemu hamzah dalam satu kata. Dipanjangkan 4-5 harakat.
3. **Madd Jaiz Munfashil**: Huruf madd bertemu hamzah di lain kata. Dipanjangkan 4-5 harakat.`,
    quiz: {
      id: '7b8c9d0e-1f2a-3b4c-5d6e-7f8a9b0c1d2e',
      title: 'Kuis Evaluasi Hukum Madd',
      description: 'Uji pemahaman panjang harakat madd wajib vs jaiz munfashil.',
      passingScore: 70,
      questions: [
        {
          id: 'q3-uuid-001',
          questionText: 'Berapakah kadar panjang harakat Madd Thabi’i (Asli) yang disepakati ulama tajwid?',
          orderIndex: 1,
          options: [
            { id: 'opt-3-1', optionText: '2 Harakat (1 Alif)' },
            { id: 'opt-3-2', optionText: '4 Harakat (2 Alif)' },
            { id: 'opt-3-3', optionText: '6 Harakat (3 Alif)' },
            { id: 'opt-3-4', optionText: '1 Harakat saja' },
          ],
        },
        {
          id: 'q3-uuid-002',
          questionText: 'Apabila huruf mad bertemu dengan hamzah dalam SATU kata bersambung, dinamakan hukum...',
          orderIndex: 2,
          options: [
            { id: 'opt-3-21', optionText: 'Madd Wajib Muttashil' },
            { id: 'opt-3-22', optionText: 'Madd Jaiz Munfashil' },
            { id: 'opt-3-23', optionText: 'Madd Lazim Kilmi' },
            { id: 'opt-3-24', optionText: 'Madd Badal' },
          ],
        },
        {
          id: 'q3-uuid-003',
          questionText: 'Pada lafal إِنَّآ أَعْطَيْنَاكَ, hukum madd yang berlaku pada kata إِنَّآ bertemu hamzah kata berikutnya adalah...',
          orderIndex: 3,
          options: [
            { id: 'opt-3-31', optionText: 'Madd Jaiz Munfashil' },
            { id: 'opt-3-32', optionText: 'Madd Wajib Muttashil' },
            { id: 'opt-3-33', optionText: 'Madd ‘Aridh Lissukun' },
            { id: 'opt-3-34', optionText: 'Madd Iwad' },
          ],
        },
        {
          id: 'q3-uuid-004',
          questionText: 'Manakah di bawah ini yang merupakan 3 huruf madd asli dalam Al-Qur\'an?',
          orderIndex: 4,
          options: [
            { id: 'opt-3-41', optionText: 'Alif mati setelah fathah, Wau mati setelah dhammah, Ya mati setelah kasrah' },
            { id: 'opt-3-42', optionText: 'Nun sukun, Mim sukun, dan Ba' },
            { id: 'opt-3-43', optionText: 'Hamzah, Ha, dan ‘Ain' },
            { id: 'opt-3-44', optionText: 'Qaf, Tha, Ba, Jim, Dal' },
          ],
        },
        {
          id: 'q3-uuid-005',
          questionText: 'Pada akhir ayat saat waqaf pada kata الْعَالَمِينَ, hukum bacaan yang terjadi adalah...',
          orderIndex: 5,
          options: [
            { id: 'opt-3-51', optionText: 'Madd ‘Aridh Lissukun (boleh 2, 4, atau 6 harakat)' },
            { id: 'opt-3-52', optionText: 'Madd Thabi’i mutlak 2 harakat saja' },
            { id: 'opt-3-53', optionText: 'Madd Lazim 6 harakat mutlak' },
            { id: 'opt-3-54', optionText: 'Madd Shilah Thawilah' },
          ],
        },
      ],
    },
  },
];

// Offline answers repository for fallback quiz evaluation & reflection
const MOCK_CORRECT_KEYS: Record<string, { correctOptionId: string; explanation: string }> = {
  // Modul 1
  'q1-uuid-001': {
    correctOptionId: 'opt-1-2',
    explanation:
      'Benar! Apabila nun sukun atau tanwin bertemu huruf Ba (ب), hukumnya adalah Iqlab. Bunyi nun/tanwin diganti menjadi bunyi mim (م) yang dirapatkan bibirnya secara ringan disertai ghunnah (dengung) 2 harakat.',
  },
  'q1-uuid-002': {
    correctOptionId: 'opt-1-21',
    explanation:
      'Tepat! Huruf Ya (ي) adalah salah satu dari 4 huruf Idgham Bighunnah (ي، ن، م، و). Nun sukun dileburkan ke dalam huruf ya disertai ghunnah sempurna 2 harakat.',
  },
  'q1-uuid-003': {
    correctOptionId: 'opt-1-33',
    explanation:
      'Tepat! Huruf Idzhar Halqi ada 6: Hamzah (ء), Ha (هـ), ‘Ain (ع), Hha (ح), Ghain (غ), dan Kha (خ). Dinamakan halqi karena seluruh hurufnya keluar dari halq (tenggorokan).',
  },
  'q1-uuid-004': {
    correctOptionId: 'opt-1-41',
    explanation:
      'Benar! Nun sukun bertemu huruf ‘Ain (ع) termasuk Idzhar Halqi. Dibaca jelas (izh-har) makhraj nun-nya tanpa dipanjangkan dengungnya.',
  },
  'q1-uuid-005': {
    correctOptionId: 'opt-1-51',
    explanation:
      'Tepat! Nun sukun bertemu Qaf (ق) adalah Ikhfa Haqiqi (tingkat ikhfa aqrab/tebal). Bunyi nun disamarkan menuju makhraj qaf disertai dengung tebal (tafkhim) 2 harakat.',
  },
  // Modul 2
  'q2-uuid-001': {
    correctOptionId: 'opt-2-1',
    explanation:
      'Benar! Mim sukun bertemu Ba (ب) dinamakan Ikhfa Syafawi. Dinamakan syafawi karena kedua huruf tersebut keluar dari dua bibir (syafatain), dibaca samar disertai dengung 2 harakat.',
  },
  'q2-uuid-002': {
    correctOptionId: 'opt-2-21',
    explanation:
      'Tepat! Mim sukun bertemu huruf Mim berharakat dinamakan Idgham Mimi atau Idgham Mitslain Shaghir. Suara mim pertama dimasukkan utuh ke mim kedua dengan ghunnah kamilah.',
  },
  'q2-uuid-003': {
    correctOptionId: 'opt-2-31',
    explanation:
      'Benar! Idzhar Syafawi berlaku apabila mim sukun bertemu dengan 26 huruf hijaiyah selain Ba (ب) dan Mim (م). Dibaca jelas di bibir tanpa dengung tambahan.',
  },
  'q2-uuid-004': {
    correctOptionId: 'opt-2-41',
    explanation:
      'Tepat! Sebagaimana ditegaskan Imam Al-Jamzuri dalam Tuhfatul Athfal: \'Wakhfa lada wawin wa fa an takhtafi, liqurbiha wal ittihadi fa\'rifi\'. Huruf Wau dan Fa berdekatan/sama makhrajnya dengan mim, sehingga harus dijaga agar tetap jelas (idzhar) dan tidak tersamarkan.',
  },
  'q2-uuid-005': {
    correctOptionId: 'opt-2-51',
    explanation:
      'Benar! Mim sukun pada عَلَيْهِمْ bertemu Wau (وَ) wajib dibaca Idzhar Syafawi yang sangat jelas (ashaddu izh-haran), bibir dirapatkan tanpa menahan dengung.',
  },
  // Modul 3
  'q3-uuid-001': {
    correctOptionId: 'opt-3-1',
    explanation:
      'Benar! Madd Thabi’i adalah mad asli yang tidak dipengaruhi sebab hamzah atau sukun. Kadar panjangnya tetap 2 harakat (ayunan 1 alif).',
  },
  'q3-uuid-002': {
    correctOptionId: 'opt-3-21',
    explanation:
      'Tepat! Dinamakan \'Muttashil\' (bersambung) karena huruf mad dan hamzah berada dalam satu kata yang sama (seperti جَآءَ atau السَّمَآءُ). Panjangnya 4-5 harakat pada riwayat Hafsh.',
  },
  'q3-uuid-003': {
    correctOptionId: 'opt-3-31',
    explanation:
      'Tepat! Huruf mad berada di akhir kata pertama (إِنَّآ) dan hamzah berada di awal kata berikutnya (أَعْطَيْنَاكَ). Karena terpisah kata dinamakan Munfashil (terpisah), dibaca 4-5 harakat.',
  },
  'q3-uuid-004': {
    correctOptionId: 'opt-3-41',
    explanation:
      'Benar! Huruf mad ada 3: Alif didahului fathah, Wau sukun didahului dhammah, dan Ya sukun didahului kasrah (terkumpul dalam lafal نُوحِيهَا).',
  },
  'q3-uuid-005': {
    correctOptionId: 'opt-3-51',
    explanation:
      'Tepat! Huruf mad bertemu huruf hidup yang disukunkan karena berhenti (waqaf). Boleh dibaca qashr (2 harakat), tawassuth (4 harakat), atau thul (6 harakat).',
  },
};

// Humanized appreciation & reflection generator by percentage brackets
function getAppreciationMessage(percentage: number): {
  headline: string;
  badge: string;
  description: string;
  toneColor: string;
  borderColor: string;
  bgGradient: string;
} {
  if (percentage === 100) {
    return {
      headline: 'Masya Allah, Mumtaz! Pemahaman Sempurna 100%',
      badge: 'Capaian Tertinggi • Mumtaz',
      description:
        'Selamat atas pencapaian luar biasa ini! Seluruh butir kaidah tajwid pada modul ini Anda kuasai dengan sempurna tanpa ada kesalahan sedikitpun. Terus pertahankan ketelitian dan keistiqomahan membaca Al-Qur’an secara tartil.',
      toneColor: 'text-emerald-950',
      borderColor: 'border-emerald-300',
      bgGradient: 'from-emerald-50 via-teal-50 to-white',
    };
  }
  if (percentage >= 90) {
    return {
      headline: 'Alhamdulillah, Hasil Sangat Mengesankan!',
      badge: 'Hampir Sempurna • Jayyid Jiddan',
      description:
        'Luar biasa! Pemahaman Anda terhadap materi ini sudah sangat matang dan mendalam. Hanya satu butir yang terlewat, simak catatan refleksi ilmiah di bawah untuk menyempurnakan ketelitian Anda.',
      toneColor: 'text-emerald-900',
      borderColor: 'border-emerald-200',
      bgGradient: 'from-emerald-50/90 via-teal-50/60 to-white',
    };
  }
  if (percentage >= 80) {
    return {
      headline: 'Barakallahu Fiik! Nilai di Atas Standar',
      badge: 'Lulus Memuaskan • Jayyid',
      description:
        'Selamat! Anda lulus dengan nilai yang sangat membanggakan di atas batas minimal kelulusan (KKM 70%). Kaidah-kaidah inti tajwid sudah Anda pahami dengan mantap.',
      toneColor: 'text-teal-950',
      borderColor: 'border-teal-300',
      bgGradient: 'from-teal-50 via-emerald-50/60 to-white',
    };
  }
  if (percentage >= 70) {
    return {
      headline: 'Selamat, Anda Berhasil Lulus KKM!',
      badge: 'Status: Lulus KKM 70%',
      description:
        'Alhamdulillah, pemahaman dasar kaidah tajwid Anda sudah memenuhi syarat kelulusan modul ini. Pelajari ulasan refleksi di bawah agar bacaan sehari-hari semakin mutqin dan percaya diri.',
      toneColor: 'text-slate-900',
      borderColor: 'border-emerald-200',
      bgGradient: 'from-emerald-50/60 via-slate-50 to-white',
    };
  }
  if (percentage >= 60) {
    return {
      headline: 'Sedikit Lagi Menuju Ambang Kelulusan!',
      badge: 'Perlu Penguatan Ringan',
      description:
        'Usaha yang sangat baik! Anda hanya selisih sedikit dari batas kelulusan 70%. Tinjau kembali kunci jawaban dan poin refleksi di bawah ini, lalu coba ulangi kuis untuk meraih hasil terbaik.',
      toneColor: 'text-amber-950',
      borderColor: 'border-amber-300',
      bgGradient: 'from-amber-50 via-orange-50/40 to-white',
    };
  }
  if (percentage >= 40) {
    return {
      headline: 'Tetap Semangat, Anda Berada di Jalur Belajar yang Baik!',
      badge: 'Proses Belajar • Terus Berlatih',
      description:
        'Sebagian konsep kaidah sudah berhasil Anda pahami dengan tepat. Luangkan waktu sejenak membaca kembali rangkuman materi di lembar silabus, lalu uji kembali pemahaman Anda dengan tenang.',
      toneColor: 'text-amber-950',
      borderColor: 'border-amber-300',
      bgGradient: 'from-amber-50 via-amber-100/30 to-white',
    };
  }
  return {
    headline: 'Setiap Langkah Thalabul ‘Ilmi Bernilai Pahala',
    badge: 'Mari Ulangi Materi',
    description:
      'Mempelajari ilmu tajwid memang memerlukan ketelatenan dan pembiasaan. Jangan berkecil hati, tonton kembali video penjelasannya dan cermati ulasan kunci jawaban di bawah sebelum mencoba lagi ya!',
    toneColor: 'text-slate-900',
    borderColor: 'border-slate-300',
    bgGradient: 'from-slate-50 via-slate-100/60 to-white',
  };
}

export default function TajwidPage() {
  const [modules, setModules] = useState<TajwidModule[]>(FALLBACK_MODULES);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeModule, setActiveModule] = useState<TajwidModule | null>(null);

  // Active view tab in module: 'lesson' | 'quiz'
  const [activeTab, setActiveTab] = useState<'lesson' | 'quiz'>('lesson');

  // Gemini AI Card Quiz State (5 Questions Stepper)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [quizReview, setQuizReview] = useState<QuizSubmitResponse | null>(null);

  // Reflection review filter: 'all' | 'wrong' | 'correct'
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'correct'>('all');

  useEffect(() => {
    fetch('/api/v1/tajwid/modules')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch modules');
        return res.json();
      })
      .then((data: TajwidModule[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const merged = data.map((mod, idx) => {
            const fallbackMod = FALLBACK_MODULES[idx] || FALLBACK_MODULES[0];
            return {
              ...mod,
              thumbnailUrl:
                mod.thumbnailUrl ||
                fallbackMod.thumbnailUrl ||
                (mod.youtubeVideoId ? `https://img.youtube.com/vi/${mod.youtubeVideoId}/hqdefault.jpg` : ''),
              quiz: mod.quiz && mod.quiz.questions?.length > 0 ? mod.quiz : fallbackMod.quiz,
              contentBody: mod.contentBody || fallbackMod.contentBody,
            };
          });
          setModules(merged);
        }
      })
      .catch((err) => {
        console.warn('Using fallback tajwid modules:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleOpenModule = async (mod: TajwidModule) => {
    setActiveTab('lesson');
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizReview(null);
    setReviewFilter('all');

    try {
      const res = await fetch(`/api/v1/tajwid/modules/${mod.slug}`);
      if (res.ok) {
        const data = await res.json();
        setActiveModule({
          ...mod,
          thumbnailUrl: mod.thumbnailUrl || data.thumbnailUrl,
          contentBody: data.contentBody || mod.contentBody,
          quiz: data.quiz || mod.quiz,
        });
        return;
      }
    } catch (e) {
      console.warn('Failed to load real module detail from backend:', e);
    }
    setActiveModule(mod);
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (quizReview) return; // Locked if already submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Submit quiz attempt (with guaranteed answer preservation and review sync)
  const handleSubmitQuiz = async () => {
    if (!activeModule?.quiz) return;
    const quiz = activeModule.quiz;

    // Check if any question remains unanswered
    const unanswered = quiz.questions.filter((q) => !selectedAnswers[q.id]);
    if (unanswered.length > 0) {
      const firstUnansweredIdx = quiz.questions.findIndex((q) => !selectedAnswers[q.id]);
      if (firstUnansweredIdx >= 0) {
        setCurrentQuestionIndex(firstUnansweredIdx);
      }
      alert(`Mohon lengkapi seluruh ${quiz.questions.length} butir pertanyaan kuis.`);
      return;
    }

    setIsSubmitting(true);
    const answersPayload = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: selectedAnswers[q.id],
    }));

    try {
      const token = localStorage.getItem('hifzhly_auth_token');
      const res = await fetch(`/api/v1/tajwid/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ answers: answersPayload }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawReviews: QuizQuestionReview[] = (data.reviews || data.review || []) as QuizQuestionReview[];

        // Combine backend reviews with full question details so NO answers are lost
        const mappedReviews: QuizQuestionReview[] = quiz.questions.map((q) => {
          const userChoiceId = selectedAnswers[q.id];
          const backendItem = rawReviews.find((r) => r.questionId === q.id);

          const correctOptId =
            backendItem?.correctOptionId ||
            MOCK_CORRECT_KEYS[q.id]?.correctOptionId ||
            q.options[0]?.id;

          const isCorrect = backendItem ? backendItem.isCorrect : userChoiceId === correctOptId;
          const explanation =
            backendItem?.explanation ||
            MOCK_CORRECT_KEYS[q.id]?.explanation ||
            'Kaidah tajwid diterapkan sesuai hukum makharijul huruf dan sifatul huruf.';

          return {
            questionId: q.id,
            questionText: q.questionText,
            selectedOptionId: userChoiceId,
            correctOptionId: correctOptId,
            isCorrect,
            explanation,
          };
        });

        const correctCount = mappedReviews.filter((r) => r.isCorrect).length;
        const score = Math.round((correctCount / quiz.questions.length) * 100);

        setQuizReview({
          quizId: quiz.id,
          attemptId: data.attemptId || `attempt-${Date.now()}`,
          score: typeof data.score === 'number' ? Math.round(data.score) : score,
          totalQuestions: quiz.questions.length,
          correctAnswers: correctCount,
          passed: score >= quiz.passingScore,
          passingScore: quiz.passingScore,
          completedAt: data.completedAt || new Date().toISOString(),
          review: mappedReviews,
          reviews: mappedReviews,
        });
      } else {
        throw new Error('Fallback to local evaluation');
      }
    } catch {
      // Local robust evaluation fallback
      let correctCount = 0;
      const reviews: QuizQuestionReview[] = quiz.questions.map((q) => {
        const userChoice = selectedAnswers[q.id];
        const correctInfo = MOCK_CORRECT_KEYS[q.id] || {
          correctOptionId: q.options[0].id,
          explanation: 'Kaidah tajwid berlaku sesuai hukum makharijul huruf dan sifatul huruf.',
        };
        const isCorrect = userChoice === correctInfo.correctOptionId;
        if (isCorrect) correctCount++;

        return {
          questionId: q.id,
          questionText: q.questionText,
          selectedOptionId: userChoice,
          correctOptionId: correctInfo.correctOptionId,
          isCorrect,
          explanation: correctInfo.explanation,
        };
      });

      const score = Math.round((correctCount / quiz.questions.length) * 100);
      const passed = score >= quiz.passingScore;

      setQuizReview({
        quizId: quiz.id,
        attemptId: `attempt-${Date.now()}`,
        score,
        totalQuestions: quiz.questions.length,
        correctAnswers: correctCount,
        passed,
        passingScore: quiz.passingScore,
        completedAt: new Date().toISOString(),
        review: reviews,
        reviews,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setQuizReview(null);
    setReviewFilter('all');
  };

  const handleNextModule = () => {
    if (!activeModule) return;
    const currentIndex = modules.findIndex((m) => m.id === activeModule.id);
    const nextIndex = (currentIndex + 1) % modules.length;
    handleOpenModule(modules[nextIndex]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-emerald-700 space-x-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-semibold">Memuat kurikulum Tajwid Academy...</span>
      </div>
    );
  }

  // Active Module View
  if (activeModule) {
    const quiz = activeModule.quiz;
    const currentQ = quiz?.questions[currentQuestionIndex];
    const totalQ = quiz?.questions.length || 0;
    const answeredCount = quiz ? quiz.questions.filter((q) => selectedAnswers[q.id]).length : 0;
    const isAllAnswered = quiz ? answeredCount === quiz.questions.length : false;

    // Review statistics and appreciation
    const finalScore = quizReview ? Math.round(quizReview.score) : 0;
    const appreciation = getAppreciationMessage(finalScore);
    const reviewList = quizReview?.review || quizReview?.reviews || [];
    const filteredReviewList = reviewList.filter((item) => {
      if (reviewFilter === 'wrong') return !item.isCorrect;
      if (reviewFilter === 'correct') return item.isCorrect;
      return true;
    });

    return (
      <div className="space-y-6">
        {/* Module Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setActiveModule(null)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-white text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
              title="Kembali ke Daftar Modul"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 block">
                Modul {activeModule.orderIndex} • Tajwid Academy
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {activeModule.title}
              </h2>
            </div>
          </div>

          {/* Module Mode Switcher */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('lesson')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'lesson'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Materi &amp; Video
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kuis Evaluasi AI {quizReview && '• Hasil & Refleksi'}
            </button>
          </div>
        </div>

        {/* Tab 1: Lesson & Video */}
        {activeTab === 'lesson' && (
          <div className="space-y-6">
            {/* YouTube Embed Player or Prominent Cover Image */}
            {activeModule.youtubeVideoId ? (
              <div className="aspect-video w-full rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
                <iframe
                  src={`https://www.youtube.com/embed/${activeModule.youtubeVideoId}`}
                  title={activeModule.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            ) : activeModule.thumbnailUrl ? (
              <div className="aspect-video w-full rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative">
                <img
                  src={activeModule.thumbnailUrl}
                  alt={activeModule.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            {/* Lesson Body Content */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-emerald-700" />
                <span>Rangkuman Kaidah Tajwid</span>
              </h3>

              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-sans">
                {activeModule.contentBody}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('quiz')}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <span>Mulai Uji Pemahaman di Kuis Gemini AI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Gemini AI Canvas Quiz & Post-Quiz Reflection Screen */}
        {activeTab === 'quiz' && quiz && (
          <div className="space-y-6">
            {/* If Quiz is NOT submitted yet: Gemini AI Card Stepper UI */}
            {!quizReview ? (
              <div className="max-w-3xl mx-auto space-y-5">
                {/* Stepper Header & Progress Ring */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 block">
                          Gemini AI Quiz Canvas • 5 Soal Evaluasi
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                          {quiz.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-start sm:self-auto">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                        Soal {currentQuestionIndex + 1} / {totalQ}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
                        KKM: {quiz.passingScore}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Progres Pengerjaan</span>
                      <span>
                        {answeredCount} dari {totalQ} terjawab ({Math.round((answeredCount / totalQ) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                        style={{ width: `${(answeredCount / totalQ) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Interactive Question Navigation Selector Strip */}
                  <div className="flex items-center justify-between pt-1 gap-1.5 overflow-x-auto pb-1">
                    {quiz.questions.map((q, idx) => {
                      const isAnswered = Boolean(selectedAnswers[q.id]);
                      const isCurrent = idx === currentQuestionIndex;

                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`flex-1 min-w-[50px] py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer border ${
                            isCurrent
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : isAnswered
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span>{idx + 1}</span>
                          {isAnswered && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* THE ACTIVE GEMINI AI QUESTION CARD */}
                {currentQ && (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 transition-all animate-in fade-in duration-200">
                    {/* Question Statement */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Pertanyaan Nomor {currentQuestionIndex + 1}
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {currentQ.questionText}
                      </h4>
                    </div>

                    {/* Options Stack (A, B, C, D) */}
                    <div className="space-y-3">
                      {currentQ.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[currentQ.id] === opt.id;
                        const optionLetter = String.fromCharCode(65 + optIdx); // A, B, C, D

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption(currentQ.id, opt.id)}
                            className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center space-x-3 cursor-pointer group ${
                              isSelected
                                ? 'bg-emerald-50/90 border-emerald-600 text-slate-900 ring-2 ring-emerald-600/20 shadow-xs'
                                : 'bg-white border-slate-200/90 text-slate-700 hover:border-emerald-300 hover:bg-slate-50/60'
                            }`}
                          >
                            <span
                              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800'
                              }`}
                            >
                              {optionLetter}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold flex-1 leading-relaxed">
                              {opt.optionText}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Card Navigation Controls */}
                    <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center space-x-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Sebelumnya</span>
                      </button>

                      {currentQuestionIndex < totalQ - 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentQuestionIndex((prev) => Math.min(totalQ - 1, prev + 1))
                          }
                          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                        >
                          <span>Selanjutnya</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmitQuiz}
                          disabled={isSubmitting || !isAllAnswered}
                          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-60 disabled:pointer-events-none flex items-center space-x-2 cursor-pointer"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Mengevaluasi Kuis...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Selesaikan &amp; Buka Refleksi</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Bottom Status Hint */}
                    {!isAllAnswered && (
                      <p className="text-[11px] text-slate-400 text-center font-medium">
                        Tersisa {totalQ - answeredCount} pertanyaan yang belum Anda jawab.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* POST-QUIZ REVIEW & REFLECTION SCREEN ALA GEMINI AI CANVAS */
              <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
                {/* 1. Score & Humanized Appreciation Canvas Card */}
                <div
                  className={`p-6 sm:p-8 rounded-3xl border shadow-md bg-linear-to-br ${appreciation.bgGradient} ${appreciation.borderColor} space-y-5`}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center sm:text-left">
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-700 shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{appreciation.badge}</span>
                      </span>

                      <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${appreciation.toneColor}`}>
                        {appreciation.headline}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
                        {appreciation.description}
                      </p>
                    </div>

                    {/* Big Numeric Percentage Score */}
                    <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm text-center min-w-[150px] shrink-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Skor Akhir
                      </span>
                      <div className="flex items-baseline justify-center space-x-1 my-1">
                        <span className="text-4xl sm:text-5xl font-black text-slate-900 font-mono tabular-nums leading-none">
                          {finalScore}
                        </span>
                        <span className="text-base font-bold text-slate-400">%</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 block">
                        {quizReview.correctAnswers} / {quizReview.totalQuestions} Soal Benar • KKM {quizReview.passingScore}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Review Filter & Heading */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                        <Info className="w-4 h-4 text-emerald-700" />
                        <span>Review Jawaban &amp; Refleksi Ilmiah Tajwid</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tinjau setiap butir pertanyaan untuk memahami mengapa jawaban tersebut benar dan di mana letak ketelitiannya.
                      </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setReviewFilter('all')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          reviewFilter === 'all'
                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Semua ({reviewList.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewFilter('correct')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          reviewFilter === 'correct'
                            ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Benar ({quizReview.correctAnswers})
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewFilter('wrong')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          reviewFilter === 'wrong'
                            ? 'bg-white text-rose-800 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Salah ({quizReview.totalQuestions - quizReview.correctAnswers})
                      </button>
                    </div>
                  </div>

                  {/* Question Review Items List */}
                  <div className="space-y-5 pt-1">
                    {filteredReviewList.map((item, idx) => {
                      const questionObj = quiz.questions.find((q) => q.id === item.questionId);
                      const selectedOptObj = questionObj?.options.find(
                        (o) => o.id === item.selectedOptionId
                      );
                      const correctOptObj = questionObj?.options.find(
                        (o) => o.id === item.correctOptionId
                      );

                      return (
                        <div
                          key={item.questionId}
                          className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 space-y-4 bg-slate-50/50"
                        >
                          {/* Question Header & Verification Badge */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start space-x-2.5">
                              <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <h5 className="text-sm font-bold text-slate-900 leading-snug">
                                {item.questionText}
                              </h5>
                            </div>

                            <span
                              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${
                                item.isCorrect
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {item.isCorrect ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Benar</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-rose-700" />
                                  <span>Kurang Tepat</span>
                                </>
                              )}
                            </span>
                          </div>

                          {/* Selected Option vs Correct Option Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div
                              className={`p-3.5 rounded-xl border ${
                                item.isCorrect
                                  ? 'bg-emerald-50/40 border-emerald-200'
                                  : 'bg-rose-50/50 border-rose-200'
                              }`}
                            >
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Jawaban Anda:
                              </span>
                              <span
                                className={`font-bold text-xs sm:text-sm block ${
                                  item.isCorrect ? 'text-emerald-800' : 'text-rose-800'
                                }`}
                              >
                                {selectedOptObj?.optionText || 'Tidak dijawab'}
                              </span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-white border border-emerald-200/90 shadow-2xs">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Kunci Jawaban Resmi:
                              </span>
                              <span className="font-bold text-xs sm:text-sm text-emerald-800 block">
                                {correctOptObj?.optionText || '-'}
                              </span>
                            </div>
                          </div>

                          {/* Refleksi & Penjelasan Kaidah Tajwid */}
                          <div className="p-4 rounded-2xl bg-teal-50/90 border border-teal-200 text-xs text-teal-950 space-y-1.5 font-sans">
                            <span className="font-bold text-teal-900 flex items-center space-x-1.5 text-xs">
                              <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
                              <span>Refleksi Ilmiah: Mengapa Jawaban Ini Benar?</span>
                            </span>
                            <p className="text-teal-950 leading-relaxed pl-5">
                              {item.explanation}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 3. Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleRetryQuiz}
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-500" />
                      <span>Ulangi Kuis Ini</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextModule}
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Lanjut ke Modul Berikutnya</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Module Grid Overview (User View with prominent cover thumbnail)
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Tajwid Academy &amp; Evaluasi Teori
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pelajari kaidah hukum bacaan Al-Qur'an secara ilmiah melalui video panduan, teks rujukan, dan kuis interaktif ala Gemini AI.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((module) => (
          <div
            key={module.id}
            onClick={() => handleOpenModule(module)}
            className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
          >
            <div>
              {/* Cover Thumbnail Image */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-200/60 flex items-center justify-center">
                {module.thumbnailUrl || module.youtubeVideoId ? (
                  <img
                    src={
                      module.thumbnailUrl ||
                      `https://img.youtube.com/vi/${module.youtubeVideoId}/hqdefault.jpg`
                    }
                    alt={module.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (
                        module.youtubeVideoId &&
                        target.src !== `https://img.youtube.com/vi/${module.youtubeVideoId}/hqdefault.jpg`
                      ) {
                        target.src = `https://img.youtube.com/vi/${module.youtubeVideoId}/hqdefault.jpg`;
                      } else {
                        target.style.display = 'none';
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-emerald-800 to-teal-900 flex flex-col items-center justify-center text-white/80 p-3 text-center">
                    <BookOpen className="w-8 h-8 text-emerald-300 mb-1" />
                    <span className="text-xs font-bold text-white tracking-wide">Tajwid Academy</span>
                  </div>
                )}
                <span className="absolute top-2.5 left-2.5 font-mono bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-lg text-[10px] font-bold">
                  Modul 0{module.orderIndex}
                </span>
                {module.youtubeVideoId && (
                  <span className="absolute top-2.5 right-2.5 bg-rose-600/90 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1">
                    <Video className="w-3 h-3" />
                    <span>Video</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                  Silabus Tajwid
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {module.quiz?.questions?.length || 5} Soal Kuis
                </span>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-1">
                {module.title}
              </h3>

              <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                {module.summary}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>KKM: {module.quiz?.passingScore || 70}%</span>
              </span>

              <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform">
                <span>Buka Materi</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
