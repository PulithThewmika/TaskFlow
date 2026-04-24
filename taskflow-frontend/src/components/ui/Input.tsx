import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, id, ...props }) => {
  return (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} {...props} />
      {error && <span data-testid={`${id}-error`}>{error}</span>}
    </div>
  );
};

export default Input;
