import AppModal from '@/Components/AppModal';
import ConfirmDialog from '@/Components/ui/confirm-dialog';
import InputError from '@/Components/InputError';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import {
    AdminCategoryOption,
    AdminProductRow,
    BrandOption,
    LengthAwarePaginated,
    SizeGuide,
} from '@/types/domain';
import {
    notifyActionError,
    notifyCreated,
    notifyDeleted,
    notifyError,
    notifyProductSearchNotFound,
    notifyUpdated,
} from '@/utils/notify';
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
    Settings2,
} from 'lucide-react';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';

interface ProductManagementProps {
    products: LengthAwarePaginated<AdminProductRow>;
    categories: AdminCategoryOption[];
    brands: BrandOption[];
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
    retained_image_paths: string[];
    description: string;
    min_order_qty: string;
    min_order: string;
    badge: string;
    features_list: { name: string; description: string }[];
    is_new: boolean;
    is_best_seller: boolean;
    is_active: boolean;
    brand_id: string;
    size_guide_columns: string[];
    size_guide_rows: { label: string; values: string[] }[];
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
    retained_image_paths: [],
    description: '',
    min_order_qty: '1',
    min_order: '',
    badge: '',
    features_list: [],
    is_new: false,
    is_best_seller: false,
    is_active: true,
    brand_id: '',
    size_guide_columns: [],
    size_guide_rows: [],
};

function toPayload(data: ProductFormData) {

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
        retained_image_paths: data.retained_image_paths,
        description: data.description || null,
        min_order_qty: Math.max(1, Number(data.min_order_qty || 1)),
        min_order: data.min_order || null,
        badge: data.badge || null,
        is_new: data.is_new,
        is_best_seller: data.is_best_seller,
        is_active: data.is_active,
        brand_id: data.brand_id ? Number(data.brand_id) : null,
        features: data.features_list.filter(f => f.name.trim() !== '').map(f => f.name.trim()),
        feature_descriptions: data.features_list.filter(f => f.name.trim() !== '').map(f => f.description.trim()),
        size_guide: data.size_guide_columns.length > 0 && data.size_guide_rows.length > 0
            ? { columns: data.size_guide_columns, rows: data.size_guide_rows }
            : null,
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

function toEditForm(product: AdminProductRow): ProductFormData {
    const variantTypes = Array.isArray(product.variantTypes)
        ? product.variantTypes.filter((typeName): typeName is string =>
              typeof typeName === 'string' && typeName.trim() !== '',
          )
        : [];

    const variants = Array.isArray(product.variants)
        ? product.variants.filter(
              (variant): variant is AdminProductRow['variants'][number] =>
                  typeof variant === 'object' &&
                  variant !== null &&
                  typeof variant.options === 'object' &&
                  variant.options !== null,
          )
        : [];

    const featuresList = (product.features || []).map((name, index) => ({
        name,
        description: product.featureDescriptions?.[index] || '',
    }));

    return {
        category_id: product.category?.id ? String(product.category.id) : '',
        name: typeof product.name === 'string' ? product.name : '',
        slug: typeof product.slug === 'string' ? product.slug : '',
        variant_types: variantTypes,
        variant_options_map: variantTypes.reduce((acc, typeName) => {
            acc[typeName] = Array.from(
                new Set(
                    variants
                        .map((variant) => variant.options[typeName])
                        .filter(
                            (value): value is string =>
                                typeof value === 'string' && value.trim() !== '',
                        ),
                ),
            );
            return acc;
        }, {} as Record<string, string[]>),
        variants: variants.map((v) => ({
            options: v.options,
            price: String(v.price),
            stock: String(v.stock),
        })),
        image_files: [],
        images_preview: product.images ?? [],
        retained_image_paths: product.imagePaths ?? [],
        description: product.description ?? '',
        min_order_qty: String(product.minOrderQty ?? 1),
        min_order: product.minOrder ?? '',
        badge: product.badge ?? '',
        features_list: featuresList,
        is_new: product.isNew ?? false,
        is_best_seller: product.isBestSeller ?? false,
        is_active: product.isActive ?? true,
        brand_id: product.brandId ? String(product.brandId) : '',
        size_guide_columns: product.sizeGuide?.columns ?? [],
        size_guide_rows: product.sizeGuide?.rows ?? [],
    };
}

export default function Products({
    products,
    categories,
    brands: initialBrands,
    filters,
}: ProductManagementProps) {
    const page = usePage<PageProps>();
    const flashError = page.props.flash?.error;
    const [brands, setBrands] = useState<BrandOption[]>(initialBrands);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<AdminProductRow | null>(
        null,
    );
    const [editingProduct, setEditingProduct] =
        useState<AdminProductRow | null>(null);
    const [isDeletingProduct, setIsDeletingProduct] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(
        filters?.category_id ? String(filters.category_id) : 'all',
    );
    const [searchInput, setSearchInput] = useState(filters?.search ?? '');

    const notifyIfSearchResultEmpty = (
        responsePage: unknown,
        requestedSearch: string,
    ) => {
        if (requestedSearch.trim() === '') {
            return;
        }

        const responseData = (responsePage as {
            props?: {
                products?: {
                    data?: unknown[];
                };
            };
        })?.props?.products?.data;

        if (Array.isArray(responseData) && responseData.length === 0) {
            notifyProductSearchNotFound();
        }
    };

    useEffect(() => {
        if (!flashError) {
            return;
        }

        notifyError(flashError);
    }, [flashError]);

    // Sinkronisasi saat props filters berubah dari luar (misalnya navigasi browser)
    useEffect(() => {
        const fromProps = filters?.category_id ? String(filters.category_id) : 'all';
        setSelectedCategory(fromProps);
    }, [filters?.category_id]);

    useEffect(() => {
        setSearchInput(filters?.search ?? '');
    }, [filters?.search]);

    // Handler perubahan dropdown — langsung navigasi
    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);

        const activeSearch = (filters?.search ?? '').trim();
        const payload: Record<string, number | string> = {};
        if (value !== 'all') {
            payload.category_id = Number(value);
        }
        if (activeSearch !== '') {
            payload.search = activeSearch;
        }

        router.get('/admin/products', payload, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['products', 'filters'],
            onSuccess: (responsePage) => {
                notifyIfSearchResultEmpty(responsePage, activeSearch);
            },
        });
    };

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
            onSuccess: (responsePage) => {
                notifyIfSearchResultEmpty(responsePage, cleanedSearch);
            },
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
        createForm.setData({ ...emptyForm, image_files: [], images_preview: [] });
        createForm.clearErrors();
        setShowCreateModal(true);
    };

    const closeCreate = () => {
        setShowCreateModal(false);
        createForm.setData({ ...emptyForm, image_files: [], images_preview: [] });
        createForm.clearErrors();
    };

    const openEdit = (product: AdminProductRow) => {
        setEditingProduct(product);
        editForm.clearErrors();
        editForm.setData(() => ({ ...toEditForm(product), image_files: [] }));
    };

    const closeEdit = () => {
        setEditingProduct(null);
        editForm.setData({ ...emptyForm, image_files: [], images_preview: [] });
        editForm.clearErrors();
    };

    const submitCreate = (event: FormEvent) => {
        event.preventDefault();
        createForm.transform((data) => ({
            ...toPayload(data),
            _filter_category_id: selectedCategory !== 'all' ? selectedCategory : '',
            _filter_search: filters?.search ?? '',
        }));
        createForm.post('/admin/products', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                closeCreate();
                notifyCreated('Produk');
            },
            onError: () => notifyActionError('menambahkan', 'produk'),
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
            _filter_category_id: selectedCategory !== 'all' ? selectedCategory : '',
            _filter_search: filters?.search ?? '',
        }));

        // Use POST with _method spoofing because PHP doesn't support PUT with multipart/form-data
        editForm.post(`/admin/products/${selectedEditId}`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                closeEdit();
                notifyUpdated('Produk');
            },
            onError: () => notifyActionError('memperbarui', 'produk'),
        });
    };

    const deleteProduct = (product: AdminProductRow) => {
        setDeleteTarget(product);
    };

    const confirmDeleteProduct = () => {
        if (!deleteTarget) {
            return;
        }

        const deleteUrl = selectedCategory !== 'all'
            ? `/admin/products/${deleteTarget.id}?_filter_category_id=${selectedCategory}${filters?.search ? `&_filter_search=${filters.search}` : ''}`
            : `/admin/products/${deleteTarget.id}`;

        setIsDeletingProduct(true);
        editForm.delete(deleteUrl, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(null);
                notifyDeleted('Produk');
            },
            onError: () => notifyActionError('menghapus', 'produk'),
            onFinish: () => setIsDeletingProduct(false),
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

            <section className="bg-surface-container-lowest rounded-2xl border border-black/5 p-5 md:p-6">
                <div className="from-surface-container via-surface-container-lowest to-surface-container mb-5 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-black/5 bg-gradient-to-r p-4">
                    <div className="w-full max-w-sm">
                        <label className="text-on-surface mb-1.5 flex items-center gap-2 text-sm font-semibold">
                            <Filter className="h-4 w-4" /> Filter Kategori
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(event) =>
                                handleCategoryChange(event.target.value)
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
                                onClick={() => handleCategoryChange('all')}
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
                    brands={brands}
                    onBrandsChange={setBrands}
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
                    brands={brands}
                    onBrandsChange={setBrands}
                    data={editForm.data}
                    errors={editForm.errors}
                    processing={editForm.processing}
                    onChange={editForm.setData}
                    onSubmit={submitEdit}
                    onClose={closeEdit}
                />
            ) : null}

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Hapus Produk"
                description={
                    deleteTarget
                        ? `Produk "${deleteTarget.name}" akan dihapus permanen.`
                        : undefined
                }
                confirmLabel="Ya, Hapus"
                cancelLabel="Batal"
                processing={isDeletingProduct}
                danger
                onCancel={() => setDeleteTarget(null)}
                onConfirm={confirmDeleteProduct}
            />
        </AdminLayout>
    );
}

interface ProductFormModalProps {
    title: string;
    submitLabel: string;
    categories: AdminCategoryOption[];
    brands: BrandOption[];
    onBrandsChange: (brands: BrandOption[]) => void;
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
    brands,
    onBrandsChange,
    data,
    errors,
    processing,
    onChange,
    onSubmit,
    onClose,
}: ProductFormModalProps) {
    const [showBrandManager, setShowBrandManager] = useState(false);

    const requiredFieldErrors = [
        { label: 'Nama', invalid: Boolean(errors.name) },
        { label: 'Slug', invalid: Boolean(errors.slug) },
        { label: 'Kategori', invalid: Boolean(errors.category_id) },
        {
            label: 'Variasi Produk',
            invalid:
                Boolean(errors.variants) ||
                Object.keys(errors).some(
                    (key) => key.startsWith('variants.') || key.startsWith('variant_types.'),
                ),
        },
    ].filter((item) => item.invalid);

    const [inputModal, setInputModal] = useState<{
        open: boolean;
        title: string;
        description: string;
        type: 'type' | 'option' | 'price' | 'stock' | 'size_guide_column' | 'alert';
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
        } else if (type === 'size_guide_column') {
            const columnName = value.trim();
            if (columnName !== '') {
                const newCols = [...data.size_guide_columns, columnName];
                onChange('size_guide_columns', newCols);

                const newRows = data.size_guide_rows.map((row) => ({
                    ...row,
                    values: [...row.values, ''],
                }));
                onChange('size_guide_rows', newRows);
            }
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

    const openSizeGuideColumnModal = () => {
        setInputModal({
            open: true,
            title: 'Tambah Kolom Panduan Ukuran',
            description: 'Masukkan nama kolom dimensi (cth: Lebar, Panjang, Lingkar Pinggang).',
            type: 'size_guide_column',
            value: '',
            target: '',
        });
    };

    const removeExistingImage = (index: number) => {
        onChange(
            'images_preview',
            data.images_preview.filter((_, i) => i !== index),
        );
        onChange(
            'retained_image_paths',
            data.retained_image_paths.filter((_, i) => i !== index),
        );
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

                <p className="text-on-surface-variant mb-3 text-xs font-semibold">
                    <span className="text-red-600">*</span> Wajib diisi
                </p>

                {requiredFieldErrors.length > 0 ? (
                    <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                        Field wajib belum lengkap: {requiredFieldErrors.map((item) => item.label).join(', ')}.
                    </div>
                ) : null}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Nama" error={errors.name} required>
                        <input
                            value={data.name}
                            onChange={(event) => {
                                const name = event.target.value;
                                const currentAutoSlug = slugify(data.name);
                                onChange('name', name);

                                // Keep slug synced while it is still in auto-generated mode.
                                if (!data.slug.trim() || data.slug === currentAutoSlug) {
                                    onChange('slug', slugify(name));
                                }
                            }}
                            className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-3 py-2.5 text-sm focus:outline-none"
                            required
                        />
                    </Field>

                    <Field label="Slug" error={errors.slug} required>
                        <input
                            value={data.slug}
                            onChange={(event) =>
                                onChange('slug', event.target.value)
                            }
                            className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-3 py-2.5 text-sm focus:outline-none"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => onChange('slug', slugify(data.name))}
                            className="text-primary mt-1 text-xs font-semibold hover:underline"
                        >
                            Generate dari nama
                        </button>
                    </Field>

                    <Field label="Kategori" error={errors.category_id} required>
                        <select
                            value={data.category_id}
                            onChange={(event) =>
                                onChange('category_id', event.target.value)
                            }
                            className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-3 py-2.5 text-sm focus:outline-none"
                            required
                        >
                            <option value="">Pilih kategori</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Merek" error={errors.brand_id}>
                        <div className="flex items-center gap-2">
                            <select
                                value={data.brand_id}
                                onChange={(event) =>
                                    onChange('brand_id', event.target.value)
                                }
                                className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-3 py-2.5 text-sm focus:outline-none"
                            >
                                <option value="">Tanpa Merek</option>
                                {brands.map((brand) => (
                                    <option key={brand.id} value={brand.id}>
                                        {brand.kode}{brand.keterangan ? ` — ${brand.keterangan}` : ''}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => setShowBrandManager(true)}
                                className="bg-surface-container hover:bg-surface-container-high text-on-surface-variant shrink-0 rounded-xl p-2.5 transition-colors"
                                title="Kelola Merek"
                            >
                                <Settings2 className="h-4 w-4" />
                            </button>
                        </div>
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
                                {data.images_preview.map((image, index) => (
                                    <div key={image} className="relative">
                                        <img
                                            src={image}
                                            alt="Product preview"
                                            className="h-12 w-12 rounded-lg object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(index)}
                                            className="bg-black/70 absolute -top-1 -right-1 rounded-full p-0.5 text-white"
                                            aria-label="Hapus foto"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </Field>

                    {/* Variant Builder UI */}
                    <div className="md:col-span-2 rounded-xl border border-surface-container-highest p-4 bg-surface-container-lowest">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-headline text-lg font-bold">
                                Variasi Produk <span className="text-red-600">*</span>
                            </h3>
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
                                                <th className="px-4 py-2 font-semibold">Harga <span className="text-red-600">*</span></th>
                                                <th className="px-4 py-2 font-semibold">Stok (Satuan) <span className="text-red-600">*</span></th>
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

                        {errors.variants && data.variants.length === 0 ? (
                            <InputError className="mt-2" message={errors.variants} />
                        ) : null}
                    </div>

                    <div className="md:col-span-2 rounded-xl border border-surface-container-highest p-4 bg-surface-container-lowest">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-headline text-lg font-bold">Fitur Produk</h3>
                            <button
                                type="button"
                                onClick={() =>
                                    onChange('features_list', [
                                        ...data.features_list,
                                        { name: '', description: '' },
                                    ])
                                }
                                className="bg-primary text-white hover:brightness-110 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                            >
                                <Plus className="h-3 w-3" /> Tambah Fitur
                            </button>
                        </div>

                        {data.features_list.length === 0 ? (
                            <p className="text-sm text-on-surface-variant italic mb-4">Belum ada fitur unggulan untuk produk ini.</p>
                        ) : (
                            <div className="space-y-3">
                                {data.features_list.map((feature, idx) => (
                                    <div key={idx} className="flex flex-col gap-2 bg-surface-container rounded-xl p-3 sm:flex-row sm:items-start">
                                        <div className="flex-1">
                                            <input
                                                placeholder="Nama Fitur (cth: Bahan Premium)"
                                                value={feature.name}
                                                onChange={(e) => {
                                                    const newList = [...data.features_list];
                                                    newList[idx].name = e.target.value;
                                                    onChange('features_list', newList);
                                                }}
                                                className="bg-surface-container-lowest focus:border-primary w-full rounded-lg border border-transparent px-3 py-2 text-sm focus:outline-none placeholder:text-on-surface-variant/50"
                                            />
                                            {errors[`features.${idx}`] && <InputError className="mt-1" message={errors[`features.${idx}`]} />}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                placeholder="Deskripsi Fitur Singkat"
                                                value={feature.description}
                                                onChange={(e) => {
                                                    const newList = [...data.features_list];
                                                    newList[idx].description = e.target.value;
                                                    onChange('features_list', newList);
                                                }}
                                                className="bg-surface-container-lowest focus:border-primary w-full rounded-lg border border-transparent px-3 py-2 text-sm focus:outline-none placeholder:text-on-surface-variant/50"
                                            />
                                            {errors[`feature_descriptions.${idx}`] && <InputError className="mt-1" message={errors[`feature_descriptions.${idx}`]} />}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newList = [...data.features_list];
                                                newList.splice(idx, 1);
                                                onChange('features_list', newList);
                                            }}
                                            className="text-on-surface-variant hover:bg-surface-container-highest self-end sm:self-auto rounded-lg p-2 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors.features && <InputError className="mt-2" message={errors.features} />}
                    </div>
                </div>

                {/* Panduan Ukuran */}
                <div className="mt-4 rounded-xl border border-surface-container-highest p-4 bg-surface-container-lowest">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-headline text-lg font-bold">Panduan Ukuran</h3>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={openSizeGuideColumnModal}
                                className="bg-surface-container hover:bg-surface-container-high text-on-surface inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
                            >
                                <Plus className="h-3 w-3" /> Kolom
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onChange('size_guide_rows', [
                                        ...data.size_guide_rows,
                                        { label: '', values: data.size_guide_columns.map(() => '') },
                                    ]);
                                }}
                                disabled={data.size_guide_columns.length === 0}
                                className="bg-primary text-white hover:brightness-110 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-40"
                            >
                                <Plus className="h-3 w-3" /> Baris
                            </button>
                        </div>
                    </div>

                    {data.size_guide_columns.length === 0 ? (
                        <p className="text-sm text-on-surface-variant italic">Belum ada panduan ukuran. Mulai dengan menambahkan kolom dimensi.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-surface-container-highest">
                                        <th className="py-2 pr-2 text-left font-semibold text-on-surface-variant">Ukuran</th>
                                        {data.size_guide_columns.map((col, ci) => (
                                            <th key={ci} className="py-2 px-2 text-left">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-semibold text-on-surface-variant">{col}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newCols = data.size_guide_columns.filter((_, i) => i !== ci);
                                                            onChange('size_guide_columns', newCols);
                                                            const newRows = data.size_guide_rows.map(r => ({
                                                                ...r,
                                                                values: r.values.filter((_, i) => i !== ci),
                                                            }));
                                                            onChange('size_guide_rows', newRows);
                                                        }}
                                                        className="text-on-surface-variant/50 hover:text-red-500 p-0.5"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </th>
                                        ))}
                                        <th className="py-2 w-8"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.size_guide_rows.map((row, ri) => (
                                        <tr key={ri} className="border-b border-surface-container-highest/50">
                                            <td className="py-1.5 pr-2">
                                                <input
                                                    placeholder="S, M, L..."
                                                    value={row.label}
                                                    onChange={(e) => {
                                                        const newRows = [...data.size_guide_rows];
                                                        newRows[ri] = { ...newRows[ri], label: e.target.value };
                                                        onChange('size_guide_rows', newRows);
                                                    }}
                                                    className="bg-surface-container focus:border-primary w-full min-w-[60px] rounded-lg border border-transparent px-2 py-1.5 text-sm font-semibold focus:outline-none"
                                                />
                                            </td>
                                            {row.values.map((val, vi) => (
                                                <td key={vi} className="py-1.5 px-2">
                                                    <input
                                                        placeholder="30 cm"
                                                        value={val}
                                                        onChange={(e) => {
                                                            const newRows = [...data.size_guide_rows];
                                                            const newValues = [...newRows[ri].values];
                                                            newValues[vi] = e.target.value;
                                                            newRows[ri] = { ...newRows[ri], values: newValues };
                                                            onChange('size_guide_rows', newRows);
                                                        }}
                                                        className="bg-surface-container focus:border-primary w-full min-w-[70px] rounded-lg border border-transparent px-2 py-1.5 text-sm focus:outline-none"
                                                    />
                                                </td>
                                            ))}
                                            <td className="py-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        onChange('size_guide_rows', data.size_guide_rows.filter((_, i) => i !== ri));
                                                    }}
                                                    className="text-on-surface-variant/50 hover:text-red-500 p-1"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <ToggleSwitch
                        label="Produk Aktif"
                        description="Tampilkan di etalase"
                        checked={data.is_active}
                        onChange={(val) => onChange('is_active', val)}
                        activeColor="bg-emerald-500"
                    />
                    <ToggleSwitch
                        label="Produk Baru"
                        description="Tandai sebagai baru"
                        checked={data.is_new}
                        onChange={(val) => onChange('is_new', val)}
                        activeColor="bg-sky-500"
                    />
                    <ToggleSwitch
                        label="Best Seller"
                        description="Tandai terlaris"
                        checked={data.is_best_seller}
                        onChange={(val) => onChange('is_best_seller', val)}
                        activeColor="bg-amber-500"
                    />
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

            {showBrandManager && (
                <BrandManagerModal
                    brands={brands}
                    onBrandsChange={onBrandsChange}
                    onClose={() => setShowBrandManager(false)}
                />
            )}
        </div>
    );
}

function Field({
    label,
    error,
    required = false,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="text-on-surface mb-1.5 block text-sm font-semibold">
                {label}{required ? <span className="text-red-600"> *</span> : null}
            </label>
            {children}
            <InputError className="mt-1" message={error} />
        </div>
    );
}

function ToggleSwitch({
    label,
    description,
    checked,
    onChange,
    activeColor = 'bg-primary',
}: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (value: boolean) => void;
    activeColor?: string;
}) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                checked
                    ? 'border-transparent bg-surface-container-low shadow-sm'
                    : 'border-dashed border-surface-container-highest bg-surface-container-lowest opacity-60'
            }`}
        >
            <div
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
                    checked ? activeColor : 'bg-surface-container-highest'
                }`}
            >
                <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                        checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </div>
            <div className="min-w-0">
                <p className="text-on-surface text-sm font-semibold leading-tight">{label}</p>
                {description && (
                    <p className="text-on-surface-variant text-xs leading-tight">{description}</p>
                )}
            </div>
        </button>
    );
}

function BrandManagerModal({
    brands,
    onBrandsChange,
    onClose,
}: {
    brands: BrandOption[];
    onBrandsChange: (brands: BrandOption[]) => void;
    onClose: () => void;
}) {
    const [kode, setKode] = useState('');
    const [keterangan, setKeterangan] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const getCookieValue = (name: string): string => {
        const pair = document.cookie
            .split('; ')
            .find((item) => item.startsWith(`${name}=`));

        return pair ? decodeURIComponent(pair.split('=').slice(1).join('=')) : '';
    };

    const getCsrfHeaders = (withJsonContentType = false): Record<string, string> => {
        const headers: Record<string, string> = {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        };

        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content ?? '';
        const xsrfToken = getCookieValue('XSRF-TOKEN');

        if (csrfToken) {
            headers['X-CSRF-TOKEN'] = csrfToken;
        }

        if (xsrfToken) {
            headers['X-XSRF-TOKEN'] = xsrfToken;
        }

        if (withJsonContentType) {
            headers['Content-Type'] = 'application/json';
        }

        return headers;
    };

    const readErrorMessage = async (res: Response, fallback: string): Promise<string> => {
        const contentType = res.headers.get('content-type') ?? '';

        if (!contentType.includes('application/json')) {
            return fallback;
        }

        try {
            const json = (await res.json()) as { message?: string };
            return json.message || fallback;
        } catch {
            return fallback;
        }
    };

    const resetForm = () => {
        setKode('');
        setKeterangan('');
        setEditingId(null);
        setError('');
    };

    const fetchBrands = async () => {
        const res = await fetch('/admin/brands', {
            credentials: 'same-origin',
            headers: getCsrfHeaders(),
        });
        const json = await res.json();
        onBrandsChange(json.data);
    };

    const handleSave = async () => {
        if (!kode.trim()) {
            setError('Kode merek wajib diisi.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const isEditing = editingId !== null;
            const url = editingId ? `/admin/brands/${editingId}` : '/admin/brands';
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                credentials: 'same-origin',
                headers: getCsrfHeaders(true),
                body: JSON.stringify({ kode: kode.trim(), keterangan: keterangan.trim() }),
            });
            if (!res.ok) {
                const contentType = res.headers.get('content-type') ?? '';
                if (contentType.includes('application/json')) {
                    const json = await res.json();
                    const message = json.message || 'Gagal menyimpan merek.';
                    setError(message);
                    notifyError(message);
                } else {
                    const message = 'Sesi login tidak valid atau token keamanan tidak cocok. Muat ulang halaman.';
                    setError(message);
                    notifyError(message);
                }
                return;
            }
            await fetchBrands();
            resetForm();
            if (isEditing) {
                notifyUpdated('Merek');
            } else {
                notifyCreated('Merek');
            }
        } catch {
            setError('Terjadi kesalahan jaringan.');
            notifyError('Terjadi kesalahan jaringan.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (brand: BrandOption) => {
        setEditingId(brand.id);
        setKode(brand.kode);
        setKeterangan(brand.keterangan);
        setError('');
    };

    const handleDelete = async (id: number) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/admin/brands/${id}`, {
                method: 'DELETE',
                credentials: 'same-origin',
                headers: getCsrfHeaders(),
            });

            if (!res.ok) {
                const fallbackMessage =
                    res.status === 419
                        ? 'Sesi login tidak valid atau token keamanan tidak cocok. Muat ulang halaman.'
                        : 'Gagal menghapus merek.';
                const message = await readErrorMessage(res, fallbackMessage);
                setError(message);
                notifyError(message);
                return;
            }

            await fetchBrands();
            if (editingId === id) resetForm();
            notifyDeleted('Merek');
        } catch {
            const message = 'Gagal menghapus merek.';
            setError(message);
            notifyError(message);
        } finally {
            setLoading(false);
        }
    };

    const filteredBrands = brands.filter(
        (brand) =>
            brand.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (brand.keterangan?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
            <div className="bg-surface-container-lowest max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border border-black/5 p-5 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-headline text-on-surface text-lg font-black">Kelola Merek</h3>
                    <button type="button" onClick={onClose} className="text-on-surface-variant hover:bg-surface-container rounded-lg p-2">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Form */}
                <div className="mb-4 space-y-2">
                    <input
                        placeholder="Kode Merek (cth: GRD)"
                        value={kode}
                        onChange={(e) => setKode(e.target.value)}
                        className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-3 py-2.5 text-sm focus:outline-none"
                    />
                    <input
                        placeholder="Keterangan (opsional)"
                        value={keterangan}
                        onChange={(e) => setKeterangan(e.target.value)}
                        className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-3 py-2.5 text-sm focus:outline-none"
                    />
                    {error && <p className="text-xs font-medium text-red-500">{error}</p>}
                    <div className="flex gap-2">
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-surface-container text-on-surface rounded-xl px-4 py-2 text-sm font-semibold"
                            >
                                Batal
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-primary rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                        >
                            {editingId ? 'Perbarui' : 'Tambah'}
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                    <input
                        placeholder="Cari merek..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-surface-container focus:border-primary w-full pl-9 pr-3 py-2 rounded-xl border border-transparent text-sm focus:outline-none"
                    />
                </div>

                {/* List */}
                <div className="divide-surface-container-highest divide-y">
                    {filteredBrands.length === 0 ? (
                        <p className="text-on-surface-variant py-4 text-center text-sm italic">
                            {searchTerm ? 'Merek tidak ditemukan.' : 'Belum ada merek.'}
                        </p>
                    ) : (
                        filteredBrands.map((brand) => (
                            <div key={brand.id} className="flex items-center justify-between py-2.5">
                                <div>
                                    <p className="text-on-surface text-sm font-semibold">{brand.kode}</p>
                                    {brand.keterangan && (
                                        <p className="text-on-surface-variant text-xs">{brand.keterangan}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(brand)}
                                        className="text-on-surface-variant hover:bg-surface-container rounded-lg p-1.5"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(brand.id)}
                                        className="text-primary hover:bg-primary-fixed rounded-lg p-1.5"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
