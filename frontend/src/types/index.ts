export interface SurahSummary {
  number: number;
  nameArabic: string;
  nameLatin: string;
  numberOfAyahs: number;
  revelationType: string;
  translation: string;
}

export interface AyahDetail {
  ayahNumber: number;
  textArabic: string;
  textLatin: string;
  translation: string;
  audioUrl: string;
}

export interface SurahDetail extends SurahSummary {
  audioFull: string;
  ayahs: AyahDetail[];
}

export interface SrsDueItem {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  repetitionCount: number;
  intervalDays: number;
  lastScore: number;
  qualityRating: number;
  nextReviewAt: string;
}

export interface TajwidModule {
  id: string;
  title: string;
  slug: string;
  summary: string;
  youtubeVideoId: string;
  orderIndex: number;
}

