import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  disabled = false,
  children,
  variant = 'primary',
  type = 'button',
}) => {
  const baseStyles = 'px-4 py-2 rounded font-medium transition-colors';
  const variantStyles =
    variant === 'primary'
      ? 'bg-brand-gold text-white hover:bg-brand-gold/90 disabled:bg-gray-400 disabled:cursor-not-allowed'
      : 'bg-white border-2 border-brand-olive text-brand-dark hover:bg-brand-olive/10 disabled:bg-gray-100 disabled:border-gray-300 disabled:cursor-not-allowed';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles}`}
    >
      {children}
    </button>
  );
};

