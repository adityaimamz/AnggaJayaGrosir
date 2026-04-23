import PublicLayout from '@/Layouts/PublicLayout';
import { WishlistItem } from '@/types/domain';
import { Link } from '@inertiajs/react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

function readWishlistItems(): WishlistItem[] {
    const saved = localStorage.getItem('wishlist_items');

    return saved ? (JSON.parse(saved) as WishlistItem[]) : [];
}

function formatPriceRange(item: WishlistItem): string {
    const minPrice = Number(item.minPrice);
    const maxPrice = Number(item.maxPrice);

    if (minPrice === maxPrice) {
        return `Rp ${minPrice.toLocaleString('id-ID')}`;
    }

    return `Rp ${minPrice.toLocaleString('id-ID')} - Rp ${maxPrice.toLocaleString('id-ID')}`;
}

export default function Wishlist() {
    const [items, setItems] = useState<WishlistItem[]>(readWishlistItems);

    useEffect(() => {
        localStorage.setItem('wishlist_items', JSON.stringify(items));
        globalThis.dispatchEvent(new Event('wishlist:updated'));
    }, [items]);

    const removeItem = (id: number) => {
        setItems((currentItems) =>
            currentItems.filter((item) => item.id !== id),
        );
    };

    return (
        <PublicLayout>
            <div className="mx-auto max-w-7xl px-6 pt-28 pb-20 md:px-12 lg:px-24">
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-10"
                >
                    <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold">
                        <Heart className="h-4 w-4 fill-current" />
                        Wishlist
                    </div>
                    <h1 className="font-headline text-on-surface mb-3 text-4xl font-extrabold tracking-tight md:text-5xl">
                        Produk Favorit Anda
                    </h1>
                    <p className="text-on-surface-variant text-lg font-medium">
                        Anda menyimpan {items.length} produk untuk dilihat lagi.
                    </p>
                </motion.header>

                {items.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence>
                            {items.map((item, idx) => (
                                <motion.article
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="bg-surface-container-lowest group overflow-hidden rounded-3xl border border-black/5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                >
                                    <Link
                                        href={`/product/${item.slug}`}
                                        className="bg-surface-container relative block aspect-square overflow-hidden"
                                    >
                                        <img
                                            alt={item.name}
                                            className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                                            src={item.image ?? ''}
                                            referrerPolicy="no-referrer"
                                        />
                                    </Link>
                                    <div className="p-5">
                                        <p className="text-on-surface-variant/70 mb-2 text-[11px] font-semibold tracking-wider uppercase">
                                            {item.categoryName}
                                        </p>
                                        <h2 className="font-headline text-on-surface group-hover:text-primary mb-3 text-lg font-bold transition-colors">
                                            <Link
                                                href={`/product/${item.slug}`}
                                            >
                                                {item.name}
                                            </Link>
                                        </h2>
                                        <p className="text-primary mb-5 text-base font-black">
                                            {formatPriceRange(item)}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/product/${item.slug}`}
                                                className="bg-primary inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all hover:brightness-110"
                                            >
                                                <ShoppingBag className="h-4 w-4" />
                                                Lihat Produk
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeItem(item.id)
                                                }
                                                className="text-on-surface-variant hover:border-primary hover:text-primary flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 transition-colors"
                                                aria-label={`Hapus ${item.name} dari wishlist`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, type: 'spring' }}
                        className="bg-surface-container-low rounded-3xl px-6 py-20 text-center"
                    >
                        <Heart className="text-primary mx-auto mb-5 h-12 w-12" />
                        <p className="text-on-surface-variant mb-6 text-2xl font-bold">
                            Wishlist Anda masih kosong
                        </p>
                        <Link
                            href="/"
                            className="bg-primary inline-flex items-center justify-center rounded-xl px-8 py-4 font-bold text-white transition-all hover:brightness-110"
                        >
                            Cari Produk Favorit
                        </Link>
                    </motion.div>
                )}
            </div>
        </PublicLayout>
    );
}
