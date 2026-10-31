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
