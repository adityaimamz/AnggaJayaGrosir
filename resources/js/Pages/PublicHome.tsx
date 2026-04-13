import PublicLayout from '@/Layouts/PublicLayout';
import { getBadgeClassName, resolveProductBadges } from '@/utils/productBadges';
import {
    CategorySummary,
    LengthAwarePaginated,
    ProductSummary,
} from '@/types/domain';
import { Link, router } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    Tag,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';

interface HomeProps {
    products: LengthAwarePaginated<ProductSummary>;
    categories: CategorySummary[];
    filters?: {
        search?: string;
        category?: string;
        sort?: string;
    };
}

export default function Home({
    products,
    categories: backendCategories,
    filters,
}: HomeProps) {
    const [activeCategory, setActiveCategory] = useState(
        filters?.category ?? 'all',
    );
    const [searchInput, setSearchInput] = useState(filters?.search ?? '');
    const [activeSort, setActiveSort] = useState(filters?.sort ?? 'newest');
    const [currentBannerIdx, setCurrentBannerIdx] = useState(0);

    const banners = [
        {
            id: 1,
            title: 'Step by Step Pemesanan - Langkah 1',
            subtitle: 'Cari dan pilih produk yang Anda butuhkan dari katalog kami.',
            cta: 'Lihat Produk',
            href: '#products',
            gradient: 'from-blue-600 via-cyan-600 to-sky-500',
        },
        {
            id: 2,
            title: 'Step by Step Pemesanan - Langkah 2',
            subtitle: 'Hubungi admin dan kirim daftar produk beserta jumlah pesanan Anda.',
            cta: 'Siapkan Daftar Pesanan',
            href: '#products',
            gradient: 'from-emerald-600 via-teal-600 to-green-500',
        },
        {
            id: 3,
            title: 'Step by Step Pemesanan - Langkah 3',
            subtitle: 'Lakukan konfirmasi pembayaran, lalu pesanan diproses dan dikirim.',
            cta: 'Mulai Pemesanan',
            href: '#products',
            gradient: 'from-orange-500 via-amber-500 to-yellow-500',
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBannerIdx((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]);

    useEffect(() => {
        setSearchInput(filters?.search ?? '');
    }, [filters?.search]);

    useEffect(() => {
        setActiveCategory(filters?.category ?? 'all');
    }, [filters?.category]);

    useEffect(() => {
        setActiveSort(filters?.sort ?? 'newest');
    }, [filters?.sort]);

    useEffect(() => {
        const nextSearch = searchInput.trim();
        const currentSearch = (filters?.search ?? '').trim();
        const nextCategory = activeCategory === 'all' ? '' : activeCategory;
        const currentCategory = (filters?.category ?? '').trim();
        const nextSort = activeSort === 'newest' ? '' : activeSort;
        const currentSort = (filters?.sort ?? 'newest').trim() === 'newest' ? '' : (filters?.sort ?? '');

        if (nextSearch === currentSearch && nextCategory === currentCategory && nextSort === currentSort) {
            return;
        }

        const handler = window.setTimeout(() => {
            router.get(
                '/products',
                {
                    ...(nextSearch === '' ? {} : { search: nextSearch }),
                    ...(nextCategory === '' ? {} : { category: nextCategory }),
                    ...(nextSort === '' ? {} : { sort: nextSort }),
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ['products', 'filters'],
                },
            );
        }, 350);

        return () => window.clearTimeout(handler);
    }, [activeCategory, activeSort, filters?.category, filters?.search, filters?.sort, searchInput]);

    const categories = [
        { key: 'all', label: 'Semua Produk' },
        ...backendCategories.map((category) => ({
            key: category.slug,
            label: category.name,
        })),
    ];

    const sortOptions = [
        { key: 'newest', label: 'Produk Terbaru' },
        { key: 'best_seller', label: 'Produk Best Seller' },
    ];

    const activeSortLabel =
        activeSort === 'newest'
            ? 'Filter'
            : (sortOptions.find((option) => option.key === activeSort)?.label ||
              'Filter');

    const prevHref =
        products.currentPage > 1
            ? `/products?page=${products.currentPage - 1}${filters?.search ? `&search=${encodeURIComponent(filters.search)}` : ''}${filters?.category ? `&category=${encodeURIComponent(filters.category)}` : ''}${filters?.sort && filters.sort !== 'newest' ? `&sort=${encodeURIComponent(filters.sort)}` : ''}`
            : '/products';

    const nextHref =
        products.currentPage < products.lastPage
            ? `/products?page=${products.currentPage + 1}${filters?.search ? `&search=${encodeURIComponent(filters.search)}` : ''}${filters?.category ? `&category=${encodeURIComponent(filters.category)}` : ''}${filters?.sort && filters.sort !== 'newest' ? `&sort=${encodeURIComponent(filters.sort)}` : ''}`
            : `/products?page=${products.currentPage}`;

    return (
        <PublicLayout search={searchInput} onSearchChange={setSearchInput}>
            <div className="mx-auto max-w-[1400px] px-6 pt-28 pb-20 md:px-10">
                {/* Banner Carousel */}
                <div className="relative mb-12 h-[280px] w-full overflow-hidden rounded-3xl md:h-[360px] lg:h-[400px]">
                    {banners.map((banner, idx) => (
                        <div
                            key={banner.id}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                currentBannerIdx === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} flex items-center justify-center`}>
                                <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
                                <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white md:px-12">
                                    <h2 className="font-headline mb-2 text-xl font-black tracking-tight md:mb-4 md:text-5xl lg:text-6xl drop-shadow-md">
                                        {banner.title}
                                    </h2>
                                    <p className="mb-4 text-base font-medium text-white/95 md:mb-8 md:text-lg drop-shadow">
                                        {banner.subtitle}
                                    </p>
                                    <a
                                        href={banner.href}
                                        onClick={(e) => {
                                            if (banner.href.startsWith('#')) {
                                                e.preventDefault();
                                                document.getElementById(banner.href.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }}
                                        className="inline-flex items-center gap-2 rounded-full bg-white/25 px-4 py-2 text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-white/40 hover:scale-105 md:px-8 md:py-4 md:text-base border border-white/30"
                                    >
                                        {banner.cta}
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Navigation Buttons */}
                    <button
                        onClick={() => setCurrentBannerIdx((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
                        className="group absolute top-1/2 left-2 z-20 -translate-y-1/2 rounded-full bg-black/20 p-1.5 text-white backdrop-blur-md transition-all hover:bg-black/40 md:left-6 md:p-3"
                        aria-label="Previous banner"
                    >
                        <ChevronLeft className="h-4 w-4 md:h-6 md:w-6 transition-transform group-hover:-translate-x-1" />
                    </button>
                    <button
                        onClick={() => setCurrentBannerIdx((prev) => (prev + 1) % banners.length)}
                        className="group absolute top-1/2 right-2 z-20 -translate-y-1/2 rounded-full bg-black/20 p-1.5 text-white backdrop-blur-md transition-all hover:bg-black/40 md:right-6 md:p-3"
                        aria-label="Next banner"
                    >
                        <ChevronRight className="h-4 w-4 md:h-6 md:w-6 transition-transform group-hover:translate-x-1" />
                    </button>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 md:bottom-6 md:gap-3">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentBannerIdx(idx)}
                                className={`rounded-full shadow-sm transition-all ${
                                    idx === currentBannerIdx
                                        ? 'h-1.5 w-6 md:h-2 md:w-8 bg-white'
                                        : 'h-1.5 w-1.5 md:h-2 md:w-2 bg-white/50 hover:bg-white/80'
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>

                <h1 id="products" className="font-headline text-on-surface mb-8 text-3xl font-bold md:text-4xl scroll-mt-32">
                    Produk
                </h1>

                <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
                    <Menu as="div" className="relative">
                        <Menu.Button className="border-surface-container-highest text-on-surface-variant hover:bg-surface-container-low flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors">
                            <Tag className="h-4 w-4 shrink-0" />
                            <span className="max-w-[140px] truncate md:max-w-[200px]">
                                {categories.find((c) => c.key === activeCategory)?.label || 'Kategori'}
                            </span>
                            <ChevronDown className="h-4 w-4 shrink-0" />
                        </Menu.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="bg-surface absolute left-0 z-50 mt-2 w-56 origin-top-left rounded-xl shadow-lg ring-1 ring-black/5 focus:outline-none overflow-y-auto max-h-[300px]">
                                <div className="py-1">
                                    {categories.map((cat) => (
                                        <Menu.Item key={cat.key}>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => setActiveCategory(cat.key)}
                                                    className={`${
                                                        active ? 'bg-surface-container-low text-on-surface' : 'text-on-surface-variant'
                                                    } ${
                                                        activeCategory === cat.key ? 'font-bold bg-primary/5 text-primary' : ''
                                                    } group flex w-full items-center px-4 py-2 text-sm transition-colors text-left`}
                                                >
                                                    {cat.label}
                                                </button>
                                            )}
                                        </Menu.Item>
                                    ))}
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>

                    <Menu as="div" className="relative">
                        <Menu.Button className="border-surface-container-highest text-on-surface-variant hover:bg-surface-container-low flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors">
                            <SlidersHorizontal className="h-4 w-4" />
                            {activeSortLabel}
                            <ChevronDown className="h-4 w-4" />
                        </Menu.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="bg-surface absolute right-0 z-50 mt-2 w-44 max-w-[calc(100vw-2rem)] origin-top-right rounded-xl shadow-lg ring-1 ring-black/5 focus:outline-none overflow-y-auto max-h-[300px]">
                                <div className="py-1">
                                    {sortOptions.map((option) => (
                                        <Menu.Item key={option.key}>
                                            {({ active }) => (
                                                <button
                                                    onClick={() =>
                                                        setActiveSort(
                                                            option.key,
                                                        )
                                                    }
                                                    className={`${
                                                        active ? 'bg-surface-container-low text-on-surface' : 'text-on-surface-variant'
                                                    } ${
                                                        activeSort === option.key ? 'font-bold bg-primary/5 text-primary' : ''
                                                    } group flex w-full items-center px-4 py-2 text-sm transition-colors`}
                                                >
                                                    {option.label}
                                                </button>
                                            )}
                                        </Menu.Item>
                                    ))}
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
                    {products.data.map((product, idx) => {
                        const badgeLabels = resolveProductBadges(product);

                        return (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group flex flex-col"
                        >
                            <Link
                                href={`/product/${product.slug}`}
                                className="bg-surface-container relative mb-4 block aspect-square overflow-hidden rounded-2xl"
                            >
                                <img
                                    className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                                    alt={product.name}
                                    src={product.image ?? ''}
                                    referrerPolicy="no-referrer"
                                />
                                {badgeLabels.length > 0 && (
                                    <div className="absolute top-3 left-3 flex max-w-[85%] flex-wrap gap-1.5">
                                        {badgeLabels.map((label) => (
                                            <span
                                                key={`${product.id}-${label.toLowerCase()}`}
                                                className={`rounded px-2 py-1 text-[10px] font-bold tracking-wider uppercase shadow-sm backdrop-blur-sm ${getBadgeClassName(label)}`}
                                            >
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </Link>
                            <div className="px-2 text-center">
                                {/* <p className="text-on-surface-variant/70 mb-1.5 text-[11px] font-semibold tracking-wider uppercase">
                                    {product.category.name}
                                </p> */}
                                <h3 className="font-headline text-on-surface group-hover:text-primary mb-1 text-base font-bold transition-colors">
                                    <Link href={`/product/${product.slug}`}>
                                        {product.name}
                                    </Link>
                                </h3>
                                <p className="text-on-surface text-sm font-bold">
                                    {product.minPrice === product.maxPrice
                                        ? `Rp ${Number(product.minPrice).toLocaleString('id-ID')}`
                                        : `Rp ${Number(product.minPrice).toLocaleString('id-ID')} – Rp ${Number(product.maxPrice).toLocaleString('id-ID')}`}
                                </p>
                            </div>
                        </motion.div>
                        );
                    })}
                </div>

                {products.data.length > 0 && products.lastPage > 1 && (
                    <div className="mt-10 flex flex-col items-center gap-6 border-t border-black/5 pt-8">
                        {/* Page Numbers Row */}
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {products.links.map((link, idx) => {
                                // Lewati tombol Previous/Next karena kita buat kustom di baris bawahnya
                                if (idx === 0 || idx === products.links.length - 1) {
                                    return null;
                                }

                                const isDots = link.label === '...';

                                if (isDots) {
                                    return (
                                        <span key={idx} className="flex h-10 w-6 items-center justify-center text-sm font-semibold text-on-surface-variant">
                                            ...
                                        </span>
                                    );
                                }

                                if (link.url === null) {
                                    return (
                                        <span key={idx} className="flex h-10 w-10 items-center justify-center rounded-lg border border-surface-container-highest text-sm font-semibold text-on-surface-variant/50">
                                            {link.label}
                                        </span>
                                    );
                                }

                                // Handle clean numeric label directly since Laravel adds active to current page.
                                // We replace HTML entities just in case
                                const cleanLabel = link.label.replace('&laquo;', '').replace('&raquo;', '').trim();

                                return (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        preserveScroll
                                        className={`flex h-10 w-10 min-w-[40px] items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${
                                            link.active
                                                ? 'border-primary bg-primary text-white shadow-sm'
                                                : 'border-surface-container-highest text-on-surface hover:bg-surface-container-low'
                                        }`}
                                    >
                                        {cleanLabel}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Navigation Buttons Row */}
                        <div className="flex flex-col sm:flex-row w-full sm:max-w-[400px] gap-3">
                            <Link
                                href={prevHref}
                                preserveScroll
                                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                                    products.currentPage > 1
                                        ? 'border-surface-container-highest text-on-surface hover:bg-surface-container-low'
                                        : 'border-surface-container-highest text-on-surface-variant/30 cursor-not-allowed bg-surface-container-lowest'
                                }`}
                            >
                                <ChevronLeft className="h-5 w-5" /> Sebelumnya
                            </Link>

                            <Link
                                href={nextHref}
                                preserveScroll
                                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                                    products.currentPage < products.lastPage
                                        ? 'border-surface-container-highest text-on-surface hover:bg-surface-container-low'
                                        : 'border-surface-container-highest text-on-surface-variant/30 cursor-not-allowed bg-surface-container-lowest'
                                }`}
                            >
                                Selanjutnya <ChevronRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                )}

                {products.data.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-on-surface-variant text-lg">
                            Tidak ada produk dalam kategori ini.
                        </p>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
