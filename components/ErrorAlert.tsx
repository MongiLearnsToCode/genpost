import React from 'react';

interface ErrorAlertProps {
  message: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div 
      className="p-4 bg-[var(--color-burnt-sienna)]/10 border border-[var(--color-burnt-sienna)]/50 rounded-[10px] text-[var(--color-burnt-sienna)] shadow-md transition-opacity duration-200 ease-in-out opacity-100" 
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <ErrorIcon className="h-5 w-5 text-[var(--color-burnt-sienna)]" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-['Montserrat'] font-medium text-[var(--color-burnt-sienna)]">Error</h3>
          <div className="mt-1 text-sm font-['Lora']">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ErrorIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

export default ErrorAlert;