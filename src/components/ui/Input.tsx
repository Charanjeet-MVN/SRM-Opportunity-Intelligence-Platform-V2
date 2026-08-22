import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      className = "",
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-zinc-300 font-sans"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-zinc-500 pointer-events-none shrink-0 flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`input-soip ${leftIcon ? "pl-9" : ""} ${rightIcon ? "pr-9" : ""} ${
              error ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20" : ""
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-zinc-500 shrink-0 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-[11px] font-sans text-rose-400">{error}</p>}
        {!error && helperText && (
          <p className="text-[11px] font-sans text-zinc-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
