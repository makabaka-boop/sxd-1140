import { useMemo } from 'react';
import { Users, Clock, FileCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import { getTimeoutTasks, getAssigneeWorkload, getReviewWaitingCount, getUrgentTaskCount, formatTimeAgo } from '@/utils/statistics';
import { STATUS_LABELS } from '@/types';
import { StatCard } from '@/components/common/StatCard';

export const StatsPanel = () => {
  const tasks = useTaskStore(state => state.tasks);
  const urgencies = useTaskStore(state => state.urgencies);
  const assignees = useTaskStore(state => state.assignees);
  const moveRecords = useTaskStore(state => state.moveRecords);

  const stats = useMemo(() => {
    const timeoutCount = getTimeoutTasks(tasks, urgencies).length;
    const workload = getAssigneeWorkload(tasks, assignees);
    const maxLoad = Math.max(...workload.map(w => w.count), 0);
    const reviewWaiting = getReviewWaitingCount(tasks);
    const urgentCount = getUrgentTaskCount(tasks, urgencies);
    const avgLoad = workload.length > 0 ? (workload.reduce((sum, w) => sum + w.count, 0) / workload.length).toFixed(1) : '0';

    return { timeoutCount, workload, maxLoad, reviewWaiting, urgentCount, avgLoad };
  }, [tasks, urgencies, assignees]);

  const latestMove = useMemo(() => {
    return moveRecords.length > 0
      ? moveRecords.sort((a, b) => b.movedAt - a.movedAt)[0]
      : null;
  }, [moveRecords]);

  const latestTask = latestMove ? tasks.find(t => t.id === latestMove.taskId) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="负责人负载"
          value={stats.avgLoad}
          icon={Users}
          subtitle={`人均${stats.avgLoad}个任务，最高${stats.maxLoad}个`}
          color="default"
        />
        <StatCard
          title="超时任务"
          value={stats.timeoutCount}
          icon={Clock}
          color="danger"
          subtitle={`${stats.timeoutCount > 0 ? '请及时处理' : '全部按时'}`}
        />
        <StatCard
          title="复核等待"
          value={stats.reviewWaiting}
          icon={FileCheck}
          color="warning"
          subtitle="待复核任务数量"
        />
        <StatCard
          title="紧急任务"
          value={stats.urgentCount}
          icon={AlertTriangle}
          color="danger"
          subtitle="紧急及以上级别"
        />
      </div>

      {latestMove && latestTask && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                最近移动：{latestTask.title}
              </p>
              <p className="text-xs text-gray-500">
                从「{STATUS_LABELS[latestMove.fromStatus]}」到「{STATUS_LABELS[latestMove.toStatus]}」
                {latestMove.note && ` · ${latestMove.note}`}
                <span className="ml-2 text-gray-400">{formatTimeAgo(latestMove.movedAt)}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
