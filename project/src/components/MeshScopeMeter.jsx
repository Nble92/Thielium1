import React, { useState } from "react";

const MeshTermMeter = ({ meshCounts, onTermClick }) => {
  if (!meshCounts || Object.keys(meshCounts).length === 0) {
    return (
      <div className="p-4 bg-white dark:bg-gray-900 rounded shadow-md">
        <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-2">
          MeSH Term Usage Overview
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No MeSH data available.
        </p>
      </div>
    );
  }

  const sortedMesh = Object.entries(meshCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10 terms

  const maxCount = Math.max(...sortedMesh.map(([, count]) => count));

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded shadow-md">
      <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-2">
        MeSH Term Usage Overview
      </h4>
      <div className="space-y-2">
        {sortedMesh.map(([term, count]) => {
          const percentage = (count / maxCount) * 100;
          const color = term.length <= 10 ? "bg-blue-400" : "bg-yellow-500";

          return (
            <div
              key={term}
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => onTermClick?.(term)}
            >
              <div className="w-24 text-sm text-gray-700 dark:text-gray-300 truncate">
                {term}
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded h-4">
                  <div
                    className={`${color} h-4 rounded transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MeshTabs = ({ meshCounts, citationGraph, loading, onTermClick }) => {
  const [activeTab, setActiveTab] = useState("citation");

  return (
    <div>
      <div className="flex space-x-4 border-b mb-4">
        <button
          className={`px-4 py-2 font-medium rounded-t-md transition-colors duration-200 focus:outline-none ${
            activeTab === "citation"
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
          onClick={() => setActiveTab("citation")}
        >
          Citation Network
        </button>
        <button
          className={`px-4 py-2 font-medium rounded-t-md transition-colors duration-200 focus:outline-none ${
            activeTab === "mesh"
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
          onClick={() => setActiveTab("mesh")}
        >
          Groups & Summaries
        </button>
      </div>

      {activeTab === "citation" ? (
        <div>
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-dashed rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Loading graph...
              </p>
            </div>
          ) : (
            citationGraph
          )}
        </div>
      ) : (
        <MeshTermMeter meshCounts={meshCounts} onTermClick={onTermClick} />
      )}
    </div>
  );
};

export { MeshTermMeter, MeshTabs };
