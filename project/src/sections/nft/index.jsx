import React, { useState, useEffect } from 'react';
import { Filter, ArrowUpDown, LayoutGrid, List, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const CATEGORIES = ['Art', 'Collectibles', 'Domain Names', 'Music', 'Photography', 'Sports', 'Trading Cards', 'Utility', 'Virtual Worlds'];
const ITEMS_PER_PAGE = 6;

export function NFTList() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch NFTs from OpenSea API
  useEffect(() => {
    const fetchNFTs = async () => {
      setLoading(true);
      try {
        // OpenSea API endpoint - you'll need to replace with the actual endpoint and your API key
        const response = await axios.get('https://api.opensea.io/api/v2/chain/ethereum/contract/0x524cab2ec69124574082676e6f654a18df49a048/nfts', {
          headers: {
            'X-API-KEY': '24b3a11a025643f796db1c57cb28f163' // Replace with your actual API key
          },
          params: {
            limit: 50, // Fetch more items to have enough after filtering
            // You can add more parameters based on OpenSea API docs
          }
        });

        console.log(response.data);
        
        // Transform the API response to match our NFT structure
        const formattedNFTs = response.data.nfts.map(asset => ({
          id: asset.identifier,
          title: asset.name || 'Unnamed NFT',
          category: asset.collection || 'Uncategorized',
          price: asset.last_sale?.payment_token?.eth_price || asset.last_sale?.total_price / 1e18 || Math.random() * 5, // Fallback for demo
          image: asset.image_url || asset.image_preview_url || 'https://via.placeholder.com/400',
          author: asset.creator?.user?.username || asset.collection?.name || 'Unknown',
          description: asset.description || 'No description available'
        }));

        setNfts(formattedNFTs);
        setError(null);
      } catch (err) {
        console.error("Error fetching NFTs:", err);
        setError("Failed to load NFTs. Please try again later.");
        
        // For demo/development purposes, you could use this fallback:
        /*
        setNfts([
          // Add some sample NFTs here as fallback
        ]);
        */
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  // Filter and sort NFTs
  const filteredNFTs = nfts
    .filter(nft => {
      const matchesCategory = !selectedCategory || nft.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      return sortBy === 'price'
        ? (a.price - b.price) * order
        : a.title.localeCompare(b.title) * order;
    });

  const totalPages = Math.ceil(filteredNFTs.length / ITEMS_PER_PAGE);
  const paginatedNFTs = filteredNFTs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy, sortOrder]);

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full"></div>
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="ml-4 text-lg font-medium text-gray-700 dark:text-gray-300">Loading NFTs...</p>
    </div>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {paginatedNFTs.map((nft, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="relative aspect-square">
            <img
              src={nft.image}
              alt={nft.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400?text=Image+Not+Available';
              }}
            />
            <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {typeof nft.price === 'number' ? nft.price.toFixed(3) : nft.price} ETH
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white truncate">{nft.title}</h3>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                {nft.category}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{nft.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">By {nft.author}</span>
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200">
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="space-y-4">
      {paginatedNFTs.map((nft, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-48 h-48 flex-shrink-0">
              <img
                src={nft.image}
                alt={nft.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400?text=Image+Not+Available';
                }}
              />
            </div>
            <div className="flex-1 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">{nft.title}</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">By {nft.author}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
                  <span className="px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs sm:text-sm">
                    {nft.category}
                  </span>
                  <div className="bg-blue-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                    {typeof nft.price === 'number' ? nft.price.toFixed(3) : nft.price} ETH
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-4 line-clamp-2">{nft.description}</p>
              <div className="flex justify-end">
                <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 text-sm">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const Pagination = () => (
    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 mt-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{Math.min(filteredNFTs.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}</span> to{' '}
            <span className="font-medium">{Math.min(filteredNFTs.length, currentPage * ITEMS_PER_PAGE)}</span> of{' '}
            <span className="font-medium">{filteredNFTs.length}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === i + 1
                    ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-300'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  const ErrorMessage = () => (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
      <p className="text-red-600 dark:text-red-400 text-lg mb-2">Error Loading NFTs</p>
      <p className="text-red-500 dark:text-red-300">{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className='m-8'>
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search NFTs by title, description, author, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
            disabled={loading}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                disabled={loading}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="price">Sort by Price</option>
              <option value="title">Sort by Title</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              disabled={loading}
            >
              <ArrowUpDown className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            </button>
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'} rounded-l-lg disabled:opacity-50`}
                aria-label="Grid view"
                disabled={loading}
              >
                <LayoutGrid className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'} rounded-r-lg disabled:opacity-50`}
                aria-label="List view"
                disabled={loading}
              >
                <List className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Loading, Error, or NFTs */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage />
      ) : filteredNFTs.length > 0 ? (
        <>
          {totalPages > 1 && <Pagination />}
          {viewMode === 'grid' ? <GridView /> : <ListView />}
          {totalPages > 1 && <Pagination />}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No NFTs found matching your criteria</p>
        </div>
      )}
    </div>
  );
}