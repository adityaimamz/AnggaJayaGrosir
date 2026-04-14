import AppModal from '@/Components/AppModal';
import CheckoutModal from '@/Components/CheckoutModal';
import PublicLayout from '@/Layouts/PublicLayout';
import { CartItem, ProductDetail as ProductDetailType } from '@/types/domain';
import { getBadgeClassName, resolveProductBadges } from '@/utils/productBadges';
import { Link } from '@inertiajs/react';
import {
    CheckCircle,
    ChevronRight,
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
import ImageLightbox from '@/Components/ImageLightbox';

interface ProductDetailProps {
    readonly product: ProductDetailType;
}

type CartItemWithMinOrder = CartItem & { minQuantity?: number };

export default function ProductDetail({ product }: ProductDetailProps) {
    const unitLabel = product.minOrder?.trim() || 'pack';
    const minQuantity = Math.max(1, Number(product.minOrderQty || 1));
    const badgeLabels = resolveProductBadges(product);
    const variantTypes = product.variantTypes ?? [];
    const [quantity, setQuantity] = useState(minQuantity);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
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
        return findVariantByOptions(selectedOptions) ?? product.variants?.[0];
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

    const addToCart = () => {
        const saved = localStorage.getItem('cart_items');
        const items: CartItemWithMinOrder[] = saved
            ? (JSON.parse(saved) as CartItemWithMinOrder[])
            : [];

        // Check if item exists
        const existingIdx = items.findIndex(
            (item) => item.id === product.id && item.variantLabel === variantLabel,
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
                        href="/products"
                        className="hover:text-primary transition-colors"
                    >
                        {product.category.name}
                    </Link>
                    <ChevronRight className="mx-2 h-4 w-4" />
                    <span className="text-on-surface">{product.name}</span>
                </motion.nav>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {/* Product Gallery */}
                    <div className="space-y-6 lg:col-span-7">
                        <motion.div
                            layoutId={`image-${product.id}`}
                            onClick={() => setShowLightbox(true)}
                            className="bg-surface-container-lowest group relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-2xl border border-black/5 shadow-sm"
                        >
                            <img
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                alt={product.name}
                                src={activeImage}
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                            <div className="absolute right-6 bottom-6 translate-y-2 rounded-2xl bg-white/20 p-3 text-white opacity-0 blur-sm backdrop-blur-md transition-all group-hover:translate-y-0 group-hover:opacity-100 group-hover:blur-0">
                                <Search className="h-6 w-6" />
                            </div>
                        </motion.div>
                        <div className="grid grid-cols-4 gap-4">
                            {images.filter(Boolean).map((img, idx) => (
                                <motion.button
                                    key={img}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 + idx * 0.05, duration: 0.3 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveImage(img)}
                                    className={`bg-surface-container-lowest aspect-square overflow-hidden rounded-xl border-2 transition-all ${activeImage === img ? 'border-primary' : 'hover:border-primary/50 border-transparent'}`}
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

                    {/* Product Info */}
                    <div className="flex flex-col lg:col-span-5">
                        <motion.h1
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="font-headline text-on-surface mb-2 text-4xl leading-tight font-extrabold tracking-tight md:text-5xl"
                        >
                            {product.name}
                        </motion.h1>

                        <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2">
                            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                                <span className="font-semibold text-on-surface">Kategori:</span>
                                <Link href={`/products?category=${product.category?.slug}`} className="text-primary hover:underline font-medium">
                                    {product.category?.name}
                                </Link>
                            </div>
                            {product.brand && (
                                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                                    <span className="font-semibold text-on-surface">Merek:</span>
                                    <Link href={`/products?brand=${product.brand.kode}`} className="text-primary hover:underline font-medium">
                                        {product.brand.kode}
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="mb-8 flex items-center gap-3">
                            {badgeLabels.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                    {badgeLabels.map((label) => (
                                        <span
                                            key={`${product.id}-${label.toLowerCase()}`}
                                            className={`rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase ${getBadgeClassName(label)}`}
                                        >
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="text-tertiary flex items-center font-bold">
                                <CheckCircle className="mr-1 h-4 w-4 fill-current" />
                                <span className="text-sm">
                                    Stok Tersedia (Grosir)
                                </span>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.4 }}
                            className="bg-surface-container-low mb-10 rounded-2xl p-6"
                        >
                            <span className="text-on-surface-variant mb-1 block text-sm font-semibold tracking-widest uppercase">
                                Harga per {unitLabel}
                            </span>
                            <div className="text-primary font-headline text-4xl font-black">
                                Rp {selectedPrice.toLocaleString('id-ID')}
                            </div>
                            <div className="text-on-surface-variant mt-1 text-sm font-semibold">
                                {product.minPrice === product.maxPrice
                                    ? 'Harga tetap untuk semua variasi'
                                    : `Rentang harga: Rp ${Number(product.minPrice).toLocaleString('id-ID')} – Rp ${Number(product.maxPrice).toLocaleString('id-ID')}`}
                            </div>
                            <p className="text-on-surface-variant mt-2 text-sm italic">
                                Minimal order: {minQuantity} {unitLabel}
                            </p>
                        </motion.div>

                        <div className="space-y-8">
                            {product.variantTypes?.map((typeName) => {
                                const availableOptions = Array.from(
                                    new Set(
                                        product.variants?.map((v) => v.options[typeName]).filter(Boolean)
                                    )
                                );

                                if (availableOptions.length === 0) return null;

                                return (
                                    <div key={typeName} className="mb-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <span className="text-on-surface text-lg font-bold">
                                                Pilih {typeName}
                                            </span>
                                            {typeName.toLowerCase() === 'ukuran' && product.sizeGuide && product.sizeGuide.columns.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowSizeGuide(true)}
                                                    className="text-primary text-sm font-bold underline inline-flex items-center gap-1"
                                                >
                                                    <Ruler className="h-3.5 w-3.5" />
                                                    Panduan Ukuran
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {availableOptions.map((opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => handleOptionSelect(typeName, opt)}
                                                    className={`flex min-w-[64px] items-center justify-center rounded-xl border-2 px-3 py-2 text-lg font-bold transition-all ${selectedOptions[typeName] === opt ? 'border-primary bg-primary-fixed text-on-primary-fixed shadow-sm' : 'border-surface-container-highest text-on-surface hover:border-primary'}`}
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
                                <span className="text-on-surface mb-4 block text-lg font-bold">
                                    Jumlah order ({unitLabel})
                                </span>
                                <div className="bg-surface-container-highest flex w-max items-center rounded-xl p-1">
                                    <button
                                        onClick={() =>
                                            setQuantity(
                                                Math.max(minQuantity, quantity - 1),
                                            )
                                        }
                                        className="text-on-surface hover:bg-surface-container-low flex h-12 w-12 items-center justify-center rounded-lg transition-colors"
                                    >
                                        <Minus className="h-5 w-5" />
                                    </button>
                                    <span className="font-headline w-16 text-center text-xl font-bold">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setQuantity(quantity + 1)
                                        }
                                        className="text-on-surface hover:bg-surface-container-low flex h-12 w-12 items-center justify-center rounded-lg transition-colors"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </button>
                                </div>
                                <p className="text-on-surface-variant mt-2 text-sm">
                                    Minimal pembelian {minQuantity} {unitLabel}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4 pt-4">
                                <motion.button
                                    onClick={addToCart}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="bg-primary flex h-16 w-full items-center justify-center gap-3 rounded-xl text-xl font-bold text-white shadow-lg transition-all hover:brightness-110"
                                >
                                    <ShoppingBag className="h-6 w-6" />
                                    TAMBAH KE KERANJANG
                                </motion.button>
                                <motion.button
                                    type="button"
                                    onClick={orderViaWhatsapp}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="bg-tertiary flex h-16 w-full items-center justify-center gap-3 rounded-xl text-xl font-bold text-white shadow-lg transition-all hover:brightness-110"
                                >
                                    <MessageCircle className="h-6 w-6" />
                                    PESAN VIA WHATSAPP
                                </motion.button>
                            </div>
                        </div>

                        {/* Product Features Bento */}
                        <div className="mt-12 grid grid-cols-2 gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25, duration: 0.4 }}
                                className="bg-surface-container-lowest rounded-xl border border-black/5 p-4"
                            >
                                <Star className="text-secondary mb-2 h-6 w-6 fill-current" />
                                <h4 className="text-sm font-bold">
                                    Bahan Premium
                                </h4>
                                <p className="text-on-surface-variant text-xs">
                                    Bahan lembut dan tidak gatal.
                                </p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35, duration: 0.4 }}
                                className="bg-surface-container-lowest rounded-xl border border-black/5 p-4"
                            >
                                <CheckCircle className="text-secondary mb-2 h-6 w-6 fill-current" />
                                <h4 className="text-sm font-bold">
                                    Grosir Ready
                                </h4>
                                <p className="text-on-surface-variant text-xs">
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
                    className="mt-32 grid grid-cols-1 gap-12 lg:grid-cols-12"
                >
                    <div className={product.features && product.features.length > 0 ? "lg:col-span-4" : "lg:col-span-12"}>
                        <h2 className="font-headline mb-6 text-3xl font-extrabold">
                            Detail Produk
                        </h2>
                        <p className="text-on-surface-variant text-lg leading-relaxed whitespace-pre-line">
                            {product.description}
                        </p>
                    </div>
                    {product.features && product.features.length > 0 && (
                        <div className="bg-surface-container-low rounded-3xl p-10 lg:col-span-8">
                            <ul className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
                                {product.features.map((feature, idx) => (
                                    <li key={feature} className="flex gap-4">
                                        <span className="text-primary text-xl font-black">
                                            {(idx + 1).toString().padStart(2, '0')}
                                        </span>
                                        <div>
                                            <strong className="text-on-surface mb-1 block text-lg">
                                                {feature}
                                            </strong>
                                            {product.featureDescriptions?.[idx] && (
                                                <span className="text-on-surface-variant text-sm whitespace-pre-line">
                                                    {product.featureDescriptions[idx]}
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
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
                    <button
                        type="button"
                        onClick={() => setShowAddedModal(false)}
                        className="bg-surface-container rounded-xl px-4 py-2 text-sm font-semibold"
                    >
                        Lanjut Belanja
                    </button>
                    <Link
                        href="/cart"
                        className="bg-primary rounded-xl px-4 py-2 text-sm font-bold text-white"
                    >
                        Lihat Keranjang
                    </Link>
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
                                <h3 className="font-headline text-on-surface text-lg font-black">Panduan Ukuran</h3>
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
                                    <tr className="border-b-2 border-primary/20">
                                        <th className="text-primary py-3 pr-4 text-left text-xs font-bold tracking-wider uppercase">Ukuran</th>
                                        {product.sizeGuide.columns.map((col) => (
                                            <th key={col} className="text-on-surface-variant py-3 px-3 text-left text-xs font-bold tracking-wider uppercase">{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {product.sizeGuide.rows.map((row, i) => (
                                        <tr key={i} className="border-b border-surface-container-highest hover:bg-surface-container-low transition-colors">
                                            <td className="text-on-surface py-3 pr-4 font-bold">{row.label}</td>
                                            {row.values.map((val, vi) => (
                                                <td key={vi} className="text-on-surface-variant py-3 px-3">{val || '-'}</td>
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
