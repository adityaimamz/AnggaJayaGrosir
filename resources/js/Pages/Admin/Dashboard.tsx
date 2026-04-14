import AdminLayout from '@/Layouts/AdminLayout';
import { AdminProductRow, LengthAwarePaginated } from '@/types/domain';
import { Link } from '@inertiajs/react';
import {
    Banknote,
    Box,
    Home,
    Layers,
    TriangleAlert,
} from 'lucide-react';

interface AdminDashboardStats {
    totalProducts: number;
    totalCategories: number;
    totalStockUnits: number;
    lowStockProducts: number;
    stockValue: number;
}

interface AdminDashboardProps {
    stats: AdminDashboardStats;
    products: LengthAwarePaginated<AdminProductRow>;
    categoryComposition: { name: string; count: number }[];
}

const numberFormatter = new Intl.NumberFormat('id-ID');

const currencyFormatter = {
    format: (value: number) => `Rp ${Number(value).toLocaleString('id-ID')}`
};

export default function AdminDashboard(props: Readonly<AdminDashboardProps>) {
    const { stats, products, categoryComposition } = props;

    const lowStockPreview = products.data
        .filter((product) => product.totalStock < 120)
        .slice(0, 5);

    const categoryCompositionList = categoryComposition;

    const averageStockPerProduct =
        stats.totalProducts > 0 ? stats.totalStockUnits / stats.totalProducts : 0;

    const averageStockValuePerProduct =
        stats.totalProducts > 0 ? stats.stockValue / stats.totalProducts : 0;

    return (
        <AdminLayout>
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="font-headline text-on-surface text-3xl font-black">
                        Admin Dashboard
                    </h1>
                    <p className="text-on-surface-variant text-sm">
                        Pantau performa produk dan stok grosir secara real-time.
                    </p>
                </div>
                <Link
                    href="/"
                    className="bg-surface-container text-on-surface hover:bg-surface-container-high inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all shadow-sm"
                >
                    <Home className="h-4 w-4" />
                    Kembali ke Beranda
                </Link>
            </header>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <article className="bg-surface-container-lowest rounded-2xl border border-black/5 p-5">
                    <div className="bg-primary-fixed text-primary mb-3 inline-flex rounded-xl p-3">
                        <Box className="h-5 w-5" />
                    </div>
                    <p className="text-on-surface-variant text-xs font-semibold tracking-wider uppercase">
                        Total Produk
                    </p>
                    <p className="font-headline text-on-surface mt-1 text-2xl font-black">
                        {numberFormatter.format(stats.totalProducts)}
                    </p>
                </article>

                <article className="bg-surface-container-lowest rounded-2xl border border-black/5 p-5">
                    <div className="bg-secondary-fixed text-secondary mb-3 inline-flex rounded-xl p-3">
                        <Layers className="h-5 w-5" />
                    </div>
                    <p className="text-on-surface-variant text-xs font-semibold tracking-wider uppercase">
                        Total Kategori
                    </p>
                    <p className="font-headline text-on-surface mt-1 text-2xl font-black">
                        {numberFormatter.format(stats.totalCategories)}
                    </p>
                </article>

                <article className="bg-surface-container-lowest rounded-2xl border border-black/5 p-5">
                    <div className="bg-tertiary/10 text-tertiary mb-3 inline-flex rounded-xl p-3">
                        <TriangleAlert className="h-5 w-5" />
                    </div>
                    <p className="text-on-surface-variant text-xs font-semibold tracking-wider uppercase">
                        Produk Stok Rendah
                    </p>
                    <p className="font-headline text-on-surface mt-1 text-2xl font-black">
                        {numberFormatter.format(stats.lowStockProducts)}
                    </p>
                </article>

                <article className="rounded-2xl border border-black/5 bg-[#313030] p-5 text-white">
                    <div className="mb-3 inline-flex rounded-xl bg-white/10 p-3">
                        <Banknote className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold tracking-wider text-white/70 uppercase">
                        Estimasi Nilai Stok
                    </p>
                    <p className="font-headline mt-1 text-xl font-black">
                        {currencyFormatter.format(stats.stockValue)}
                    </p>
                </article>
            </section>

            <section className="bg-surface-container-lowest rounded-2xl border border-black/5 p-5 md:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="font-headline text-on-surface text-xl font-black">
                            Insight Operasional
                        </h2>
                        <p className="text-on-surface-variant text-sm">
                            Ringkasan stok cepat untuk pengambilan keputusan harian.
                        </p>
                    </div>
                    <Link
                        href="/admin/products"
                        className="bg-surface-container text-on-surface hover:bg-surface-container-high inline-flex items-center rounded-xl px-3.5 py-2 text-sm font-semibold"
                    >
                        Buka Produk Admin
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <article className="bg-surface-container rounded-2xl border border-black/5 p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <h3 className="text-on-surface text-base font-bold">
                                Watchlist Stok Rendah
                            </h3>
                            <span className="bg-primary-fixed text-on-primary-fixed inline-flex rounded-full px-2.5 py-1 text-xs font-bold">
                                {numberFormatter.format(stats.lowStockProducts)} produk
                            </span>
                        </div>

                        {lowStockPreview.length > 0 ? (
                            <ul className="space-y-2">
                                {lowStockPreview.map((product) => (
                                    <li
                                        key={product.id}
                                        className="bg-surface-container-low flex items-center justify-between rounded-xl px-3 py-2"
                                    >
                                        <div>
                                            <p className="text-on-surface text-sm font-semibold">
                                                {product.name}
                                            </p>
                                            <p className="text-on-surface-variant text-xs">
                                                {product.category.name}
                                            </p>
                                        </div>
                                        <span className="bg-primary-fixed text-on-primary-fixed inline-flex rounded-full px-2 py-1 text-xs font-bold">
                                            {numberFormatter.format(product.totalStock)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-on-surface-variant rounded-xl bg-emerald-500/10 px-3 py-2 text-sm">
                                Semua produk pada data saat ini berada di atas batas stok minimum.
                            </p>
                        )}
                    </article>

                    <article className="bg-surface-container rounded-2xl border border-black/5 p-4">
                        <h3 className="text-on-surface mb-3 text-base font-bold">
                            Ringkasan Distribusi
                        </h3>

                        <div className="mb-4 grid grid-cols-2 gap-2">
                            <div className="bg-surface-container-low rounded-xl px-3 py-2">
                                <p className="text-on-surface-variant text-xs">
                                    Rata-rata unit/produk
                                </p>
                                <p className="text-on-surface text-sm font-bold">
                                    {numberFormatter.format(
                                        Math.round(averageStockPerProduct),
                                    )}
                                </p>
                            </div>
                            <div className="bg-surface-container-low rounded-xl px-3 py-2">
                                <p className="text-on-surface-variant text-xs">
                                    Rata-rata nilai/produk
                                </p>
                                <p className="text-on-surface text-sm font-bold">
                                    {currencyFormatter.format(
                                        Math.round(averageStockValuePerProduct),
                                    )}
                                </p>
                            </div>
                        </div>

                        <h4 className="text-on-surface-variant mb-2 text-xs font-semibold tracking-wider uppercase">
                            Kategori Dominan (Semua Produk)
                        </h4>

                        {categoryCompositionList.length > 0 ? (
                            <ul className="space-y-2">
                                {categoryCompositionList.map((item) => (
                                    <li
                                        key={item.name}
                                        className="bg-surface-container-low flex items-center justify-between rounded-xl px-3 py-2"
                                    >
                                        <span className="text-on-surface text-sm font-medium">
                                            {item.name}
                                        </span>
                                        <span className="text-on-surface-variant text-xs font-bold">
                                            {numberFormatter.format(item.count)} produk
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-on-surface-variant text-sm">
                                Belum ada data kategori untuk diringkas.
                            </p>
                        )}
                    </article>
                </div>
            </section>
        </AdminLayout>
    );
}
