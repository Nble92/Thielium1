export const holesky = {
    id: 17000,
    name: 'Holesky',
    network: 'holesky',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://holesky.infura.io/v3/942d6966ac694151ae4f661e11320a71'],
      },
      public: {
        http: ['https://holesky.infura.io/v3/942d6966ac694151ae4f661e11320a71'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Etherscan',
        url: 'https://holesky.etherscan.io',
      },
    },
  };
  