import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Search, Filter, Dna, Brain, Microscope, FlaskRound as Flask } from 'lucide-react';
import { NFTCard } from '../../components/lading/NFTCard';

const categories = [
  { name: 'All', icon: Filter },
  { name: 'Biology', icon: Dna },
  { name: 'Neuroscience', icon: Brain },
  { name: 'Physics', icon: Microscope },
  { name: 'Chemistry', icon: Flask },
];

const nfts = [
  {
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=1000",
    title: "Neural Network Visualization",
    author: "Dr. Sarah Chen",
    description: "A stunning visualization of artificial neural networks in action, representing the complexity of deep learning systems.",
    price: "2.5",
    category: "Neuroscience"
  },
  {
    image: "https://images.unsplash.com/photo-1614935151651-0bea6508db6b?auto=format&fit=crop&q=80&w=1000",
    title: "Quantum Entanglement",
    author: "Prof. James Maxwell",
    description: "An artistic representation of quantum entanglement, showcasing the mysterious connection between particles.",
    price: "3.2",
    category: "Physics"
  },
  {
    image: "https://images.unsplash.com/photo-1554475900-0a0350e3fc7b?auto=format&fit=crop&q=80&w=1000",
    title: "DNA Double Helix",
    author: "Dr. Maria Rodriguez",
    description: "A beautiful interpretation of the DNA double helix structure, highlighting the building blocks of life.",
    price: "1.8",
    category: "Biology"
  },
  {
    image: "https://images.unsplash.com/photo-1616400619175-5beda3a17896?auto=format&fit=crop&q=80&w=1000",
    title: "Molecular Bonds",
    author: "Dr. Michael Chang",
    description: "Abstract visualization of molecular bonding patterns in complex chemical reactions.",
    price: "2.0",
    category: "Chemistry"
  }
];

export function NFTList() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const filteredNFTs = nfts.filter(nft => {
    const matchesCategory = selectedCategory === 'All' || nft.category === selectedCategory;
    const matchesSearch = nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         nft.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900" ref={ref}>
      <div className="w-full mx-auto px-4">
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Popular Scientific NFT
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover unique digital assets representing groundbreaking scientific discoveries and visualizations.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search NFTs..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category.name
                        ? 'bg-purple-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNFTs.map((nft, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <NFTCard {...nft} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}