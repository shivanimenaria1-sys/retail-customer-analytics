import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Explorer from './pages/Explorer';
import Segments from './pages/Segments';
import Insights from './pages/Insights';
import Settings from './pages/Settings';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-955 dark:text-slate-200">
      <Sidebar />
      <main className="pl-64 min-h-screen transition-colors duration-200">
        <div className="px-8 py-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const AppRoutes = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Explorer />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/segments" element={<Segments />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </DashboardLayout>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppRoutes />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
