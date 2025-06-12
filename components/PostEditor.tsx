
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME, PLATFORMS, PencilSquareIcon, PlusCircleIcon } from '../constants';
import { Platform, PlatformID, BaseImage, PlatformSpecificPostContent, ManagedPost } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import PlatformPicker from './PlatformPicker';
import GeneratedCaptionCard from './GeneratedCaptionCard';
import Button from './Button';
import Tooltip from './Tooltip';

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
  const [localCaption, setLocalCaption] = useState(currentContent.caption);
  const [localHashtags, setLocalHashtags] = useState(currentContent.selectedHashtags);
  const [localImageIds, setLocalImageIds] = useState(currentContent.selectedImageIds);
  const [isEditingHashtags, setIsEditingHashtags] = useState(false);
  const [isEditingImages, setIsEditingImages] = useState(false);
  const [isLoadingAiEdit, setIsLoadingAiEdit] = useState(false);
  const [aiEditError, setAiEditError] = useState<string | null>(null);
  const [imageSelectionError, setImageSelectionError] = useState<string | null>(null);

  useEffect(() => {
    setLocalCaption(currentContent.caption);
    setLocalHashtags(currentContent.selectedHashtags);
    setLocalImageIds(currentContent.selectedImageIds);
  }, [currentContent]);

  const triggerContentChange = (caption = localCaption, hashtags = localHashtags, imageIds = localImageIds) => {
    onContentChange(platform.id, { caption, selectedHashtags: hashtags, selectedImageIds: imageIds });
  };

  const handleLocalCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalCaption(e.target.value);
    triggerContentChange(e.target.value, localHashtags, localImageIds);
  };

  const handleToggleLocalHashtag = (tag: string) => {
    const newHashtags = new Set(localHashtags);
    if (newHashtags.has(tag)) newHashtags.delete(tag);
    else newHashtags.add(tag);
    setLocalHashtags(newHashtags);
    triggerContentChange(localCaption, newHashtags, localImageIds);
  };
  
  const handleToggleLocalImage = (imageId: string) => {
    setImageSelectionError(null);
    let newSelectedImageIds = [...localImageIds];
    const isSelected = newSelectedImageIds.includes(imageId);
    const imageLimit = platform.imageLimit ?? Infinity;

    if (isSelected) {
      newSelectedImageIds = newSelectedImageIds.filter(id => id !== imageId);
    } else {
      if (!platform.supportsMultiImage || imageLimit === 1) {
        newSelectedImageIds = [imageId];
      } else {
        if (newSelectedImageIds.length < imageLimit) {
          newSelectedImageIds.push(imageId);
        } else {
          setImageSelectionError(`Cannot select more than ${imageLimit} image(s) for ${platform.name}.`);
          setTimeout(() => setImageSelectionError(null), 3000);
          return;
        }
      }
    }
    setLocalImageIds(newSelectedImageIds);
    triggerContentChange(localCaption, localHashtags, newSelectedImageIds);
  };


  const handleAiEdit = useCallback(async (action: 'expand' | 'shorten') => {
    if (!localCaption.trim() || !isApiKeyConfigured) {
      setAiEditError(isApiKeyConfigured ? "Caption is empty." : "API Key not configured.");
      return;
    }
    setIsLoadingAiEdit(true); setAiEditError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const promptText = `You are an AI assistant helping to refine a social media post for ${platform.name}. 
The platform has a character limit of approximately ${platform.characterLimit || 'many'} characters.
The current caption is: "${localCaption}"
Please ${action} this caption. 
If shortening, try to stay well within the character limit. If expanding, add relevant details or flair.
Maintain the original tone and core message.
Return only the modified caption text, without any introductory phrases, labels, or markdown.`;
      const response = await ai.models.generateContent({ model: GEMINI_MODEL_NAME, contents: [{ role: "user", parts: [{ text: promptText }] }] });
      const newCaptionText = response.text.trim();
      setLocalCaption(newCaptionText);
      triggerContentChange(newCaptionText, localHashtags, localImageIds);
    } catch (e: any) {
      setAiEditError(`Failed to ${action} caption. ${e.message || ''}`);
    } finally {
      setIsLoadingAiEdit(false);
    }
  }, [localCaption, platform, isApiKeyConfigured, triggerContentChange, localHashtags, localImageIds]); 

  const hashtagsText = Array.from(localHashtags).join(' ');
  // selectedImageNamesPreview is not directly used in fullTextForPreview anymore, but good to keep for other potential uses
  const selectedImageNamesPreview = localImageIds.map(id => allBaseImages.find(img => img.id === id)?.name).filter(Boolean).join(', ');
  const fullTextForPreview = `${localCaption}${localHashtags.size > 0 ? `\n\n${hashtagsText}` : ''}`;
  const captionLength = localCaption.length;
  const limit = platform.characterLimit;

  return (
     <div className={`p-4 rounded-[10px] shadow-lg border border-[var(--color-charcoal-gray)]/20 bg-[var(--color-crisp-white)]/80 overflow-hidden flex flex-col space-y-3`}>
      <div className="flex items-center pb-2 border-b border-[var(--color-charcoal-gray)]/10">
        <span className={`h-6 w-6 mr-2 ${platform.color} rounded-sm p-0.5 flex items-center justify-center`}>
          {React.cloneElement(platform.icon as React.ReactElement<{ className?: string }>, { className: 'h-4 w-4 text-white' })}
        </span>
        <h4 className="font-['Montserrat'] text-md font-semibold text-[var(--color-deep-forest)]">{platform.name} Editor</h4>
      </div>
      <textarea value={localCaption} onChange={handleLocalCaptionChange} rows={4} placeholder={`Edit caption for ${platform.name}...`}
        className="w-full p-2.5 font-['Lora'] text-sm text-[var(--color-charcoal-gray)] bg-gray-50 border border-[var(--color-charcoal-gray)]/30 rounded-md shadow-sm" />

      {/* Hashtag Editor */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h5 className="text-xs font-['Montserrat'] font-medium text-[var(--color-charcoal-gray)]">Hashtags:</h5>
          <Button size="sm" variant="secondary" onClick={() => setIsEditingHashtags(!isEditingHashtags)} className="text-xs py-1 px-2">
            {isEditingHashtags ? 'Done' : 'Edit'}
          </Button>
        </div>
        {isEditingHashtags && (
          <div className="p-2 border rounded-md bg-gray-50 max-h-32 overflow-y-auto">
            {allSuggestedHashtags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {allSuggestedHashtags.map(tag => (
                  <button key={tag} onClick={() => handleToggleLocalHashtag(tag)}
                    className={`px-2 py-0.5 font-['Lora'] text-[11px] rounded-full ${localHashtags.has(tag) ? 'bg-[var(--color-deep-forest)] text-[var(--color-crisp-white)]' : 'bg-gray-200 hover:bg-gray-300'}`}>
                    {tag}
                  </button>
                ))}
              </div>
            ) : <p className="text-xs text-gray-500 italic">No base hashtags.</p>}
          </div>
        )}
        <div className="flex flex-wrap gap-1 text-xs text-[var(--color-deep-forest)]/80">
          {Array.from(localHashtags).map(tag => <span key={tag} className="bg-[var(--color-deep-forest)]/10 px-1.5 py-0.5 rounded-sm">{tag}</span>)}
          {localHashtags.size === 0 && !isEditingHashtags && <p className="text-xs text-gray-400 italic">No hashtags.</p>}
        </div>
      </div>
      
      {/* Image Editor */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
            <h5 className="text-xs font-['Montserrat'] font-medium">Images ({localImageIds.length}/{platform.imageLimit ?? '∞'}):</h5>
            <Button size="sm" variant="secondary" onClick={() => setIsEditingImages(!isEditingImages)} className="text-xs py-1 px-2">
                {isEditingImages ? 'Done' : 'Edit'}
            </Button>
        </div>
        {imageSelectionError && <p className="text-xs text-red-500">{imageSelectionError}</p>}
        {isEditingImages && (
            <div className={`p-2 border rounded-md bg-gray-50 max-h-48 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 ${allBaseImages.length === 0 ? 'flex items-center justify-center' : ''}`}>
                {allBaseImages.length > 0 ? allBaseImages.map(image => {
                    const isSelected = localImageIds.includes(image.id);
                    const limitReached = !isSelected && platform.imageLimit !== undefined && localImageIds.length >= platform.imageLimit && platform.supportsMultiImage;
                    const isDisabled = limitReached || (!platform.supportsMultiImage && localImageIds.length > 0 && !isSelected);
                    return (
                        <button key={image.id} onClick={() => handleToggleLocalImage(image.id)} disabled={isDisabled}
                            className={`relative group border-2 rounded-md overflow-hidden ${isSelected ? 'border-[var(--color-deep-forest)]' : 'border-transparent hover:border-gray-300'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <img src={image.previewUrl} alt={image.name} className="w-full h-20 object-cover" />
                            {isSelected && <div className="absolute inset-0 bg-[var(--color-deep-forest)]/30 flex items-center justify-center"><CheckIconMini className="h-6 w-6 text-white" /></div>}
                        </button>
                    );
                }) : <p className="text-xs text-gray-500 italic">No base images uploaded.</p>}
            </div>
        )}
        {!isEditingImages && localImageIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
                {localImageIds.map(id => {
                    const image = allBaseImages.find(img => img.id === id);
                    return image ? <div key={id} className="w-16 h-16 border rounded-md overflow-hidden"><img src={image.previewUrl} alt={image.name} className="w-full h-full object-cover" /></div> : null;
                })}
            </div>
        )}
        {!isEditingImages && localImageIds.length === 0 && <p className="text-xs text-gray-400 italic">No images selected.</p>}
      </div>

      {/* AI Quick Edits */}
      <div className="pt-2 border-t border-[var(--color-charcoal-gray)]/10 space-y-2">
        <h5 className="text-xs font-['Montserrat'] font-medium">AI Quick Edits:</h5>
        {isLoadingAiEdit && <div className="flex items-center text-xs"><LoadingSpinner size="h-4 w-4 mr-1.5" /> Processing...</div>}
        {aiEditError && <ErrorAlert message={aiEditError} />}
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => handleAiEdit('shorten')} disabled={!localCaption.trim() || isLoadingAiEdit || !isApiKeyConfigured} className="flex-1 text-xs">Shorten</Button>
          <Button size="sm" variant="secondary" onClick={() => handleAiEdit('expand')} disabled={!localCaption.trim() || isLoadingAiEdit || !isApiKeyConfigured} className="flex-1 text-xs">Expand</Button>
        </div>
      </div>

      {/* Preview */}
      <div className="pt-2 border-t border-[var(--color-charcoal-gray)]/10">
        <h5 className="text-xs font-['Montserrat'] font-medium mb-1">Preview:</h5>
        <div className="prose prose-sm max-w-none font-['Lora'] text-xs leading-relaxed bg-gray-50 p-2 rounded-md min-h-[60px] max-h-[120px] overflow-y-auto whitespace-pre-wrap break-words"
             style={{ '--tw-prose-body': 'var(--color-charcoal-gray)'} as React.CSSProperties}>
          {fullTextForPreview.trim() || <span className="text-gray-400 italic">Content will appear here...</span>}
        </div>
        {localImageIds.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {localImageIds.map(id => {
              const image = allBaseImages.find(img => img.id === id);
              return image ? (
                <div key={`preview-${id}`} className="w-12 h-12 border border-gray-200 rounded-md overflow-hidden shadow-sm">
                  <img src={image.previewUrl} alt={image.name} className="w-full h-full object-cover" title={image.name} />
                </div>
              ) : null;
            })}
          </div>
        )}
        {localImageIds.length === 0 && (
            <p className="text-[10px] text-gray-400 italic mt-1">No images selected for preview.</p>
        )}
        {limit && <div className={`mt-1.5 text-[11px] text-right ${(limit && captionLength > limit) ? 'text-red-600 font-bold' : ''}`}>Caption: {captionLength}/{limit}</div>}
      </div>
    </div>
  );
};

// --- Main PostEditor Component ---
interface GeneratedContent {
  captions: string[];
  hashtags: string[];
  trendingKeywords: string[];
}

interface PostEditorProps {
    onInitiatePostCreation: (initialData: {
        topic: string;
        selectedPlatforms: Set<PlatformID>;
        platformSpecificContentData: Partial<Record<PlatformID, PlatformSpecificPostContent>>; // Content now fully edited here
        baseCaption: string; // Still useful for reference or if no specific edits
        baseSelectedHashtags: Set<string>; // For reference or initial seeding
    }) => void;
    currentBaseImages: BaseImage[];
    onBaseImagesUpdate: (newImages: BaseImage[]) => void;
}

const PostEditor: React.FC<PostEditorProps> = ({ 
    onInitiatePostCreation,
    currentBaseImages,
    onBaseImagesUpdate
}) => {
  const [topic, setTopic] = useState<string>('');
  const [baseCaption, setBaseCaption] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [baseGeneratedContent, setBaseGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatformsForNewPost, setSelectedPlatformsForNewPost] = useState<Set<PlatformID>>(new Set());
  const [copiedTimeoutId, setCopiedTimeoutId] = useState<number | null>(null);
  const [copiedFeedback, setCopiedFeedback] = useState<string>('');
  const [baseSelectedGeneratedHashtags, setBaseSelectedGeneratedHashtags] = useState<Set<string>>(new Set());
  
  // State for platform-specific edits done inline in PostEditor
  const [currentPlatformEdits, setCurrentPlatformEdits] = useState<Partial<Record<PlatformID, PlatformSpecificPostContent>>>({});

  useEffect(() => {
    return () => { if (copiedTimeoutId) clearTimeout(copiedTimeoutId); };
  }, [copiedTimeoutId]);

  const showCopiedFeedback = (message: string) => {
    setCopiedFeedback(message);
    if (copiedTimeoutId) clearTimeout(copiedTimeoutId);
    const newTimeoutId = window.setTimeout(() => setCopiedFeedback(''), 2000);
    setCopiedTimeoutId(newTimeoutId);
  };

  const copyToClipboard = (text: string, type: string = 'Text') => {
    navigator.clipboard.writeText(text).then(() => showCopiedFeedback(`${type} copied!`))
      .catch(err => setError("Failed to copy."));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: BaseImage[] = Array.from(files)
        .filter(file => file.type.startsWith('image/'))
        .map(file => ({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file), name: file.name }));
      onBaseImagesUpdate([...currentBaseImages, ...newImages]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveBaseImage = (imageIdToRemove: string) => {
    const updatedImages = currentBaseImages.filter(img => img.id !== imageIdToRemove);
    onBaseImagesUpdate(updatedImages);
    // Also remove from any currentPlatformEdits
    setCurrentPlatformEdits(prevEdits => {
        const newEdits = { ...prevEdits };
        Object.keys(newEdits).forEach(platformIdStr => {
            const platformId = platformIdStr as PlatformID;
            if (newEdits[platformId]?.selectedImageIds.includes(imageIdToRemove)) {
                newEdits[platformId] = {
                    ...newEdits[platformId]!,
                    selectedImageIds: newEdits[platformId]!.selectedImageIds.filter(id => id !== imageIdToRemove)
                };
            }
        });
        return newEdits;
    });
  };

  const handleGenerateSuggestions = useCallback(async () => {
     if (!topic.trim()) { setError("Please enter a topic."); return; }
     if (typeof process.env.API_KEY !== 'string' || !process.env.API_KEY.trim()) {
        setError("API Key not configured."); return;
     }
    setIsLoading(true); setError(null); setBaseGeneratedContent(null); setBaseSelectedGeneratedHashtags(new Set());
    const platformNames = Array.from(selectedPlatformsForNewPost).map(pid => PLATFORMS.find(p => p.id === pid)?.name).filter(Boolean).join(', ');
    let genAIResponse: GenerateContentResponse | null = null;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `You are a social media assistant. For "${topic}"${platformNames ? ` (for ${platformNames})` : ''}, provide:
1. Three caption suggestions.
2. 5-10 relevant hashtags (start with '#').
3. 2-3 trending keywords.
Return JSON: {"captions": [], "hashtags": [], "trendingKeywords": []}.
IMPORTANT JSON RULES: 1. ONLY JSON. 2. Valid strings in arrays. 3. Arrays ONLY contain comma-separated strings. 4. NO extraneous text in/after arrays. 5. NO trailing commas.`;
      genAIResponse = await ai.models.generateContent({ model: GEMINI_MODEL_NAME, contents: [{ role: "user", parts: [{ text: prompt }] }], config: { responseMimeType: "application/json" }});
      let jsonStr = genAIResponse.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) jsonStr = match[2].trim();
      const parsedData = JSON.parse(jsonStr);
      if (parsedData && Array.isArray(parsedData.captions) && Array.isArray(parsedData.hashtags) && Array.isArray(parsedData.trendingKeywords)) {
        setBaseGeneratedContent(parsedData);
        if (parsedData.captions.length > 0 && !baseCaption) setBaseCaption(parsedData.captions[0]);
      
        const newEdits: Partial<Record<PlatformID, PlatformSpecificPostContent>> = {};
        selectedPlatformsForNewPost.forEach(pid => {
            const platformInfo = PLATFORMS.find(p => p.id === pid);
            if(platformInfo) {
                newEdits[pid] = {
                    caption: parsedData.captions.length > 0 ? parsedData.captions[0] : baseCaption, // Use first suggestion or existing baseCaption
                    selectedHashtags: new Set(baseSelectedGeneratedHashtags), 
                    selectedImageIds: getDefaultImageSelectionForPlatform(platformInfo, currentBaseImages)
                };
            }
        });
        setCurrentPlatformEdits(prev => ({...prev, ...newEdits})); // Merge with existing edits, favoring new ones for selected platforms

      } else { throw new Error("AI response format error."); }
    } catch (e: any) {
      console.error("Error generating suggestions:", e);
      let jsonAttemptForLogging = genAIResponse?.text || (e as any).rawResponseText || "No response text available.";
      if (e instanceof SyntaxError && e.message.toLowerCase().includes("json")) {
        console.error("Problematic JSON:", jsonAttemptForLogging.substring(0, 1000));
        setError(`Failed to parse AI response. JSON error: ${e.message}.`);
      } else {
        setError(e.message || "Failed to generate suggestions.");
      }
    } finally { setIsLoading(false); }
  }, [topic, selectedPlatformsForNewPost, baseCaption, currentBaseImages, baseSelectedGeneratedHashtags]); // Added baseSelectedGeneratedHashtags

  const handleUseBaseSuggestion = (suggestion: string) => {
    setBaseCaption(suggestion);
    setCurrentPlatformEdits(prevEdits => {
        const newEdits = { ...prevEdits };
        selectedPlatformsForNewPost.forEach(pid => {
            if (!newEdits[pid] || newEdits[pid]?.caption === "" || (baseGeneratedContent?.captions.includes(newEdits[pid]?.caption || ""))) {
                newEdits[pid] = {
                    ...(newEdits[pid] || { selectedHashtags: new Set(baseSelectedGeneratedHashtags), selectedImageIds: [] }),
                    caption: suggestion,
                };
            }
        });
        return newEdits;
    });
  };
  
  const toggleBaseHashtagSelection = (hashtag: string) => {
    setBaseSelectedGeneratedHashtags(prevBaseTags => {
      const nextBaseTags = new Set(prevBaseTags);
      if (nextBaseTags.has(hashtag)) nextBaseTags.delete(hashtag); else nextBaseTags.add(hashtag);
      
      // Propagate change to un-customized platform editors
      setCurrentPlatformEdits(prevPlatformEdits => {
        const newPlatformEdits = {...prevPlatformEdits};
        selectedPlatformsForNewPost.forEach(pid => {
          // Heuristic: If platform hashtags were same as old base, update them.
          // This could be more sophisticated with "isDirty" flags per content piece.
          if(newPlatformEdits[pid] && setsAreEqual(newPlatformEdits[pid]!.selectedHashtags, prevBaseTags)) {
             newPlatformEdits[pid]!.selectedHashtags = new Set(nextBaseTags);
          } else if (!newPlatformEdits[pid]) { // If platform has no edits yet, initialize with new base hashtags
             const platformInfo = PLATFORMS.find(p => p.id === pid);
             newPlatformEdits[pid] = {
                caption: baseCaption,
                selectedHashtags: new Set(nextBaseTags),
                selectedImageIds: platformInfo ? getDefaultImageSelectionForPlatform(platformInfo, currentBaseImages) : []
             };
          }
        });
        return newPlatformEdits;
      });
      return nextBaseTags;
    });
    copyToClipboard(hashtag, "Base Hashtag");
  };

  // Helper to compare sets
  const setsAreEqual = (setA: Set<string>, setB: Set<string>) => {
    if (setA.size !== setB.size) return false;
    for (const a of setA) if (!setB.has(a)) return false;
    return true;
  };


  const isApiKeyLikelyConfigured = typeof process.env.API_KEY === 'string' && process.env.API_KEY.trim() !== '';

  const handleTogglePlatformForNewPost = (platformId: PlatformID) => {
    setSelectedPlatformsForNewPost(prev => {
        const next = new Set(prev);
        if (next.has(platformId)) {
            next.delete(platformId);
            setCurrentPlatformEdits(prevEdits => {
                const newEdits = {...prevEdits};
                delete newEdits[platformId];
                return newEdits;
            });
        } else {
            next.add(platformId);
            if (!currentPlatformEdits[platformId]) {
                const platformInfo = PLATFORMS.find(p => p.id === platformId);
                setCurrentPlatformEdits(prevEdits => ({
                    ...prevEdits,
                    [platformId]: {
                        caption: baseCaption, 
                        selectedHashtags: new Set(baseSelectedGeneratedHashtags), 
                        selectedImageIds: platformInfo ? getDefaultImageSelectionForPlatform(platformInfo, currentBaseImages) : []
                    }
                }));
            }
        }
        return next;
    });
  };
  
  const handlePlatformSpecificContentChange = (platformId: PlatformID, newContent: PlatformSpecificPostContent) => {
    setCurrentPlatformEdits(prev => ({
        ...prev,
        [platformId]: newContent
    }));
  };

  const handleFinalizeAndOpenModal = () => {
    if (selectedPlatformsForNewPost.size === 0) {
        setError("Please select at least one platform."); return;
    }
    setError(null);

    const finalPlatformSpecificContentData: Partial<Record<PlatformID, PlatformSpecificPostContent>> = {};
    Array.from(selectedPlatformsForNewPost).forEach(pid => {
        if (currentPlatformEdits[pid]) {
            finalPlatformSpecificContentData[pid] = currentPlatformEdits[pid];
        } else {
            const platformInfo = PLATFORMS.find(p => p.id === pid);
            finalPlatformSpecificContentData[pid] = {
                caption: baseCaption,
                selectedHashtags: new Set(baseSelectedGeneratedHashtags),
                selectedImageIds: platformInfo ? getDefaultImageSelectionForPlatform(platformInfo, currentBaseImages) : []
            };
        }
    });
    
    onInitiatePostCreation({
        topic,
        selectedPlatforms: selectedPlatformsForNewPost,
        platformSpecificContentData: finalPlatformSpecificContentData,
        baseCaption,
        baseSelectedHashtags: baseSelectedGeneratedHashtags,
    });
  };

  const getDefaultImageSelectionForPlatform = (platform: Platform, images: BaseImage[]): string[] => {
    if (!images.length) return [];
    const limit = platform.imageLimit ?? images.length;
    const imagesToConsider = images.slice(0, limit);
    if (platform.supportsMultiImage === false && imagesToConsider.length > 0) return [imagesToConsider[0].id];
    return imagesToConsider.map(img => img.id);
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

      <div className="space-y-3 pt-2">
        <h3 className="text-md font-['Montserrat'] font-semibold text-[var(--color-charcoal-gray)]">Upload Images (Base)</h3>
        <input type="file" id="imageUpload" multiple accept="image/*" onChange={handleImageUpload} ref={fileInputRef}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-deep-forest)]/10 file:text-[var(--color-deep-forest)] hover:file:bg-[var(--color-deep-forest)]/20"/>
        {currentBaseImages.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {currentBaseImages.map(image => (
              <div key={image.id} className="relative group border rounded-md overflow-hidden shadow-sm">
                <img src={image.previewUrl} alt={image.name} className="w-full h-24 object-cover" />
                <button onClick={() => handleRemoveBaseImage(image.id)} className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100" title={`Remove ${image.name}`}>
                    <TrashIcon className="h-3 w-3" />
                </button>
                <p className="text-[10px] p-1 truncate text-center bg-gray-50" title={image.name}>{image.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {baseGeneratedContent?.captions.length > 0 && (
        <div className="space-y-4 pt-2">
          <h3 className="text-lg font-['Montserrat'] font-semibold">AI Suggested Base Captions:</h3>
          {baseGeneratedContent.captions.map((sug, idx) => <GeneratedCaptionCard key={idx} suggestion={sug} onUseSuggestion={handleUseBaseSuggestion}/>)}
        </div>
      )}

      {baseGeneratedContent?.hashtags.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-md font-['Montserrat'] font-semibold">Suggested Base Hashtags:</h3>
          <div className="flex flex-wrap gap-2">
            {baseGeneratedContent.hashtags.map((tag, idx) => {
              const isSelected = baseSelectedGeneratedHashtags.has(tag);
              return (
                <button key={idx} onClick={() => toggleBaseHashtagSelection(tag)} title={isSelected ? `Deselect "${tag}"` : `Select "${tag}"`}
                  className={`px-2.5 py-1 text-xs rounded-full flex items-center ${isSelected ? 'bg-[var(--color-deep-forest)] text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                  {isSelected && <CheckIconMini className="h-3 w-3 mr-1.5" />} {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {baseGeneratedContent?.trendingKeywords.length > 0 && (
        <div className="space-y-2 pt-2">
          <h3 className="text-md font-['Montserrat'] font-semibold">Niche Insights & Trending Keywords:</h3>
          <ul className="list-disc list-inside pl-2">{baseGeneratedContent.trendingKeywords.map((kw, idx) => <li key={idx} className="text-sm font-['Lora']">{kw}</li>)}</ul>
        </div>
      )}
      
      <div className="pt-4 space-y-3">
        <div>
          <label htmlFor="baseCaption" className="block text-sm font-medium mb-1.5">Your Base Post Caption</label>
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

// --- Helper Icons (internal to PostEditor) ---
const SparklesIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 13.75l-1.25-1.75L14.25 12l1.5-1.5 1.25-1.75L18.25 12zM12.75 5.25L12 6.5l-1.25-1.25L9.25 4l1.5-1.5L12 1l1.25 1.5L14.75 4l-1.5 1.25z" />
  </svg>
);

const CheckIconMini: React.FC<{className?: string}> = ({ className }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className || "w-4 h-4"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.032 3.223.094M7.5 3.75l.608.608A15.91 15.91 0 0012 5.062a15.91 15.91 0 003.892-.704l.608-.608M7.5 3.75V4.5m10.5-1.125V4.5m0 0h-12" />
  </svg>
);

export default PostEditor;
