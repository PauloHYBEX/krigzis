import { useEffect, useState, useCallback } from 'react';

export type NotificationPermission = 'default' | 'granted' | 'denied';

interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission as NotificationPermission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);
      return result as NotificationPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }, [isSupported]);

  const showNotification = useCallback((options: NotificationOptions): Notification | null => {
    if (!isSupported || permission !== 'granted') {
      console.warn('Notifications not supported or permission not granted');
      return null;
    }

    try {
      const notification = new Notification(`Krigzis - ${options.title}`, {
        body: options.body,
        icon: options.icon || '/icon.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
      });

      // Auto close after 5 seconds if not require interaction
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }, [isSupported, permission]);

  // Predefined notification types
  const showTaskReminder = useCallback((taskTitle: string, dueDate?: string) => {
    const body = dueDate 
      ? `Tarefa "${taskTitle}" vence em breve (${dueDate})`
      : `Lembrete: "${taskTitle}"`;

    return showNotification({
      title: 'Lembrete de Tarefa',
      body,
      tag: 'task-reminder',
      requireInteraction: true,
    });
  }, [showNotification]);

  const showTimerComplete = useCallback((type: 'work' | 'break', duration: string) => {
    const isWork = type === 'work';
    
    return showNotification({
      title: isWork ? 'Sessão de trabalho concluída!' : 'Pausa terminada!',
      body: isWork 
        ? `Você focou por ${duration}. Hora de fazer uma pausa!`
        : `Pausa de ${duration} terminada. Vamos voltar ao trabalho!`,
      tag: 'timer-complete',
      requireInteraction: false,
    });
  }, [showNotification]);

  const showTaskComplete = useCallback((taskTitle: string) => {
    return showNotification({
      title: 'Tarefa Concluída!',
      body: `Parabéns! Você concluiu: "${taskTitle}"`,
      tag: 'task-complete',
      requireInteraction: false,
    });
  }, [showNotification]);

  const showDailyGoal = useCallback((completedTasks: number, goalTasks: number) => {
    const isGoalReached = completedTasks >= goalTasks;
    
    return showNotification({
      title: isGoalReached ? 'Meta Diária Alcançada!' : 'Progresso Diário',
      body: isGoalReached
        ? `Excelente! Você concluiu ${completedTasks} tarefas hoje!`
        : `Você concluiu ${completedTasks} de ${goalTasks} tarefas hoje. Continue assim!`,
      tag: 'daily-goal',
      requireInteraction: false,
    });
  }, [showNotification]);

  const showStreakMilestone = useCallback((streak: number) => {
    return showNotification({
      title: 'Sequência Incrível!',
      body: `Você mantém uma sequência de ${streak} dias produtivos!`,
      tag: 'streak-milestone',
      requireInteraction: false,
    });
  }, [showNotification]);

  return {
    // State
    permission,
    isSupported,
    
    // Actions
    requestPermission,
    showNotification,
    
    // Predefined notifications
    showTaskReminder,
    showTimerComplete,
    showTaskComplete,
    showDailyGoal,
    showStreakMilestone,
  };
}; 