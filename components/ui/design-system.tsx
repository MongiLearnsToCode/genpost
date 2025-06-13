import React from 'react';

// Button Components
export const Button = ({
  children,
  variant = 'primary',
  disabled = false,
  onClick,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  [key: string]: any;
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const disabledClass = disabled ? 'btn-disabled' : '';
  
  return (
    <button
      className={`${baseClass} ${variantClass} ${disabledClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Input Components
export const Input = ({
  error,
  className = '',
  ...props
}: {
  error?: string;
  className?: string;
  [key: string]: any;
}) => {
  const baseClass = 'input';
  const errorClass = error ? 'input-error' : '';
  
  return (
    <div className="w-full">
      <input
        className={`${baseClass} ${errorClass} ${className}`}
        {...props}
      />
      {error && <p className="text-error-500 text-caption mt-1">{error}</p>}
    </div>
  );
};

// Card Component
export const Card = ({
  children,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};

// Alert Component
export const Alert = ({
  children,
  variant = 'success',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  variant: 'success' | 'warning' | 'error';
  className?: string;
  [key: string]: any;
}) => {
  const baseClass = 'alert';
  const variantClass = `alert-${variant}`;
  
  return (
    <div className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

// Typography Components
export const Heading1 = ({
  children,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <h1 className={`text-h1 ${className}`} {...props}>
      {children}
    </h1>
  );
};

export const Heading2 = ({
  children,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <h2 className={`text-h2 ${className}`} {...props}>
      {children}
    </h2>
  );
};

export const BodyText = ({
  children,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <p className={`text-body ${className}`} {...props}>
      {children}
    </p>
  );
};

export const Caption = ({
  children,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <span className={`text-caption ${className}`} {...props}>
      {children}
    </span>
  );
};

// Badge Component
export const Badge = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'error';
  className?: string;
  [key: string]: any;
}) => {
  const colorMap = {
    primary: 'bg-primary-500 text-white',
    accent: 'bg-accent-500 text-white',
    success: 'bg-success-500 text-white',
    warning: 'bg-warning-500 text-neutral-900',
    error: 'bg-error-500 text-white',
  };
  
  return (
    <span 
      className={`inline-block px-2 py-1 rounded text-caption font-semibold ${colorMap[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// Skeleton Loading Component
export const Skeleton = ({
  className = '',
  ...props
}: {
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div className={`skeleton ${className}`} {...props} />
  );
};

// Icon Component with accessibility support
export const Icon = ({
  name,
  label,
  className = '',
  ...props
}: {
  name: string;
  label?: string;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <span 
      className={`inline-flex items-center justify-center ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      {...props}
    >
      {/* This is a placeholder for actual icon implementation */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <use href={`#icon-${name}`} />
      </svg>
    </span>
  );
};

// Grid Layout Component
export const Grid = ({
  children,
  columns = { desktop: 8, mobile: 4 },
  gap = 3,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  columns?: { desktop: number; mobile: number };
  gap?: 1 | 2 | 3 | 4 | 5;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div 
      className={`grid grid-cols-${columns.mobile} md:grid-cols-${columns.desktop} gap-${gap} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Container Component
export const Container = ({
  children,
  padding = 4,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  padding?: 1 | 2 | 3 | 4 | 5;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div 
      className={`container mx-auto px-${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
