import React, { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { BACKEND_URL } from '../config';
import { supabase } from "../utils/supabase";



const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const ArticleInstitutionMap = ({ query_hash }) => {
  const [mainLocation, setMainLocation] = useState(null);
  const [citations, setCitations] = useState([]);
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [hash, setHash] = useState(null);




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

  const isDark = useDarkMode();

  useEffect(() => {
  const fetchLocation = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("❌ No valid Supabase session:", sessionError);
        return;
      }

      const token = session.access_token;

      const res = await fetch(`${BACKEND_URL}/api/article/map/${query_hash}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("✅ Map Data:", data);

      if (!data.error) {
        setMainLocation(data.main);
        setCitations(data.citations || []);
        setHash(data.query_hash);
      } else {
        console.warn("⚠️ Map API returned error:", data.error);
      }
    } catch (err) {
      console.error("❌ Failed to load location data:", err);
    }
  };

  if (query_hash) fetchLocation();
}, [query_hash]);

  if (!mainLocation) {
    return <p className="text-gray-400">Institution location not available.</p>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Map of Citations
      </h2>
      {hash && (
        <p className="text-xs text-gray-500 mb-2">Article Hash: <code>{hash.slice(0, 12)}...</code></p>
      )}

      <ComposableMap
        projection="geoEqualEarth"
        width={800}
        height={400}
        style={{ width: "100%", height: "auto" }}
        onMouseLeave={() => setTooltipContent("")}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={isDark ? "#222" : "#EEE"}
                stroke={isDark ? "#555" : "#999"}
              />
            ))
          }
        </Geographies>

        {/* 🔴 Main Institution */}
        <Marker
          coordinates={[mainLocation.lon, mainLocation.lat]}
          onMouseEnter={(e) => {
            setTooltipContent(`${mainLocation.institution}\nMain Article`);
            setTooltipPos({ x: e.clientX, y: e.clientY });
          }}
          onMouseLeave={() => setTooltipContent("")}
        >
          <circle r={6} fill={isDark ? "#ff5555" : "#f00"} stroke="#fff" strokeWidth={1} />
          <text
            textAnchor="middle"
            y={-10}
            style={{ fontSize: 10, fill: "#333", fontWeight: "bold" }}
          >
            {mainLocation.institution}
          </text>
        </Marker>

        {/* 🔵 Citation Institutions */}
        {citations.map((c, idx) => (
          <Marker
            key={idx}
            coordinates={[c.lon, c.lat]}
            onMouseEnter={(e) => {
              const content = `${c.institution}\n${c.title ?? ""}\n${c.year ?? ""}\n${c.doi ?? ""}`;
              setTooltipContent(content);
              setTooltipPos({ x: e.clientX, y: e.clientY });
            }}
            onMouseLeave={() => setTooltipContent("")}
          >
            <circle r={4} fill={isDark ? "#66aaff" : "#00f"} />
          </Marker>
        ))}
      </ComposableMap>

      {/* Tooltip */}
      {tooltipContent && (
        <div
          style={{
            position: "fixed",
            top: tooltipPos.y + 10,
            left: tooltipPos.x + 10,
            background: "white",
            border: "1px solid #ccc",
            padding: "8px",
            fontSize: "12px",
            borderRadius: "4px",
            pointerEvents: "none",
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
};

export default ArticleInstitutionMap;
