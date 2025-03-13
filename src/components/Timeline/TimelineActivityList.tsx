import { Button } from '@/src/components/ui/button';
import { Baby as BabyIcon } from 'lucide-react';
import { ActivityType, TimelineActivityListProps } from './types';
import { getActivityIcon, getActivityStyle, getActivityDescription } from './utils';

const TimelineActivityList = ({
  activities,
  settings,
  isLoading,
  itemsPerPage,
  currentPage,
  totalPages,
  onActivitySelect,
  onPageChange,
  onItemsPerPageChange,
}: TimelineActivityListProps) => {
  return (
    <>
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-100 bg-white">
          {activities.map((activity) => {
            const style = getActivityStyle(activity);
            const description = getActivityDescription(activity, settings);
            return (
              <div
                key={activity.id}
                className="group hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer"
                onClick={() => onActivitySelect(activity)}
              >
                <div className="flex items-center px-6 py-3">
                  <div className={`flex-shrink-0 ${style.bg} p-2 rounded-xl mr-4`}>
                    {getActivityIcon(activity)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10`}>
                        {description.type}
                      </span>
                      <span className="text-gray-900">{description.details}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Empty State */}
        {activities.length === 0 && !isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
                <BabyIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No activities recorded</h3>
              <p className="text-sm text-gray-500">
                Activities will appear here once you start tracking
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && activities.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Loading activities...</h3>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {activities.length > 0 && (
        <div className="flex justify-between items-center px-6 py-2 border-t border-gray-100">
          <select
            className="h-6 px-1 rounded-md border border-gray-200 text-xs"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                {'<'}
              </Button>
              <span className="px-4 py-2 text-xs">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                {'>'}
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TimelineActivityList;
