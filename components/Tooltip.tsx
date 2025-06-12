
import React, { useState, useId } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId(); // Generate a unique ID once per component instance

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {React.cloneElement(children as React.ReactElement<React.HTMLAttributes<Element>>, {
        'aria-describedby': visible ? tooltipId : undefined,
      })}
      {visible && (
        <div
          id={tooltipId} // Use the same generated ID
          role="tooltip"
          className={`absolute z-20 px-3 py-1.5 text-xs font-medium font-['Lora'] text-[var(--color-crisp-white)] bg-[var(--color-charcoal-gray)] rounded-md shadow-lg whitespace-nowrap ${positionClasses[position]} transition-opacity duration-150 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
          {text}
          {position === 'top' && <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[var(--color-charcoal-gray)]"></div>}
          {position === 'bottom' && <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-[var(--color-charcoal-gray)]"></div>}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
