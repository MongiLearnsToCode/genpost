
import React, { useState, useEffect, useCallback } from 'react';
import { Platform, PlatformID, BaseImage } from '../types';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';

interface PlatformPreviewCardProps {
  platform: Platform;
  initialCaption: string;
  initialHashtags: Set<string>;
  initialSelectedImageIds: string[];
  allBaseImages: BaseImage[];
  allSuggestedHashtags: string[];
  onContentChange: (platformId: PlatformID, newCaption: string, newHashtags: Set<string>, newSelectedImageIds: string[]) => void;
  isApiKeyConfigured: boolean;
}

const PlatformPreviewCard: React.FC<PlatformPreviewCardProps> = ({
  platform,
  initialCaption,
  initialHashtags,
  initialSelectedImageIds,
  allBaseImages,
  allSuggestedHashtags,
  onContentChange,
  isApiKeyConfigured
}) => {
  const [currentCaption, setCurrentCaption] = useState<string>(initialCaption);
  const [currentSelectedHashtags, setCurrentSelectedHashtags] = useState<Set<string>>(initialHashtags);
  const [currentSelectedImageIds, setCurrentSelectedImageIds] = useState<string[]>(initialSelectedImageIds);
  const [isEditingHashtags, setIsEditingHashtags] = useState<boolean>(false);
  const [isEditingImages, setIsEditingImages] = useState<boolean>(false);
  const [isLoadingAiEdit, setIsLoadingAiEdit] = useState<boolean>(false);
  const [aiEditError, setAiEditError] = useState<string | null>(null);
  const [imageSelectionError, setImageSelectionError] = useState<string | null>(null);


  useEffect(() => {
    setCurrentCaption(initialCaption);
  }, [initialCaption]);

  useEffect(() => {
    setCurrentSelectedHashtags(initialHashtags);
  }, [initialHashtags]);

  useEffect(() => {
    setCurrentSelectedImageIds(initialSelectedImageIds);
  }, [initialSelectedImageIds]);

  const handleCaptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCaption = event.target.value;
    setCurrentCaption(newCaption);
    onContentChange(platform.id, newCaption, currentSelectedHashtags, currentSelectedImageIds);
  };

  const toggleHashtagSelection = (hashtag: string) => {
    const newHashtags = new Set(currentSelectedHashtags);
    if (newHashtags.has(hashtag)) {
      newHashtags.delete(hashtag);
    } else {
      newHashtags.add(hashtag);
    }
    setCurrentSelectedHashtags(newHashtags);
    onContentChange(platform.id, currentCaption, newHashtags, currentSelectedImageIds);
  };

  const handleToggleImageSelection = (imageId: string) => {
    setImageSelectionError(null);
    let newSelectedImageIds = [...currentSelectedImageIds];
    const isSelected = newSelectedImageIds.includes(imageId);
    const imageLimit = platform.imageLimit ?? Infinity;

    if (isSelected) {
      newSelectedImageIds = newSelectedImageIds.filter(id => id !== imageId);
    } else {
      // Adding a new image
      if (!platform.supportsMultiImage || imageLimit === 1) {
        if (newSelectedImageIds.length > 0 && imageLimit === 1 && platform.supportsMultiImage === false) { // Special case for LinkedIn style single image
             newSelectedImageIds = [imageId]; // Replace
        } else if (imageLimit === 1) {
             newSelectedImageIds = [imageId]; // Replace
        } else if (!platform.supportsMultiImage && newSelectedImageIds.length > 0) {
            setImageSelectionError(`Only 1 image allowed for ${platform.name}. Deselect the current image first.`);
            return;
        } else {
             newSelectedImageIds = [imageId];
        }

      } else { // Supports multi-image and limit > 1
        if (newSelectedImageIds.length < imageLimit) {
          newSelectedImageIds.push(imageId);
        } else {
          setImageSelectionError(`Cannot select more than ${imageLimit} image(s) for ${platform.name}.`);
          setTimeout(() => setImageSelectionError(null), 3000);
          return; 
        }
      }
    }
    setCurrentSelectedImageIds(newSelectedImageIds);
    onContentChange(platform.id, currentCaption, currentSelectedHashtags, newSelectedImageIds);
  };

  const handleAiEdit = useCallback(async (action: 'expand' | 'shorten') => {
    if (!currentCaption.trim() || !isApiKeyConfigured) {
      setAiEditError(isApiKeyConfigured ? "Caption is empty." : "API Key not configured.");
      return;
    }

    setIsLoadingAiEdit(true);
    setAiEditError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `You are an AI assistant helping to refine a social media post for ${platform.name}. 
The platform has a character limit of approximately ${platform.characterLimit || 'many'} characters.
The current caption is: "${currentCaption}"
Please ${action} this caption. 
If shortening, try to stay well within the character limit. If expanding, add relevant details or flair.
Maintain the original tone and core message.
Return only the modified caption text, without any introductory phrases, labels, or markdown.`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const newCaptionText = response.text.trim();
      setCurrentCaption(newCaptionText);
      onContentChange(platform.id, newCaptionText, currentSelectedHashtags, currentSelectedImageIds);

    } catch (e: any) {
      console.error(`Error during AI ${action}:`, e);
      setAiEditError(`Failed to ${action} caption. ${e.message || ''}`);
    } finally {
      setIsLoadingAiEdit(false);
    }
  }, [currentCaption, platform, isApiKeyConfigured, onContentChange, currentSelectedHashtags, currentSelectedImageIds]);


  const hashtagsText = Array.from(currentSelectedHashtags).join(' ');
  const selectedImageNames = currentSelectedImageIds
    .map(id => allBaseImages.find(img => img.id === id)?.name)
    .filter(Boolean)
    .join(', ');
    
  const fullTextForPreview = `${currentCaption}${currentSelectedHashtags.size > 0 ? `\n\n${hashtagsText}` : ''}${currentSelectedImageIds.length > 0 ? `\n\n[Images: ${selectedImageNames || currentSelectedImageIds.length + ' selected'}]` : ''}`;

  const captionLength = currentCaption.length;
  const limit = platform.characterLimit;

  return (
    <div className={`p-4 rounded-[10px] shadow-lg border border-[var(--color-charcoal-gray)]/20 bg-[var(--color-crisp-white)] overflow-hidden flex flex-col space-y-3`}>
      <div className="flex items-center pb-2 border-b border-[var(--color-charcoal-gray)]/10">
        <span className={`h-6 w-6 mr-2 ${platform.color} rounded-sm p-0.5 flex items-center justify-center`}>
          {React.cloneElement(platform.icon as React.ReactElement<{ className?: string }>, {
            className: 'h-4 w-4 text-white'
          })}
        </span>
        <h4 className="font-['Montserrat'] text-md font-semibold text-[var(--color-deep-forest)]">{platform.name} Editor</h4>
      </div>

      <textarea
        value={currentCaption}
        onChange={handleCaptionChange}
        rows={4}
        placeholder={`Edit caption for ${platform.name}...`}
        className="w-full p-2.5 font-['Lora'] text-sm text-[var(--color-charcoal-gray)] bg-gray-50 border border-[var(--color-charcoal-gray)]/30 rounded-md shadow-sm focus:ring-1 focus:ring-[var(--color-deep-forest)]/50 focus:border-[var(--color-deep-forest)] transition leading-relaxed resize-none"
        aria-label={`Caption for ${platform.name}`}
      />

      {/* Hashtag Editor */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h5 className="text-xs font-['Montserrat'] font-medium text-[var(--color-charcoal-gray)]">Hashtags:</h5>
          <Button size="sm" variant="secondary" onClick={() => setIsEditingHashtags(!isEditingHashtags)} className="text-xs py-1 px-2">
            {isEditingHashtags ? 'Done Editing' : 'Edit Hashtags'}
          </Button>
        </div>
        {isEditingHashtags && (
          <div className="p-2 border rounded-md bg-gray-50 max-h-32 overflow-y-auto">
            {allSuggestedHashtags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {allSuggestedHashtags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleHashtagSelection(tag)}
                    className={`px-2 py-0.5 font-['Lora'] text-[11px] rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[var(--color-deep-forest)]
                                ${currentSelectedHashtags.has(tag)
                      ? 'bg-[var(--color-deep-forest)] text-[var(--color-crisp-white)]'
                      : 'bg-gray-200 text-[var(--color-charcoal-gray)] hover:bg-gray-300'
                    }`}
                    aria-pressed={currentSelectedHashtags.has(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            ) : <p className="text-xs text-gray-500 italic font-['Lora']">No base hashtags suggested.</p>}
          </div>
        )}
        <div className="flex flex-wrap gap-1 text-xs text-[var(--color-deep-forest)]/80 font-['Lora']">
          {Array.from(currentSelectedHashtags).map(tag => (
            <span key={tag} className="bg-[var(--color-deep-forest)]/10 px-1.5 py-0.5 rounded-sm">{tag}</span>
          ))}
          {currentSelectedHashtags.size === 0 && !isEditingHashtags && <p className="text-xs text-gray-400 italic">No hashtags selected for {platform.name}.</p>}
        </div>
      </div>
      
      {/* Image Editor */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
            <h5 className="text-xs font-['Montserrat'] font-medium text-[var(--color-charcoal-gray)]">
                Images ({currentSelectedImageIds.length}/{platform.imageLimit ?? '∞'}):
            </h5>
            <Button size="sm" variant="secondary" onClick={() => setIsEditingImages(!isEditingImages)} className="text-xs py-1 px-2">
                {isEditingImages ? 'Done Editing Images' : 'Edit Images'}
            </Button>
        </div>
        {imageSelectionError && <p className="text-xs text-red-500 font-['Lora']">{imageSelectionError}</p>}
        {isEditingImages && (
            <div className={`p-2 border rounded-md bg-gray-50 max-h-48 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 ${allBaseImages.length === 0 ? 'flex items-center justify-center' : ''}`}>
                {allBaseImages.length > 0 ? allBaseImages.map(image => {
                    const isSelected = currentSelectedImageIds.includes(image.id);
                    const limitReached = !isSelected && platform.imageLimit !== undefined && currentSelectedImageIds.length >= platform.imageLimit && platform.supportsMultiImage;
                    const isDisabled = limitReached || (!platform.supportsMultiImage && currentSelectedImageIds.length > 0 && !isSelected);

                    return (
                        <button
                            key={image.id}
                            onClick={() => handleToggleImageSelection(image.id)}
                            disabled={isDisabled}
                            className={`relative group border-2 rounded-md overflow-hidden focus:outline-none transition-all
                                        ${isSelected ? 'border-[var(--color-deep-forest)] shadow-md' : 'border-transparent hover:border-gray-300'}
                                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            aria-pressed={isSelected}
                            aria-label={`Select image ${image.name}`}
                        >
                            <img src={image.previewUrl} alt={image.name} className="w-full h-20 object-cover" />
                            <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-0.5 truncate text-center font-['Lora']">{image.name}</p>
                            {isSelected && (
                                <div className="absolute inset-0 bg-[var(--color-deep-forest)]/30 flex items-center justify-center">
                                    <CheckIcon className="h-6 w-6 text-white" />
                                </div>
                            )}
                             {isDisabled && !isSelected && <div className="absolute inset-0 bg-gray-400/50 flex items-center justify-center" title={!platform.supportsMultiImage ? `Only one image allowed` : `Image limit (${platform.imageLimit}) reached`}></div>}
                        </button>
                    );
                }) : (
                     <p className="text-xs text-gray-500 italic font-['Lora'] col-span-full text-center py-4">No base images uploaded to select from.</p>
                )}
            </div>
        )}
        {!isEditingImages && currentSelectedImageIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
                {currentSelectedImageIds.map(id => {
                    const image = allBaseImages.find(img => img.id === id);
                    if (!image) return null;
                    return (
                        <div key={id} className="relative w-16 h-16 border border-gray-200 rounded-md overflow-hidden shadow-sm">
                            <img src={image.previewUrl} alt={image.name} className="w-full h-full object-cover" />
                             <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] p-0.5 truncate text-center font-['Lora']" title={image.name}>{image.name}</p>
                        </div>
                    );
                })}
            </div>
        )}
        {!isEditingImages && currentSelectedImageIds.length === 0 && (
             <p className="text-xs text-gray-400 italic font-['Lora']">No images selected for {platform.name}.</p>
        )}
      </div>


      {/* AI Quick Edits */}
      <div className="pt-2 border-t border-[var(--color-charcoal-gray)]/10 space-y-2">
        <h5 className="text-xs font-['Montserrat'] font-medium text-[var(--color-charcoal-gray)]">AI Quick Edits:</h5>
        {isLoadingAiEdit && <div className="flex items-center text-xs text-[var(--color-deep-forest)]"><LoadingSpinner size="h-4 w-4 mr-1.5" /> Processing...</div>}
        {aiEditError && <ErrorAlert message={aiEditError} />}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleAiEdit('shorten')}
            disabled={!currentCaption.trim() || isLoadingAiEdit || !isApiKeyConfigured}
            className="flex-1 text-xs"
            aria-label={`Shorten caption for ${platform.name}`}
          >
            Shorten
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleAiEdit('expand')}
            disabled={!currentCaption.trim() || isLoadingAiEdit || !isApiKeyConfigured}
            className="flex-1 text-xs"
            aria-label={`Expand caption for ${platform.name}`}
          >
            Expand
          </Button>
        </div>
        {!isApiKeyConfigured && <p className="text-[10px] text-[var(--color-burnt-sienna)]/80 font-['Lora'] text-center">API Key not configured for AI Edits.</p>}
      </div>

      {/* Preview */}
      <div className="pt-2 border-t border-[var(--color-charcoal-gray)]/10">
        <h5 className="text-xs font-['Montserrat'] font-medium text-[var(--color-charcoal-gray)] mb-1">Preview:</h5>
        <div
          className="prose prose-sm max-w-none font-['Lora'] text-[var(--color-charcoal-gray)] whitespace-pre-wrap break-words text-xs leading-relaxed bg-gray-50 p-2 rounded-md min-h-[60px] max-h-[120px] overflow-y-auto"
          style={{
            '--tw-prose-body': 'var(--color-charcoal-gray)',
            '--tw-prose-links': 'var(--color-deep-forest)',
          } as React.CSSProperties}
        >
          {fullTextForPreview.trim() || <span className="text-gray-400 italic">Content will appear here...</span>}
        </div>
        {limit && (
          <div className="mt-1.5 text-[11px] font-['Lora'] text-right">
            <span className={(limit && captionLength > limit) ? 'text-red-600 font-bold' : 'text-[var(--color-charcoal-gray)]/80'}>
              Caption: {captionLength}/{limit} chars
            </span>
            {(limit && captionLength > limit) && <p className="text-red-500 text-[10px]">Caption exceeds character limit!</p>}
          </div>
        )}
        {!limit && (
          <div className="mt-1.5 text-[11px] font-['Lora'] text-right text-[var(--color-charcoal-gray)]/80">
            Caption: {captionLength} characters
          </div>
        )}
      </div>
    </div>
  );
};


// --- Helper Icons (copied from PostEditor or similar) ---
const PhotoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const CheckIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);


export default PlatformPreviewCard;
