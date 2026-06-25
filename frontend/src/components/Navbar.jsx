import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bell, User, LogOut, ShieldAlert, Award, Briefcase, ChevronDown, AlignJustify } from 'lucide-react';

export default function Navbar() {
  const { user, logout, notifications, markNotificationRead, markAllNotificationsRead } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
    navigate('/');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-slate-950/50 backdrop-blur-xl border-b border-white/5 px-8 py-5 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto flex justify-between items-center relative">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-serif font-black italic tracking-wider bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hover:opacity-95 transition">
            STAYLUXE
          </span>
        </Link>

        {/* Desktop Menu links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className={`transition-colors duration-300 ${location.pathname === '/' ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'text-gray-300 hover:text-white'}`}>Home</Link>
          <Link to="/search" className={`transition-colors duration-300 ${location.pathname === '/search' ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'text-gray-300 hover:text-white'}`}>Search Hotels</Link>
          <Link to="/partner" className={`transition-colors duration-300 ${location.pathname === '/partner' ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'text-gray-300 hover:text-white'}`}>Become a Partner</Link>
          
          {user && (user.role === 'admin' || user.role === 'super_admin') && (
            <Link to="/admin" className="flex items-center gap-1 text-teal-400 hover:text-teal-300 transition-colors">
              <ShieldAlert size={14} /> Admin Portal
            </Link>
          )}

          {user && user.role === 'manager' && (
            <Link to="/manager" className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors">
              <Briefcase size={14} /> Manager Panel
            </Link>
          )}
        </div>

        {/* Right side widgets (notifications + profile dropdown) */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Notification Widget */}
              <div className="relative">
                <button 
                  onClick={() => { setShowNotifications(!showNotifications); setShowProfileDropdown(false); }}
                  className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-gray-400 hover:text-white hover:border-slate-700 transition"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 glass bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-900">
                      <h4 className="font-bold text-white text-sm">Notifications</h4>
                      {unreadCount > 0 && (
                        <button onClick={markAllNotificationsRead} className="text-xs text-indigo-400 hover:underline">Mark all read</button>
                      )}
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-center text-xs text-gray-500 py-6">No new notifications.</p>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif._id} 
                            onClick={() => {
                              markNotificationRead(notif._id);
                              if (notif.link) navigate(notif.link);
                              setShowNotifications(false);
                            }}
                            className={`p-3 rounded-xl cursor-pointer transition text-xs border ${
                              notif.read 
                                ? 'bg-slate-900/20 border-transparent text-gray-400' 
                                : 'bg-indigo-500/5 border-indigo-500/20 text-gray-200 font-semibold'
                            } hover:bg-slate-800/40`}
                          >
                            <p className="leading-snug">{notif.message}</p>
                            <span className="text-[10px] text-gray-600 block mt-1">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown Widget */}
              <div className="relative">
                <button 
                  onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotifications(false); }}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <User size={16} className="text-indigo-400" />
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-3 w-48 glass bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-slate-900 mb-1">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-slate-900 rounded-xl transition"
                    >
                      <User size={14} /> My Profile
                    </Link>

                    {user.role === 'manager' && (
                      <Link 
                        to="/manager" 
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:text-amber-300 hover:bg-slate-900 rounded-xl transition"
                      >
                        <Briefcase size={14} /> Manager Panel
                      </Link>
                    )}

                    {(user.role === 'admin' || user.role === 'super_admin') && (
                      <Link 
                        to="/admin" 
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-teal-400 hover:text-teal-300 hover:bg-slate-900 rounded-xl transition"
                      >
                        <ShieldAlert size={14} /> Admin Portal
                      </Link>
                    )}

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-slate-900 rounded-xl transition mt-1"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-5 py-2.5 text-xs font-bold text-gray-300 hover:text-white border border-white/5 bg-white/5 rounded-xl hover:bg-white/10 hover:border-white/10 transition duration-300">Sign In</Link>
              <Link to="/register" className="px-5 py-2.5 text-xs font-bold btn-luxury rounded-xl transition duration-300">Sign Up</Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 text-gray-400 hover:text-white">
            <AlignJustify size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {showMobileMenu && (
        <div className="md:hidden mt-4 pt-4 border-t border-slate-900 flex flex-col gap-3 text-sm font-medium animate-in slide-in-from-top-4">
          <Link to="/" onClick={() => setShowMobileMenu(false)} className="text-gray-300 py-1 hover:text-white">Home</Link>
          <Link to="/search" onClick={() => setShowMobileMenu(false)} className="text-gray-300 py-1 hover:text-white">Search Hotels</Link>
          <Link to="/partner" onClick={() => setShowMobileMenu(false)} className="text-gray-300 py-1 hover:text-white">Become a Partner</Link>
          
          {user && (user.role === 'admin' || user.role === 'super_admin') && (
            <Link to="/admin" onClick={() => setShowMobileMenu(false)} className="text-teal-400 py-1 hover:text-teal-300">Admin Portal</Link>
          )}

          {user && user.role === 'manager' && (
            <Link to="/manager" onClick={() => setShowMobileMenu(false)} className="text-amber-400 py-1 hover:text-amber-300">Manager Panel</Link>
          )}
        </div>
      )}
    </nav>
  );
}
