import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, CreditCard, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export function UserInfo({ user, onLogout }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <img 
              src={`http://localhost:8000${user.avatar}`} 
              className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center ring-2 ring-white dark:ring-gray-800"
            />
            <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">
              {user.username || 'User'}
            </span>
            <ChevronDown 
              className="w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 hidden sm:block" 
              style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
    
          {isOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-2 z-50">
              <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
    
              <div className="py-1.5">
                <Link to={"/profile"} className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2.5 transition-colors">
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2.5 transition-colors">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2.5 transition-colors">
                  <CreditCard className="w-4 h-4" />
                  Billing
                </button>
              </div>
    
              <div className="py-1.5 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      );
}