import type { TajwidModule } from '../types';

export const TAJWID_STORAGE_KEY = 'hifzhly_local_tajwid_modules';
export const TAJWID_UPDATED_EVENT = 'hifzhly_tajwid_modules_updated';

// Default Comprehensive Curated Fallback Modules (5 Questions Each)
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

  try {
    localStorage.setItem(TAJWID_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(TAJWID_UPDATED_EVENT, { detail: updated }));
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
  const localMap = new Map<string, TajwidModule>();
  localList.forEach((m) => {
    if (m.slug) localMap.set(m.slug, m);
    if (m.id) localMap.set(m.id, m);
  });

  try {
    const res = await fetch('/api/v1/tajwid/modules');
    if (res.ok) {
      const serverList: TajwidModule[] = (await res.json()) || [];
      if (Array.isArray(serverList) && serverList.length > 0) {
        const mergedMap = new Map<string, TajwidModule>();

        // First apply default / server modules
        serverList.forEach((s) => {
          mergedMap.set(s.slug, s);
        });

        // Overlay with local modules so uploaded thumbnails & modified articles NEVER get lost
        localList.forEach((l) => {
          const existing = mergedMap.get(l.slug);
          if (existing) {
            mergedMap.set(l.slug, {
              ...existing,
              ...l,
              thumbnailUrl: l.thumbnailUrl || existing.thumbnailUrl,
              contentBody: l.contentBody || existing.contentBody,
              summary: l.summary || existing.summary,
              quiz: l.quiz || existing.quiz,
            });
          } else {
            mergedMap.set(l.slug, l);
          }
        });

        const finalMerged = Array.from(mergedMap.values()).sort(
          (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
        );

        // Update local storage cache
        try {
          localStorage.setItem(TAJWID_STORAGE_KEY, JSON.stringify(finalMerged));
        } catch {}

        return finalMerged;
      }
    }
  } catch (err) {
    console.warn('Backend unavailable, using local tajwid modules:', err);
  }

  return localList;
}
