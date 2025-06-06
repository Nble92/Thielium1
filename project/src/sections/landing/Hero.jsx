import React from 'react';
import { ArrowRight } from 'lucide-react';
import { LoginCard } from '../../components/lading/LoginCard';

export function Hero() {
  return (
    <section className="px-4 w-full mt-10 pb-40">
      <div className="w-full">
        <div className="w-full grid lg:grid-cols-2 gap-12 items-center">
          <div className='w-full'>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Empowering Tomorrows Breakthroughs
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Pioneering OpenAnalysis, with the first Social Blockchain
            </p>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium text-gray-700 dark:text-gray-300">
                Learn More
              </button>
            </div>
          </div>
          <div className="py-2">
            <LoginCard />
          </div>
        </div>
      </div>
    </section>
  );
}