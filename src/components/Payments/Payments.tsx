import { useEffect, useState } from 'react';
import { Search, Trash2, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AddPaymentModal } from './AddPaymentModal';

interface Payment {
  id: string;
  client_id: string;
  amount: number;
  currency: string;
  payment_date: string;
  comment: string;
  clients: {
    full_name: string;
  };
}

export function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadPayments();
    }
  }, [user]);

  useEffect(() => {
    filterPayments();
  }, [payments, searchQuery]);

  const loadPayments = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('payments')
      .select('*, clients(full_name)')
      .eq('user_id', user.id)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Error loading payments:', error);
      return;
    }

    const paymentsData = data || [];
    setPayments(paymentsData);

    const total = paymentsData.reduce((sum, p) => sum + Number(p.amount), 0);
    setTotalRevenue(total);
  };

  const filterPayments = () => {
    let filtered = [...payments];

    if (searchQuery) {
      filtered = filtered.filter(
        (payment) =>
          payment.clients.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.comment.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPayments(filtered);
  };

  const deletePayment = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту оплату?')) return;

    const { error } = await supabase.from('payments').delete().eq('id', id);

    if (error) {
      console.error('Error deleting payment:', error);
      return;
    }

    loadPayments();
  };

  return (
    <div className="p-8">
      <div className="mb-8 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 text-9xl font-bold text-teal-200 opacity-20">₽</div>
        <p className="text-sm text-gray-600 mb-2">Общий доход за месяц</p>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-teal-500">{totalRevenue.toFixed(2)}</span>
          <span className="text-2xl text-teal-500">₽</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">от завершенных сессий</p>
      </div>

      <div className="mb-6 bg-gradient-to-r from-teal-50 to-green-50 rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Поиск оплаты..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Клиент</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Дата оплаты</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Сумма</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Комментарий</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.clients.full_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(payment.payment_date).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-teal-500">
                    {payment.amount} {payment.currency === 'RUB' ? '₽' : payment.currency}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {payment.comment || 'Краткое описание активной сессии #257677, в несколько строчек'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-teal-600 transition-colors">
                        <UserPlus size={18} />
                      </button>
                      <button
                        onClick={() => deletePayment(payment.id)}
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

      {showModal && <AddPaymentModal onClose={() => setShowModal(false)} onSuccess={loadPayments} />}
    </div>
  );
}
