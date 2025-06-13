import React from 'react';
import { Button as ShadcnButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

// This is a wrapper around Shadcn UI's Button component to maintain compatibility with existing code
const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled,
  ...props 
}) => {
  // Map our custom variants to Shadcn UI variants
  const shadcnVariant = {
    'primary': 'default',
    'secondary': 'outline',
    'danger': 'destructive'
  }[variant] as 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  
  // Map our custom sizes to Shadcn UI sizes
  const shadcnSize = {
    'sm': 'sm',
    'md': 'default',
    'lg': 'lg'
  }[size] as 'default' | 'sm' | 'lg' | 'icon';
  
  // Custom class for font family to maintain consistency
  const fontClass = "font-['Lora']";

  return (
    <ShadcnButton
      variant={shadcnVariant}
      size={shadcnSize}
      className={cn(fontClass, className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </ShadcnButton>
  );
};

export default Button;