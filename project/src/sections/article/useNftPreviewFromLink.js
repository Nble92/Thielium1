import { useState, useEffect } from 'react';
import axios from 'axios';

const useNftPreviewFromLink = (nftLink) => {
  const [nftData, setNftData] = useState(null);
  const [isNftLoading, setIsNftLoading] = useState(false);

  useEffect(() => {
    if (!nftLink) return;

    const fetchNft = async () => {
      setIsNftLoading(true);
      try {
        const nftUrlParts = nftLink.split('/');
        const chain = nftUrlParts[4];       // e.g., "sepolia"
        const address = nftUrlParts[5];     // e.g., "0x123..."
        const tokenId = nftUrlParts[6];     // e.g., "41"

        const apiUrl = `https://testnets-api.opensea.io/api/v2/chain/${chain}/contract/${address}/nfts/${tokenId}`;
        const res = await axios.get(apiUrl, {
          headers: { 'X-API-KEY': '24b3a11a025643f796db1c57cb28f163' }
        });

        setNftData(res.data.nft);
      } catch (err) {
        console.error("❌ NFT fetch failed:", err);
        setNftData(null);
      } finally {
        setIsNftLoading(false);
      }
    };

    fetchNft();
  }, [nftLink]);

  return { nftData, isNftLoading };
};

export default useNftPreviewFromLink;
