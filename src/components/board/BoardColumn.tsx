import { useDroppable } from '@dnd-kit/core';
import type { TaskStatus, RepairTask, Urgency, Assignee, RepairType } from '@/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/types';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

interface BoardColumnProps {
  status: TaskStatus;
  tasks: RepairTask[];
  urgencies: Urgency[];
  assignees: Assignee[];
  repairTypes: RepairType[];
  isOver?: boolean;
}

export const BoardColumn = ({ status, tasks, urgencies, assignees, repairTypes, isOver }: BoardColumnProps) => {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  const count = tasks.length;
  const statusColor = STATUS_COLORS[status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-shrink-0 w-72 flex flex-col rounded-xl transition-all duration-200',
        isOver ? 'bg-blue-50 ring-2 ring-blue-200' : 'bg-gray-50'
      )}
    >
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn('px-2.5 py-1 rounded-md text-xs font-medium border', statusColor)}>
              {STATUS_LABELS[status]}
            </span>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center">
              {count}
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-3">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            urgencies={urgencies}
            assignees={assignees}
            repairTypes={repairTypes}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <span className="text-xl">📋</span>
            </div>
            <p className="text-xs">暂无任务</p>
          </div>
        )}
      </div>
    </div>
  );
};
