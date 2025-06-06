import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiProvider, createConfig, http } from 'wagmi';
import { wagmiConfig } from './sections/mint/wagmiConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { sepolia, holesky } from 'viem/chains';
import App from './App.jsx'
import './index.css'
import { AppKitProvider } from './utils/reown/index.jsx'




createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
        <AppKitProvider>
          <App />
        </AppKitProvider>
    </WagmiProvider>
  </StrictMode>
);


