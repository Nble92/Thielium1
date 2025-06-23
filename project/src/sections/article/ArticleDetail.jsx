import React, { useRef,useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Book, Calendar, Globe, Users, Tag, DollarSign, Award, FileText, Link, Clock, Building2,
  HandCoins, Coins, Star, Clock4, Merge , RefreshCcw,ArrowUpRight, ArrowDownRight,
  ChevronDown,ChevronRight,
} from 'lucide-react';
import { BACKEND_URL } from '../../config';
import axios from 'axios';
import ArticleComments from '../social/ArticleComments';
import SocialsShare from "../social/SocialsShare";
import NFTgramChart from '../../components/NFT/NFTgramChart';
import { Contract } from 'ethers';
import { supabase } from "../../utils/supabase";
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import ArticleInstitutionMap from "../../components/map";
import { ClipboardCopy } from 'lucide-react';
import QRCode from "react-qr-code";
import ForceGraph2D from 'react-force-graph-2d';
import CitationNetworkFilters from '../../components/CitationNetworkFilters'; // Adjust path as needed
import CitationNetwork from "../../components/CitationNetwork";  // adjust path if needed
import { MeshTabs, MeshTermMeter } from "../../components/MeshScopeMeter";
import { fetchWithSupabase } from "../../utils/fetchWithSupabase";




const ArticleDetail = () => {
  const { queryHash } = useParams();  // ✅ This gets the hash from /main/:queryHash
  const location = useLocation();
  const navigate = useNavigate();

  const [article, setArticle] = useState(location.state?.article || null);  // ✅ fallback to null if not passed
  const [nftData, setNftData] = useState(null);
  const [isNftLoading, setIsNftLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('article');

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const [eventCounts, setEventCounts] = useState({});  
  const [nftEvents, setNftEvents] = useState([]);
  const [nftPerformance, setNftPerformance] = useState({});
  const [articleLoading, setArticleLoading] = useState(true);
  const context = useContext(UserContext);

  if (!context) {
    console.warn("⚠️ UserContext is null — did you forget to wrap the component in <UserProvider>?");
  }

  const { user } = context || {};  const [pricingData, setPricingData] = useState(null);
  const [open, setOpen] = useState(true);
  const [contract, setContract] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [chain, setChain] = useState("");
  const [copied, setCopied] = useState(false);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [originalGraphData, setOriginalGraphData] = useState({ nodes: [], links: [] });
  const [outerTab, setOuterTab] = useState("visuals");
  const [innerTab, setInnerTab] = useState("citation");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const meshCounts = {};
  if (graphData && Array.isArray(graphData.nodes)) {
  graphData.nodes.forEach((node) => {
    const terms = node.mesh || node.mesh_terms || [];
    terms.forEach((term) => {
      meshCounts[term] = (meshCounts[term] || 0) + 1;
    });
  });
}


  const fgRef = useRef();

  const BASE_URL = import.meta.env.VITE_API_URL || 'https://aleflabs.net';
  const [mainLocation, setMainLocation] = useState(null);
  const [citations, setCitations] = useState([]);
  const [hash, setHash] = useState(null);


useEffect(() => {
  const fetchLocation = async () => {
    try {
      const session = await supabase.auth.getSession();
      const token = session?.data?.session?.access_token;

      if (!token) {
        console.error("❌ No Supabase token found.");
        return;
      }

      const res = await fetch(`${BACKEND_URL}/api/article/map/${queryHash}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("✅ Map Data:", data);

      if (!data.error) {
        setMainLocation(data.main);      
        setCitations(data.citations || []);
        setHash(data.query_hash);
      }
    } catch (err) {
      console.error("❌ Failed to load location data:", err);
    }
  };

  if (queryHash) fetchLocation();
}, [queryHash]);


  useEffect(() => {
    if (fgRef.current) {
      setTimeout(() => {
        try {
          fgRef.current.zoomToFit(100);  // Optional smooth auto-zoom
        } catch (err) {
          console.warn("zoomToFit failed:", err);
        }
      }, 500);  // Let layout settle
    }
  }, [graphData]);

  useEffect(() => {
  const fetchGraphData = async () => {
    try {
      const res = await fetchWithSupabase(`${BACKEND_URL}/api/article/citations/${queryHash}/`);
      const data = await res.json();
      console.log("✅ Citation Graph:", data);
      setOriginalGraphData(data);
      setGraphData(data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Failed to fetch citation network:", err);
    }
  };

  if (queryHash) fetchGraphData();
}, [queryHash]);

  



  
  const [mintDate, setMintDate] = useState("");
  const [filters, setFilters] = useState({
    mesh: '',
    country: '',
    yearRange: [2000, 2025], // Default range; adjust based on your data
  });

  const availableMeshTerms = graphData?.nodes
  ? [...new Set(graphData.nodes.flatMap(node => node.mesh_terms || []))]
  : [];

  const availableCountries = graphData?.nodes
    ? [...new Set(graphData.nodes.map(n => n.country).filter(Boolean))]
    : [];



  useEffect(() => {
    if (article?.nft_link) {
      const parts = article.nft_link.split('/');
      setChain(parts[4]);
      setContract(parts[5]);
      setTokenId(parts[6]);
    }
  }, [article]);

  const mintYear = mintDate ? new Date(mintDate).getFullYear() : "n/a";

  const citationText = article
    ? `[1] Thielium: ${article.category?.name || 'Anonymous'} 
  "${article.title}" ${article.authors || 'Anonymous'} (${mintYear})
  NFT_Contract:${contract} TokenID: ${tokenId} Chain:${chain}
  HashID:${article.hash_id}
  Thielium:https://thielium.com/rblock/${article.hash_id}`
    : '';
    const copyToClipboard = () => {
      if (citationText) {
        navigator.clipboard.writeText(citationText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

  
  useEffect(() => {
    if (!queryHash) return;

  


    
  
    const fetchEventCounts = async () => {
      try {
        setIsNftLoading(true);
  
        const res = await axios.get(`article/${queryHash}/events/`);
        console.log("✅ Events fetched:", res.data);
  
        const events = res.data.events || [];
        const counts = res.data.event_counts || {};
  
        const totalOffers = counts.order || 0;
  
        const lastSale = events
          .filter(e => e.type === "sale")
          .sort((a, b) => b.timestamp - a.timestamp)[0];
        const lastSalePrice = lastSale?.payment || "—";
  
        const highestOffer = events
          .filter(e => e.type === "order" && e.payment)
          .sort((a, b) => parseFloat(b.payment) - parseFloat(a.payment))[0];
        const highestOfferPrice = highestOffer?.payment || "—";
        const highestOfferMaker = highestOffer?.maker || "—";
  
        const firstSale = events.find(e => e.type === "sale");
        const matchingListing = events.find(e =>
          e.type === "order" && e.order_hash === firstSale?.order_hash
        );
        const timeToSellSeconds =
          firstSale && matchingListing
            ? firstSale.timestamp - matchingListing.timestamp
            : null;
        const timeToSellDays = timeToSellSeconds
            ? (timeToSellSeconds / 86400).toFixed(2)
            : "—";
  
        const conversions = (counts.sale || 0) / (counts.order || 1);
  
        // Set your states
        setEventCounts(counts);
        setNftEvents(events);
  
        // Optional: store performance metrics
        setNftPerformance({
          totalOffers,
          lastSalePrice,
          highestOfferPrice,
          highestOfferMaker,
          timeToSellDays,
          conversions,
        });
      } catch (err) {
        console.error("❌ Error fetching NFT events:", err.message);
        setEventCounts({});
        setNftEvents([]);
      } finally {
        setIsNftLoading(false);
      }
    };
  
    fetchEventCounts();
  }, [queryHash]);




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

  

  
  
  useEffect(() => {
    const fetchFriendRequests = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
  
      try {
        const res = await axios.get('/api/friend_requests/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const pendingIds = res.data.map(req => req.receiver.id);  // or sender.id if reversed
        console.log('📨 Pending Friend Requests:', pendingIds);
        setPendingRequests(pendingIds);
      } catch (err) {
        console.error("Failed to fetch friend requests:", err.response?.data || err.message);
      }
    };
  
    fetchFriendRequests();
  }, []);
  
  
  
  

  useEffect(() => {
    const fetchArticle = async () => {
      if (!queryHash) return;
  
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
  
      try {
        const response = await axios.get(
          `https://aleflabs.net/article/main/${queryHash}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'X-Requested-With': 'XMLHttpRequest',
            },
            withCredentials: true,
          }
        );
        console.log("✅ Article response:", response.data);
        setArticle(response.data);
      } catch (error) {
        console.error('Error fetching article by hash:', error);
      } finally {
        setArticleLoading(false);
      }
    };
  
    fetchArticle();
  }, [queryHash]);
  
  

  useEffect(() => {
    if (article && article?.nft_link) {
      const timeout = setTimeout(() => {
        const fetchNft = async () => {
          setIsNftLoading(true);
          try {
            const nftUrlParts = article.nft_link.split('/');
            const chain = nftUrlParts[4];
            const address = nftUrlParts[5];
            const identifier = nftUrlParts[6];
  
            const openseaApiUrl = `https://testnets-api.opensea.io/api/v2/chain/${chain}/contract/${address}/nfts/${identifier}`;
            const txUrl = `https://sepolia.etherscan.io/tx/${address}`
            const nftResponse = await axios.get(openseaApiUrl, {
              headers: { 'X-API-KEY': '24b3a11a025643f796db1c57cb28f163' }
            });
            setNftData(nftResponse.data.nft);
          } catch (error) {
            console.error('Error fetching NFT data from OpenSea:', error);
          } finally {
            setIsNftLoading(false);
          }
        };
        fetchNft();
      }, 300); // wait 300ms before firing NFT fetch
  
      return () => clearTimeout(timeout);
    }
  }, [article]);
  

  
  
  

  const handleMintClick = () => {
    navigate('/mint', { state: {
      title: article.title, hash: article.hash, abstract: article.abstract,
      doi: article.DOI, hash_id: article.hash_id
    }});
  };

  if (articleLoading) return <div className="text-center py-12 text-gray-600 dark:text-white">Loading article...</div>;
  if (!article) return <div className="text-center py-12 text-red-600">No article data found.</div>;


  return (
    
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
         
          <div className="w-full relative">
            {/* Light Mode Image */}
            <img 
              src="https://aleflabs.net/media/technology-abstract-lines-dots-connect-background-with-hexagons-hexagon-grid-hexagons-connection-digital-data-big-data-concept-hex-digital-data-visualization-illustration_230610-1076.JPG" 
              alt="Top Banner Light" 
              className="w-full h-48 object-cover block dark:hidden"
            />
            
            {/* Dark Mode Image */}
            <img 
              src="https://aleflabs.net/media/slide-webinar-20230523_edited_edited.jpg" 
              alt="Top Banner Dark" 
              className="w-full h-48 object-cover hidden dark:block"
            />
            {/* Text Overlay */}
            <div className="absolute inset-0 flex flex-col items-start justify-center p-6">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-700 dark:text-teal-300 tracking-tight">
                THIELIUM
              </h1>
              <span className="text-3xl font-bold text-orange-600 dark:text-teal-300 tracking-tight">|</span>
              <h1 className="text-3xl font-bold text-orange-500 dark:text-white">
                {article.category?.name}
              </h1>
            </div>


              <div></div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-700 dark:text-gray-300 drop-shadow-lg">
                RESEARCH BLOCK
              </h1>
              

            </div>
          </div>
          
  
        <br></br>
        <div className="flex flex-col lg:flex-row gap-10">
        
          {/* LEFT side (Main article) */}
          <div className="flex-1 space-y-6">

            {/* Title and Meta */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5">
              <h1 className="text-3xl font-bold text-gray-500 dark:text-white mb-3">{article.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center"><Calendar className="w-4 h-4 mr-2" /><span>{article.publication_year}</span></div>
                <div className="flex items-center"><Book className="w-4 h-4 mr-2" /><span>{article.journal}</span></div>
                <div className="flex items-center"><Globe className="w-4 h-4 mr-2" /><span>{article.country}</span></div>
                <div><p className="font-medium text-gray-900 dark:text-gray-400">Thielium Block Hash: {article.hash_id}</p></div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Research Overview</h2>

              {/* Abstract */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Abstract</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{article.abstract}</p>
              </div>
           
              {/* Toggle Button */}
              <button
                onClick={() => setOpen(! open)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Project Details</h2>
                {open ? (
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-white" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-white" />
                )}
              </button>

              {/* Drawer Content */}
              {open && (
                <div className="bg-white dark:bg-gray-800 p-6 space-y-6">
                  {/* Grid: Research Details + Publication Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Research Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Research Details</h3>

                      <InfoRow icon={<Users />} label="Authors" value={article.authors} />
                      <InfoRow icon={<Building2 />} label="Institutions" value={article.institutions} />
                      <InfoRow icon={<Tag />} label="Keywords" value={article.keywords} />
                      <InfoRow icon={<DollarSign />} label="Funding" value={article.funding} />
                    </div>

                    {/* Publication Info */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Publication Info</h3>

                      <InfoRow
                        icon={<Link />}
                        label="DOI"
                        value={
                          <a
                            href={`https://doi.org/${article.DOI}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 underline break-words"
                          >
                            {article.DOI}
                          </a>
                        }
                      />
                      <InfoRow icon={<FileText />} label="PMID" value={article.pmid} />
                      <InfoRow icon={<Award />} label="Research Type" value={article.research_type} />
                      <InfoRow icon={<Clock />} label="Last Modified" value={new Date(article.last_modified).toLocaleDateString()} />
                    </div>

                    <div className="space-y-4">
                    {/* <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm"> */}
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Blockchain Citation</h3>
                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{citationText}</pre>
                    <button
                      onClick={copyToClipboard}
                      className="mt-2 inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      <ClipboardCopy className="w-4 h-4 mr-1" />
                      {copied ? "Copied!" : "Copy to Clipboard"}
                    </button>
                  {/* </div> */}
                  <QRCode
                    value={`https://thielium.com/rblock/${article.hash_id}`}
                    size={128}
                  />
                  </div>


                  </div>
                </div>
              )}
            </div>

            
            {article?.hash_id && <ArticleInstitutionMap query_hash={article.hash_id} />}



            {/* Top-Level Tabs: Article / Visualizations */}
            <div className="flex space-x-4 mb-6">
              <button
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'article' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'
                }`}
                onClick={() => setActiveTab('article')}
              >
                Article
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'visuals' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'
                }`}
                onClick={() => setActiveTab('visuals')}
              >
                Visualizations
              </button>
            </div>

            {/* ARTICLE TAB */}
            {activeTab === 'article' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Citation Metrics</h2>
                <iframe
                  src={`https://aleflabs.net/static/article/jupyter_files/${article.hash_id}.html`}
                  width="100%"
                  height="1200px"
                  style={{ border: 'none' }}
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {/* VISUALIZATION TAB */}
            {activeTab === 'visuals' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 overflow-hidden">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Citation Map</h2>

                {/* Inner Tabs: Citation Network vs MeSH Summary */}
                <div className="flex space-x-4 border-b mb-4">
                  <button
                    className={`px-4 py-2 font-medium rounded-t-md transition-colors duration-200 focus:outline-none ${
                      innerTab === "citation" ? "bg-blue-600 text-white shadow" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                    onClick={() => setInnerTab("citation")}
                  >
                    Citation Network
                  </button>
                  <button
                    className={`px-4 py-2 font-medium rounded-t-md transition-colors duration-200 focus:outline-none ${
                      innerTab === "mesh" ? "bg-blue-600 text-white shadow" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                    onClick={() => setInnerTab("mesh")}
                  >
                    Groups & Summaries
                  </button>
                </div>

                {/* Citation Network */}
                {innerTab === "citation" ? (
                  <>
                    {Array.isArray(originalGraphData?.nodes) && originalGraphData.nodes.length > 0 && (
                    <CitationNetworkFilters
                        graphData={originalGraphData}
                        onFilter={(filteredData) => setGraphData(filteredData)}
                      />
                    )}

                    {Array.isArray(graphData?.nodes) && graphData.nodes.length > 0 && (
                      <CitationNetwork graphData={graphData} loading={loading} />
                    )}

                  </>
                ) : (
                  <MeshTermMeter meshCounts={meshCounts} />
                )}
              </div>
            )}



                        
                   
               

              </div>

          {/* RIGHT side (NFT + Comments) */}
          <div className="w-full lg:w-1/3 space-y-6">

            {/* NFT Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-center text-gray-700 dark:text-teal-300 mb-6 tracking-tight">
            NFTgraph</h2>
              {article.nft_link ? (
                isNftLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : nftData ? (
                  <>
                     <img src={nftData.display_image_url || nftData.image_url} alt={nftData.name} className="w-full rounded-lg shadow-lg" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">{nftData.name}</h3>
                    <div className="flex gap-4 mt-4">
                    <a href={article.tx_link} target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg">View Transaction</a>
                      <a href={nftData.opensea_url} target="_blank" rel="noopener noreferrer" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">View OpenSea NFT </a>
                    </div>


                    {nftPerformance && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg text-gray-800 dark:text-white space-y-2 border border-orange-500 mt-6">
                      <h3 className="text-xl font-semibold text-orange-600 dark:text-orange-400 mb-4">Asset Metrics</h3>
                      <ul className="space-y-3">
                        <li className="flex items-center justify-between text-lg">
                          <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <HandCoins className="w-6 h-6" />
                            Total Offers:
                          </span>
                          <span className="font-mono text-orange-700 dark:text-orange-300">{nftPerformance.totalOffers}</span>
                        </li>
                        <li className="flex items-center justify-between text-lg">
                          <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Coins className="w-6 h-6" />
                            Sale Price (ETH):
                          </span>
                          <span className="font-mono text-orange-700 dark:text-orange-300">{nftPerformance.lastSalePrice}</span>
                        </li>
                        <li className="flex items-center justify-between text-lg">
                          <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Star className="w-6 h-6" />
                            Highest Offer (ETH):
                          </span>
                          <span className="font-mono text-orange-700 dark:text-orange-300">{nftPerformance.highestOfferPrice}</span>
                        </li>
                        <li className="flex items-center justify-between text-lg">
                          <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Clock4 className="w-6 h-6" />
                            Latent Liquidity<span className="text-xl text-gray-200">(λ)</span>:
                          </span>
                          <span className="font-mono text-orange-700 dark:text-orange-300">{nftPerformance.timeToSellDays * 10} Days</span>
                        </li>
                        <li className="flex items-center justify-between text-lg">
                          <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <RefreshCcw className="w-6 h-6" />
                            NFT Hold <span className="text-xl text-gray-300">(ε)</span>:
                          </span>
                          <span className="font-mono text-orange-700 dark:text-orange-300">{(nftPerformance.conversions * 100).toFixed(1)}%</span>
                        </li>
                      </ul>
                    </div>
                  )}



                    {pricingData && pricingData.current_price && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg text-gray-800 dark:text-white space-y-2 border border-teal-500 mt-6">
                        <h3 className="text-xl font-semibold text-teal-600 dark:text-teal-400">Market Value</h3>

                        <div className="flex items-center justify-between text-lg">
                          <span>Price (ETH):</span>
                          <span className="font-mono text-teal-700 dark:text-teal-300">{pricingData.current_price} Ξ</span>
                        </div>

                        <div className="flex items-center justify-between text-lg">
                          <span>Price (USD):</span>
                          <span className="font-mono">${(pricingData.current_price * 3300).toFixed(2)}</span>
                        </div>

                        <div className="flex items-center justify-between text-lg">
                          <span className="text-gray-600 dark:text-gray-400">Δ Change:</span>
                          <span className={`flex items-center font-mono gap-1 ${
                            pricingData.price_delta > 0
                              ? "text-green-600 dark:text-green-400"
                              : pricingData.price_delta < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-400"
                          }`}>
                            {pricingData.price_delta !== 0 && (
                              pricingData.price_delta > 0 ? (
                                <ArrowUpRight className="w-4 h-4" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4" />
                              )
                            )}
                            {(pricingData.price_delta * 3300).toFixed(2)} USD&nbsp;
                            {(() => {
                              const prev = pricingData.current_price - pricingData.price_delta;
                              const pct = prev > 0 ? (pricingData.price_delta / prev) * 100 : 0;
                              return `(${Math.abs(pct).toFixed(2)}%)`;
                            })()}
                          </span>
                        </div>
                      </div>
                    )}




                        <NFTgramChart events={nftEvents} />
                  </>
                ) : <p className="text-gray-600 dark:text-gray-300">Failed to load NFT data</p>
              ) : (
                <button onClick={handleMintClick} className="bg-yellow-500 hover:bg-yellow-600 text-white px-10 py-2 rounded-lg">Mint</button>
              )}
            </div>

         


            <SocialsShare articleTitle={article.title} articleUrl={currentUrl} />
            {/* Comments */}
            <div className="text-xl text-gray-700 dark:text-gray-300"> Article Published By:</div>
            {article?.account && (
            <div className="flex items-center gap-3 mt-3">
              <img
                src={article.account.avatar || '/default-avatar.png'}
                alt="Author Avatar"
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => (e.target.src = '/default-avatar.png')}
              />
              <span className="text-2xl text-gray-700 dark:text-gray-300">
                @{article.account.username || 'unknown'}
              </span>
              {user && article.account?.id && user.id !== article.account.id && (
                
              <button
                disabled={pendingRequests.includes(article.account.id)}
                onClick={async () => {
                  const { data: { session } } = await supabase.auth.getSession();
                  const token = session?.access_token;
                  if (!token) return;

                  try {
                    await axios.post(
                      '/api/friend_requests/',
                      {
                        sender: user.id,
                        receiver: article.account.id
                      },
                      {
                        headers: { Authorization: `Bearer ${token}` }
                      }
                    );
                    setPendingRequests(prev => [...prev, article.account.id]);
                  } catch (err) {
                    console.error("Friend request failed:", err.response?.data || err.message);
                    alert("Friend request could not be sent.");
                  }
                }}
                className={`ml-2 text-xs font-semibold px-3 py-1 rounded-full ${
                  pendingRequests.includes(article.account.id)
                    ? 'bg-gray-500 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {pendingRequests.includes(article.account.id) ? 'Pending' : 'Add Friend'}
              </button>)}


            </div>
          )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              {article?.hash_id && <ArticleComments queryHash={article.hash_id} />}
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};


// Reusable row component
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start">
    <div className="w-5 h-5 mr-3 text-gray-400">{icon}</div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-gray-700 dark:text-gray-300">{value}</p>
    </div>
  </div>
);

export default ArticleDetail;