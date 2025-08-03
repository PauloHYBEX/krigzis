import React, { useState, useEffect } from 'react';
import { Download, X, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';

interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: {
    versionString: string;
  };
  latestVersion?: {
    versionString: string;
  };
  releaseNotes?: string;
  isMandatory?: boolean;
  supported?: boolean;
  deprecationMessage?: string;
}

interface DownloadProgress {
  percent: number;
  transferred: number;
  total: number;
  speed: number;
  eta: number;
}

interface UpdateNotificationProps {
  isDark: boolean;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ isDark }) => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkForUpdates();
    
    // Verificar atualizações a cada 30 minutos
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.version?.checkForUpdates) {
        const update = await electronAPI.version.checkForUpdates(false);
        
        if (update.hasUpdate) {
          setUpdateInfo(update);
          setShowNotification(true);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    }
  };

  const handleDownload = async () => {
    if (!updateInfo) return;

    try {
      setIsDownloading(true);
      setError(null);
      
      const electronAPI = (window as any).electronAPI;
      
      // Simular eventos de progresso (em produção, usar IPC events)
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (!prev) {
            return { percent: 10, transferred: 5242880, total: 52428800, speed: 1048576, eta: 45 };
          }
          
          if (prev.percent >= 100) {
            clearInterval(progressInterval);
            setIsDownloading(false);
            setDownloadComplete(true);
            return prev;
          }
          
          return {
            ...prev,
            percent: Math.min(prev.percent + Math.random() * 15, 100),
            transferred: Math.min(prev.transferred + Math.random() * 2097152, prev.total),
            eta: Math.max(prev.eta - 2, 0)
          };
        });
      }, 500);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao baixar atualização');
      setIsDownloading(false);
    }
  };

  const handleInstall = () => {
    // Em produção, reiniciar aplicação e aplicar update
    if (confirm('A aplicação será reiniciada para aplicar a atualização. Continuar?')) {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.system?.restart) {
        electronAPI.system.restart();
      }
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return formatBytes(bytesPerSecond) + '/s';
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (!showNotification || !updateInfo) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '400px',
      backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
      border: `1px solid ${isDark ? '#404040' : '#e0e0e0'}`,
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      zIndex: 10000,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: `1px solid ${isDark ? '#404040' : '#e0e0e0'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {updateInfo.isMandatory ? (
            <AlertTriangle size={20} color="#ff6b35" />
          ) : (
            <Download size={20} color={isDark ? '#4fb3d9' : '#2196F3'} />
          )}
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: isDark ? '#ffffff' : '#1a1a1a'
          }}>
            {updateInfo.isMandatory ? 'Atualização Obrigatória' : 'Nova Atualização Disponível'}
          </h3>
        </div>
        
        {!updateInfo.isMandatory && (
          <button
            onClick={() => setShowNotification(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              color: isDark ? '#888888' : '#666666'
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        <div style={{
          marginBottom: '12px',
          color: isDark ? '#cccccc' : '#333333',
          fontSize: '14px'
        }}>
          <strong>Versão atual:</strong> {updateInfo.currentVersion.versionString}
          <br />
          <strong>Nova versão:</strong> {updateInfo.latestVersion?.versionString}
        </div>

        {updateInfo.releaseNotes && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
            borderRadius: '8px',
            fontSize: '13px',
            color: isDark ? '#cccccc' : '#333333',
            maxHeight: '120px',
            overflowY: 'auto'
          }}>
            <strong>Novidades:</strong>
            <div style={{ marginTop: '4px' }}>
              {updateInfo.releaseNotes}
            </div>
          </div>
        )}

        {updateInfo.deprecationMessage && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#856404'
          }}>
            <strong>Aviso:</strong> {updateInfo.deprecationMessage}
          </div>
        )}

        {/* Download Progress */}
        {isDownloading && downloadProgress && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
              fontSize: '13px',
              color: isDark ? '#cccccc' : '#333333'
            }}>
              <span>Baixando... {downloadProgress.percent}%</span>
              <span>{formatSpeed(downloadProgress.speed)}</span>
            </div>
            
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: isDark ? '#404040' : '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${downloadProgress.percent}%`,
                height: '100%',
                backgroundColor: '#4fb3d9',
                transition: 'width 0.3s ease'
              }} />
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '4px',
              fontSize: '12px',
              color: isDark ? '#888888' : '#666666'
            }}>
              <span>{formatBytes(downloadProgress.transferred)} / {formatBytes(downloadProgress.total)}</span>
              <span>ETA: {formatTime(downloadProgress.eta)}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#721c24'
          }}>
            <strong>Erro:</strong> {error}
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end'
        }}>
          {!isDownloading && !downloadComplete && (
            <>
              {!updateInfo.isMandatory && (
                <button
                  onClick={() => setShowNotification(false)}
                  style={{
                    padding: '8px 16px',
                    border: `1px solid ${isDark ? '#404040' : '#e0e0e0'}`,
                    borderRadius: '6px',
                    backgroundColor: 'transparent',
                    color: isDark ? '#cccccc' : '#333333',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Depois
                </button>
              )}
              
              <button
                onClick={handleDownload}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#4fb3d9',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} />
                Baixar Agora
              </button>
            </>
          )}

          {isDownloading && (
            <button
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#6c757d',
                color: '#ffffff',
                cursor: 'not-allowed',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              disabled
            >
              <RefreshCw size={14} className="spin" />
              Baixando...
            </button>
          )}

          {downloadComplete && (
            <button
              onClick={handleInstall}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#28a745',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle size={14} />
              Instalar e Reiniciar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;