import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Coffee, TreePine, Settings as SettingsIcon, ChevronLeft } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';
import { useTheme } from '../hooks/useTheme';
import { TimerSettings } from './TimerSettings';
import { TimerType } from '../../shared/types/timer';

interface TimerProps {
  taskId?: string;
  onBack?: () => void;
}

export const Timer: React.FC<TimerProps> = ({ taskId, onBack }) => {
  const { theme } = useTheme();
  const {
    currentSession,
    settings,
    stats,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    updateSettings,
    formatTime,
    formatDuration,
    getDurationForType,
  } = useTimer();

  const [selectedType, setSelectedType] = useState<TimerType>('work');
  const [showSettings, setShowSettings] = useState(false);

  const getTimerTypeInfo = (type: TimerType) => {
    switch (type) {
      case 'work':
        return {
          label: 'Trabalho',
          icon: <Play size={20} strokeWidth={1.7} />,
          color: '#FF6B6B',
          description: 'Sessão de foco intenso'
        };
      case 'short-break':
        return {
          label: 'Pausa Curta',
          icon: <Coffee size={20} strokeWidth={1.7} />,
          color: '#4ECDC4',
          description: 'Descanso rápido'
        };
      case 'long-break':
        return {
          label: 'Pausa Longa',
          icon: <TreePine size={20} strokeWidth={1.7} />,
          color: '#45B7D1',
          description: 'Descanso prolongado'
        };
    }
  };

  const currentTypeInfo = currentSession ? getTimerTypeInfo(currentSession.type) : getTimerTypeInfo(selectedType);
  const progress = currentSession ? ((currentSession.duration - currentSession.remainingTime) / currentSession.duration) * 100 : 0;

  const handleStart = () => {
    if (currentSession) {
      if (currentSession.status === 'paused') {
        resumeSession();
      } else if (currentSession.status === 'running') {
        pauseSession();
      }
    } else {
      startSession(selectedType, taskId);
    }
  };

  const handleStop = () => {
    stopSession();
  };

  const handleTypeChange = (type: TimerType) => {
    if (!currentSession || currentSession.status === 'completed') {
      setSelectedType(type);
    }
  };

  const isDark = theme.mode === 'dark';

  return (
    <div style={{
      backgroundColor: 'transparent',
      color: 'var(--color-text-primary)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      padding: 'var(--space-4)',
      overflow: 'hidden',
    }}>
      {/* Header Section - Alinhado com padrão das outras abas */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-6)',
        width: '100%',
      }}>
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: '1px solid var(--color-border-primary)',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary-teal)';
              e.currentTarget.style.color = 'var(--color-primary-teal)';
              e.currentTarget.style.backgroundColor = 'rgba(0, 212, 170, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-primary)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Voltar ao Dashboard"
          >
            <ChevronLeft size={18} strokeWidth={1.7} />
          </button>
        )}

                     {/* Título centralizado - padrão das outras abas */}
             <h1 className="gradient-text" style={{
               fontSize: 'var(--font-size-3xl)', // Changed to match dashboard
               fontWeight: 'var(--font-weight-bold)', // Changed to match dashboard
               margin: 0,
               textAlign: 'center',
               flex: 1,
               lineHeight: 'var(--line-height-tight)',
             }}>
               Timer
             </h1>

        {/* Settings button */}
        <button
          onClick={() => setShowSettings(true)}
          style={{
            background: 'none',
            border: '1px solid var(--color-border-primary)',
            borderRadius: '8px',
            color: 'var(--color-text-primary)',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#00D4AA';
            e.currentTarget.style.color = '#00D4AA';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-primary)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
        >
          <SettingsIcon size={14} strokeWidth={1.7} />
          Configurações
        </button>
      </div>

      {/* Conteúdo principal centralizado */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        maxWidth: '400px',
        width: '100%',
        margin: '0 auto',
        gap: 'var(--space-6)',
      }}>

        {/* Timer Type Selector */}
        <div style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '24px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          {(['work', 'short-break', 'long-break'] as TimerType[]).map((type) => {
            const typeInfo = getTimerTypeInfo(type);
            const isActive = (currentSession?.type || selectedType) === type;
            const isDisabled = currentSession && currentSession.status !== 'completed';
            
            return (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                disabled={isDisabled && currentSession?.type !== type ? true : undefined}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: isActive ? `2px solid ${typeInfo.color}` : `2px solid ${isDark ? '#2A2A2A' : '#E0E0E0'}`,
                  backgroundColor: isActive ? `${typeInfo.color}20` : isDark ? '#141414' : '#F5F5F5',
                  color: isActive ? typeInfo.color : isDark ? '#A0A0A0' : '#666666',
                  cursor: isDisabled && currentSession?.type !== type ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  opacity: isDisabled && currentSession?.type !== type ? 0.5 : 1,
                  minWidth: '90px',
                }}
                onMouseEnter={(e) => {
                  if (!isDisabled || currentSession?.type === type) {
                    e.currentTarget.style.borderColor = typeInfo.color;
                    e.currentTarget.style.color = typeInfo.color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = isDark ? '#2A2A2A' : '#E0E0E0';
                    e.currentTarget.style.color = isDark ? '#A0A0A0' : '#666666';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {React.cloneElement(typeInfo.icon, { size: 14 })}
                  <span>{typeInfo.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Timer Display */}
        <div style={{
          marginBottom: '32px',
          position: 'relative',
        }}>
          {/* Progress Ring */}
          <div style={{
            width: '200px',
            height: '200px',
            margin: '0 auto 16px auto',
            position: 'relative',
            borderRadius: '50%',
            background: `conic-gradient(${currentTypeInfo.color} ${progress}%, ${isDark ? '#2A2A2A' : '#E0E0E0'} 0%)`,
            padding: '4px',
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: currentTypeInfo.color,
                marginBottom: '6px',
                fontFamily: 'monospace',
              }}>
                {currentSession ? formatTime(currentSession.remainingTime) : formatTime(getDurationForType(selectedType))}
              </div>
              <div style={{
                fontSize: '14px',
                color: isDark ? '#A0A0A0' : '#666666',
                textAlign: 'center',
              }}>
                {currentSession ? (
                  <div>
                    <div>{currentTypeInfo.label}</div>
                    <div style={{ fontSize: '11px', marginTop: '2px' }}>
                      {currentSession.status === 'running' ? 'Em andamento' : 
                       currentSession.status === 'paused' ? 'Pausado' : 'Concluído'}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div>{currentTypeInfo.label}</div>
                    <div style={{ fontSize: '11px', marginTop: '2px' }}>
                      Pronto para começar
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Current Type Info */}
          <div style={{
            textAlign: 'center',
            marginBottom: '16px',
          }}>
            <div style={{
              fontSize: '20px',
              marginBottom: '6px',
            }}>
              {currentTypeInfo.icon}
            </div>
            <div style={{
              fontSize: '13px',
              color: isDark ? '#A0A0A0' : '#666666',
            }}>
              {currentTypeInfo.description}
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          marginBottom: '24px',
        }}>
          <button
            onClick={handleStart}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: currentTypeInfo.color,
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `0 6px 16px ${currentTypeInfo.color}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {currentSession ? (
              currentSession.status === 'paused' ? (
                <>
                  <Play size={14} strokeWidth={1.7} />
                  Retomar
                </>
              ) : currentSession.status === 'running' ? (
                <>
                  <Pause size={14} strokeWidth={1.7} />
                  Pausar
                </>
              ) : (
                <>
                  <Play size={14} strokeWidth={1.7} />
                  Iniciar
                </>
              )
            ) : (
              <>
                <Play size={14} strokeWidth={1.7} />
                Iniciar
              </>
            )}
          </button>

          {currentSession && (
            <button
              onClick={handleStop}
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                border: `2px solid ${isDark ? '#2A2A2A' : '#E0E0E0'}`,
                backgroundColor: 'transparent',
                color: isDark ? '#FFFFFF' : '#1A1A1A',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FF4444';
                e.currentTarget.style.color = '#FF4444';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isDark ? '#2A2A2A' : '#E0E0E0';
                e.currentTarget.style.color = isDark ? '#FFFFFF' : '#1A1A1A';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Square size={14} strokeWidth={1.7} />
              Parar
            </button>
          )}
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          width: '100%',
          maxWidth: '300px',
        }}>
          <div style={{
            padding: '12px 8px',
            borderRadius: '10px',
            backgroundColor: isDark ? '#141414' : '#F5F5F5',
            border: `1px solid ${isDark ? '#2A2A2A' : '#E0E0E0'}`,
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#FF6B6B',
              marginBottom: '2px',
            }}>
              {stats.completedSessions}
            </div>
            <div style={{
              fontSize: '11px',
              color: isDark ? '#A0A0A0' : '#666666',
            }}>
              Sessões
            </div>
          </div>

          <div style={{
            padding: '12px 8px',
            borderRadius: '10px',
            backgroundColor: isDark ? '#141414' : '#F5F5F5',
            border: `1px solid ${isDark ? '#2A2A2A' : '#E0E0E0'}`,
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#4ECDC4',
              marginBottom: '2px',
            }}>
              {formatDuration(stats.totalFocusTime)}
            </div>
            <div style={{
              fontSize: '11px',
              color: isDark ? '#A0A0A0' : '#666666',
            }}>
              Tempo Total
            </div>
          </div>

          <div style={{
            padding: '12px 8px',
            borderRadius: '10px',
            backgroundColor: isDark ? '#141414' : '#F5F5F5',
            border: `1px solid ${isDark ? '#2A2A2A' : '#E0E0E0'}`,
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#45B7D1',
              marginBottom: '2px',
            }}>
              {stats.currentStreak}
            </div>
            <div style={{
              fontSize: '11px',
              color: isDark ? '#A0A0A0' : '#666666',
            }}>
              Sequência
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <TimerSettings
          settings={settings}
          onSave={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};