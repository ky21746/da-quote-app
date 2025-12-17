import React from 'react';

interface InputProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: string | number;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  required = false,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
          onChange(newValue);
        }}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

