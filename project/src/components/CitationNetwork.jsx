import React, { useRef, useState, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { MeshTabs, MeshTermMeter } from "./MeshScopeMeter";
import Legend from './Legend';


// 🔧 Dark mode detection hook
function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  

  useEffect(() => {
    const checkDark = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

function CitationNetwork({ graphData, legend }) {
    const fgRef = useRef();
    const isDark = useDarkMode();
    const [loading, setLoading] = useState(true);
    const [tooltipContent, setTooltipContent] = useState("");
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [activeTab, setActiveTab] = useState("citation");
    const uniqueGroups = Array.from(new Set((graphData?.nodes || []).map(n => n.group)));
    const legendData = uniqueGroups.map(group => {
        const node = graphData.nodes.find(n => n.group === group);
        return { label: group, color: node?.color || "#ccc" };
    });
      if (!graphData || !Array.isArray(graphData.nodes)) {
  return <div className="p-4 text-gray-600 dark:text-gray-300">Loading graph...</div>;
}
  
    // ⬅️ Track mouse globally over the graph area
    const handleMouseMove = (e) => {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    };
  
    const handleNodeHover = (node) => {
      if (node) {
        const content = [
          node.label,
          Array.isArray(node.mesh) && node.mesh.length
            ? `Keywords: ${node.mesh.slice(0, 3).join(", ")}`
            : null,
        ]
          .filter(Boolean)
          .join("\n");

        setTooltipContent(content);
      } else {
        setTooltipContent("");
      }
    };


    const meshCounts = {};
    if (graphData?.nodes) {
      graphData.nodes.forEach((node) => {
        const terms = node.mesh || node.mesh_terms || [];
        terms.forEach((term) => {
          meshCounts[term] = (meshCounts[term] || 0) + 1;
        });
      });
    }



  

  return (
    <div
      className="relative w-full"
      style={{ height: "1000px" }}
      onMouseMove={handleMouseMove}
    >
        {/* {graphData?.nodes && <Legend nodes={graphData.nodes} />}



        {legend && (
        <div className="flex flex-row flex-wrap items-center justify-start gap-6 mb-4">
            {legend.map(({ label, color }, idx) => (
            <div key={idx} className="flex items-center space-x-2">
                <span
                className="inline-block w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
                ></span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
            </div>
            ))}
        </div>
        )} */}

        
          {graphData && graphData.nodes && graphData.links ? (
            <ForceGraph2D
                ref={fgRef}
                graphData={graphData}
                width={900}
                height={800}
                nodeAutoColorBy="group"
                linkDirectionalParticles={2}
                onNodeHover={handleNodeHover}
                onNodeClick={(node) => {
                if (node?.id) {
                    window.open(`/rblock/${node.id}`, "_blank");
                }
                }}
            />
            ) : (
            <p className="text-gray-400">Loading graph...</p>
          )}

           
     


      {tooltipContent && (
        <div
          style={{
            position: "fixed",
            top: tooltipPos.y + 10,
            left: tooltipPos.x + 10,
            background: isDark ? "#1a1a1a" : "#fff",
            color: isDark ? "#eee" : "#000",
            border: "1px solid #ccc",
            padding: "8px",
            borderRadius: "4px",
            pointerEvents: "none",
            fontSize: "12px",
            zIndex: 1000,
            whiteSpace: "pre-line",
          }}
        >
          {tooltipContent.split("\n").map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CitationNetwork;
