import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass';
  interactive?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  interactive = false,
  padding = 'md',
  children,
  className = '',
  style = {},
  ...props
}) => {
  const baseClasses = 'card animate-fade-in';
  
  const variantClasses = {
    default: '',
    elevated: 'card-elevated',
    glass: 'card-glass'
  };

  const paddingStyles = {
    sm: { padding: 'var(--space-4)' },
    md: { padding: 'var(--space-6)' },
    lg: { padding: 'var(--space-8)' }
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    interactive ? 'card-interactive' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={{ 
        ...paddingStyles[padding],
        borderRadius: 'var(--radius-2xl)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}; 

export interface UnifiedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  count?: number;
  accentColor?: string;
  quickAction?: React.ReactNode;
  desc?: string;
  onCardClick?: () => void;
  compact?: boolean;
}

export const UnifiedCard: React.FC<UnifiedCardProps> = ({
  icon,
  title,
  count,
  accentColor = 'var(--color-primary-teal)',
  quickAction,
  desc,
  onCardClick,
  className = '',
  style = {},
  compact = false,
  ...props
}) => {
  return (
    <Card
      variant="glass"
      interactive
      padding="sm"
      className={`unified-card ${compact ? 'unified-card-compact' : ''} ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: compact ? 60 : 90,
        cursor: onCardClick ? 'pointer' : 'default',
        position: 'relative',
        padding: compact ? '4px 2px' : '8px 4px',
        ...style
      }}
      onClick={onCardClick}
      {...props}
    >
      <div style={{
        fontSize: compact ? 16 : 20,
        marginBottom: compact ? 1 : 4,
        color: accentColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{
        fontWeight: 500,
        fontSize: compact ? '0.85rem' : '0.95rem',
        textAlign: 'center',
        marginBottom: compact ? 0 : 1,
        color: 'var(--color-text-primary)',
        lineHeight: 1.2
      }}>{title}</div>
      {typeof count === 'number' && (
        <span style={{
          display: 'inline-block',
          minWidth: compact ? 14 : 20,
          height: compact ? 14 : 20,
          borderRadius: '50%',
          background: accentColor,
          color: '#fff',
          fontWeight: 600,
          fontSize: compact ? 10 : 12,
          lineHeight: compact ? '14px' : '20px',
          textAlign: 'center',
          margin: compact ? '1px 0' : '2px 0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
        }}>{count}</span>
      )}
      {desc && !compact && (
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--color-text-secondary)',
          marginTop: 1,
          textAlign: 'center',
        }}>{desc}</div>
      )}
      {quickAction && (
        <div style={{
          position: 'absolute',
          bottom: compact ? 2 : 4,
          right: compact ? 2 : 4,
        }}>
          {quickAction}
        </div>
      )}
    </Card>
  );
}; 