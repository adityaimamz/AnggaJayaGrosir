import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Menu } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  
  return (
    <nav className="fixed top-0 w-full z-50 glass-header shadow-sm h-20 flex justify-between items-center px-6 md:px-10">
      <div className="flex items-center gap-4 md:gap-8">
        <Link to="/" className="flex items-center gap-3">
          <img 
            alt="ANGGA JAYA Logo" 
            className="h-10 w-auto" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnQRkBjQbV62gZ4xjbCOiIJYiZ3EPucxr-TRucrKZec1p8RwXPSupLWM81KFWzUP60nhPjOXY-SAdlXS6lEt76V-V7CROMpXLvDVJx0JkMHBiAHQUkfFnkBgLauSOP-CPVYE8rnpwlx3_PWQxjjvAU8-c4I-oUCmYmzDhQzKhzvQjPKh58PhJSHsDh1mXtIcxADvISQ1QEY6DW0PpYoMoszE70qyK-xN5omho0Jr8WBI3OOKeaHTmBfc43nBQiCdCuPrmj54kV4UM"
            referrerPolicy="no-referrer"
          />
          <span className="text-xl md:text-2xl font-black tracking-tight text-on-surface font-headline uppercase">ANGGA JAYA</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={`font-headline font-bold text-lg transition-colors ${location.pathname === '/' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
          >
            Home
          </Link>
          <Link 
            to="/products" 
            className="text-on-surface-variant font-headline font-bold text-lg hover:text-primary transition-colors"
          >
            Products
          </Link>
          <Link 
            to="/wholesale" 
            className="text-on-surface-variant font-headline font-bold text-lg hover:text-primary transition-colors"
          >
            Wholesale
          </Link>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-4 hidden lg:block">
        <div className="relative group">
          <input 
            className="w-full h-11 bg-surface-container border-none rounded-xl px-5 text-on-surface placeholder-on-surface-variant/40 focus:ring-2 focus:ring-primary transition-all" 
            placeholder="Cari produk grosir..." 
            type="text"
          />
          <Search className="absolute right-4 top-3 text-on-surface-variant/60 w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-all">
          <Search className="w-6 h-6 lg:hidden" />
        </button>
        <Link to="/cart" className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-all relative">
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">3</span>
        </Link>
        <button className="bg-primary text-white px-4 md:px-6 py-2 rounded-lg font-bold text-sm tracking-wide hover:brightness-110 active:scale-95 transition-all">
          MASUK
        </button>
      </div>
    </nav>
  );
}
