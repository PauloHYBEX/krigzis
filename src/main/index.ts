import { app, BrowserWindow, Menu, ipcMain, globalShortcut, dialog, nativeImage } from 'electron';
import * as path from 'path';
import DatabaseManager from './database-manager';
import { SecureLogger, logger, logInfo, logError } from './logging/logger';
import { crashReporterManager } from './logging/crash-reporter';
import { auditLogger } from './logging/audit-logger';
import VersionManager from './version/version-manager';
import UpdateChecker from './version/update-checker';
import UpdateDownloader from './version/update-downloader';

class MainApplication {
  private mainWindow: BrowserWindow | null = null;
  private isDev = !app.isPackaged || process.env.NODE_ENV === 'development';
  private database: DatabaseManager;
  private logger: SecureLogger;
  private versionManager: VersionManager;
  private updateChecker: UpdateChecker;
  private updateDownloader: UpdateDownloader;

  constructor() {
    this.database = DatabaseManager.getInstance();
    this.logger = SecureLogger.getInstance();
    this.versionManager = VersionManager.getInstance();
    this.updateChecker = UpdateChecker.getInstance();
    this.updateDownloader = UpdateDownloader.getInstance();
    
    // Configurar nome da aplicação para notificações
    app.setName('Krigzis');
    
    // Garantir que o app use o nome correto
    if (process.platform === 'win32' || process.platform === 'linux') {
      // No Windows e Linux, definir o app user model ID
      app.setAppUserModelId('com.krigzis.taskmanager');
    }
    
    // Inicializar crash reporter
    crashReporterManager.initialize();
    
    this.setupAppEvents();
    this.setupIpcHandlers();
    this.setupVersionHandlers();
    
    logInfo('Main application initialized', 'system', {
      isDev: this.isDev,
      platform: process.platform,
      version: app.getVersion()
    });
  }

  private setupAppEvents(): void {
    app.whenReady().then(async () => {
      try {
        logInfo('Application starting up', 'system');
        
        // Inicializar banco de dados antes de criar a janela
        await this.database.initialize();
        logInfo(`Database (${this.database.getDatabaseType()}) initialized successfully`, 'database');
        
        this.createMainWindow();
        
        // Configurar menu com atalhos
        this.setupMenu();

        // Registrar atalhos globais apenas em desenvolvimento
        if (this.isDev) {
          this.setupGlobalShortcuts();
        }

        app.on('activate', () => {
          if (BrowserWindow.getAllWindows().length === 0) {
            this.createMainWindow();
          }
        });
        
        logInfo('Application startup completed successfully', 'system');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logError('Failed to initialize database', 'database', { error: errorMessage });
        console.error('❌ Failed to initialize database:', error);
        app.quit();
      }
    });

    app.on('window-all-closed', async () => {
      logInfo('All windows closed, cleaning up', 'system');
      
      // Limpar atalhos globais
      globalShortcut.unregisterAll();
      
      // Fechar conexão com banco antes de sair
      await this.database.close();
      
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('before-quit', async () => {
      logInfo('Application quitting, performing cleanup', 'system');
      
      // Limpar atalhos globais
      globalShortcut.unregisterAll();
      
      // Garantir que o banco seja fechado adequadamente
      await this.database.close();
    });
  }

  private createMainWindow(): void {
    try {
    const resolveIconPath = (): string => {
      const candidates: string[] = [];
      if (process.platform === 'win32') {
        candidates.push(
          // Priorizar icon.ico (multi-size) e depois krigzis.ico
          path.join(__dirname, '../assets/icon.ico'),
          path.join(__dirname, 'assets/icon.ico'),
          path.resolve(process.resourcesPath || '', 'assets/icon.ico'),
          path.resolve(process.cwd(), 'assets/icon.ico'),
          path.resolve(__dirname, '../../assets/icon.ico'),
          path.join(__dirname, '../assets/krigzis.ico'),
          path.join(__dirname, 'assets/krigzis.ico'),
          path.resolve(process.resourcesPath || '', 'assets/krigzis.ico'),
          path.resolve(process.cwd(), 'assets/krigzis.ico'),
          path.resolve(__dirname, '../../assets/krigzis.ico'),
          // PNG fallbacks
          path.join(__dirname, '../assets/icon.png'),
          path.join(__dirname, 'assets/icon.png'),
          path.resolve(process.resourcesPath || '', 'assets/icon.png'),
          path.resolve(process.cwd(), 'assets/icon.png'),
          path.resolve(__dirname, '../../assets/icon.png')
        );
      } else if (process.platform === 'darwin') {
        candidates.push(
          path.join(__dirname, '../assets/icon.icns'),
          path.join(__dirname, 'assets/icon.icns'),
          path.resolve(process.resourcesPath || '', 'assets/icon.icns'),
          path.resolve(process.cwd(), 'assets/icon.icns'),
          path.resolve(__dirname, '../../assets/icon.icns')
        );
      } else {
        candidates.push(
          path.join(__dirname, '../assets/icon.png'),
          path.join(__dirname, 'assets/icon.png'),
          path.resolve(process.resourcesPath || '', 'assets/icon.png'),
          path.resolve(process.cwd(), 'assets/icon.png'),
          path.resolve(__dirname, '../../assets/icon.png')
        );
      }
      const fs = require('fs');
      const found = candidates.find(p => {
        try { return fs.existsSync(p); } catch { return false; }
      });
      if (!found) {
        console.warn('[Icon] No icon found. Candidates checked:', candidates);
        return candidates[0]!;
      }
      console.log('[Icon] Using icon at:', found);
      return found;
    };

    const iconPath = resolveIconPath();

    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      title: 'Krigzis - Gerenciador de Tarefas',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: this.isDev ? false : true, // Only disable in development
        allowRunningInsecureContent: this.isDev ? true : false,
        // Desabilitar DevTools em produção
        devTools: this.isDev
      },
      titleBarStyle: 'default',
      show: false, // Don't show until ready
      backgroundColor: '#0A0A0A', // Dark theme background
      icon: iconPath // Ícone da aplicação por plataforma
    });

    // Refrescar ícone explicitamente (Windows/Linux)
    try {
      const tryPaths = [iconPath,
        // Prefer PNG for runtime setIcon if ICO fails
        path.join(__dirname, '../assets/icon.png'),
        path.join(__dirname, 'assets/icon.png'),
        path.resolve(process.resourcesPath || '', 'assets/icon.png'),
        path.resolve(process.cwd(), 'assets/icon.png'),
        path.resolve(__dirname, '../../assets/icon.png')
      ];
      const fs = require('fs');
      const { nativeImage } = require('electron');
      for (const p of tryPaths) {
        if (!p) continue;
        if (!fs.existsSync(p)) continue;
        const img = nativeImage.createFromPath(p);
        if (!img.isEmpty()) {
          this.mainWindow.setIcon(img);
          console.log('[Icon] setIcon applied from:', p);
          break;
        }
      }
    } catch (e) {
      console.warn('[Icon] setIcon failed:', e);
    }

    // Load the app
    if (this.isDev) {
      // In development, load from webpack-dev-server
      this.mainWindow.loadURL('http://localhost:3000');
      // Abrir DevTools apenas em desenvolvimento
      this.mainWindow.webContents.openDevTools();
    } else {
      // In production, load from file
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // Show window when ready to prevent visual flash
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      
      // Não abrir DevTools em produção
      if (this.isDev) {
        this.mainWindow?.webContents.openDevTools();
      }
        
        // Configurar update checker com a janela principal
        this.updateChecker.setMainWindow(this.mainWindow!);
        
        // Iniciar verificação de atualizações
        this.updateChecker.start();
        
        // Verificar suporte da versão atual
        this.updateChecker.checkVersionSupport().catch(error => {
          logger.error('Failed to check version support', 'system', {
            error: error instanceof Error ? error.message : String(error)
          });
        });
        
        logInfo('Main window ready and shown', 'system');
    });

    this.mainWindow.on('closed', () => {
        logInfo('Main window closed', 'system');
      this.mainWindow = null;
    });
      
      logInfo('Main window created successfully', 'system');
      
      // Adicionar alguns logs de exemplo para demonstrar o sistema
      setTimeout(() => {
        logger.info('Sistema de logging funcionando', 'system', { version: '1.0.0', startup: true });
        logger.warn('Exemplo de aviso do sistema', 'security', { component: 'auth', message: 'Token expirando em breve' });
        logger.debug('Log de debug para desenvolvimento', 'performance', { memoryUsage: '128MB', cpuUsage: '15%' });
        logger.error('Exemplo de erro recuperável', 'database', { query: 'SELECT * FROM tasks', retries: 2 });
        auditLogger.logSettingsChange('demo-user', 'theme', 'light', 'dark');
        auditLogger.logTaskCreation('demo-user', 1, 'Tarefa de exemplo criada pelo sistema');
        auditLogger.logAIAction('demo-user', 'generate_task', 'local', true, { prompt: 'criar tarefa de reunião' });
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logError('Failed to create main window', 'system', { error: errorMessage });
      throw error;
    }
  }

  private setupMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'Arquivo',
        submenu: [
          {
            label: 'Nova Tarefa',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow?.webContents.send('menu-new-task');
            }
          },
          { type: 'separator' },
          {
            label: 'Sair',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Editar',
        submenu: [
          { role: 'undo', label: 'Desfazer' },
          { role: 'redo', label: 'Refazer' },
          { type: 'separator' },
          { role: 'cut', label: 'Recortar' },
          { role: 'copy', label: 'Copiar' },
          { role: 'paste', label: 'Colar' },
          { role: 'selectAll', label: 'Selecionar Tudo' }
        ]
      },
      {
        label: 'Visualizar',
        submenu: [
          { 
            role: 'reload', 
            label: 'Recarregar',
            accelerator: 'CmdOrCtrl+R'
          },
          { 
            role: 'forceReload', 
            label: 'Forçar Recarregamento',
            accelerator: 'CmdOrCtrl+Shift+R'
          },
          // Exibir DevTools apenas no modo desenvolvimento
          ...(this.isDev ? [{ 
            role: 'toggleDevTools', 
            label: 'Ferramentas do Desenvolvedor',
            accelerator: process.platform === 'darwin' ? 'Cmd+Alt+I' : 'Ctrl+Shift+I'
          } as Electron.MenuItemConstructorOptions] : []),
          { type: 'separator' },
          { role: 'resetZoom', label: 'Zoom Normal' },
          { role: 'zoomIn', label: 'Aumentar Zoom' },
          { role: 'zoomOut', label: 'Diminuir Zoom' },
          { type: 'separator' },
          { role: 'togglefullscreen', label: 'Tela Cheia' }
        ]
      },
      {
        label: 'Janela',
        submenu: [
          { role: 'minimize', label: 'Minimizar' },
          { role: 'close', label: 'Fechar' }
        ]
      }
    ];

    // Adicionar menu específico para macOS
    if (process.platform === 'darwin') {
      template.unshift({
        label: app.getName(),
        submenu: [
          { role: 'about', label: 'Sobre' },
          { type: 'separator' },
          { role: 'services', label: 'Serviços' },
          { type: 'separator' },
          { role: 'hide', label: 'Ocultar' },
          { role: 'hideOthers', label: 'Ocultar Outros' },
          { role: 'unhide', label: 'Mostrar Tudo' },
          { type: 'separator' },
          { role: 'quit', label: 'Sair' }
        ]
      });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  private setupIpcHandlers(): void {
    // Task operations
    ipcMain.handle('tasks:getAll', async () => {
      try {
        return await this.database.getAllTasks();
      } catch (error) {
        console.error('Error getting all tasks:', error);
        throw error;
      }
    });

    ipcMain.handle('tasks:getByStatus', async (event, status) => {
      try {
        return await this.database.getTasksByStatus(status);
      } catch (error) {
        console.error('Error getting tasks by status:', error);
        throw error;
      }
    });

    ipcMain.handle('tasks:create', async (event, taskData) => {
      try {
        return await this.database.createTask(taskData);
      } catch (error) {
        console.error('Error creating task:', error);
        throw error;
      }
    });

    ipcMain.handle('tasks:update', async (event, id, updates) => {
      try {
        return await this.database.updateTask(id, updates);
      } catch (error) {
        console.error('Error updating task:', error);
        throw error;
      }
    });

    ipcMain.handle('tasks:delete', async (event, id) => {
      try {
        return await this.database.deleteTask(id);
      } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
      }
    });

    ipcMain.handle('tasks:getStats', async () => {
      try {
        return await this.database.getTaskStats();
      } catch (error) {
        console.error('Error getting task stats:', error);
        throw error;
      }
    });

    ipcMain.handle('tasks:clearAll', async () => {
      try {
        return await this.database.clearAllTasks();
      } catch (error) {
        console.error('Error clearing all tasks:', error);
        throw error;
      }
    });

    // Database handlers (unified for tasks and notes)
    ipcMain.handle('database:getAllTasks', async () => {
      try {
        return await this.database.getAllTasks();
      } catch (error) {
        console.error('Error getting all tasks:', error);
        throw error;
      }
    });

    ipcMain.handle('database:getTasksByStatus', async (event, status) => {
      try {
        return await this.database.getTasksByStatus(status);
      } catch (error) {
        console.error('Error getting tasks by status:', error);
        throw error;
      }
    });

    ipcMain.handle('database:createTask', async (event, taskData) => {
      try {
        return await this.database.createTask(taskData);
      } catch (error) {
        console.error('Error creating task:', error);
        throw error;
      }
    });

    ipcMain.handle('database:updateTask', async (event, id, updates) => {
      try {
        return await this.database.updateTask(id, updates);
      } catch (error) {
        console.error('Error updating task:', error);
        throw error;
      }
    });

    ipcMain.handle('database:deleteTask', async (event, id) => {
      try {
      return await this.database.deleteTask(id);
      } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
      }
    });

    ipcMain.handle('database:getTaskStats', async () => {
      try {
        return await this.database.getTaskStats();
      } catch (error) {
        console.error('Error getting task stats:', error);
        throw error;
      }
    });

    // Note handlers
    ipcMain.handle('database:getAllNotes', async () => {
      try {
        return await this.database.getAllNotes();
      } catch (error) {
        console.error('Error getting all notes:', error);
        throw error;
      }
    });

    ipcMain.handle('database:getNoteById', async (event, id) => {
      try {
        return await this.database.getNoteById(id);
      } catch (error) {
        console.error('Error getting note by id:', error);
        throw error;
      }
    });

    ipcMain.handle('database:createNote', async (event, noteData) => {
      try {
        return await this.database.createNote(noteData);
      } catch (error) {
        console.error('Error creating note:', error);
        throw error;
      }
    });

    ipcMain.handle('database:updateNote', async (event, id, updates) => {
      try {
        return await this.database.updateNote(id, updates);
      } catch (error) {
        console.error('Error updating note:', error);
        throw error;
      }
    });

    ipcMain.handle('database:deleteNote', async (event, id) => {
      try {
        return await this.database.deleteNote(id);
      } catch (error) {
        console.error('Error deleting note:', error);
        throw error;
      }
    });

    ipcMain.handle('database:getNoteStats', async () => {
      try {
        return await this.database.getNoteStats();
      } catch (error) {
        console.error('Error getting note stats:', error);
        throw error;
      }
    });

    // Backup/export handlers
    ipcMain.handle('database:exportData', async () => {
      try {
        return await this.database.exportData();
      } catch (error) {
        console.error('Error exporting data:', error);
        throw error;
      }
    });

    ipcMain.handle('database:importData', async (event, jsonData: string) => {
      try {
        await this.database.importData(jsonData);
        return { success: true };
      } catch (error) {
        console.error('Error importing data:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    });

    ipcMain.handle('database:linkNoteToTask', async (event, noteId, taskId) => {
      try {
        return await this.database.linkNoteToTask(noteId, taskId);
      } catch (error) {
        console.error('Error linking note to task:', error);
        throw error;
      }
    });

    ipcMain.handle('database:unlinkNoteFromTask', async (event, noteId) => {
      try {
        return await this.database.unlinkNoteFromTask(noteId);
      } catch (error) {
        console.error('Error unlinking note from task:', error);
        throw error;
      }
    });

    // Novos handlers para controle de vínculos task->note
    ipcMain.handle('database:linkTaskToNote', async (event, taskId, noteId) => {
      try {
        return await this.database.linkTaskToNote(taskId, noteId);
      } catch (error) {
        console.error('Error linking task to note:', error);
        throw error;
      }
    });

    ipcMain.handle('database:unlinkTaskFromNote', async (event, taskId) => {
      try {
        return await this.database.unlinkTaskFromNote(taskId);
      } catch (error) {
        console.error('Error unlinking task from note:', error);
        throw error;
      }
    });

    // System handlers
    ipcMain.on('app:getVersion', (event) => {
      event.returnValue = app.getVersion();
    });

    // File system handlers
    ipcMain.handle('system:selectFolder', async () => {
      try {
        const result = await dialog.showOpenDialog(this.mainWindow!, {
          title: 'Selecionar Pasta para Dados',
          properties: ['openDirectory', 'createDirectory'],
          buttonLabel: 'Selecionar Pasta'
        });
        
        logInfo('Folder selection dialog completed', 'system', {
          canceled: result.canceled,
          pathsCount: result.filePaths?.length || 0
        });
        
        return result;
      } catch (error) {
        logError('Failed to show folder selection dialog', 'system', {
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    });

    // Settings operations will be implemented when needed

    // Logging handlers
    ipcMain.handle('logging:logAction', async (event, data) => {
      try {
        auditLogger.logAction(data);
        return { success: true };
      } catch (error) {
        console.error('Error logging action:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    });

    ipcMain.handle('logging:logTaskCreation', async (event, userId, taskId, taskTitle) => {
      try {
        auditLogger.logTaskCreation(userId, taskId, taskTitle);
        return { success: true };
      } catch (error) {
        console.error('Error logging task creation:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    });

    ipcMain.handle('logging:logTaskUpdate', async (event, userId, taskId, changes) => {
      try {
        auditLogger.logTaskUpdate(userId, taskId, changes);
        return { success: true };
      } catch (error) {
        console.error('Error logging task update:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    });

    ipcMain.handle('logging:logTaskDeletion', async (event, userId, taskId, taskTitle) => {
      try {
        auditLogger.logTaskDeletion(userId, taskId, taskTitle);
        return { success: true };
      } catch (error) {
        console.error('Error logging task deletion:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    });

    ipcMain.handle('logging:logCategoryCreation', async (event, userId, categoryId, categoryName) => {
      try {
        auditLogger.logCategoryCreation(userId, categoryId, categoryName);
        return { success: true };
      } catch (error) {
        console.error('Error logging category creation:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    });

    ipcMain.handle('logging:logCategoryUpdate', async (event, userId, categoryId, changes) => {
      try {
        auditLogger.logCategoryUpdate(userId, categoryId, changes);
        return { success: true };
      } catch (error) {
        console.error('Error logging category update:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    });

    ipcMain.handle('logging:logCategoryDeletion', async (event, userId, categoryId, categoryName) => {
      try {
        auditLogger.logCategoryDeletion(userId, categoryId, categoryName);
        return { success: true };
      } catch (error) {
        console.error('Error logging category deletion:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    });

    ipcMain.handle('logging:logAIAction', async (event, userId, action, provider, success, details) => {
      try {
        auditLogger.logAIAction(userId, action, provider, success, details);
        return { success: true };
      } catch (error) {
        console.error('Error logging AI action:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    });

    ipcMain.handle('logging:logSettingsChange', async (event, userId, setting, oldValue, newValue) => {
      try {
        auditLogger.logSettingsChange(userId, setting, oldValue, newValue);
        return { success: true };
      } catch (error) {
        console.error('Error logging settings change:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    });

    ipcMain.handle('logging:logError', async (event, userId, errorMessage, errorStack, context) => {
      try {
        const error = new Error(errorMessage);
        error.stack = errorStack;
        auditLogger.logError(userId, error, context);
        return { success: true };
      } catch (error) {
        console.error('Error logging error:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    });

    // Novos handlers para recuperar logs
    ipcMain.handle('logging:getLogs', async (event, options) => {
      try {
        return logger.getLogs(options);
      } catch (error) {
        console.error('Error getting logs:', error);
        return [];
      }
    });

    ipcMain.handle('logging:getCrashReports', async (event, options) => {
      try {
        return crashReporterManager.getCrashReports(options);
      } catch (error) {
        console.error('Error getting crash reports:', error);
        return [];
      }
    });

    ipcMain.handle('logging:getLogStats', async () => {
      try {
        return logger.getLogStats();
      } catch (error) {
        console.error('Error getting log stats:', error);
        return { total: 0, byLevel: {}, byCategory: {} };
      }
    });

    ipcMain.handle('logging:clearLogs', async (event, olderThan) => {
      try {
        const date = olderThan ? new Date(olderThan) : undefined;
        return logger.clearLogs(date);
      } catch (error) {
        console.error('Error clearing logs:', error);
        return 0;
      }
    });

    ipcMain.handle('logging:exportLogs', async (event, options) => {
      try {
        const processedOptions = {
          ...options,
          startDate: options?.startDate ? new Date(options.startDate) : undefined,
          endDate: options?.endDate ? new Date(options.endDate) : undefined
        };
        return logger.exportLogs(processedOptions);
      } catch (error) {
        console.error('Error exporting logs:', error);
        return JSON.stringify({ error: 'Failed to export logs' });
      }
    });
  }

  private setupVersionHandlers(): void {
    // Handlers para operações de versionamento e atualização
    
    // Obter versão atual
    ipcMain.handle('version:getCurrentVersion', async () => {
      try {
        return this.versionManager.getCurrentVersion();
      } catch (error) {
        logger.error('Failed to get current version', 'system', {
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    });
    
    // Obter configurações de atualização
    ipcMain.handle('version:getUpdateSettings', async () => {
      try {
        return this.versionManager.getUpdateSettings();
      } catch (error) {
        logger.error('Failed to get update settings', 'system', {
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    });
    
    // Atualizar configurações de atualização
    ipcMain.handle('version:updateSettings', async (event, settings) => {
      try {
        this.versionManager.updateSettings(settings);
        this.updateChecker.updateSettings(settings);
        
        auditLogger.logSettingsChange('system', 'updateSettings', {}, settings);
        
        return { success: true };
      } catch (error) {
        logger.error('Failed to update version settings', 'system', {
          error: error instanceof Error ? error.message : String(error),
          settings
        });
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    });
    
    // Verificar atualizações manualmente
    ipcMain.handle('version:checkForUpdates', async (event, force = false) => {
      try {
        const result = await this.updateChecker.checkForUpdates(force);
        
        auditLogger.logAction({
          action: 'manual_update_check',
          resource: 'version',
          userId: 'system',
          success: true,
          details: {
            hasUpdate: result.hasUpdate,
            currentVersion: result.currentVersion.versionString,
            latestVersion: result.latestVersion?.versionString,
            force
          }
        });
        
        return result;
      } catch (error) {
        logger.error('Failed to check for updates', 'system', {
          error: error instanceof Error ? error.message : String(error),
          force
        });
        
        auditLogger.logAction({
          action: 'manual_update_check',
          resource: 'version',
          userId: 'system',
          success: false,
          details: {
            error: error instanceof Error ? error.message : String(error),
            force
          }
        });
        
        throw error;
      }
    });
    
    // Obter status do verificador de atualizações
    ipcMain.handle('version:getUpdateStatus', async () => {
      try {
        return {
          checker: this.updateChecker.getStatus(),
          version: this.versionManager.getSystemInfo()
        };
      } catch (error) {
        logger.error('Failed to get update status', 'system', {
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    });
    
    // Verificar se está verificando atualizações
    ipcMain.handle('version:isCheckingForUpdates', async () => {
      try {
        return this.updateChecker.isCheckingForUpdates();
      } catch (error) {
        logger.error('Failed to check update status', 'system', {
          error: error instanceof Error ? error.message : String(error)
        });
        return false;
      }
    });
    
    // Forçar verificação de atualizações
    ipcMain.handle('version:forceCheck', async () => {
      try {
        const result = await this.updateChecker.forceCheck();
        
        auditLogger.logAction({
          action: 'force_update_check',
          resource: 'version',
          userId: 'system',
          success: true,
          details: {
            hasUpdate: result.hasUpdate,
            currentVersion: result.currentVersion.versionString,
            latestVersion: result.latestVersion?.versionString
          }
        });
        
        return result;
      } catch (error) {
        logger.error('Failed to force update check', 'system', {
          error: error instanceof Error ? error.message : String(error)
        });
        
        auditLogger.logAction({
          action: 'force_update_check',
          resource: 'version',
          userId: 'system',
          success: false,
          details: {
            error: error instanceof Error ? error.message : String(error)
          }
        });
        
        throw error;
      }
    });
    
    // Handlers para download de atualizações
    ipcMain.handle('update:download', async (event, updateInfo) => {
      try {
        logger.info('Starting update download', 'update-download', { updateInfo });
        
        const result = await this.updateDownloader.downloadUpdate(updateInfo);
        
        if (result.success) {
          logger.info('Update download completed successfully', 'update-download', {
            filePath: result.filePath,
            verified: result.verified
          });
        }
        
        return result;
      } catch (error) {
        logger.error('Update download failed', 'update-download', {
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    });

    ipcMain.handle('update:cancelDownload', async () => {
      this.updateDownloader.cancelDownload();
      logger.info('Update download cancelled', 'update-download');
      return { success: true };
    });

    ipcMain.handle('update:isDownloading', async () => {
      return this.updateDownloader.isDownloading();
    });

    ipcMain.handle('update:cleanupOldDownloads', async (event, keepLast = 3) => {
      try {
        this.updateDownloader.cleanupOldDownloads(keepLast);
        logger.info('Old downloads cleaned up', 'update-download', { keepLast });
        return { success: true };
      } catch (error) {
        logger.error('Failed to cleanup old downloads', 'update-download', {
          error: error instanceof Error ? error.message : String(error)
        });
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    });
    
    logger.info('Version handlers configured', 'system');
  }

  private setupGlobalShortcuts(): void {
    // Registrar atalhos globais para DevTools
    const devToolsShortcut = process.platform === 'darwin' ? 'Cmd+Alt+I' : 'Ctrl+Shift+I';
    
    globalShortcut.register(devToolsShortcut, () => {
      if (this.mainWindow) {
        this.mainWindow.webContents.toggleDevTools();
      }
    });

    // Registrar F12 como alternativa
    globalShortcut.register('F12', () => {
      if (this.mainWindow) {
        this.mainWindow.webContents.toggleDevTools();
      }
    });

    // Registrar Ctrl+R para reload
    const reloadShortcut = process.platform === 'darwin' ? 'Cmd+R' : 'Ctrl+R';
    globalShortcut.register(reloadShortcut, () => {
      if (this.mainWindow) {
        this.mainWindow.webContents.reload();
      }
    });

    // Registrar Ctrl+Shift+R para force reload
    const forceReloadShortcut = process.platform === 'darwin' ? 'Cmd+Shift+R' : 'Ctrl+Shift+R';
    globalShortcut.register(forceReloadShortcut, () => {
      if (this.mainWindow) {
        this.mainWindow.webContents.reloadIgnoringCache();
      }
    });
  }
}

// Initialize the application
new MainApplication(); 