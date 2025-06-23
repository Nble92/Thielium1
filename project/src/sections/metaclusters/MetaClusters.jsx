import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MetaClusters = () => {
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const res = await axios.get('https://aleflabs.net/article/metaclusters/');
        console.log("✅ MetaClusters response:", res.data);
        setClusters(res.data.metaclusters || []);  // fallback
      } catch (err) {
        console.error('❌ Failed to fetch MetaClusters:', err);
      }
    };

    fetchClusters();
  }, []);

  return (
    <div className="p-6 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-6">MetaClusters</h1>

      {clusters.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No clusters found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {clusters.map((cluster, idx) => {
            const terms = cluster.mesh_terms || [];
            return (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border dark:border-gray-700"
              >
                <h2 className="text-xl font-semibold mb-2">
                  {cluster.mesh_label !== "Unknown"
                    ? cluster.mesh_label
                    : "🔍 Unclassified"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Root: {cluster.mesh_root}
                </p>
                <p className="mt-2">🧩 Clusters: {cluster.cluster_ids?.length || 0}</p>
                <p>📚 Articles: {cluster.article_count}</p>
                <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
                  Terms: {terms.length ? terms.slice(0, 5).join(', ') : '—'}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MetaClusters;
