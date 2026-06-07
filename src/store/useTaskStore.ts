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
} from '@/types';
import { loadState, saveState, generateId } from '@/utils/storage';
import {
  seedUrgencies,
  seedRepairTypes,
  seedAssignees,
  seedTasks,
  seedMoveRecords,
} from '@/data/seedData';

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
    },
    currentRole: 'staff',
  };
};

interface TaskStore extends AppState {
  setCurrentRole: (role: Role) => void;
  moveTask: (taskId: string, toStatus: TaskStatus, note?: string) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  resetFilters: () => void;
  addTask: (task: Omit<RepairTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (taskId: string, updates: Partial<RepairTask>) => void;
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
}

export const useTaskStore = create<TaskStore>((set, get) => {
  const initialState = getInitialState();
  
  return {
    ...initialState,

    setCurrentRole: (role: Role) => {
      set({ currentRole: role });
      saveState(get());
    },

    moveTask: (taskId: string, toStatus: TaskStatus, note = '') => {
      const state = get();
      const task = state.tasks.find(t => t.id === taskId);
      if (!task || task.status === toStatus) return;

      const fromStatus = task.status;
      const now = Date.now();

      const newRecord: MoveRecord = {
        id: generateId(),
        taskId,
        fromStatus,
        toStatus,
        movedAt: now,
        note,
      };

      set({
        tasks: state.tasks.map(t =>
          t.id === taskId ? { ...t, status: toStatus, updatedAt: now } : t
        ),
        moveRecords: [...state.moveRecords, newRecord],
      });
      saveState(get());
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
      };
      set(state => ({ tasks: [...state.tasks, newTask] }));
      saveState(get());
    },

    updateTask: (taskId, updates) => {
      set(state => ({
        tasks: state.tasks.map(t =>
          t.id === taskId ? { ...t, ...updates, updatedAt: Date.now() } : t
        ),
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
        return true;
      });
    },
  };
});
