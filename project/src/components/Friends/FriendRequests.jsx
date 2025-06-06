import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    axios.get('/api/friend_requests/')
      .then(res => setRequests(res.data))
      .catch(err => console.error(err));
  }, []);

  const acceptRequest = (senderId) => {
    axios.post('/api/friends_list/', { friend_id: senderId })
      .then(() => {
        setRequests(prev => prev.filter(req => req.sender.id !== senderId));
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Friend Requests</h3>
      <ul>
        {requests.map(req => (
          <li key={req.id} className="mb-2">
            {req.sender.username}
            <button
              onClick={() => acceptRequest(req.sender.id)}
              className="ml-2 text-green-500 hover:underline"
            >
              Accept
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendRequests;
