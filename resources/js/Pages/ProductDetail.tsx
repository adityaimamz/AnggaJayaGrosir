import AppModal from '@/Components/AppModal';
import CheckoutModal from '@/Components/CheckoutModal';
import ImageLightbox from '@/Components/ImageLightbox';
import PublicLayout from '@/Layouts/PublicLayout';
import {
    CartItem,
    ProductDetail as ProductDetailType,
    WishlistItem,
} from '@/types/domain';
import { getBadgeClassName, resolveProductBadges } from '@/utils/productBadges';
import { Link } from '@inertiajs/react';
import {
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Heart,
    MessageCircle,
    Minus,
    Plus,
    Ruler,
    Search,
    ShoppingBag,
    Star,
    X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';

interface ProductDetailProps {
    readonly product: ProductDetailType;
}

type CartItemWithMinOrder = CartItem & { minQuantity?: number };

function readWishlistItems(): WishlistItem[] {
    const saved = localStorage.getItem('wishlist_items');

    return saved ? (JSON.parse(saved) as WishlistItem[]) : [];
}

export default function ProductDetail({ product }: ProductDetailProps) {
    const unitLabel = product.minOrder?.trim() || 'pack';
    const minQuantity = Math.max(1, Number(product.minOrderQty || 1));
    const badgeLabels = resolveProductBadges(product);
    const variantTypes = useMemo(
        () => product.variantTypes ?? [],
        [product.variantTypes],
    );
    const [quantity, setQuantity] = useState(minQuantity);
    const [selectedOptions, setSelectedOptions] = useState<
        Record<string, string>
    >(() => {
        return product.variants?.[0]?.options || {};
    });

    const findVariantByOptions = (options: Record<string, string>) => {
        return product.variants?.find((variant) =>
            variantTypes.every(
                (typeName) => variant.options[typeName] === options[typeName],
            ),
        );
    };

    const selectedVariant = useMemo(() => {
        const exactVariant = product.variants?.find((variant) =>
            variantTypes.every(
                (typeName) =>
                    variant.options[typeName] === selectedOptions[typeName],
            ),
        );

        return exactVariant ?? product.variants?.[0];
    }, [product.variants, selectedOptions, variantTypes]);

    const selectedPrice = Number(selectedVariant?.price ?? product.minPrice);
    const variantLabel =
        variantTypes
            .map((typeName) => selectedVariant?.options[typeName] ?? '')
            .filter(Boolean)
            .join(' / ') || 'Default';

    const handleOptionSelect = (typeName: string, option: string) => {
        const nextOptions = { ...selectedOptions, [typeName]: option };
        const exactMatch = findVariantByOptions(nextOptions);

        if (exactMatch) {
            setSelectedOptions(exactMatch.options);
            return;
        }

        const fallbackVariant = product.variants?.find(
            (variant) => variant.options[typeName] === option,
        );

        if (fallbackVariant) {
            setSelectedOptions(fallbackVariant.options);
            return;
        }

        setSelectedOptions(nextOptions);
    };

    const images = useMemo(() => {
        const source = Array.isArray(product.images)
            ? product.images
            : [product.image ?? ''];

        const normalized = source.filter(
            (image): image is string =>
                typeof image === 'string' && image !== '',
        );

        return normalized.length > 0
            ? normalized
            : ['https://placehold.co/800x1000?text=No+Image'];
    }, [product.image, product.images]);

    const [activeImage, setActiveImage] = useState<string>(images[0]);
    const [showAddedModal, setShowAddedModal] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [showLightbox, setShowLightbox] = useState(false);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [showDescription, setShowDescription] = useState(true);
    const [isWishlisted, setIsWishlisted] = useState(() =>
        readWishlistItems().some((item) => item.id === product.id),
    );

    const addToCart = () => {
        const saved = localStorage.getItem('cart_items');
        const items: CartItemWithMinOrder[] = saved
            ? (JSON.parse(saved) as CartItemWithMinOrder[])
            : [];

        // Check if item exists
        const existingIdx = items.findIndex(
            (item) =>
                item.id === product.id && item.variantLabel === variantLabel,
        );

        if (existingIdx >= 0) {
            const currentMinQuantity = Number(
                items[existingIdx].minQuantity ?? 1,
            );

            items[existingIdx].minQuantity = Math.max(
                minQuantity,
                currentMinQuantity,
            );
            items[existingIdx].quantity += quantity;
        } else {
            items.push({
                id: product.id,
                name: product.name,
                variantLabel: variantLabel,
                pack: unitLabel,
                minQuantity: minQuantity,
                price: selectedPrice,
                quantity: quantity,
                image: product.image,
            });
        }

        localStorage.setItem('cart_items', JSON.stringify(items));
        globalThis.dispatchEvent(new Event('cart:updated'));
        setShowAddedModal(true);
    };

    const toggleWishlist = () => {
        const items = readWishlistItems();
        const exists = items.some((item) => item.id === product.id);
        const nextItems = exists
            ? items.filter((item) => item.id !== product.id)
            : [
                  ...items,
                  {
                      id: product.id,
                      name: product.name,
                      slug: product.slug,
                      image: product.image,
                      minPrice: Number(product.minPrice),
                      maxPrice: Number(product.maxPrice),
                      categoryName: product.category.name,
                  },
              ];

        localStorage.setItem('wishlist_items', JSON.stringify(nextItems));
        setIsWishlisted(!exists);
        globalThis.dispatchEvent(new Event('wishlist:updated'));
    };

    const openCheckoutModal = () => {
        setShowCheckoutModal(true);
    };

    const closeCheckoutModal = () => {
        setShowCheckoutModal(false);
    };

    const orderViaWhatsapp = () => {
        openCheckoutModal();
    };

    return (
        <PublicLayout>
            <div className="mx-auto max-w-7xl px-6 pt-28 pb-20">
                <motion.nav
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="text-on-surface-variant mb-8 flex items-center text-sm font-medium tracking-wider uppercase"
                >
                    <Link
                        href="/"
                        className="hover:text-primary transition-colors"
                    >
                        Beranda
                    </Link>
                    <ChevronRight className="mx-2 h-4 w-4" />
                    <Link
                        href={`/products?category=${product.category.slug}`}
                        className="hover:text-primary transition-colors"
                    >
                        {product.category.name}
                    </Link>
                    <ChevronRight className="mx-2 h-4 w-4" />
                    <span className="text-on-surface">{product.name}</span>
                </motion.nav>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                    {/* Product Gallery */}
                    <div className="lg:col-span-6">
                        <div className="relative lg:pl-24">
                            <motion.div
                                layoutId={`image-${product.id}`}
                                onClick={() => setShowLightbox(true)}
                                className="bg-surface-container-lowest group relative aspect-square min-w-0 cursor-zoom-in overflow-hidden rounded-2xl border border-black/5 shadow-sm"
                            >
                                <img
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    alt={product.name}
                                    src={activeImage}
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                                <div className="group-hover:blur-0 absolute right-6 bottom-6 translate-y-2 rounded-2xl bg-white/20 p-3 text-white opacity-0 blur-sm backdrop-blur-md transition-all group-hover:translate-y-0 group-hover:opacity-100">
                                    <Search className="h-6 w-6" />
                                </div>
                            </motion.div>

                            <div className="mt-4 flex gap-3 overflow-x-auto pb-1 lg:absolute lg:inset-y-0 lg:left-0 lg:mt-0 lg:w-20 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pr-1 lg:pb-0">
                                {images.filter(Boolean).map((img, idx) => (
                                    <motion.button
                                        key={`${img}-${idx}`}
                                        type="button"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            delay: 0.1 + idx * 0.05,
                                            duration: 0.3,
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setActiveImage(img)}
                                        className={`bg-surface-container-lowest h-20 w-20 flex-none overflow-hidden rounded-xl border-2 shadow-sm transition-all ${activeImage === img ? 'border-primary' : 'hover:border-primary/50 border-transparent'}`}
                                    >
                                        <img
                                            className="h-full w-full object-cover"
                                            alt={`${product.name} view ${idx + 1}`}
                                            src={img}
                                            referrerPolicy="no-referrer"
                                        />
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col lg:col-span-6 lg:max-w-[500px] lg:pl-2">
                        <motion.h1
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="font-headline text-on-surface mb-2 text-xl leading-tight font-extrabold tracking-tight md:text-2xl"
                        >
                            {product.name}
                        </motion.h1>

                        <div className="mb-5 flex flex-wrap gap-x-5 gap-y-2">
                            <div className="text-on-surface-variant flex items-center gap-2 text-xs">
                                <span className="text-on-surface font-semibold">
                                    Kategori:
                                </span>
                                <Link
                                    href={`/products?category=${product.category?.slug}`}
                                    className="text-primary font-medium hover:underline"
                                >
                                    {product.category?.name}
                                </Link>
                            </div>
                            {product.brand && (
                                <div className="text-on-surface-variant flex items-center gap-2 text-xs">
                                    <span className="text-on-surface font-semibold">
                                        Merek:
                                    </span>
                                    <Link
                                        href={`/products?brand=${product.brand.kode}`}
                                        className="text-primary font-medium hover:underline"
                                    >
                                        {product.brand.kode}
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="mb-6 flex items-center gap-2.5">
                            {badgeLabels.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {badgeLabels.map((label) => (
                                        <span
                                            key={`${product.id}-${label.toLowerCase()}`}
                                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase ${getBadgeClassName(label)}`}
                                        >
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="text-tertiary flex items-center font-bold">
                                <CheckCircle className="mr-1 h-3.5 w-3.5 fill-current" />
                                <span className="text-xs">
                                    Stok Tersedia (Grosir)
                                </span>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.4 }}
                            className="bg-surface-container-low mb-7 rounded-xl p-4"
                        >
                            <span className="text-on-surface-variant mb-1 block text-xs font-semibold tracking-widest uppercase">
                                Harga per {unitLabel}
                            </span>
                            <div className="text-primary font-headline text-2xl font-black">
                                Rp {selectedPrice.toLocaleString('id-ID')}
                            </div>
                            <div className="text-on-surface-variant mt-1 text-xs font-semibold">
                                {product.minPrice === product.maxPrice
                                    ? 'Harga tetap untuk semua variasi'
                                    : `Rentang harga: Rp ${Number(product.minPrice).toLocaleString('id-ID')} – Rp ${Number(product.maxPrice).toLocaleString('id-ID')}`}
                            </div>
                            <p className="text-on-surface-variant mt-2 text-xs italic">
                                Minimal order: {minQuantity} {unitLabel}
                            </p>
                        </motion.div>

                        <div className="space-y-6">
                            {product.variantTypes?.map((typeName) => {
                                const availableOptions = Array.from(
                                    new Set(
                                        product.variants
                                            ?.map((v) => v.options[typeName])
                                            .filter(Boolean),
                                    ),
                                );

                                if (availableOptions.length === 0) return null;

                                return (
                                    <div key={typeName} className="mb-5">
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className="text-on-surface text-base font-bold">
                                                Pilih {typeName}
                                            </span>
                                            {typeName.toLowerCase() ===
                                                'ukuran' &&
                                                product.sizeGuide &&
                                                product.sizeGuide.columns
                                                    .length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowSizeGuide(
                                                                true,
                                                            )
                                                        }
                                                        className="text-primary inline-flex items-center gap-1 text-xs font-bold underline"
                                                    >
                                                        <Ruler className="h-3 w-3" />
                                                        Panduan Ukuran
                                                    </button>
                                                )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {availableOptions.map((opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() =>
                                                        handleOptionSelect(
                                                            typeName,
                                                            opt,
                                                        )
                                                    }
                                                    className={`flex min-w-[52px] items-center justify-center rounded-lg border-2 px-2.5 py-1.5 text-base font-bold transition-all ${selectedOptions[typeName] === opt ? 'border-primary bg-primary-fixed text-on-primary-fixed shadow-sm' : 'border-surface-container-highest text-on-surface hover:border-primary'}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Quantity */}
                            <div>
                                <span className="text-on-surface mb-3 block text-base font-bold">
                                    Jumlah order ({unitLabel})
                                </span>
                                <div className="bg-surface-container-highest flex w-max items-center rounded-lg p-1">
                                    <button
                                        onClick={() =>
                                            setQuantity(
                                                Math.max(
                                                    minQuantity,
                                                    quantity - 1,
                                                ),
                                            )
                                        }
                                        className="text-on-surface hover:bg-surface-container-low flex h-10 w-10 items-center justify-center rounded-md transition-colors"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="font-headline w-12 text-center text-lg font-bold">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setQuantity(quantity + 1)
                                        }
                                        className="text-on-surface hover:bg-surface-container-low flex h-10 w-10 items-center justify-center rounded-md transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <p className="text-on-surface-variant mt-2 text-xs">
                                    Minimal pembelian {minQuantity} {unitLabel}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-2">
                                <motion.button
                                    type="button"
                                    onClick={toggleWishlist}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl border text-sm font-bold transition-all ${
                                        isWishlisted
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-surface-container-highest bg-surface-container-lowest text-on-surface hover:border-primary hover:text-primary'
                                    }`}
                                >
                                    <Heart
                                        className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`}
                                    />
                                    {isWishlisted
                                        ? 'TERSIMPAN DI WISHLIST'
                                        : 'TAMBAH KE WISHLIST'}
                                </motion.button>
                                <motion.button
                                    onClick={addToCart}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="bg-primary flex h-14 w-full items-center justify-center gap-2 rounded-xl text-base font-bold text-white shadow-lg transition-all hover:brightness-110"
                                >
                                    <ShoppingBag className="h-5 w-5" />
                                    TAMBAH KE KERANJANG
                                </motion.button>
                                <motion.button
                                    type="button"
                                    onClick={orderViaWhatsapp}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="bg-tertiary flex h-14 w-full items-center justify-center gap-2 rounded-xl text-base font-bold text-white shadow-lg transition-all hover:brightness-110"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    PESAN VIA WHATSAPP
                                </motion.button>
                            </div>
                        </div>

                        {/* Product Features Bento */}
                        <div className="mt-8 grid grid-cols-2 gap-3">
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25, duration: 0.4 }}
                                className="bg-surface-container-lowest rounded-xl border border-black/5 p-3"
                            >
                                <Star className="text-secondary mb-1.5 h-5 w-5 fill-current" />
                                <h4 className="text-xs font-bold">
                                    Bahan Premium
                                </h4>
                                <p className="text-on-surface-variant text-[11px] leading-4">
                                    Bahan lembut dan tidak gatal.
                                </p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35, duration: 0.4 }}
                                className="bg-surface-container-lowest rounded-xl border border-black/5 p-3"
                            >
                                <CheckCircle className="text-secondary mb-1.5 h-5 w-5 fill-current" />
                                <h4 className="text-xs font-bold">
                                    Grosir Ready
                                </h4>
                                <p className="text-on-surface-variant text-[11px] leading-4">
                                    Stok aman untuk partai besar.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Description Section */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mt-20 border-t border-black/10"
                >
                    <button
                        type="button"
                        aria-expanded={showDescription}
                        onClick={() =>
                            setShowDescription((isVisible) => !isVisible)
                        }
                        className="text-on-surface flex w-full items-center justify-between border-b border-black/10 py-6 text-left"
                    >
                        <span className="font-headline text-sm font-extrabold tracking-wide uppercase">
                            Detail Produk
                        </span>
                        <ChevronDown
                            className={`h-5 w-5 transition-transform duration-300 ${showDescription ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {showDescription && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                            className="max-w-5xl py-7"
                        >
                            <p className="text-on-surface-variant text-sm leading-7 whitespace-pre-line md:text-[15px]">
                                {product.description}
                            </p>

                            {product.features &&
                                product.features.length > 0 && (
                                    <div className="border-surface-container-highest mt-8 border-t pt-6">
                                        <h3 className="font-headline text-on-surface mb-4 text-xs font-extrabold tracking-wide uppercase">
                                            Spesifikasi Produk
                                        </h3>
                                        <ul className="grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-2">
                                            {product.features.map(
                                                (feature, idx) => (
                                                    <li
                                                        key={feature}
                                                        className="flex gap-3"
                                                    >
                                                        <span className="text-primary mt-0.5 text-xs font-black">
                                                            {(idx + 1)
                                                                .toString()
                                                                .padStart(
                                                                    2,
                                                                    '0',
                                                                )}
                                                        </span>
                                                        <div>
                                                            <strong className="text-on-surface block text-sm font-bold">
                                                                {feature}
                                                            </strong>
                                                            {product
                                                                .featureDescriptions?.[
                                                                idx
                                                            ] && (
                                                                <span className="text-on-surface-variant mt-1 block text-sm leading-6 whitespace-pre-line">
                                                                    {
                                                                        product
                                                                            .featureDescriptions[
                                                                            idx
                                                                        ]
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                )}
                        </motion.div>
                    )}
                </motion.section>
            </div>

            <AppModal
                open={showAddedModal}
                title="Keranjang Diperbarui"
                description="Produk berhasil ditambahkan ke keranjang belanja."
                onClose={() => setShowAddedModal(false)}
            >
                <div className="mt-4 flex items-center justify-end gap-2">
                    <Link
                        type="button"
                        href="/cart"
                        className="bg-surface-container rounded-xl px-4 py-2 text-sm font-semibold"
                    >
                        Lihat Keranjang
                    </Link>
                    <button
                        onClick={() => setShowAddedModal(false)}
                        className="bg-primary rounded-xl px-4 py-2 text-sm font-bold text-white"
                    >
                        Lanjut Belanja
                    </button>
                </div>
            </AppModal>

            <CheckoutModal
                open={showCheckoutModal}
                onClose={closeCheckoutModal}
                totalAmount={selectedPrice * quantity}
                items={[
                    {
                        id: product.id,
                        name: product.name,
                        size: variantLabel,
                        pack: unitLabel,
                        price: selectedPrice,
                        quantity: quantity,
                    },
                ]}
            />

            <ImageLightbox
                isOpen={showLightbox}
                src={activeImage}
                alt={product.name}
                onClose={() => setShowLightbox(false)}
            />

            {/* Size Guide Modal */}
            {showSizeGuide && product.sizeGuide && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-surface-container-lowest max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-black/5 p-6 shadow-2xl"
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Ruler className="text-primary h-5 w-5" />
                                <h3 className="font-headline text-on-surface text-lg font-black">
                                    Panduan Ukuran
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSizeGuide(false)}
                                className="text-on-surface-variant hover:bg-surface-container rounded-lg p-2 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-primary/20 border-b-2">
                                        <th className="text-primary py-3 pr-4 text-left text-xs font-bold tracking-wider uppercase">
                                            Ukuran
                                        </th>
                                        {product.sizeGuide.columns.map(
                                            (col) => (
                                                <th
                                                    key={col}
                                                    className="text-on-surface-variant px-3 py-3 text-left text-xs font-bold tracking-wider uppercase"
                                                >
                                                    {col}
                                                </th>
                                            ),
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {product.sizeGuide.rows.map((row, i) => (
                                        <tr
                                            key={i}
                                            className="border-surface-container-highest hover:bg-surface-container-low border-b transition-colors"
                                        >
                                            <td className="text-on-surface py-3 pr-4 font-bold">
                                                {row.label}
                                            </td>
                                            {row.values.map((val, vi) => (
                                                <td
                                                    key={vi}
                                                    className="text-on-surface-variant px-3 py-3"
                                                >
                                                    {val || '-'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-on-surface-variant mt-4 text-center text-xs italic">
                            * Ukuran dapat sedikit berbeda tergantung produksi
                        </p>
                    </motion.div>
                </div>
            )}
        </PublicLayout>
    );
}
