import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "font-['Lora'] font-medium rounded-[10px] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out transform hover:scale-[1.03]";
  
  const variantStyles = {
    primary: `bg-[var(--color-deep-forest)] text-[var(--color-crisp-white)] hover:bg-[var(--color-warm-blush)] hover:text-[var(--color-deep-forest)] focus:ring-[var(--color-warm-blush)] 
              ${disabled ? 'bg-opacity-50 text-opacity-70 hover:bg-[var(--color-deep-forest)] hover:bg-opacity-50 hover:text-[var(--color-crisp-white)] hover:text-opacity-70 cursor-not-allowed scale-100' : ''}`,
    secondary: `bg-[var(--color-crisp-white)] text-[var(--color-deep-forest)] border border-[var(--color-deep-forest)] hover:bg-[var(--color-warm-blush)]/30 focus:ring-[var(--color-deep-forest)]/50
                ${disabled ? 'bg-opacity-70 text-opacity-50 border-opacity-50 hover:bg-[var(--color-crisp-white)] hover:bg-opacity-70 cursor-not-allowed scale-100' : ''}`,
    danger: `bg-[var(--color-burnt-sienna)] text-[var(--color-crisp-white)] hover:bg-opacity-90 focus:ring-[var(--color-burnt-sienna)]/70
             ${disabled ? 'bg-opacity-50 text-opacity-70 hover:bg-[var(--color-burnt-sienna)] hover:bg-opacity-50 cursor-not-allowed scale-100' : ''}`,
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm", // Increased padding slightly for a more premium feel
    lg: "px-7 py-3.5 text-base", // Increased padding slightly
  };

  return (
    <button
      type="button"
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;