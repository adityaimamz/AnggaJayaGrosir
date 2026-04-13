import AdminLayout from '@/Layouts/AdminLayout';
import { AdminProductRow, LengthAwarePaginated } from '@/types/domain';
import { Link } from '@inertiajs/react';
import {
    Banknote,
    Box,
    ChevronLeft,
    ChevronRight,
    Home,
    Layers,
    Pencil,
    Trash2,
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
}

const numberFormatter = new Intl.NumberFormat('id-ID');

const currencyFormatter = {
    format: (value: number) => `Rp ${Number(value).toLocaleString('id-ID')}`
};

export default function AdminDashboard({
    stats,
    products,
}: AdminDashboardProps) {
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
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="font-headline text-on-surface text-xl font-black">
                            Manajemen Produk
                        </h2>
                        <p className="text-on-surface-variant text-sm">
                            Menampilkan {products.from ?? 0}-{products.to ?? 0}{' '}
                            dari {products.total} produk
                        </p>
                    </div>
                    <div className="bg-surface-container text-on-surface-variant rounded-xl px-3 py-2 text-sm font-medium">
                        Total Unit Stok:{' '}
                        {numberFormatter.format(stats.totalStockUnits)}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="divide-surface-container-highest min-w-full divide-y text-left">
                        <thead>
                            <tr className="text-on-surface-variant/70 text-xs tracking-wider uppercase">
                                <th className="py-3 pr-4">Produk</th>
                                <th className="py-3 pr-4">Kategori</th>
                                <th className="py-3 pr-4">Tipe Variasi</th>
                                <th className="py-3 pr-4">Harga</th>
                                <th className="py-3 pr-4">Total Stok</th>
                                <th className="py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-surface-container-highest divide-y">
                            {products.data.map((product) => (
                                <tr
                                    key={product.id}
                                    className="hover:bg-surface-container-low"
                                >
                                    <td className="py-3 pr-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-surface-container h-10 w-10 overflow-hidden rounded-lg">
                                                {product.image ? (
                                                    <img
                                                        className="h-full w-full object-cover"
                                                        src={product.image}
                                                        alt={product.name}
                                                        referrerPolicy="no-referrer"
                                                    />
                                                ) : null}
                                            </div>
                                            <div>
                                                <p className="text-on-surface font-semibold">
                                                    {product.name}
                                                </p>
                                                <p className="text-on-surface-variant text-xs">
                                                    /{product.slug}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-on-surface-variant py-3 pr-4 text-sm font-medium">
                                        {product.category.name}
                                    </td>
                                    <td className="text-on-surface-variant py-3 pr-4 text-sm">
                                        {product.variantTypes?.length > 0
                                            ? product.variantTypes.join(', ')
                                            : 'All Size'}
                                    </td>
                                    <td className="text-on-surface py-3 pr-4 text-sm font-semibold">
                                        {product.minPrice === product.maxPrice
                                            ? currencyFormatter.format(product.minPrice)
                                            : `${currencyFormatter.format(product.minPrice)} – ${currencyFormatter.format(product.maxPrice)}`}
                                    </td>
                                    <td className="py-3 pr-4">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                                                product.totalStock < 120
                                                    ? 'bg-primary-fixed text-on-primary-fixed'
                                                    : 'bg-tertiary/10 text-tertiary'
                                            }`}
                                        >
                                            {numberFormatter.format(
                                                product.totalStock,
                                            )}
                                        </span>
                                    </td>
                                    <td className="py-3 text-right">
                                        <div className="inline-flex items-center gap-1">
                                            <button
                                                type="button"
                                                className="text-on-surface-variant hover:bg-surface-container rounded-lg p-2"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                className="text-primary hover:bg-primary-fixed rounded-lg p-2"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="border-surface-container-highest mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <p className="text-on-surface-variant text-sm">
                        Halaman {products.currentPage} dari {products.lastPage}
                    </p>
                    <div className="flex items-center gap-2">
                        <Link
                            href={
                                products.currentPage > 1
                                    ? `/admin/dashboard?page=${products.currentPage - 1}`
                                    : '/admin/dashboard'
                            }
                            className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold ${
                                products.currentPage > 1
                                    ? 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                                    : 'bg-surface-container-low text-on-surface-variant/50 cursor-not-allowed'
                            }`}
                            preserveScroll
                        >
                            <ChevronLeft className="h-4 w-4" /> Prev
                        </Link>
                        <Link
                            href={
                                products.currentPage < products.lastPage
                                    ? `/admin/dashboard?page=${products.currentPage + 1}`
                                    : `/admin/dashboard?page=${products.currentPage}`
                            }
                            className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold ${
                                products.currentPage < products.lastPage
                                    ? 'bg-primary text-white hover:brightness-110'
                                    : 'bg-surface-container-low text-on-surface-variant/50 cursor-not-allowed'
                            }`}
                            preserveScroll
                        >
                            Next <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
