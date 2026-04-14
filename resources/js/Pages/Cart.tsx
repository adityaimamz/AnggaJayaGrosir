import CheckoutModal from '@/Components/CheckoutModal';
import PublicLayout from '@/Layouts/PublicLayout';
import { CartItem } from '@/types/domain';
import { Link } from '@inertiajs/react';
import { MessageCircle, Minus, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useState } from 'react';

type CartItemWithMinOrder = CartItem & { minQuantity?: number };

function resolveMinQuantity(item: CartItemWithMinOrder): number {
    return Math.max(1, Number(item.minQuantity ?? 1));
}

export default function Cart() {
    const [items, setItems] = useState<CartItemWithMinOrder[]>(() => {
        const saved = localStorage.getItem('cart_items');
        const parsedItems = saved
            ? (JSON.parse(saved) as CartItemWithMinOrder[])
            : [];

        return parsedItems.map((item) => {
            const minQuantity = resolveMinQuantity(item);

            return {
                ...item,
                minQuantity,
                quantity: Math.max(minQuantity, Number(item.quantity || 0)),
            };
        });
    });
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);

    React.useEffect(() => {
        localStorage.setItem('cart_items', JSON.stringify(items));
        globalThis.dispatchEvent(new Event('cart:updated'));
    }, [items]);

    const updateQuantity = (id: number, delta: number) => {
        setItems(
            items.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          minQuantity: resolveMinQuantity(item),
                          quantity: Math.max(
                              resolveMinQuantity(item),
                              item.quantity + delta,
                          ),
                      }
                    : item,
            ),
        );
    };

    const removeItem = (id: number) => {
        setItems(items.filter((item) => item.id !== id));
    };

    const subtotal = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
    );
    const total = subtotal;

    const openCheckoutModal = () => {
        if (items.length === 0) {
            return;
        }
        setShowCheckoutModal(true);
    };

    const closeCheckoutModal = () => {
        setShowCheckoutModal(false);
    };

    return (
        <PublicLayout>
            <div className="mx-auto max-w-7xl px-6 pt-28 pb-20 md:px-12 lg:px-24">
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-12"
                >
                    <h1 className="font-headline text-on-surface mb-2 text-4xl font-extrabold tracking-tight md:text-5xl">
                        Keranjang Belanja
                    </h1>
                    <p className="text-on-surface-variant text-lg font-medium">
                        Anda memiliki {items.length} item grosir siap dipesan.
                    </p>
                </motion.header>

                <div className="flex flex-col gap-12 lg:flex-row">
                    <div className="flex-grow space-y-8">
                        <AnimatePresence>
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    className="bg-surface-container-lowest group hover:bg-surface-container-low flex flex-col items-center gap-6 rounded-2xl border border-black/5 p-6 transition-all sm:flex-row"
                                >
                                    <div className="bg-surface-container h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl">
                                        <img
                                            alt={item.name}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            src={item.image ?? ''}
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>
                                    <div className="w-full flex-grow">
                                        <div className="mb-2 flex items-start justify-between">
                                            <h3 className="font-headline text-on-surface text-xl font-bold">
                                                {item.name}
                                            </h3>
                                            <button
                                                onClick={() =>
                                                    removeItem(item.id)
                                                }
                                                className="text-on-surface-variant/40 hover:text-primary p-2 transition-colors"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <p className="text-secondary mb-4 font-semibold">
                                            Varian: {item.variantLabel} • Pack:{' '}
                                            {item.pack}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="bg-surface-container-low flex items-center rounded-xl p-1">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            -1,
                                                        )
                                                    }
                                                    className="hover:bg-surface-container-high flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-10 px-4 text-center text-lg font-bold">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            1,
                                                        )
                                                    }
                                                    className="hover:bg-surface-container-high flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <p className="text-primary text-xl font-bold">
                                                Rp{' '}
                                                {(
                                                    item.price * item.quantity
                                                ).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {items.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, type: 'spring' }}
                                className="bg-surface-container-low rounded-3xl py-20 text-center"
                            >
                                <p className="text-on-surface-variant mb-6 text-2xl font-bold">
                                    Keranjang Anda kosong
                                </p>
                                <Link
                                    href="/"
                                    className="bg-primary inline-block rounded-xl px-8 py-4 font-bold text-white transition-all hover:brightness-110"
                                >
                                    Mulai Belanja
                                </Link>
                            </motion.div>
                        )}
                    </div>

                    <motion.aside
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="lg:w-[400px]"
                    >
                        <div className="bg-surface-container-lowest sticky top-28 rounded-3xl border border-black/5 p-8 shadow-[0_-12px_40px_rgba(28,27,27,0.06)]">
                            <h2 className="font-headline text-on-surface mb-8 text-2xl font-black">
                                Ringkasan Pesanan
                            </h2>
                            <div className="mb-8 space-y-4">
                                <div className="text-on-surface-variant flex justify-between text-lg">
                                    <span>Subtotal ({items.length} Item)</span>
                                    <span className="font-medium text-on-surface font-bold">
                                        Rp {subtotal.toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <div className="border-surface-container flex items-end justify-between border-t pt-4">
                                    <span className="text-xl font-bold">
                                        Total Harga
                                    </span>
                                    <div className="text-right">
                                        <p className="text-primary text-3xl font-black">
                                            Rp {total.toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-secondary mt-1 text-sm font-bold tracking-widest uppercase">
                                            Harga Member Grosir
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                type="button"
                                onClick={openCheckoutModal}
                                disabled={items.length === 0}
                                whileHover={items.length > 0 ? { scale: 1.02 } : {}}
                                whileTap={items.length > 0 ? { scale: 0.97 } : {}}
                                className="bg-tertiary mb-4 flex w-full flex-col items-center justify-center gap-1 rounded-2xl px-6 py-5 text-white shadow-lg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100"
                            >
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="h-6 w-6 fill-current" />
                                    <span className="text-lg font-black">
                                        PESAN SEMUA VIA WHATSAPP
                                    </span>
                                </div>
                                <span className="text-xs font-medium opacity-80">
                                    Respon Cepat: Sen-Sab 08:00 - 17:00
                                </span>
                            </motion.button>

                            <div className="text-on-surface-variant/40 flex items-center justify-center gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                <p className="text-center text-sm font-medium">
                                    Koneksi aman melalui WhatsApp Business.
                                </p>
                            </div>
                        </div>
                    </motion.aside>
                </div>
            </div>

            <CheckoutModal
                open={showCheckoutModal}
                onClose={closeCheckoutModal}
                totalAmount={total}
                items={items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    size: item.variantLabel,
                    pack: item.pack,
                    price: item.price,
                    quantity: item.quantity,
                }))}
            />
        </PublicLayout>
    );
}
