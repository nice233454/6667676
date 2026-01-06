import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Clients } from './components/Clients/Clients';
import { Sessions } from './components/Sessions/Sessions';
import { Notes } from './components/Notes/Notes';
import { Payments } from './components/Payments/Payments';
import { AddClientModal } from './components/Clients/AddClientModal';
import { AddSessionModal } from './components/Sessions/AddSessionModal';
import { AddPaymentModal } from './components/Payments/AddPaymentModal';
import { AddNoteModal } from './components/Notes/AddNoteModal';

function MainApp() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showClientModal, setShowClientModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-teal-400 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const pageConfig: Record<string, { title: string; subtitle: string; buttonText: string; onButtonClick: () => void }> = {
    dashboard: {
      title: 'Панель',
      subtitle: 'Краткое описание страницы',
      buttonText: '+ Добавить клиента',
      onButtonClick: () => setShowClientModal(true),
    },
    clients: {
      title: 'Клиенты',
      subtitle: 'Управление клиентской базой',
      buttonText: '+ Добавить клиента',
      onButtonClick: () => setShowClientModal(true),
    },
    sessions: {
      title: 'Сессии',
      subtitle: 'Управление сессиями',
      buttonText: '+ Назначить сессию',
      onButtonClick: () => setShowSessionModal(true),
    },
    notes: {
      title: 'Задания',
      subtitle: 'Управление заметками',
      buttonText: '+ Добавить заметку',
      onButtonClick: () => setShowNoteModal(true),
    },
    payments: {
      title: 'Оплаты',
      subtitle: 'Управление оплатами',
      buttonText: '+ Добавить клиента',
      onButtonClick: () => setShowClientModal(true),
    },
  };

  const config = pageConfig[currentPage] || pageConfig.dashboard;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={config.title}
          subtitle={config.subtitle}
          action={
            <button
              onClick={config.onButtonClick}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
            >
              {config.buttonText}
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto">
          {currentPage === 'dashboard' && <Dashboard key={refreshTrigger} />}
          {currentPage === 'clients' && <Clients key={refreshTrigger} />}
          {currentPage === 'sessions' && <Sessions key={refreshTrigger} />}
          {currentPage === 'notes' && <Notes key={refreshTrigger} />}
          {currentPage === 'payments' && <Payments key={refreshTrigger} />}
        </div>
      </div>

      {showClientModal && (
        <AddClientModal
          onClose={() => setShowClientModal(false)}
          onSuccess={() => {
            handleSuccess();
            setShowClientModal(false);
          }}
        />
      )}

      {showSessionModal && (
        <AddSessionModal
          onClose={() => setShowSessionModal(false)}
          onSuccess={() => {
            handleSuccess();
            setShowSessionModal(false);
          }}
        />
      )}

      {showPaymentModal && (
        <AddPaymentModal
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            handleSuccess();
            setShowPaymentModal(false);
          }}
        />
      )}

      {showNoteModal && (
        <AddNoteModal
          onClose={() => setShowNoteModal(false)}
          onSuccess={() => {
            handleSuccess();
            setShowNoteModal(false);
          }}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
