import React, { useState } from 'react';
import CommentSection from './CommentSection';
import { Bookmark, Share, MessageCircle } from 'lucide-react';
import { supabase } from "../../utils/supabase";
import axios from 'axios';

const PostCard = ({ post }) => {
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const toggleComments = () => setExpanded(!expanded);

  const handleNewCommentSubmit = async () => {
    if (!commentText.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      setPostingComment(true);

      await axios.post(
        '/api/comments/new/',
        {
          post_id: post.id,
          comment: commentText
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setCommentText('');
    } catch (err) {
      console.error("❌ Failed to post comment:", err.response?.data || err.message);
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <div className="p-6 flex flex-col flex-grow">
      <div className="rounded-xl overflow-hidden shadow-md transition-transform hover:scale-[1.005] bg-white dark:bg-gray-800 hover:shadow-blue-200 dark:hover:shadow-blue-500/20 flex flex-col h-full border border-gray-700">
        <div className="p-4">
          <h2 className="text-xl font-bold">{post.title}</h2>
          <p className="text-sm text-gray-300">{post.content}</p>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <Bookmark className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <Share className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Comment input */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <textarea
              rows={3}
              className="w-full p-2 rounded bg-gray-900 text-white border border-gray-600"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              onClick={handleNewCommentSubmit}
              disabled={postingComment}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {postingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </div>

          <p
            className="mt-2 text-sm text-blue-400 hover:underline cursor-pointer"
            onClick={toggleComments}
          >
            {expanded ? 'Hide Comments' : 'View Comments'}
          </p>
        </div>

        {expanded && <CommentSection postId={post.id} />}
      </div>
    </div>
  );
};

export default PostCard;
