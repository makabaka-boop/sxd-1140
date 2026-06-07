import { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useTaskStore } from '@/store/useTaskStore';
import type { TaskStatus, RepairTask } from '@/types';
import { STATUS_LABELS } from '@/types';
import { BoardColumn } from './BoardColumn';
import { TaskCard } from './TaskCard';

const STATUSES: TaskStatus[] = ['pending', 'to_visit', 'processing', 'to_review', 'completed', 'deferred'];

export const KanbanBoard = () => {
  const tasks = useTaskStore(state => state.tasks);
  const filters = useTaskStore(state => state.filters);
  const urgencies = useTaskStore(state => state.urgencies);
  const assignees = useTaskStore(state => state.assignees);
  const repairTypes = useTaskStore(state => state.repairTypes);
  const moveTask = useTaskStore(state => state.moveTask);
  const currentRole = useTaskStore(state => state.currentRole);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<TaskStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.assigneeId && task.assigneeId !== filters.assigneeId) return false;
      if (filters.building && task.building !== filters.building) return false;
      if (filters.urgencyId && task.urgencyId !== filters.urgencyId) return false;
      if (filters.status && task.status !== filters.status) return false;
      return true;
    });
  }, [tasks, filters]);

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, RepairTask[]> = {
      pending: [],
      to_visit: [],
      processing: [],
      to_review: [],
      completed: [],
      deferred: [],
    };
    filteredTasks.forEach(task => {
      map[task.status].push(task);
    });
    return map;
  }, [filteredTasks]);

  const activeTask = activeTaskId ? tasks.find(t => t.id === activeTaskId) : null;

  const handleDragStart = (event: { active: { id: string | number } }) => {
    if (currentRole !== 'staff') return;
    setActiveTaskId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      setOverStatus(over.id as TaskStatus);
    } else {
      setOverStatus(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);
    setOverStatus(null);

    if (!over || currentRole !== 'staff') return;

    const taskId = String(active.id);
    const toStatus = over.id as TaskStatus;
    const task = tasks.find(t => t.id === taskId);

    if (!task || task.status === toStatus) return;

    const fromLabel = STATUS_LABELS[task.status];
    const toLabel = STATUS_LABELS[toStatus];
    const note = `从「${fromLabel}」移动到「${toLabel}」`;

    moveTask(taskId, toStatus, note);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 px-1">
        {STATUSES.map(status => (
          <BoardColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            urgencies={urgencies}
            assignees={assignees}
            repairTypes={repairTypes}
            isOver={overStatus === status}
            disabled={currentRole !== 'staff'}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="w-72 opacity-90 rotate-2 shadow-2xl">
            <TaskCard
              task={activeTask}
              urgencies={urgencies}
              assignees={assignees}
              repairTypes={repairTypes}
              disabled
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
