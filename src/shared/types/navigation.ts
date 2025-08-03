import { TaskStatus } from './task';

export type Screen = 'dashboard' | 'task-list' | 'timer' | 'reports' | 'notes';

export interface NavigationState {
  currentScreen: Screen;
  previousScreen?: Screen;
  params?: Record<string, any>;
  selectedList?: TaskStatus;
} 