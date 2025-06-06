import React from "react";

const Legend = ({ nodes }) => {
  // Extract top 5 unique groups and their colors
  const groupMap = new Map();
  nodes.forEach(node => {
    if (!groupMap.has(node.group)) {
      groupMap.set(node.group, node.color || "#ccc");
    }
  });

  const topGroups = Array.from(groupMap.entries()).slice(0, 5);

  return (
    <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded shadow w-full max-w-md">
      <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
        Legend (Top Groups)
      </h5>
      <ul className="space-y-1">
        {topGroups.map(([group, color]) => (
          <li key={group} className="flex items-center space-x-2 text-sm">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-gray-800 dark:text-gray-100 truncate">{group}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Legend;