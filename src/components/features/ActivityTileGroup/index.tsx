import React from 'react';
import { ActivityTile } from '@/src/components/ui/activity-tile';
import { StatusBubble } from "@/src/components/ui/status-bubble";
import { SleepLogResponse, FeedLogResponse, DiaperLogResponse, NoteResponse } from '@/app/api/types';

interface ActivityTileGroupProps {
  selectedBaby: {
    id: string;
    feedWarningTime?: string | number;
    diaperWarningTime?: string | number;
  } | null;
  sleepingBabies: Set<string>;
  sleepStartTime: Record<string, Date>;
  lastSleepEndTime: Record<string, Date>;
  lastFeedTime: Record<string, Date>;
  lastDiaperTime: Record<string, Date>;
  updateUnlockTimer: () => void;
  onSleepClick: () => void;
  onFeedClick: () => void;
  onDiaperClick: () => void;
  onNoteClick: () => void;
}

/**
 * ActivityTileGroup component displays a group of activity tiles for tracking baby activities
 * 
 * This component is responsible for rendering the activity buttons in the log entry page
 * and displaying status bubbles with timing information.
 */
export function ActivityTileGroup({
  selectedBaby,
  sleepingBabies,
  sleepStartTime,
  lastSleepEndTime,
  lastFeedTime,
  lastDiaperTime,
  updateUnlockTimer,
  onSleepClick,
  onFeedClick,
  onDiaperClick,
  onNoteClick
}: ActivityTileGroupProps) {
  if (!selectedBaby?.id) return null;

  return (
    <div className="grid grid-cols-4 border-t-[1px] border-white">
      {/* Sleep Activity Button */}
      <div className="relative">
        <ActivityTile
          activity={{
            type: 'NAP', // Using a valid SleepType enum value
            id: 'sleep-button',
            babyId: selectedBaby.id,
            startTime: sleepStartTime[selectedBaby.id] ? sleepStartTime[selectedBaby.id].toISOString() : new Date().toISOString(),
            endTime: sleepingBabies.has(selectedBaby.id) ? null : new Date().toISOString(),
            duration: sleepingBabies.has(selectedBaby.id) ? null : 0,
            location: null,
            quality: null,
            caretakerId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null
          } as unknown as SleepLogResponse}
          title={selectedBaby?.id && sleepingBabies.has(selectedBaby.id) ? 'End Sleep' : 'Start Sleep'}
          variant="sleep"
          isButton={true}
          onClick={() => {
            updateUnlockTimer();
            onSleepClick();
          }}
        />
        {selectedBaby?.id && (
          sleepingBabies.has(selectedBaby.id) ? (
            <StatusBubble
              status="sleeping"
              className="overflow-visible z-40"
              durationInMinutes={Math.floor(
                (new Date().getTime() - sleepStartTime[selectedBaby.id]?.getTime() || 0) / 60000
              )}
            />
          ) : (
            !sleepStartTime[selectedBaby.id] && lastSleepEndTime[selectedBaby.id] && (
              <StatusBubble
                status="awake"
                className="overflow-visible z-40"
                durationInMinutes={Math.floor(
                  (new Date().getTime() - lastSleepEndTime[selectedBaby.id].getTime()) / 60000
                )}
              />
            )
          )
        )}
      </div>
      
      {/* Feed Activity Button */}
      <div className="relative">
        <ActivityTile
          activity={{
            type: 'BOTTLE',
            id: 'feed-button',
            babyId: selectedBaby.id,
            time: new Date().toISOString(),
            amount: null,
            side: null,
            food: null,
            unitAbbr: null,
            caretakerId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null
          } as unknown as FeedLogResponse}
          title="Feed"
          variant="feed"
          isButton={true}
          onClick={() => {
            updateUnlockTimer();
            onFeedClick();
          }}
        />
        {selectedBaby?.id && lastFeedTime[selectedBaby.id] && (
          <StatusBubble
            status="feed"
            className="overflow-visible z-40"
            durationInMinutes={Math.floor(
              (new Date().getTime() - lastFeedTime[selectedBaby.id].getTime()) / 60000
            )}
            warningTime={selectedBaby.feedWarningTime as string}
          />
        )}
      </div>
      
      {/* Diaper Activity Button */}
      <div className="relative">
        <ActivityTile
          activity={{
            type: 'WET',
            id: 'diaper-button',
            babyId: selectedBaby.id,
            time: new Date().toISOString(),
            condition: null,
            color: null,
            caretakerId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null
          } as unknown as DiaperLogResponse}
          title="Diaper"
          variant="diaper"
          isButton={true}
          onClick={() => {
            updateUnlockTimer();
            onDiaperClick();
          }}
        />
        {selectedBaby?.id && lastDiaperTime[selectedBaby.id] && (
          <StatusBubble
            status="diaper"
            className="overflow-visible z-40"
            durationInMinutes={Math.floor(
              (new Date().getTime() - lastDiaperTime[selectedBaby.id].getTime()) / 60000
            )}
            warningTime={selectedBaby.diaperWarningTime as string}
          />
        )}
      </div>
      
      {/* Note Activity Button */}
      <div className="relative">
        <ActivityTile
          activity={{
            id: 'note-button',
            babyId: selectedBaby.id,
            time: new Date().toISOString(),
            content: '',
            category: 'Note',
            caretakerId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null
          } as unknown as NoteResponse}
          title="Note"
          variant="note"
          isButton={true}
          onClick={() => {
            updateUnlockTimer();
            onNoteClick();
          }}
        />
      </div>
    </div>
  );
}
