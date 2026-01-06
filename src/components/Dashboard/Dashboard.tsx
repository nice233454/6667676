import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Trash2 } from 'lucide-react';

interface DashboardStats {
  totalClients: number;
  totalSessions: number;
  totalRevenue: number;
}

interface Activity {
  id: string;
  clientName: string;
  sessionType: string;
  payment: string;
}

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalSessions: 0,
    totalRevenue: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year' | 'custom'>('month');

  useEffect(() => {
    if (user) {
      loadStats();
      loadActivities();
    }
  }, [user, period]);

  const loadStats = async () => {
    if (!user) return;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const { data: clients } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth)
      .lte('created_at', endOfMonth);

    const { data: sessions } = await supabase
      .from('sessions')
      .select('id')
      .eq('user_id', user.id)
      .gte('session_date', startOfMonth.split('T')[0])
      .lte('session_date', endOfMonth.split('T')[0]);

    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('user_id', user.id)
      .gte('payment_date', startOfMonth.split('T')[0])
      .lte('payment_date', endOfMonth.split('T')[0]);

    const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    setStats({
      totalClients: clients?.length || 0,
      totalSessions: sessions?.length || 0,
      totalRevenue,
    });
  };

  const loadActivities = async () => {
    if (!user) return;

    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, session_type, clients(full_name), payments(amount, currency)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(9);

    if (sessions) {
      const mapped = sessions.map((s: any) => ({
        id: s.id,
        clientName: s.clients?.full_name || 'Неизвестно',
        sessionType: s.session_type || 'Активная сессия',
        payment: s.payments?.[0]
          ? `${s.payments[0].amount} ${s.payments[0].currency}`
          : '2 000 USD',
      }));
      setActivities(mapped);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">Выбрать период:</span>
          {['день', 'неделя', 'месяц', 'год', 'свой период'].map((label, idx) => {
            const periods: Array<'day' | 'week' | 'month' | 'year' | 'custom'> = ['day', 'week', 'month', 'year', 'custom'];
            const periodValue = periods[idx];
            return (
              <button
                key={label}
                onClick={() => setPeriod(periodValue)}
                className={`${
                  period === periodValue
                    ? 'text-teal-500 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-9xl font-bold text-teal-200 opacity-20">1</div>
          <p className="text-sm text-gray-600 mb-2">Всего клиентов за месяц</p>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold text-teal-500">{stats.totalClients}</span>
            <span className="text-2xl text-teal-500">+</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">активных клиентов</p>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-9xl font-bold text-teal-200 opacity-20">2</div>
          <p className="text-sm text-gray-600 mb-2">Всего сессий за месяц</p>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold text-teal-500">{stats.totalSessions}</span>
            <span className="text-2xl text-teal-500">+</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">сессий, включая сегодня</p>
        </div>

        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-9xl font-bold text-gray-300 opacity-20">3</div>
          <p className="text-sm text-gray-600 mb-2">Доход в текущем месяце</p>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold text-gray-900">{stats.totalRevenue.toFixed(2)}</span>
            <span className="text-xl text-gray-900">₽</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">от завершенных сессий</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Клиент</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Сессия</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Оплаты</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{activity.clientName}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-sm text-gray-900">{activity.sessionType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{activity.payment}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-teal-600 transition-colors">
                        <UserPlus size={18} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
