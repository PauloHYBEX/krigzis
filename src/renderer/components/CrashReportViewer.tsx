import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useTheme } from '../hooks/useTheme';
import { useLogging } from '../hooks/useLogging';

interface CrashReport {
  id: string;
  timestamp: string;
  version: string;
  platform: string;
  arch: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: {
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
      arrayBuffers: number;
    };
    cpuUsage: {
      user: number;
      system: number;
    };
    uptime: number;
  };
  userData: {
    sessionId: string;
    userId?: string;
    lastAction?: string;
  };
}

interface CrashReportViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrashReportViewer: React.FC<CrashReportViewerProps> = ({ isOpen, onClose }) => {
  const { effectiveMode } = useTheme();
  const { logAction } = useLogging();
  const [crashReports, setCrashReports] = useState<CrashReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CrashReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isDark = effectiveMode === 'dark';

  useEffect(() => {
    if (isOpen) {
      loadCrashReports();
      logAction('crash_reports_viewed', 'logging');
    }
  }, [isOpen]);

  const loadCrashReports = async () => {
    setIsLoading(true);
    try {
      const electronAPI: any = (window as any).electronAPI;
      if (electronAPI?.logging?.getCrashReports) {
        const reports = await electronAPI.logging.getCrashReports({ limit: 50 });
        setCrashReports(Array.isArray(reports) ? reports : []);
      } else {
        setCrashReports([]);
      }
    } catch (error) {
      console.error('Erro ao carregar crash reports:', error);
      setCrashReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportCrashReports = () => {
    try {
      const reportData = JSON.stringify(crashReports, null, 2);
      const blob = new Blob([reportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `krigzis-crash-reports-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      logAction('crash_reports_exported', 'logging', { count: crashReports.length });
    } catch (error) {
      console.error('Erro ao exportar crash reports:', error);
    }
  };

  const clearCrashReports = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os crash reports?')) {
      setCrashReports([]);
      setSelectedReport(null);
      logAction('crash_reports_cleared', 'logging');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const formatMemoryUsage = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Crash Reports
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Relatórios de crashes e erros críticos
            </p>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            ✕
          </Button>
        </div>

        {/* Actions */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <Button onClick={loadCrashReports} disabled={isLoading}>
              {isLoading ? 'Carregando...' : 'Atualizar'}
            </Button>
            <Button onClick={exportCrashReports} variant="secondary">
              Exportar
            </Button>
            <Button onClick={clearCrashReports} variant="danger">
              Limpar
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Reports List */}
            <div className="border-r border-gray-200 dark:border-gray-700 overflow-auto">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Relatórios ({crashReports.length})
                </h3>
                
                {crashReports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {isLoading ? 'Carregando crash reports...' : 'Nenhum crash report encontrado'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {crashReports.map((report) => (
                      <Card 
                        key={report.id} 
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedReport?.id === report.id 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="danger" className="text-xs">
                            CRASH
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimestamp(report.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {report.error.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {report.error.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>v{report.version}</span>
                          <span>•</span>
                          <span>{report.platform}</span>
                          <span>•</span>
                          <span>{report.arch}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Report Details */}
            <div className="overflow-auto">
              {selectedReport ? (
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Detalhes do Crash
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Informações Básicas
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">ID:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedReport.id}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Versão:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedReport.version}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Plataforma:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedReport.platform}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Arquitetura:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedReport.arch}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Data/Hora:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{formatTimestamp(selectedReport.timestamp)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{formatUptime(selectedReport.context.uptime)}</span>
                        </div>
                      </div>
                    </Card>

                    {/* Error Details */}
                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Detalhes do Erro
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                          <span className="ml-2 text-red-600 dark:text-red-400 font-medium">{selectedReport.error.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Mensagem:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedReport.error.message}</span>
                        </div>
                        {selectedReport.error.stack && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Stack Trace:</span>
                            <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                              {selectedReport.error.stack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* System Context */}
                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Contexto do Sistema
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Memória RSS:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{formatMemoryUsage(selectedReport.context.memoryUsage.rss)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Heap Total:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{formatMemoryUsage(selectedReport.context.memoryUsage.heapTotal)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Heap Usado:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{formatMemoryUsage(selectedReport.context.memoryUsage.heapUsed)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">CPU User:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedReport.context.cpuUsage.user}ms</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">CPU System:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedReport.context.cpuUsage.system}ms</span>
                        </div>
                      </div>
                    </Card>

                    {/* User Context */}
                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Contexto do Usuário
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Session ID:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedReport.userData.sessionId}</span>
                        </div>
                        {selectedReport.userData.userId && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{selectedReport.userData.userId}</span>
                          </div>
                        )}
                        {selectedReport.userData.lastAction && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Última Ação:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{selectedReport.userData.lastAction}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  Selecione um crash report para ver os detalhes
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 