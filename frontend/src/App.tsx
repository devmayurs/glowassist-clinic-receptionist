import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import ChatPanel from './components/layout/ChatPanel';
import ToastContainer from './components/ui/Toast';
import AppointmentsPage from './pages/AppointmentsPage';
import CallLogsPage from './pages/CallLogsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ClientsPage from './pages/ClientsPage';
import PackagesPage from './pages/PackagesPage';

function App() {
  const startCall = useAppStore((s) => s.startCall);

  useEffect(() => {
    const t = setTimeout(() => {
      startCall('(555) 784-2301');
    }, 3200);
    return () => clearTimeout(t);
  }, [startCall]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-ivory flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 62px)' }}>
          <Sidebar />
          <main className="flex-1 overflow-hidden flex flex-col">
            <Routes>
              <Route path="/" element={<Navigate to="/appointments" replace />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/calls" element={<CallLogsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/packages" element={<PackagesPage />} />
            </Routes>
          </main>
          <ChatPanel />
          <ToastContainer />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
