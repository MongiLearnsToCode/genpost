
import React, { useState, useEffect } from 'react';
import { ManagedPost, PostStatus, PlatformID, ScheduledPostDisplayItem } from '../types';
import { PLATFORMS, PencilSquareIcon, TrashIconConst, CalendarDaysIconConst, PhotoIconConst, ClockIcon, CheckCircleIcon } from '../constants';

interface VisualCalendarProps {
  posts: ManagedPost[];
  onEditPost: (post: ManagedPost) => void;
  onDeletePost: (postId: string) => void;
  onUpdatePostDate: (postId: string, newDate: string) => void; // For D&D changes
}

const VisualCalendar: React.FC<VisualCalendarProps> = ({ posts, onEditPost, onDeletePost, onUpdatePostDate }) => {
  const [displayPosts, setDisplayPosts] = useState<ScheduledPostDisplayItem[]>([]);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  useEffect(() => {
    // Transform ManagedPost[] to ScheduledPostDisplayItem[] for calendar display
    const newDisplayPosts: ScheduledPostDisplayItem[] = posts
      .filter(post => post.status === PostStatus.Scheduled && post.scheduledDate)
      .flatMap(post => 
        post.platforms.map(pid => {
          // Ensure content for the platform exists before trying to access it
          const platformContent = post.content?.[pid];
          return {
            id: `${post.id}-${pid}`, // Unique ID for calendar item
            originalPostId: post.id,
            date: post.scheduledDate!,
            time: post.scheduledTime || undefined,
            platformId: pid, // Added missing property
            primaryPlatformId: pid, 
            captionSnippet: platformContent?.caption.substring(0, 25) + '...' || 'No caption',
            imageCount: platformContent?.selectedImageIds.length || 0,
            status: post.status,
            originalPost: post,
          };
        })
      // Filter out again in case a post became unscheduled (null date) but still has status Scheduled
      ).filter(dp => dp.date); 
    setDisplayPosts(newDisplayPosts);
  }, [posts]);


  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); 

  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(new Date(currentYear, currentMonth, i));
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getPlatformIcon = (platformId: PlatformID) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    return platform ? React.cloneElement(platform.icon as React.ReactElement<{ className?: string }>, { className: 'h-3 w-3 text-white' }) : null;
  };
   const getPlatformColor = (platformId: PlatformID) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    return platform ? platform.color : 'bg-gray-500';
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, displayPostId: string) => {
    const displayItem = displayPosts.find(dp => dp.id === displayPostId);
    if(displayItem) {
        setDraggedItemId(displayItem.originalPost.id); // Drag the original ManagedPost ID
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', displayItem.originalPost.id);
    }
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverDate(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetDate: string | null) => {
    e.preventDefault();
    if (targetDate && draggedItemId) {
      e.dataTransfer.dropEffect = 'move';
      setDragOverDate(targetDate);
    } else {
      e.dataTransfer.dropEffect = 'none';
      setDragOverDate(null);
    }
  };
  
  const handleDragLeave = () => { setDragOverDate(null); };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetDate: string | null) => {
    e.preventDefault();
    if (!targetDate || !draggedItemId) {
      setDragOverDate(null);
      return;
    }
    onUpdatePostDate(draggedItemId, targetDate); // Call central handler
    setDraggedItemId(null);
    setDragOverDate(null);
  };


  return (
    <div className="p-6 bg-[var(--color-crisp-white)] shadow-lg rounded-[10px] border border-[var(--color-charcoal-gray)]/20">
      <div className="flex items-center mb-4 pb-2 border-b border-[var(--color-charcoal-gray)]/10">
        <CalendarDaysIconConst className="h-6 w-6 mr-2 text-[var(--color-deep-forest)]" />
        <h2 className="text-xl font-['Montserrat'] font-semibold text-[var(--color-deep-forest)]">Visual Calendar</h2>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-['Montserrat'] font-medium text-[var(--color-charcoal-gray)] mb-2">
        {dayNames.map(day => <div key={day}>{day}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dateObj, index) => {
          const dayKey = dateObj ? dateObj.toISOString().split('T')[0] : `empty-${index}`;
          const postsForDay = dateObj ? displayPosts.filter(p => p.date === dayKey) : [];
          const isDropTarget = dragOverDate === dayKey && dateObj !== null;
          
          return (
            <div 
              key={dayKey} 
              className={`h-32 md:h-36 border border-[var(--color-charcoal-gray)]/10 rounded-md p-1.5 text-xs overflow-y-auto custom-scrollbar 
                          ${dateObj ? 'bg-gray-50/50' : 'bg-gray-100/30'}
                          ${isDropTarget ? 'bg-[var(--color-warm-blush)]/40 ring-2 ring-[var(--color-warm-blush)]' : ''}
                          transition-colors duration-150`}
              onDragOver={(e) => handleDragOver(e, dateObj ? dayKey : null)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, dateObj ? dayKey : null)}
            >
              {dateObj && <span className="font-['Lora'] font-medium text-[var(--color-deep-forest)]/80">{dateObj.getDate()}</span>}
              <div className="mt-1 space-y-1">
                {postsForDay.map(displayPost => (
                  <div 
                    key={displayPost.id} // Use displayPost.id for key
                    draggable={displayPost.originalPost.status !== PostStatus.Published} // Don't drag published
                    onDragStart={(e) => handleDragStart(e, displayPost.id)}
                    onDragEnd={handleDragEnd}
                    className={`p-1 rounded-md text-[10px] shadow-sm ${getPlatformColor(displayPost.primaryPlatformId)} bg-opacity-80 text-white font-['Lora'] leading-tight 
                                ${displayPost.originalPost.status !== PostStatus.Published ? 'cursor-grab' : 'cursor-default'}
                                ${displayPost.originalPost.id === draggedItemId ? 'opacity-50 ring-2 ring-offset-1 ring-[var(--color-burnt-sienna)]' : 'hover:shadow-md'}`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                       <span className={`p-0.5 rounded-full ${getPlatformColor(displayPost.primaryPlatformId)}`}>
                        {getPlatformIcon(displayPost.primaryPlatformId)}
                      </span>
                      {displayPost.time && <span className="text-[9px] opacity-90">{displayPost.time}</span>}
                    </div>
                    <p className="truncate mb-0.5" title={displayPost.captionSnippet}>{displayPost.captionSnippet}</p>
                    <div className="flex items-center justify-between text-[9px] opacity-90">
                      {displayPost.imageCount > 0 && 
                        <span className="flex items-center">
                          <PhotoIconConst className="h-2.5 w-2.5 mr-0.5"/> {displayPost.imageCount}
                        </span>
                      }
                       <div className="flex space-x-1">
                          <button onClick={() => onEditPost(displayPost.originalPost)} className="hover:opacity-70" title="Edit Post">
                            <PencilSquareIcon className="h-3 w-3" />
                          </button>
                          <button onClick={() => onDeletePost(displayPost.originalPost.id)} className="hover:opacity-70" title="Delete Post">
                            <TrashIconConst className="h-3 w-3" />
                          </button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
       <p className="mt-4 text-xs text-center text-[var(--color-charcoal-gray)]/70 font-['Lora'] italic">
        Drag scheduled posts to reschedule. Click icons to edit or delete.
      </p>
    </div>
  );
};

export default VisualCalendar;