import AppModal from '@/Components/AppModal';
import InputError from '@/Components/InputError';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import {
    AdminCategoryOption,
    AdminProductRow,
    LengthAwarePaginated,
} from '@/types/domain';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Filter,
    Pencil,
    Plus,
    Search,
    Sparkles,
    Trash2,
    X,
} from 'lucide-react';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';

interface ProductManagementProps {
    products: LengthAwarePaginated<AdminProductRow>;
    categories: AdminCategoryOption[];
    filters?: {
        category_id?: number | null;
        search?: string | null;
    };
}

interface ProductFormData {
    category_id: string;
    name: string;
    slug: string;
    variant_types: string[];
    variant_options_map: Record<string, string[]>;
    variants: { options: Record<string, string>; price: string; stock: string }[];
    image_files: File[];
    images_preview: string[];
    description: string;
    min_order_qty: string;
    min_order: string;
    badge: string;
    features_text: string;
    feature_descriptions_text: string;
    is_new: boolean;
    is_best_seller: boolean;
}

const numberFormatter = new Intl.NumberFormat('id-ID');
const currencyFormatter = {
    format: (value: number) => `Rp ${Number(value).toLocaleString('id-ID')}`
};

const emptyForm: ProductFormData = {
    category_id: '',
    name: '',
    slug: '',
    variant_types: ['Ukuran'],
    variant_options_map: { Ukuran: [] },
    variants: [],
    image_files: [],
    images_preview: [],
    description: '',
    min_order_qty: '1',
    min_order: '',
    badge: '',
    features_text: '',
    feature_descriptions_text: '',
    is_new: false,
    is_best_seller: false,
};

function toPayload(data: ProductFormData) {
    const features = data.features_text
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

    return {
        category_id: Number(data.category_id),
        name: data.name,
        slug: data.slug,
        variant_types: data.variant_types,
        variants: data.variants.map((v) => ({
            options: v.options,
            price: Number(v.price),
            stock: Number(v.stock),
        })),
        image_files: data.image_files,
        images_preview: [],
        description: data.description || null,
        min_order_qty: Math.max(1, Number(data.min_order_qty || 1)),
        min_order: data.min_order || null,
        badge: data.badge || null,
        is_new: data.is_new,
        is_best_seller: data.is_best_seller,
        features: features,
        feature_descriptions: features.length > 0 
            ? data.feature_descriptions_text
                .split('|')
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
    };
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function parseCommaList(text: string): string[] {
    return text
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function toEditForm(product: AdminProductRow): ProductFormData {
    return {
        category_id: String(product.category.id),
        name: product.name,
        slug: product.slug,
        variant_types: product.variantTypes || [],
        variant_options_map: (product.variantTypes || []).reduce((acc, typeName) => {
            acc[typeName] = Array.from(new Set((product.variants || []).map(v => v.options[typeName]).filter(Boolean)));
            return acc;
        }, {} as Record<string, string[]>),
        variants: (product.variants || []).map(v => ({
            options: v.options,
            price: String(v.price),
            stock: String(v.stock),
        })),
        image_files: [],
        images_preview: product.images ?? [],
        description: product.description ?? '',
        min_order_qty: String(product.minOrderQty ?? 1),
        min_order: product.minOrder ?? '',
        badge: product.badge ?? '',
        features_text: (product.features ?? []).join(', '),
        feature_descriptions_text: (product.featureDescriptions ?? []).join(' | '),
        is_new: product.isNew ?? false,
        is_best_seller: product.isBestSeller ?? false,
    };
}

export default function Products({
    products,
    categories,
    filters,
}: ProductManagementProps) {
    const page = usePage<PageProps>();
    const flashSuccess = page.props.flash?.success;

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<AdminProductRow | null>(
        null,
    );
    const [editingProduct, setEditingProduct] =
        useState<AdminProductRow | null>(null);
    const [selectedCategory, setSelectedCategory] = useState(
        filters?.category_id ? String(filters.category_id) : 'all',
    );
    const [searchInput, setSearchInput] = useState(filters?.search ?? '');

    useEffect(() => {
        setSelectedCategory(
            filters?.category_id ? String(filters.category_id) : 'all',
        );
    }, [filters?.category_id]);

    useEffect(() => {
        setSearchInput(filters?.search ?? '');
    }, [filters?.search]);

    useEffect(() => {
        const current = filters?.category_id
            ? String(filters.category_id)
            : 'all';
        const activeSearch = (filters?.search ?? '').trim();

        if (selectedCategory === current) {
            return;
        }

        const payload: Record<string, number | string> = {};
        if (selectedCategory !== 'all') {
            payload.category_id = Number(selectedCategory);
        }
        if (activeSearch !== '') {
            payload.search = activeSearch;
        }

        router.get(
            '/admin/products',
            payload,
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['products', 'filters'],
            },
        );
    }, [filters?.category_id, selectedCategory]);

    const createForm = useForm<ProductFormData>(emptyForm);
    const editForm = useForm<ProductFormData>(emptyForm);

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();

        const payload: Record<string, number | string> = {};
        if (selectedCategory !== 'all') {
            payload.category_id = Number(selectedCategory);
        }

        const cleanedSearch = searchInput.trim();
        if (cleanedSearch !== '') {
            payload.search = cleanedSearch;
        }

        router.get('/admin/products', payload, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['products', 'filters'],
        });
    };

    const clearSearch = () => {
        setSearchInput('');

        const payload: Record<string, number> = {};
        if (selectedCategory !== 'all') {
            payload.category_id = Number(selectedCategory);
        }

        router.get('/admin/products', payload, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['products', 'filters'],
        });
    };

    const buildPageUrl = (page: number): string => {
        const params = new URLSearchParams();
        if (page > 1) {
            params.set('page', String(page));
        }
        if (filters?.category_id) {
            params.set('category_id', String(filters.category_id));
        }
        if (filters?.search) {
            params.set('search', filters.search);
        }

        const query = params.toString();
        return query ? `/admin/products?${query}` : '/admin/products';
    };

    const selectedEditId = useMemo(
        () => editingProduct?.id ?? null,
        [editingProduct],
    );

    const openCreate = () => {
        createForm.reset();
        createForm.setData('image_files', []);
        createForm.setData('images_preview', []);
        setShowCreateModal(true);
    };

    const closeCreate = () => {
        setShowCreateModal(false);
        createForm.reset();
        createForm.setData('image_files', []);
        createForm.setData('images_preview', []);
        createForm.clearErrors();
    };

    const openEdit = (product: AdminProductRow) => {
        setEditingProduct(product);
        editForm.setData(toEditForm(product));
        editForm.setData('image_files', []);
    };

    const closeEdit = () => {
        setEditingProduct(null);
        editForm.reset();
        editForm.setData('image_files', []);
        editForm.setData('images_preview', []);
        editForm.clearErrors();
    };

    const submitCreate = (event: FormEvent) => {
        event.preventDefault();
        createForm.transform((data) => toPayload(data));
        createForm.post('/admin/products', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => closeCreate(),
        });
    };

    const submitEdit = (event: FormEvent) => {
        event.preventDefault();
        if (!selectedEditId) {
            return;
        }

        editForm.transform((data) => ({
            ...toPayload(data),
            _method: 'PUT',
        }));

        // Use POST with _method spoofing because PHP doesn't support PUT with multipart/form-data
        editForm.post(`/admin/products/${selectedEditId}`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => closeEdit(),
        });
    };

    const deleteProduct = (product: AdminProductRow) => {
        setDeleteTarget(product);
    };

    const confirmDeleteProduct = () => {
        if (!deleteTarget) {
            return;
        }

        editForm.delete(`/admin/products/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    return (
        <AdminLayout>
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-headline text-on-surface text-3xl font-black">
                        Produk
                    </h1>
                    <p className="text-on-surface-variant text-sm">
                        Kelola katalog produk grosir dari data yang aktif.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openCreate}
                    className="bg-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white hover:brightness-110"
                >
                    <Plus className="h-4 w-4" /> Tambah Produk
                </button>
            </header>

            {flashSuccess ? (
                <div className="border-tertiary/20 bg-tertiary/10 text-tertiary rounded-xl border px-4 py-3 text-sm font-medium">
                    {flashSuccess}
                </div>
            ) : null}

            <section className="bg-surface-container-lowest rounded-2xl border border-black/5 p-5 md:p-6">
                <div className="from-surface-container via-surface-container-lowest to-surface-container mb-5 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-black/5 bg-gradient-to-r p-4">
                    <div className="w-full max-w-sm">
                        <label className="text-on-surface mb-1.5 flex items-center gap-2 text-sm font-semibold">
                            <Filter className="h-4 w-4" /> Filter Kategori
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(event) =>
                                setSelectedCategory(event.target.value)
                            }
                            className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-3 py-2.5 text-sm shadow-sm transition-all focus:outline-none"
                        >
                            <option value="all">Semua kategori</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <form
                        onSubmit={submitSearch}
                        className="w-full max-w-md"
                    >
                        <label className="text-on-surface mb-1.5 flex items-center gap-2 text-sm font-semibold">
                            <Search className="h-4 w-4" /> Cari Produk
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="search"
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.target.value)
                                }
                                placeholder="Cari nama, slug, atau kategori..."
                                className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-3 py-2.5 text-sm shadow-sm transition-all focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="bg-primary rounded-xl px-3 py-2.5 text-xs font-bold text-white hover:brightness-110"
                            >
                                Cari
                            </button>
                            {filters?.search ? (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="bg-surface-container text-on-surface rounded-xl px-3 py-2.5 text-xs font-semibold hover:brightness-95"
                                >
                                    Reset
                                </button>
                            ) : null}
                        </div>
                    </form>

                    <div className="flex items-center gap-2">
                        <span className="bg-primary-fixed text-on-primary-fixed inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold">
                            <Sparkles className="h-3.5 w-3.5" />
                            {selectedCategory === 'all'
                                ? 'Semua kategori aktif'
                                : 'Filter kategori aktif'}
                        </span>
                        {selectedCategory !== 'all' ? (
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('all')}
                                className="bg-surface-container text-on-surface rounded-lg px-3 py-1.5 text-xs font-semibold hover:brightness-95"
                            >
                                Reset
                            </button>
                        ) : null}
                    </div>
                </div>

                <p className="text-on-surface-variant mb-4 text-sm">
                    Menampilkan {products.from ?? 0}-{products.to ?? 0} dari{' '}
                    {products.total} produk
                </p>

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
                                    className="hover:bg-surface-container-low transition-colors"
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
                                    <td className="py-3 pr-4 text-sm font-semibold">
                                        {numberFormatter.format(product.totalStock)}
                                    </td>
                                    <td className="py-3 text-right">
                                        <div className="inline-flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEdit(product)
                                                }
                                                className="text-on-surface-variant hover:bg-surface-container rounded-lg p-2"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    deleteProduct(product)
                                                }
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
                                    ? buildPageUrl(products.currentPage - 1)
                                    : buildPageUrl(products.currentPage)
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
                                    ? buildPageUrl(products.currentPage + 1)
                                    : buildPageUrl(products.currentPage)
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

            {showCreateModal ? (
                <ProductFormModal
                    title="Tambah Produk"
                    submitLabel="Simpan Produk"
                    categories={categories}
                    data={createForm.data}
                    errors={createForm.errors}
                    processing={createForm.processing}
                    onChange={createForm.setData}
                    onSubmit={submitCreate}
                    onClose={closeCreate}
                />
            ) : null}

            {editingProduct ? (
                <ProductFormModal
                    title={`Edit ${editingProduct.name}`}
                    submitLabel="Perbarui Produk"
                    categories={categories}
                    data={editForm.data}
                    errors={editForm.errors}
                    processing={editForm.processing}
                    onChange={editForm.setData}
                    onSubmit={submitEdit}
                    onClose={closeEdit}
                />
            ) : null}

            <AppModal
                open={deleteTarget !== null}
                title="Hapus Produk"
                description={
                    deleteTarget
                        ? `Produk \"${deleteTarget.name}\" akan dihapus permanen.`
                        : undefined
                }
                onClose={() => setDeleteTarget(null)}
            >
                <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setDeleteTarget(null)}
                        className="bg-surface-container rounded-xl px-4 py-2 text-sm font-semibold"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={confirmDeleteProduct}
                        className="bg-primary rounded-xl px-4 py-2 text-sm font-bold text-white"
                    >
                        Ya, Hapus
                    </button>
                </div>
            </AppModal>
        </AdminLayout>
    );
}

interface ProductFormModalProps {
    title: string;
    submitLabel: string;
    categories: AdminCategoryOption[];
    data: ProductFormData;
    errors: Record<string, string | undefined>;
    processing: boolean;
    onChange: <K extends keyof ProductFormData>(
        key: K,
        value: ProductFormData[K],
    ) => void;
    onSubmit: (event: FormEvent) => void;
    onClose: () => void;
}

function ProductFormModal({
    title,
    submitLabel,
    categories,
    data,
    errors,
    processing,
    onChange,
    onSubmit,
    onClose,
}: ProductFormModalProps) {
    const features = parseCommaList(data.features_text);

    const [inputModal, setInputModal] = useState<{
        open: boolean;
        title: string;
        description: string;
        type: 'type' | 'option' | 'price' | 'stock' | 'alert';
        value: string;
        target: string;
    }>({
        open: false,
        title: '',
        description: '',
        type: 'alert',
        value: '',
        target: '',
    });

    const closeInputModal = () => setInputModal(prev => ({ ...prev, open: false, value: '' }));

    const confirmInputModal = () => {
        const { type, value, target } = inputModal;
        if (type === 'type') {
            if (value && !data.variant_types.includes(value)) {
                const newTypes = [...data.variant_types, value];
                const newMap = { ...data.variant_options_map, [value]: [] };
                onChange('variant_types', newTypes);
                onChange('variant_options_map', newMap);
                recalculateVariants(newTypes, newMap);
            }
        } else if (type === 'option') {
            if (value && target && !data.variant_options_map[target]?.includes(value)) {
                const newMap = { ...data.variant_options_map, [target]: [...(data.variant_options_map[target] || []), value] };
                onChange('variant_options_map', newMap);
                recalculateVariants(data.variant_types, newMap);
            }
        } else if (type === 'price') {
            if (value) onChange('variants', data.variants.map(v => ({ ...v, price: value })));
        } else if (type === 'stock') {
            if (value) onChange('variants', data.variants.map(v => ({ ...v, stock: value })));
        }
        closeInputModal();
    };

    const recalculateVariants = (types: string[], map: Record<string, string[]>) => {
        if (types.length === 0) {
            onChange('variants', []);
            return;
        }
        let combinations: Record<string, string>[] = [{}];
        types.forEach(type => {
            const options = map[type];
            if (!options || options.length === 0) return;
            const newCombos: Record<string, string>[] = [];
            combinations.forEach(combo => {
                options.forEach(opt => {
                    newCombos.push({ ...combo, [type]: opt });
                });
            });
            combinations = newCombos;
        });
        combinations = combinations.filter(combo => Object.keys(combo).length === types.length);
        const newVariants = combinations.map(combo => {
            const existing = data.variants.find(v => Object.entries(combo).every(([k, val]) => v.options[k] === val));
            return {
                options: combo,
                price: existing?.price || '',
                stock: existing?.stock || '0',
            };
        });
        onChange('variants', newVariants);
    };

    const handleAddVariantType = () => {
        if (data.variant_types.length >= 2) {
            setInputModal({
                open: true,
                title: 'Batas Variasi',
                description: 'Maksimal 2 tipe variasi (Contoh: Ukuran dan Warna).',
                type: 'alert',
                value: '',
                target: '',
            });
            return;
        }
        setInputModal({
            open: true,
            title: 'Tambah Tipe Variasi',
            description: 'Masukkan nama tipe variasi (Cth: Ukuran, Warna, Bahan).',
            type: 'type',
            value: '',
            target: '',
        });
    };

    const handleRemoveVariantType = (typeName: string) => {
        const newTypes = data.variant_types.filter(t => t !== typeName);
        const newMap = { ...data.variant_options_map };
        delete newMap[typeName];
        onChange('variant_types', newTypes);
        onChange('variant_options_map', newMap);
        recalculateVariants(newTypes, newMap);
    };

    const handleAddOption = (typeName: string) => {
        setInputModal({
            open: true,
            title: `Tambah Opsi ${typeName}`,
            description: `Masukkan pilihan baru untuk ${typeName} (Cth: S, M, Merah, Biru).`,
            type: 'option',
            value: '',
            target: typeName,
        });
    };

    const handleRemoveOption = (typeName: string, opt: string) => {
        const newMap = { ...data.variant_options_map, [typeName]: (data.variant_options_map[typeName] || []).filter(o => o !== opt) };
        onChange('variant_options_map', newMap);
        recalculateVariants(data.variant_types, newMap);
    };

    const setAllPrices = () => {
        setInputModal({
            open: true,
            title: 'Set Semua Harga',
            description: 'Harga yang Anda masukkan akan diterapkan ke seluruh variasi di atas.',
            type: 'price',
            value: '',
            target: '',
        });
    };

    const setAllStocks = () => {
        setInputModal({
            open: true,
            title: 'Set Semua Stok',
            description: 'Stok yang Anda masukkan akan diterapkan ke seluruh variasi.',
            type: 'stock',
            value: '',
            target: '',
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6">
            <form
                onSubmit={onSubmit}
                className="bg-surface-container-lowest max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-black/5 p-6"
            >
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-headline text-on-surface text-xl font-black">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-on-surface-variant hover:bg-surface-container rounded-lg p-2"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Nama" error={errors.name}>
                        <input
                            value={data.name}
                            onChange={(event) => {
                                const name = event.target.value;
                                onChange('name', name);
                                if (!data.slug.trim()) {
                                    onChange('slug', slugify(name));
                                }
                            }}
                            className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-3 py-2.5 text-sm focus:outline-none"
                        />
                    </Field>

                    <Field label="Slug" error={errors.slug}>
                        <input
                            value={data.slug}
                            onChange={(event) =>
                                onChange('slug', event.target.value)
                            }
                            className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-3 py-2.5 text-sm focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => onChange('slug', slugify(data.name))}
                            className="text-primary mt-1 text-xs font-semibold hover:underline"
                        >
                            Generate dari nama
                        </button>
                    </Field>

                    <Field label="Kategori" error={errors.category_id}>
                        <select
                            value={data.category_id}
                            onChange={(event) =>
                                onChange('category_id', event.target.value)
                            }
                            className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-3 py-2.5 text-sm focus:outline-none"
                        >
                            <option value="">Pilih kategori</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field
                        label="Minimal Quantity"
                        error={errors.min_order_qty}
                    >
                        <input
                            type="number"
                            min={1}
                            value={data.min_order_qty}
                            onChange={(event) =>
                                onChange('min_order_qty', event.target.value)
                            }
                            className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-3 py-2.5 text-sm focus:outline-none"
                        />
                    </Field>

                    <Field label="Satuan Order" error={errors.min_order}>
                        <input
                            value={data.min_order}
                            onChange={(event) =>
                                onChange('min_order', event.target.value)
                            }
                            placeholder="Contoh: setengah lusin, kodi, pcs"
                            className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-3 py-2.5 text-sm focus:outline-none"
                        />
                    </Field>

                    <Field label="Badge" error={errors.badge}>
                        <input
                            value={data.badge}
                            onChange={(event) =>
                                onChange('badge', event.target.value)
                            }
                            className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-3 py-2.5 text-sm focus:outline-none"
                        />
                    </Field>

                    <Field
                        label="Upload Gambar (max 5)"
                        error={errors.image_files ?? errors['image_files.0']}
                    >
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            multiple
                            onChange={(event) =>
                                onChange(
                                    'image_files',
                                    Array.from(event.target.files ?? []).slice(
                                        0,
                                        5,
                                    ),
                                )
                            }
                            className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-3 py-2.5 text-sm focus:outline-none"
                        />
                        <p className="text-on-surface-variant mt-1 text-xs">
                            Upload otomatis dioptimasi ke WebP (max 1600px,
                            quality 78). Total maksimal 5 gambar.
                        </p>
                        {data.image_files.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {data.image_files.map((file) => (
                                    <span
                                        key={file.name + file.size}
                                        className="bg-surface-container-highest text-on-surface rounded-full px-2.5 py-1 text-xs font-semibold"
                                    >
                                        {file.name}
                                    </span>
                                ))}
                            </div>
                        ) : null}

                        {data.image_files.length === 0 &&
                        Array.isArray(data.images_preview) &&
                        data.images_preview.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {data.images_preview.map((image) => (
                                    <img
                                        key={image}
                                        src={image}
                                        alt="Product preview"
                                        className="h-12 w-12 rounded-lg object-cover"
                                    />
                                ))}
                            </div>
                        ) : null}
                    </Field>

                    {/* Variant Builder UI */}
                    <div className="md:col-span-2 rounded-xl border border-surface-container-highest p-4 bg-surface-container-lowest">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-headline text-lg font-bold">Variasi Produk</h3>
                            <button
                                type="button"
                                onClick={handleAddVariantType}
                                className="bg-primary text-white hover:brightness-110 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                            >
                                <Plus className="h-3 w-3" /> Tambah Variasi
                            </button>
                        </div>

                        {data.variant_types.length === 0 ? (
                            <p className="text-sm text-on-surface-variant italic mb-4">Belum ada variasi. Produk akan dianggap sebagai 1 varian (All Size).</p>
                        ) : (
                            <div className="space-y-4 mb-6">
                                {data.variant_types.map((type) => (
                                    <div key={type} className="bg-surface-container rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold">{type}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveVariantType(type)}
                                                className="text-primary hover:text-red-500 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {data.variant_options_map[type]?.map((opt) => (
                                                <div key={opt} className="bg-surface-container-highest flex items-center rounded-lg px-3 py-1 text-sm">
                                                    <span>{opt}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveOption(type, opt)}
                                                        className="ml-2 hover:text-red-500"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => handleAddOption(type)}
                                                className="text-primary border border-dashed border-primary hover:bg-primary-fixed hover:text-on-primary-fixed inline-flex h-7 items-center justify-center rounded-lg px-3 text-xs font-bold transition-colors"
                                            >
                                                <Plus className="h-3 w-3 mr-1" /> Tambah Opsi
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {data.variants.length > 0 && (
                            <div className="mt-6 border-t border-surface-container-highest pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-bold">Harga & Stok Varian</h4>
                                    <div className="flex gap-2 text-xs">
                                        <button type="button" onClick={setAllPrices} className="text-primary underline font-semibold">Set Semua Harga</button>
                                        <button type="button" onClick={setAllStocks} className="text-primary underline font-semibold">Set Semua Stok</button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto border border-surface-container-highest rounded-xl">
                                    <table className="min-w-full divide-y divide-surface-container-highest text-left text-sm">
                                        <thead className="bg-surface-container-low">
                                            <tr>
                                                <th className="px-4 py-2 font-semibold w-1/3">Varian ({data.variant_types.join(' / ')})</th>
                                                <th className="px-4 py-2 font-semibold">Harga</th>
                                                <th className="px-4 py-2 font-semibold">Stok (Satuan)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-surface-container-highest bg-surface-container-lowest">
                                            {data.variants.map((v, idx) => {
                                                const label = data.variant_types.map(t => v.options[t]).join(' / ');
                                                return (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-2 font-medium">{label}</td>
                                                        <td className="p-2">
                                                            <input
                                                                type="number"
                                                                value={v.price}
                                                                onChange={(e) => {
                                                                    const newV = [...data.variants];
                                                                    newV[idx].price = e.target.value;
                                                                    onChange('variants', newV);
                                                                }}
                                                                className="bg-surface-container focus:border-primary w-full rounded-lg px-3 py-1.5 focus:outline-none"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="number"
                                                                value={v.stock}
                                                                onChange={(e) => {
                                                                    const newV = [...data.variants];
                                                                    newV[idx].stock = e.target.value;
                                                                    onChange('variants', newV);
                                                                }}
                                                                className="bg-surface-container focus:border-primary w-full rounded-lg px-3 py-1.5 focus:outline-none"
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {errors.variants && <InputError className="mt-1" message={errors.variants} />}
                                {data.variants.map((_, i) => (
                                    <div key={i}>
                                        {errors[`variants.${i}.price`] && <InputError message={errors[`variants.${i}.price`]} />}
                                        {errors[`variants.${i}.stock`] && <InputError message={errors[`variants.${i}.stock`]} />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Field label="Fitur (pisah koma)" error={errors.features}>
                        <input
                            value={data.features_text}
                            onChange={(event) =>
                                onChange('features_text', event.target.value)
                            }
                            className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-3 py-2.5 text-sm focus:outline-none"
                        />
                        {features.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {features.map((feature) => (
                                    <span
                                        key={feature}
                                        className="bg-surface-container-highest text-on-surface rounded-full px-2.5 py-1 text-xs font-semibold"
                                    >
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        ) : null}
                    </Field>

                    <Field label="Deskripsi Fitur (pisah dengan |)" error={errors.feature_descriptions}>
                        <textarea
                            value={data.feature_descriptions_text}
                            onChange={(event) =>
                                onChange('feature_descriptions_text', event.target.value)
                            }
                            rows={3}
                            disabled={features.length === 0}
                            placeholder={features.length === 0 ? "Isi kolom Fitur terlebih dahulu..." : "Cth: Deskripsi fitur 1 | Deskripsi fitur 2"}
                            className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-3 py-2.5 text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </Field>
                </div>

                <div className="mt-4">
                    <Field label="Deskripsi" error={errors.description}>
                        <textarea
                            value={data.description}
                            onChange={(event) =>
                                onChange('description', event.target.value)
                            }
                            rows={4}
                            className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-3 py-2.5 text-sm focus:outline-none"
                        />
                    </Field>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <label className="inline-flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={data.is_new}
                            onChange={(event) =>
                                onChange('is_new', event.target.checked)
                            }
                        />
                        Produk Baru
                    </label>
                    <label className="inline-flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={data.is_best_seller}
                            onChange={(event) =>
                                onChange('is_best_seller', event.target.checked)
                            }
                        />
                        Best Seller
                    </label>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-surface-container rounded-xl px-4 py-2 text-sm font-semibold"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-primary rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                    >
                        {submitLabel}
                    </button>
                </div>
            </form>

            <AppModal
                open={inputModal.open}
                onClose={closeInputModal}
                title={inputModal.title}
                description={inputModal.description}
            >
                <div className="space-y-4">
                    {inputModal.type !== 'alert' && (
                        <input
                            autoFocus
                            type={inputModal.type === 'price' || inputModal.type === 'stock' ? 'number' : 'text'}
                            value={inputModal.value}
                            onChange={(e) => setInputModal(prev => ({ ...prev, value: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && confirmInputModal()}
                            placeholder="Input di sini..."
                            className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-4 py-3 focus:outline-none"
                        />
                    )}

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={closeInputModal}
                            className="text-on-surface-variant hover:bg-surface-container flex-1 rounded-xl px-4 py-3 font-bold transition-colors"
                        >
                            Batal
                        </button>
                        {inputModal.type !== 'alert' ? (
                            <button
                                type="button"
                                onClick={confirmInputModal}
                                className="bg-primary flex-1 rounded-xl px-4 py-3 font-bold text-white transition-all hover:brightness-110"
                            >
                                Simpan
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={closeInputModal}
                                className="bg-primary flex-1 rounded-xl px-4 py-3 font-bold text-white transition-all hover:brightness-110"
                            >
                                Oke
                            </button>
                        )}
                    </div>
                </div>
            </AppModal>
        </div>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="text-on-surface mb-1.5 block text-sm font-semibold">
                {label}
            </label>
            {children}
            <InputError className="mt-1" message={error} />
        </div>
    );
}
