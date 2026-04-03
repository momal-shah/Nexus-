import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, Building2, CircleDollarSign, Users, MessageCircle, 
  Bell, FileText, Settings, HelpCircle, Video, Wallet, Calendar,
  X
} from 'lucide-react';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  isMobile?: boolean;
  onClose?: () => void;
}

const TooltipWrapper: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  return (
    <div className="group relative hidden md:block">
      {children}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-[11px] font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg scale-95 group-hover:scale-100">
        {text}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900" />
      </div>
    </div>
  );
};

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, text, isMobile, onClose }) => {
  const handleClick = () => {
    if (onClose) onClose();
  };

  const linkContent = (
    <NavLink
      to={to}
      onClick={handleClick}
      className={({ isActive }) => 
        `flex items-center py-2.5 px-4 rounded-xl transition-all duration-200 ${
          isActive 
            ? 'bg-primary-50 text-primary-700 shadow-sm' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <span className="mr-3 shrink-0">{icon}</span>
      <span className="text-sm font-medium truncate">{text}</span>
    </NavLink>
  );

  if (isMobile) {
    return linkContent;
  }

  return <TooltipWrapper text={text}>{linkContent}</TooltipWrapper>;
};

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobile = false, onClose }) => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const entrepreneurItems = [
    { to: '/dashboard/entrepreneur', icon: <Home size={20} />, text: 'Dashboard' },
    { to: '/profile/entrepreneur/' + user.id, icon: <Building2 size={20} />, text: 'My Startup' },
    { to: '/investors', icon: <CircleDollarSign size={20} />, text: 'Find Investors' },
    { to: '/messages', icon: <MessageCircle size={20} />, text: 'Messages' },
    { to: '/meetings', icon: <Calendar size={20} />, text: 'Meeting Schedule' },
    { to: '/notifications', icon: <Bell size={20} />, text: 'Notifications' },
    { to: '/documents', icon: <FileText size={20} />, text: 'Documents' },
    { to: '/payments', icon: <Wallet size={20} />, text: 'Payments' },
    { to: '/video', icon: <Video size={20} />, text: 'Video Call' },
  ];
  
  const investorItems = [
    { to: '/dashboard/investor', icon: <Home size={20} />, text: 'Dashboard' },
    { to: '/profile/investor/' + user.id, icon: <CircleDollarSign size={20} />, text: 'My Portfolio' },
    { to: '/entrepreneurs', icon: <Users size={20} />, text: 'Find Startups' },
    { to: '/messages', icon: <MessageCircle size={20} />, text: 'Messages' },
    { to: '/meetings', icon: <Calendar size={20} />, text: 'Meeting Schedule' },
    { to: '/notifications', icon: <Bell size={20} />, text: 'Notifications' },
    { to: '/deals', icon: <FileText size={20} />, text: 'Deals' },
    { to: '/payments', icon: <Wallet size={20} />, text: 'Payments' },
    { to: '/video', icon: <Video size={20} />, text: 'Video Call' },
  ];
  
  const sidebarItems = user.role === 'entrepreneur' ? entrepreneurItems : investorItems;
  
  const commonItems = [
    { to: '/settings', icon: <Settings size={20} />, text: 'Settings' },
    { to: '/help', icon: <HelpCircle size={20} />, text: 'Help & Support' },
  ];
  
  const sidebarContent = (
    <div className="h-full flex flex-col">
      <div className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 space-y-1">
          {sidebarItems.map((item, index) => (
            <SidebarItem
              key={index}
              to={item.to}
              icon={item.icon}
              text={item.text}
              isMobile={isMobile}
              onClose={onClose}
            />
          ))}
        </div>
        
        <div className="mt-8 px-3">
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Settings
          </h3>
          <div className="mt-2 space-y-1">
            {commonItems.map((item, index) => (
              <SidebarItem
                key={index}
                to={item.to}
                icon={item.icon}
                text={item.text}
                isMobile={isMobile}
                onClose={onClose}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-600">Need assistance?</p>
          <h4 className="text-sm font-medium text-gray-900 mt-1">Contact Support</h4>
          <a 
            href="mailto:support@businessnexus.com" 
            className="mt-2 inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-500"
          >
            support@businessnexus.com
          </a>
        </div>
      </div>
    </div>
  );

  // MOBILE DRAWER
  if (isMobile) {
    return (
      <div className="w-72 bg-white h-full border-r border-gray-200 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 shrink-0">
          <span className="text-sm font-bold text-gray-900">Menu</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        {sidebarContent}
      </div>
    );
  }

  // DESKTOP SIDEBAR
  return (
    <div className="w-64 bg-white h-full border-r border-gray-200">
      {sidebarContent}
    </div>
  );
};