import { Button } from '@/src/components/ui/button';
import { Baby as BabyIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { ActivityType, TimelineActivityListProps } from './types';
import { getActivityIcon, getActivityStyle, getActivityDescription } from './utils';
import { motion, AnimatePresence } from 'framer-motion';

const TimelineActivityList = ({
  activities,
  prevDayActivities,
  nextDayActivities,
  settings,
  isLoading,
  itemsPerPage,
  currentPage,
  totalPages,
  onActivitySelect,
  onPageChange,
  onItemsPerPageChange,
  onSwipeLeft,
  onSwipeRight,
  dateChangeDirection,
  isAnimatingDateChange,
  transitionToDate,
}: TimelineActivityListProps) => {
  // Swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number | string>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDealAnimation, setShowDealAnimation] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Required minimum distance traveled to be considered a swipe
  const minSwipeDistance = 50;
  
  const onTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    setTouchEnd(null); // Reset touchEnd
    setTouchStart(e.targetTouches[0].clientX);
    // Add a subtle haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || isAnimating) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    
    // Calculate the offset for the animation
    const diff = currentTouch - touchStart;
    // Convert the pixel difference to a percentage of the screen width
    const screenWidth = window.innerWidth;
    const percentageDiff = (diff / screenWidth) * 100;
    // Apply a dampening effect but allow enough movement to see adjacent days
    const dampedDiff = `${Math.sign(percentageDiff) * Math.min(Math.abs(percentageDiff) * 0.8, 60)}%`;
    setSwipeOffset(dampedDiff);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isAnimating) return;
    
    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > minSwipeDistance;
    
    if (isSwipe) {
      setIsAnimating(true);
      setShowDealAnimation(false);
      // Animate to the full adjacent panel position
      const targetOffset = distance > 0 ? '-100%' : '100%';
      setSwipeOffset(targetOffset);
      
      // After the slide completes, show the deal animation
      setTimeout(() => {
        setSwipeOffset(0); // Reset position immediately before showing deal animation
        setShowDealAnimation(true);
      }, 500); // Wait for slide animation to complete
      
      // Delay the action to allow animation to be visible
      setTimeout(() => {
        if (distance > 0) {
          // Swiped left (next day)
          onSwipeLeft?.();
        } else {
          // Swiped right (previous day)
          onSwipeRight?.();
        }
        
        // Reset animation state after card animations complete
        setTimeout(() => {
          setIsAnimating(false);
          setShowDealAnimation(false);
          // Reset values
          setTouchStart(null);
          setTouchEnd(null);
        }, 1200); // Give enough time for card animations to complete
      }, 400);
    } else {
      // If not a valid swipe, animate back to center
      setSwipeOffset(0);
      // Reset values
      setTouchStart(null);
      setTouchEnd(null);
    }
  };
  
  // Handle chevron navigation animation
  useEffect(() => {
    if (isAnimatingDateChange && dateChangeDirection) {
      // Calculate target offset based on direction
      const targetOffset = dateChangeDirection > 0 ? '-100%' : '100%';
      setSwipeOffset(targetOffset);
      setIsAnimating(true);
      setShowDealAnimation(false);
      
      // After the slide completes, show the deal animation
      const slideTimeout = setTimeout(() => {
        setSwipeOffset(0); // Reset position immediately before showing deal animation
        setShowDealAnimation(true);
      }, 500); // Wait for slide animation to complete
      
      // Reset animation after it completes
      const resetTimeout = setTimeout(() => {
        setIsAnimating(false);
        setShowDealAnimation(false);
      }, 1500); // Give enough time for card animations to complete
      
      // Clean up timeouts if component unmounts or effect re-runs
      return () => {
        clearTimeout(slideTimeout);
        clearTimeout(resetTimeout);
      };
    }
  }, [isAnimatingDateChange, dateChangeDirection]);

  // Reset animation state when component unmounts or when activities change
  useEffect(() => {
    setSwipeOffset(0);
    setIsAnimating(false);
    setTouchStart(null);
    setTouchEnd(null);
  }, [activities]);
  return (
    <>
      {/* Scrollable Content */}
      <motion.div 
        className="flex-1 overflow-y-auto relative" 
        ref={contentRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        animate={{ 
          x: swipeOffset,
          opacity: isAnimating || isAnimatingDateChange ? 0.8 : 1
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.2
        }}
      >
        {/* Removed visual swipe indicators as requested */}
        <div className="relative overflow-hidden">
          {/* This is a container for all three day views, positioned side by side */}
          <motion.div 
            className="flex w-[300%] relative"
            style={{ 
              left: '-100%', // Position so that the middle third is visible by default
            }}
            animate={{ 
              // When showing deal animation, immediately reset to center position
              // without any horizontal movement
              x: showDealAnimation ? 0 : (swipeOffset || (dateChangeDirection ? (dateChangeDirection > 0 ? '-100%' : '100%') : 0))
            }}
            transition={{ 
              type: showDealAnimation ? "tween" : "spring", 
              stiffness: 200, 
              damping: 25,
              duration: showDealAnimation ? 0 : 0.5
            }}
          >
            {/* Previous Day - Left Panel */}
            <div className="w-1/3 flex-shrink-0">
              <div className="divide-y divide-gray-100 bg-white" style={{ opacity: showDealAnimation ? 0 : 1 }}>
                <AnimatePresence>
                  {prevDayActivities && prevDayActivities.map((activity, index) => {
                    const style = getActivityStyle(activity);
                    const description = getActivityDescription(activity, settings);
                    return (
                      <motion.div
                        key={`prev-${activity.id}`}
                        className="group hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer"
                        onClick={() => onActivitySelect(activity)}
                        initial={{ opacity: 0, y: -50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          delay: index * 0.05,
                          duration: 0.5,
                          type: "spring",
                          stiffness: 200,
                          damping: 25
                        }}
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
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {(!prevDayActivities || prevDayActivities.length === 0) && !isLoading && (
                  <div className="flex-1 flex items-center justify-center py-10">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No activities recorded</h3>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Current Day - Middle Panel */}
            <div className="w-1/3 flex-shrink-0">
              <div className="divide-y divide-gray-100 bg-white" style={{ opacity: showDealAnimation && isAnimatingDateChange ? 0 : 1 }}>
                <AnimatePresence>
                  {activities.map((activity, index) => {
                    const style = getActivityStyle(activity);
                    const description = getActivityDescription(activity, settings);
                    return (
                      <motion.div
                        key={activity.id}
                        className="group hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer"
                        onClick={() => onActivitySelect(activity)}
                        initial={{ opacity: 0, y: -50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          delay: index * 0.05,
                          duration: 0.5,
                          type: "spring",
                          stiffness: 200,
                          damping: 25
                        }}
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
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {activities.length === 0 && !isLoading && (
                  <div className="flex-1 flex items-center justify-center py-10">
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
              </div>
            </div>
            
            {/* Next Day - Right Panel */}
            <div className="w-1/3 flex-shrink-0">
              <div className="divide-y divide-gray-100 bg-white" style={{ opacity: showDealAnimation ? 0 : 1 }}>
                <AnimatePresence>
                  {nextDayActivities && nextDayActivities.map((activity, index) => {
                    const style = getActivityStyle(activity);
                    const description = getActivityDescription(activity, settings);
                    return (
                      <motion.div
                        key={`next-${activity.id}`}
                        className="group hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer"
                        onClick={() => onActivitySelect(activity)}
                        initial={{ opacity: 0, y: -50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          delay: index * 0.05,
                          duration: 0.5,
                          type: "spring",
                          stiffness: 200,
                          damping: 25
                        }}
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
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {(!nextDayActivities || nextDayActivities.length === 0) && !isLoading && (
                  <div className="flex-1 flex items-center justify-center py-10">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No activities recorded</h3>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
        


        {/* Loading State */}
        {isLoading && activities.length === 0 && prevDayActivities?.length === 0 && nextDayActivities?.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Loading activities...</h3>
            </div>
          </div>
        )}
      </motion.div>

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
