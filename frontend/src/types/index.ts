export interface SurahSummary {
  number: number;
  nameArabic: string;
  nameLatin: string;
  numberOfAyahs: number;
  revelationType: string;
  translation: string;
}

export interface MutashabihaItem {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  textArabic: string;
  similarity: string;
  note: string;
}

export interface AyahDetail {
  ayahNumber: number;
  textArabic: string;
  textLatin: string;
  translation: string;
  audioUrl: string;
  mutashabihat?: MutashabihaItem[];
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
  contentBody?: string;
  quiz?: QuizDetail;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: 'user' | 'admin';
  dailyTargetAyahs: number;
  currentStreak?: number;
}

export interface QuizQuestionOption {
  id: string;
  optionText: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  audioSampleUrl?: string | null;
  orderIndex: number;
  options: QuizQuestionOption[];
}

export interface QuizDetail {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface QuizQuestionReview {
  questionId: string;
  questionText: string;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizSubmitResponse {
  attemptId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  passingScore: number;
  completedAt: string;
  review: QuizQuestionReview[];
}
