import React from "react";
import { useParams } from "react-router-dom";
import ArticleComments from "../social/ArticleComments";

const ViewArticleComments = () => {
  const { queryHash } = useParams();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          All Comments
        </h1>
        <ArticleComments queryHash={queryHash} />
      </div>
    </div>
  );
};

export default ViewArticleComments;

