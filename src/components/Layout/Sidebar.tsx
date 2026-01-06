import { BarChart3, Users, Calendar, Square, DollarSign, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const { signOut, profile } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Панель', icon: BarChart3 },
    { id: 'clients', label: 'Клиенты', icon: Users },
    { id: 'sessions', label: 'Сессии', icon: Calendar },
    { id: 'notes', label: 'Задания', icon: Square },
    { id: 'payments', label: 'Оплата', icon: DollarSign },
  ];

  return (
    <div className="w-52 bg-gray-50 border-r border-gray-200 flex flex-col h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-400 rounded-lg"></div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">PsyPlanner</h1>
            <p className="text-xs text-gray-500">CRM для психологов</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:bg-white hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-10 h-10 bg-teal-400 rounded-lg"></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {profile?.full_name || 'Пользователь'}
            </p>
            <p className="text-xs text-gray-500">Лицензированный психолог</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-gray-900 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span>Выход из системы</span>
        </button>
      </div>
    </div>
  );
}
