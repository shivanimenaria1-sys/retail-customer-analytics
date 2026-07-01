import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UploadCloud, 
  PieChart, 
  Lightbulb, 
  Settings, 
  Sun, 
  Moon,
  LogOut,
  TrendingUp
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Upload Dataset', path: '/upload', icon: UploadCloud },
    { name: 'Segments', path: '/segments', icon: PieChart },
    { name: 'Insights', path: '/insights', icon: Lightbulb },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="fixed bottom-0 left-0 top-0 z-20 flex w-64 flex-col border-r border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6 dark:border-slate-800">
        <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-500" />
        <span className="font-bold text-lg leading-tight">Customer Analytics</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer controls (Theme Switch & Logout) */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-800 space-y-2">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100 cursor-pointer"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button
          onClick={() => navigate('/')}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
