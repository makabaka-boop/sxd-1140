import { useState } from 'react';
import { Download, ChevronDown, FileJson, FileSpreadsheet } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import { exportToCSV, exportToJSON } from '@/utils/export';

export const ExportButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const tasks = useTaskStore(state => state.tasks);
  const filters = useTaskStore(state => state.filters);
  const urgencies = useTaskStore(state => state.urgencies);
  const repairTypes = useTaskStore(state => state.repairTypes);
  const assignees = useTaskStore(state => state.assignees);

  const filteredTasks = tasks.filter(task => {
    if (filters.assigneeId && task.assigneeId !== filters.assigneeId) return false;
    if (filters.building && task.building !== filters.building) return false;
    if (filters.urgencyId && task.urgencyId !== filters.urgencyId) return false;
    if (filters.status && task.status !== filters.status) return false;
    return true;
  });

  const data = { tasks: filteredTasks, urgencies, repairTypes, assignees };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Download className="w-4 h-4" />
        导出
        <ChevronDown className="w-4 h-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden">
          <button
            onClick={() => {
              exportToCSV(data);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            导出 CSV
          </button>
          <button
            onClick={() => {
              exportToJSON(data);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileJson className="w-4 h-4 text-blue-600" />
            导出 JSON
          </button>
        </div>
      )}
    </div>
  );
};
