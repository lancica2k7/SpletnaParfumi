import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  const navItems = [
    { labelKey: 'dashboard', path: '/admin', icon: 'D', exact: true },
    { labelKey: 'users', path: '/admin/users', icon: 'U' },
    { labelKey: 'products', path: '/admin/products', icon: 'P' },
    { labelKey: 'orders', path: '/admin/orders', icon: 'O' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside
      className="flex flex-col bg-slate-900 text-white shadow-2xl transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? '80px' : '260px', minHeight: '100vh' }}
    >
      <div className="flex flex-col gap-4 border-b border-slate-800 px-5 py-6">
        {!collapsed && (
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Parfumerija</p>
            <h1 className="mt-1 text-xl font-bold text-white">CICKO Admin</h1>
          </div>
        )}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex h-10 w-10 items-center justify-center self-end rounded-xl border border-slate-700 bg-slate-800 text-lg transition hover:border-slate-500 hover:bg-slate-700"
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span className="text-xl font-bold" aria-hidden="true">{item.icon}</span>
            {!collapsed && <span>{item.label || t(item.labelKey)}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 px-3 py-4 space-y-1">
        <button
          onClick={() => navigate('/')}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <span className="text-xl font-bold" aria-hidden="true">←</span>
          {!collapsed && <span>{language === 'sl' ? 'Nazaj v trgovino' : 'Back to Store'}</span>}
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <span className="text-xl font-bold" aria-hidden="true">X</span>
          {!collapsed && <span>{t('logout')}</span>}
        </button>
      </div>

      {!collapsed && (
        <div className="border-t border-slate-800 px-5 py-4 text-xs text-slate-500">
          <p>{language === 'sl' ? 'Premium admin panel' : 'Premium admin panel'}</p>
          <p className="mt-1">{language === 'sl' ? 'Varen · Odziven' : 'Secure · Responsive'}</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
