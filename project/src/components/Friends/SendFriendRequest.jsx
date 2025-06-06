import React, { useState } from 'react';
import axios from 'axios';

const SendFriendRequest = () => {
  const [receiverId, setReceiverId] = useState('');

  const sendRequest = () => {
    axios.post('/api/friend_requests/', { receiver: receiverId })
      .then(() => {
        setReceiverId('');
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Add Friend</h3>
      <input
        type="text"
        value={receiverId}
        onChange={(e) => setReceiverId(e.target.value)}
        placeholder="Enter user ID"
        className="border p-1 mr-2"
      />
      <button onClick={sendRequest} className="text-blue-500 hover:underline">
        Send Request
      </button>
    </div>
  );
};

export default SendFriendRequest;
