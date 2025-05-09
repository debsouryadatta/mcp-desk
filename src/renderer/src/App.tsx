import { useState } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import Dashboard from '@/components/layout/Dashboard';
import ChatPage from '@/components/pages/ChatPage';
import SettingsPage from '@/components/pages/SettingsPage';
import Sidebar from '@/components/layout/Sidebar';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : true;
  });

  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <ThemeProvider defaultTheme="light" storageKey="dashboard-theme">
      <div className="relative min-h-screen overflow-hidden">
        {/* Titlebar area for macOS */}
        <div className="titlebar-area" />
        
        {/* Base gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-50/80 via-background to-background dark:from-indigo-950/20 dark:via-background dark:to-background" />
        
        {/* Radial gradients */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-200/20 via-primary/5 to-transparent dark:from-indigo-500/10" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-100/30 via-primary/5 to-transparent dark:from-indigo-800/10" />
        
        {/* Additional ambient gradients */}
        <div className="fixed inset-0 bg-[conic-gradient(from_0deg_at_0%_50%,_var(--tw-gradient-stops))] from-blue-50/10 via-background to-transparent dark:from-blue-900/10" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,_var(--tw-gradient-stops))] from-purple-100/20 via-transparent to-transparent dark:from-purple-800/10" />
        
        {/* Subtle texture overlay */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_800px_at_100%_100%,_var(--tw-gradient-stops))] from-pink-100/10 via-transparent to-transparent dark:from-pink-900/5" />
        
        {/* Content Container */}
        <div className="relative flex h-screen backdrop-blur-[2px] pt-7">
          <Sidebar 
            collapsed={collapsed} 
            setCollapsed={setCollapsed} 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <main 
            className={`flex-1 overflow-hidden transition-all duration-300 pt-7 ${
              collapsed ? 'ml-16' : 'ml-64'
            }`}
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'chat' && <ChatPage />}
            {activeTab === 'settings' && <SettingsPage />}
          </main>
          <Toaster />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;