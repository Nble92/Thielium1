import React from 'react';
import { ExternalLink, Share2 } from 'lucide-react';

export function NFTCard({ image, title, author, description, price, category }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative group">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-4">
            <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
              <ExternalLink className="w-5 h-5 text-gray-900" />
            </button>
            <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
              <Share2 className="w-5 h-5 text-gray-900" />
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full text-sm font-medium">
            {category}
          </span>
          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {price} ETH
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              by {author}
            </span>
          </div>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}