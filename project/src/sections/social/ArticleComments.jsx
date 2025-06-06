// Updated: ArticleComments.jsx with threaded replies and enhanced layout (fixed reply insertion + white screen fix)
import React, { useEffect, useState } from "react";
import axios from "axios";
import { supabase } from "../../utils/supabase";
import { ThumbsUp,Redo2 } from 'lucide-react';
import { Bookmark, BookmarkCheck, Bell, BellRing,MessageCircle } from 'lucide-react';
import { BACKEND_URL } from '../../config';

const ArticleComments = ({ queryHash }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyTextMap, setReplyTextMap] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [upvoteStatus, setUpvoteStatus] = useState({});
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleUpvote = async (hashId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;
  
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/article/${hashId}/upvote/`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );
  
      const { status, count } = res.data;
  
      setUpvoteStatus(prev => ({
        ...prev,
        [hashId]: {
          voted: status === 'added',
          count,
        }
      }));
    } catch (err) {
      console.error("❌ Article upvote failed:", err.response?.data || err.message);
    }
  };
  
  

  const countTotalComments = (comments) => {
    let total = 0;
    const countReplies = (comment) => {
      total += 1;
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach(reply => countReplies(reply));
      }
    };
    comments.forEach(countReplies);
    return total;
  };
  
  const totalComments = countTotalComments(comments);
  

  const toggleBookmark = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;
  
    try {
      const res = await axios.post(
        `/api/article/${queryHash}/bookmark/`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest'
          },
          withCredentials: true  // ✅ Include if using CSRF-exempt endpoints
        }
      );
      setIsBookmarked(res.data.bookmarked);
    } catch (err) {
      console.error("❌ Failed to toggle bookmark:", err.response?.data || err.message);
    }
  };
  
  
  const toggleSubscribe = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;
  
    try {
      const res = await axios.post(
        `/api/article/${queryHash}/subscribe/`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest',
          },
          withCredentials: true,
        }
      );
      setIsSubscribed(res.data.subscribed);
    } catch (err) {
      console.error("❌ Failed to toggle subscribe:", err.response?.data || err.message);
    }
  };
  
  
  useEffect(() => {
    const fetchUpvoteStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
  
      try {
        const res = await axios.get(`${BACKEND_URL}/api/article/${queryHash}/vote_status/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        const { voted, count } = res.data;
        setUpvoteStatus(prev => ({
          ...prev,
          [queryHash]: { voted, count }
        }));
      } catch (err) {
        console.error("❌ Failed to fetch article vote status:", err.response?.data || err.message);
      }
    };
  
    if (queryHash) {
      fetchUpvoteStatus();
    }
  }, [queryHash]);
  
  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
  
      try {
        const res = await axios.get(`${BACKEND_URL}/article/main/${queryHash}/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        setIsBookmarked(res.data.is_bookmarked);
        setIsSubscribed(res.data.is_subscribed);
      } catch (err) {
        console.error("❌ Failed to fetch bookmark/subscription status:", err.response?.data || err.message);
      }
    };
  
    if (queryHash) {
      fetchBookmarkStatus();
    }
  }, [queryHash]);
  
  
  

  const fetchComments = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("No auth token");

      const res = await axios.get(`/article/api/article/comments/${queryHash}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      console.log("🧪 API response:", res.data);
      const commentData = Array.isArray(res.data) ? res.data : res.data.comments || [];
      setComments(commentData);
      console.log("✅ Set comments:", commentData);
    } catch (err) {
      console.error("❌ Error fetching comments:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

    

  // const fetchComments = async () => {
  //   try {
  //     const res = await axios.get(`${BACKEND_URL}/article/api/article/comments/${queryHash}/`);
  //     setComments(res.data.comments || []);
  //   } catch (err) {
  //     console.error("Error fetching comments:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    if (queryHash) fetchComments();
  }, [queryHash]);


  const toggleReplies = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  
  const handlePost = async (parentId = null) => {
    const textToSubmit = parentId ? replyTextMap[parentId] : newComment;
    if (!textToSubmit?.trim()) return;

    setPosting(true);
    try {
      const formData = new FormData();
      formData.append('query_hash', queryHash);
      formData.append('comment', textToSubmit);
      if (parentId) formData.append('parent_id', parentId);

      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) throw new Error('User not logged in');
      const token = session.access_token;

      

      if (!token) throw new Error('No access token');

      const res = await axios.post('/article/save_comment_react/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest',
        },
        withCredentials: true
      });

      if (res.data.status === 'success') {
        const newReply = {
          id: res.data.comment.id,
          text: res.data.comment.text,
          created_at: res.data.comment.created_at,
          author: res.data.comment.author || {
            username: 'You',
            avatar: '/default-avatar.png',
            id: null,
          },
          replies: []
        };

        if (parentId) {
          setComments(prev => insertReply(prev, parentId, newReply));
          setReplyTextMap(prev => ({ ...prev, [parentId]: '' }));
        } else {
          setComments(prev => [newReply, ...prev]);
          setNewComment('');
        }

        setReplyingTo(null);
      } else {
        fetchComments();
      }
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setPosting(false);
    }
  };

  const insertReply = (comments, parentId, reply) => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        };
      } else if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: insertReply(comment.replies, parentId, reply)
        };
      } else {
        return comment;
      }
    });
  };


  const countReplies = (comment) => {
    if (!comment.replies || comment.replies.length === 0) return 0;
    return comment.replies.reduce((total, reply) => {
      return total + 1 + countReplies(reply);  // 1 for this reply + nested
    }, 0);
  };



  const renderReplies = (replies, depth = 1) => (
    <div className={`ml-${Math.min(depth * 4, 20)} mt-3 border-l border-gray-600 pl-4`}>
      {replies.map(reply => (
        <div key={reply.id} className="mt-3">
          <div className="flex items-center gap-2 mb-1">
            <img src={reply?.author?.avatar || '/default-avatar.png'} className="w-6 h-6 rounded-full" alt="avatar" />
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">{reply?.author?.username || 'Anonymous'}</span>
            <span className="text-xs text-gray-400">{reply.created_at}</span>
          </div>
          <p className="text-gray-800 dark:text-gray-300 text-sm leading-relaxed">{reply.text}</p>
          <button
            onClick={() => setReplyingTo(prev => (prev === reply.id ? null : reply.id))}
            className="text-xs text-blue-500 mt-1"
          >
            {replyingTo === reply.id ? 'Cancel' : 'Reply'}
          </button>

          {replyingTo === reply.id && (
            <div className="mt-2">
              <textarea
                rows={2}
                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-sm text-black dark:text-white border border-gray-300 dark:border-gray-600"
                placeholder="Write your reply..."
                value={replyTextMap[reply.id] || ''}
                onChange={(e) => setReplyTextMap(prev => ({ ...prev, [reply.id]: e.target.value }))}
              />
              <button
                className="mt-1 text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => handlePost(reply.id)}
              >
                Reply
              </button>

            </div>
          )}
          {reply.replies && reply.replies.length > 0 && renderReplies(reply.replies, depth + 1)}
        </div>
      ))}
    </div>
  );

  const handleReplySubmit = async (parentId) => {
    const text = replyTextMap[parentId]?.trim();
    if (!text) return;
  
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;
  
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/comments/${parentId}/reply/`,
        { text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );
  
      // Optional: update comments UI or re-fetch
      setReplyTextMap(prev => ({ ...prev, [parentId]: '' }));
      setReplyingTo(null);
      // you could also trigger a refetch or push the new reply into state here
    } catch (err) {
      console.error("❌ Failed to post reply:", err.response?.data || err.message);
    }
  };
  

  const renderComments = (comments) =>
    comments.map((comment) => {
      const replyCount = countReplies(comment);
  
      return (
        <div key={comment.id} className="border-t border-gray-300 dark:border-gray-700 pt-5">
          {/* Avatar + username */}
          <div className="flex items-center mb-2">
            <img src={comment?.author?.avatar || '/default-avatar.png'} alt="avatar" className="w-8 h-8 rounded-full mr-3 object-cover" />
            <div>
              <p className="font-semibold text-sm text-blue-600 dark:text-blue-300">{comment?.author?.username || 'Anonymous'}</p>
              <p className="text-xs text-gray-400">{comment.created_at}</p>
            </div>
          </div>
  
          {/* Comment text */}
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{comment.text}</p>
  
          {/* Reply + Toggle Buttons */}
          <button onClick={() => setReplyingTo(comment.id)} className="text-xs text-blue-500 mt-1">Reply</button>
  
          <button onClick={() => toggleReplies(comment.id)} className="text-xs text-blue-500 mt-1 ml-2">
            {expandedComments[comment.id]
              ? 'Hide replies'
              : replyCount > 0
                ? `View ${replyCount} ${replyCount > 1 ? 'replies' : 'reply'}`
                : null}
          </button>
  
          {/* ✅ Parent-level reply box (fix) */}
          {replyingTo === comment.id && (
            <div className="mt-2">
              <textarea
                rows={2}
                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-sm text-black dark:text-white border border-gray-300 dark:border-gray-600"
                placeholder="Write your reply..."
                value={replyTextMap[comment.id] || ''}
                onChange={(e) => setReplyTextMap(prev => ({ ...prev, [comment.id]: e.target.value }))}
              />
              <button
                className="mt-1 text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => handlePost(comment.id)}
              >
                Reply
              </button>
            </div>
          )}
  
          {/* Nested replies if expanded */}
          {expandedComments[comment.id] && comment.replies?.length > 0 && renderReplies(comment.replies)}
        </div>
      );
    });
  


  

  return (
    <div className="space-y-4">
   <div className="flex items-center gap-4 mt-4">
      {/* Upvote */}
      <button
        onClick={() => handleUpvote(queryHash)}
        className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ThumbsUp
          className={`w-8 h-8 ${
            upvoteStatus[queryHash]?.voted ? 'text-teal-400' : 'text-gray-400'
          }`}
        />
        <span className="text-3xl font-bold text-gray-700 dark:text-gray-400 tracking-tight">
          {typeof upvoteStatus[queryHash]?.count === 'number'
            ? upvoteStatus[queryHash].count
            : 0}
        </span>
      </button>
      <button
        className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <MessageCircle
          className={`w-8 h-8 ${
            totalComments > 0 ? 'text-teal-400' : 'text-gray-400'
          }`}
        />
        <span className="text-3xl font-bold text-gray-700 dark:text-gray-400 tracking-tight">
          {totalComments}
        </span>
      </button>

      {/* Bookmark */}
      <button
        onClick={toggleBookmark}
        className={`p-2 rounded-full transition-colors ${
          isBookmarked
            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'
        }`}
      >
        {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
      </button>

      {/* Subscribe */}
      <button
        onClick={toggleSubscribe}
        className={`p-2 rounded-full transition-colors ${
          isSubscribed
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'
        }`}
      >
        {isSubscribed ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
      </button>
    </div>




      {/* New comment box */}
      <div className="mb-4">
        <textarea
          className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
          rows="3"
          placeholder="Write your comment here..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={posting}
        ></textarea>
        <div className="flex justify-end items-center mt-2">
          <button
            onClick={() => handlePost(null)}
            disabled={posting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {posting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-400">No comments yet.</p>
      ) : renderComments([...comments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))}
    </div>
  );
};

export default ArticleComments;