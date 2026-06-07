import type { AppState, RepairTask } from '@/types';

const STORAGE_KEY = 'property_maintenance_board';

const defaultAppointment = {
  scheduledAt: null,
  note: '',
  notifiedResident: false,
};

const migrateTask = (task: any): RepairTask => {
  return {
    ...task,
    appointment: task.appointment ? { ...defaultAppointment, ...task.appointment } : defaultAppointment,
    processRecords: task.processRecords || [
      {
        id: `migrated-${task.id}`,
        taskId: task.id,
        type: 'note' as const,
        content: '任务创建（数据迁移）',
        createdAt: task.createdAt,
        operator: '系统',
      },
    ],
  };
};

export const loadState = (): AppState | null => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return null;
    }
    const state = JSON.parse(serialized) as AppState;
    if (state.tasks) {
      state.tasks = state.tasks.map(migrateTask);
    }
    return state;
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return null;
  }
};

export const saveState = (state: AppState): void => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
