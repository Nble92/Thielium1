import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const NFTgramChart = ({ events }) => {
  const chartData = events
    .filter(e => ['sale', 'order'].includes(e.type) && e.payment)
    .map(e => ({
      timestamp: new Date(e.timestamp * 1000).toLocaleString(),
      type: e.type,
      price: parseFloat(e.payment),
    }));


const useIsDarkMode = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(media.matches);
    const listener = e => setIsDark(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  return isDark;
};


  return (
    <div className="p-4 rounded shadow bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <h3 className="text-lg font-semibold mb-2">Marketplace History</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
          <YAxis unit=" ETH" />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            data={chartData.filter(d => d.type === 'order')}
            name="Offers"
            stroke="#dc00ff"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="price"
            data={chartData.filter(d => d.type === 'sale')}
            name="Sales"
            stroke="#33f000"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NFTgramChart;
