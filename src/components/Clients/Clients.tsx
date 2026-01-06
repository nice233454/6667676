import { useEffect, useState } from 'react';
import { Search, Trash2, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AddClientModal } from './AddClientModal';

interface Client {
  id: string;
  full_name: string;
  birth_date: string | null;
  phone: string | null;
  email: string | null;
  contact_method: string | null;
  comment: string;
  created_at: string;
}

export function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'a-z' | 'z-a'>('date');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortClients();
  }, [clients, searchQuery, sortBy]);

  const loadClients = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading clients:', error);
      return;
    }

    setClients(data || []);
  };

  const filterAndSortClients = () => {
    let filtered = [...clients];

    if (searchQuery) {
      filtered = filtered.filter(
        (client) =>
          client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.phone?.includes(searchQuery)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'a-z':
          return a.full_name.localeCompare(b.full_name);
        case 'z-a':
          return b.full_name.localeCompare(a.full_name);
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredClients(filtered);
  };

  const deleteClient = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого клиента?')) return;

    const { error } = await supabase.from('clients').delete().eq('id', id);

    if (error) {
      console.error('Error deleting client:', error);
      return;
    }

    loadClients();
  };

  return (
    <div className="p-8">
      <div className="mb-6 bg-gradient-to-r from-teal-50 to-green-50 rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Найти клиента..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 text-sm">
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">ФИО</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Дата рождения</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Способ связи</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Источник</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Комментарий</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{client.full_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {client.birth_date
                      ? new Date(client.birth_date).toLocaleDateString('ru-RU')
                      : '28.11.2025'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{client.phone || '+79890000000'}</td>
                  <td className="px-6 py-4">
                    <a href={`mailto:${client.email}`} className="text-sm text-teal-500 hover:text-teal-600">
                      {client.email || 'info@gmail.ru'}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {client.comment || 'Краткое описание активной сессии #257677, в несколько строчек'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-teal-600 transition-colors">
                        <UserPlus size={18} />
                      </button>
                      <button
                        onClick={() => deleteClient(client.id)}
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

      {showModal && <AddClientModal onClose={() => setShowModal(false)} onSuccess={loadClients} />}
    </div>
  );
}
