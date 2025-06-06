import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Calendar, User, ArrowUpRight, Beaker, Clock, Quote, Eye, BookmarkPlus, Share2, MessageSquare, Search, ChevronLeft, ChevronRight, Grid, List } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../../config';
import ForumFeed from "./ForumFeed";
import useNftPreviewFromLink from './useNftPreviewFromLink';
import ArticleCard from './ArticleCard';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../../utils/supabase';



function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('grid');
  const [sortCriteria, setSortCriteria] = useState('date');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('feed'); // or 'feed'
  const { nftData, isNftLoading } = useNftPreviewFromLink(articles.nft_link);
  const [session, setSession] = useState(null); 
  const { queryHash } = useParams();
  const [hasFetchedSummaries, setHasFetchedSummaries] = useState(false);
  


  useEffect(() => {
    fetchArticles(currentPage);
    console.log('✅ ArticleList mounted');
  }, [currentPage]);

  
  const fetchArticles = async (page) => {
    console.log("Requesting:", `${BACKEND_URL}/api/all_articles?page=${page}`);
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${BACKEND_URL}/article/all_articles?page=${page}&notebook_only=true`);
      console.log(response.data);
      
      if (response.data && response.data.articles) {
        console.log(response.data.articles);
        setArticles(response.data.articles);
        setTotalPages(response.data.total_pages || 1);
        setTotalArticles(response.data.article_count || response.data.articles.length);
        setCurrentPage(response.data.current_page || page);
      } else {
        setError("Unexpected data format received from server");
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError("Failed to fetch articles. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };


  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo(0, 0);
    }
  };

  const handleSortChange = (e) => {
    setSortCriteria(e.target.value);
  };

  const sortedArticles = [...articles].sort((a, b) => {
    if (sortCriteria === 'date') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortCriteria === 'citations') {
      return (b.cited_by || 0) - (a.cited_by || 0);
    }
    return 0;
  });

  const filteredArticles = sortedArticles.filter(article => {
    const matchesSearch = 
      (article.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (article.abstract?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (article.authors?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (article.hash_id?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (article.DOI?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (article.PMID?.includes(searchTerm) || false);
    
    return matchesSearch;
  });
  console.log(sortedArticles[0]);

  const truncateAbstract = (abstract, maxLength = 200) => {
    if (!abstract) return '';
    if (abstract.length > maxLength) {
      return abstract.substring(0, maxLength) + '...';
    }
    return abstract;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const formatAuthors = (authors) => {
    if (!authors) return 'Unknown Authors';
    const authorList = authors.split(';');
    if (authorList.length <= 3) return authors;
    return `${authorList.slice(0, 3).join(';')} et al.`;
  };

  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);
      let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2) + 1);
      let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
      if (endPage === totalPages - 1) {
        startPage = Math.max(2, endPage - (maxVisiblePages - 3));
      }
      if (startPage > 2) {
        items.push('...');
      }
      for (let i = startPage; i <= endPage; i++) {
        items.push(i);
      }
      if (endPage < totalPages - 1) {
        items.push('...');
      }
      items.push(totalPages);
    }
    
    return items;
  };

  const handleReadFullPaper = (article) => {
    console.log(article);
    navigate(`/rblock/${article.hash_id}`, { state: { article } });
  };



    useEffect(() => {
      const fetchPricing = async () => {
        if (!queryHash) return;
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          const token = session?.access_token;
          if (!token) throw new Error("No auth token");

          const res = await axios.get(`${BACKEND_URL}/polymerase/api/pricing_nft/${queryHash}/`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'X-Requested-With': 'XMLHttpRequest',
            }
          });

          setPricingData(res.data);
        } catch (err) {
          console.error("❌ Failed to fetch pricing model:", err.response?.data || err.message);
        }
      };
      fetchPricing();
    }, [queryHash]);



    // 1️⃣ Get session once
    useEffect(() => {
      const getSession = async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error("Auth error:", error);
        else setSession(data.session);
      };
      getSession();
    }, []);

    // 2️⃣ Fetch NFT summaries once
    useEffect(() => {
      const fetchNftSummaries = async () => {
        if (!articles || articles.length === 0 || !session?.access_token || hasFetchedSummaries) return;

        try {
          const hashes = [...new Set(articles.map(a => a.hash_id).filter(Boolean))];

          const res = await axios.post(
            `${BACKEND_URL}/api/events/summary/`,
            { hashes: hashes },
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          const summaries = res.data;

          const enriched = articles.map(article => ({
            ...article,
            nftSummary: summaries[article.hash_id] || {},
          }));

          setArticles(enriched);
          setHasFetchedSummaries(true); // ✅ stop refetching
        } catch (err) {
          console.error("❌ NFT fetch failed:", err.response?.data || err.message);
        }
      };

      fetchNftSummaries();
    }, [articles, session, hasFetchedSummaries]);



      
  
  return (
  <>
  {activeTab === 'articles' ? (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <nav className="fixed w-full z-10 bg-white dark:bg-gray-800 shadow-lg">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                <div className="flex space-x-4 mb-6">
                  <button
                    onClick={() => setActiveTab('articles')}
                    className={`px-4 py-2 rounded-md font-semibold ${activeTab === 'articles' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    Articles
                  </button>
                  <button
                    onClick={() => setActiveTab('feed')}
                    className={`px-4 py-2 rounded-md font-semibold ${activeTab === 'feed' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    Social
                  </button>
                </div>
                  <Beaker className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">
                    ScienceHub
                  </span>
                </div>
                <div className="flex items-center gap-4 justify-center">
                  <button onClick={() => setViewType('grid')} className={`p-2 rounded ${viewType === 'grid' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                    <Grid className={`w-5 h-5 ${viewType === 'grid' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
                  </button>
                  <button onClick={() => setViewType('list')} className={`p-2 rounded ${viewType === 'list' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                    <List className={`w-5 h-5 ${viewType === 'list' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <main className="container mx-auto px-6 pt-24 pb-16">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                Latest Scientific Publications
              </h1>

              <Link to="/new-article">
                <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                  🧠 Post a New Article
                </button>
              </Link>

              
              <div className="flex items-center mb-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Showing {filteredArticles.length} of {totalArticles} articles
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative text-gray-900 dark:text-white">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by title, abstract, authors, or PMID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
                <select
                  value={sortCriteria}
                  onChange={handleSortChange}
                  className="px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                >
                  <option value="date">Sort by Date</option>
                  <option value="citations">Sort by Citations</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-4 text-blue-500 dark:text-white">Loading articles...</span>
              </div>
            ) : error ? (
              <div className="p-6 rounded-lg text-center bg-red-100 dark:bg-red-900 text-red-700 dark:text-white">
                <p>{error}</p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="p-6 rounded-lg text-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <p>No articles found. Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className={`space-y-8 ${viewType === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col'}`}>
                {filteredArticles.map(article => (
                  <article
                    key={article.PMID || `article-${Math.random().toString(36).substr(2, 9)}`}
                    className="rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-[1.01] bg-white dark:bg-gray-800 hover:shadow-blue-200 dark:hover:shadow-blue-500/20 flex flex-col h-full"
                  >

                  <ArticleCard
                      key={article.hash_id || article.PMID}
                      article={article}
                      onReadFullPaper={handleReadFullPaper}
                      formatDate={formatDate}
                      truncateAbstract={truncateAbstract}
                      formatAuthors={formatAuthors}
                    />
                    
               
                  </article>
                ))}
              </div>
            )}

            {!isLoading && !error && totalPages > 1 && (
              <div className="mt-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="flex items-center px-3 py-2 rounded-md border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:border-gray-200 dark:disabled:border-gray-800"
                      aria-label="First page"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      First
                    </button>
                    
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-md border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:border-gray-200 dark:disabled:border-gray-800"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {getPaginationItems().map((item, index) => (
                      typeof item === 'number' ? (
                        <button
                          key={index}
                          onClick={() => handlePageChange(item)}
                          className={`w-10 h-10 rounded-md border ${
                            currentPage === item
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          aria-label={`Page ${item}`}
                          aria-current={currentPage === item ? 'page' : undefined}
                        >
                          {item}
                        </button>
                      ) : (
                        <span
                          key={index}
                          className="flex items-center justify-center w-10 h-10 text-gray-500 dark:text-gray-400"
                        >
                          {item}
                        </span>
                      )
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-md border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:border-gray-200 dark:disabled:border-gray-800"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-3 py-2 rounded-md border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:border-gray-200 dark:disabled:border-gray-800"
                      aria-label="Last page"
                    >
                      Last
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      ) : (
     <div>

          <nav className="fixed w-full z-10 bg-white dark:bg-gray-800 shadow-lg">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                
                  <div className="flex space-x-4 mb-6">
                    <button
                      onClick={() => setActiveTab('articles')}
                      className={`px-4 py-2 rounded-md font-semibold ${activeTab === 'articles' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                      Articles
                    </button>
                    <button
                      onClick={() => setActiveTab('feed')}
                      className={`px-4 py-2 rounded-md font-semibold ${activeTab === 'feed' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                      Feed
                    </button>
               
                 
                </div>
                <div className="flex items-center gap-4 justify-center">
                  <button onClick={() => setViewType('grid')} className={`p-2 rounded ${viewType === 'grid' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                    <Grid className={`w-5 h-5 ${viewType === 'grid' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
                  </button>
                  <button onClick={() => setViewType('list')} className={`p-2 rounded ${viewType === 'list' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                    <List className={`w-5 h-5 ${viewType === 'list' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
                  </button>
                </div>
              </div>
            </div>
          </nav>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
      <ForumFeed />
     </div>
      )}
      </>
    );
  };
  
  // ✅ Export here, outside the component
  export default ArticleList;