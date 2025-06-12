
import React from 'react';
import { ManagedPost, PostStatus, PlatformID } from '../types';
import { PLATFORMS, ArchiveBoxIcon, PencilSquareIcon, TrashIconConst, ClockIcon, CheckCircleIcon } from '../constants';
import Button from './Button';

interface PostManagerProps {
  posts: ManagedPost[];
  onEditPost: (post: ManagedPost) => void;
  onDeletePost: (postId: string) => void;
}

const PostManager: React.FC<PostManagerProps> = ({ posts, onEditPost, onDeletePost }) => {
  const getPlatformIcon = (platformId: PlatformID, selected?: boolean) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    return platform ? React.cloneElement(platform.icon as React.ReactElement<{ className?: string }>, { 
        className: `h-4 w-4 ${selected ? 'text-white' : 'text-gray-500'}` 
    }) : null;
  };

  const getStatusIndicator = (status: PostStatus) => {
    switch (status) {
      case PostStatus.Draft:
        return <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 font-['Lora']">Draft</span>;
      case PostStatus.Scheduled:
        return <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-sky-100 text-sky-800 font-['Lora'] items-center"><ClockIcon className="h-3 w-3 mr-1"/>Scheduled</span>;
      case PostStatus.Published:
        return <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 font-['Lora'] items-center"><CheckCircleIcon className="h-3 w-3 mr-1"/>Published</span>;
      case PostStatus.Error:
        return <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 font-['Lora']">Error</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return dateString; // fallback if not a valid ISO string
    }
  };
   const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    return ` at ${timeString}`;
  };


  return (
    <div className="p-6 bg-[var(--color-crisp-white)] shadow-lg rounded-[10px] border border-[var(--color-charcoal-gray)]/20">
      <div className="flex items-center mb-4 pb-2 border-b border-[var(--color-charcoal-gray)]/10">
        <ArchiveBoxIcon className="h-6 w-6 mr-2 text-[var(--color-deep-forest)]" />
        <h2 className="text-xl font-['Montserrat'] font-semibold text-[var(--color-deep-forest)]">Post Manager</h2>
      </div>

      {posts.length === 0 && (
        <p className="text-center text-sm text-[var(--color-charcoal-gray)]/70 font-['Lora'] py-4">
          No posts found. Create a new post to get started!
        </p>
      )}

      <div className="space-y-3 max-h-[calc(50vh-100px)] lg:max-h-[calc(100vh-450px)] overflow-y-auto pr-1">
        {posts.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map(post => (
          <div key={post.id} className="p-3 bg-gray-50/70 rounded-lg border border-[var(--color-charcoal-gray)]/10 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-[var(--color-charcoal-gray)]/70 font-['Lora']">
                  Topic: {post.topic || <span className="italic">Untitled</span>}
                </p>
                <p className="text-sm font-['Lora'] text-[var(--color-charcoal-gray)] mt-1 truncate max-w-xs">
                  {/* Show snippet from first platform */}
                  {post.platforms.length > 0 && post.content[post.platforms[0]]?.caption 
                    ? post.content[post.platforms[0]].caption.substring(0, 60) + (post.content[post.platforms[0]].caption.length > 60 ? '...' : '')
                    : <span className="italic">No caption</span>}
                </p>
              </div>
              <div className="flex-shrink-0 ml-2">
                {getStatusIndicator(post.status)}
              </div>
            </div>
            <div className="mt-2 flex justify-between items-center text-xs">
              <div className="flex space-x-1">
                {post.platforms.map(platformId => {
                   const platform = PLATFORMS.find(p => p.id === platformId);
                   return platform ? (
                    <span key={platformId} title={platform.name} className={`p-1 rounded-full ${platform.color}`}>
                        {getPlatformIcon(platformId, true)}
                    </span>
                   ) : null;
                })}
              </div>
              <span className="text-[var(--color-charcoal-gray)]/70 font-['Lora']">
                {post.status === PostStatus.Scheduled && post.scheduledDate 
                  ? `Scheduled: ${formatDate(post.scheduledDate)}${formatTime(post.scheduledTime)}`
                  : `Updated: ${formatDate(post.updatedAt)}`}
              </span>
            </div>
            <div className="mt-3 flex justify-end space-x-2">
              <Button size="sm" variant="secondary" onClick={() => onEditPost(post)} className="flex items-center text-xs py-1">
                <PencilSquareIcon className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
              <Button size="sm" variant="danger" onClick={() => onDeletePost(post.id)} className="flex items-center text-xs py-1">
                <TrashIconConst className="h-3.5 w-3.5 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostManager;
