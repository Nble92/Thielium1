// wagmiConfig.js
import { createConfig, http } from 'wagmi';
import { sepolia, goerli } from 'wagmi/chains';

export const wagmiConfig = createConfig({
  chains: [sepolia, goerli],
  transports: {
    [sepolia.id]: http('https://sepolia.infura.io/v3/YOUR_INFURA_KEY'),
    [goerli.id]: http('https://goerli.infura.io/v3/YOUR_INFURA_KEY'),
  },
});
