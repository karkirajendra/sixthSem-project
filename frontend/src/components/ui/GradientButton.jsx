import React from 'react';

const GradientButton = ({ 
  children, 
  type = "button", 
  disabled = false, 
  onClick, 
  className = "",
  size = "default" 
}) => {
  const sizeClasses = {
    small: "py-2 px-4 text-sm",
    default: "py-3 px-6 text-base",
    large: "py-4 px-8 text-lg"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-gradient-to-r from-blue-500 to-teal-500 
        hover:from-blue-600 hover:to-teal-600 
        text-white font-semibold 
        rounded-md shadow-lg 
        hover:shadow-teal-500/30 
        transition-all duration-300 
        transform hover:scale-105 
        disabled:opacity-50 
        disabled:cursor-not-allowed 
        disabled:hover:scale-100
        disabled:hover:shadow-lg
        focus:outline-none 
        focus:ring-2 
        focus:ring-teal-500 
        focus:ring-offset-2
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default GradientButton;