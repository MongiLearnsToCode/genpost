
import React from 'react';
import { Platform, PlatformID } from '../types';
import Tooltip from './Tooltip';

interface PlatformPickerProps {
  platforms: Platform[];
  selectedPlatforms: Set<PlatformID>;
  onTogglePlatform: (platformId: PlatformID) => void;
}

const PlatformPicker: React.FC<PlatformPickerProps> = ({ platforms, selectedPlatforms, onTogglePlatform }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-charcoal-gray)] mb-2 font-['Lora']">
        Select Platforms
      </label>
      <div className="flex flex-wrap gap-3">
        {platforms.map((platform) => (
          <Tooltip key={platform.id} text={platform.name} position="top">
            <button
              type="button"
              onClick={() => onTogglePlatform(platform.id)}
              className={`p-3 rounded-[10px] border-2 transition-all duration-150 ease-in-out transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-offset-1
                          ${selectedPlatforms.has(platform.id)
                            ? `${platform.color} text-white border-transparent shadow-md focus:ring-[var(--color-warm-blush)]/70`
                            : `bg-[var(--color-crisp-white)] text-[var(--color-charcoal-gray)] border-[var(--color-charcoal-gray)]/30 hover:border-[var(--color-charcoal-gray)]/60 hover:bg-[var(--color-warm-blush)]/20 focus:ring-[var(--color-deep-forest)]/50`
                          }`}
              aria-pressed={selectedPlatforms.has(platform.id)}
              aria-label={`Select ${platform.name}`}
            >
              <span className="h-6 w-6 block">
                {React.cloneElement(platform.icon as React.ReactElement<{ className?: string }>, {
                  className: `h-full w-full ${selectedPlatforms.has(platform.id) ? 'text-white' : 'text-[var(--color-charcoal-gray)]'}`
                })}
              </span>
            </button>
          </Tooltip>
        ))}
      </div>
       {selectedPlatforms.size === 0 && (
         <p className="text-xs text-[var(--color-burnt-sienna)] mt-2 font-['Lora']">Please select at least one platform.</p>
       )}
    </div>
  );
};

export default PlatformPicker;
