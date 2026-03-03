import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="w-full">
      <label className="block text-xs uppercase tracking-wider text-ox-gold mb-1.5 font-semibold">
        {label}
      </label>
      <input
        ref={ref}
        className={`w-full bg-ox-input border ${error ? 'border-red-500' : 'border-gray-700 focus:border-ox-gold'} rounded p-3 text-white outline-none transition-colors placeholder-gray-600 ${className}`}
        {...props}
      />
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  )
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, ...props }, ref) => (
    <div className="w-full">
      <label className="block text-xs uppercase tracking-wider text-ox-gold mb-1.5 font-semibold">
        {label}
      </label>
      <select
        ref={ref}
        className={`w-full bg-ox-input border ${error ? 'border-red-500' : 'border-gray-700 focus:border-ox-gold'} rounded p-3 text-white outline-none appearance-none cursor-pointer`}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  )
);