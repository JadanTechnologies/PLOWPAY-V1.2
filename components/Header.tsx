
import React, { useState } from 'react';
import Icon from './icons';
import { useAppContext } from '../hooks/useAppContext';

interface HeaderProps {
  pageTitle: string;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ pageTitle, toggleSidebar }) => {
  const { logout } = useAppContext();
  const [isProfileOpen, setProfileOpen] = useState(false);

  // Guard against undefined pageTitle and handle pre-formatted titles
  const title = pageTitle || '';
  const formattedTitle = title.includes(' ')
    ? title
    : title
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

  return (
    <header className="flex items-center justify-between h-16 px-4 bg-gray-800 border-b border-gray-700 shadow-md">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="p-2 -ml-2 mr-2 text-gray-400 rounded-md lg:hidden hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
          <Icon name="menu" className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold text-white">{formattedTitle}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon name="search" className="w-5 h-5 text-gray-500" />
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="w-full py-2 pl-10 pr-4 text-white bg-gray-700 border border-gray-600 rounded-md sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button className="p-2 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white focus:outline-none">
          <Icon name="notification" className="w-6 h-6" />
        </button>

        <div className="relative">
          <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center space-x-2 focus:outline-none">
            <img 
              className="w-10 h-10 rounded-full" 
              src="https://picsum.photos/100/100" 
              alt="User Avatar"
            />
            <div className='text-left hidden sm:block'>
              <div className="font-medium text-white">Admin User</div>
              <div className="text-sm text-gray-400">Tenant Business</div>
            </div>
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50">
              <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600">Profile</a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600">Settings</a>
              <div className="border-t border-gray-600 my-1"></div>
              <button onClick={logout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-600">
                <Icon name="logout" className="w-5 h-5 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
