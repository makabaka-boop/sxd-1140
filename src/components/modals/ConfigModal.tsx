import { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import type { Urgency, RepairType } from '@/types';
import { cn } from '@/lib/utils';

interface ConfigModalProps {
  onClose: () => void;
}

type TabType = 'urgency' | 'repairType';

export const ConfigModal = ({ onClose }: ConfigModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('urgency');
  const tasks = useTaskStore(state => state.tasks);
  const urgencies = useTaskStore(state => state.urgencies);
  const repairTypes = useTaskStore(state => state.repairTypes);
  const addUrgency = useTaskStore(state => state.addUrgency);
  const updateUrgency = useTaskStore(state => state.updateUrgency);
  const deleteUrgency = useTaskStore(state => state.deleteUrgency);
  const addRepairType = useTaskStore(state => state.addRepairType);
  const updateRepairType = useTaskStore(state => state.updateRepairType);
  const deleteRepairType = useTaskStore(state => state.deleteRepairType);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newUrgency, setNewUrgency] = useState({ name: '', color: '#52c41a', timeoutHours: 24 });
  const [newRepairType, setNewRepairType] = useState({ name: '', icon: 'MoreHorizontal' });
  const [editForm, setEditForm] = useState<Partial<Urgency | RepairType>>({});

  const isUrgencyUsed = (urgencyId: string): boolean => {
    return tasks.some(t => t.urgencyId === urgencyId);
  };

  const isRepairTypeUsed = (typeId: string): boolean => {
    return tasks.some(t => t.typeId === typeId);
  };

  const handleDeleteUrgency = (id: string) => {
    if (isUrgencyUsed(id)) {
      alert('该紧急程度正在被任务使用，无法删除！');
      return;
    }
    deleteUrgency(id);
  };

  const handleDeleteRepairType = (id: string) => {
    if (isRepairTypeUsed(id)) {
      alert('该维修类型正在被任务使用，无法删除！');
      return;
    }
    deleteRepairType(id);
  };

  const handleAddUrgency = () => {
    if (!newUrgency.name.trim()) return;
    addUrgency(newUrgency);
    setNewUrgency({ name: '', color: '#52c41a', timeoutHours: 24 });
  };

  const handleAddRepairType = () => {
    if (!newRepairType.name.trim()) return;
    addRepairType(newRepairType);
    setNewRepairType({ name: '', icon: 'MoreHorizontal' });
  };

  const startEdit = (item: Urgency | RepairType, type: TabType) => {
    setEditingId(item.id);
    setEditForm(type === 'urgency' 
      ? { name: (item as Urgency).name, color: (item as Urgency).color, timeoutHours: (item as Urgency).timeoutHours }
      : { name: (item as RepairType).name, icon: (item as RepairType).icon }
    );
  };

  const saveEdit = (id: string, type: TabType) => {
    if (type === 'urgency') {
      updateUrgency(id, editForm as Partial<Urgency>);
    } else {
      updateRepairType(id, editForm as Partial<RepairType>);
    }
    setEditingId(null);
    setEditForm({});
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">系统配置</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('urgency')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'urgency'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            紧急程度配置
          </button>
          <button
            onClick={() => setActiveTab('repairType')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'repairType'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            维修类型配置
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          {activeTab === 'urgency' && (
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-3">
                <input
                  type="text"
                  placeholder="名称"
                  value={newUrgency.name}
                  onChange={e => setNewUrgency({ ...newUrgency, name: e.target.value })}
                  className="col-span-4 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="color"
                  value={newUrgency.color}
                  onChange={e => setNewUrgency({ ...newUrgency, color: e.target.value })}
                  className="col-span-2 h-10 border border-gray-200 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  placeholder="超时(小时)"
                  value={newUrgency.timeoutHours}
                  onChange={e => setNewUrgency({ ...newUrgency, timeoutHours: Number(e.target.value) })}
                  className="col-span-3 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddUrgency}
                  className="col-span-3 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加
                </button>
              </div>

              <div className="space-y-2">
                {urgencies.map(u => (
                  <div key={u.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {editingId === u.id ? (
                      <>
                        <input
                          type="text"
                          value={(editForm as Partial<Urgency>).name || ''}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm"
                        />
                        <input
                          type="color"
                          value={(editForm as Partial<Urgency>).color || '#52c41a'}
                          onChange={e => setEditForm({ ...editForm, color: e.target.value })}
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="number"
                          value={(editForm as Partial<Urgency>).timeoutHours || 0}
                          onChange={e => setEditForm({ ...editForm, timeoutHours: Number(e.target.value) })}
                          className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                        />
                        <button onClick={() => saveEdit(u.id, 'urgency')} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                          <Check className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: u.color }} />
                        <span className="flex-1 text-sm font-medium text-gray-700">{u.name}</span>
                        <span className="text-xs text-gray-500">{u.timeoutHours}小时超时</span>
                        <button onClick={() => startEdit(u, 'urgency')} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUrgency(u.id)}
                          disabled={isUrgencyUsed(u.id)}
                          className={cn(
                            'p-1.5 rounded transition-colors',
                            isUrgencyUsed(u.id)
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          )}
                          title={isUrgencyUsed(u.id) ? '正在被任务使用，无法删除' : '删除'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'repairType' && (
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-3">
                <input
                  type="text"
                  placeholder="类型名称"
                  value={newRepairType.name}
                  onChange={e => setNewRepairType({ ...newRepairType, name: e.target.value })}
                  className="col-span-6 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newRepairType.icon}
                  onChange={e => setNewRepairType({ ...newRepairType, icon: e.target.value })}
                  className="col-span-4 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Zap">Zap</option>
                  <option value="Wind">Wind</option>
                  <option value="DoorOpen">DoorOpen</option>
                  <option value="LayoutGrid">LayoutGrid</option>
                  <option value="Droplets">Droplets</option>
                  <option value="MoreHorizontal">MoreHorizontal</option>
                </select>
                <button
                  onClick={handleAddRepairType}
                  className="col-span-2 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加
                </button>
              </div>

              <div className="space-y-2">
                {repairTypes.map(t => (
                  <div key={t.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {editingId === t.id ? (
                      <>
                        <input
                          type="text"
                          value={(editForm as Partial<RepairType>).name || ''}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm"
                        />
                        <button onClick={() => saveEdit(t.id, 'repairType')} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                          <Check className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm font-medium text-gray-700">{t.name}</span>
                        <span className="text-xs text-gray-500">{t.icon}</span>
                        <button onClick={() => startEdit(t, 'repairType')} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRepairType(t.id)}
                          disabled={isRepairTypeUsed(t.id)}
                          className={cn(
                            'p-1.5 rounded transition-colors',
                            isRepairTypeUsed(t.id)
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          )}
                          title={isRepairTypeUsed(t.id) ? '正在被任务使用，无法删除' : '删除'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
