import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/lading/Sidebar';
import { Navbar } from './components/navbar/Navbar';
import { UserProvider } from './context/UserContext';
import { ToastContainer } from 'react-toastify';

import Landing from './sections/landing';
import { NFTList } from './sections/nft';
import { MintNFT } from './sections/mint';
import MetaClusters from './sections/metaclusters/MetaClusters';
import Profile from "./sections/profile";
import ArticleList from "./sections/article/ArticleList";
import ArticleDetail from "./sections/article/ArticleDetail";
import ViewArticleComments from './sections/article/ViewArticleComments';
import NewArticleForm from "./sections/article/NewArticle";
import ChatRoomWrapper from './sections/chat/ChatRoomWrapper';
import FriendSidebar from './components/Friends/FriendSidebar';
import FloatingChat from './sections/chat/FloatingChat';
import OAuthCallbackHandler from "./sections/auth/AuthCallback";

import 'react-toastify/dist/ReactToastify.css';

import { supabase } from "./utils/supabase";
import axios from "axios";

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openChats, setOpenChats] = useState([]);
  const [isSidebarHover, setIsSidebarHover] = useState(false);
  const [isRightSidebarHover, setIsRightSidebarHover] = useState(false);

  const handleCloseChat = (id) => {
    setOpenChats(prev => prev.filter(chat => chat.id !== id));
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // ✅ Supabase session setup and header config
  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
        console.log("✅ Auth token set.");
      } else {
        console.warn("❌ No Supabase session found.");
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
          console.log("🔄 Auth token updated.");
        } else {
          console.warn("❌ Supabase session expired.");
        }
      });
    };

    initSession();
  }, []);

  return (
    <UserProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Navbar setSidebarOpen={setSidebarOpen} darkMode={darkMode} setDarkMode={setDarkMode} />
          <div className="flex">

            {/* Left Sidebar */}
            <div className="group relative" onMouseEnter={() => setIsSidebarHover(true)} onMouseLeave={() => setIsSidebarHover(false)}>
              <div className="fixed top-16 left-0 h-[calc(100%-4rem)] w-64 transform -translate-x-40 group-hover:translate-x-0 transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-30">
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
              </div>
            </div>

            {/* Main */}
            <main className={`flex-1 pt-16 ${isSidebarHover ? "ml-64" : "ml-24"} ${isRightSidebarHover ? "mr-64" : "mr-24"}`} style={{
              backgroundImage: `url(${darkMode ? 'bg-dark.jpg' : 'bg-light.jpg'})`,
              backgroundSize: '100% 100%'
            }}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/nft" element={<NFTList />} />
                <Route path="/mint" element={<MintNFT />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/main" element={<ArticleList />} />
                <Route path="/article_detail" element={<ArticleDetail />} />
                <Route path="/rblock/:queryHash" element={<ArticleDetail />} />
                <Route path="/metaclusters" element={<MetaClusters />} />
                <Route path="/chat/:roomName" element={<ChatRoomWrapper />} />
                <Route path="/new-article" element={<NewArticleForm />} />
                <Route path="/comments/:queryHash" element={<ViewArticleComments />} />
                <Route path="/auth/callback" element={<OAuthCallbackHandler />} />
              </Routes>
            </main>

            {/* Right Sidebar */}
            <div className="group relative h-full" onMouseEnter={() => setIsRightSidebarHover(true)} onMouseLeave={() => setIsRightSidebarHover(false)}>
              <div className="fixed top-16 right-0 h-[calc(100%-4rem)] w-64 transform translate-x-40 group-hover:translate-x-0 transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 bg-transparent shadow-lg z-30 overflow-hidden">
                <div className="absolute inset-0 z-[-2]" style={{
                  backgroundImage: `url(${darkMode ? 'bg-dark.jpg' : 'bg-light.jpg'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }} />
                <div className="absolute inset-0 z-[-1] bg-white dark:bg-gray-900 opacity-90" />
                <div className="relative z-10">
                  <FriendSidebar setOpenChats={setOpenChats} />
                </div>
              </div>
            </div>

            {/* Floating Chats */}
            {openChats.map(friend => (
              <FloatingChat
                key={friend.id}
                friend={friend}
                onClose={() => handleCloseChat(friend.id)}
              />
            ))}
          </div>

          <ToastContainer />
        </div>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
