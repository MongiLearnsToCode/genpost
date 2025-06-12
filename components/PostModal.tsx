
import React, { useState, useEffect, useCallback } from 'react';
import { ManagedPost, PostStatus, PlatformID, BaseImage, PlatformSpecificPostContent, Platform } from '../types';
import { PLATFORMS, GEMINI_MODEL_NAME } from '../constants';
import Button from './Button';
import PlatformPicker from './PlatformPicker';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import PlatformPreviewCard from './PlatformPreviewCard'; // Used for editing existing posts
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";


interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postToEdit: ManagedPost | null; // Null or a shell for new post, full object for existing
  isNewPostFlow: boolean; // True if this modal is for a new post composed in PostEditor
  onSavePost: (post: ManagedPost) => void;
  allBaseImages: BaseImage[];
  onBaseImagesUpdate: (newImages: BaseImage[]) => void;
  platformList: Platform[];
}

const getDefaultImageSelectionForPlatform = (platform: Platform, images: BaseImage[]): string[] => {
    if (!images.length) return [];
    const limit = platform.imageLimit ?? images.length;
    const imagesToConsider = images.slice(0, limit);
    if (platform.supportsMultiImage === false && imagesToConsider.length > 0) return [imagesToConsider[0].id];
    return imagesToConsider.map(img => img.id);
};

const PostModal: React.FC<PostModalProps> = ({
  isOpen,
  onClose,
  postToEdit,
  isNewPostFlow,
  onSavePost,
  allBaseImages,
  onBaseImagesUpdate,
  platformList
}) => {
  const [currentPost, setCurrentPost] = useState<ManagedPost>(
    postToEdit || {
      id: crypto.randomUUID(), status: PostStatus.Draft, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      scheduledDate: null, scheduledTime: null, platforms: [], content: {}, topic: '',
    }
  );
  const [localSelectedPlatforms, setLocalSelectedPlatforms] = useState<Set<PlatformID>>(new Set(postToEdit?.platforms || []));
  const [topicInput, setTopicInput] = useState<string>(postToEdit?.topic || '');
  const [scheduledDateInput, setScheduledDateInput] = useState<string>(postToEdit?.scheduledDate?.split('T')[0] || '');
  const [scheduledTimeInput, setScheduledTimeInput] = useState<string>(postToEdit?.scheduledTime || '');
  
  // For editing existing posts, these will be managed by PlatformPreviewCard
  // For new posts, these are less relevant as content is pre-composed.
  const [isLoadingAiEdit, setIsLoadingAiEdit] = useState<Partial<Record<PlatformID, boolean>>>({});
  const [aiEditError, setAiEditError] = useState<Partial<Record<PlatformID, string | null>>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) { // Only update state if modal is open to prevent background updates
        if (postToEdit) {
            setCurrentPost(postToEdit);
            setLocalSelectedPlatforms(new Set(postToEdit.platforms));
            setTopicInput(postToEdit.topic || '');
            setScheduledDateInput(postToEdit.scheduledDate?.split('T')[0] || '');
            setScheduledTimeInput(postToEdit.scheduledTime || '');
        } else { // This case is for "Create New Post" directly from SoloSparkPage, not the PostEditor flow
            const newId = crypto.randomUUID();
            setCurrentPost({
                id: newId, status: PostStatus.Draft, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
                scheduledDate: null, scheduledTime: null, platforms: [], content: {}, topic: '',
            });
            setLocalSelectedPlatforms(new Set());
            setTopicInput('');
            setScheduledDateInput('');
            setScheduledTimeInput('');
        }
        setIsLoadingAiEdit({});
        setAiEditError({});
    }
  }, [postToEdit, isOpen]);

  const handlePlatformToggle = (platformId: PlatformID) => {
    if (isNewPostFlow) return; // Platforms are set in PostEditor for new flow

    setLocalSelectedPlatforms(prev => {
      const next = new Set(prev);
      const platformInfo = platformList.find(p => p.id === platformId);
      if (next.has(platformId)) {
        next.delete(platformId);
        setCurrentPost(cp => {
            const newContent = {...cp.content};
            delete newContent[platformId];
            return {...cp, content: newContent, platforms: Array.from(next)};
        });
      } else {
        next.add(platformId);
        if (platformInfo && !currentPost.content[platformId]) {
          setCurrentPost(cp => ({
            ...cp,
            platforms: Array.from(next),
            content: {
              ...cp.content,
              [platformId]: {
                caption: cp.topic || cp.content?.instagram?.caption || '',
                selectedHashtags: new Set(cp.content?.instagram?.selectedHashtags || []),
                selectedImageIds: getDefaultImageSelectionForPlatform(platformInfo, allBaseImages),
              },
            },
          }));
        } else if (currentPost.content[platformId]) {
             setCurrentPost(cp => ({ ...cp, platforms: Array.from(next) }));
        }
      }
      return next;
    });
  };

  // This is used by PlatformPreviewCard when editing existing posts
  const handlePlatformContentChangeForExisting = (
    platformId: PlatformID, 
    newCaption: string, 
    newHashtags: Set<string>, 
    newSelectedImageIds: string[]
  ) => {
    if (isNewPostFlow) return; // Content is pre-set for new flow in modal

    setCurrentPost(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [platformId]: {
          caption: newCaption,
          selectedHashtags: newHashtags,
          selectedImageIds: newSelectedImageIds,
        },
      },
    }));
  };
  
  const handleImageUploadModal = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: BaseImage[] = Array.from(files)
        .filter(file => file.type.startsWith('image/'))
        .map(file => ({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file), name: file.name }));
      onBaseImagesUpdate([...allBaseImages, ...newImages]);
    }
     if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveBaseImageModal = (imageId: string) => {
    onBaseImagesUpdate(allBaseImages.filter(img => img.id !== imageId));
    // Also remove from any selectedImageIds in currentPost.content (if editing existing)
    if (!isNewPostFlow) {
        setCurrentPost(prev => {
            const newContent = {...prev.content};
            Object.keys(newContent).forEach(pidStr => {
                const pKey = pidStr as PlatformID;
                if (newContent[pKey]?.selectedImageIds.includes(imageId)) {
                    newContent[pKey]!.selectedImageIds = newContent[pKey]!.selectedImageIds.filter(id => id !== imageId);
                }
            });
            return {...prev, content: newContent};
        });
    }
  };

  const handleSave = (statusOverride?: PostStatus) => {
    const finalStatus = statusOverride || (scheduledDateInput ? PostStatus.Scheduled : PostStatus.Draft);
    // For new posts, currentPost.platforms and currentPost.content are already fully formed by PostEditor
    // For existing posts, they are managed by the modal's state
    const platformsToSave = isNewPostFlow ? currentPost.platforms : Array.from(localSelectedPlatforms);

    const postToSave: ManagedPost = {
      ...currentPost, // This includes the rich content for new posts
      topic: topicInput,
      platforms: platformsToSave,
      status: finalStatus,
      scheduledDate: scheduledDateInput || null,
      scheduledTime: (finalStatus === PostStatus.Scheduled && scheduledDateInput) ? (scheduledTimeInput || "09:00") : null, // Using "09:00" for 24hr format
      updatedAt: new Date().toISOString(),
    };
    onSavePost(postToSave);
  };
  
  const isApiKeyLikelyConfigured = typeof process.env.API_KEY === 'string' && process.env.API_KEY.trim() !== '';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--color-crisp-white)] p-6 md:p-8 rounded-[15px] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border">
        <h2 className="text-2xl font-['Montserrat'] font-semibold text-[var(--color-deep-forest)] mb-6 text-center">
          {isNewPostFlow ? 'Finalize & Schedule New Post' : 'Edit Post'}
        </h2>

        <div className="overflow-y-auto pr-2 space-y-6 flex-grow custom-scrollbar">
          <div>
            <label htmlFor="postModalTopic" className="block text-sm font-medium mb-1">Topic / Title (Optional)</label>
            <input type="text" id="postModalTopic" value={topicInput} onChange={e => setTopicInput(e.target.value)}
                   className="w-full p-2.5 font-['Lora'] text-sm border rounded-md shadow-sm" placeholder="Internal title or brief" 
                   readOnly={isNewPostFlow && !!postToEdit?.topic } // Topic is set in PostEditor for new flow
            />
          </div>

          {!isNewPostFlow && ( // Platform Picker only for editing existing, new posts platforms are set in PostEditor
            <PlatformPicker platforms={platformList} selectedPlatforms={localSelectedPlatforms} onTogglePlatform={handlePlatformToggle} />
          )}

          {/* Global Image Manager for Modal (can be used for existing post editing, or if a global pool is still relevant for new post finalization) */}
           <div className="space-y-3 pt-2 border-t mt-4">
                <h3 className="text-md font-['Montserrat'] font-semibold">Manage All Uploaded Images</h3>
                 <input type="file" id="imageUploadModalGlobal" multiple accept="image/*" onChange={handleImageUploadModal} ref={fileInputRef} className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-[var(--color-deep-forest)]/10 hover:file:bg-[var(--color-deep-forest)]/20"/>
                 {allBaseImages.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-40 overflow-y-auto">
                    {allBaseImages.map(image => (
                      <div key={image.id} className="relative group border rounded-md overflow-hidden">
                        <img src={image.previewUrl} alt={image.name} className="w-full h-20 object-cover" />
                         <button onClick={() => handleRemoveBaseImageModal(image.id)} className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100">Del</button>
                      </div>
                    ))}
                  </div>
                )}
            </div>

          {/* Per-Platform Editors/Previews */}
          {currentPost.platforms.map(platformId => {
            const platform = platformList.find(p => p.id === platformId);
            if (!platform) return null;
            const content = currentPost.content[platformId];
            if (!content) return null; // Should always have content if platform is selected

            if (isNewPostFlow) { // Read-only summary for new posts
              return (
                <div key={platformId} className="p-3 border rounded-lg bg-gray-50/50 space-y-1">
                  <h4 className="font-['Montserrat'] text-sm font-semibold flex items-center">
                    {React.cloneElement(platform.icon as React.ReactElement<{ className?: string }>, { className: `h-5 w-5 mr-2 ${platform.color} p-0.5 rounded-sm text-white`})}
                    {platform.name}
                  </h4>
                  <p className="text-xs font-['Lora'] truncate" title={content.caption}><strong>Caption:</strong> {content.caption.substring(0,100)}...</p>
                  <p className="text-xs font-['Lora']"><strong>Hashtags:</strong> {Array.from(content.selectedHashtags).slice(0,5).join(', ')}{content.selectedHashtags.size > 5 ? '...' : ''}</p>
                  <p className="text-xs font-['Lora']"><strong>Images:</strong> {content.selectedImageIds.length} selected</p>
                </div>
              );
            } else { // Full editor for existing posts using PlatformPreviewCard
              return (
                <PlatformPreviewCard
                  key={platform.id}
                  platform={platform}
                  initialCaption={content.caption}
                  initialHashtags={content.selectedHashtags}
                  initialSelectedImageIds={content.selectedImageIds}
                  allBaseImages={allBaseImages}
                  allSuggestedHashtags={[]} // Existing posts use their own hashtags, not base suggestions
                  onContentChange={handlePlatformContentChangeForExisting}
                  isApiKeyConfigured={isApiKeyLikelyConfigured}
                />
              );
            }
          })}
        </div>

        {/* Scheduling Options */}
        <div className="pt-4 border-t mt-4 space-y-3">
            <h4 className="font-['Montserrat'] text-md font-semibold">Scheduling</h4>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <label htmlFor="scheduledDateModal" className="block text-xs font-medium mb-1">Date</label>
                    <input type="date" id="scheduledDateModal" value={scheduledDateInput} onChange={e => setScheduledDateInput(e.target.value)} 
                           className="p-2 border rounded-md font-['Lora'] text-sm w-full"/>
                </div>
                <div className="flex-1">
                    <label htmlFor="scheduledTimeModal" className="block text-xs font-medium mb-1">Time</label>
                    <input type="time" id="scheduledTimeModal" value={scheduledTimeInput} onChange={e => setScheduledTimeInput(e.target.value)} 
                           className="p-2 border rounded-md font-['Lora'] text-sm w-full" disabled={!scheduledDateInput}/>
                </div>
            </div>
        </div>

        {/* Actions */}
        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <Button onClick={onClose} variant="secondary" className="w-full sm:w-auto">Cancel</Button>
          {!isNewPostFlow && // Save as Draft only makes sense if not already pre-composed
             <Button onClick={() => handleSave(PostStatus.Draft)} variant="secondary" className="w-full sm:w-auto">Save as Draft</Button>
          }
           <Button onClick={() => handleSave(isNewPostFlow && !scheduledDateInput ? PostStatus.Draft : undefined)} 
                  variant="primary" 
                  disabled={currentPost.platforms.length === 0} 
                  className="w-full sm:w-auto"
          >
            {isNewPostFlow 
                ? (scheduledDateInput ? 'Schedule New Post' : 'Save New Post as Draft')
                : (postToEdit?.status === PostStatus.Scheduled && scheduledDateInput ? 'Update Schedule' : (scheduledDateInput ? 'Schedule Post' : 'Save Changes'))
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostModal;