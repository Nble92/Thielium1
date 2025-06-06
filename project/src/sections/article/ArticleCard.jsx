
import React, { useState, useEffect } from 'react';
import useNftPreviewFromLink from './useNftPreviewFromLink';
import { User, Calendar, Clock, Quote, BookmarkPlus, Share2, MessageSquare, ArrowUpRight } from 'lucide-react';

const ArticleCard = ({ article, onReadFullPaper, formatDate, truncateAbstract, formatAuthors }) => {
  const { nftData, isNftLoading } = useNftPreviewFromLink(article.nft_link);



  return (
    <article className="rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-[1.01] bg-white dark:bg-gray-800 hover:shadow-blue-200 dark:hover:shadow-blue-500/20 flex flex-col h-full">
      {article.nft_link && (
        <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-700">
          {isNftLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin h-6 w-6 border-b-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : nftData?.image_url ? (
            <img
              src={nftData.image_url}
              alt={nftData.name || 'NFT Preview'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
              No image found
            </div>
          )}
        </div>
      )}

      <div className="p-6 flex flex-col flex-grow">
      {article.category?.name}
        <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
          {article.title || 'Untitled Article'}
        </h2>

        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <p className="font-medium">{formatAuthors(article.authors)}</p>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(article.created_at)}</span>
          </div>
          {article.PMID && <div className="font-mono">PMID: {article.PMID}</div>}
        </div>

        {article.abstract && (
          <p className="mb-6 text-gray-600 dark:text-gray-300 flex-grow">
            {truncateAbstract(article.abstract)}
          </p>
        )}



        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <Quote className="w-4 h-4 mx-auto mb-1" />
            <p className="text-sm font-medium">{article.citation_count || 0} Citations</p>
          </div>
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <Calendar className="w-4 h-4 mx-auto mb-1" />
            <p className="text-sm font-medium">{formatDate(article.NFT_Created_At) || 'N/A'}</p>
          </div>
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <Clock className="w-4 h-4 mx-auto mb-1" />
            <p className="text-sm font-medium">{article.readTime || '5 min read'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            {article.nftSummary && (
            <div className="mt-auto px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              
              {article.nftSummary?.lastSalePrice && (
                <>
                  <p className="text-lg text-zinc-800 dark:text-cyan-200 mt-2">
                    PRICE: ₳ {article.nftSummary.lastSalePrice}
                  </p>
                  <p className="text-lg text-gray-400">
                    ≈ ${ (article.nftSummary.lastSalePrice * 2500).toFixed(2) } USD
                  </p>
                </>
              )}
              {article.nftSummary.conversions !== undefined && (
                <p className="text-slg text-gray-400">
                  Seller Hold Rate: {(article.nftSummary.conversions * 100).toFixed(1)}%
                </p>
              )}
                <p className="text-xs text-zinc-400 mt-1">
                  Updated: {new Date(article.nftSummary.last_updated).toLocaleDateString()}
                </p>
              {article.nftSummary?.last_updated && (
                <p className="text-xs text-zinc-400 mt-1">
                  Updated: {new Date(article.nftSummary.last_updated).toLocaleDateString()}
                </p>
              )}
              {article.nftSummary.totalOffers !== undefined && (
                <p className="text-sm text-purple-400">
                  Offers: {article.nftSummary.totalOffers}
                </p>
              )}
            </div>
          )}

          </div>
          <button
            onClick={() => onReadFullPaper(article)}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            Read Full Paper
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
