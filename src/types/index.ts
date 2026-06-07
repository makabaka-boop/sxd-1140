export type TaskStatus = 'pending' | 'to_visit' | 'processing' | 'to_review' | 'completed' | 'deferred';

export type AppointmentStatus = 'today' | 'upcoming' | 'scheduled' | 'expired' | 'completed' | 'none';

export type Role = 'admin' | 'staff' | 'supervisor';

export interface Urgency {
  id: string;
  name: string;
  color: string;
  timeoutHours: number;
}

export interface RepairType {
  id: string;
  name: string;
  icon: string;
}

export interface Assignee {
  id: string;
  name: string;
  avatar?: string;
}

export interface MoveRecord {
  id: string;
  taskId: string;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
  movedAt: number;
  note: string;
  operator?: string;
}

export interface ProcessRecord {
  id: string;
  taskId: string;
  type: 'status_change' | 'edit' | 'note' | 'appointment';
  status?: TaskStatus;
  previousStatus?: TaskStatus;
  content: string;
  createdAt: number;
  operator?: string;
}

export interface Appointment {
  scheduledAt: number | null;
  note: string;
  notifiedResident: boolean;
}

export interface RepairTask {
  id: string;
  title: string;
  description: string;
  typeId: string;
  urgencyId: string;
  assigneeId: string;
  building: string;
  room: string;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
  contactName: string;
  contactPhone: string;
  processRecords: ProcessRecord[];
  appointment: Appointment;
}

export interface FilterOptions {
  assigneeId: string | null;
  building: string | null;
  urgencyId: string | null;
  status: TaskStatus | null;
  appointmentStatus: AppointmentStatus | null;
}

export interface AppState {
  tasks: RepairTask[];
  urgencies: Urgency[];
  repairTypes: RepairType[];
  assignees: Assignee[];
  moveRecords: MoveRecord[];
  filters: FilterOptions;
  currentRole: Role;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: '待确认',
  to_visit: '待上门',
  processing: '处理中',
  to_review: '待复核',
  completed: '已完成',
  deferred: '暂缓',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: 'bg-gray-100 text-gray-700 border-gray-200',
  to_visit: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  to_review: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  deferred: 'bg-orange-50 text-orange-700 border-orange-200',
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  today: '今日预约',
  upcoming: '即将开始',
  scheduled: '已预约',
  expired: '已过期',
  completed: '预约已完成',
  none: '未预约',
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  today: 'bg-blue-50 text-blue-700 border-blue-200',
  upcoming: 'bg-green-50 text-green-700 border-green-200',
  scheduled: 'bg-purple-50 text-purple-700 border-purple-200',
  expired: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  none: 'bg-gray-50 text-gray-500 border-gray-200',
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: '管理员',
  staff: '员工',
  supervisor: '主管',
};

export const BUILDINGS = ['1号楼', '2号楼', '3号楼', '4号楼', '5号楼', '6号楼'];
