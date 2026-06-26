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
    <nav className="fixed top-0 left-0 w-full z-50 bg-surface-bright/80 backdrop-blur-xl border-b border-platinum-gray/20 px-8 py-5 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center relative">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-display-lg font-black italic tracking-wider text-heritage-navy hover:opacity-95 transition">
            STAYLUXE
          </span>
        </Link>

        {/* Desktop Menu links */}
        <div className="hidden md:flex items-center gap-8 font-label-md text-label-md">
          <Link to="/" className={`transition-colors duration-300 ${location.pathname === '/' ? 'text-steward-gold font-bold' : 'text-on-surface-variant hover:text-heritage-navy'}`}>Home</Link>
          <Link to="/search" className={`transition-colors duration-300 ${location.pathname === '/search' ? 'text-steward-gold font-bold' : 'text-on-surface-variant hover:text-heritage-navy'}`}>Search Hotels</Link>
          <Link to="/partner" className={`transition-colors duration-300 ${location.pathname === '/partner' ? 'text-steward-gold font-bold' : 'text-on-surface-variant hover:text-heritage-navy'}`}>Become a Partner</Link>
          
          {user && (user.role === 'admin' || user.role === 'super_admin') && (
            <Link to="/admin" className="flex items-center gap-1 text-heritage-navy font-bold hover:text-steward-gold transition-colors">
              <ShieldAlert size={14} /> Admin Portal
            </Link>
          )}

          {user && user.role === 'manager' && (
            <Link to="/manager" className="flex items-center gap-1 text-heritage-navy font-bold hover:text-steward-gold transition-colors">
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
                  className="relative p-2 rounded-xl bg-surface-container-lowest border border-platinum-gray/50 text-on-surface-variant hover:text-steward-gold hover:border-steward-gold/30 transition shadow-sm"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-error text-white font-extrabold text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface-bright animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-surface-container-lowest border border-platinum-gray rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-platinum-gray/30">
                      <h4 className="font-title-lg text-title-lg text-heritage-navy text-sm">Notifications</h4>
                      {unreadCount > 0 && (
                        <button onClick={markAllNotificationsRead} className="font-label-sm text-steward-gold hover:underline">Mark all read</button>
                      )}
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-center font-body-md text-xs text-on-surface-variant py-6">No new notifications.</p>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif._id} 
                            onClick={() => {
                              markNotificationRead(notif._id);
                              if (notif.link) navigate(notif.link);
                              setShowNotifications(false);
                            }}
                            className={`p-3 rounded-xl cursor-pointer transition font-body-md text-xs border ${
                              notif.read 
                                ? 'bg-surface-container-low/50 border-transparent text-on-surface-variant' 
                                : 'bg-steward-gold/5 border-steward-gold/20 text-heritage-navy font-semibold'
                            } hover:bg-surface-container`}
                          >
                            <p className="leading-snug">{notif.message}</p>
                            <span className="font-label-sm text-[10px] text-on-surface-variant block mt-1">
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
                  className="flex items-center gap-2 p-2 rounded-xl bg-surface-container-lowest border border-platinum-gray/50 hover:border-steward-gold/30 transition shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center border border-platinum-gray/30">
                    <User size={16} className="text-heritage-navy" />
                  </div>
                  <ChevronDown size={14} className="text-on-surface-variant" />
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-3 w-48 bg-surface-container-lowest border border-platinum-gray rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-platinum-gray/30 mb-1">
                      <p className="font-title-lg text-xs font-bold text-heritage-navy truncate">{user.name}</p>
                      <p className="font-body-md text-[10px] text-on-surface-variant truncate">{user.email}</p>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 font-label-md text-xs text-on-surface-variant hover:text-heritage-navy hover:bg-surface-container rounded-xl transition"
                    >
                      <User size={14} /> My Profile
                    </Link>

                    {user.role === 'manager' && (
                      <Link 
                        to="/manager" 
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 font-label-md text-xs text-heritage-navy hover:text-steward-gold hover:bg-surface-container rounded-xl transition"
                      >
                        <Briefcase size={14} /> Manager Panel
                      </Link>
                    )}

                    {(user.role === 'admin' || user.role === 'super_admin') && (
                      <Link 
                        to="/admin" 
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 font-label-md text-xs text-heritage-navy hover:text-steward-gold hover:bg-surface-container rounded-xl transition"
                      >
                        <ShieldAlert size={14} /> Admin Portal
                      </Link>
                    )}

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 font-label-md text-xs text-error hover:text-on-error hover:bg-error/10 rounded-xl transition mt-1"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-5 py-2.5 font-label-md text-label-md text-heritage-navy hover:text-steward-gold border border-platinum-gray bg-surface-container-lowest rounded-xl hover:border-steward-gold transition duration-300 shadow-sm">Sign In</Link>
              <Link to="/register" className="px-5 py-2.5 font-label-md text-label-md bg-heritage-navy text-linen-white rounded-xl hover:bg-primary-container transition duration-300 shadow-lg">Sign Up</Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 text-on-surface-variant hover:text-heritage-navy">
            <AlignJustify size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {showMobileMenu && (
        <div className="md:hidden mt-4 pt-4 border-t border-platinum-gray/30 flex flex-col gap-3 font-label-md text-sm bg-surface-container-lowest p-4 rounded-xl shadow-lg animate-in slide-in-from-top-4">
          <Link to="/" onClick={() => setShowMobileMenu(false)} className="text-on-surface-variant py-2 hover:text-heritage-navy border-b border-platinum-gray/10">Home</Link>
          <Link to="/search" onClick={() => setShowMobileMenu(false)} className="text-on-surface-variant py-2 hover:text-heritage-navy border-b border-platinum-gray/10">Search Hotels</Link>
          <Link to="/partner" onClick={() => setShowMobileMenu(false)} className="text-on-surface-variant py-2 hover:text-heritage-navy border-b border-platinum-gray/10">Become a Partner</Link>
          
          {user && (user.role === 'admin' || user.role === 'super_admin') && (
            <Link to="/admin" onClick={() => setShowMobileMenu(false)} className="text-heritage-navy font-bold py-2 hover:text-steward-gold border-b border-platinum-gray/10">Admin Portal</Link>
          )}

          {user && user.role === 'manager' && (
            <Link to="/manager" onClick={() => setShowMobileMenu(false)} className="text-heritage-navy font-bold py-2 hover:text-steward-gold">Manager Panel</Link>
          )}
        </div>
      )}
    </nav>
  );
}
