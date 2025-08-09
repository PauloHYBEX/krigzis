import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Coffee, TreePine, Settings as SettingsIcon, ChevronLeft, Clock } from 'lucide-react';
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
              marginRight: 'var(--space-4)',
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

        {/* Título com ícone - padrão das outras abas */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flex: 1
        }}>
          <Clock size={28} style={{ color: 'var(--color-primary-teal)' }} />
          <h1 className="gradient-text" style={{
            fontSize: '32px',
            fontWeight: 600,
            margin: 0,
          }}>
            Timer
          </h1>
        </div>

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

      {/* Conteúdo principal em layout flexível */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        flex: 1,
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto',
      }}>

        {/* Timer Principal - Centralizado */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          padding: '24px',
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--color-border-primary)',
        }}>
          {/* Timer Display */}
          <div style={{
            fontSize: '48px',
            fontWeight: 700,
            color: getTimerTypeInfo(currentSession?.type || selectedType).color,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '-1px',
            textAlign: 'center',
          }}>
            {currentSession ? formatTime(currentSession.remainingTime) : formatTime(getDurationForType(selectedType))}
          </div>

          {/* Timer Type Badge */}
          <div style={{
            padding: '6px 16px',
            backgroundColor: `${getTimerTypeInfo(currentSession?.type || selectedType).color}20`,
            color: getTimerTypeInfo(currentSession?.type || selectedType).color,
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            {getTimerTypeInfo(currentSession?.type || selectedType).label}
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}>
            {!currentSession ? (
              <button
                onClick={() => startSession(selectedType)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--color-primary-teal)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary-teal-dark)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary-teal)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Iniciar
              </button>
            ) : currentSession.status === 'running' ? (
              <>
                <button
                  onClick={pauseSession}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'var(--color-warning)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Pausar
                </button>
                <button
                  onClick={stopSession}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'var(--color-danger)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Parar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={resumeSession}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'var(--color-success)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Continuar
                </button>
                <button
                  onClick={stopSession}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'var(--color-danger)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Parar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Seção inferior - Seletores e Estatísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
        }}>

        {/* Seletores de Tipo */}
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--color-border-primary)',
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: '16px',
            margin: '0 0 16px 0',
          }}>
            Modo de Trabalho
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
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
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: isActive ? `2px solid ${typeInfo.color}` : `1px solid ${isDark ? '#2A2A2A' : '#E0E0E0'}`,
                  backgroundColor: isActive ? `${typeInfo.color}20` : isDark ? '#141414' : '#F5F5F5',
                  color: isActive ? typeInfo.color : isDark ? '#A0A0A0' : '#666666',
                  cursor: isDisabled && currentSession?.type !== type ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  opacity: isDisabled && currentSession?.type !== type ? 0.5 : 1,
                  width: '100%',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isDisabled || currentSession?.type === type) {
                    e.currentTarget.style.borderColor = typeInfo.color;
                    e.currentTarget.style.color = typeInfo.color;
                    e.currentTarget.style.backgroundColor = `${typeInfo.color}10`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = isDark ? '#2A2A2A' : '#E0E0E0';
                    e.currentTarget.style.color = isDark ? '#A0A0A0' : '#666666';
                    e.currentTarget.style.backgroundColor = isDark ? '#141414' : '#F5F5F5';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {React.cloneElement(typeInfo.icon, { size: 16 })}
                  <div>
                    <div style={{ fontWeight: 600 }}>{typeInfo.label}</div>
                    <div style={{ 
                      fontSize: '12px', 
                      opacity: 0.7, 
                      marginTop: '2px' 
                    }}>
                      {formatDuration(getDurationForType(type))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          </div>
        </div>

        {/* Estatísticas de Hoje */}
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--color-border-primary)',
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: '12px',
            margin: '0 0 12px 0',
          }}>
            Estatísticas de Hoje
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{
              padding: '10px 12px',
              backgroundColor: isDark ? '#141414' : '#F5F5F5',
              borderRadius: '6px',
              border: `1px solid ${isDark ? '#2A2A2A' : '#E0E0E0'}`,
            }}>
              <div style={{
                fontSize: '11px',
                color: isDark ? '#A0A0A0' : '#666666',
                marginBottom: '2px',
              }}>
                Sessões Concluídas
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--color-primary-teal)',
              }}>
                {stats.completedSessions}
              </div>
            </div>
            <div style={{
              padding: '10px 12px',
              backgroundColor: isDark ? '#141414' : '#F5F5F5',
              borderRadius: '6px',
              border: `1px solid ${isDark ? '#2A2A2A' : '#E0E0E0'}`,
            }}>
              <div style={{
                fontSize: '11px',
                color: isDark ? '#A0A0A0' : '#666666',
                marginBottom: '2px',
              }}>
                Tempo Total
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--color-accent-orange)',
              }}>
                {formatDuration(stats.totalFocusTime)}
              </div>
            </div>
          </div>
        </div>

        </div>

        {/* Sessão Atual */}
        {currentSession && (
          <div style={{
            padding: '24px',
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--color-border-primary)',
            textAlign: 'center',
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: '12px',
              margin: '0 0 12px 0',
            }}>
              Sessão Atual
            </h3>
            <div style={{
              fontSize: '14px',
              color: isDark ? '#A0A0A0' : '#666666',
            }}>
              {currentSession ? (
                <div>
                  <div>{currentTypeInfo.label}</div>
                  <div style={{ fontSize: '13px', marginTop: '4px', opacity: 0.8 }}>
                    Iniciado às {new Date().toLocaleTimeString()}
                  </div>
                  <div style={{ fontSize: '13px', marginTop: '4px', opacity: 0.8 }}>
                    {currentSession.status === 'running' ? 'Em andamento' : 
                     currentSession.status === 'paused' ? 'Pausado' : 'Concluído'}
                  </div>
                </div>
              ) : (
                <div>
                  Nenhuma sessão ativa
                </div>
              )}
            </div>
          </div>
        )}
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