import { useState, useMemo, useEffect } from 'react';
import {
  X,
  Edit2,
  Check,
  XCircle,
  Clock,
  User,
  MapPin,
  Phone,
  FileText,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  Save,
  Calendar,
  Bell,
  BellOff,
} from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import type { TaskStatus, RepairTask, Appointment } from '@/types';
import { STATUS_LABELS, STATUS_COLORS, ROLE_LABELS, BUILDINGS, APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '@/types';
import { formatTimeAgo, getAppointmentStatus, formatAppointmentTime } from '@/utils/statistics';
import { cn } from '@/lib/utils';

const STATUSES: TaskStatus[] = ['pending', 'to_visit', 'processing', 'to_review', 'completed', 'deferred'];

const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const formatDateTimeLocal = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const getRecordTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    status_change: '状态变更',
    edit: '编辑修改',
    note: '备注记录',
    appointment: '预约管理',
  };
  return map[type] || type;
};

const getRecordTypeColor = (type: string): string => {
  const map: Record<string, string> = {
    status_change: 'bg-blue-50 text-blue-700 border-blue-200',
    edit: 'bg-amber-50 text-amber-700 border-amber-200',
    note: 'bg-gray-50 text-gray-700 border-gray-200',
    appointment: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return map[type] || 'bg-gray-50 text-gray-700 border-gray-200';
};

export const TaskDetailModal = () => {
  const isDetailModalOpen = useTaskStore(state => state.isDetailModalOpen);
  const selectedTaskId = useTaskStore(state => state.selectedTaskId);
  const closeDetailModal = useTaskStore(state => state.closeDetailModal);
  const tasks = useTaskStore(state => state.tasks);
  const urgencies = useTaskStore(state => state.urgencies);
  const repairTypes = useTaskStore(state => state.repairTypes);
  const assignees = useTaskStore(state => state.assignees);
  const currentRole = useTaskStore(state => state.currentRole);
  const updateTask = useTaskStore(state => state.updateTask);
  const updateTaskStatus = useTaskStore(state => state.updateTaskStatus);
  const addProcessRecord = useTaskStore(state => state.addProcessRecord);
  const updateAppointment = useTaskStore(state => state.updateAppointment);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<RepairTask>>({});
  const [editNote, setEditNote] = useState('');
  const [newNote, setNewNote] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isEditingAppointment, setIsEditingAppointment] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState<Partial<Appointment>>({});

  const canEdit = currentRole !== 'supervisor';
  const canSetAppointment = (task: RepairTask | undefined) => {
    if (!task || !canEdit) return false;
    return task.status === 'pending' || task.status === 'to_visit';
  };

  const task = useMemo(() => {
    return tasks.find(t => t.id === selectedTaskId);
  }, [tasks, selectedTaskId]);

  useEffect(() => {
    if (!isDetailModalOpen || !selectedTaskId) {
      setIsEditing(false);
      setEditForm({});
      setEditNote('');
      setNewNote('');
      setStatusNote('');
      setIsEditingAppointment(false);
      setAppointmentForm({});
    }
  }, [isDetailModalOpen, selectedTaskId]);

  const urgency = useMemo(() => {
    return urgencies.find(u => u.id === task?.urgencyId);
  }, [urgencies, task]);

  const repairType = useMemo(() => {
    return repairTypes.find(t => t.id === task?.typeId);
  }, [repairTypes, task]);

  const assignee = useMemo(() => {
    return assignees.find(a => a.id === task?.assigneeId);
  }, [assignees, task]);

  const sortedRecords = useMemo(() => {
    if (!task) return [];
    return [...task.processRecords].sort((a, b) => b.createdAt - a.createdAt);
  }, [task]);

  const handleStartEdit = () => {
    if (!task) return;
    setEditForm({
      title: task.title,
      description: task.description,
      typeId: task.typeId,
      urgencyId: task.urgencyId,
      assigneeId: task.assigneeId,
      building: task.building,
      room: task.room,
      contactName: task.contactName,
      contactPhone: task.contactPhone,
    });
    setEditNote('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
    setEditNote('');
  };

  const handleSaveEdit = () => {
    if (!task || !canEdit) return;
    updateTask(task.id, editForm, editNote || undefined);
    setIsEditing(false);
    setEditForm({});
    setEditNote('');
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (!task || !canEdit || task.status === newStatus) return;
    updateTaskStatus(task.id, newStatus, statusNote || undefined);
    setStatusNote('');
  };

  const handleAddNote = () => {
    if (!task || !newNote.trim() || !canEdit) return;
    addProcessRecord(task.id, {
      type: 'note',
      content: newNote.trim(),
      operator: ROLE_LABELS[currentRole],
    });
    setNewNote('');
  };

  const handleStartEditAppointment = () => {
    if (!task) return;
    setAppointmentForm({
      scheduledAt: task.appointment?.scheduledAt || null,
      note: task.appointment?.note || '',
      notifiedResident: task.appointment?.notifiedResident || false,
    });
    setIsEditingAppointment(true);
  };

  const handleCancelEditAppointment = () => {
    setIsEditingAppointment(false);
    setAppointmentForm({});
  };

  const handleSaveAppointment = () => {
    if (!task || !canSetAppointment(task)) return;
    updateAppointment(task.id, appointmentForm);
    setIsEditingAppointment(false);
    setAppointmentForm({});
  };

  const handleClearAppointment = () => {
    if (!task || !canSetAppointment(task)) return;
    updateAppointment(task.id, {
      scheduledAt: null,
      note: '',
      notifiedResident: false,
    });
    setIsEditingAppointment(false);
    setAppointmentForm({});
  };

  if (!isDetailModalOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">任务详情</h2>
            <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium border', STATUS_COLORS[task.status])}>
              {STATUS_LABELS[task.status]}
            </span>
            {!canEdit && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                只读模式
              </span>
            )}
          </div>
          <button
            onClick={closeDetailModal}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {isEditing ? (
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-blue-600" />
                    编辑任务信息
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:bg-white rounded-lg transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      取消
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      保存
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">任务标题</label>
                    <input
                      type="text"
                      value={editForm.title || ''}
                      onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">任务描述</label>
                    <textarea
                      value={editForm.description || ''}
                      onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">维修类型</label>
                    <select
                      value={editForm.typeId || ''}
                      onChange={e => setEditForm({ ...editForm, typeId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {repairTypes.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">紧急程度</label>
                    <select
                      value={editForm.urgencyId || ''}
                      onChange={e => setEditForm({ ...editForm, urgencyId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {urgencies.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">负责人</label>
                    <select
                      value={editForm.assigneeId || ''}
                      onChange={e => setEditForm({ ...editForm, assigneeId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {assignees.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">楼栋</label>
                    <select
                      value={editForm.building || ''}
                      onChange={e => setEditForm({ ...editForm, building: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {BUILDINGS.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">房间号</label>
                    <input
                      type="text"
                      value={editForm.room || ''}
                      onChange={e => setEditForm({ ...editForm, room: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">联系人</label>
                    <input
                      type="text"
                      value={editForm.contactName || ''}
                      onChange={e => setEditForm({ ...editForm, contactName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                    <input
                      type="text"
                      value={editForm.contactPhone || ''}
                      onChange={e => setEditForm({ ...editForm, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">修改说明（可选）</label>
                    <textarea
                      value={editNote}
                      onChange={e => setEditNote(e.target.value)}
                      placeholder="请输入本次修改的说明，将记录到处理记录中..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{task.title}</h3>
                    <p className="text-gray-600 text-sm">{task.description}</p>
                  </div>
                  {canEdit && (
                    <button
                      onClick={handleStartEdit}
                      className="ml-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑任务"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                      <FileText className="w-3.5 h-3.5" />
                      维修类型
                    </div>
                    <p className="text-sm font-medium text-gray-900">{repairType?.name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      紧急程度
                    </div>
                    <p className="text-sm font-medium" style={{ color: urgency?.color }}>
                      {urgency?.name}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                      <User className="w-3.5 h-3.5" />
                      负责人
                    </div>
                    <p className="text-sm font-medium text-gray-900">{assignee?.name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      位置
                    </div>
                    <p className="text-sm font-medium text-gray-900">{task.building} {task.room}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                      <User className="w-3.5 h-3.5" />
                      联系人
                    </div>
                    <p className="text-sm font-medium text-gray-900">{task.contactName}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                      <Phone className="w-3.5 h-3.5" />
                      联系电话
                    </div>
                    <p className="text-sm font-medium text-gray-900">{task.contactPhone}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      创建时间
                    </div>
                    <p className="text-sm font-medium text-gray-900">{formatDateTime(task.createdAt)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      更新时间
                    </div>
                    <p className="text-sm font-medium text-gray-900">{formatDateTime(task.updatedAt)}</p>
                  </div>
                </div>
              </div>
            )}

            {isEditingAppointment ? (
              <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    编辑预约上门
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCancelEditAppointment}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:bg-white rounded-lg transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      取消
                    </button>
                    {task.appointment?.scheduledAt && (
                      <button
                        onClick={handleClearAppointment}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        取消预约
                      </button>
                    )}
                    <button
                      onClick={handleSaveAppointment}
                      className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      保存
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">预约上门时间</label>
                    <input
                      type="datetime-local"
                      value={appointmentForm.scheduledAt ? formatDateTimeLocal(appointmentForm.scheduledAt) : ''}
                      onChange={e => {
                        const value = e.target.value;
                        setAppointmentForm({
                          ...appointmentForm,
                          scheduledAt: value ? new Date(value).getTime() : null,
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appointmentForm.notifiedResident || false}
                        onChange={e => setAppointmentForm({ ...appointmentForm, notifiedResident: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">已通知住户</span>
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">预约备注</label>
                    <textarea
                      value={appointmentForm.note || ''}
                      onChange={e => setAppointmentForm({ ...appointmentForm, note: e.target.value })}
                      placeholder="请输入预约备注信息..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    预约上门
                  </h3>
                  {canSetAppointment(task) && (
                    <button
                      onClick={handleStartEditAppointment}
                      className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      {task.appointment?.scheduledAt ? '修改预约' : '设置预约'}
                    </button>
                  )}
                </div>
                {task.appointment?.scheduledAt ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium border', APPOINTMENT_STATUS_COLORS[getAppointmentStatus(task)])}>
                        {APPOINTMENT_STATUS_LABELS[getAppointmentStatus(task)]}
                      </span>
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {formatAppointmentTime(task.appointment.scheduledAt)}
                      </div>
                      {task.appointment.notifiedResident ? (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <Bell className="w-4 h-4" />
                          已通知
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <BellOff className="w-4 h-4" />
                          未通知
                        </div>
                      )}
                    </div>
                    {task.appointment.note && (
                      <p className="text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-100">
                        {task.appointment.note}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {canSetAppointment(task) ? '暂无预约，点击右上角设置预约上门时间' : '当前状态不可设置预约'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {canEdit && (
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                  状态流转
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {STATUSES.map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={task.status === status}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                        task.status === status
                          ? STATUS_COLORS[status] + ' cursor-default'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                      )}
                    >
                      {STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                  placeholder="状态变更说明（可选）..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  处理记录
                  <span className="text-xs font-normal text-gray-500">
                    共 {sortedRecords.length} 条
                  </span>
                </h3>
              </div>

              {canEdit && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="添加处理备注..."
                    onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    添加
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {sortedRecords.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">暂无处理记录</p>
                ) : (
                  sortedRecords.map(record => (
                    <div key={record.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5" />
                        <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', getRecordTypeColor(record.type))}>
                            {getRecordTypeLabel(record.type)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(record.createdAt)}
                          </span>
                          {record.operator && (
                            <span className="text-xs text-gray-500">
                              · {record.operator}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{record.content}</p>
                        {record.type === 'status_change' && record.status && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
                            {record.previousStatus && (
                              <>
                                <span className={cn('px-1.5 py-0.5 rounded border', STATUS_COLORS[record.previousStatus])}>
                                  {STATUS_LABELS[record.previousStatus]}
                                </span>
                                <ChevronRight className="w-3 h-3" />
                              </>
                            )}
                            <span className={cn('px-1.5 py-0.5 rounded border', STATUS_COLORS[record.status])}>
                              {STATUS_LABELS[record.status]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
