import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'default' | 'large';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  variant = 'default',
  className = '',
  ...props
}) => {
  const inputClasses = [
    'input',
    variant === 'large' ? 'input-lg' : '',
    error ? 'border-error' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={fullWidth ? 'full-width' : ''}>
      {label && (
        <label 
          style={{
            display: 'block',
            marginBottom: 'var(--space-2)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)'
          }}
        >
          {label}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        {leftIcon && (
          <div style={{
            position: 'absolute',
            left: 'var(--space-3)',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
            pointerEvents: 'none'
          }}>
            {leftIcon}
          </div>
        )}
        
        <input
          className={inputClasses}
          style={{
            paddingLeft: leftIcon ? 'var(--space-10)' : undefined,
            paddingRight: rightIcon ? 'var(--space-10)' : undefined
          }}
          {...props}
        />
        
        {rightIcon && (
          <div style={{
            position: 'absolute',
            right: 'var(--space-3)',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
            pointerEvents: 'none'
          }}>
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <div style={{
          marginTop: 'var(--space-1)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-error)'
        }}>
          {error}
        </div>
      )}
      
      {helperText && !error && (
        <div style={{
          marginTop: 'var(--space-1)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)'
        }}>
          {helperText}
        </div>
      )}
    </div>
  );
}; 