import { Settings, Wrench } from 'lucide-react';
import { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { RoleTab } from '@/components/common/RoleTab';
import { ExportButton } from '@/components/common/ExportButton';
import { ConfigModal } from '@/components/modals/ConfigModal';

export const Header = () => {
  const currentRole = useTaskStore(state => state.currentRole);
  const [showConfig, setShowConfig] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">物业维修看板</h1>
                <p className="text-xs text-gray-500">任务管理系统</p>
              </div>
            </div>

            <RoleTab />

            <div className="flex items-center gap-3">
              <ExportButton />
              {currentRole === 'admin' && (
                <button
                  onClick={() => setShowConfig(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">配置</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      {showConfig && <ConfigModal onClose={() => setShowConfig(false)} />}
    </>
  );
};
