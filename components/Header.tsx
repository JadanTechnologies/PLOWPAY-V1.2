

import React, { useState, useEffect, useMemo } from 'react';
import Icon from './icons/index.tsx';
import { useAppContext } from '../hooks/useAppContext';
import { Announcement } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import Calculator from './Calculator';

interface HeaderProps {
  pageTitle: string;
  toggleSidebar: () => void;
  onNavigateToProfile?: () => void;
}

const Header: React.FC<HeaderProps> = ({ pageTitle, toggleSidebar, onNavigateToProfile }) => {
  const { 
    logout, setSearchTerm: setGlobalSearchTerm, 
    announcements, currentAdminUser, markAnnouncementAsRead,
    inAppNotifications, currentTenant, markInAppNotificationAsRead
  } = useAppContext();
  const { t, currentLanguage, changeLanguage, availableLanguages } = useTranslation();
  
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isAnnouncementsOpen, setAnnouncementsOpen] = useState(false);
  const [isLanguageOpen, setLanguageOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const isSuperAdmin = !!currentAdminUser;
  const userId = currentAdminUser?.id || currentTenant?.id || 'guest';

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  // Debounce search term update
  useEffect(() => {
    setIsSearching(true);
    const handler = setTimeout(() => {
      setGlobalSearchTerm(localSearchTerm);
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(handler);
  }, [localSearchTerm, setGlobalSearchTerm]);

  const handleClearSearch = () => {
    setLocalSearchTerm('');
  };

  const relevantAnnouncements = useMemo(() => {
    return announcements.filter(anno => {
        if (anno.targetAudience === 'ALL') return true;
        if (isSuperAdmin && anno.targetAudience === 'STAFF') return true;
        if (!isSuperAdmin && anno.targetAudience === 'TENANTS') return true;
        return false;
    }).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [announcements, isSuperAdmin]);

  const unreadAnnouncementsCount = useMemo(() => {
      return relevantAnnouncements.filter(anno => !anno.readBy.includes(userId)).length;
  }, [relevantAnnouncements, userId]);

  const userNotifications = useMemo(() => {
      if(isSuperAdmin) return [];
      return inAppNotifications.filter(n => n.userId === userId).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [inAppNotifications, userId, isSuperAdmin]);
  
  const unreadNotificationsCount = useMemo(() => {
    return userNotifications.filter(n => !n.read).length;
  }, [userNotifications]);

  const handleAnnouncementsToggle = () => {
      setAnnouncementsOpen(!isAnnouncementsOpen);
      if (!isAnnouncementsOpen) {
          relevantAnnouncements.forEach(anno => {
              if (!anno.readBy.includes(userId)) {
                  markAnnouncementAsRead(anno.id, userId);
              }
          });
      }
  };
  
  const handleNotificationsToggle = () => {
      setNotificationsOpen(!isNotificationsOpen);
      if (!isNotificationsOpen) {
          userNotifications.forEach(n => {
              if(!n.read) {
                  markInAppNotificationAsRead(n.id);
              }
          });
      }
  };
  
  const handleLanguageChange = (langCode: string) => {
      changeLanguage(langCode);
      setLanguageOpen(false);
  };

  const title = pageTitle || '';
  const formattedTitle = title.includes(' ') ? title : t(title.toLowerCase().replace(/_/g, ''));
        
  return (
    <>
      <header className="flex items-center justify-between h-16 px-4 bg-slate-900/70 backdrop-blur-xl border-b border-slate-800 shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="p-2 -ml-2 mr-2 text-slate-400 rounded-md lg:hidden hover:bg-slate-700/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
            <Icon name="menu" className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-white">{formattedTitle}</h1>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="relative group flex items-center">
              <span className={`h-2.5 w-2.5 rounded-full transition-colors ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700">
                  {isOnline ? 'Online' : 'Offline'}
              </span>
          </div>

          <div className="hidden md:block text-lg font-medium text-slate-300 font-mono tracking-wider tabular-nums">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              {isSearching && localSearchTerm ? (
                <svg className="w-5 h-5 text-slate-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Icon name="search" className="w-5 h-5 text-slate-500" />
              )}
            </span>
            <input
              type="text"
              placeholder="Search..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-10 text-white bg-slate-800 border border-slate-700 rounded-md sm:w-48 md:w-64 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
            {localSearchTerm && (
              <button onClick={handleClearSearch} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white transition-colors" aria-label="Clear search">
                <Icon name="x-mark" className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="relative">
              <button onClick={() => setIsCalculatorOpen(true)} className="p-2 text-slate-400 rounded-full hover:bg-slate-700/50 hover:text-white focus:outline-none" aria-label="Open calculator">
                  <Icon name="calculator" className="w-6 h-6" />
              </button>
          </div>

          <div className="relative">
              <button onClick={() => setLanguageOpen(!isLanguageOpen)} className="p-2 text-slate-400 rounded-full hover:bg-slate-700/50 hover:text-white focus:outline-none">
                  <Icon name="globe" className="w-6 h-6" />
              </button>
              {isLanguageOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-slate-800 rounded-md shadow-lg z-50 border border-slate-700">
                      <ul className="py-1">
                          {availableLanguages.map(lang => (
                              <li key={lang.code}><button onClick={() => handleLanguageChange(lang.code)} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 ${currentLanguage === lang.code ? 'text-cyan-400 font-semibold' : 'text-slate-300'}`}>{lang.name}</button></li>
                          ))}
                      </ul>
                  </div>
              )}
          </div>

          {!isSuperAdmin && (
              <div className="relative">
                  <button onClick={handleNotificationsToggle} className="relative p-2 text-slate-400 rounded-full hover:bg-slate-700/50 hover:text-white focus:outline-none">
                      <Icon name="notification" className="w-6 h-6" />
                      {unreadNotificationsCount > 0 && (
                          <span className="absolute top-0 right-0 h-4 w-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">{unreadNotificationsCount}</span>
                      )}
                  </button>
                  {isNotificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-md shadow-lg z-50 border border-slate-700">
                          <div className="p-3 font-semibold text-white border-b border-slate-700">Notifications</div>
                          <ul className="py-1 max-h-80 overflow-y-auto">
                              {userNotifications.length > 0 ? userNotifications.map(n => (
                                  <li key={n.id} className={`px-4 py-3 hover:bg-slate-700 border-b border-slate-700/50 last:border-b-0 ${!n.read ? 'bg-cyan-900/30' : ''}`}>
                                      <p className="text-sm text-slate-200">{n.message}</p>
                                      <p className="text-right text-xs text-slate-400 mt-2">{n.createdAt.toLocaleDateString()}</p>
                                  </li>
                              )) : (
                                  <li className="px-4 py-3 text-sm text-slate-400">No new notifications.</li>
                              )}
                          </ul>
                      </div>
                  )}
              </div>
          )}

          <div className="relative">
              <button onClick={handleAnnouncementsToggle} className="relative p-2 text-slate-400 rounded-full hover:bg-slate-700/50 hover:text-white focus:outline-none">
                  <Icon name="chat-bubble-left-right" className="w-6 h-6" />
                  {unreadAnnouncementsCount > 0 && (
                      <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">{unreadAnnouncementsCount}</span>
                  )}
              </button>
              {isAnnouncementsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-md shadow-lg z-50 border border-slate-700">
                      <div className="p-3 font-semibold text-white border-b border-slate-700">Announcements</div>
                      <ul className="py-1 max-h-80 overflow-y-auto">
                          {relevantAnnouncements.length > 0 ? relevantAnnouncements.map(anno => (
                              <li key={anno.id} className="px-4 py-3 hover:bg-slate-700 border-b border-slate-700/50 last:border-b-0">
                                  <p className="font-bold text-sm text-slate-200">{anno.title}</p>
                                  <p className="text-xs text-slate-300 mt-1">{anno.content}</p>
                                  <p className="text-right text-xs text-slate-400 mt-2">{anno.createdAt.toLocaleDateString()}</p>
                              </li>
                          )) : (
                              <li className="px-4 py-3 text-sm text-slate-400">No new announcements.</li>
                          )}
                      </ul>
                  </div>
              )}
          </div>


          <div className="relative">
            <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center space-x-2 focus:outline-none">
              <img className="w-10 h-10 rounded-full border-2 border-slate-700" src={isSuperAdmin ? currentAdminUser?.avatarUrl : "https://picsum.photos/seed/tenant/100"} alt="User Avatar" />
              <div className='text-left hidden sm:block'>
                <div className="font-medium text-white">{isSuperAdmin ? currentAdminUser?.name : currentTenant?.ownerName}</div>
                <div className="text-sm text-slate-400">{isSuperAdmin ? 'Super Admin' : currentTenant?.businessName}</div>
              </div>
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg py-1 z-50 border border-slate-700">
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToProfile?.(); setProfileOpen(false); }} className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">Profile</a>
                <div className="border-t border-slate-700 my-1"></div>
                <button onClick={logout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-slate-700">
                  <Icon name="logout" className="w-5 h-5 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      {isCalculatorOpen && <Calculator onClose={() => setIsCalculatorOpen(false)} />}
    </>
  );
};

export default Header;