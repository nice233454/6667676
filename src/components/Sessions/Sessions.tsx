import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AddSessionModal } from './AddSessionModal';

interface Session {
  id: string;
  client_id: string;
  session_date: string;
  session_time: string;
  session_type: string;
  comment: string;
  clients: {
    full_name: string;
  };
}

export function Sessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(new Date());
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'a-z' | 'z-a'>('date');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay() + 1);
    setWeekStart(start);
  }, [selectedDate]);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user, selectedDate]);

  const loadSessions = async () => {
    if (!user) return;

    const dateStr = selectedDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('sessions')
      .select('*, clients(full_name)')
      .eq('user_id', user.id)
      .eq('session_date', dateStr)
      .order('session_time', { ascending: true });

    if (error) {
      console.error('Error loading sessions:', error);
      return;
    }

    setSessions(data || []);
  };

  const deleteSession = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту сессию?')) return;

    const { error } = await supabase.from('sessions').delete().eq('id', id);

    if (error) {
      console.error('Error deleting session:', error);
      return;
    }

    loadSessions();
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  const weekDays = getWeekDays();
  const dayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Текущая неделя</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateWeek('prev')}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              предыдущая
            </button>
            <span className="text-sm text-teal-500 font-medium">сегодня</span>
            <button
              onClick={() => navigateWeek('next')}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              следующая
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, idx) => {
            const isSelected = day.toDateString() === selectedDate.toDateString();
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={`rounded-xl p-4 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-teal-400 to-green-400 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="text-5xl font-bold mb-2">{day.getDate()}</div>
                <div className="text-xs mb-1">
                  {day.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                </div>
                <div className="text-sm font-medium">{dayNames[idx]}</div>
                {isSelected && <div className="text-xs mt-2 text-teal-100">4 встречи</div>}
                {!isSelected && <div className="text-xs mt-2 text-gray-400">Встреч нет</div>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Текущие сессии {selectedDate.toLocaleDateString('ru-RU')}
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">Сортировать по:</span>
          {[
            { value: 'date', label: 'дате' },
            { value: 'popularity', label: 'популярности' },
            { value: 'a-z', label: 'А-Я' },
            { value: 'z-a', label: 'Я-А' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value as any)}
              className={`${
                sortBy === option.value ? 'text-teal-500 font-medium' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Клиент</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Тип сессии</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Дата</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Время</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Комментарий</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{session.clients.full_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-sm text-gray-900">{session.session_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(session.session_date).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{session.session_time.slice(0, 5)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {session.comment || 'Краткое описание активной сессии #257677, в несколько строчек'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-teal-600 transition-colors">
                        <UserPlus size={18} />
                      </button>
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      >
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

      {showModal && <AddSessionModal onClose={() => setShowModal(false)} onSuccess={loadSessions} />}
    </div>
  );
}
