import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Home, Menu, Phone, ShoppingCart, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CartItemSnapshot {
    quantity: number;
}

interface WishlistItemSnapshot {
    id: number;
}

export default function FloatingMobileMenu() {
    const [open, setOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);

    // Kunci scroll saat open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    // Sync cart and wishlist counts
    useEffect(() => {
        const syncCounts = () => {
            const raw = localStorage.getItem('cart_items');
            const items: CartItemSnapshot[] = raw
                ? (JSON.parse(raw) as CartItemSnapshot[])
                : [];
            const rawWishlist = localStorage.getItem('wishlist_items');
            const wishlistItems: WishlistItemSnapshot[] = rawWishlist
                ? (JSON.parse(rawWishlist) as WishlistItemSnapshot[])
                : [];

            const totalQuantity = items.reduce(
                (sum, item) => sum + Math.max(1, Number(item.quantity || 0)),
                0,
            );

            setCartCount(totalQuantity);
            setWishlistCount(wishlistItems.length);
        };

        syncCounts();

        globalThis.addEventListener('storage', syncCounts);
        globalThis.addEventListener('cart:updated', syncCounts);
        globalThis.addEventListener('wishlist:updated', syncCounts);
        globalThis.addEventListener('focus', syncCounts);

        return () => {
            globalThis.removeEventListener('storage', syncCounts);
            globalThis.removeEventListener('cart:updated', syncCounts);
            globalThis.removeEventListener('wishlist:updated', syncCounts);
            globalThis.removeEventListener('focus', syncCounts);
        };
    }, []);

    // Berurutan dari bawah ke atas saat render absolute di flex col
    const items = [
        {
            title: 'Kontak',
            icon: <Phone className="h-5 w-5" />,
            href: '/kontak',
        },
        {
            title: 'Wishlist',
            icon: (
                <div className="relative flex h-full w-full items-center justify-center">
                    <Heart
                        className={`h-5 w-5 ${wishlistCount > 0 ? 'fill-current' : ''}`}
                    />
                    {wishlistCount > 0 && (
                        <span className="absolute -top-2 -right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                            {wishlistCount}
                        </span>
                    )}
                </div>
            ),
            href: '/wishlist',
        },
        {
            title: 'Keranjang',
            icon: (
                <div className="relative flex h-full w-full items-center justify-center">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                            {cartCount}
                        </span>
                    )}
                </div>
            ),
            href: '/cart',
        },
        // { title: 'Produk', icon: <Package className="h-5 w-5" />, href: '/products' },
        { title: 'Beranda', icon: <Home className="h-5 w-5" />, href: '/' },
    ];

    return (
        <div className="fixed right-6 bottom-6 z-[999] block md:hidden">
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 -z-10 bg-black/20 backdrop-blur-sm"
                            onClick={() => setOpen(false)}
                        />

                        <motion.div
                            layoutId="nav"
                            className="absolute right-0 bottom-full mb-4 flex flex-col items-center gap-4"
                        >
                            {items.map((item, idx) => (
                                <div
                                    key={item.title}
                                    className="group relative"
                                >
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: 15,
                                            scale: 0.8,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: 15,
                                            scale: 0.8,
                                            transition: {
                                                delay: idx * 0.05,
                                            },
                                        }}
                                        transition={{
                                            delay:
                                                (items.length - 1 - idx) * 0.05,
                                            type: 'spring',
                                            stiffness: 200,
                                            damping: 20,
                                        }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="bg-surface text-on-surface rounded-lg px-3 py-1.5 text-sm font-semibold whitespace-nowrap shadow-md">
                                            {item.title}
                                        </div>
                                        <Link
                                            href={item.href}
                                            onClick={() => setOpen(false)}
                                            className="bg-surface text-on-surface focus:bg-surface-container flex h-12 w-12 items-center justify-center rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] ring-1 ring-black/5 transition-colors"
                                        >
                                            {item.icon}
                                        </Link>
                                    </motion.div>
                                </div>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <button
                onClick={() => setOpen(!open)}
                aria-label="Toggle Menu"
                className="bg-primary ring-primary/20 relative z-20 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)] ring-2 transition-transform active:scale-95"
            >
                <AnimatePresence mode="wait">
                    {open ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X className="h-6 w-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="menu"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Menu className="h-6 w-6" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>
        </div>
    );
}
