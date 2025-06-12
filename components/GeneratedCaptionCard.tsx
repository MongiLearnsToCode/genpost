import React from 'react';
import Button from './Button';

interface GeneratedCaptionCardProps {
  suggestion: string;
  onUseSuggestion: (suggestion: string) => void;
}

const GeneratedCaptionCard: React.FC<GeneratedCaptionCardProps> = ({ suggestion, onUseSuggestion }) => {
  return (
    <div className="p-4 bg-[var(--color-crisp-white)] border border-[var(--color-charcoal-gray)]/20 rounded-[10px] shadow-sm hover:shadow-md transition-shadow duration-200">
      <p className="text-[var(--color-charcoal-gray)] mb-3 text-sm font-['Lora'] leading-relaxed">{suggestion}</p>
      <div className="flex justify-end">
        <Button 
          onClick={() => onUseSuggestion(suggestion)}
          variant="secondary"
          size="sm"
        >
          Use this Caption
        </Button>
      </div>
    </div>
  );
};

export default GeneratedCaptionCard;