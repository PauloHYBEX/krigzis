import React, { useState } from 'react';
import { Settings as SettingsIcon, Play, Coffee, TreePine, X, RotateCcw, Volume2, Bell, Save } from 'lucide-react';
import { TimerSettings as TimerSettingsType } from '../../shared/types/timer';
import { useTheme } from '../hooks/useTheme';

interface TimerSettingsProps {
  settings: TimerSettingsType;
  onSave: (settings: Partial<TimerSettingsType>) => void;
  onClose: () => void;
}

export const TimerSettings: React.FC<TimerSettingsProps> = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = useState<TimerSettingsType>(settings);
  const { theme } = useTheme();
  
  const isDark = theme.mode === 'dark';

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings({
      workDuration: 25 * 60,
      shortBreakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      sessionsUntilLongBreak: 4,
      autoStartBreaks: false,
      autoStartWork: false,
      soundEnabled: true,
      notificationsEnabled: true,
    });
  };

  const formatMinutes = (seconds: number) => Math.floor(seconds / 60);
  const minutesToSeconds = (minutes: number) => minutes * 60;
  
  // Helper function for consistent input styles
  const getInputStyles = () => ({
    width: '100%',
    padding: '12px',
    backgroundColor: isDark ? '#0A0A0A' : '#F9FAFB',
    border: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
    borderRadius: '8px',
    color: isDark ? '#FFFFFF' : '#1F2937',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    outline: 'none',
  });
  
  // Helper function for consistent label styles
  const getLabelStyles = () => ({
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: isDark ? '#A0A0A0' : '#6B7280',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  });
  
  // Helper function for checkbox styles
  const getCheckboxStyles = () => ({
    marginRight: '8px',
    accentColor: '#00D4AA',
    transform: 'scale(1.1)',
  });

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(8px)',
      }}>
      <div 
        className="modal-content"
        style={{
          backgroundColor: isDark ? '#141414' : '#FFFFFF',
          border: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          color: isDark ? '#FFFFFF' : '#1F2937',
          boxShadow: isDark 
            ? '0 20px 40px rgba(0, 0, 0, 0.6)' 
            : '0 20px 40px rgba(0, 0, 0, 0.15)',
        }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 600,
            color: isDark ? '#FFFFFF' : '#1F2937',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <SettingsIcon size={24} strokeWidth={1.7} />
            Configurações do Timer
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
              borderRadius: '8px',
              color: isDark ? '#A0A0A0' : '#6B7280',
              padding: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FF4444';
              e.currentTarget.style.color = '#FF4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isDark ? '#2A2A2A' : '#E5E7EB';
              e.currentTarget.style.color = isDark ? '#A0A0A0' : '#6B7280';
            }}
          >
            <X size={16} strokeWidth={1.7} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Durations */}
          <section>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: 500,
              color: isDark ? '#FFFFFF' : '#1F2937',
            }}>
              Durações
            </h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={getLabelStyles()}>
                  <Play size={16} strokeWidth={1.7} />
                  Trabalho (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formatMinutes(localSettings.workDuration)}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    workDuration: minutesToSeconds(parseInt(e.target.value) || 25)
                  }))}
                  style={getInputStyles()}
                />
              </div>

              <div>
                <label style={getLabelStyles()}>
                  <Coffee size={16} strokeWidth={1.7} />
                  Pausa Curta (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formatMinutes(localSettings.shortBreakDuration)}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    shortBreakDuration: minutesToSeconds(parseInt(e.target.value) || 5)
                  }))}
                  style={getInputStyles()}
                />
              </div>

              <div>
                <label style={getLabelStyles()}>
                  <TreePine size={16} strokeWidth={1.7} />
                  Pausa Longa (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formatMinutes(localSettings.longBreakDuration)}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    longBreakDuration: minutesToSeconds(parseInt(e.target.value) || 15)
                  }))}
                  style={getInputStyles()}
                />
              </div>

              <div>
                <label style={getLabelStyles()}>
                  <RotateCcw size={16} strokeWidth={1.7} />
                  Sessões até pausa longa
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={localSettings.sessionsUntilLongBreak}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    sessionsUntilLongBreak: parseInt(e.target.value) || 4
                  }))}
                  style={getInputStyles()}
                />
              </div>
            </div>
          </section>

          {/* Auto Start */}
          <section>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: 500,
              color: isDark ? '#FFFFFF' : '#1F2937',
            }}>
              Início Automático
            </h3>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                color: isDark ? '#FFFFFF' : '#1F2937',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={localSettings.autoStartBreaks}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    autoStartBreaks: e.target.checked
                  }))}
                  style={getCheckboxStyles()}
                />
                Iniciar pausas automaticamente
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                color: isDark ? '#FFFFFF' : '#1F2937',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={localSettings.autoStartWork}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    autoStartWork: e.target.checked
                  }))}
                  style={getCheckboxStyles()}
                />
                Iniciar trabalho automaticamente
              </label>
            </div>
          </section>

          {/* Notifications */}
          <section>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: 500,
              color: isDark ? '#FFFFFF' : '#1F2937',
            }}>
              Notificações
            </h3>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                color: isDark ? '#FFFFFF' : '#1F2937',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={localSettings.soundEnabled}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    soundEnabled: e.target.checked
                  }))}
                  style={getCheckboxStyles()}
                />
                <Volume2 size={16} strokeWidth={1.7} style={{ marginRight: '8px' }} />
                Som ativado
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                color: isDark ? '#FFFFFF' : '#1F2937',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={localSettings.notificationsEnabled}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    notificationsEnabled: e.target.checked
                  }))}
                  style={getCheckboxStyles()}
                />
                <Bell size={16} strokeWidth={1.7} style={{ marginRight: '8px' }} />
                Notificações do sistema
              </label>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
        }}>
          <button
            onClick={handleReset}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
              borderRadius: '8px',
              color: isDark ? '#A0A0A0' : '#6B7280',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FF6B6B';
              e.currentTarget.style.color = '#FF6B6B';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isDark ? '#2A2A2A' : '#E5E7EB';
              e.currentTarget.style.color = isDark ? '#A0A0A0' : '#6B7280';
            }}
          >
            <RotateCcw size={16} strokeWidth={1.7} />
            Restaurar Padrões
          </button>

          <button
            onClick={handleSave}
            style={{
              padding: '12px 24px',
              backgroundColor: '#00D4AA',
              border: 'none',
              borderRadius: '8px',
              color: '#0A0A0A',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#00B895';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#00D4AA';
            }}
          >
            <Save size={16} strokeWidth={1.7} />
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};