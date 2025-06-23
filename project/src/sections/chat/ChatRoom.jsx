import React, { useState, useEffect, useRef } from "react";

const ChatRoom = ({ roomName = "room1", senderId = 1, receiverId = 2, senderName = "User 1" }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState("");
  const [socketReady, setSocketReady] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // 1. Fetch chat history
    fetch(`/chat/history/${roomName}/`)
      .then(res => res.json())
      .then(data => setMessages(data));

    // 2. Open WebSocket connection
    const roomName = [user.id, friend.id].sort().join('_');
    socketRef.current = new WebSocket(`ws://aleflabs.net/ws/chat/${roomName}/`);
 

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      setSocketReady(true);
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
    };

    socket.onclose = (e) => {
      console.warn("⚠️ WebSocket closed:", e);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.typing) {
        setTyping(`${data.user} is typing...`);
        setTimeout(() => setTyping(""), 1500);
      } else {
        setMessages(prev => [
          ...prev,
          {
            sender_username: data.sender,
            message: data.message,
            created_at: data.timestamp || new Date().toISOString(),
          },
        ]);
      }
    };

    return () => {
      socket.close();
    };
  }, [roomName]);

  const handleInput = (e) => {
    setInput(e.target.value);

    if (socketReady) {
      socketRef.current.send(
        JSON.stringify({
          typing: true,
          user: senderName,
        })
      );
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    if (socketReady && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          message: input,
          sender: senderId,
          receiver: receiverId,
        })
      );
      setInput("");
    } else {
      console.warn("WebSocket is not open.");
    }
  };

  return (
    <div className="chat-container p-4 text-white">
      <h2 className="text-xl font-bold mb-2">Chat Room: {roomName}</h2>

      <div className="chat-log max-h-60 overflow-y-auto border p-2 mb-2 bg-white text-black rounded">
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.sender_username}</strong>: {msg.message}
            <span style={{ fontSize: "0.8em", color: "#888", marginLeft: "10px" }}>
              {new Date(msg.created_at).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      <div className="mb-2" style={{ fontStyle: "italic", color: "gray" }}>
        {typing}
      </div>

      <input
        className="border p-2 mr-2 rounded text-black"
        value={input}
        onChange={handleInput}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type a message..."
      />
      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={sendMessage}>
        Send
      </button>
    </div>
  );
};

export default ChatRoom;
