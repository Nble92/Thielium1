import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { supabase } from '../../utils/supabase';
import { UserContext } from '../../context/UserContext';
import { Link } from 'react-router-dom';
import FloatingChat from "../../sections/chat/FloatingChat";



const FriendSidebar = ({ setOpenChats }) => {
  const [friends, setFriends] = useState([]);
  const { user } = useContext(UserContext);

  const [openChatWindows, setOpenChatWindows] = useState([]);

  const handleChatOpen = (friend) => {
    if (!openChatWindows.find(c => c.id === friend.id)) {
      setOpenChatWindows([...openChatWindows, friend]);
    }
  };

  const handleCloseChat = (id) => {
    setOpenChatWindows(openChatWindows.filter(c => c.id !== id));
  };



  useEffect(() => {
    const fetchFriends = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      try {
        const res = await axios.get('/api/friends_list/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFriends(res.data.friends);
      } catch (err) {
        console.error("Failed to fetch friends:", err);
      }
    };

    fetchFriends();
  }, []);


  

  return (
    <div className="p-4 text-gray-900 dark:text-gray-100">
      <h3 className="text-lg font-semibold mb-3">Amigos</h3>
      <ul className="space-y-2">
        {!Array.isArray(friends) || friends.length === 0 ? (
          <li className="text-sm text-gray-500 dark:text-gray-400">No friends yet.</li>
        ) : (
          friends.map((friend, idx) => {
            const avatarUrl = friend?.avatar
              ? `https://aleflabs.net${friend.avatar}`
              : 'https://ui-avatars.com/api/?name=Friend'; // fallback avatar

            return (
              <li
                key={friend?.id || `friend-${idx}`}
                className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <img
                  src={avatarUrl}
                  alt={friend?.username || 'User'}
                  className="w-8 h-8 rounded-full object-cover border border-gray-400"
                />
                <div className="flex-1 overflow-hidden">
                  <span className="block text-sm truncate">
                    {friend?.username || 'Unnamed'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setOpenChats(prev => {
                      if (prev.some(c => c.id === friend?.id)) return prev;
                      return [...prev, friend];
                    })
                  }
                  className="text-sm text-blue-500 hover:underline"
                >
                  Chat
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );

  
};

export default FriendSidebar;

