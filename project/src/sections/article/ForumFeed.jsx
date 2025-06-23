import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import CommentSection from './CommentSection';
import { Bookmark, Share, MessageCircle } from 'lucide-react';
import { supabase } from "../../utils/supabase";
import { useContext } from 'react';
import { BACKEND_URL } from '../../config';
import { UserContext } from '../../context/UserContext';
import { MoreVertical } from 'lucide-react';
import { ThumbsUp,Redo2 } from 'lucide-react';
import categoryData from '../../config/categories.json';


// THEN keep this in your file:
const useInView = (options = {}) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      options
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return [ref, inView];
};

const ForumFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentTexts, setCommentTexts] = useState({}); // track comment per post
  const [postingCommentId, setPostingCommentId] = useState(null);
  const [activeCommentBoxId, setActiveCommentBoxId] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editAttachment, setEditAttachment] = useState(null);
  const [repostTarget, setRepostTarget] = useState(null);
  const [repostComment, setRepostComment] = useState('');
  const [liveVideoIds, setLiveVideoIds] = useState({});
  const [filterCategory, setFilterCategory] = useState('');
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState([]);
  const [subscribedAuthors, setSubscribedAuthors] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const { user } = useContext(UserContext);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const startEditingPost = (post) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditAttachment(null); // optional file update
  };
  const handleDeletePost = async (postId) => {
    const confirm = window.confirm("Are you sure you want to delete this post?");
    if (!confirm) return;

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;

    try {
      await axios.delete(`/api/post/delete/${postId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error("❌ Failed to delete post:", err.response?.data || err.message);
    }
  };

  const VideoPlayer = ({ src }) => {
    const [ref, inView] = useInView({ threshold: 0.25 });
  
    return (
      <div ref={ref} className="mt-4 flex justify-center">
        <video
          ref={ref}
          src={src}
          controls
          muted
          playsInline
          autoPlay={inView}
          loop
          className="max-h-96 rounded-lg border border-gray-700"
        />
      </div>
    );
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:v=|\/embed\/|youtu.be\/)([\w-]{11})/);
    return match ? match[1] : null;
  };
  
  // const checkIfLive = async (videoId) => {
  //   try {
  //     const res = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
  //       headers: {
  //         'Accept': 'text/html',
  //       }
  //     });
  
  //     const html = res.data;
  //     const isLive = html.includes('"isLiveContent":true') || html.includes('"liveStreamability"');
      
  //     setLiveVideoIds(prev => ({ ...prev, [videoId]: isLive }));
  //   } catch (err) {
  //     console.error('Error checking live status:', err);
  //   }
  // };

  const checkLiveStatusFromAPI = async (videoId) => {
    try {
      const apiKey = 'AIzaSyB_B9PieyVyL1vF4feRMMX1Mpv_HPMU04U';
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoId}&key=${apiKey}`;
      const res = await axios.get(url);
      const video = res.data.items?.[0];
      if (!video) return;
  
      const isLive = !!(video?.liveStreamingDetails?.actualStartTime);
      setLiveVideoIds(prev => ({ ...prev, [videoId]: isLive }));
    } catch (err) {
      console.error('Error fetching from YouTube API:', err.response?.data || err.message);
    }
  };

  const toggleBookmark = async (postId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;
  
    try {
      const res = await axios.post(
        '/api/post/bookmark/',
        { post_id: postId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setBookmarkedPostIds(prev =>
        res.data.status === 'added'
          ? [...prev, postId]
          : prev.filter(id => id !== postId)
      );
    } catch (err) {
      console.error("❌ Bookmark toggle failed:", err.response?.data || err.message);
    }
  };
  
  
  const handleEditPost = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
  
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;
  
    const formData = new FormData();
    formData.append('title', editTitle);
    formData.append('content', editContent);
    if (editAttachment) {
      const isVideo = editAttachment.type.startsWith('video/');
      formData.append(isVideo ? 'video' : 'image', editAttachment);
    }
  
    try {
      await axios.put(
        `/api/post/edit/${editingPost.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      setEditingPost(null);
      fetchPosts(); // refresh
    } catch (err) {
      console.error("❌ Failed to edit post:", err.response?.data || err.message);
    }
  };


const handleRepost = async () => {
  if (!repostTarget) return;

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) return;

  try {
    await axios.post(
      '/api/post/repost/',
      {
        original_post_id: repostTarget.id,
        comment: repostComment
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    setRepostTarget(null);
    setRepostComment('');
    fetchPosts();
  } catch (err) {
    console.error("❌ Repost failed:", err.response?.data || err.message);
  }
};
  

  
  
  const fetchPosts = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) throw new Error("No active Supabase session");

    const token = session.access_token;

    const res = await axios.get(`${BACKEND_URL}/discussions/api/discussions/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    console.log("✅ Posts refreshed:", res.data);

    const postsArray = Array.isArray(res.data)
      ? res.data
      : res.data.posts || [];

    setPosts(postsArray);
  } catch (err) {
    console.error("❌ Error loading posts:", err.response?.data || err.message);
  } finally {
    setLoading(false);
  }
};

  

  // useEffect(() => {
  //   fetchPosts();
  // }, []);
  useEffect(() => {
  console.log("📡 useEffect: calling fetchPosts()");
  fetchPosts();
}, []);

  useEffect(() => {
  if (Array.isArray(posts)) {
    posts.forEach(post => {
      const videoId = getYouTubeId(post.youtube_url);
      if (videoId && !(videoId in liveVideoIds)) {
        checkLiveStatusFromAPI(videoId);
      }
    });
  } else {
    console.warn("⚠️ `posts` is not an array:", posts);
  }
}, [posts]);


  useEffect(() => {
    const fetchSubscriptions = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
  
      try {
        const res = await axios.get('/api/subscriptions/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubscribedAuthors(res.data);  // e.g. [5, 7, 9]
      } catch (err) {
        console.error("Failed to fetch subscriptions:", err.response?.data || err.message);
      }
    };
  
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
  
      try {
        const res = await axios.get('/api/friend_requests/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const pendingIds = res.data.map(req => req.sender.id); // or `.receiver.id` depending on perspective
        setPendingRequests(pendingIds);
      } catch (err) {
        console.error("Failed to fetch friend requests:", err.response?.data || err.message);
      }
    };
  
    fetchFriendRequests();
  }, []);
  
  
  

  const handlePostSubmit = async () => {
    if (!newTitle.trim() || !newContent.trim() || !selectedCategory.trim()) return;
  
    setPosting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return console.error('User not authenticated');
  
      const formData = new FormData();
      formData.append('title', newTitle);
      formData.append('content', newContent);
      formData.append('category', selectedCategory);  // ✅ REQUIRED by backend
  
      if (attachment) {
        const isVideo = attachment.type.startsWith('video/');
        formData.append(isVideo ? 'video' : 'image', attachment);
      }
  
      if (youtubeUrl.trim()) {
        formData.append('youtube_url', youtubeUrl.trim());
      }
  
      await axios.post(
        '/api/post/new/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      setNewTitle('');
      setNewContent('');
      setAttachment(null);
      setYoutubeUrl('');
      setSelectedCategory('');
      fetchPosts();
    } catch (err) {
      console.error('Error creating post:', err.response?.data || err.message);
    } finally {
      setPosting(false);
    }
  };
  
  
  

  const handleNewCommentSubmit = async (postId) => {
    const commentText = commentTexts[postId];
    if (!commentText?.trim()) return;

    setPostingCommentId(postId);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      await axios.post(
        '/api/comments/new/',
        {
          post_id: postId,
          comment: commentText
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      setExpandedPostId(postId); // show comments after posting
    } catch (err) {
      console.error("❌ Failed to post comment:", err.response?.data || err.message);
    } finally {
      setPostingCommentId(null);
    }
  };

  const handleUpvote = async (postId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;
  
    try {
      await axios.post(
        '/api/post/upvote/',
        { post_id: postId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // ✅ Only update vote_difference here
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, vote_difference: (post.vote_difference || 0) + 1 }
            : post
        )
      );
    } catch (err) {
      console.error("❌ Upvote failed:", err.response?.data || err.message);
    }
  };
  
  
  
  

  const toggleComments = (postId) => {
    setExpandedPostId(prev => (prev === postId ? null : postId));
  };

  const safePosts = Array.isArray(posts) ? posts : [];
  const getMediaUrl = (path) =>
  `${BACKEND_URL}${path.startsWith('/') ? path : `/${path}`}`;


  

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="p-6 text-white max-w-4xl mx-auto">
        <div className="mb-10 p-6 bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-white mb-2">Create a Post</h2>
          <input
            type="text"
            className="w-full p-2 mb-2 rounded bg-gray-900 text-white border border-gray-600"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea
            className="w-full p-2 mb-4 rounded bg-gray-900 text-white border border-gray-600"
            rows={3}
            placeholder="What's on your mind?"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <div className="flex items-center gap-2 mb-4">
            <label className="text-lg font-medium">Post to:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-64 p-2 rounded bg-gray-900 text-white border border-gray-600"
            >
              <option value="">Select a category</option>
              {categoryData.categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>


          <div className="flex items-center gap-4 mt-4 align-middle">
          <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              onClick={handlePostSubmit}
              disabled={posting}
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
    
            <input
              type="text"
              className="flex-1 p-2 rounded bg-gray-900 text-white border border-gray-600"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />

      

            

            <label
              htmlFor="media-upload"
              className="cursor-pointer flex items-center justify-center w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-full"
              title="Attach media"
            >
              📎
            </label>
            <input
              id="media-upload"
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setAttachment(e.target.files[0])}
              className="hidden"
            />


            {attachment && (
              <span className="text-sm text-gray-300 truncate max-w-xs">
                {attachment.name}
              </span>
            )}
          </div>


        </div>
        <div className="mb-6 flex items-center gap-2">
          <label className="text-white">Topics: </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-64 p-2 rounded bg-gray-900 text-white border border-gray-600"
          >
            <option value="">All Categories</option>
            {categoryData.categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p>Loading feed...</p>
        ) : Array.isArray(safePosts) && safePosts.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          safePosts
            .filter(post => !filterCategory || post.category === filterCategory)
            .map(post => (
            <div key={post.id} className="p-3 flex flex-col items-center">
              <div className="w-full max-w-2xl">
              <div className="flex items-center justify-between mb-3 px-4">
                
                {/* Left: Avatar + Username */}
                <div className="flex items-center gap-3">
                  <img
                    src={`${BACKEND_URL}${post.author.avatar}`}
                    alt={post.author.username}
                    className="w-12 h-12 rounded-full object-cover border border-gray-600"
                  />
                  <span className="text-lg text-white font-medium">
                    {post.author.username}
                  </span>

                  {user && user.id !== post.author.id && (
                  <button
                    onClick={async () => {
                      const { data: { session } } = await supabase.auth.getSession();
                      const token = session?.access_token;
                      if (!token) return;

                      const isSubscribed = subscribedAuthors.includes(post.author.id);
                      try {
                        if (isSubscribed) {
                          await axios.post(`/api/subscriptions/delete/${post.author.id}/`, {}, {
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          setSubscribedAuthors(prev => prev.filter(id => id !== post.author.id));
                        } else {
                          await axios.post(`/api/subscriptions/add/${post.author.id}/`, {}, {
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          setSubscribedAuthors(prev => [...prev, post.author.id]);
                        }
                      } catch (err) {
                        console.error("Subscription toggle failed:", err.response?.data || err.message);
                      }
                    }}
                    className={`ml-2 text-sm font-semibold px-3 py-1 rounded-full ${
                      subscribedAuthors.includes(post.author.id)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-200'
                    }`}
                  >
                    {subscribedAuthors.includes(post.author.id) ? '✓ Subscribed' : 'Subscribe'}
                  </button>
                )}
                {user && user.id !== post.author.id && (
                <button
                  disabled={pendingRequests.includes(post.author.id)}
                  onClick={async () => {
                    const { data: { session } } = await supabase.auth.getSession();
                    const token = session?.access_token;
                    if (!token) return;

                    try {
                      await axios.post(
                        '/api/friend_requests/',
                        {
                          sender: user.id,
                          receiver: post.author.id
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${token}`
                          }
                        }
                      );
                      setPendingRequests(prev => [...prev, post.author.id]);
                    } catch (err) {
                      console.error("Friend request failed:", err.response?.data || err.message);
                      alert("Friend request could not be sent.");
                    }
                  }}
                  className={`ml-2 text-sm font-semibold px-3 py-1 rounded-full ${
                    pendingRequests.includes(post.author.id)
                      ? 'bg-gray-500 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {pendingRequests.includes(post.author.id) ? 'Pending' : 'Add Friend'}
                </button>
              )}



              </div>

                
              </div>
              <div className="rounded-xl overflow-hidden shadow-md transition-transform hover:scale-[1.005] bg-white dark:bg-gray-800 hover:shadow-blue-200 dark:hover:shadow-blue-500/20 flex flex-col h-full border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
              </div>


              <div className="p-3">
              <p className="text-sm  mb-7">
                  {post.category || "Uncategorized"}
                </p>

                <div className="flex items-center justify-between">
                
                  <h2 className="text-xl font-bold text-white">{post.title}</h2>

                  {/* Right: Dropdown menu */}
                  {user && user.id === post.author.id && (
                    <div className="relative ml-4">
                      <button
                        onClick={() =>
                          setDropdownOpenId(prev => (prev === post.id ? null : post.id))
                        }
                      >
                        <MoreVertical className="w-5 h-5 text-white hover:text-gray-400" />
                      </button>

                      {dropdownOpenId === post.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-gray-800 text-white border border-gray-700 rounded shadow-lg z-10">
                          <button
                            onClick={() => {
                              setDropdownOpenId(null);
                              handleDeletePost(post.id);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-red-400"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
             

               
              <p className="text-md text-gray-300">{post.content}</p>

              {/* Repost info if it exists */}
              {post.original_post && post.original_post.author && (
                <div className="bg-gray-900 border border-gray-700 rounded p-3 mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={getMediaUrl(post.original_post.author.avatar)}
                      alt={post.original_post.author.username}
                      className="w-8 h-8 rounded-full border border-gray-600 object-cover"
                    />
                    <span className="text-sm font-semibold text-white">
                      {post.original_post.author.username}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{post.original_post.content}</p>
                </div>
              )}

              {/* Media display logic */}
              {post.youtube_url ? (
                <div className="mt-4 flex flex-col items-center">
                  {liveVideoIds[getYouTubeId(post.youtube_url)] && (
                    <div className="text-red-500 font-bold mb-1">🔴 LIVE</div>
                  )}
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(post.youtube_url)}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full max-w-xl h-64 rounded-lg border border-gray-700"
                  />
                </div>
              ) : post.video ? (
                <VideoPlayer src={getMediaUrl(post.video)} />
              ) : post.image && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={getMediaUrl(post.image)}
                    alt="Post attachment"
                    className="max-h-96 rounded-lg object-contain border border-gray-700"
                    onError={(e) => {
                      console.warn("⚠️ Image load failed", e);
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}

                   <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">

                    <button
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => toggleBookmark(post.id)}
                      title="Bookmark"
                    >
                      <Bookmark
                        className="w-5 h-5"
                        fill={bookmarkedPostIds.includes(post.id) ? 'white' : 'none'}
                        stroke="currentColor"
                      />
                    </button>


                    

                    <button
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setRepostTarget(post)}
                      title="Repost"
                    >
                      <Redo2 className="w-5 h-5 text-white" />
                    </button>


                    <button
                    className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() =>
                      setActiveCommentBoxId(prev => (prev === post.id ? null : post.id))
                    }
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{post.comments_count ?? 0}</span>
                  </button>

                  <button
                      className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleUpvote(post.id)}
                    >
                      <ThumbsUp className="w-5 h-5 text-white" />
                      <span className="text-sm">{typeof post.vote_difference === 'number' ? post.vote_difference : 0}</span>
                    </button>
                  
                  </div>









                  {/* Add Comment Box */}
                  <div className="mt-4 pt-4 border-t border-gray-700">
                  {repostTarget && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl mb-4 text-white">Reposting</h2>

                        {/* Original Post Info */}
                        <div className="bg-gray-900 border border-gray-700 rounded p-3 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <img
                              src={`https://aleflabs.net${repostTarget.author.avatar}`}
                              alt={repostTarget.author.username}
                              className="w-8 h-8 rounded-full border border-gray-600 object-cover"
                            />
                            <span className="text-sm font-semibold text-white">
                              {repostTarget.author.username}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{repostTarget.content}</p>
                        </div>

                        {/* Reposter Comment */}
                        <textarea
                          className="w-full p-2 mb-4 rounded bg-gray-900 text-white border border-gray-600"
                          placeholder="Add a comment..."
                          value={repostComment}
                          onChange={(e) => setRepostComment(e.target.value)}
                        />

                        <div className="flex justify-end gap-2">
                          <button
                            className="px-4 py-2 bg-gray-700 text-white rounded"
                            onClick={() => setRepostTarget(null)}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                            onClick={handleRepost}
                          >
                            Repost
                          </button>
                        </div>
                      </div>
                    </div>
                  )}


                    {/* Conditionally show comment box when icon is clicked */}
                    {activeCommentBoxId === post.id && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <textarea
                          rows={3}
                          className="w-full p-2 rounded bg-gray-900 text-white border border-gray-600"
                          placeholder="Write a comment..."
                          value={commentTexts[post.id] || ''}
                          onChange={(e) =>
                            setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))
                          }
                        />
                        <button
                          onClick={() => handleNewCommentSubmit(post.id)}
                          disabled={postingCommentId === post.id}
                          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                          {postingCommentId === post.id ? 'Posting...' : 'Post Comment'}
                        </button>
                      </div>
                    )}
                  </div>

                  <p
                    className="mt-2 text-sm text-blue-400 hover:underline cursor-pointer"
                    onClick={() => toggleComments(post.id)}
                  >
                    {expandedPostId === post.id ? 'Hide Comments' : 'View Comments'}
                  </p>
                </div>

                {expandedPostId === post.id && (
                  <CommentSection
                    postId={post.id}
                    refreshTrigger={postingCommentId === null ? Date.now() : null}
                  />
                )}
              </div>
            </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ForumFeed;
