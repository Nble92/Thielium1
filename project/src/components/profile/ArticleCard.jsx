import { PencilIcon } from 'lucide-react';

export function ArticleCard({ article, isEditing }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow relative">
      {isEditing && (
        <button className="absolute top-2 right-2 p-1 bg-purple-100 dark:bg-purple-900 rounded-full">
          <PencilIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </button>
      )}
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{article.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{article.abstract}</p>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">{article.publishDate}</span>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
          {article.citations} citations
        </span>
      </div>
    </div>
  );
}