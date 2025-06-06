import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { PinataSDK } from 'pinata';
import { NFT_ADDRESS, PINATA_JWT } from '../../config';
import { toast } from 'react-hot-toast';
import categoriesData from '../../config/categories.json';
import nftAbi from '../../config/nftabi.json';
import { useAccount, useWriteContract, useSwitchChain } from 'wagmi';
import { useLocation } from 'react-router-dom';
import { createConfig,http, readContract } from '@wagmi/core';
import axios from 'axios';
import { confluxESpaceTestnet, mainnet, sepolia } from 'viem/chains';
import { BACKEND_URL } from '../../config';
import { holesky } from 'viem/chains';
// import { waitForTransactionReceipt } from 'wagmi/actions';
import { waitForTransactionReceipt } from 'viem/actions';
import { useConfig } from 'wagmi';


// Remove the old CATEGORIES constant and use the imported data
const CATEGORIES = categoriesData.categories;

export function MintNFT() {
  const location = useLocation();
  const { title, abstract, doi, hash_id } = location.state || {};

  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const {address, isConnected} = useAccount();
  const config = useConfig();
  const [formData, setFormData] = useState({
    title: title || '',
    description: abstract || '',
    category: '',
    articleLink: doi || '',
    hash_id: hash_id || '',
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const pinata = new PinataSDK({
    pinataJwt: PINATA_JWT,
    pinataGateway: 'silver-impressive-rat-686.mypinata.cloud'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      alert('Please connect your wallet');
      return;
    }
    if (!imageFile) {
      toast.error('Please select an image file');
      return;
    }

    try {
      setIsUploading(true);

      // First upload the image file
      const imageUpload = await pinata.upload.public.file(imageFile);
      console.log('Image uploaded:', imageUpload);

      // Create metadata JSON

      const metadata = {
        "name": formData.title,
        "description": formData.description,
        "image": `https://silver-impressive-rat-686.mypinata.cloud/ipfs/${imageUpload.cid}`,
        "attributes": [
          {
            "trait_type": "Category",
            "value": formData.category
          },
          {
            "trait_type": "Link",
            "value": formData.articleLink
          }
        ]
      }

      // Create metadata file
      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], 'metadata.json', { type: 'application/json' });

      // Upload metadata file
      const metadataUpload = await pinata.upload.public.file(metadataFile);
      console.log('Metadata uploaded:', metadataUpload);

      const metadataURI = `https://silver-impressive-rat-686.mypinata.cloud/ipfs/${metadataUpload.cid}`;

      await switchChainAsync({
        chainId: sepolia.id, // 17000
      }); // Holesky, 1:MainNet
      

      const tx = await writeContractAsync({
        abi: nftAbi,
        address: NFT_ADDRESS,
        functionName: 'mintNFT',
        args: [address, metadataURI],
      });
      
      console.log("🧪 TX Returned:", tx);
      
      if (tx) {
        const config = createConfig({
          chains: [sepolia],
          transports: {
            [sepolia.id]: http('https://sepolia.infura.io/v3/942d6966ac694151ae4f661e11320a71'),
          },
        });


        console.log(tx);
        console.log("🧪 Minting NFT with:");
        console.log("  → Address:", address);
        console.log("  → Token URI:", metadataURI);
        console.log("  → NFT Contract:", NFT_ADDRESS);
        // const receipt = await waitForTransactionReceipt(config, { hash: tx });

        try {
          const receipt = await waitForTransactionReceipt(config, {
            hash: tx,
            // timeout: 300000,  // 2 minutes
            pollingInterval: 5000
          });
          console.log("Config used for waitForTransactionReceipt:", config);
          console.log('📦 Receipt:', receipt);

          let newItemId = await readContract({
            abi: nftAbi,
            address: NFT_ADDRESS,
            functionName: 'tokenCounter',
          });
          newItemId = newItemId - BigInt(1);
          console.log(newItemId);
      
          toast.success('NFT created successfully!');

        
          const updateData = {
            hash_id: formData.hash_id,
            tx_link: `https://sepolia.etherscan.io/tx/${tx}`,
            nft_url: `https://testnets.opensea.io/assets/sepolia/${NFT_ADDRESS}/${newItemId}`
          };

          console.log(updateData);
          await axios.put(`${BACKEND_URL}/article/update_nft_links`, updateData);
          toast.success('Article updated successfully!');
      
        } catch (err) {
          console.warn('⏳ TX still pending, redirecting to Etherscan');
          toast('Transaction is pending. You can view it on Etherscan.', {
            icon: '⏳'
          });
          window.open(`https://sepolia.etherscan.io/tx/${tx}`, '_blank');
        }
      }

      setFormData({
        title: '',
        description: '',
        category: '',
        articleLink: '',
        hash_id: '',
      });
      setPreviewImage(null);
      setImageFile(null);

    } catch (error) {
      console.error('Failed to create NFT:', error);
      toast.error('Failed to create NFT');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create New NFT</h2>

          {/* Image Upload */}
          <div 
            className={`mb-6 p-4 border-2 border-dashed rounded-lg ${
              isDragging 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {previewImage ? (
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                <div>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Drag and drop or click to upload
                    </span>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileInput}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                readOnly
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                readOnly
                rows={4}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Article Link */}
            <div>
              <label htmlFor="articleLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Scientific Article Link
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <input
                  type="url"
                  id="articleLink"
                  name="articleLink"
                  value={formData.articleLink}
                  readOnly
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Please provide a DOI or direct link to your scientific article
              </p>
            </div>

            {/* Hash ID */}
            <div>
              <label htmlFor="hash_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Article Hash ID
              </label>
              <input
                type="text"
                id="hash_id"
                name="hash_id"
                value={formData.hash_id}
                readOnly
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Updated Category Select */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Scientific Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(category => (
                  <option 
                    key={category} 
                    value={category}
                    className="py-1"
                  >
                    {category}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose the most relevant category for your scientific NFT
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUploading}
              className={`w-full px-6 py-3 rounded-lg text-white transition-colors duration-200 ${
                isUploading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isUploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Minting NFT...</span>
                </div>
              ) : (
                'Create NFT'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
