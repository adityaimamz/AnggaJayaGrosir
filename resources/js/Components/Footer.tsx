import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-surface-container w-full py-12 px-8 mt-20">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center space-y-8">
        <div className="space-y-4">
          <span className="text-xl font-bold text-on-surface font-headline uppercase">ANGGA JAYA Grosir</span>
          <p className="text-on-surface-variant font-body text-base max-w-lg mx-auto">
            Partner terpercaya untuk kebutuhan grosir pakaian dalam Anda. Kualitas kurasi terbaik dengan harga yang bersaing.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8">
          <a className="text-on-surface-variant hover:text-primary transition-colors font-body text-base" href="#">Syarat & Ketentuan</a>
          <a className="text-on-surface-variant hover:text-primary transition-colors font-body text-base" href="#">Kebijakan Privasi</a>
          <a className="text-on-surface-variant hover:text-primary transition-colors font-body text-base" href="#">Panduan Grosir</a>
        </div>
        
        <div className="pt-8 border-t border-surface-container w-full">
          <p className="text-on-surface-variant/60 font-body text-sm">© {new Date().getFullYear()} ANGGA JAYA Grosir. The Heritage Curator.</p>
        </div>
      </div>
    </footer>
  );
}
