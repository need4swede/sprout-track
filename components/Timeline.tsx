import { SleepLog, FeedLog, DiaperLog, MoodLog, Note } from '@prisma/client';
import { Card } from '@/components/ui/card';
import {
  MoreVertical,
  Moon,
  Droplet,
  Baby,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ActivityType = SleepLog | FeedLog | DiaperLog | MoodLog | Note;

interface TimelineProps {
  activities: ActivityType[];
}

const getActivityIcon = (activity: ActivityType) => {
  if ('type' in activity) {
    if ('duration' in activity) {
      return <Moon className="h-4 w-4" />; // Sleep activity
    }
    if ('amount' in activity) {
      return <Droplet className="h-4 w-4" />; // Feed activity
    }
    if ('condition' in activity) {
      return <Baby className="h-4 w-4" />; // Diaper activity
    }
  }
  return null;
};

const getActivityDescription = (activity: ActivityType) => {
  if ('type' in activity) {
    if ('duration' in activity) {
      return `Slept for ${activity.duration || 'unknown'} minutes`;
    }
    if ('amount' in activity) {
      return `Fed ${activity.amount || 'unknown'}${activity.type === 'BREAST' ? ' minutes' : 'ml'}`;
    }
    if ('condition' in activity) {
      return `${activity.type.toLowerCase()} diaper change`;
    }
  }
  if ('content' in activity) {
    return activity.content;
  }
  if ('mood' in activity) {
    return `Mood: ${activity.mood.toLowerCase()}`;
  }
  return 'Activity logged';
};

const getActivityTime = (activity: ActivityType) => {
  if ('time' in activity) {
    return activity.time;
  }
  if ('startTime' in activity) {
    return activity.startTime;
  }
  return new Date();
};

export default function Timeline({ activities }: TimelineProps) {
  // Sort activities by time, most recent first
  const sortedActivities = [...activities].sort((a, b) => 
    getActivityTime(b).getTime() - getActivityTime(a).getTime()
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recent Activity</h2>
      <div className="space-y-2">
        {activities.length === 0 ? (
          <Card className="p-4 text-center text-gray-500">
            No activities logged yet
          </Card>
        ) : (
          sortedActivities.map((activity) => (
            <Card key={activity.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 rounded-full">
                    {getActivityIcon(activity)}
                  </div>
                  <div>
                    <p className="font-medium">{getActivityDescription(activity)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(getActivityTime(activity)).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
