import type { RepairTask, Urgency, RepairType, Assignee, STATUS_LABELS } from '@/types';
import { STATUS_LABELS as statusLabels } from '@/types';

interface ExportData {
  tasks: RepairTask[];
  urgencies: Urgency[];
  repairTypes: RepairType[];
  assignees: Assignee[];
}

export const exportToCSV = (data: ExportData): void => {
  const { tasks, urgencies, repairTypes, assignees } = data;
  
  const headers = [
    '任务ID',
    '标题',
    '描述',
    '维修类型',
    '紧急程度',
    '负责人',
    '楼栋',
    '房间',
    '状态',
    '联系人',
    '联系电话',
    '创建时间',
    '更新时间',
  ];

  const rows = tasks.map(task => {
    const type = repairTypes.find(t => t.id === task.typeId)?.name || '';
    const urgency = urgencies.find(u => u.id === task.urgencyId)?.name || '';
    const assignee = assignees.find(a => a.id === task.assigneeId)?.name || '';
    const status = statusLabels[task.status as keyof typeof statusLabels] || task.status;
    const createdAt = new Date(task.createdAt).toLocaleString('zh-CN');
    const updatedAt = new Date(task.updatedAt).toLocaleString('zh-CN');
    
    return [
      task.id,
      task.title,
      `"${task.description.replace(/"/g, '""')}"`,
      type,
      urgency,
      assignee,
      task.building,
      task.room,
      status,
      task.contactName,
      task.contactPhone,
      createdAt,
      updatedAt,
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `维修任务看板_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToJSON = (data: ExportData): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `维修任务看板_${new Date().toISOString().slice(0, 10)}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
