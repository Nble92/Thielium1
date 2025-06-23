import React, { useState, useRef, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';

const FloatingChat = ({ friend, onClose }) => {
  const [minimized, setMinimized] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const { user } = useContext(UserContext);
  const socketRef = useRef(null);


  const chatRef = useRef(null);

  useEffect(() => {
    // Fetch history or open socket connection here if needed
    setMessages([{ message: "Hey there!", sender: friend.username }]);
  }, [friend]);

  return (
    <div
      className="fixed bottom-0 right-4 w-72 z-50 shadow-xl rounded-t-lg overflow-hidden  bg-white dark:bg-gray-800 flex flex-col"
      style={{ height: minimized ? '40px' : '400px' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between bg-blue-600 text-white px-3 py-2 cursor-pointer"
        onClick={() => setMinimized(!minimized)}
      >
        <div className="flex items-center gap-2">
          <img
            src={`https://aleflabs.net${friend.avatar || ''}`}
            alt={friend.username}
            className="w-6 h-6 rounded-full object-cover border border-white"
          />
          <span className="text-sm font-medium">{friend.username}</span>
        </div>
        <button onClick={onClose}>✕</button>
      </div>

      {/* Chat body */}
      {!minimized && (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800">
          <div className="flex-1 overflow-y-auto p-2 text-sm">
            {messages.map((msg, i) => (
              <div key={i} className="mb-1">
                <strong>{msg.sender}:</strong> {msg.message}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t p-2 flex gap-2">
            <input
              className="flex-1 border rounded px-2 py-1 text-black dark:text-white bg-gray-100 dark:bg-gray-700"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setInput("")}
              placeholder="Type a message..."
            />
            {/* <button
              className="text-sm bg-blue-600 text-white px-2 py-1 rounded"
              onClick={() => setInput("")}
            >
              Send
            </button> */}
            <button
            className="text-sm bg-blue-600 text-white px-2 py-1 rounded"
            onClick={() => {
                if (input.trim()) {
                // Send message via WebSocket
                if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                    socketRef.current.send(JSON.stringify({
                    message: input,
                    sender: user.username,
                    timestamp: new Date().toISOString(),
                    }));
                }

                // Add message locally for instant feedback
                setMessages(prev => [
                    ...prev,
                    {
                    sender: user.username,
                    message: input,
                    timestamp: new Date().toISOString()
                    }
                ]);

                setInput("");
                }
            }}
            >
            Send
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChat;
