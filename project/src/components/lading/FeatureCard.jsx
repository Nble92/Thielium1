import React from 'react';

export function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
}