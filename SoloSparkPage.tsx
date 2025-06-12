
import React, { useState, useEffect, useCallback } from 'react';
import PostEditor from './components/PostEditor';
import VisualCalendar from './components/VisualCalendar';
import BasicAnalytics from './components/BasicAnalytics';
import PostManager from './components/PostManager';
import PostModal from './components/PostModal';
import { ManagedPost, BaseImage, PostStatus, PlatformID, PlatformSpecificPostContent } from './types';
import { PLATFORMS, PlusCircleIcon } from './constants';
import Button from './components/Button';

const SoloSparkPage: React.FC = () => {
  const [allPosts, setAllPosts] = useState<ManagedPost[]>([]);
  const [allBaseImages, setAllBaseImages] = useState<BaseImage[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [currentlyEditingPost, setCurrentlyEditingPost] = useState<ManagedPost | null>(null);
  const [isNewPostFlowInModal, setIsNewPostFlowInModal] = useState<boolean>(false);


  useEffect(() => {
    const mockInitialPosts: ManagedPost[] = [
      {
        id: crypto.randomUUID(), status: PostStatus.Scheduled, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        scheduledTime: "10:00", platforms: [PlatformID.Instagram, PlatformID.X],
        content: {
          [PlatformID.Instagram]: { caption: "Mock Insta Post! #Excited", selectedHashtags: new Set(["#Excited", "#Mock"]), selectedImageIds: [] },
          [PlatformID.X]: { caption: "Short mock for X.", selectedHashtags: new Set(["#Mock"]), selectedImageIds: [] },
        } as Partial<Record<PlatformID, PlatformSpecificPostContent>>, topic: "Initial Mock Post"
      },
      {
        id: crypto.randomUUID(), status: PostStatus.Draft, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), scheduledDate: null, scheduledTime: null, platforms: [PlatformID.LinkedIn],
        content: { [PlatformID.LinkedIn]: { caption: "Professional draft content for LinkedIn.", selectedHashtags: new Set(["#Professional", "#Draft"]), selectedImageIds: [] }} as Partial<Record<PlatformID, PlatformSpecificPostContent>>,
        topic: "Draft Topic"
      }
    ];
    setAllPosts(mockInitialPosts);
  }, []);

  const handleBaseImagesUpdate = (newImages: BaseImage[]) => {
    allBaseImages.forEach(oldImage => {
        if (!newImages.find(newImg => newImg.id === oldImage.id)) URL.revokeObjectURL(oldImage.previewUrl);
    });
    setAllBaseImages(newImages);
  };
  
  useEffect(() => {
    return () => { allBaseImages.forEach(image => URL.revokeObjectURL(image.previewUrl)); };
  }, [allBaseImages]);


  const handleOpenPostModal = (postToEdit?: ManagedPost | null, isNewFlow: boolean = false) => {
    setCurrentlyEditingPost(postToEdit || null);
    setIsNewPostFlowInModal(isNewFlow);
    setIsPostModalOpen(true);
  };

  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
    setCurrentlyEditingPost(null);
    setIsNewPostFlowInModal(false);
  };

  const handleSavePost = (postToSave: ManagedPost) => {
    setAllPosts(prevPosts => {
      const existingPostIndex = prevPosts.findIndex(p => p.id === postToSave.id);
      if (existingPostIndex > -1) {
        const updatedPosts = [...prevPosts];
        updatedPosts[existingPostIndex] = { ...postToSave, updatedAt: new Date().toISOString() };
        return updatedPosts;
      } else {
        return [...prevPosts, { ...postToSave, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
      }
    });
    handleClosePostModal();
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
        setAllPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
    }
  };


  return (
    <div className="w-full px-4">
      <header className="my-10 text-center">
        <h1 className="font-['Montserrat'] text-4xl md:text-5xl font-bold text-[var(--color-deep-forest)]">SoloSpark</h1>
        <p className="font-['Lora'] text-lg md:text-xl text-[var(--color-charcoal-gray)] mt-3">AI-Powered Social Media Assistant</p>
      </header>

      {/* Button to open PostModal directly for a brand new post (not pre-composed in PostEditor) */}
      {/* This might be removed if all new post creation MUST go through PostEditor first */}
      <div className="mb-8 flex justify-end">
        <Button onClick={() => handleOpenPostModal(null, false)} variant="primary" className="flex items-center"> 
            <PlusCircleIcon className="h-5 w-5 mr-2" /> Quick Add Post (Modal)
        </Button>
      </div>
      
      <div className="lg:flex lg:gap-x-8">
        <div className="lg:w-1/3 mb-8 lg:mb-0">
          <PostEditor 
            onInitiatePostCreation={(initialData) => {
                 const newPostShell: ManagedPost = {
                    id: crypto.randomUUID(), // Temp ID
                    status: PostStatus.Draft, // Initial status before modal
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    scheduledDate: null,
                    scheduledTime: null,
                    platforms: Array.from(initialData.selectedPlatforms),
                    content: initialData.platformSpecificContentData, // Rich content from PostEditor
                    topic: initialData.topic,
                 };
                 handleOpenPostModal(newPostShell, true); // True for new post flow
            }}
            currentBaseImages={allBaseImages}
            onBaseImagesUpdate={handleBaseImagesUpdate}
          />
        </div>

        <div className="lg:w-1/3 mb-8 lg:mb-0 space-y-8">
          <PostManager 
            posts={allPosts}
            onEditPost={(post) => handleOpenPostModal(post, false)} // False for editing existing
            onDeletePost={handleDeletePost}
          />
        </div>

        <div className="lg:w-1/3 space-y-8">
           <VisualCalendar 
            posts={allPosts}
            onEditPost={(post) => handleOpenPostModal(post, false)} // False for editing existing
            onDeletePost={handleDeletePost}
            onUpdatePostDate={(postId, newDate) => {
                const postToUpdate = allPosts.find(p => p.id === postId);
                if (postToUpdate) {
                    handleSavePost({ ...postToUpdate, scheduledDate: newDate, status: PostStatus.Scheduled });
                }
            }}
          />
          <BasicAnalytics />
        </div>
      </div>

      {isPostModalOpen && (
        <PostModal
          isOpen={isPostModalOpen}
          onClose={handleClosePostModal}
          postToEdit={currentlyEditingPost} 
          isNewPostFlow={isNewPostFlowInModal}
          onSavePost={handleSavePost}
          allBaseImages={allBaseImages}
          onBaseImagesUpdate={handleBaseImagesUpdate}
          platformList={PLATFORMS}
        />
      )}

      <footer className="text-center mt-16 py-8 border-t border-[var(--color-charcoal-gray)]/20">
        <p className="text-sm text-[var(--color-charcoal-gray)]/80 font-['Lora']">
          &copy; ${new Date().getFullYear()} SoloSpark. Powered by Gemini API.
        </p>
      </footer>
    </div>
  );
};

export default SoloSparkPage;