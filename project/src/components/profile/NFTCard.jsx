import { PencilIcon } from 'lucide-react';

export function NFTCard({ nft, isEditing }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative">
      {isEditing && (
        <button className="absolute top-2 right-2 p-1 bg-purple-100 dark:bg-purple-900 rounded-full z-10">
          <PencilIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </button>
      )}
      <img src={nft.imageUrl} alt={nft.title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{nft.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{nft.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{nft.price} ETH</span>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            {isEditing ? 'Update Price' : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
}