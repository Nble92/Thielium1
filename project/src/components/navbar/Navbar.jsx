import { Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { ConnectButton } from './ConnectButton';
import { UserInfo } from './UserInfo';
import { UserContext } from '../../context/UserContext';
import { supabase } from '../../utils/supabase';
import { Bell } from 'lucide-react';
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';


export function Navbar({ setSidebarOpen, darkMode, setDarkMode }) {
  const { user, setUser } = useContext(UserContext);
  const [friendRequests, setFriendRequests] = useState([]);
  const [open, setOpen] = useState(false);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem("access_token");
  };

  useEffect(() => {
    const fetchFriendRequests = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
  
      try {
        const res = await axios.get('/api/friend_requests/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFriendRequests(res.data);
      } catch (err) {
        console.error("Failed to fetch friend requests:", err);
      }
    };
  
    fetchFriendRequests();
  }, []);
  

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
    <div className="h-full max-w-7xl mx-auto flex items-center justify-between px-2 sm:px-4">
      <div className="flex items-center gap-1 sm:gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex items-center">
          <div className="flex items-center gap-1 sm:gap-2">
            <img 
              src={`${darkMode ? '/logo-light.png' : '/logo-dark.png'}`} 
              className="w-8 sm:w-9 transition-all" 
              alt="Logo" 
            />
            <div className="hidden sm:block text-2xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">
              THIELIUM
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex items-center gap-1 sm:gap-3">
          <ConnectButton />
          <UserInfo user={user} onLogout={handleLogout} />
          <div className="mx-0.5 sm:mx-2 h-6 w-px bg-gray-200 dark:bg-gray-700" />
          <div className="relative">
            <button onClick={() => setOpen(!open)} className="relative p-2">
              <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              {friendRequests.length > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-md rounded z-50 p-2 max-h-64 overflow-y-auto">
                {Array.isArray(friendRequests) ? (
                  friendRequests.length === 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-300">No friend requests.</p>
                  ) : (
                    friendRequests.map((req, idx) => (
                      <div
                        key={req?.id || `req-${idx}`}
                        className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700"
                      >
                        <span className="text-sm text-gray-800 dark:text-gray-200">
                          {req?.sender?.username || 'Unknown'}
                        </span>
                        <button
                          onClick={async () => {
                            try {
                              const { data: { session } } = await supabase.auth.getSession();
                              const token = session?.access_token;
                              if (!token) return;

                              await axios.post('/api/friends_list/', { friend_id: req?.sender?.id }, {
                                headers: { Authorization: `Bearer ${token}` }
                              });

                              setFriendRequests(prev => prev.filter(r => r?.id !== req?.id));
                            } catch (err) {
                              console.error("Accept failed:", err);
                            }
                          }}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                        >
                          Accept
                        </button>
                      </div>
                    ))
                  )
                ) : (
                  <p className="text-sm text-red-500">Friend data unavailable.</p>
                )}
              </div>
            )}

          </div>

          <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        </div>
      </div>
    </div>
  </nav>
  );
}

