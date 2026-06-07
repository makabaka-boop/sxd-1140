import type { RepairTask, Urgency, Assignee, TaskStatus, AppointmentStatus, FollowUpReminder, FollowUpStatus } from '@/types';

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

export const getTaskActiveFollowUp = (taskId: string, reminders: FollowUpReminder[]): FollowUpReminder | undefined => {
  return reminders.find(r => r.taskId === taskId && r.status === 'active');
};

export const getTaskLatestFollowUp = (taskId: string, reminders: FollowUpReminder[]): FollowUpReminder | undefined => {
  const taskReminders = reminders.filter(r => r.taskId === taskId);
  if (taskReminders.length === 0) return undefined;
  return taskReminders.sort((a, b) => b.updatedAt - a.updatedAt)[0];
};

export const getFollowUpStatus = (reminder: FollowUpReminder | undefined): FollowUpStatus => {
  if (!reminder) return 'none';
  if (reminder.status === 'completed') return 'completed';

  const now = Date.now();
  const followUpAt = reminder.nextFollowUpAt;
  const diffMs = followUpAt - now;

  if (diffMs < 0) return 'overdue';

  const followUpDate = new Date(followUpAt);
  const today = new Date();
  const isToday = followUpDate.getDate() === today.getDate() &&
    followUpDate.getMonth() === today.getMonth() &&
    followUpDate.getFullYear() === today.getFullYear();

  if (isToday) return 'today';
  return 'pending';
};

export const getTaskFollowUpStatus = (taskId: string, reminders: FollowUpReminder[]): FollowUpStatus => {
  const activeReminder = getTaskActiveFollowUp(taskId, reminders);
  if (activeReminder) {
    return getFollowUpStatus(activeReminder);
  }
  const latestReminder = getTaskLatestFollowUp(taskId, reminders);
  if (latestReminder && latestReminder.status === 'completed') {
    return 'completed';
  }
  return 'none';
};

export const formatFollowUpTime = (timestamp: number | null): string => {
  if (!timestamp) return '未设置';
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

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()) {
    return `昨天 ${timeStr}`;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${timeStr}`;
};

export const getTodayFollowUps = (reminders: FollowUpReminder[]): FollowUpReminder[] => {
  return reminders.filter(r => {
    if (r.status !== 'active') return false;
    const status = getFollowUpStatus(r);
    return status === 'today';
  });
};

export const getOverdueFollowUps = (reminders: FollowUpReminder[]): FollowUpReminder[] => {
  return reminders.filter(r => {
    if (r.status !== 'active') return false;
    const status = getFollowUpStatus(r);
    return status === 'overdue';
  });
};

export const getPendingFollowUps = (reminders: FollowUpReminder[]): FollowUpReminder[] => {
  return reminders.filter(r => {
    if (r.status !== 'active') return false;
    const status = getFollowUpStatus(r);
    return status === 'pending';
  });
};

export const getCompletedFollowUps = (reminders: FollowUpReminder[]): FollowUpReminder[] => {
  return reminders.filter(r => r.status === 'completed');
};

export const getFollowUpsByAssignee = (reminders: FollowUpReminder[], assigneeId: string): FollowUpReminder[] => {
  return reminders.filter(r => r.assigneeId === assigneeId && r.status === 'active');
};

export const getFollowUpStatsByAssignee = (reminders: FollowUpReminder[], assignees: Assignee[]) => {
  return assignees.map(assignee => {
    const assigneeReminders = getFollowUpsByAssignee(reminders, assignee.id);
    const today = assigneeReminders.filter(r => getFollowUpStatus(r) === 'today').length;
    const overdue = assigneeReminders.filter(r => getFollowUpStatus(r) === 'overdue').length;
    const pending = assigneeReminders.filter(r => getFollowUpStatus(r) === 'pending').length;
    return {
      assignee,
      total: assigneeReminders.length,
      today,
      overdue,
      pending,
    };
  });
};
