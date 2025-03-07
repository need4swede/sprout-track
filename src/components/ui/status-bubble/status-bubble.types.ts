import { ReactElement } from 'react';
import { Icon as LucideIcon } from 'lucide-react';

export type StatusType = 'sleeping' | 'awake' | 'feed' | 'diaper';

export interface StatusBubbleProps {
  /** Current status of the baby */
  status: StatusType;
  /** Duration in minutes for the current status */
  durationInMinutes: number;
  /** Warning threshold time in "hh:mm" format */
  warningTime?: string;
  /** Additional CSS classes */
  className?: string;
}

export interface StatusStyle {
  bgColor: string;
  icon: ReactElement<typeof LucideIcon> | null;
}
