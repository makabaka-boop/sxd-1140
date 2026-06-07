import type { RepairTask, Urgency, Assignee, TaskStatus, AppointmentStatus } from '@/types';

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

export const getAppointmentStatus = (task: RepairTask): AppointmentStatus => {
  if (!task.appointment?.scheduledAt) return 'none';
  if (task.status === 'completed') return 'completed';

  const now = Date.now();
  const scheduledAt = task.appointment.scheduledAt;
  const diffMs = scheduledAt - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffMs < 0) return 'expired';

  const scheduledDate = new Date(scheduledAt);
  const today = new Date();
  const isToday = scheduledDate.getDate() === today.getDate() &&
    scheduledDate.getMonth() === today.getMonth() &&
    scheduledDate.getFullYear() === today.getFullYear();

  if (isToday) return 'today';
  if (diffHours <= 24) return 'upcoming';
  return 'scheduled';
};

export const getAppointmentTasks = (tasks: RepairTask[], status: AppointmentStatus): RepairTask[] => {
  return tasks.filter(task => getAppointmentStatus(task) === status);
};

export const getTodayAppointments = (tasks: RepairTask[]): RepairTask[] => {
  return getAppointmentTasks(tasks, 'today');
};

export const getUpcomingAppointments = (tasks: RepairTask[]): RepairTask[] => {
  return getAppointmentTasks(tasks, 'upcoming');
};

export const getExpiredAppointments = (tasks: RepairTask[]): RepairTask[] => {
  return getAppointmentTasks(tasks, 'expired').filter(t => t.status !== 'completed');
};

export const formatAppointmentTime = (timestamp: number | null): string => {
  if (!timestamp) return '未预约';
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((timestamp - now.getTime()) / (1000 * 60 * 60 * 24));

  const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

  if (date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()) {
    return `今天 ${timeStr}`;
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()) {
    return `明天 ${timeStr}`;
  }

  return `${date.getMonth() + 1}月${date.getDate()}日 ${timeStr}`;
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
