import { crashReporter as electronCrashReporter, app } from 'electron';
import path from 'path';
import fs from 'fs';
import { SecureLogger } from './logger';
import { SecurityLogEntry } from '../../shared/types/logging';

export interface CrashReport {
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
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    uptime: number;
  };
  userData: {
    sessionId: string;
    userId?: string;
    lastAction?: string;
  };
}

export class CrashReporterManager {
  private static instance: CrashReporterManager;
  private logger: SecureLogger;
  private crashReportsPath: string;
  private isInitialized: boolean = false;

  private constructor() {
    this.logger = SecureLogger.getInstance();
    this.crashReportsPath = this.getCrashReportsPath();
  }

  public static getInstance(): CrashReporterManager {
    if (!CrashReporterManager.instance) {
      CrashReporterManager.instance = new CrashReporterManager();
    }
    return CrashReporterManager.instance;
  }

  private getCrashReportsPath(): string {
    const userDataPath = app.getPath('userData');
    const crashDir = path.join(userDataPath, 'crash-reports');
    
    if (!fs.existsSync(crashDir)) {
      fs.mkdirSync(crashDir, { recursive: true });
    }
    
    return crashDir;
  }

  public initialize(): void {
    if (this.isInitialized) return;

    try {
      // Configurar crash reporter do Electron
      electronCrashReporter.start({
        productName: 'Krigzis',
        companyName: 'Krigzis Team',
        submitURL: '', // Não enviar automaticamente - manter privacidade
        uploadToServer: false,
        ignoreSystemCrashHandler: false,
        extra: {
          version: app.getVersion(),
          platform: process.platform,
          arch: process.arch
        }
      });

      // Configurar handlers de erro globais
      this.setupGlobalErrorHandlers();
      
      this.isInitialized = true;
      this.logger.security({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Crash reporter initialized',
        category: 'security',
        event: 'api_call',
        severity: 'low',
        source: 'crash-reporter'
      });

    } catch (error) {
      console.error('Failed to initialize crash reporter:', error);
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Handler para erros não capturados
    process.on('uncaughtException', (error) => {
      this.handleCrash('uncaughtException', error);
    });

    // Handler para promises rejeitadas
    process.on('unhandledRejection', (reason, promise) => {
      this.handleCrash('unhandledRejection', reason as Error);
    });

    // Handler para erros de renderer
    app.on('render-process-gone', (event, webContents, details) => {
      this.handleRendererCrash(details);
    });

    // Handler para crashes do processo principal
    app.on('child-process-gone', (event, details) => {
      this.handleChildProcessCrash(details);
    });
  }

  private handleCrash(type: string, error: Error): void {
    try {
      const crashReport: CrashReport = {
        id: this.generateCrashId(),
        timestamp: new Date().toISOString(),
        version: app.getVersion(),
        platform: process.platform,
        arch: process.arch,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        context: {
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
          uptime: process.uptime()
        },
        userData: {
          sessionId: this.logger.getConfig().enabled ? 'session-id' : 'unknown',
          lastAction: this.getLastAction()
        }
      };

      this.saveCrashReport(crashReport);
      this.logCrash(crashReport);

    } catch (reportError) {
      console.error('Failed to handle crash:', reportError);
    }
  }

  private handleRendererCrash(details: any): void {
    const crashReport: CrashReport = {
      id: this.generateCrashId(),
      timestamp: new Date().toISOString(),
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      error: {
        name: 'RendererProcessGone',
        message: `Renderer process gone: ${details.reason}`,
        stack: details.exitCode?.toString()
      },
      context: {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        uptime: process.uptime()
      },
      userData: {
        sessionId: this.logger.getConfig().enabled ? 'session-id' : 'unknown'
      }
    };

    this.saveCrashReport(crashReport);
    this.logCrash(crashReport);
  }

  private handleChildProcessCrash(details: any): void {
    const crashReport: CrashReport = {
      id: this.generateCrashId(),
      timestamp: new Date().toISOString(),
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      error: {
        name: 'ChildProcessGone',
        message: `Child process gone: ${details.type}`,
        stack: details.exitCode?.toString()
      },
      context: {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        uptime: process.uptime()
      },
      userData: {
        sessionId: this.logger.getConfig().enabled ? 'session-id' : 'unknown'
      }
    };

    this.saveCrashReport(crashReport);
    this.logCrash(crashReport);
  }

  private generateCrashId(): string {
    return `crash-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getLastAction(): string {
    // Implementar rastreamento da última ação do usuário
    return 'unknown';
  }

  private saveCrashReport(crashReport: CrashReport): void {
    try {
      const fileName = `crash-${crashReport.id}.json`;
      const filePath = path.join(this.crashReportsPath, fileName);
      
      fs.writeFileSync(filePath, JSON.stringify(crashReport, null, 2));
      
      // Manter apenas os últimos 10 relatórios
      this.cleanupOldCrashReports();
      
    } catch (error) {
      console.error('Failed to save crash report:', error);
    }
  }

  private logCrash(crashReport: CrashReport): void {
    const securityEntry: SecurityLogEntry = {
      timestamp: crashReport.timestamp,
      level: 'error',
      message: `Application crash: ${crashReport.error.name}`,
      category: 'security',
      event: 'suspicious_activity',
      severity: 'critical',
      source: 'crash-reporter',
      data: {
        crashId: crashReport.id,
        errorName: crashReport.error.name,
        errorMessage: crashReport.error.message
      }
    };

    this.logger.security(securityEntry);
  }

  private cleanupOldCrashReports(): void {
    try {
      const files = fs.readdirSync(this.crashReportsPath);
      const crashFiles = files.filter(file => file.startsWith('crash-') && file.endsWith('.json'));
      
      if (crashFiles.length > 10) {
        // Ordenar por data de modificação e remover os mais antigos
        const sortedFiles = crashFiles
          .map(file => ({
            name: file,
            path: path.join(this.crashReportsPath, file),
            mtime: fs.statSync(path.join(this.crashReportsPath, file)).mtime
          }))
          .sort((a, b) => a.mtime.getTime() - b.mtime.getTime());
        
        // Remover arquivos antigos
        const filesToRemove = sortedFiles.slice(0, sortedFiles.length - 10);
        filesToRemove.forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
    } catch (error) {
      console.error('Failed to cleanup old crash reports:', error);
    }
  }

  public getCrashReports(options: {
    limit?: number;
    offset?: number;
  } = {}): CrashReport[] {
    try {
      const files = fs.readdirSync(this.crashReportsPath);
      const crashFiles = files.filter(file => file.startsWith('crash-') && file.endsWith('.json'));
      
      const reports = crashFiles.map(file => {
        const filePath = path.join(this.crashReportsPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content) as CrashReport;
      }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Aplicar paginação
      const offset = options.offset || 0;
      const limit = options.limit || 50;
      
      return reports.slice(offset, offset + limit);
      
    } catch (error) {
      console.error('Failed to get crash reports:', error);
      return [];
    }
  }

  public clearCrashReports(): void {
    try {
      const files = fs.readdirSync(this.crashReportsPath);
      const crashFiles = files.filter(file => file.startsWith('crash-') && file.endsWith('.json'));
      
      crashFiles.forEach(file => {
        const filePath = path.join(this.crashReportsPath, file);
        fs.unlinkSync(filePath);
      });
      
    } catch (error) {
      console.error('Failed to clear crash reports:', error);
    }
  }

  public exportCrashReports(): string {
    const reports = this.getCrashReports();
    return JSON.stringify(reports, null, 2);
  }
}

// Instância global
export const crashReporterManager = CrashReporterManager.getInstance(); 