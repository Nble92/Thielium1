import React, { useState, useEffect } from 'react';

const CitationNetworkFilters = ({ graphData, onFilter }) => {
  const [years, setYears] = useState([2000, 2025]);
  const [selectedMeshTerms, setSelectedMeshTerms] = useState([]);
  const [allMeshTerms, setAllMeshTerms] = useState([]);

  // ✅ Extract MeSH terms from graphData
  useEffect(() => {
    if (!graphData || !graphData.nodes) return;

    const meshTerms = new Set();
    graphData.nodes.forEach((node) => {
      const terms = node.mesh || node.mesh_terms || [];
      console.log("terms",terms)
      if (Array.isArray(terms)) {
        terms.forEach(term => meshTerms.add(term));
      }
    });

    setAllMeshTerms([...meshTerms]);
  }, [graphData]);

  const clearFilters = () => {
    // setYears([2000, 2025]);
    setSelectedMeshTerms([]);
    onFilter(graphData); // Reset to full graph
  };

  

  const applyFilters = () => {
    if (!graphData?.nodes) return;

    const filteredNodes = graphData.nodes.filter((node) => {
      const year = node.year || 0; // fallback to 0 if undefined
      const meshTerms = Array.isArray(node.mesh) ? node.mesh : [];

      const yearMatch = year >= years[0] && year <= years[1];
      const meshMatch =
        selectedMeshTerms.length === 0 ||
        meshTerms.some((term) => selectedMeshTerms.includes(term));

      return yearMatch && meshMatch;
    });

    // You likely want to also filter the edges to match the filtered nodes
    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = graphData.edges?.filter(
      (edge) => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
    ) || [];

    setGraphData({
      nodes: filteredNodes,
      edges: filteredEdges,
    });
  };

  return (
    <div className="p-4 bg-blue-300 dark:bg-gray-900 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-white">
        Filter Citation Network
      </h3>

      {/* Year Range */}
      <div className="mb-2">
        
      </div>

      {/* MeSH Terms */}
      <div className="mb-2">
        <label className="text-sm text-gray-600 dark:text-gray-300">MeSH Terms:</label>
        <select
          multiple
          className="w-full mt-1 p-1 rounded"
          value={selectedMeshTerms}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, o => o.value);
            setSelectedMeshTerms(values);
          }}
        >
          {allMeshTerms.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Apply Button */}
      <button
        onClick={applyFilters}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Apply Filters
      </button>

      <button
        onClick={clearFilters}
        className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default CitationNetworkFilters;
