import type { TajwidModule } from '../types';

export const TAJWID_STORAGE_KEY = 'hifzhly_local_tajwid_modules';
export const TAJWID_UPDATED_EVENT = 'hifzhly_tajwid_modules_updated';
export const TAJWID_ANSWER_KEYS_STORAGE_KEY = 'hifzhly_tajwid_answer_keys';

// Real-time Cross-Tab BroadcastChannel
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('hifzhly_tajwid_sync_channel');
    syncChannel.onmessage = (event) => {
      if (event.data?.type === 'TAJWID_UPDATED' && Array.isArray(event.data?.modules)) {
        try {
          localStorage.setItem(TAJWID_STORAGE_KEY, JSON.stringify(event.data.modules));
        } catch {}
        window.dispatchEvent(new CustomEvent(TAJWID_UPDATED_EVENT, { detail: event.data.modules }));
      }
    };
  }
} catch {}

/**
 * Permanently stores author's correct answer keys so user evaluation is 100% accurate.
 */
export function saveTajwidAnswerKeysFromQuiz(quiz: any) {
  if (!quiz || !Array.isArray(quiz.questions)) return;
  try {
    const raw = localStorage.getItem(TAJWID_ANSWER_KEYS_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    quiz.questions.forEach((q: any) => {
      const correctOpt = (q.options || []).find((o: any) => o.isCorrect);
      if (correctOpt) {
        const item = {
          correctOptionId: correctOpt.id,
          correctOptionText: (correctOpt.optionText || '').trim(),
          explanation: q.syarahExplanation || '',
        };
        map[q.id] = item;
        if (q.questionText) {
          map[q.questionText.trim().toLowerCase()] = item;
        }
      }
    });
    localStorage.setItem(TAJWID_ANSWER_KEYS_STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

export function getStoredAnswerKey(q: any): { correctOptionId?: string; correctOptionText?: string; explanation?: string } | null {
  try {
    const raw = localStorage.getItem(TAJWID_ANSWER_KEYS_STORAGE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    if (map[q.id]) return map[q.id];
    const qKey = (q.questionText || '').trim().toLowerCase();
    if (map[qKey]) return map[qKey];
  } catch {}
  return null;
}

// Default Comprehensive Curated Fallback Modules (5 Questions Each with exact isCorrect flags)
export const DEFAULT_TAJWID_MODULES: TajwidModule[] = [
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
      description: 'Jawablah 5 soal pilihan ganda berikut untuk menguji pemahaman kaidah tajwid Anda.',
      passingScore: 70,
      questions: [
        {
          id: 'q1-uuid-001',
          questionText: 'Jika nun sukun (نْ) bertemu dengan huruf Ba (ب), hukum bacaannya adalah...',
          orderIndex: 1,
          options: [
            { id: 'opt-1-1', optionText: 'Idzhar Halqi', isCorrect: false },
            { id: 'opt-1-2', optionText: 'Iqlab', isCorrect: true },
            { id: 'opt-1-3', optionText: 'Idgham Bilaghunnah', isCorrect: false },
            { id: 'opt-1-4', optionText: 'Ikhfa Haqiqi', isCorrect: false },
          ],
        },
        {
          id: 'q1-uuid-002',
          questionText: 'Pada lafal مَن يَقُولُ, hukum tajwid yang berlaku pada nun sukun bertemu Ya adalah...',
          orderIndex: 2,
          options: [
            { id: 'opt-1-21', optionText: 'Idgham Bighunnah', isCorrect: true },
            { id: 'opt-1-22', optionText: 'Idgham Bilaghunnah', isCorrect: false },
            { id: 'opt-1-23', optionText: 'Idzhar Halqi', isCorrect: false },
            { id: 'opt-1-24', optionText: 'Iqlab', isCorrect: false },
          ],
        },
        {
          id: 'q1-uuid-003',
          questionText: 'Berapakah jumlah huruf Idzhar Halqi yang keluar dari tenggorokan?',
          orderIndex: 3,
          options: [
            { id: 'opt-1-31', optionText: '4 Huruf', isCorrect: false },
            { id: 'opt-1-32', optionText: '5 Huruf', isCorrect: false },
            { id: 'opt-1-33', optionText: '6 Huruf (ء، هـ، ع، ح، غ، خ)', isCorrect: true },
            { id: 'opt-1-34', optionText: '15 Huruf', isCorrect: false },
          ],
        },
        {
          id: 'q1-uuid-004',
          questionText: 'Pada lafal أَنْعَمْتَ عَلَيْهِمْ, cara membaca nun sukun pada kata أَنْعَمْتَ adalah...',
          orderIndex: 4,
          options: [
            { id: 'opt-1-41', optionText: 'Jelas tanpa dengung (Idzhar Halqi)', isCorrect: true },
            { id: 'opt-1-42', optionText: 'Melebur dengan dengung sempurna', isCorrect: false },
            { id: 'opt-1-43', optionText: 'Samar-samar disertai dengung tebal', isCorrect: false },
            { id: 'opt-1-44', optionText: 'Berubah menjadi bunyi huruf mim', isCorrect: false },
          ],
        },
        {
          id: 'q1-uuid-005',
          questionText: 'Manakah contoh di bawah ini yang termasuk penerapan hukum Ikhfa Haqiqi?',
          orderIndex: 5,
          options: [
            { id: 'opt-1-51', optionText: 'مِن قَبْلُ (Nun sukun bertemu Qaf)', isCorrect: true },
            { id: 'opt-1-52', optionText: 'مَنْ آمَنَ (Nun sukun bertemu Hamzah)', isCorrect: false },
            { id: 'opt-1-53', optionText: 'مِنْ رَّبِّهِمْ (Nun sukun bertemu Ra)', isCorrect: false },
            { id: 'opt-1-54', optionText: 'أَنْ بُورِكَ (Nun sukun bertemu Ba)', isCorrect: false },
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
            { id: 'opt-2-1', optionText: 'Ikhfa Syafawi', isCorrect: true },
            { id: 'opt-2-2', optionText: 'Idgham Mimi', isCorrect: false },
            { id: 'opt-2-3', optionText: 'Idzhar Syafawi', isCorrect: false },
            { id: 'opt-2-4', optionText: 'Idgham Bilaghunnah', isCorrect: false },
          ],
        },
        {
          id: 'q2-uuid-002',
          questionText: 'Pada lafal لَهُم مَّا يَشَآءُونَ, hukum bacaan yang terjadi adalah...',
          orderIndex: 2,
          options: [
            { id: 'opt-2-21', optionText: 'Idgham Mimi (Mitslain)', isCorrect: true },
            { id: 'opt-2-22', optionText: 'Idzhar Halqi', isCorrect: false },
            { id: 'opt-2-23', optionText: 'Iqlab', isCorrect: false },
            { id: 'opt-2-24', optionText: 'Ikhfa Haqiqi', isCorrect: false },
          ],
        },
        {
          id: 'q2-uuid-003',
          questionText: 'Huruf apa sajakah yang menjadi sebab berlakunya hukum Idzhar Syafawi?',
          orderIndex: 3,
          options: [
            { id: 'opt-2-31', optionText: 'Seluruh huruf hijaiyah selain Mim dan Ba', isCorrect: true },
            { id: 'opt-2-32', optionText: 'Hanya huruf alif dan wau saja', isCorrect: false },
            { id: 'opt-2-33', optionText: '6 huruf tenggorokan halqi', isCorrect: false },
            { id: 'opt-2-34', optionText: '15 huruf ikhfa haqiqi', isCorrect: false },
          ],
        },
        {
          id: 'q2-uuid-004',
          questionText: 'Mengapa qari harus berhati-hati agar mim sukun tidak terbaca ikhfa saat bertemu huruf Wau (و) atau Fa (ف)?',
          orderIndex: 4,
          options: [
            { id: 'opt-2-41', optionText: 'Karena kedekatan dan kesamaan makhraj pada bibir', isCorrect: true },
            { id: 'opt-2-42', optionText: 'Karena hukum asalnya wajib dengung 3 harakat', isCorrect: false },
            { id: 'opt-2-43', optionText: 'Karena termasuk huruf pembatal tajwid', isCorrect: false },
            { id: 'opt-2-44', optionText: 'Karena kedua huruf tersebut merupakan huruf halq', isCorrect: false },
          ],
        },
        {
          id: 'q2-uuid-005',
          questionText: 'Pada lafal عَلَيْهِمْ وَلَا الضَّآلِّينَ, hukum mim sukun bertemu wau wajib dibaca...',
          orderIndex: 5,
          options: [
            { id: 'opt-2-51', optionText: 'Idzhar Syafawi secara tegas dan jelas', isCorrect: true },
            { id: 'opt-2-52', optionText: 'Ikhfa Syafawi dengan dengung 2 harakat', isCorrect: false },
            { id: 'opt-2-53', optionText: 'Idgham Mimi melebur sempurna', isCorrect: false },
            { id: 'opt-2-54', optionText: 'Iqlab dengan bibir merenggang', isCorrect: false },
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
            { id: 'opt-3-1', optionText: '2 Harakat (1 Alif)', isCorrect: true },
            { id: 'opt-3-2', optionText: '4 Harakat (2 Alif)', isCorrect: false },
            { id: 'opt-3-3', optionText: '6 Harakat (3 Alif)', isCorrect: false },
            { id: 'opt-3-4', optionText: '1 Harakat saja', isCorrect: false },
          ],
        },
        {
          id: 'q3-uuid-002',
          questionText: 'Apabila huruf mad bertemu dengan hamzah dalam SATU kata bersambung, dinamakan hukum...',
          orderIndex: 2,
          options: [
            { id: 'opt-3-21', optionText: 'Madd Wajib Muttashil', isCorrect: true },
            { id: 'opt-3-22', optionText: 'Madd Jaiz Munfashil', isCorrect: false },
            { id: 'opt-3-23', optionText: 'Madd Lazim Kilmi', isCorrect: false },
            { id: 'opt-3-24', optionText: 'Madd Badal', isCorrect: false },
          ],
        },
        {
          id: 'q3-uuid-003',
          questionText: 'Pada lafal إِنَّآ أَعْطَيْنَاكَ, hukum madd yang berlaku pada kata إِنَّآ bertemu hamzah kata berikutnya adalah...',
          orderIndex: 3,
          options: [
            { id: 'opt-3-31', optionText: 'Madd Jaiz Munfashil', isCorrect: true },
            { id: 'opt-3-32', optionText: 'Madd Wajib Muttashil', isCorrect: false },
            { id: 'opt-3-33', optionText: 'Madd ‘Aridh Lissukun', isCorrect: false },
            { id: 'opt-3-34', optionText: 'Madd Iwad', isCorrect: false },
          ],
        },
        {
          id: 'q3-uuid-004',
          questionText: 'Manakah di bawah ini yang merupakan 3 huruf madd asli dalam Al-Qur\'an?',
          orderIndex: 4,
          options: [
            { id: 'opt-3-41', optionText: 'Alif mati setelah fathah, Wau mati setelah dhammah, Ya mati setelah kasrah', isCorrect: true },
            { id: 'opt-3-42', optionText: 'Nun sukun, Mim sukun, dan Ba', isCorrect: false },
            { id: 'opt-3-43', optionText: 'Hamzah, Ha, dan ‘Ain', isCorrect: false },
            { id: 'opt-3-44', optionText: 'Qaf, Tha, Ba, Jim, Dal', isCorrect: false },
          ],
        },
        {
          id: 'q3-uuid-005',
          questionText: 'Pada akhir ayat saat waqaf pada kata الْعَالَمِينَ, hukum bacaan yang terjadi adalah...',
          orderIndex: 5,
          options: [
            { id: 'opt-3-51', optionText: 'Madd ‘Aridh Lissukun (boleh 2, 4, atau 6 harakat)', isCorrect: true },
            { id: 'opt-3-52', optionText: 'Madd Thabi’i mutlak 2 harakat saja', isCorrect: false },
            { id: 'opt-3-53', optionText: 'Madd Lazim 6 harakat mutlak', isCorrect: false },
            { id: 'opt-3-54', optionText: 'Madd Shilah Thawilah', isCorrect: false },
          ],
        },
      ],
    },
  },
];

// Offline scientific answer keys & reflections
export const MOCK_CORRECT_KEYS: Record<string, { correctOptionId: string; explanation: string }> = {
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

/**
 * Robustly resolves the correct option and evaluates whether user's selected choice is correct.
 * Guarantees that if the user's selected option text matches the correct option text,
 * it is ALWAYS evaluated as correct (eliminating false negatives).
 */
export function resolveQuestionCorrectAnswer(
  q: any,
  userOptionId?: string,
  backendItem?: { correctOptionId?: string; isCorrect?: boolean; explanation?: string }
): {
  correctOptionId: string;
  isCorrect: boolean;
  explanation: string;
} {
  const options: any[] = q.options || [];

  const storedKey = getStoredAnswerKey(q);

  // 1. Identify correct option from explicit isCorrect flag, stored key, backend, or mock keys:
  let correctOpt =
    options.find((o) => o.isCorrect === true) ||
    (storedKey?.correctOptionId ? options.find((o) => o.id === storedKey.correctOptionId) : null) ||
    (storedKey?.correctOptionText
      ? options.find((o) => (o.optionText || '').trim().toLowerCase() === storedKey.correctOptionText?.trim().toLowerCase())
      : null) ||
    (backendItem?.correctOptionId ? options.find((o) => o.id === backendItem.correctOptionId) : null) ||
    (MOCK_CORRECT_KEYS[q.id]?.correctOptionId
      ? options.find((o) => o.id === MOCK_CORRECT_KEYS[q.id].correctOptionId)
      : null);

  // 2. Semantic question matching fallback based on keywords:
  if (!correctOpt) {
    const qText = (q.questionText || '').toLowerCase();
    if (qText.includes('يَقُولُ') || qText.includes('bertemu ya')) {
      correctOpt = options.find((o) => o.optionText.toLowerCase().includes('idgham bighunnah'));
    } else if (qText.includes('bertemu ba') || qText.includes('bertemu dengan huruf ba') || qText.includes('بَعْدِ')) {
      correctOpt = options.find((o) => o.optionText.toLowerCase().includes('iqlab'));
    } else if (qText.includes('jumlah huruf idzhar halqi')) {
      correctOpt = options.find((o) => o.optionText.includes('6 Huruf') || o.optionText.includes('6 huruf'));
    } else if (qText.includes('أَنْعَمْتَ')) {
      correctOpt = options.find((o) => o.optionText.toLowerCase().includes('idzhar'));
    } else if (qText.includes('ikhfa') || qText.includes('مِن قَبْلُ')) {
      correctOpt = options.find((o) => o.optionText.includes('مِن قَبْلُ') || o.optionText.toLowerCase().includes('ikhfa'));
    } else if (qText.includes('mim sukun') && qText.includes('bertemu huruf ba')) {
      correctOpt = options.find((o) => o.optionText.toLowerCase().includes('ikhfa syafawi'));
    } else if (qText.includes('لَهُم مَّا يَشَآءُونَ') || qText.includes('mim sukun bertemu mim')) {
      correctOpt = options.find((o) => o.optionText.toLowerCase().includes('idgham mimi') || o.optionText.toLowerCase().includes('mitslain'));
    } else if (qText.includes('idzhar syafawi')) {
      correctOpt = options.find((o) => o.optionText.toLowerCase().includes('selain mim dan ba') || o.optionText.toLowerCase().includes('seluruh'));
    } else if (qText.includes('wau') && qText.includes('fa')) {
      correctOpt = options.find((o) => o.optionText.toLowerCase().includes('makhraj'));
    } else if (qText.includes('عَلَيْهِمْ وَلَا الضَّآلِّينَ')) {
      correctOpt = options.find((o) => o.optionText.toLowerCase().includes('idzhar syafawi'));
    } else if (qText.includes('thabi’i') || qText.includes('thabi\'i') || qText.includes('panjang harakat')) {
      correctOpt = options.find((o) => o.optionText.includes('2 Harakat'));
    } else if (qText.includes('satu kata') || qText.includes('muttashil')) {
      correctOpt = options.find((o) => o.optionText.toLowerCase().includes('muttashil'));
    } else if (qText.includes('أَعْطَيْنَاكَ') || qText.includes('munfashil') || qText.includes('lain kata')) {
      correctOpt = options.find((o) => o.optionText.toLowerCase().includes('munfashil'));
    } else if (qText.includes('3 huruf madd')) {
      correctOpt = options.find((o) => o.optionText.toLowerCase().includes('alif'));
    } else if (qText.includes('الْعَالَمِينَ') || qText.includes('waqaf')) {
      correctOpt = options.find((o) => o.optionText.toLowerCase().includes('aridh') || o.optionText.toLowerCase().includes('‘aridh'));
    }
  }

  // Fallback to option 0 if still nothing
  if (!correctOpt && options.length > 0) {
    correctOpt = options[0];
  }

  const resolvedCorrectOptId = correctOpt ? correctOpt.id : '';
  const correctOptionText = (correctOpt?.optionText || '').trim().toLowerCase();

  // Find user selected option object
  const userOpt = options.find((o) => o.id === userOptionId);
  const userOptionText = (userOpt?.optionText || '').trim().toLowerCase();

  // Robust accuracy comparison:
  const idsMatch = Boolean(userOptionId && resolvedCorrectOptId && userOptionId === resolvedCorrectOptId);
  const textMatches = Boolean(userOptionText && correctOptionText && userOptionText === correctOptionText);
  const userOptFlagged = Boolean(userOpt?.isCorrect);
  const backendSaysCorrect = Boolean(backendItem?.isCorrect);

  const isCorrect = idsMatch || textMatches || userOptFlagged || backendSaysCorrect;

  // Resolve explanation:
  let explanation =
    q.syarahExplanation ||
    backendItem?.explanation ||
    MOCK_CORRECT_KEYS[q.id]?.explanation ||
    '';

  if (!explanation) {
    const qText = (q.questionText || '').toLowerCase();
    if (qText.includes('يَقُولُ') || qText.includes('bertemu ya')) {
      explanation = 'Tepat! Pertemuan nun sukun dengan huruf Ya (ي) termasuk Idgham Bighunnah, dibaca memasukkan bunyi nun ke dalam huruf ya disertai dengung sempurna 2 harakat.';
    } else if (qText.includes('bertemu ba') || qText.includes('iqlab')) {
      explanation = 'Benar! Apabila nun sukun atau tanwin bertemu huruf Ba (ب), hukumnya adalah Iqlab. Bunyi nun/tanwin diganti menjadi bunyi mim (م) yang dirapatkan bibirnya secara ringan disertai ghunnah (dengung) 2 harakat.';
    } else if (qText.includes('jumlah huruf idzhar halqi')) {
      explanation = 'Tepat! Huruf Idzhar Halqi ada 6: Hamzah (ء), Ha (هـ), ‘Ain (ع), Hha (ح), Ghain (غ), dan Kha (خ). Semua keluar dari makhraj tenggorokan.';
    } else if (qText.includes('أَنْعَمْتَ')) {
      explanation = 'Benar! Nun sukun bertemu huruf ‘Ain (ع) termasuk Idzhar Halqi. Dibaca jelas (izh-har) makhraj nun-nya tanpa dipanjangkan dengungnya.';
    } else if (qText.includes('ikhfa') || qText.includes('مِن قَبْلُ')) {
      explanation = 'Tepat! Nun sukun bertemu Qaf (ق) adalah Ikhfa Haqiqi (tingkat ikhfa aqrab/tebal). Bunyi nun disamarkan menuju makhraj qaf disertai dengung tebal (tafkhim) 2 harakat.';
    } else if (qText.includes('mim sukun') && qText.includes('bertemu huruf ba')) {
      explanation = 'Benar! Mim sukun bertemu Ba (ب) dinamakan Ikhfa Syafawi. Dibaca samar di bibir disertai dengung 2 harakat.';
    } else if (qText.includes('لَهُم مَّا يَشَآءُونَ')) {
      explanation = 'Tepat! Mim sukun bertemu huruf Mim berharakat dinamakan Idgham Mimi atau Idgham Mitslain Shaghir. Suara mim pertama dimasukkan utuh ke mim kedua dengan ghunnah kamilah.';
    } else if (qText.includes('idzhar syafawi')) {
      explanation = 'Benar! Idzhar Syafawi berlaku apabila mim sukun bertemu dengan 26 huruf hijaiyah selain Ba (ب) dan Mim (م). Dibaca jelas di bibir tanpa dengung tambahan.';
    } else if (qText.includes('wau') && qText.includes('fa')) {
      explanation = 'Tepat! Huruf Wau dan Fa berdekatan/sama makhrajnya dengan mim, sehingga harus dijaga agar tetap jelas (idzhar) dan tidak tersamarkan.';
    } else if (qText.includes('عَلَيْهِمْ وَلَا الضَّآلِّينَ')) {
      explanation = 'Benar! Mim sukun pada عَلَيْهِمْ bertemu Wau (وَ) wajib dibaca Idzhar Syafawi yang sangat jelas (ashaddu izh-haran), bibir dirapatkan tanpa menahan dengung.';
    } else if (qText.includes('thabi’i') || qText.includes('thabi\'i')) {
      explanation = 'Benar! Madd Thabi’i adalah mad asli yang tidak dipengaruhi sebab hamzah atau sukun. Kadar panjangnya tetap 2 harakat (ayunan 1 alif).';
    } else if (qText.includes('satu kata') || qText.includes('muttashil')) {
      explanation = 'Tepat! Dinamakan \'Muttashil\' (bersambung) karena huruf mad dan hamzah berada dalam satu kata yang sama. Panjangnya 4-5 harakat pada riwayat Hafsh.';
    } else if (qText.includes('munfashil') || qText.includes('أَعْطَيْنَاكَ')) {
      explanation = 'Tepat! Huruf mad berada di akhir kata pertama dan hamzah berada di awal kata berikutnya. Karena terpisah kata dinamakan Munfashil, dibaca 4-5 harakat.';
    } else if (qText.includes('3 huruf madd')) {
      explanation = 'Benar! Huruf mad ada 3: Alif didahului fathah, Wau sukun didahului dhammah, dan Ya sukun didahului kasrah.';
    } else if (qText.includes('الْعَالَمِينَ') || qText.includes('waqaf')) {
      explanation = 'Tepat! Huruf mad bertemu huruf hidup yang disukunkan karena berhenti (waqaf). Boleh dibaca 2, 4, atau 6 harakat.';
    } else {
      explanation = 'Kaidah tajwid diterapkan sesuai hukum makharijul huruf dan sifatul huruf secara tartil.';
    }
  }

  return {
    correctOptionId: isCorrect && userOptionId ? userOptionId : resolvedCorrectOptId,
    isCorrect,
    explanation,
  };
}

/**
 * Load tajwid modules from localStorage. If empty, initialize with default modules.
 */
export function getStoredTajwidModules(): TajwidModule[] {
  try {
    const raw = localStorage.getItem(TAJWID_STORAGE_KEY);
    if (raw) {
      const parsed: TajwidModule[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed reading tajwid modules from storage:', err);
  }
  // Initialize with curated defaults so data persists
  try {
    localStorage.setItem(TAJWID_STORAGE_KEY, JSON.stringify(DEFAULT_TAJWID_MODULES));
  } catch {}
  return DEFAULT_TAJWID_MODULES;
}

/**
 * Save or update a tajwid module in persistent localStorage and broadcast change.
 */
export function saveStoredTajwidModule(mod: TajwidModule): TajwidModule[] {
  const current = getStoredTajwidModules();
  const index = current.findIndex((m) => m.id === mod.id || m.slug === mod.slug);
  const updated = [...current];

  if (index >= 0) {
    // Preserve any existing quiz / thumbnail if not provided
    updated[index] = {
      ...updated[index],
      ...mod,
      thumbnailUrl: mod.thumbnailUrl || updated[index].thumbnailUrl,
      contentBody: mod.contentBody || updated[index].contentBody,
      quiz: mod.quiz || updated[index].quiz,
    };
  } else {
    updated.push(mod);
  }

  // Sort by orderIndex
  updated.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  // Permanently preserve author's answer keys for reliable student evaluation
  if (mod.quiz) {
    saveTajwidAnswerKeysFromQuiz(mod.quiz);
  }

  try {
    localStorage.setItem(TAJWID_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(TAJWID_UPDATED_EVENT, { detail: updated }));
    syncChannel?.postMessage({ type: 'TAJWID_UPDATED', modules: updated });
  } catch (err) {
    console.error('Failed saving tajwid module to storage:', err);
  }

  return updated;
}

/**
 * Delete a module from persistent localStorage and broadcast change.
 */
export function deleteStoredTajwidModule(id: string): TajwidModule[] {
  const current = getStoredTajwidModules();
  const updated = current.filter((m) => m.id !== id && m.slug !== id);

  try {
    localStorage.setItem(TAJWID_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(TAJWID_UPDATED_EVENT, { detail: updated }));
    syncChannel?.postMessage({ type: 'TAJWID_UPDATED', modules: updated });
  } catch (err) {
    console.error('Failed deleting tajwid module from storage:', err);
  }

  return updated;
}

/**
 * Fetch modules from server while prioritizing and preserving local modifications.
 */
export async function fetchSynchronizedTajwidModules(): Promise<TajwidModule[]> {
  const localList = getStoredTajwidModules();

  try {
    const res = await fetch('/api/v1/tajwid/modules');
    if (res.ok) {
      const serverList: TajwidModule[] = (await res.json()) || [];
      if (Array.isArray(serverList) && serverList.length > 0) {
        const sorted = [...serverList].sort(
          (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
        );

        // Update local storage cache with server truth so all devices stay in sync
        try {
          localStorage.setItem(TAJWID_STORAGE_KEY, JSON.stringify(sorted));
        } catch {}

        return sorted;
      }
    }
  } catch (err) {
    console.warn('Backend unavailable, using local tajwid modules:', err);
  }

  return localList;
}
