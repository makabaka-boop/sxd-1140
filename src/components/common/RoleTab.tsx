import { UserCog, Wrench, BarChart3 } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import { ROLE_LABELS, type Role } from '@/types';
import { cn } from '@/lib/utils';

const roles: { id: Role; icon: typeof UserCog; label: string }[] = [
  { id: 'admin', icon: UserCog, label: ROLE_LABELS.admin },
  { id: 'staff', icon: Wrench, label: ROLE_LABELS.staff },
  { id: 'supervisor', icon: BarChart3, label: ROLE_LABELS.supervisor },
];

export const RoleTab = () => {
  const currentRole = useTaskStore(state => state.currentRole);
  const setCurrentRole = useTaskStore(state => state.setCurrentRole);

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {roles.map(role => {
        const Icon = role.icon;
        const isActive = currentRole === role.id;
        return (
          <button
            key={role.id}
            onClick={() => setCurrentRole(role.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{role.label}</span>
          </button>
        );
      })}
    </div>
  );
};
