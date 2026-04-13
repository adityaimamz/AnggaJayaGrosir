import { Link, usePage } from '@inertiajs/react';
import { Search, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CartItemSnapshot {
    quantity: number;
}

interface NavbarProps {
    search?: string;
    onSearchChange?: (value: string) => void;
}

export default function Navbar({
    search = '',
    onSearchChange,
}: Readonly<NavbarProps>) {
    const { url } = usePage();
    const [cartCount, setCartCount] = useState(0);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    useEffect(() => {
        const syncCartCount = () => {
            const raw = localStorage.getItem('cart_items');
            const items: CartItemSnapshot[] = raw
                ? (JSON.parse(raw) as CartItemSnapshot[])
                : [];

            const totalQuantity = items.reduce(
                (sum, item) => sum + Math.max(1, Number(item.quantity || 0)),
                0,
            );

            setCartCount(totalQuantity);
        };

        syncCartCount();

        globalThis.addEventListener('storage', syncCartCount);
        globalThis.addEventListener('cart:updated', syncCartCount);
        globalThis.addEventListener('focus', syncCartCount);

        return () => {
            globalThis.removeEventListener('storage', syncCartCount);
            globalThis.removeEventListener('cart:updated', syncCartCount);
            globalThis.removeEventListener('focus', syncCartCount);
        };
    }, []);

    const isSearchVisible = url === '/' || url.startsWith('/products');

    return (
        <nav className="glass-header fixed top-0 z-50 flex w-full flex-col shadow-sm">
            <div className="flex h-20 w-full items-center justify-between px-6 md:px-10">
                <div className="flex items-center gap-4 md:gap-8">
                    <Link href="/" className="flex items-center gap-3">
                        <img
                            alt="ANGGA JAYA Logo"
                            className="h-10 w-auto"
                            src="/logo%20AJ.png"
                        />
                        <span className="text-on-surface font-headline text-xl font-black tracking-tight uppercase md:text-2xl">
                            ANGGA JAYA
                        </span>
                    </Link>

                    <div className="hidden items-center gap-6 md:flex">
                        <Link
                            href="/"
                            className={`font-headline text-lg font-bold transition-colors ${url === '/' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                        >
                            Beranda
                        </Link>
                        <Link
                            href="/kontak"
                            className={`font-headline text-lg font-bold transition-colors ${url.startsWith('/kontak') ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                        >
                            Kontak
                        </Link>
                    </div>
                </div>

                {isSearchVisible && (
                    <div className="mx-4 hidden max-w-md flex-1 lg:block">
                        <div className="group relative">
                            <input
                                className="bg-surface-container text-on-surface placeholder-on-surface-variant/40 focus:ring-primary h-11 w-full rounded-xl border-none px-5 transition-all focus:ring-2"
                                placeholder="Cari produk grosir..."
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    onSearchChange?.(event.target.value)
                                }
                            />
                            <Search className="text-on-surface-variant/60 absolute top-3 right-4 h-5 w-5" />
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2 md:gap-4">
                    <Link
                        href="/kontak"
                        className={`font-headline rounded-full px-3 py-1.5 text-sm font-bold transition-colors md:hidden ${url.startsWith('/kontak') ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
                    >
                        Kontak
                    </Link>
                    {isSearchVisible && (
                        <button
                            onClick={() =>
                                setIsMobileSearchOpen(!isMobileSearchOpen)
                            }
                            className={`rounded-full p-2 transition-all lg:hidden ${
                                isMobileSearchOpen
                                    ? 'bg-primary text-white'
                                    : 'text-on-surface-variant hover:bg-surface-container'
                            }`}
                        >
                            <Search className="h-6 w-6" />
                        </button>
                    )}
                    <Link
                        href="/cart"
                        className="text-on-surface-variant hover:bg-surface-container relative rounded-full p-2 transition-all"
                    >
                        <ShoppingCart className="h-6 w-6" />
                        {cartCount > 0 ? (
                            <span className="bg-primary absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        ) : null}
                    </Link>
                </div>
            </div>

            {/* Mobile Search Bar */}
            {isMobileSearchOpen && isSearchVisible && (
                <div className="animate-in fade-in slide-in-from-top-2 border-surface-container-highest flex w-full border-t px-6 py-4 duration-300 lg:hidden">
                    <div className="relative w-full">
                        <input
                            className="bg-surface-container text-on-surface placeholder-on-surface-variant/40 focus:ring-primary h-12 w-full rounded-xl border-none px-12 transition-all focus:ring-2"
                            placeholder="Cari produk grosir..."
                            type="text"
                            autoFocus
                            value={search}
                            onChange={(event) =>
                                onSearchChange?.(event.target.value)
                            }
                        />
                        <Search className="text-on-surface-variant/60 absolute top-3.5 left-4 h-5 w-5" />
                    </div>
                </div>
            )}
        </nav>
    );
}
