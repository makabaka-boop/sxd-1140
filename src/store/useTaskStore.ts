import { create } from 'zustand';
import type {
  AppState,
  RepairTask,
  Urgency,
  RepairType,
  Assignee,
  MoveRecord,
  TaskStatus,
  FilterOptions,
  Role,
  ProcessRecord,
  Appointment,
  AppointmentStatus,
} from '@/types';
import { loadState, saveState, generateId } from '@/utils/storage';
import {
  seedUrgencies,
  seedRepairTypes,
  seedAssignees,
  seedTasks,
  seedMoveRecords,
} from '@/data/seedData';
import { STATUS_LABELS, ROLE_LABELS } from '@/types';
import { getAppointmentStatus, formatAppointmentTime } from '@/utils/statistics';

const canUpdateAppointment = (task: RepairTask): boolean => {
  return task.status === 'pending' || task.status === 'to_visit';
};

const getInitialState = (): AppState => {
  const saved = loadState();
  if (saved) {
    return saved;
  }
  return {
    tasks: seedTasks,
    urgencies: seedUrgencies,
    repairTypes: seedRepairTypes,
    assignees: seedAssignees,
    moveRecords: seedMoveRecords,
    filters: {
      assigneeId: null,
      building: null,
      urgencyId: null,
      status: null,
      appointmentStatus: null,
    },
    currentRole: 'staff',
  };
};

interface TaskStore extends AppState {
  selectedTaskId: string | null;
  isDetailModalOpen: boolean;
  setCurrentRole: (role: Role) => void;
  moveTask: (taskId: string, toStatus: TaskStatus, note?: string) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  resetFilters: () => void;
  addTask: (task: Omit<RepairTask, 'id' | 'createdAt' | 'updatedAt' | 'processRecords' | 'appointment'>) => void;
  updateTask: (taskId: string, updates: Partial<RepairTask>, note?: string) => void;
  deleteTask: (taskId: string) => void;
  addUrgency: (urgency: Omit<Urgency, 'id'>) => void;
  updateUrgency: (urgencyId: string, updates: Partial<Urgency>) => void;
  deleteUrgency: (urgencyId: string) => void;
  addRepairType: (type: Omit<RepairType, 'id'>) => void;
  updateRepairType: (typeId: string, updates: Partial<RepairType>) => void;
  deleteRepairType: (typeId: string) => void;
  addAssignee: (assignee: Omit<Assignee, 'id'>) => void;
  updateAssignee: (assigneeId: string, updates: Partial<Assignee>) => void;
  deleteAssignee: (assigneeId: string) => void;
  getFilteredTasks: () => RepairTask[];
  openDetailModal: (taskId: string) => void;
  closeDetailModal: () => void;
  addProcessRecord: (taskId: string, record: Omit<ProcessRecord, 'id' | 'taskId' | 'createdAt'>) => void;
  updateTaskStatus: (taskId: string, toStatus: TaskStatus, note?: string) => void;
  updateAppointment: (taskId: string, appointment: Partial<Appointment>) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => {
  const initialState = getInitialState();
  
  return {
    ...initialState,
    selectedTaskId: null,
    isDetailModalOpen: false,

    setCurrentRole: (role: Role) => {
      set({ currentRole: role });
      saveState(get());
    },

    openDetailModal: (taskId: string) => {
      set({ selectedTaskId: taskId, isDetailModalOpen: true });
    },

    closeDetailModal: () => {
      set({ selectedTaskId: null, isDetailModalOpen: false });
    },

    addProcessRecord: (taskId: string, record: Omit<ProcessRecord, 'id' | 'taskId' | 'createdAt'>) => {
      const state = get();
      const now = Date.now();
      const newRecord: ProcessRecord = {
        ...record,
        id: generateId(),
        taskId,
        createdAt: now,
      };

      set({
        tasks: state.tasks.map(t =>
          t.id === taskId
            ? { ...t, processRecords: [...t.processRecords, newRecord], updatedAt: now }
            : t
        ),
      });
      saveState(get());
    },

    moveTask: (taskId: string, toStatus: TaskStatus, note = '') => {
      const state = get();
      const task = state.tasks.find(t => t.id === taskId);
      if (!task || task.status === toStatus) return;

      const fromStatus = task.status;
      const now = Date.now();
      const currentRole = state.currentRole;
      const assignee = state.assignees.find(a => a.id === task.assigneeId);
      const operator = currentRole === 'admin' ? '管理员' : assignee?.name || '员工';

      const newRecord: MoveRecord = {
        id: generateId(),
        taskId,
        fromStatus,
        toStatus,
        movedAt: now,
        note,
        operator,
      };

      const processRecord: ProcessRecord = {
        id: generateId(),
        taskId,
        type: 'status_change',
        status: toStatus,
        previousStatus: fromStatus,
        content: note || `状态从「${STATUS_LABELS[fromStatus]}」变更为「${STATUS_LABELS[toStatus]}」`,
        createdAt: now,
        operator,
      };

      set({
        tasks: state.tasks.map(t =>
          t.id === taskId
            ? {
                ...t,
                status: toStatus,
                updatedAt: now,
                processRecords: [...t.processRecords, processRecord],
              }
            : t
        ),
        moveRecords: [...state.moveRecords, newRecord],
      });
      saveState(get());
    },

    updateTaskStatus: (taskId: string, toStatus: TaskStatus, note = '') => {
      get().moveTask(taskId, toStatus, note);
    },

    setFilters: (filters: Partial<FilterOptions>) => {
      set(state => ({
        filters: { ...state.filters, ...filters },
      }));
      saveState(get());
    },

    resetFilters: () => {
      set({
        filters: {
          assigneeId: null,
          building: null,
          urgencyId: null,
          status: null,
          appointmentStatus: null,
        },
      });
      saveState(get());
    },

    addTask: (task) => {
      const now = Date.now();
      const newTask: RepairTask = {
        ...task,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        appointment: {
          scheduledAt: null,
          note: '',
          notifiedResident: false,
        },
        processRecords: [
          {
            id: generateId(),
            taskId: '',
            type: 'note',
            content: '任务创建',
            createdAt: now,
            operator: '系统',
          },
        ],
      };
      newTask.processRecords[0].taskId = newTask.id;
      set(state => ({ tasks: [...state.tasks, newTask] }));
      saveState(get());
    },

    updateTask: (taskId, updates, note) => {
      const state = get();
      const now = Date.now();
      const currentRole = state.currentRole;
      const operator = ROLE_LABELS[currentRole];

      let processRecord: ProcessRecord | null = null;
      if (note) {
        processRecord = {
          id: generateId(),
          taskId,
          type: 'edit',
          content: note,
          createdAt: now,
          operator,
        };
      }

      set(state => ({
        tasks: state.tasks.map(t => {
          if (t.id !== taskId) return t;
          const updated = { ...t, ...updates, updatedAt: now };
          if (processRecord) {
            updated.processRecords = [...t.processRecords, processRecord];
          }
          return updated;
        }),
      }));
      saveState(get());
    },

    deleteTask: (taskId) => {
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== taskId),
        moveRecords: state.moveRecords.filter(r => r.taskId !== taskId),
      }));
      saveState(get());
    },

    addUrgency: (urgency) => {
      const newUrgency: Urgency = { ...urgency, id: generateId() };
      set(state => ({ urgencies: [...state.urgencies, newUrgency] }));
      saveState(get());
    },

    updateUrgency: (urgencyId, updates) => {
      set(state => ({
        urgencies: state.urgencies.map(u =>
          u.id === urgencyId ? { ...u, ...updates } : u
        ),
      }));
      saveState(get());
    },

    deleteUrgency: (urgencyId) => {
      set(state => ({
        urgencies: state.urgencies.filter(u => u.id !== urgencyId),
      }));
      saveState(get());
    },

    addRepairType: (type) => {
      const newType: RepairType = { ...type, id: generateId() };
      set(state => ({ repairTypes: [...state.repairTypes, newType] }));
      saveState(get());
    },

    updateRepairType: (typeId, updates) => {
      set(state => ({
        repairTypes: state.repairTypes.map(t =>
          t.id === typeId ? { ...t, ...updates } : t
        ),
      }));
      saveState(get());
    },

    deleteRepairType: (typeId) => {
      set(state => ({
        repairTypes: state.repairTypes.filter(t => t.id !== typeId),
      }));
      saveState(get());
    },

    addAssignee: (assignee) => {
      const newAssignee: Assignee = { ...assignee, id: generateId() };
      set(state => ({ assignees: [...state.assignees, newAssignee] }));
      saveState(get());
    },

    updateAssignee: (assigneeId, updates) => {
      set(state => ({
        assignees: state.assignees.map(a =>
          a.id === assigneeId ? { ...a, ...updates } : a
        ),
      }));
      saveState(get());
    },

    deleteAssignee: (assigneeId) => {
      set(state => ({
        assignees: state.assignees.filter(a => a.id !== assigneeId),
      }));
      saveState(get());
    },

    getFilteredTasks: () => {
      const state = get();
      const { tasks, filters } = state;
      
      return tasks.filter(task => {
        if (filters.assigneeId && task.assigneeId !== filters.assigneeId) return false;
        if (filters.building && task.building !== filters.building) return false;
        if (filters.urgencyId && task.urgencyId !== filters.urgencyId) return false;
        if (filters.status && task.status !== filters.status) return false;
        if (filters.appointmentStatus) {
          const appointmentStatus = getAppointmentStatus(task);
          if (appointmentStatus !== filters.appointmentStatus) return false;
        }
        return true;
      });
    },

    updateAppointment: (taskId, appointment) => {
      const state = get();
      const task = state.tasks.find(t => t.id === taskId);
      if (!task || !canUpdateAppointment(task)) return;

      const now = Date.now();
      const currentRole = state.currentRole;
      const operator = ROLE_LABELS[currentRole];

      const oldAppointment = task.appointment;
      const newAppointment = { ...oldAppointment, ...appointment };

      let content = '';
      const isNew = !oldAppointment?.scheduledAt && newAppointment.scheduledAt;
      const isUpdated = oldAppointment?.scheduledAt && newAppointment.scheduledAt &&
        (oldAppointment.scheduledAt !== newAppointment.scheduledAt ||
          oldAppointment.note !== newAppointment.note ||
          oldAppointment.notifiedResident !== newAppointment.notifiedResident);
      const isCleared = oldAppointment?.scheduledAt && !newAppointment.scheduledAt;

      if (isNew) {
        content = `创建预约：${formatAppointmentTime(newAppointment.scheduledAt)}${newAppointment.note ? `，备注：${newAppointment.note}` : ''}${newAppointment.notifiedResident ? '，已通知住户' : ''}`;
      } else if (isUpdated) {
        const changes: string[] = [];
        if (oldAppointment.scheduledAt !== newAppointment.scheduledAt) {
          changes.push(`时间从${formatAppointmentTime(oldAppointment.scheduledAt)}变更为${formatAppointmentTime(newAppointment.scheduledAt)}`);
        }
        if (oldAppointment.note !== newAppointment.note) {
          changes.push(`备注${newAppointment.note ? `更新为：${newAppointment.note}` : '已清除'}`);
        }
        if (oldAppointment.notifiedResident !== newAppointment.notifiedResident) {
          changes.push(newAppointment.notifiedResident ? '标记已通知住户' : '取消已通知住户标记');
        }
        content = `修改预约：${changes.join('，')}`;
      } else if (isCleared) {
        content = '取消预约';
      }

      const processRecord: ProcessRecord | null = content ? {
        id: generateId(),
        taskId,
        type: 'appointment',
        content,
        createdAt: now,
        operator,
      } : null;

      set(state => ({
        tasks: state.tasks.map(t => {
          if (t.id !== taskId) return t;
          const updated = {
            ...t,
            appointment: newAppointment,
            updatedAt: now,
          };
          if (processRecord) {
            updated.processRecords = [...t.processRecords, processRecord];
          }
          return updated;
        }),
      }));
      saveState(get());
    },
  };
});
