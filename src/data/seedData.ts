import type { Urgency, RepairType, Assignee, RepairTask, MoveRecord, ProcessRecord } from '@/types';

const now = Date.now();
const hour = 60 * 60 * 1000;

export const seedUrgencies: Urgency[] = [
  { id: 'u1', name: '一般', color: '#52c41a', timeoutHours: 24 },
  { id: 'u2', name: '紧急', color: '#faad14', timeoutHours: 8 },
  { id: 'u3', name: '非常紧急', color: '#f5222d', timeoutHours: 2 },
];

export const seedRepairTypes: RepairType[] = [
  { id: 't1', name: '水电维修', icon: 'Zap' },
  { id: 't2', name: '空调维修', icon: 'Wind' },
  { id: 't3', name: '门窗维修', icon: 'DoorOpen' },
  { id: 't4', name: '墙面维修', icon: 'LayoutGrid' },
  { id: 't5', name: '管道疏通', icon: 'Droplets' },
  { id: 't6', name: '其他', icon: 'MoreHorizontal' },
];

export const seedAssignees: Assignee[] = [
  { id: 'a1', name: '张三' },
  { id: 'a2', name: '李四' },
  { id: 'a3', name: '王五' },
  { id: 'a4', name: '赵六' },
];

const seedProcessRecords = (taskId: string): ProcessRecord[] => {
  const records: ProcessRecord[] = [];
  let timeOffset = 0;

  switch (taskId) {
    case 'task1':
      records.push({
        id: `pr-${taskId}-1`,
        taskId,
        type: 'note',
        content: '任务创建，等待确认',
        createdAt: now - 2 * hour,
        operator: '系统',
      });
      break;
    case 'task2':
      records.push(
        {
          id: `pr-${taskId}-1`,
          taskId,
          type: 'note',
          content: '任务创建，等待确认',
          createdAt: now - 6 * hour,
          operator: '系统',
        },
        {
          id: `pr-${taskId}-2`,
          taskId,
          type: 'status_change',
          status: 'to_visit',
          previousStatus: 'pending',
          content: '已联系业主，安排下午上门',
          createdAt: now - 3 * hour,
          operator: '李四',
        }
      );
      break;
    case 'task3':
      records.push(
        {
          id: `pr-${taskId}-1`,
          taskId,
          type: 'note',
          content: '任务创建，紧急任务',
          createdAt: now - 1 * hour,
          operator: '系统',
        },
        {
          id: `pr-${taskId}-2`,
          taskId,
          type: 'status_change',
          status: 'processing',
          previousStatus: 'pending',
          content: '已到达现场，正在处理漏水问题',
          createdAt: now - 30 * 60 * 1000,
          operator: '王五',
        }
      );
      break;
    case 'task4':
      records.push(
        {
          id: `pr-${taskId}-1`,
          taskId,
          type: 'note',
          content: '任务创建',
          createdAt: now - 10 * hour,
          operator: '系统',
        },
        {
          id: `pr-${taskId}-2`,
          taskId,
          type: 'status_change',
          status: 'to_visit',
          previousStatus: 'pending',
          content: '已联系业主确认上门时间',
          createdAt: now - 8 * hour,
          operator: '张三',
        },
        {
          id: `pr-${taskId}-3`,
          taskId,
          type: 'status_change',
          status: 'processing',
          previousStatus: 'to_visit',
          content: '开始更换锁芯',
          createdAt: now - 3 * hour,
          operator: '张三',
        },
        {
          id: `pr-${taskId}-4`,
          taskId,
          type: 'status_change',
          status: 'to_review',
          previousStatus: 'processing',
          content: '锁芯更换完成，待复核',
          createdAt: now - 1 * hour,
          operator: '张三',
        }
      );
      break;
    case 'task5':
      records.push(
        {
          id: `pr-${taskId}-1`,
          taskId,
          type: 'note',
          content: '任务创建',
          createdAt: now - 48 * hour,
          operator: '系统',
        },
        {
          id: `pr-${taskId}-2`,
          taskId,
          type: 'status_change',
          status: 'to_visit',
          previousStatus: 'pending',
          content: '已安排师傅上门',
          createdAt: now - 40 * hour,
          operator: '赵六',
        },
        {
          id: `pr-${taskId}-3`,
          taskId,
          type: 'status_change',
          status: 'processing',
          previousStatus: 'to_visit',
          content: '开始墙面修补工作',
          createdAt: now - 30 * hour,
          operator: '赵六',
        },
        {
          id: `pr-${taskId}-4`,
          taskId,
          type: 'status_change',
          status: 'to_review',
          previousStatus: 'processing',
          content: '墙面修补完成，待验收',
          createdAt: now - 10 * hour,
          operator: '赵六',
        },
        {
          id: `pr-${taskId}-5`,
          taskId,
          type: 'status_change',
          status: 'completed',
          previousStatus: 'to_review',
          content: '墙面修补验收通过，任务完成',
          createdAt: now - 5 * hour,
          operator: '主管',
        }
      );
      break;
    case 'task6':
      records.push(
        {
          id: `pr-${taskId}-1`,
          taskId,
          type: 'note',
          content: '任务创建',
          createdAt: now - 20 * hour,
          operator: '系统',
        },
        {
          id: `pr-${taskId}-2`,
          taskId,
          type: 'status_change',
          status: 'to_visit',
          previousStatus: 'pending',
          content: '安排技术人员检查',
          createdAt: now - 18 * hour,
          operator: '李四',
        },
        {
          id: `pr-${taskId}-3`,
          taskId,
          type: 'status_change',
          status: 'deferred',
          previousStatus: 'to_visit',
          content: '配件缺货，需等待厂家发货，预计3天后到货',
          createdAt: now - 10 * hour,
          operator: '李四',
        }
      );
      break;
    case 'task7':
      records.push({
        id: `pr-${taskId}-1`,
        taskId,
        type: 'note',
        content: '任务创建，等待确认',
        createdAt: now - 4 * hour,
        operator: '系统',
      });
      break;
    case 'task8':
      records.push(
        {
          id: `pr-${taskId}-1`,
          taskId,
          type: 'note',
          content: '任务创建',
          createdAt: now - 15 * hour,
          operator: '系统',
        },
        {
          id: `pr-${taskId}-2`,
          taskId,
          type: 'status_change',
          status: 'to_visit',
          previousStatus: 'pending',
          content: '已安排明天上午上门检查密封情况',
          createdAt: now - 8 * hour,
          operator: '赵六',
        }
      );
      break;
  }
  return records;
};

export const seedTasks: RepairTask[] = [
  {
    id: 'task1',
    title: '客厅灯不亮',
    description: '业主反映客厅主灯开关打开后灯不亮，需要检查电路和灯泡',
    typeId: 't1',
    urgencyId: 'u1',
    assigneeId: 'a1',
    building: '1号楼',
    room: '302',
    status: 'pending',
    createdAt: now - 2 * hour,
    updatedAt: now - 2 * hour,
    contactName: '王先生',
    contactPhone: '138****1234',
    processRecords: seedProcessRecords('task1'),
  },
  {
    id: 'task2',
    title: '空调不制冷',
    description: '夏天来临，空调开机后吹热风，需要检查氟利昂和压缩机',
    typeId: 't2',
    urgencyId: 'u2',
    assigneeId: 'a2',
    building: '2号楼',
    room: '501',
    status: 'to_visit',
    createdAt: now - 6 * hour,
    updatedAt: now - 3 * hour,
    contactName: '李女士',
    contactPhone: '139****5678',
    processRecords: seedProcessRecords('task2'),
  },
  {
    id: 'task3',
    title: '水管漏水',
    description: '厨房水龙头下方水管漏水严重，地面有积水，需要紧急处理',
    typeId: 't5',
    urgencyId: 'u3',
    assigneeId: 'a3',
    building: '3号楼',
    room: '203',
    status: 'processing',
    createdAt: now - 1 * hour,
    updatedAt: now - 30 * 60 * 1000,
    contactName: '张阿姨',
    contactPhone: '137****9012',
    processRecords: seedProcessRecords('task3'),
  },
  {
    id: 'task4',
    title: '门锁损坏',
    description: '入户门锁无法正常开启，需要更换锁芯',
    typeId: 't3',
    urgencyId: 'u2',
    assigneeId: 'a1',
    building: '1号楼',
    room: '101',
    status: 'to_review',
    createdAt: now - 10 * hour,
    updatedAt: now - 1 * hour,
    contactName: '刘先生',
    contactPhone: '136****3456',
    processRecords: seedProcessRecords('task4'),
  },
  {
    id: 'task5',
    title: '墙面开裂',
    description: '主卧墙面有明显裂缝，需要修补',
    typeId: 't4',
    urgencyId: 'u1',
    assigneeId: 'a4',
    building: '4号楼',
    room: '602',
    status: 'completed',
    createdAt: now - 48 * hour,
    updatedAt: now - 5 * hour,
    contactName: '陈先生',
    contactPhone: '135****7890',
    processRecords: seedProcessRecords('task5'),
  },
  {
    id: 'task6',
    title: '电梯故障',
    description: '电梯按钮失灵，需要等待配件',
    typeId: 't6',
    urgencyId: 'u2',
    assigneeId: 'a2',
    building: '5号楼',
    room: '公共区域',
    status: 'deferred',
    createdAt: now - 20 * hour,
    updatedAt: now - 10 * hour,
    contactName: '物业中心',
    contactPhone: '010-****1234',
    processRecords: seedProcessRecords('task6'),
  },
  {
    id: 'task7',
    title: '下水道堵塞',
    description: '卫生间地漏下水慢，有异味',
    typeId: 't5',
    urgencyId: 'u1',
    assigneeId: 'a3',
    building: '2号楼',
    room: '305',
    status: 'pending',
    createdAt: now - 4 * hour,
    updatedAt: now - 4 * hour,
    contactName: '赵女士',
    contactPhone: '138****2345',
    processRecords: seedProcessRecords('task7'),
  },
  {
    id: 'task8',
    title: '窗户漏风',
    description: '冬季窗户密封不好，漏风严重',
    typeId: 't3',
    urgencyId: 'u1',
    assigneeId: 'a4',
    building: '6号楼',
    room: '403',
    status: 'to_visit',
    createdAt: now - 15 * hour,
    updatedAt: now - 8 * hour,
    contactName: '孙先生',
    contactPhone: '137****6789',
    processRecords: seedProcessRecords('task8'),
  },
];

export const seedMoveRecords: MoveRecord[] = [
  {
    id: 'm1',
    taskId: 'task2',
    fromStatus: 'pending',
    toStatus: 'to_visit',
    movedAt: now - 3 * hour,
    note: '已联系业主，安排下午上门',
  },
  {
    id: 'm2',
    taskId: 'task3',
    fromStatus: 'pending',
    toStatus: 'processing',
    movedAt: now - 30 * 60 * 1000,
    note: '已到达现场，正在处理',
  },
  {
    id: 'm3',
    taskId: 'task4',
    fromStatus: 'processing',
    toStatus: 'to_review',
    movedAt: now - 1 * hour,
    note: '锁芯更换完成，待复核',
  },
  {
    id: 'm4',
    taskId: 'task5',
    fromStatus: 'to_review',
    toStatus: 'completed',
    movedAt: now - 5 * hour,
    note: '墙面修补验收通过',
  },
  {
    id: 'm5',
    taskId: 'task6',
    fromStatus: 'to_visit',
    toStatus: 'deferred',
    movedAt: now - 10 * hour,
    note: '配件缺货，暂缓处理',
  },
  {
    id: 'm6',
    taskId: 'task8',
    fromStatus: 'pending',
    toStatus: 'to_visit',
    movedAt: now - 8 * hour,
    note: '已安排明天上午上门检查',
  },
];
