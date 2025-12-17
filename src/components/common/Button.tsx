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
      ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400'
      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100';

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

