export interface CategorySummary {
    id: number;
    name: string;
    slug: string;
}

export interface ProductVariant {
    options: Record<string, string>;
    price: number;
    stock: number;
}

export interface AdminCategoryRow extends CategorySummary {
    productCount: number;
}

export interface ProductSummary {
    id: number;
    name: string;
    slug: string;
    variantTypes: string[];
    variants: ProductVariant[];
    minPrice: number;
    maxPrice: number;
    image: string | null;
    images: string[];
    minOrder: string | null;
    minOrderQty: number;
    badge: string | null;
    isNew: boolean;
    isBestSeller: boolean;
    category: CategorySummary;
    brand?: { kode: string; keterangan: string } | null;
}

export interface SizeGuide {
    columns: string[];
    rows: { label: string; values: string[] }[];
}

export interface ProductDetail extends ProductSummary {
    description: string | null;
    features: string[];
    featureDescriptions: string[];
    sizeGuide?: SizeGuide | null;
    stock?: number; // fallback for backwards comp during refactor (though not used)
    totalStock: number;
}

export interface CartItem {
    id: number;
    name: string;
    variantLabel: string;
    pack: string;
    minQuantity?: number;
    price: number;
    quantity: number;
    image: string | null;
}

export interface AdminProductRow {
    id: number;
    name: string;
    slug: string;
    variantTypes: string[];
    variants: ProductVariant[];
    minPrice: number;
    maxPrice: number;
    totalStock: number;
    stock?: number;
    features?: string[];
    featureDescriptions?: string[];
    minOrder?: string | null;
    minOrderQty?: number;
    badge?: string | null;
    description?: string | null;
    image: string | null;
    images: string[];
    imagePaths?: string[];
    isNew?: boolean;
    isBestSeller?: boolean;
    isActive?: boolean;
    brandId?: number | null;
    brandKode?: string | null;
    sizeGuide?: SizeGuide | null;
    category: CategorySummary;
}

export interface AdminCategoryOption {
    id: number;
    name: string;
}

export interface BrandOption {
    id: number;
    kode: string;
    keterangan: string;
}

export interface WhatsappOrderItem {
    id: number;
    name: string;
    size: string; // Left as size in WhatsappOrderItem? Let's alter to variantLabel later if needed or keep size alias for label. Let's make it size in WhatsappOrderItem for now to avoid altering the DB column if we only map to 'size' in the request. Actually it's just a label text sent to WA. Let's make it `size: string;` for WhatsappOrderItem just so TS is happy without DB changes for WA Orders
    pack: string;
    price: number;
    quantity: number;
    subtotal: number;
}

export interface AdminWhatsappOrderRow {
    id: number;
    orderCode: string;
    customerName: string;
    address: string;
    expedition: string;
    totalAmount: number;
    status: string;
    items: WhatsappOrderItem[];
    totalItems: number;
    createdAt: string | null;
}

export interface PaginatorLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface LengthAwarePaginated<T> {
    data: T[];
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginatorLink[];
}

export interface Banner {
    id: number;
    image_url: string;
    sort_order: number;
    is_active: boolean;
}
