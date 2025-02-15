import { Baby, SleepLog, FeedLog, DiaperLog, MoodLog, Note, Gender, SleepType, SleepQuality, FeedType, BreastSide, DiaperType, Mood } from '@prisma/client';

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// Baby types
export type BabyResponse = Baby;

export interface BabyCreate {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender?: Gender;
}

export interface BabyUpdate extends Partial<BabyCreate> {
  id: string;
}

// Sleep log types
export type SleepLogResponse = SleepLog;

export interface SleepLogCreate {
  babyId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  type: SleepType;
  location?: string;
  quality?: SleepQuality;
}

// Feed log types
export type FeedLogResponse = FeedLog;

export interface FeedLogCreate {
  babyId: string;
  time: string;
  type: FeedType;
  amount?: number;
  side?: BreastSide;
  food?: string;
}

// Diaper log types
export type DiaperLogResponse = DiaperLog;

export interface DiaperLogCreate {
  babyId: string;
  time: string;
  type: DiaperType;
  condition?: string;
  color?: string;
}

// Mood log types
export type MoodLogResponse = MoodLog;

export interface MoodLogCreate {
  babyId: string;
  time: string;
  mood: Mood;
  intensity?: number;
  duration?: number;
}

// Note types
export type NoteResponse = Note;

export interface NoteCreate {
  babyId: string;
  time: string;
  content: string;
  category?: string;
}
