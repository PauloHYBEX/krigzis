/**
 * Sistema de Versionamento e Atualizações
 * Implementa SemVer (Semantic Versioning) e gerenciamento de atualizações
 */

export interface Version {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string; // alpha, beta, rc
  build?: string;
}

export interface VersionInfo {
  version: Version;
  versionString: string; // "1.2.3-beta.1"
  releaseDate: string; // ISO string
  channel: ReleaseChannel;
  changelog?: string;
  downloadUrl?: string;
  checksums?: {
    sha256: string;
    md5: string;
  };
  signature?: string; // Digital signature
  size?: number; // File size in bytes
}

export type ReleaseChannel = 'stable' | 'beta' | 'alpha' | 'nightly';

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: VersionInfo;
  latestVersion?: VersionInfo;
  updateAvailable?: VersionInfo;
  isDowngrade?: boolean;
  lastChecked: string; // ISO string
}

export interface UpdateProgress {
  phase: UpdatePhase;
  percentage: number;
  bytesDownloaded?: number;
  totalBytes?: number;
  speed?: number; // bytes per second
  remainingTime?: number; // seconds
  error?: string;
}

export type UpdatePhase = 
  | 'checking'
  | 'downloading'
  | 'verifying'
  | 'installing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface UpdateSettings {
  autoCheck: boolean;
  autoDownload: boolean;
  autoInstall: boolean;
  checkInterval: number; // hours
  channel: ReleaseChannel;
  notifyOnUpdate: boolean;
  downloadPath?: string;
  lastCheck?: string; // ISO string
  lastUpdate?: string; // ISO string
}

export interface ReleaseInfo {
  version: VersionInfo;
  features: string[];
  bugfixes: string[];
  breaking: string[];
  security: string[];
  notes?: string;
  requirements?: {
    minOSVersion?: string;
    minElectronVersion?: string;
    diskSpace?: number; // MB
  };
}

export interface UpdateManifest {
  latestVersions: {
    stable: VersionInfo;
    beta?: VersionInfo;
    alpha?: VersionInfo;
    nightly?: VersionInfo;
  };
  minimumVersion: string; // Versão mínima suportada
  deprecatedVersions: string[]; // Versões que devem ser atualizadas obrigatoriamente
  releaseNotes: ReleaseInfo[];
  updateServer: {
    baseUrl: string;
    publicKey: string; // Para verificação de assinatura
  };
}

export interface BackupInfo {
  version: string;
  backupPath: string;
  createdAt: string; // ISO string
  size: number;
  verified: boolean;
}

export interface RollbackResult {
  success: boolean;
  restoredVersion?: string;
  error?: string;
  backupUsed?: BackupInfo;
}

// Utilitários para versionamento
export class VersionUtils {
  /**
   * Converte string de versão para objeto Version
   */
  static parseVersion(versionString: string): Version {
    const regex = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/;
    const match = versionString.match(regex);
    
    if (!match) {
      throw new Error(`Invalid version string: ${versionString}`);
    }
    
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4],
      build: match[5]
    };
  }
  
  /**
   * Converte objeto Version para string
   */
  static stringifyVersion(version: Version): string {
    let versionString = `${version.major}.${version.minor}.${version.patch}`;
    
    if (version.prerelease) {
      versionString += `-${version.prerelease}`;
    }
    
    if (version.build) {
      versionString += `+${version.build}`;
    }
    
    return versionString;
  }
  
  /**
   * Compara duas versões (SemVer compliant)
   * @returns -1 se v1 < v2, 0 se v1 === v2, 1 se v1 > v2
   */
  static compareVersions(v1: Version, v2: Version): number {
    // Comparar major
    if (v1.major !== v2.major) {
      return v1.major > v2.major ? 1 : -1;
    }
    
    // Comparar minor
    if (v1.minor !== v2.minor) {
      return v1.minor > v2.minor ? 1 : -1;
    }
    
    // Comparar patch
    if (v1.patch !== v2.patch) {
      return v1.patch > v2.patch ? 1 : -1;
    }
    
    // Comparar prerelease
    if (v1.prerelease && !v2.prerelease) return -1;
    if (!v1.prerelease && v2.prerelease) return 1;
    if (v1.prerelease && v2.prerelease) {
      return v1.prerelease.localeCompare(v2.prerelease);
    }
    
    return 0;
  }
  
  /**
   * Verifica se uma versão é maior que outra
   */
  static isNewerVersion(current: Version, target: Version): boolean {
    return this.compareVersions(target, current) > 0;
  }
  
  /**
   * Verifica se uma versão é compatível com outra (mesmo major.minor)
   */
  static isCompatibleVersion(v1: Version, v2: Version): boolean {
    return v1.major === v2.major && v1.minor === v2.minor;
  }
  
  /**
   * Gera próxima versão baseada no tipo de release
   */
  static getNextVersion(current: Version, releaseType: 'major' | 'minor' | 'patch'): Version {
    const next = { ...current };
    
    switch (releaseType) {
      case 'major':
        next.major += 1;
        next.minor = 0;
        next.patch = 0;
        break;
      case 'minor':
        next.minor += 1;
        next.patch = 0;
        break;
      case 'patch':
        next.patch += 1;
        break;
    }
    
    // Remover prerelease e build ao incrementar
    delete next.prerelease;
    delete next.build;
    
    return next;
  }
  
  /**
   * Valida se uma string de versão é válida
   */
  static isValidVersion(versionString: string): boolean {
    try {
      this.parseVersion(versionString);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Obtém canal de release baseado na versão
   */
  static getChannelFromVersion(version: Version): ReleaseChannel {
    if (!version.prerelease) return 'stable';
    
    const prerelease = version.prerelease.toLowerCase();
    if (prerelease.includes('alpha')) return 'alpha';
    if (prerelease.includes('beta')) return 'beta';
    if (prerelease.includes('nightly')) return 'nightly';
    
    return 'beta'; // Default para prereleases desconhecidos
  }
}

export default VersionUtils;