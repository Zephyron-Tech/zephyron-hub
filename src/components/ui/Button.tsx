import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = "primary",
    isLoading = false,
    fullWidth = false,
    disabled,
    children,
    className = "",
    ...props
  },
  ref
) => {
    const baseStyles =
      "px-4 py-2 font-bold rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed";
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700",
      secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
      danger: "bg-red-500 text-white hover:bg-red-700",
    };
    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
        {...props}
      >
        {isLoading ? "Načítání..." : children}
      </button>
    );
  }
);

Button.displayName = "Button";
