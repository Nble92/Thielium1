import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Home, CoinsIcon, MessageSquare, Settings, HelpCircle, PlayCircle, X,BookOpenText, CandlestickChart,Boxes} from 'lucide-react';


const sidebarItems = [
  { icon: <Home className="w-6 h-6 text-orange-600 dark:text-teal-300 hover:scale-105 transition-transform"  />, label: "Home", to: "/" },
  { icon: <MessageSquare className="w-6 h-6 text-orange-600 dark:text-teal-300 hover:scale-105 transition-transform"  />, label: "Social", to: "/main?tab=feed" }, 
  { icon: <CoinsIcon className="w-6 h-6 text-orange-600 dark:text-teal-300 hover:scale-105 transition-transform"  />, label: "NFT Marketplace", to: "nft" },
  { icon: <CandlestickChart className="w-6 h-6 text-orange-600 dark:text-teal-300 hover:scale-105 transition-transform"  />, label: "Research In Motion" },
  { icon: <BookOpenText className="w-6 h-6 text-orange-600 dark:text-teal-300 hover:scale-105 transition-transform" />, label: "Articles", to: "/main?tab=articles" }, 
  { icon: <Boxes className="w-6 h-6 text-orange-600 dark:text-teal-300 hover:scale-105 transition-transform"  />, label: "MetaClusters", to: "/metaclusters" },
  { icon: <HelpCircle className="w-6 h-6 text-orange-600 dark:text-teal-300 hover:scale-105 transition-transform"  />, label: "Help" },
];

export function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const [width, setWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const minWidth = 80; // Minimum width to accommodate larger icons

  const startResizing = useCallback((e) => {
    if (window.innerWidth >= 1024) { // Only allow resizing on desktop (lg breakpoint)
      setIsResizing(true);
      e.preventDefault();
    }
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e) => {
    if (isResizing) {
      const newWidth = Math.max(minWidth, Math.min(e.clientX, 400));
      setWidth(newWidth);
    }
  }, [isResizing]);

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
      return () => {
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResizing);
      };
    }
  }, [isResizing, resize, stopResizing]);

  const isCollapsed = width <= 96;

  return (
    <>
      {/* Mobile overlay */}
      {/* {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )} */}

      <aside 
        style={{ width: `${width}px` }}
        className={`left-0 h-full z-40 bg-white dark:bg-gray-900 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-orange-200 dark:border-gray-700 mt-16`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute right-4 top-4 p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-700"
          aria-label="Close sidebar"
        >
          <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Resize handle - only visible on desktop */}
        <div
          className="absolute right-0 inset-y-0 w-1 cursor-ew-resize hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors hidden lg:block"
          onMouseDown={startResizing}
        />

        <nav className="p-4 w-full">
          {sidebarItems.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className={`
                flex items-center justify-between px-2 py-3 
                text-gray-700 dark:text-gray-300 
                hover:bg-gray-100 dark:hover:bg-gray-700 
                rounded-xlg mb-1 group relative 
                transition-all duration-300 ease-in-out
              `}
              title={isCollapsed ? item.label : ''}
            >
              

              {/* Label (slides in on hover or expand) */}
              <span
                className={`
                  ml-3 text-sm whitespace-nowrap overflow-hidden
                  transition-all duration-300 ease-in-out
                  ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
                `}
              >
                {item.label}
              </span>
              {/* Icon aligned right (always visible) */}
              <div className="min-w-[24px] flex justify-end items-center text-xl">
                {item.icon}
              </div>

              {/* Tooltip when collapsed */}
              {isCollapsed && (
                <div className="
                  absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs 
                  rounded opacity-0 group-hover:opacity-100 pointer-events-none 
                  transform translate-x-2 group-hover:translate-x-0 
                  transition-all duration-200 z-50
                ">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </nav>

      </aside>
    </>
  );
}