import { Baby, SleepLog, FeedLog, DiaperLog, MoodLog, Note, Caretaker, Settings as PrismaSettings, Gender, SleepType, SleepQuality, FeedType, BreastSide, DiaperType, Mood, PumpLog } from '@prisma/client';

// Settings types
export interface Settings extends PrismaSettings {
  // No need to redefine properties that are already in PrismaSettings
}

// Activity settings types
export interface ActivitySettings {
  order: string[];
  visible: string[];
  caretakerId?: string | null; // Optional caretaker ID for per-caretaker settings
}

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
  unitAbbr?: string;
  side?: BreastSide;
  food?: string;
  startTime?: string;
  endTime?: string;
  feedDuration?: number; // Duration in seconds for feeding time
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

// Caretaker types
export type CaretakerResponse = Omit<Caretaker, 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export interface CaretakerCreate {
  loginId: string;
  name: string;
  type?: string;
  inactive?: boolean;
  securityPin: string;
}

export interface CaretakerUpdate extends Partial<CaretakerCreate> {
  id: string;
}

// Bath log types
export interface BathLog {
  id: string;
  time: Date;
  soapUsed: boolean;
  shampooUsed: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  babyId: string;
  caretakerId: string | null;
}

export type BathLogResponse = Omit<BathLog, 'time' | 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  time: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export interface BathLogCreate {
  babyId: string;
  time: string;
  soapUsed?: boolean;
  shampooUsed?: boolean;
  notes?: string;
}

// Pump log types
export type PumpLogResponse = Omit<PumpLog, 'startTime' | 'endTime' | 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  startTime: string;
  endTime: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export interface PumpLogCreate {
  babyId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  leftAmount?: number;
  rightAmount?: number;
  totalAmount?: number;
  unitAbbr?: string;
  notes?: string;
}
