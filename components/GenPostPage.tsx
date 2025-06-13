"use client";

import React, { useState, useEffect, useCallback } from 'react';
import PostEditor from '@/components/PostEditor';
import VisualCalendar from '@/components/VisualCalendar';
import BasicAnalytics from '@/components/BasicAnalytics';
import PostManager from '@/components/PostManager';
import PostModal from '@/components/PostModal';
import { ManagedPost, BaseImage, PostStatus, PlatformID, PlatformSpecificPostContent } from '@/types';
import { PLATFORMS } from '@/constants';
import Button from '@/components/Button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PlusCircle } from 'lucide-react';

const GenPostPage: React.FC = () => {
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
        <h1 className="font-['Montserrat'] text-4xl md:text-5xl font-bold text-primary">GenPost</h1>
        <p className="font-['Lora'] text-lg md:text-xl text-muted-foreground mt-3">AI-Powered Social Media Assistant</p>
      </header>

      {/* Button to open PostModal directly for a brand new post (not pre-composed in PostEditor) */}
      <div className="mb-8 flex justify-between items-center">
        <ThemeToggle />
        <Button onClick={() => handleOpenPostModal(null, false)} variant="primary" className="flex items-center"> 
            <PlusCircle className="h-5 w-5 mr-2" /> Quick Add Post
        </Button>
      </div>
      
      <div className="lg:flex lg:gap-x-8">
        <div className="lg:w-1/3 mb-8 lg:mb-0">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Create New Post</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>

        <div className="lg:w-1/3 mb-8 lg:mb-0 space-y-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Post Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <PostManager 
                posts={allPosts}
                onEditPost={(post) => handleOpenPostModal(post, false)} // False for editing existing
                onDeletePost={handleDeletePost}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:w-1/3 space-y-8">
          <Card className="shadow-sm mb-8">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <BasicAnalytics />
            </CardContent>
          </Card>
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

      <footer className="text-center mt-16 py-8 border-t border-border">
        <Separator className="mb-4" />
        <p className="text-sm text-muted-foreground font-['Lora']">
          &copy; {new Date().getFullYear()} GenPost. Powered by Gemini API.
        </p>
      </footer>
    </div>
  );
};

export default GenPostPage;
