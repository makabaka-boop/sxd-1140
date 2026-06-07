import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  Zap,
  Wind,
  DoorOpen,
  LayoutGrid,
  Droplets,
  MoreHorizontal,
  Clock,
  AlertTriangle,
  User,
  MapPin,
} from 'lucide-react';
import type { RepairTask, Urgency, Assignee, RepairType } from '@/types';
import { isTaskTimeout, formatTimeAgo } from '@/utils/statistics';
import { cn } from '@/lib/utils';

const iconMap: Record<string, typeof Zap> = {
  Zap,
  Wind,
  DoorOpen,
  LayoutGrid,
  Droplets,
  MoreHorizontal,
};

interface TaskCardProps {
  task: RepairTask;
  urgencies: Urgency[];
  assignees: Assignee[];
  repairTypes: RepairType[];
  isDragging?: boolean;
}

export const TaskCard = ({ task, urgencies, assignees, repairTypes }: TaskCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const urgency = urgencies.find(u => u.id === task.urgencyId);
  const assignee = assignees.find(a => a.id === task.assigneeId);
  const repairType = repairTypes.find(t => t.id === task.typeId);
  const isTimeout = isTaskTimeout(task, urgencies);

  const TypeIcon = repairType ? iconMap[repairType.icon] || MoreHorizontal : MoreHorizontal;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing transition-all duration-200',
        isDragging && 'opacity-50 shadow-lg rotate-2',
        !isDragging && 'hover:shadow-md hover:-translate-y-0.5'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 rounded-md"
            style={{ backgroundColor: `${urgency?.color}15`, color: urgency?.color }}
          >
            <TypeIcon className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-gray-500">{repairType?.name}</span>
        </div>
        {isTimeout && (
          <div className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            <span className="text-xs font-medium">超时</span>
          </div>
        )}
      </div>

      <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">{task.title}</h4>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="w-3 h-3" />
          <span>{task.building} {task.room}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{formatTimeAgo(task.createdAt)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: urgency?.color }}
          />
          <span className="text-xs font-medium" style={{ color: urgency?.color }}>
            {urgency?.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-3 h-3 text-gray-500" />
          </div>
          <span className="text-xs text-gray-600">{assignee?.name}</span>
        </div>
      </div>
    </div>
  );
};
