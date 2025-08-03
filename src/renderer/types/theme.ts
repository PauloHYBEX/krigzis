// Theme System Types

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  borderRadius: 'none' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  fontSize: 'sm' | 'base' | 'lg';
  spacing: 'compact' | 'normal' | 'comfortable';
}

export interface ThemeColors {
  // Backgrounds
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  
  // Surfaces
  surfacePrimary: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  surfaceHover: string;
  surfaceActive: string;
  
  // Primary colors
  primary50: string;
  primary100: string;
  primary200: string;
  primary300: string;
  primary400: string;
  primary500: string;
  primary600: string;
  primary700: string;
  primary800: string;
  primary900: string;
  
  // Secondary colors
  secondary50: string;
  secondary100: string;
  secondary200: string;
  secondary300: string;
  secondary400: string;
  secondary500: string;
  secondary600: string;
  secondary700: string;
  secondary800: string;
  secondary900: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textPlaceholder: string;
  textDisabled: string;
  textInverse: string;
  
  // Border colors
  borderPrimary: string;
  borderSecondary: string;
  borderTertiary: string;
  borderFocus: string;
  borderError: string;
  borderSuccess: string;
  
  // Status colors
  success500: string;
  success600: string;
  warning500: string;
  warning600: string;
  error500: string;
  error600: string;
  info500: string;
  info600: string;
}

export interface ThemeContextType {
  theme: ThemeConfig;
  colors: ThemeColors;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  toggleMode: () => void;
  resetTheme: () => void;
  isSystemDark: boolean;
  effectiveMode: 'light' | 'dark';
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Partial<ThemeConfig>;
  storageKey?: string;
}

// Utility types for component variants
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'gray';
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type RadiusVariant = 'none' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'; 