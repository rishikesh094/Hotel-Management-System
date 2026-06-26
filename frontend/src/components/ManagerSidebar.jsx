import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ManagerSidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'bookings', label: 'Bookings', icon: 'calendar_month' },
    { id: 'rooms', label: 'Rooms', icon: 'bed' },
    { id: 'guests', label: 'Guests', icon: 'group' },
    { id: 'housekeeping', label: 'Housekeeping', icon: 'cleaning_services' },
    { id: 'reports', label: 'Reports', icon: 'analytics' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col py-8 z-50 bg-heritage-navy w-64 shadow-2xl shadow-heritage-navy/20">
      <div className="px-6 mb-10">
        <h1 className="font-headline-md text-headline-md text-linen-white leading-tight">Majestic Suite</h1>
        <p className="font-label-md text-label-md text-steward-gold uppercase tracking-widest mt-1 opacity-80">Luxury Management</p>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 ${
              activeTab === item.id
                ? 'bg-white/10 text-steward-gold border-r-4 border-steward-gold'
                : 'text-platinum-gray/60 hover:text-linen-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === item.id ? "'FILL' 1" : "" }}>
              {item.icon}
            </span>
            <span className="font-label-md text-label-md">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-3 pt-6 border-t border-white/10 flex flex-col gap-1 mt-auto">
        <button className="flex items-center gap-4 px-4 py-3 rounded-lg text-platinum-gray/60 hover:text-linen-white hover:bg-white/5 transition-all duration-200 w-full text-left">
          <span className="material-symbols-outlined">help</span>
          <span className="font-label-md text-label-md">Support</span>
        </button>
        <button onClick={() => navigate('/login')} className="flex items-center gap-4 px-4 py-3 rounded-lg text-platinum-gray/60 hover:text-linen-white hover:bg-white/5 transition-all duration-200 w-full text-left">
          <span className="material-symbols-outlined">logout</span>
          <span className="font-label-md text-label-md">Logout</span>
        </button>
      </div>
    </aside>
  );
}
