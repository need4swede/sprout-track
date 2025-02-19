import { Baby, SleepLog, FeedLog, DiaperLog, MoodLog, Note, Settings as PrismaSettings, Gender, SleepType, SleepQuality, FeedType, BreastSide, DiaperType, Mood } from '@prisma/client';

// Settings types
export type Settings = PrismaSettings;

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// Baby types
export type BabyResponse = Omit<Baby, 'birthDate' | 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  birthDate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  feedWarningTime: string;
  diaperWarningTime: string;
};

export interface BabyCreate {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender?: Gender;
  inactive?: boolean;
  feedWarningTime?: string;
  diaperWarningTime?: string;
}

export interface BabyUpdate extends Partial<BabyCreate> {
  id: string;
}

// Sleep log types
export type SleepLogResponse = Omit<SleepLog, 'startTime' | 'endTime' | 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  startTime: string;
  endTime: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

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
export type FeedLogResponse = Omit<FeedLog, 'time' | 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  time: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export interface FeedLogCreate {
  babyId: string;
  time: string;
  type: FeedType;
  amount?: number;
  side?: BreastSide;
  food?: string;
}

// Diaper log types
export type DiaperLogResponse = Omit<DiaperLog, 'time' | 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  time: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export interface DiaperLogCreate {
  babyId: string;
  time: string;
  type: DiaperType;
  condition?: string;
  color?: string;
}

// Mood log types
export type MoodLogResponse = Omit<MoodLog, 'time' | 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  time: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export interface MoodLogCreate {
  babyId: string;
  time: string;
  mood: Mood;
  intensity?: number;
  duration?: number;
}

// Note types
export type NoteResponse = Omit<Note, 'time' | 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  time: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export interface NoteCreate {
  babyId: string;
  time: string;
  content: string;
  category?: string;
}
