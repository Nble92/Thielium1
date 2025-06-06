import React from 'react';

export function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-500">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
          Join thousands of satisfied customers who have transformed their business with our platform.
        </p>
        <button className="px-8 py-4 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
          Start Free Trial
        </button>
      </div>
    </section>
  );
}