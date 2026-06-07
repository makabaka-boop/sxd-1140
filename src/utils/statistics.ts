import type { RepairTask, Urgency, Assignee, TaskStatus } from '@/types';

export const isTaskTimeout = (task: RepairTask, urgencies: Urgency[]): boolean => {
  if (task.status === 'completed') return false;
  const urgency = urgencies.find(u => u.id === task.urgencyId);
  if (!urgency) return false;
  const elapsedHours = (Date.now() - task.createdAt) / (1000 * 60 * 60);
  return elapsedHours > urgency.timeoutHours;
};

export const getTimeoutTasks = (tasks: RepairTask[], urgencies: Urgency[]): RepairTask[] => {
  return tasks.filter(task => isTaskTimeout(task, urgencies));
};

export const getAssigneeWorkload = (tasks: RepairTask[], assignees: Assignee[]): Array<{ assignee: Assignee; count: number }> => {
  const activeStatuses: TaskStatus[] = ['pending', 'to_visit', 'processing', 'to_review'];
  return assignees.map(assignee => ({
    assignee,
    count: tasks.filter(t => t.assigneeId === assignee.id && activeStatuses.includes(t.status)).length,
  }));
};

export const getReviewWaitingCount = (tasks: RepairTask[]): number => {
  return tasks.filter(t => t.status === 'to_review').length;
};

export const getUrgentTaskCount = (tasks: RepairTask[], urgencies: Urgency[]): number => {
  const activeStatuses: TaskStatus[] = ['pending', 'to_visit', 'processing', 'to_review'];
  const highUrgencyIds = urgencies.filter(u => u.timeoutHours <= 8).map(u => u.id);
  return tasks.filter(t => activeStatuses.includes(t.status) && highUrgencyIds.includes(t.urgencyId)).length;
};

export const getTasksByStatus = (tasks: RepairTask[], status: TaskStatus): RepairTask[] => {
  return tasks.filter(t => t.status === status);
};

export const getBacklogTasks = (tasks: RepairTask[], urgencies: Urgency[]): RepairTask[] => {
  const timeoutTasks = getTimeoutTasks(tasks, urgencies);
  const deferredTasks = tasks.filter(t => t.status === 'deferred');
  return [...new Set([...timeoutTasks, ...deferredTasks])];
};

export const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}秒前`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
};
