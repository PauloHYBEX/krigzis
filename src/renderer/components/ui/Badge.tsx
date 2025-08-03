import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  dot?: boolean;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'secondary',
  size = 'md',
  dot = false,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'badge';
  
  const variantClasses = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger'
  };

  const sizeStyles = {
    sm: {
      padding: 'var(--space-1) var(--space-2)',
      fontSize: 'var(--font-size-xs)'
    },
    md: {
      padding: 'var(--space-1) var(--space-3)',
      fontSize: 'var(--font-size-sm)'
    }
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <span
      className={classes}
      style={sizeStyles[size]}
      {...props}
    >
      {dot && (
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor',
          marginRight: 'var(--space-1)'
        }} />
      )}
      {children}
    </span>
  );
}; 