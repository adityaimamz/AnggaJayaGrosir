import PublicLayout from '@/Layouts/PublicLayout';
import { getBadgeClassName, resolveProductBadges } from '@/utils/productBadges';
import {
    CategorySummary,
    LengthAwarePaginated,
    ProductSummary,
    BrandOption,
    Banner,
} from '@/types/domain';
import { Link, router } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    Tag,
    Bookmark,
    Search,
    ArrowLeft,
    Check,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState, Fragment } from 'react';
import { Menu, Popover, Transition } from '@headlessui/react';

interface HomeProps {
    banners: Banner[];
    products: LengthAwarePaginated<ProductSummary>;
    categories: CategorySummary[];
    brands: BrandOption[];
    filters?: {
        search?: string;
        category?: string;
        brand?: string;
        sort?: string;
    };
}

export default function Home({
    banners,
    products,
    categories: backendCategories,
    brands: backendBrands,
    filters,
}: HomeProps) {
    const [activeCategory, setActiveCategory] = useState(
        filters?.category ?? 'all',
    );
    const [activeBrand, setActiveBrand] = useState(
        filters?.brand ?? 'all',
    );
    const [searchInput, setSearchInput] = useState(filters?.search ?? '');
    const [activeSort, setActiveSort] = useState(filters?.sort ?? 'newest');
    const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
    const [filterView, setFilterView] = useState<'main' | 'kategori' | 'merek'>('main');
    const [catSearch, setCatSearch] = useState('');
    const [brandSearch, setBrandSearch] = useState('');
    const previousPageRef = useRef(products.currentPage);



    useEffect(() => {
        if (banners.length === 0) return;
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
        setActiveBrand(filters?.brand ?? 'all');
    }, [filters?.brand]);

    useEffect(() => {
        setActiveSort(filters?.sort ?? 'newest');
    }, [filters?.sort]);

    useEffect(() => {
        const nextSearch = searchInput.trim();
        const currentSearch = (filters?.search ?? '').trim();
        const nextCategory = activeCategory === 'all' ? '' : activeCategory;
        const currentCategory = (filters?.category ?? '').trim();
        const nextBrand = activeBrand === 'all' ? '' : activeBrand;
        const currentBrand = (filters?.brand ?? '').trim();
        const nextSort = activeSort === 'newest' ? '' : activeSort;
        const currentSort = (filters?.sort ?? 'newest').trim() === 'newest' ? '' : (filters?.sort ?? '');

        if (nextSearch === currentSearch && nextCategory === currentCategory && nextBrand === currentBrand && nextSort === currentSort) {
            return;
        }

        const handler = window.setTimeout(() => {
            router.get(
                '/products',
                {
                    ...(nextSearch === '' ? {} : { search: nextSearch }),
                    ...(nextCategory === '' ? {} : { category: nextCategory }),
                    ...(nextBrand === '' ? {} : { brand: nextBrand }),
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
    }, [activeCategory, activeBrand, activeSort, filters?.category, filters?.brand, filters?.search, filters?.sort, searchInput]);

    useEffect(() => {
        if (previousPageRef.current === products.currentPage) {
            return;
        }

        previousPageRef.current = products.currentPage;

        globalThis.requestAnimationFrame(() => {
            document
                .getElementById('products')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }, [products.currentPage]);

    const categories = [
        { key: 'all', label: 'Semua Kategori' },
        ...backendCategories.map((category) => ({
            key: category.slug,
            label: category.name,
        })),
    ];

    const brandsList = [
        { key: 'all', label: 'Semua Merek' },
        ...backendBrands.map((b) => ({
            key: b.kode,
            label: b.kode,
        })),
    ];

    const sortOptions = [
        { key: 'newest', label: 'Produk Terbaru' },
        { key: 'best_seller', label: 'Produk Best Seller' },
    ];

    const prevHref =
        products.currentPage > 1
            ? `/products?page=${products.currentPage - 1}${filters?.search ? `&search=${encodeURIComponent(filters.search)}` : ''}${filters?.category ? `&category=${encodeURIComponent(filters.category)}` : ''}${filters?.brand ? `&brand=${encodeURIComponent(filters.brand)}` : ''}${filters?.sort && filters.sort !== 'newest' ? `&sort=${encodeURIComponent(filters.sort)}` : ''}`
            : '/products';

    const nextHref =
        products.currentPage < products.lastPage
            ? `/products?page=${products.currentPage + 1}${filters?.search ? `&search=${encodeURIComponent(filters.search)}` : ''}${filters?.category ? `&category=${encodeURIComponent(filters.category)}` : ''}${filters?.brand ? `&brand=${encodeURIComponent(filters.brand)}` : ''}${filters?.sort && filters.sort !== 'newest' ? `&sort=${encodeURIComponent(filters.sort)}` : ''}`
            : `/products?page=${products.currentPage}`;

    return (
        <PublicLayout search={searchInput} onSearchChange={setSearchInput}>
            <div id="banner-carousel" className="mx-auto max-w-[1400px] px-6 pt-28 pb-20 md:px-10">
                {/* Banner Carousel */}
                <div  className="relative mb-12 h-[280px] w-full overflow-hidden rounded-3xl md:h-[360px] lg:h-[400px]">
                    {banners.length > 0 ? (
                        banners.map((banner, idx) => (
                            <div
                                key={banner.id}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                    currentBannerIdx === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                }`}
                            >
                                <img
                                    src={banner.image_url}
                                    alt={`Banner ${banner.sort_order}`}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
                            </div>
                        ))
                    ) : (
                        <div className="absolute inset-0 bg-surface-container flex items-center justify-center">
                            <span className="text-on-surface-variant font-medium">Banners akan segera hadir.</span>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    {banners.length > 1 && (
                        <>
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
                        </>
                    )}

                    {/* Dot Indicators */}
                    {banners.length > 1 && (
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
                    )}
                </div>

                <motion.h1
                    id="products"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="font-headline text-on-surface mb-8 text-3xl font-bold md:text-4xl scroll-mt-32"
                >
                    Produk
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="mb-10 flex items-center gap-2 justify-between sm:gap-4"
                >
                    <Popover className="relative shrink-0">
                        <Popover.Button className="border-surface-container-highest text-on-surface-variant hover:bg-surface-container-low inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors focus:outline-none sm:px-4 sm:text-sm">
                            <SlidersHorizontal className="h-4 w-4 shrink-0" />
                            <span>Kategori & Merek</span>
                            <ChevronDown className="h-4 w-4 shrink-0 ml-1" />
                        </Popover.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-1"
                        >
                            <Popover.Panel
                                className="bg-surface absolute left-0 top-full z-50 mt-2 w-[min(calc(100vw-3rem),36rem)] max-w-[min(calc(100vw-3rem),36rem)] sm:w-[28rem] sm:max-w-md md:max-w-lg rounded-2xl shadow-xl ring-1 ring-black/5 focus:outline-none overflow-hidden flex flex-col max-h-[70vh] origin-top"
                            >
                                {filterView === 'main' && (
                                    <div className="p-5 sm:p-6 overflow-y-auto">
                                        {/* Kategori Section */}
                                        <div className="mb-8">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-on-surface font-headline text-base font-bold">Kategori Produk</h3>
                                                {categories.length > 5 && (
                                                    <button
                                                        onClick={() => setFilterView('kategori')}
                                                        className="text-primary text-sm font-bold hover:underline"
                                                    >
                                                        Lihat Semua
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2.5">
                                                {(() => {
                                                    const limit = 5;
                                                    const activeIndex = categories.findIndex(c => c.key === activeCategory);
                                                    if (activeIndex >= 0 && activeIndex < limit) return categories.slice(0, limit);
                                                    const list = categories.slice(0, limit - 1);
                                                    const activeItem = categories.find(c => c.key === activeCategory);
                                                    if (activeItem) list.push(activeItem);
                                                    return list;
                                                })().map((cat) => (
                                                    <button
                                                        key={cat.key}
                                                        onClick={() => setActiveCategory(cat.key)}
                                                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors border ${
                                                            activeCategory === cat.key
                                                                ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                                                                : 'bg-surface-container-lowest border-surface-container-highest text-on-surface hover:bg-surface-container-low'
                                                        }`}
                                                    >
                                                        {cat.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Merek Section */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-on-surface font-headline text-base font-bold">Merek</h3>
                                                {brandsList.length > 5 && (
                                                    <button
                                                        onClick={() => setFilterView('merek')}
                                                        className="text-primary text-sm font-bold hover:underline"
                                                    >
                                                        Lihat Semua
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2.5">
                                                {(() => {
                                                    const limit = 5;
                                                    const activeIndex = brandsList.findIndex(b => b.key === activeBrand);
                                                    if (activeIndex >= 0 && activeIndex < limit) return brandsList.slice(0, limit);
                                                    const list = brandsList.slice(0, limit - 1);
                                                    const activeItem = brandsList.find(b => b.key === activeBrand);
                                                    if (activeItem) list.push(activeItem);
                                                    return list;
                                                })().map((brand) => (
                                                    <button
                                                        key={brand.key}
                                                        onClick={() => setActiveBrand(brand.key)}
                                                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors border ${
                                                            activeBrand === brand.key
                                                                ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                                                                : 'bg-surface-container-lowest border-surface-container-highest text-on-surface hover:bg-surface-container-low'
                                                        }`}
                                                    >
                                                        {brand.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {filterView === 'kategori' && (
                                    <div className="flex flex-col flex-1 h-[60vh] min-h-[300px] max-h-[70vh] w-full">
                                        <div className="p-4 border-b border-surface-container-highest bg-surface-container-lowest flex items-center gap-3 sticky top-0 z-10">
                                            <button onClick={() => setFilterView('main')} className="p-1 rounded hover:bg-surface-container">
                                                <ArrowLeft className="h-5 w-5 text-on-surface" />
                                            </button>
                                            <h3 className="font-headline font-bold text-lg text-on-surface">Kategori Produk</h3>
                                        </div>
                                        <div className="p-4 border-b border-surface-container-highest">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                                                <input
                                                    type="text"
                                                    placeholder="Cari Kategori..."
                                                    value={catSearch}
                                                    onChange={(e) => setCatSearch(e.target.value)}
                                                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container-lowest border border-surface-container-highest focus:border-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                                />
                                            </div>
                                        </div>
                                        <div className="overflow-y-auto p-2 flex-grow">
                                            {categories.filter(c => c.label.toLowerCase().includes(catSearch.toLowerCase())).map((cat) => (
                                                <button
                                                    key={cat.key}
                                                    onClick={() => {
                                                        setActiveCategory(cat.key);
                                                        setFilterView('main');
                                                        setCatSearch('');
                                                    }}
                                                    className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-surface-container transition-colors text-left"
                                                >
                                                    <span className={`text-sm ${activeCategory === cat.key ? 'text-primary font-bold' : 'text-on-surface'}`}>
                                                        {cat.label}
                                                    </span>
                                                    <div className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${activeCategory === cat.key ? 'bg-primary border-primary text-white' : 'border-on-surface-variant/40 bg-surface-container-lowest'}`}>
                                                        {activeCategory === cat.key && <Check className="h-3 w-3" />}
                                                    </div>
                                                </button>
                                            ))}
                                            {categories.filter(c => c.label.toLowerCase().includes(catSearch.toLowerCase())).length === 0 && (
                                                <div className="p-4 text-center text-sm text-on-surface-variant">Tidak ditemukan</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {filterView === 'merek' && (
                                    <div className="flex flex-col flex-1 h-[60vh] min-h-[300px] max-h-[70vh] w-full">
                                        <div className="p-4 border-b border-surface-container-highest bg-surface-container-lowest flex items-center gap-3 sticky top-0 z-10">
                                            <button onClick={() => setFilterView('main')} className="p-1 rounded hover:bg-surface-container">
                                                <ArrowLeft className="h-5 w-5 text-on-surface" />
                                            </button>
                                            <h3 className="font-headline font-bold text-lg text-on-surface">Merek</h3>
                                        </div>
                                        <div className="p-4 border-b border-surface-container-highest">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                                                <input
                                                    type="text"
                                                    placeholder="Cari Merek..."
                                                    value={brandSearch}
                                                    onChange={(e) => setBrandSearch(e.target.value)}
                                                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container-lowest border border-surface-container-highest focus:border-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                                />
                                            </div>
                                        </div>
                                        <div className="overflow-y-auto p-2 flex-grow">
                                            {brandsList.filter(b => b.label.toLowerCase().includes(brandSearch.toLowerCase())).map((brand) => (
                                                <button
                                                    key={brand.key}
                                                    onClick={() => {
                                                        setActiveBrand(brand.key);
                                                        setFilterView('main');
                                                        setBrandSearch('');
                                                    }}
                                                    className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-surface-container transition-colors text-left"
                                                >
                                                    <span className={`text-sm ${activeBrand === brand.key ? 'text-primary font-bold' : 'text-on-surface'}`}>
                                                        {brand.label}
                                                    </span>
                                                    <div className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${activeBrand === brand.key ? 'bg-primary border-primary text-white' : 'border-on-surface-variant/40 bg-surface-container-lowest'}`}>
                                                        {activeBrand === brand.key && <Check className="h-3 w-3" />}
                                                    </div>
                                                </button>
                                            ))}
                                            {brandsList.filter(b => b.label.toLowerCase().includes(brandSearch.toLowerCase())).length === 0 && (
                                                <div className="p-4 text-center text-sm text-on-surface-variant">Tidak ditemukan</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Popover.Panel>
                        </Transition>
                    </Popover>

                    <Popover className="relative shrink-0">
                        <Popover.Button className="border-surface-container-highest text-on-surface-variant hover:bg-surface-container-low inline-flex items-center gap-1.5 rounded-full border px-2.5 py-2 text-xs font-medium whitespace-nowrap transition-colors focus:outline-none sm:px-3 sm:text-sm">
                            <SlidersHorizontal className="h-4 w-4" />
                            <span>Filter</span>
                            <ChevronDown className="h-4 w-4" />
                        </Popover.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Popover.Panel className="bg-surface absolute right-0 left-auto z-50 mt-2 w-40 max-w-[calc(100vw-1rem)] origin-top-right rounded-xl shadow-lg ring-1 ring-black/5 focus:outline-none overflow-y-auto max-h-[300px]">
                                {({ close }) => (
                                    <div className="py-1 flex flex-col">
                                        {sortOptions.map((option) => (
                                            <button
                                                key={option.key}
                                                onClick={() => {
                                                    setActiveSort(option.key);
                                                    close();
                                                }}
                                                className={`flex w-full items-center px-4 py-2 text-sm transition-colors text-left ${
                                                    activeSort === option.key
                                                        ? 'font-bold bg-primary/5 text-primary'
                                                        : 'text-on-surface-variant hover:bg-surface-container-low text-on-surface'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </Popover.Panel>
                        </Transition>
                    </Popover>
                </motion.div>

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
                                        onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
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
                                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
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
                                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
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
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, type: 'spring' }}
                        className="py-20 text-center"
                    >
                        <p className="text-on-surface-variant text-lg">
                            Tidak ada produk dalam kategori ini.
                        </p>
                    </motion.div>
                )}
            </div>
        </PublicLayout>
    );
}
