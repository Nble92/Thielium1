import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',  // ✅ Add this line for relative asset resolution
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: '3000',
    historyApiFallback: true,
    headers: {
      "Content-Security-Policy": `
        frame-ancestors 'self' 
        http://localhost:* 
        https://*.pages.dev 
        https://*.vercel.app 
        https://*.ngrok-free.app 
        https://secure-mobile.walletconnect.com 
        https://secure-mobile.walletconnect.org`.replace(/\s+/g, ' ')
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/article/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/article': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: ['react-force-graph-2d'],
    exclude: ['lucide-react']
  }
});
