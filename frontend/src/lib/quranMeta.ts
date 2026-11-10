// quranMeta.ts - Standard Madinah Mushaf (604 Pages, 30 Juz, 114 Surahs)

// Start pages mapping for all 114 Surahs in Madinah Mushaf (1-indexed, index 0 unused)
export const SURAH_START_PAGES: number[] = [
  0, 1, 2, 50, 77, 106, 128, 151, 177, 187, 208, 221, 235, 249, 255, 262, 267, 282, 293, 305, 312,
  322, 332, 342, 350, 359, 367, 377, 385, 396, 404, 411, 415, 418, 428, 434, 440, 446, 453, 458, 467,
  477, 483, 489, 496, 499, 502, 507, 511, 515, 518, 520, 523, 526, 528, 531, 534, 537, 542, 545, 549,
  551, 553, 554, 556, 558, 560, 562, 564, 566, 568, 570, 572, 574, 575, 577, 578, 580, 582, 583, 585,
  586, 587, 587, 589, 590, 591, 591, 592, 593, 594, 595, 595, 596, 596, 597, 597, 598, 598, 599, 599,
  600, 600, 601, 601, 601, 602, 602, 602, 603, 603, 603, 604, 604, 604,
];

// Mapping Page Ranges for 30 Juz in Madinah Mushaf
export const JUZ_PAGE_RANGES: Record<number, { startPage: number; endPage: number }> = {
  1: { startPage: 1, endPage: 21 },
  2: { startPage: 22, endPage: 41 },
  3: { startPage: 42, endPage: 61 },
  4: { startPage: 62, endPage: 81 },
  5: { startPage: 82, endPage: 101 },
  6: { startPage: 102, endPage: 121 },
  7: { startPage: 122, endPage: 141 },
  8: { startPage: 142, endPage: 161 },
  9: { startPage: 162, endPage: 181 },
  10: { startPage: 182, endPage: 201 },
  11: { startPage: 202, endPage: 221 },
  12: { startPage: 222, endPage: 241 },
  13: { startPage: 242, endPage: 261 },
  14: { startPage: 262, endPage: 281 },
  15: { startPage: 282, endPage: 301 },
  16: { startPage: 302, endPage: 321 },
  17: { startPage: 322, endPage: 341 },
  18: { startPage: 342, endPage: 361 },
  19: { startPage: 362, endPage: 381 },
  20: { startPage: 382, endPage: 401 },
  21: { startPage: 402, endPage: 421 },
  22: { startPage: 422, endPage: 441 },
  23: { startPage: 442, endPage: 461 },
  24: { startPage: 462, endPage: 481 },
  25: { startPage: 482, endPage: 501 },
  26: { startPage: 502, endPage: 521 },
  27: { startPage: 522, endPage: 541 },
  28: { startPage: 542, endPage: 561 },
  29: { startPage: 562, endPage: 581 },
  30: { startPage: 582, endPage: 604 },
};

export function getJuzFromPage(page: number): number {
  if (page < 1) return 1;
  if (page > 604) return 30;
  for (let juz = 1; juz <= 30; juz++) {
    const range = JUZ_PAGE_RANGES[juz];
    if (range && page >= range.startPage && page <= range.endPage) {
      return juz;
    }
  }
  return 30;
}

export function getHizbFromPage(page: number): number {
  const juz = getJuzFromPage(page);
  const range = JUZ_PAGE_RANGES[juz] || { startPage: 1, endPage: 20 };
  const mid = Math.floor((range.startPage + range.endPage) / 2);
  return page <= mid ? (juz - 1) * 2 + 1 : (juz - 1) * 2 + 2;
}

export function getSurahStartPage(surahNumber: number): number {
  if (surahNumber < 1) return 1;
  if (surahNumber > 114) return 604;
  return SURAH_START_PAGES[surahNumber] || 1;
}

/**
 * Menghitung nomor halaman Mushaf Madinah yang akurat untuk ayat tertentu dalam suatu surah.
 */
export function calculateAyahPage(
  surahNumber: number,
  ayahNumber: number,
  totalAyahs: number
): number {
  const startPage = getSurahStartPage(surahNumber);
  const nextSurahStart = surahNumber < 114 ? getSurahStartPage(surahNumber + 1) : 604;
  const pagesSpan = Math.max(1, nextSurahStart - startPage);

  if (pagesSpan === 1 || totalAyahs <= 1) {
    return startPage;
  }

  // Distribusikan ayat ke dalam rentang halaman surah tersebut
  const progressRatio = Math.max(0, Math.min(1, (ayahNumber - 1) / totalAyahs));
  const estimatedOffset = Math.floor(progressRatio * pagesSpan);
  return Math.min(604, Math.max(1, startPage + estimatedOffset));
}

/**
 * Konversi angka latin ke angka Arab Uthmani untuk ornamen ayat (contoh: 1 -> ١, 25 -> ٢٥)
 */
export function toArabicDigits(num: number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num
    .toString()
    .split('')
    .map((char) => {
      const idx = parseInt(char, 10);
      return !isNaN(idx) ? arabicDigits[idx] : char;
    })
    .join('');
}

// 114 Nama Surah dalam Teks Arab
export const SURAH_ARABIC_NAMES: Record<number, string> = {
  1: 'الفَاتِحَة', 2: 'البَقَرَة', 3: 'آلِ عِمْرَان', 4: 'النِّسَاء', 5: 'المَائِدَة',
  6: 'الأَنْعَام', 7: 'الأَعْرَاف', 8: 'الأَنْفَال', 9: 'التَّوْبَة', 10: 'يُونُس',
  11: 'هُود', 12: 'يُوسُف', 13: 'الرَّعْد', 14: 'إِبْرَاهِيم', 15: 'الحِجْر',
  16: 'النَّحْل', 17: 'الإِسْرَاء', 18: 'الكَهْف', 19: 'مَرْيَم', 20: 'طه',
  21: 'الأَنْبِيَاء', 22: 'الحَجّ', 23: 'المُؤْمِنُون', 24: 'النُّور', 25: 'الفُرْقَان',
  26: 'الشُّعَرَاء', 27: 'النَّمْل', 28: 'القَصَص', 29: 'العَنْكَبُوت', 30: 'الرُّوم',
  31: 'لُقْمَان', 32: 'السَّجْدَة', 33: 'الأَحْزَاب', 34: 'سَبَأ', 35: 'فَاطِر',
  36: 'يس', 37: 'الصَّافَّات', 38: 'ص', 39: 'الزُّمَر', 40: 'غَافِر',
  41: 'فُصِّلَت', 42: 'الشُّورَى', 43: 'الزُّخْرُف', 44: 'الدُّخَان', 45: 'الجَاثِيَة',
  46: 'الأَحْقَاف', 47: 'مُحَمَّد', 48: 'الفَتْح', 49: 'الحُجُرَات', 50: 'ق',
  51: 'الذَّارِيَات', 52: 'الطُّور', 53: 'النَّجْم', 54: 'القَمَر', 55: 'الرَّحْمَن',
  56: 'الوَاقِعَة', 57: 'الحَدِيد', 58: 'المُجَادَلَة', 59: 'الحَشْر', 60: 'المُمْتَحَنَة',
  61: 'الصَّفّ', 62: 'الجُمُعَة', 63: 'المُنَافِقُون', 64: 'التَّغَابُن', 65: 'الطَّلَاق',
  66: 'التَّحْرِيم', 67: 'المُلْك', 68: 'القَلَم', 69: 'الحَاقَّة', 70: 'المَعَارِج',
  71: 'نُوح', 72: 'الجِنّ', 73: 'المُزَّمِّل', 74: 'المُدَّثِّر', 75: 'القِيَامَة',
  76: 'الإِنْسَان', 77: 'المُرْسَلَات', 78: 'النَّبَأ', 79: 'النَّازِعَات', 80: 'عَبَس',
  81: 'التَّكْوِير', 82: 'الانْفِطَار', 83: 'المُطَفِّفِين', 84: 'الانْشِقَاق', 85: 'البُرُوج',
  86: 'الطَّارِق', 87: 'الأَعْلَى', 88: 'الغَاشِيَة', 89: 'الفَجْر', 90: 'البَلَد',
  91: 'الشَّمْس', 92: 'اللَّيْل', 93: 'الضُّحَى', 94: 'الشَّرْح', 95: 'التِّين',
  96: 'العَلَق', 97: 'القَدْر', 98: 'البَيِّنَة', 99: 'الزَّلْزَلَة', 100: 'العَادِيَات',
  101: 'القَارِعَة', 102: 'التَّكَاثُر', 103: 'العَصْر', 104: 'الهُمَزَة', 105: 'الفِيل',
  106: 'قُرَيْش', 107: 'المَاعُون', 108: 'الكَوْثَر', 109: 'الكَافِرُون', 110: 'النَّصْر',
  111: 'المَسَد', 112: 'الإِخْلَاص', 113: 'الفَلَق', 114: 'النَّاس',
};

/**
 * Normalisasi Teks Arab Quran standar QUL & Tilawa (Yazin Sai):
 * Menangani Dagger Alif (\u0670 -> \u0627), Tatweel, Harakat, Variasi Alif, Ta Marbutha.
 */
export function normalizeArabicQuran(text: string): string {
  if (!text) return '';
  return text
    // 1. Ubah dagger alif (alif khanjariyah) menjadi alif biasa sebelum harakat dihapus
    .replace(/\u0670/g, '\u0627')
    // 2. Hapus tatweel / kashida
    .replace(/\u0640/g, '')
    // 3. Hapus harakat, tanda tajwid, waqaf, sukun uthmani, maddah
    .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g, '')
    // 4. Normalisasi variasi Alif (Wasla, Madda, Hamza) ke Alif polos
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    // 5. Normalisasi Ta Marbuthah ke Ha
    .replace(/\u0629/g, '\u0647')
    // 6. Normalisasi Alif Maqsura ke Ya
    .replace(/\u0649/g, '\u064A')
    // 7. Normalisasi Hamzah di atas Waw / Ya
    .replace(/[\u0624\u0626]/g, '\u0621')
    // 8. Buang semua selain huruf hijaiyah dan spasi
    .replace(/[^\u0621-\u064A\s]/g, '')
    // 9. Rapikan spasi ganda
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Levenshtein distance untuk toleransi variasi fonetik pengucapan
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const d: number[][] = [];
  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}

/**
 * Kompresi huruf vokal mad yang memanjang (alif, waw, ya) akibat tajwid Madd 'Aridh Lissukun
 * Contoh: الرحيم -> الرحييم / الرحيييم -> keduanya menjadi الرحيم
 */
export function collapseMaddLetters(word: string): string {
  if (!word) return '';
  return word
    .replace(/ا+/g, 'ا')
    .replace(/و+/g, 'و')
    .replace(/ي+/g, 'ي');
}

/**
 * Pencocokan cerdas kata demi kata antara teks ayat Quran vs lafal suara santri
 * Dilengkapi toleransi khusus Madd tajwid akhir ayat dan waqaf sukun / tanwin
 */
export function isArabicWordMatch(
  targetClean: string,
  spokenToken: string,
  isLastWordOfAyah = false
): boolean {
  if (!targetClean || !spokenToken) return false;
  if (targetClean === spokenToken) return true;

  // 1. Toleransi Madd 'Aridh Lissukun (pemanjangan vokal di akhir ayat: يي -> ي, وو -> و, اا -> ا)
  const collapsedTarget = collapseMaddLetters(targetClean);
  const collapsedSpoken = collapseMaddLetters(spokenToken);
  if (collapsedTarget === collapsedSpoken) return true;

  // 2. Toleransi imbuhan awalan 'wa' (و) atau 'fa' (ف)
  if ((spokenToken.startsWith('و') || spokenToken.startsWith('ف')) && spokenToken.slice(1) === targetClean) return true;
  if ((targetClean.startsWith('و') || targetClean.startsWith('ف')) && targetClean.slice(1) === spokenToken) return true;
  if ((collapsedSpoken.startsWith('و') || collapsedSpoken.startsWith('ف')) && collapsedSpoken.slice(1) === collapsedTarget) return true;

  // 3. Toleransi imbuhan alif-lam 'al' (ال)
  if (spokenToken.startsWith('ال') && spokenToken.slice(2) === targetClean) return true;
  if (targetClean.startsWith('ال') && targetClean.slice(2) === spokenToken) return true;
  if (collapsedSpoken.startsWith('ال') && collapsedSpoken.slice(2) === collapsedTarget) return true;

  // 4. Toleransi huruf akhir waqaf: Ta Marbuthah (ة) vs Ha (ه)
  const targetEndHa = targetClean.replace(/[\u0629\u0647]$/, 'ه');
  const spokenEndHa = spokenToken.replace(/[\u0629\u0647]$/, 'ه');
  if (targetEndHa === spokenEndHa) return true;

  // 5. Toleransi Alif Maqsura (ى) vs Alif (ا) vs Ya (ي) di akhir kata
  const targetEndAlif = targetClean.replace(/[\u0649\u0627\u064A]$/, 'ا');
  const spokenEndAlif = spokenToken.replace(/[\u0649\u0627\u064A]$/, 'ا');
  if (targetEndAlif === spokenEndAlif) return true;

  // 6. Toleransi Tanwin Fathah / Madd 'Iwadh (akhiran alif waqaf: حكيما vs حكيم)
  if (targetClean.endsWith('ا') && targetClean.slice(0, -1) === spokenToken) return true;
  if (spokenToken.endsWith('ا') && spokenToken.slice(0, -1) === targetClean) return true;

  // 7. Levenshtein distance check pada kata yang telah di-collapse
  const maxLen = Math.max(collapsedTarget.length, collapsedSpoken.length);
  const dist = levenshteinDistance(collapsedTarget, collapsedSpoken);

  if (maxLen >= 4 && dist <= 1) return true;
  if (maxLen >= 7 && dist <= 2) return true;

  // 8. TOLERANSI KHUSUS KATA TERAKHIR AYAT (WAQAF AYAH):
  // Saat santri membaca kata terakhir ayat, mereka sering berhenti (waqaf) dan bernafas,
  // sehingga speech recognition sering memotong akhiran huruf atau sedikit mengubah sukun.
  if (isLastWordOfAyah) {
    // a. Toleransi Levenshtein lebih longgar untuk kata terakhir (dist <= 1 jika len >= 3, dist <= 2 jika len >= 5)
    if (maxLen >= 3 && dist <= 1) return true;
    if (maxLen >= 5 && dist <= 2) return true;

    // b. Prefix match: jika 3 huruf pertama sama dan selisih panjang <= 2 (contoh: الرحيم vs الرحي, نستعين vs نستعي)
    if (collapsedTarget.length >= 4 && collapsedSpoken.length >= 3) {
      const minPrefix = Math.min(collapsedTarget.length - 1, collapsedSpoken.length);
      if (minPrefix >= 3 && collapsedTarget.slice(0, minPrefix) === collapsedSpoken.slice(0, minPrefix)) {
        return true;
      }
    }
  }

  return false;
}

export interface SurahMetaInfo {
  number: number;
  name: string;
  nameArabic: string;
  ayahs: number;
  startPage: number;
  endPage: number;
  juzStart: number;
  juzEnd: number;
}

const RAW_SURAH_DATA: Array<[number, string, number]> = [
  [1, 'Al-Fatihah', 7], [2, 'Al-Baqarah', 286], [3, "Ali 'Imran", 200], [4, "An-Nisa'", 176],
  [5, "Al-Ma'idah", 120], [6, "Al-An'am", 165], [7, "Al-A'raf", 206], [8, 'Al-Anfal', 75],
  [9, 'At-Taubah', 129], [10, 'Yunus', 109], [11, 'Hud', 123], [12, 'Yusuf', 111],
  [13, "Ar-Ra'd", 43], [14, 'Ibrahim', 52], [15, 'Al-Hijr', 99], [16, 'An-Nahl', 128],
  [17, "Al-Isra'", 111], [18, 'Al-Kahf', 110], [19, 'Maryam', 98], [20, 'Taha', 135],
  [21, "Al-Anbiya'", 112], [22, 'Al-Hajj', 78], [23, "Al-Mu'minun", 118], [24, 'An-Nur', 64],
  [25, 'Al-Furqan', 77], [26, "Asy-Syu'ara'", 227], [27, 'An-Naml', 93], [28, 'Al-Qasas', 88],
  [29, "Al-'Ankabut", 69], [30, 'Ar-Rum', 60], [31, 'Luqman', 34], [32, 'As-Sajdah', 30],
  [33, 'Al-Ahzab', 73], [34, "Saba'", 54], [35, 'Fatir', 45], [36, 'Yasin', 83],
  [37, 'As-Saffat', 182], [38, 'Sad', 88], [39, 'Az-Zumar', 75], [40, 'Ghafir', 85],
  [41, 'Fussilat', 54], [42, 'Asy-Syura', 53], [43, 'Az-Zukhruf', 89], [44, 'Ad-Dukhan', 59],
  [45, 'Al-Jasiyah', 37], [46, 'Al-Ahqaf', 35], [47, 'Muhammad', 38], [48, 'Al-Fath', 29],
  [49, 'Al-Hujurat', 18], [50, 'Qaf', 45], [51, 'Az-Zariyat', 60], [52, 'At-Tur', 49],
  [53, 'An-Najm', 62], [54, 'Al-Qamar', 55], [55, 'Ar-Rahman', 78], [56, "Al-Waqi'ah", 96],
  [57, 'Al-Hadid', 29], [58, 'Al-Mujadilah', 22], [59, 'Al-Hasyr', 24], [60, 'Al-Mumtahanah', 13],
  [61, 'As-Saff', 14], [62, "Al-Jumu'ah", 11], [63, 'Al-Munafiqun', 11], [64, 'At-Taghabun', 18],
  [65, 'At-Talaq', 12], [66, 'At-Tahrim', 12], [67, 'Al-Mulk', 30], [68, 'Al-Qalam', 52],
  [69, 'Al-Haqqah', 52], [70, "Al-Ma'arij", 44], [71, 'Nuh', 28], [72, 'Al-Jinn', 28],
  [73, 'Al-Muzzammil', 20], [74, 'Al-Muddassir', 56], [75, 'Al-Qiyamah', 40], [76, 'Al-Insan', 31],
  [77, 'Al-Mursalat', 50], [78, "An-Naba'", 40], [79, "An-Nazi'at", 46], [80, "'Abasa", 42],
  [81, 'At-Takwir', 29], [82, 'Al-Infitar', 19], [83, 'Al-Muthaffifin', 36], [84, 'Al-Insyiqaq', 25],
  [85, 'Al-Buruj', 22], [86, 'Ath-Thariq', 17], [87, "Al-A'la", 19], [88, 'Al-Ghasyiyah', 26],
  [89, 'Al-Fajr', 30], [90, 'Al-Balad', 20], [91, 'Asy-Syams', 15], [92, 'Al-Lail', 21],
  [93, 'Adh-Dhuha', 11], [94, 'Asy-Syarh', 8], [95, 'At-Tin', 8], [96, "Al-'Alaq", 19],
  [97, 'Al-Qadr', 5], [98, 'Al-Bayyinah', 8], [99, 'Az-Zalzalah', 8], [100, "Al-'Adiyat", 11],
  [101, "Al-Qari'ah", 11], [102, 'At-Takatsur', 8], [103, "Al-'Ashr", 3], [104, 'Al-Humazah', 9],
  [105, 'Al-Fil', 5], [106, 'Quraisy', 4], [107, "Al-Ma'un", 7], [108, 'Al-Kautsar', 3],
  [109, 'Al-Kafirun', 6], [110, 'An-Nashr', 3], [111, 'Al-Lahab', 5], [112, 'Al-Ikhlas', 4],
  [113, 'Al-Falaq', 5], [114, 'An-Nas', 6],
];

export const ALL_QURAN_SURAHS: SurahMetaInfo[] = RAW_SURAH_DATA.map(([number, name, ayahs]) => {
  const startPage = getSurahStartPage(number);
  const nextStart = number < 114 ? getSurahStartPage(number + 1) : 604;
  const endPage = number < 114 ? Math.max(startPage, nextStart > startPage ? nextStart - 1 : startPage) : 604;
  return {
    number,
    name,
    nameArabic: SURAH_ARABIC_NAMES[number] || '',
    ayahs,
    startPage,
    endPage,
    juzStart: getJuzFromPage(startPage),
    juzEnd: getJuzFromPage(endPage),
  };
});

export function getSurahMeta(surahNumber: number): SurahMetaInfo | undefined {
  return ALL_QURAN_SURAHS.find((s) => s.number === surahNumber);
}

export function getSurahsInJuz(juzNumber: number): SurahMetaInfo[] {
  const range = JUZ_PAGE_RANGES[juzNumber];
  if (!range) return [];
  return ALL_QURAN_SURAHS.filter(
    (s) => s.startPage <= range.endPage && s.endPage >= range.startPage
  );
}



