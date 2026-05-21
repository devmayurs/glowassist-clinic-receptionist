import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { theme } from './styles/theme';
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
          <Header />
          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 62px)' }}>
            <Sidebar />
            <Box 
              component="main" 
              sx={{ 
                flex: 1, 
                overflowY: 'auto', 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column',
                minWidth: 0
              }}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/appointments" replace />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route path="/calls" element={<CallLogsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/packages" element={<PackagesPage />} />
              </Routes>
            </Box>
            <ChatPanel />
            <ToastContainer />
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
