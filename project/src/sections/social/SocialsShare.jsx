import React from 'react';
import { Copy } from 'lucide-react';
// SocialsShare.jsx
const SocialsShare = ({ articleUrl, articleTitle }) => {
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(articleTitle);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      alert('Link copied to clipboard! You can paste it anywhere, including Instagram.');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const platforms = [
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: '/icons/facebook.svg'
    },
    {
      name: 'X',
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: '/icons/x.svg'
    },
    {
      name: 'Reddit',
      url: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      icon: '/icons/reddit.svg'
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      icon: '/icons/linkedin.svg'
    },
    {
      name: 'WhatsApp',
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: '/icons/whatsapp.svg'
    },
  ];
  

  return (
    <div className="flex flex-wrap gap-4 mt-6">
      {platforms.map((platform) => (
        <a
          key={platform.name}
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <img src={platform.icon} alt={platform.name} className="w-5 h-5" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{platform.name}</span>
        </a>
      ))}

      {/* Instagram Special */}
      <button
        onClick={handleCopyLink}
        className="flex items-center space-x-2 bg-pink-400 dark:bg-pink-600 px-4 py-2 rounded-lg hover:bg-pink-500 dark:hover:bg-pink-700 transition-colors"
      >
        <img src="/icons/instagram.svg" alt="Instagram" className="w-5 h-5" />
        <span className="text-sm font-medium text-white">Instagram</span>
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors"
      >
        <span className="text-sm font-medium text-blue-700 dark:text-white">Copy Link</span>
      </button>
    </div>
  );
};

export default SocialsShare;
