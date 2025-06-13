"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME, PLATFORMS, PencilSquareIcon, PlusCircleIcon } from '@/constants';
import { v4 as uuidv4 } from 'uuid';
import ErrorAlert from './ErrorAlert';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import GeneratedCaptionCard from './GeneratedCaptionCard';
import PlatformPicker from './PlatformPicker';
import { Platform, PlatformID, BaseImage, PlatformSpecificPostContent } from '@/types';
import SparklesIcon from '@/components/icons/SparklesIcon';
import CheckIconMini from '@/components/icons/CheckIconMini';
import TrashIcon from '@/components/icons/TrashIcon';

interface PostEditorProps {
  onInitiatePostCreation: (initialData: any) => void;
  currentBaseImages: BaseImage[];
  onBaseImagesUpdate: (newImages: BaseImage[]) => void;
}

// MiniPlatformEditor - Internal component for PostEditor
interface MiniPlatformEditorProps {
  platform: Platform;
  currentContent: PlatformSpecificPostContent;
  allBaseImages: BaseImage[];
  allSuggestedHashtags: string[];
  onContentChange: (platformId: PlatformID, newContent: PlatformSpecificPostContent) => void;
  isApiKeyConfigured: boolean;
}

const MiniPlatformEditor: React.FC<MiniPlatformEditorProps> = ({
  platform,
  currentContent,
  allBaseImages,
  allSuggestedHashtags,
  onContentChange,
  isApiKeyConfigured,
}) => {
  const handleCaptionChange = (newCaption: string) => {
    onContentChange(platform.id, {
      ...currentContent,
      caption: newCaption
    });
  };

  const toggleHashtag = (tag: string) => {
    const updatedHashtags = new Set(currentContent.selectedHashtags);
    if (updatedHashtags.has(tag)) {
      updatedHashtags.delete(tag);
    } else {
      updatedHashtags.add(tag);
    }
    onContentChange(platform.id, {
      ...currentContent,
      selectedHashtags: updatedHashtags
    });
  };

  const toggleImageSelection = (imageId: string) => {
    const updatedImageIds = [...currentContent.selectedImageIds || []];
    const index = updatedImageIds.indexOf(imageId);
    
    if (index > -1) {
      updatedImageIds.splice(index, 1);
    } else {
      // Check if we've hit the platform's image limit
      if (platform.imageLimit && updatedImageIds.length >= platform.imageLimit) {
        // If platform doesn't support multiple images, replace the existing one
        if (!platform.supportsMultiImage) {
          updatedImageIds.splice(0, updatedImageIds.length, imageId);
        } else {
          // Otherwise just don't add it
          return;
        }
      } else {
        updatedImageIds.push(imageId);
      }
    }
    
    onContentChange(platform.id, {
      ...currentContent,
      selectedImageIds: updatedImageIds
    });
  };
  
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center mb-3">
        <div className={`w-6 h-6 mr-2 ${platform.color} rounded-full flex items-center justify-center text-white`}>
          <div className="w-4 h-4">
            {platform.icon}
          </div>
        </div>
        <h4 className="font-medium">{platform.name}</h4>
        <span className="ml-auto text-xs text-gray-500">
          {currentContent.caption ? currentContent.caption.length : 0}/{platform.characterLimit || 'unlimited'}
        </span>
      </div>
      
      <textarea 
        value={currentContent.caption || ''}
        onChange={(e) => handleCaptionChange(e.target.value)}
        placeholder={`Write your ${platform.name} caption here...`}
        className="w-full p-2 border rounded mb-3 text-sm"
        rows={4}
        maxLength={platform.characterLimit || undefined}
      />
      
      {allSuggestedHashtags && allSuggestedHashtags.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium mb-1">Hashtags:</p>
          <div className="flex flex-wrap gap-1">
            {allSuggestedHashtags.map((tag, i) => (
              <button
                key={i}
                onClick={() => toggleHashtag(tag)}
                className={`text-xs px-2 py-1 rounded-full ${currentContent.selectedHashtags?.has(tag) 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-700'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {allBaseImages.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-1">Images {platform.imageLimit ? `(max ${platform.imageLimit})` : ''}:</p>
          <div className="flex flex-wrap gap-2">
            {allBaseImages.map((img) => (
              <div 
                key={img.id} 
                onClick={() => toggleImageSelection(img.id)}
                className={`w-12 h-12 relative rounded overflow-hidden cursor-pointer ${currentContent.selectedImageIds?.includes(img.id) 
                  ? 'ring-2 ring-blue-500' 
                  : 'opacity-70'}`}
              >
                <img src={img.previewUrl} alt={img.name} className="w-full h-full object-cover" />
                {currentContent.selectedImageIds?.includes(img.id) && (
                  <div className="absolute top-0 right-0 bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center">
                    <CheckIconMini className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PostEditor = ({ onInitiatePostCreation, currentBaseImages, onBaseImagesUpdate }: PostEditorProps) => {
  // State and hooks
  const [topic, setTopic] = useState("");
  const [baseCaption, setBaseCaption] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedFeedback, setCopiedFeedback] = useState<string | null>(null);
  
  // Add your state variables here
  const [baseGeneratedContent, setBaseGeneratedContent] = useState<any>(null);
  const [baseSelectedGeneratedHashtags, setBaseSelectedGeneratedHashtags] = useState<Set<string>>(new Set());
  const [selectedPlatformsForNewPost, setSelectedPlatformsForNewPost] = useState<Set<PlatformID>>(new Set());
  const [currentPlatformEdits, setCurrentPlatformEdits] = useState<Record<PlatformID, PlatformSpecificPostContent>>({} as Record<PlatformID, PlatformSpecificPostContent>);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isApiKeyLikelyConfigured = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY && process.env.NEXT_PUBLIC_GEMINI_API_KEY.length > 0;

  // Handlers
  const handleGenerateSuggestions = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a topic first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Import the service function
      const { generateCaptionsFromService } = await import('@/services/geminiService');
      
      // Call the Gemini API
      const generatedCaptions = await generateCaptionsFromService(topic);
      
      // Store the results
      setBaseGeneratedContent({
        captions: generatedCaptions,
        hashtags: [] // You can extend this to include hashtags if the API returns them
      });
      
    } catch (err: any) {
      console.error('Error generating suggestions:', err);
      setError(`Failed to generate suggestions: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [topic]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newImages: BaseImage[] = Array.from(e.target.files).map(file => ({
      id: uuidv4(),
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name
    }));
    
    onBaseImagesUpdate([...currentBaseImages, ...newImages]);
  }, [currentBaseImages, onBaseImagesUpdate]);

  const handleRemoveBaseImage = useCallback((imageId: string) => {
    const filteredImages = currentBaseImages.filter(img => img.id !== imageId);
    onBaseImagesUpdate(filteredImages);
  }, [currentBaseImages, onBaseImagesUpdate]);

  const handleUseBaseSuggestion = useCallback((suggestion: string) => {
    setBaseCaption(suggestion);
    setCopiedFeedback('Caption selected! You can now edit it or continue.');
    setTimeout(() => setCopiedFeedback(null), 3000);
  }, []);

  const toggleBaseHashtagSelection = useCallback((tag: string) => {
    setBaseSelectedGeneratedHashtags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  }, []);

  const handleTogglePlatformForNewPost = useCallback((platformId: PlatformID) => {
    setSelectedPlatformsForNewPost(prev => {
      const newSet = new Set(prev);
      if (newSet.has(platformId)) {
        newSet.delete(platformId);
        // Also remove platform-specific content if we're removing the platform
        setCurrentPlatformEdits(prev => {
          const newEdits = {...prev};
          delete newEdits[platformId];
          return newEdits;
        });
      } else {
        newSet.add(platformId);
        // Initialize platform-specific content when adding a new platform
        const platform = PLATFORMS.find(p => p.id === platformId);
        if (platform) {
          setCurrentPlatformEdits(prev => ({
            ...prev,
            [platformId]: {
              caption: baseCaption,
              selectedHashtags: new Set(baseSelectedGeneratedHashtags),
              selectedImageIds: getDefaultImageSelectionForPlatform(platform, currentBaseImages)
            }
          }));
        }
      }
      return newSet;
    });
  }, [baseCaption, baseSelectedGeneratedHashtags, currentBaseImages]);

  const handlePlatformSpecificContentChange = useCallback((platformId: PlatformID, newContent: PlatformSpecificPostContent) => {
    setCurrentPlatformEdits(prev => ({
      ...prev,
      [platformId]: newContent
    }));
  }, []);

  const handleFinalizeAndOpenModal = useCallback(() => {
    // Create the post initial data with current content
    const initialData = {
      topic,
      baseCaption,
      baseImages: currentBaseImages,
      selectedPlatforms: Array.from(selectedPlatformsForNewPost),
      platformSpecificContent: currentPlatformEdits,
      selectedHashtags: Array.from(baseSelectedGeneratedHashtags)
    };
    
    // Call the prop function to initiate post creation
    onInitiatePostCreation(initialData);
  }, [topic, baseCaption, currentBaseImages, selectedPlatformsForNewPost, currentPlatformEdits, baseSelectedGeneratedHashtags, onInitiatePostCreation]);

  const getDefaultImageSelectionForPlatform = (platform: Platform, images: BaseImage[]): string[] => {
    // If platform doesn't support images or we have no images, return empty array
    if (!platform.imageLimit || platform.imageLimit <= 0 || images.length === 0) return [];
    
    // Otherwise return up to the platform's image limit
    return images.slice(0, platform.imageLimit).map(img => img.id);
  };

  return (
    <div className="p-6 md:p-8 bg-[var(--color-crisp-white)] shadow-lg rounded-[10px] border border-[var(--color-charcoal-gray)]/20 space-y-6">
      <div className="flex items-center pb-2 border-b border-[var(--color-charcoal-gray)]/10">
        <PencilSquareIcon className="h-6 w-6 mr-2 text-[var(--color-deep-forest)]" />
        <h2 className="text-xl font-['Montserrat'] font-semibold text-[var(--color-deep-forest)]">Content Composer</h2>
      </div>
      
      {!isApiKeyLikelyConfigured && (
        <ErrorAlert message="API Key may not be configured. Please ensure process.env.API_KEY is set and valid for AI features to work." />
      )}
      
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-[var(--color-charcoal-gray)] mb-1.5 font-['Lora']">
          Post Topic / Brief
        </label>
        <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Launching a new eco-friendly product..."
          className="w-full p-3 font-['Lora'] text-[var(--color-charcoal-gray)] bg-[var(--color-crisp-white)] border border-[var(--color-charcoal-gray)]/40 rounded-[10px] shadow-sm"/>
      </div>

      <Button onClick={handleGenerateSuggestions} disabled={isLoading || !topic.trim() || !isApiKeyLikelyConfigured}
            className="w-full flex items-center justify-center" variant="primary">
            {isLoading ? <><LoadingSpinner size="h-5 w-5" /> <span className="ml-2">Generating Base Ideas...</span></>
                       : <><SparklesIcon className="h-5 w-5 mr-2 text-[var(--color-burnt-sienna)]" /> Generate Base AI Boosts</>}
      </Button>

      {error && <ErrorAlert message={error} />}
      {copiedFeedback && <div className="mt-2 p-2 text-sm text-center text-[var(--color-deep-forest)] bg-[var(--color-deep-forest)]/10 rounded-md">{copiedFeedback}</div>}

      {/* Display generated captions */}
      {baseGeneratedContent && baseGeneratedContent.captions && baseGeneratedContent.captions.length > 0 && (
        <div className="mt-4 space-y-3 border-t border-[var(--color-charcoal-gray)]/10 pt-4">
          <h3 className="text-lg font-medium text-[var(--color-deep-forest)] font-['Montserrat']">Generated Caption Suggestions</h3>
          <div className="space-y-2">
            {baseGeneratedContent.captions.map((caption: string, index: number) => (
              <div key={index} className="p-3 bg-blue-50 border border-blue-100 rounded-lg relative">
                <p className="text-sm text-[var(--color-charcoal-gray)] font-['Lora']">{caption}</p>
                <button
                  onClick={() => handleUseBaseSuggestion(caption)}
                  className="mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md flex items-center"
                >
                  <CheckIconMini className="w-4 h-4 mr-1" /> Use this caption
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 space-y-3">
        <div>
          <label htmlFor="baseCaption" className="block text-sm font-medium text-[var(--color-charcoal-gray)] mb-1.5 font-['Lora']">
            Base Caption
          </label>
          <textarea id="baseCaption" value={baseCaption} onChange={(e) => setBaseCaption(e.target.value)} rows={3} 
            placeholder="Craft main caption. This seeds platform editors."
            className="w-full p-3 font-['Lora'] border rounded-[10px] shadow-sm"/>
        </div>
        <PlatformPicker platforms={PLATFORMS} selectedPlatforms={selectedPlatformsForNewPost} onTogglePlatform={handleTogglePlatformForNewPost} />
      </div>

      {/* Inline Platform-Specific Editors */}
      {selectedPlatformsForNewPost.size > 0 && (
        <div className="space-y-6 pt-6 border-t border-[var(--color-charcoal-gray)]/10">
          <h3 className="text-lg font-['Montserrat'] font-semibold text-[var(--color-deep-forest)]">Platform-Specific Live Previews & Editors</h3>
          <p className="text-sm font-['Lora'] text-[var(--color-charcoal-gray)]/80 -mt-4">
            Edit specific captions, hashtags, and images for each platform in the previews below.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from(selectedPlatformsForNewPost).map(platformId => {
              const platform = PLATFORMS.find(p => p.id === platformId);
              if (!platform) return null;
              const platformContentForEditor = currentPlatformEdits[platformId] || {
                  caption: baseCaption,
                  selectedHashtags: new Set(baseSelectedGeneratedHashtags),
                  selectedImageIds: getDefaultImageSelectionForPlatform(platform, currentBaseImages)
              };

              return (
                <MiniPlatformEditor
                  key={platform.id}
                  platform={platform}
                  currentContent={platformContentForEditor}
                  allBaseImages={currentBaseImages}
                  allSuggestedHashtags={baseGeneratedContent?.hashtags || []}
                  onContentChange={handlePlatformSpecificContentChange}
                  isApiKeyConfigured={isApiKeyLikelyConfigured}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <Button onClick={handleFinalizeAndOpenModal} disabled={selectedPlatformsForNewPost.size === 0 || !isApiKeyLikelyConfigured}
          variant="primary" className="flex items-center">
          <PlusCircleIcon className="h-5 w-5 mr-2" /> Compose & Finalize Post
        </Button>
      </div>
    </div>
  );
};

export default PostEditor;
