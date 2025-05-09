import { Home, Settings, Menu, X, Sun, Moon, BrainCircuit } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ collapsed, setCollapsed, activeTab, setActiveTab }: SidebarProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const navItems = [
    { icon: <Home size={20} />, label: 'Dashboard', id: 'dashboard' },
    { icon: <BrainCircuit size={20} />, label: 'AI Chat', id: 'chat' },
    { icon: <Settings size={20} />, label: 'Settings', id: 'settings' },
  ];

  return (
    <aside
      className={`bg-card fixed inset-y-0 left-0 z-20 flex flex-col border-r border-border transition-all duration-300 ease-in-out pt-7 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <span className="text-xl font-semibold tracking-tight">MCP Desk</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={collapsed ? 'mx-auto' : ''}
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'default' : 'ghost'}
              className={`justify-start ${
                collapsed ? 'h-10 w-10 p-2' : 'h-10 px-4 py-2'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className={`${collapsed ? 'mx-auto' : 'mr-2'}`}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </nav>
      </div>

      <div className="p-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className={collapsed ? 'mx-auto' : 'w-full'}
        >
          {theme === 'light' ? (
            <Moon size={20} />
          ) : (
            <Sun size={20} />
          )}
          {!collapsed && (
            <span className="ml-2">
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </span>
          )}
        </Button>
      </div>
    </aside>
  );
}