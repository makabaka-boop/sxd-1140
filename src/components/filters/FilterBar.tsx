import { useTaskStore } from '@/store/useTaskStore';
import { BUILDINGS, STATUS_LABELS, APPOINTMENT_STATUS_LABELS, FOLLOW_UP_STATUS_LABELS, type TaskStatus, type AppointmentStatus, type FollowUpStatus } from '@/types';
import { Filter, X, ChevronDown, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export const FilterBar = () => {
  const filters = useTaskStore(state => state.filters);
  const setFilters = useTaskStore(state => state.setFilters);
  const resetFilters = useTaskStore(state => state.resetFilters);
  const assignees = useTaskStore(state => state.assignees);
  const urgencies = useTaskStore(state => state.urgencies);

  const hasActiveFilters = filters.assigneeId || filters.building || filters.urgencyId || filters.status || filters.appointmentStatus || filters.followUpStatus;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-gray-700">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">筛选</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={filters.assigneeId || ''}
              onChange={e => setFilters({ assigneeId: e.target.value || null })}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="">全部负责人</option>
              {assignees.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filters.building || ''}
              onChange={e => setFilters({ building: e.target.value || null })}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="">全部楼栋</option>
              {BUILDINGS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filters.urgencyId || ''}
              onChange={e => setFilters({ urgencyId: e.target.value || null })}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="">全部紧急程度</option>
              {urgencies.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filters.status || ''}
              onChange={e => setFilters({ status: (e.target.value as TaskStatus) || null })}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="">全部状态</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filters.appointmentStatus || ''}
              onChange={e => setFilters({ appointmentStatus: (e.target.value as AppointmentStatus) || null })}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
            >
              <option value="">全部预约状态</option>
              {Object.entries(APPOINTMENT_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filters.followUpStatus || ''}
              onChange={e => setFilters({ followUpStatus: (e.target.value as FollowUpStatus) || null })}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
            >
              <option value="">全部跟进状态</option>
              {Object.entries(FOLLOW_UP_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex-1" />

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className={cn(
              'flex items-center gap-1 px-3 py-2 text-sm font-medium',
              'text-gray-500 hover:text-gray-700 transition-colors'
            )}
          >
            <X className="w-4 h-4" />
            清除筛选
          </button>
        )}
      </div>
    </div>
  );
};
