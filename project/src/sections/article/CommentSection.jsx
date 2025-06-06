import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { supabase } from '../../utils/supabase';
import { BACKEND_URL } from '../../config';

const CommentSection = ({ postId, refreshTrigger }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyToId, setReplyToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  



  const fetchComments = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("No auth token");

    const res = await axios.get(`${BACKEND_URL}/api/comments/feed/${postId}/`, {
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
    console.error("❌ Error fetching post comments:", err.response?.data || err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  fetchComments();
}, [postId, refreshTrigger]);

  
  
  const handleNewCommentSubmit = async (postId) => {
    if (!newCommentText.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      setPostingComment(true);

      await axios.post(
        'http://127.0.0.1:8000/api/comments/new/',
        {
          post_id: postId,
          comment: newCommentText
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setNewCommentText('');
      setPostingComment(false);
    } catch (err) {
      console.error('❌ Failed to post comment:', err.response?.data || err.message);
      setPostingComment(false);
    }
  };


  

  
  const handleReplySubmit = async (commentId, parentReplyId = null) => {
    if (!replyText.trim()) return;
  
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      console.log("🔁 Submitting reply:", {
        comment_id: commentId,
        parent_id: parentReplyId,
        reply: replyText
      });
      
      if (!commentId || !replyText.trim()) {
        console.warn("⛔ Missing commentId or replyText");
        return;
      }
      
      try {
        await axios.post(
          '/api/comments/reply/',
          {
            comment_id: commentId,
            reply: replyText,
            parent_id: parentReplyId
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      
        console.log("✅ Reply submitted successfully!");
        setReplyText('');
        setReplyToId(null);
        fetchComments();
      } catch (err) {
        console.error("❌ Reply error:", err.response?.data || err.message);
      }
      

  
      setReplyText('');
      setReplyToId(null);
      fetchComments();
  
    } catch (err) {
      console.error('Reply error:', err);
    }
  };
  

  const renderReplies = (replies, commentId, depth = 1) =>
    replies.map(reply => (
      <div key={reply.id} className={`ml-${depth * 4} mt-2`}>
        <p className="text-sm text-gray-400">↳ {reply.content}</p>
  
        <button
          onClick={() =>
            setReplyToId(replyToId === reply.id ? null : reply.id)
          }
          className="text-xs text-blue-400 hover:underline mt-1"
        >
          {replyToId === reply.id ? 'Cancel' : 'Reply'}
        </button>
  
        {replyToId === reply.id && (
          <div className="mt-2">
            <textarea
              rows={2}
              className="w-full p-2 rounded bg-gray-900 text-white border border-gray-600"
              placeholder="Write your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button
              className="mt-1 text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => handleReplySubmit(commentId, reply.id)}  // ✅ commentId passed down
            >
              Submit Reply
            </button>
          </div>
        )}
  
        {reply.replies && renderReplies(reply.replies, commentId, depth + 1)} 
      </div>
    ));
  
  

  return (
    <div className="mt-4 bg-gray-800 p-4 rounded border border-gray-700 max-h-96 overflow-y-auto">
      <div className="mt-4 border-t border-gray-700 pt-4">
        {/* <textarea
          rows={3}
          className="w-full p-2 rounded bg-gray-900 text-white border border-gray-600"
          placeholder="Write a comment..."
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
        />
        <button
          onClick={() => handleNewCommentSubmit(postId)}
          disabled={postingComment}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {postingComment ? 'Posting...' : 'Post Comment'}
        </button> */}
      </div>

    {loading ? (
      
      <p className="text-gray-400">Loading comments...</p>
    ) : (comments || []).length === 0 ? (
      <p className="text-gray-500 italic">No comments yet.</p>
    ) : (
      comments.map((comment) => (
        <div key={comment.id} className="mb-4">
          <p className="text-sm text-white">{comment.content}</p>

          <button
            onClick={() =>
              setReplyToId(replyToId === comment.id ? null : comment.id)
            }
            className="text-xs text-blue-400 hover:underline mt-1"
          >
            {replyToId === comment.id ? 'Cancel' : 'Reply'}
          </button>

          {replyToId === comment.id && (
            <div className="mt-2">
              <textarea
                rows={2}
                className="w-full p-2 rounded bg-gray-900 text-white border border-gray-600"
                placeholder="Write your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button
                className="mt-1 text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => handleReplySubmit(comment.id)}
              >
                Submit Reply
              </button>
            </div>
          )}

        {comment.replies && renderReplies(comment.replies, comment.id)}
        </div>
      ))
    )}
  </div>
  );
};

export default CommentSection;
