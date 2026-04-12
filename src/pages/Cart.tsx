import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, MessageCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Cart() {
  const [items, setItems] = useState([
    {
      id: '1',
      name: 'Premium Cotton Boxer Brief',
      size: 'L',
      pack: '12 Pcs',
      price: 450000,
      quantity: 10,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQCZosaSPXsdDzM3ECCuvr5Z_fz3wrhmBHlb9EOb5M3e7IVokK0Z-yCSMiZsuO6dCJZCsY5CuZv0OvMy_MvDpdjIkWsp-bAFl24qjAeJL3mmrHYV2-361gbDowrTlowOG6njM4bbx96p28A6SoWUKSPJTI9Lc4s6QpOrXlg10xilD90DJXfCt6-KhjCrCU6ya2fWF0YcfxTO4t4KlULV0Y7hEhITXLHOoC2qyOwM-6exiIMiYsBkVKDVY8QR04p9fgUdzqg9AEmn0'
    },
    {
      id: '2',
      name: 'Classic Singlet Heritage',
      size: 'XL',
      pack: '6 Pcs',
      price: 225000,
      quantity: 5,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8mMGKOod-MeaEwcRYwhSw31k9WB73kU71qvtuNzXS19LmLUqmaIAv3GYH966twffVLqD81WOJNt_LgzFC8UNlKCqEkO-kDX4xnorRRz-gUnS4d61FfraNhdbYkK_fCaQlyul6yqNDU3itp1W1UI320RF5fI2FNsfl0Pp8UminDt9RMBot3vl1LxzXuzuuO06-DepIbpS631oRwwbdnS-YuuX_2p0NiQqvaSk1JgVrvbdwW64TgZWX8BruoiJvHvlCQpQqDD_Hj7Q'
    },
    {
      id: '3',
      name: 'Seamless Comfort Panty',
      size: 'M',
      pack: '12 Pcs',
      price: 900000,
      quantity: 20,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUTcbpGOuflyK4vhv8-C4R0sIuEgJqgej03QuslqC8bd_DHrFq9P0FzbgmJ_Ha9OIKyB4sUezB6OdcGVuVWHnB9BEnsVZJF5XPF4tPBD1rKvBJ54uGSS0ZxDXv944Ebm9F-yLGxQ9I_sn8xlWWNrZiIeYRvZizDGFoFnC2cRCccCTf7pFK_eZLRe37LNkPBuqs4EE2huei8BNkmXEPBFuvNZJoyicPHflup807DIR7UALdu6Rrc22UT_eiASzeoeqR4eopd0xTvPs'
    }
  ]);

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = 175000;
  const total = subtotal - discount;

  return (
    <div className="pt-28 pb-20 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Keranjang Belanja</h1>
        <p className="text-lg text-on-surface-variant font-medium">Anda memiliki {items.length} item grosir siap dipesan.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-grow space-y-8">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-surface-container-lowest p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6 group transition-all hover:bg-surface-container-low border border-black/5"
              >
                <div className="w-32 h-32 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
                  <img 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    src={item.image}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-grow w-full">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold font-headline text-on-surface">{item.name}</h3>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-on-surface-variant/40 hover:text-primary transition-colors p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-secondary font-semibold mb-4">Size: {item.size} • Pack: {item.pack}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center bg-surface-container-low rounded-xl p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-lg transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-bold text-lg w-10 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xl font-bold text-primary">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {items.length === 0 && (
            <div className="text-center py-20 bg-surface-container-low rounded-3xl">
              <p className="text-2xl font-bold text-on-surface-variant mb-6">Keranjang Anda kosong</p>
              <Link to="/" className="bg-primary text-white px-8 py-4 rounded-xl font-bold inline-block hover:brightness-110 transition-all">
                Mulai Belanja
              </Link>
            </div>
          )}
        </div>

        <aside className="lg:w-[400px]">
          <div className="sticky top-28 bg-surface-container-lowest rounded-3xl p-8 shadow-[0_-12px_40px_rgba(28,27,27,0.06)] border border-black/5">
            <h2 className="text-2xl font-black font-headline text-on-surface mb-8">Ringkasan Pesanan</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-on-surface-variant text-lg">
                <span>Subtotal ({items.length} Items)</span>
                <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant text-lg">
                <span>Wholesale Discount</span>
                <span className="text-tertiary font-bold">- Rp {discount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant text-lg">
                <span>Shipping Est.</span>
                <span className="font-medium">Calculated at Checkout</span>
              </div>
              <div className="pt-4 border-t border-surface-container flex justify-between items-end">
                <span className="text-xl font-bold">Total Harga</span>
                <div className="text-right">
                  <p className="text-3xl font-black text-primary">Rp {total.toLocaleString('id-ID')}</p>
                  <p className="text-sm text-secondary font-bold uppercase tracking-widest mt-1">Grosir Member Price</p>
                </div>
              </div>
            </div>
            
            <button className="w-full bg-tertiary text-white py-5 px-6 rounded-2xl flex flex-col items-center justify-center gap-1 hover:brightness-110 active:scale-[0.98] transition-all mb-4 shadow-lg">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6 fill-current" />
                <span className="font-black text-lg">PESAN SEMUA VIA WHATSAPP</span>
              </div>
              <span className="text-xs opacity-80 font-medium">Fast Response: Mon-Sat 08:00 - 17:00</span>
            </button>
            
            <div className="flex items-center justify-center gap-2 text-on-surface-variant/40">
              <ShieldCheck className="w-4 h-4" />
              <p className="text-center text-sm font-medium">
                Secure connection via WhatsApp Business.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
