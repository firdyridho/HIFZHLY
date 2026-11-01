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
  thumbnailUrl?: string;
  pdfUrl?: string;
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
  twoFactorEnabled?: boolean;
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
  attemptId?: string;
  quizId?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  passingScore: number;
  completedAt?: string;
  review?: QuizQuestionReview[];
  reviews?: QuizQuestionReview[];
}

export interface WordDiffItem {
  index: number;
  word: string;
  status: 'correct' | 'substituted' | 'deleted' | 'inserted';
  userSaid?: string;
  mistakeType?: string;
}

export interface EvaluationResult {
  evaluationId: string;
  surahNumber: number;
  ayahNumber: number;
  score: number;
  transcribedText: string;
  referenceText: string;
  audioDurationMs: number;
  substitutions: number;
  deletions: number;
  insertions: number;
  wordDiff: WordDiffItem[];
  srsUpdate: {
    qualityRating: number;
    repetitionCount: number;
    intervalDays: number;
    easeFactor: number;
    nextReviewAt: string;
  };
}

export interface MutabaahWeeklyDay {
  date: string;
  ayahs: number;
  targetMet: boolean;
}

export interface MutabaahSummary {
  currentStreak: number;
  maxStreak: number;
  todayReviewedAyahs: number;
  dailyTarget: number;
  targetMetToday: boolean;
  totalAyahsMemorized: number;
  weeklyActivity: MutabaahWeeklyDay[];
}

export interface HeatmapAyahItem {
  ayahNumber: number;
  status: 'strong' | 'reviewing' | 'learning' | 'untested';
  lastScore: number;
  intervalDays: number;
}

export interface SurahHeatmap {
  surahNumber: number;
  surahName: string;
  totalAyahs: number;
  ayahs: HeatmapAyahItem[];
}
