import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, MessageCircle, CheckCircle, Minus, Plus, ChevronRight, Star } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { motion } from 'motion/react';

export default function ProductDetail() {
  const { id } = useParams();
  const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[4]; // Default to Mr.Dax if not found
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [activeImage, setActiveImage] = useState(product.image);

  const images = [
    product.image,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA6yN5VLD97ZADEYBcCh638scU5X0ghJxmpTsH-i75Jzvtbq5THab04nNTLr-NaOwdhAIFTubnUrPur5ylpBy8W7WOJmsdXaSU2VQPSz2MDTn9BfWzblXhO0lWAYZdQPhuPyzOc2aKPsl5GQNdLax_alMswdO_B7shF56k9YOTMa4agfqYMQhM8i1QSXTQVVJIEvJkyFQKpGBLO1Xbki0iwfbVb0obMKhLRNmG5vq-yDNW9Zrslw9xnTqQFNvKpt48vrsCsPEXlU_E',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBhg-M_zsGAdCfjB-J9zcmC0qLLxH86F0ODBPmdjVyCctKnIY2zgWufknI3yvIW1b2pDtX1ShTHA0WwoQk3KvBE7yhcnwv-nYPJVrz-FzaXSA7Y0fqUM2J2PwUJ0nGyw6fmiGB1cKIKv3fUPxzvUy3-vTlSpWYilPLJS2wNPZtgLOMZnjqXrzUzYUJEVOARupKaFtJ3cvFDgJOpcITUzzb8KXxgWGI8_z0IULVymFkzTCgo1So6wBDfiRKsjGvWpuApqcW1Oa8cXbQ',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA4VsEdthVW4xBnuDCdx28PVXWxG8X7hIw3eDFinQStrw1n3zxARWeRd43VMQm-SXaFLyIfTmBoLZ-YKwOXq0w-VJmmE1L6V91V1w-IYAUQlZQ4gcVzCsNt1CpSf0NMtaTWiojVetLuLApRe7r83Gu9hwn21jVDbdRAa7NQZNa1mI6seYqoZN8SkJbI9kR3icdW01iG5UXlMz0fzT7-_SihQXyknW5sKUJcEG5oANEd3lTcPp4QVEwMvGaoODMAAMtIKCvN7PXHeUs'
  ];

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-6">
      <nav className="flex text-sm text-on-surface-variant mb-8 font-medium uppercase tracking-wider items-center">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link to="/products" className="hover:text-primary transition-colors">{product.category}</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-on-surface">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Product Gallery */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div 
            layoutId={`image-${product.id}`}
            className="aspect-[4/5] rounded-2xl overflow-hidden bg-surface-container-lowest shadow-sm border border-black/5"
          >
            <img 
              className="w-full h-full object-cover" 
              alt={product.name}
              src={activeImage}
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="grid grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all bg-surface-container-lowest ${activeImage === img ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
              >
                <img 
                  className="w-full h-full object-cover" 
                  alt={`${product.name} view ${idx + 1}`}
                  src={img}
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-5 flex flex-col">
          <motion.h1 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface leading-tight mb-4 tracking-tight"
          >
            {product.name}
          </motion.h1>
          
          <div className="flex items-center gap-3 mb-8">
            {product.badge && (
              <span className="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-xs font-bold rounded-full tracking-widest uppercase">
                {product.badge}
              </span>
            )}
            <div className="flex items-center text-tertiary font-bold">
              <CheckCircle className="w-4 h-4 mr-1 fill-current" />
              <span className="text-sm">In Stock (Grosir)</span>
            </div>
          </div>

          <div className="mb-10 p-6 bg-surface-container-low rounded-2xl">
            <span className="block text-on-surface-variant text-sm font-semibold uppercase tracking-widest mb-1">Price Per Dozen</span>
            <div className="text-4xl font-black text-primary font-headline">
              Rp {product.price.toLocaleString('id-ID')}
            </div>
            <p className="text-on-surface-variant text-sm mt-2 italic">Minimal order: {product.minOrder}</p>
          </div>

          <div className="space-y-8">
            {/* Size Selector */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-on-surface">Pilih Ukuran</span>
                <button className="text-primary font-bold text-sm underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[64px] h-12 flex items-center justify-center rounded-xl border-2 transition-all font-bold text-lg ${selectedSize === size ? 'border-primary bg-primary-fixed text-on-primary-fixed shadow-sm' : 'border-surface-container-highest text-on-surface hover:border-primary'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <span className="block text-lg font-bold text-on-surface mb-4">Jumlah (Lusin)</span>
              <div className="flex items-center w-max bg-surface-container-highest rounded-xl p-1">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-16 text-center text-xl font-bold font-headline">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-4">
              <button className="w-full h-16 bg-primary text-white font-bold text-xl rounded-xl flex items-center justify-center gap-3 shadow-lg hover:brightness-110 active:scale-[0.98] transition-all">
                <ShoppingBag className="w-6 h-6" />
                TAMBAH KE KERANJANG
              </button>
              <button className="w-full h-16 bg-tertiary text-white font-bold text-xl rounded-xl flex items-center justify-center gap-3 shadow-lg hover:brightness-110 active:scale-[0.98] transition-all">
                <MessageCircle className="w-6 h-6" />
                PESAN VIA WHATSAPP
              </button>
            </div>
          </div>

          {/* Product Features Bento */}
          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface-container-lowest rounded-xl border border-black/5">
              <Star className="w-6 h-6 text-secondary mb-2 fill-current" />
              <h4 className="font-bold text-sm">Katun Premium</h4>
              <p className="text-xs text-on-surface-variant">Bahan lembut dan tidak gatal.</p>
            </div>
            <div className="p-4 bg-surface-container-lowest rounded-xl border border-black/5">
              <CheckCircle className="w-6 h-6 text-secondary mb-2 fill-current" />
              <h4 className="font-bold text-sm">Grosir Ready</h4>
              <p className="text-xs text-on-surface-variant">Stok aman untuk partai besar.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <section className="mt-32 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <h2 className="font-headline text-3xl font-extrabold mb-6">Detail Produk</h2>
          <p className="text-lg leading-relaxed text-on-surface-variant">
            {product.description}
          </p>
        </div>
        <div className="lg:col-span-8 bg-surface-container-low p-10 rounded-3xl">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {product.features.map((feature, idx) => (
              <li key={idx} className="flex gap-4">
                <span className="text-primary font-black text-xl">0{idx + 1}</span>
                <div>
                  <strong className="block text-on-surface text-lg mb-1">{feature}</strong>
                  <span className="text-on-surface-variant text-sm">Diproses dengan standar kualitas tinggi untuk kenyamanan maksimal.</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
