import { useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { StatsPanel } from '@/components/layout/StatsPanel';
import { FilterBar } from '@/components/filters/FilterBar';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { TaskDetailModal } from '@/components/modals/TaskDetailModal';
import { useTaskStore } from '@/store/useTaskStore';
import { getBacklogTasks, getTimeoutTasks, formatTimeAgo, getTodayAppointments, getUpcomingAppointments, getExpiredAppointments, formatAppointmentTime } from '@/utils/statistics';
import { STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '@/types';
import { AlertTriangle, Clock, User, Calendar, Timer, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const currentRole = useTaskStore(state => state.currentRole);
  const tasks = useTaskStore(state => state.tasks);
  const urgencies = useTaskStore(state => state.urgencies);
  const assignees = useTaskStore(state => state.assignees);

  const supervisorData = useMemo(() => {
    const backlogTasks = getBacklogTasks(tasks, urgencies);
    const timeoutTasks = getTimeoutTasks(tasks, urgencies);
    const todayAppointments = getTodayAppointments(tasks);
    const upcomingAppointments = getUpcomingAppointments(tasks);
    const expiredAppointments = getExpiredAppointments(tasks);
    return { backlogTasks, timeoutTasks, todayAppointments, upcomingAppointments, expiredAppointments };
  }, [tasks, urgencies]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-6">
          <StatsPanel />

          {currentRole === 'supervisor' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-gray-900">超时任务预警</h3>
                  <span className="ml-auto bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                    {supervisorData.timeoutTasks.length}个
                  </span>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {supervisorData.timeoutTasks.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">暂无超时任务 🎉</p>
                  ) : (
                    supervisorData.timeoutTasks.map(task => {
                      const assignee = assignees.find(a => a.id === task.assigneeId);
                      return (
                        <div key={task.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                          <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                            <p className="text-xs text-gray-500">
                              {task.building} {task.room} · {STATUS_LABELS[task.status]}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="w-3 h-3" />
                            {assignee?.name}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-gray-900">积压任务分析</h3>
                  <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">
                    {supervisorData.backlogTasks.length}个
                  </span>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {supervisorData.backlogTasks.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">暂无积压任务 🎉</p>
                  ) : (
                    supervisorData.backlogTasks.map(task => {
                      const assignee = assignees.find(a => a.id === task.assigneeId);
                      return (
                        <div key={task.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                          <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                            <p className="text-xs text-gray-500">
                              {STATUS_LABELS[task.status]} · 创建于 {formatTimeAgo(task.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="w-3 h-3" />
                            {assignee?.name}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {currentRole === 'supervisor' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900">今日预约</h3>
                  <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                    {supervisorData.todayAppointments.length}个
                  </span>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {supervisorData.todayAppointments.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">今日暂无预约</p>
                  ) : (
                    supervisorData.todayAppointments.map(task => {
                      const assignee = assignees.find(a => a.id === task.assigneeId);
                      return (
                        <div key={task.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                            <p className="text-xs text-gray-500">
                              {task.building} {task.room} · {formatAppointmentTime(task.appointment?.scheduledAt || null)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="w-3 h-3" />
                            {assignee?.name}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-gray-900">即将开始</h3>
                  <span className="ml-auto bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                    {supervisorData.upcomingAppointments.length}个
                  </span>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {supervisorData.upcomingAppointments.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">暂无即将开始的预约</p>
                  ) : (
                    supervisorData.upcomingAppointments.map(task => {
                      const assignee = assignees.find(a => a.id === task.assigneeId);
                      return (
                        <div key={task.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                            <p className="text-xs text-gray-500">
                              {task.building} {task.room} · {formatAppointmentTime(task.appointment?.scheduledAt || null)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="w-3 h-3" />
                            {assignee?.name}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Timer className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-gray-900">已过期未处理</h3>
                  <span className="ml-auto bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                    {supervisorData.expiredAppointments.length}个
                  </span>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {supervisorData.expiredAppointments.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">暂无过期预约 🎉</p>
                  ) : (
                    supervisorData.expiredAppointments.map(task => {
                      const assignee = assignees.find(a => a.id === task.assigneeId);
                      return (
                        <div key={task.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                          <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                            <p className="text-xs text-gray-500">
                              {task.building} {task.room} · 预约时间：{formatAppointmentTime(task.appointment?.scheduledAt || null)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="w-3 h-3" />
                            {assignee?.name}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          <FilterBar />
          <KanbanBoard />
        </div>
      </main>
      <TaskDetailModal />
    </div>
  );
}
