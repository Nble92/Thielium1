// src/sections/chat/ChatRoomWrapper.jsx
import React from "react";
import { useParams } from "react-router-dom";
import ChatRoom from "./ChatRoom";

const ChatRoomWrapper = () => {
  const { roomName } = useParams();

  return (
    <ChatRoom
      roomName={roomName}
      senderId={1}          // Replace with dynamic user ID if logged in
      receiverId={2}        // Optional: if using 1-on-1 structure
      senderName="User 1"   // Replace with actual username
    />
  );
};

export default ChatRoomWrapper;
