// src/pages/TestComments.jsx
import React from 'react';
import PostComments from '../social/ArticleComments';  // adjust this path if needed!

const TestComments = () => {
  const postId = 60;  // 👈 INSERT a real post ID here that exists in your Django database

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Test Comments Section
        </h1>
        
        {/* Now load PostComments using a real postId */}
        <PostComments postId={postId} />
      </div>
    </div>
  );
};

export default TestComments;
