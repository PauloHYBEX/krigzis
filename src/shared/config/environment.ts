export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production';
  APP_VERSION: string;
  BUILD_DATE: string;
  IS_DEV: boolean;
  IS_PACKAGED: boolean;
  USER_DATA_PATH: string;
  APP_DATA_PATH: string;
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  const isPackaged = process.env.NODE_ENV === 'production' || process.resourcesPath !== undefined;
  
  // Garantir que NODE_ENV seja sempre 'development' ou 'production'
  const nodeEnv = (process.env.NODE_ENV === 'production' ? 'production' : 'development') as 'development' | 'production';
  
  return {
    NODE_ENV: nodeEnv,
    APP_VERSION: process.env.npm_package_version || '1.0.0',
    BUILD_DATE: process.env.BUILD_DATE || new Date().toISOString(),
    IS_DEV: nodeEnv === 'development',
    IS_PACKAGED: isPackaged,
    USER_DATA_PATH: process.env.APPDATA || process.env.HOME || process.cwd(),
    APP_DATA_PATH: isPackaged ? process.resourcesPath : process.cwd()
  };
};

export const isProduction = (): boolean => {
  return getEnvironmentConfig().NODE_ENV === 'production';
};

export const isDevelopment = (): boolean => {
  return getEnvironmentConfig().NODE_ENV === 'development';
};

export const getAppVersion = (): string => {
  return getEnvironmentConfig().APP_VERSION;
};

export const getBuildDate = (): string => {
  return getEnvironmentConfig().BUILD_DATE;
}; 