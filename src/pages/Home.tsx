import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../constants';
import { motion } from 'motion/react';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All Product');
  
  // Combine 'All Product' with the existing categories
  const categories = ['All Product', ...CATEGORIES.map(c => c.name)];
  
  const filteredProducts = activeCategory === 'All Product' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div className="pt-28 pb-20 px-6 md:px-10 max-w-[1400px] mx-auto">
      <h1 className="text-3xl md:text-4xl font-headline font-bold text-on-surface mb-8">Produk</h1>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div className="flex overflow-x-auto pb-2 md:pb-0 w-full md:w-auto gap-2 hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors border ${
                activeCategory === cat 
                  ? 'bg-primary-fixed text-on-primary-fixed border-primary-fixed' 
                  : 'bg-transparent text-on-surface-variant border-surface-container-highest hover:border-primary/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-surface-container-highest text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors whitespace-nowrap">
          <SlidersHorizontal className="w-4 h-4" />
          Sort By
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
        {filteredProducts.map((product, idx) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group flex flex-col"
          >
            <Link to={`/product/${product.id}`} className="relative aspect-square bg-surface-container rounded-2xl overflow-hidden mb-4">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" 
                alt={product.name}
                src={product.image}
                referrerPolicy="no-referrer"
              />
              {product.badge && (
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-on-surface text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider">
                  {product.badge}
                </div>
              )}
            </Link>
            <div className="text-center px-2">
              <p className="text-[11px] text-on-surface-variant/70 font-semibold uppercase tracking-wider mb-1.5">{product.category}</p>
              <h3 className="font-headline text-base font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">
                <Link to={`/product/${product.id}`}>{product.name}</Link>
              </h3>
              <p className="text-sm text-on-surface-variant">
                {product.minOrder} - Rp {product.price.toLocaleString('id-ID')}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-on-surface-variant text-lg">Tidak ada produk dalam kategori ini.</p>
        </div>
      )}
    </div>
  );
}
