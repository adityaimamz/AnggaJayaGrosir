import AppModal from '@/Components/AppModal';
import Checkbox from '@/Components/Checkbox';
import ConfirmDialog from '@/Components/ui/confirm-dialog';
import AdminLayout from '@/Layouts/AdminLayout';
import { AdminWhatsappOrderRow, LengthAwarePaginated } from '@/types/domain';
import { Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Eye, MessageCircle, Printer, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface WaOrdersProps {
    orders: LengthAwarePaginated<AdminWhatsappOrderRow>;
}

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

export default function WaOrders({ orders }: WaOrdersProps) {
    const [activeOrder, setActiveOrder] =
        useState<AdminWhatsappOrderRow | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [confirmDeleteType, setConfirmDeleteType] = useState<'bulk' | 'all' | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const toggleSelectAll = () => {
        if (selectedIds.length === orders.data.length && orders.data.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(orders.data.map((o) => o.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((i) => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const executeDelete = () => {
        if (!confirmDeleteType) return;
        setIsDeleting(true);

        const data = confirmDeleteType === 'all'
            ? { delete_all: true }
            : { ids: selectedIds };

        router.delete('/admin/wa-orders', {
            data,
            preserveScroll: true,
            onSuccess: () => {
                setSelectedIds([]);
                setConfirmDeleteType(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const printInvoice = () => {
        if (!activeOrder) return;
        const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
        if (!windowPrint) return;

        windowPrint.document.write(`
            <html>
                <head>
                    <title>Invoice - ${activeOrder.orderCode}</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; color: #1a1a1a; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
                        th { background-color: #f9fafb; }
                        .header { margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px; }
                        .header h2 { margin: 0 0 10px 0; }
                        .header p { margin: 4px 0; font-size: 14px; }
                        .total { font-weight: bold; font-size: 1.2em; text-align: right; margin-top: 20px; padding-top: 10px; border-top: 2px solid #000; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>Invoice: ${activeOrder.orderCode}</h2>
                        <p><strong>Pelanggan:</strong> ${activeOrder.customerName}</p>
                        <p><strong>Alamat:</strong> ${activeOrder.address}</p>
                        <p><strong>Ekspedisi:</strong> ${activeOrder.expedition}</p>
                        <p><strong>Tanggal:</strong> ${activeOrder.createdAt ? new Date(activeOrder.createdAt).toLocaleString('id-ID') : '-'}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Produk</th>
                                <th>Qty</th>
                                <th>Harga</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${activeOrder.items.map(item => `
                                <tr>
                                    <td>
                                        <strong>${item.name}</strong><br>
                                        <span style="color: #666; font-size: 12px;">${item.size} &middot; ${item.pack}</span>
                                    </td>
                                    <td>${item.quantity}</td>
                                    <td>${currencyFormatter.format(item.price)}</td>
                                    <td>${currencyFormatter.format(item.subtotal)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="total">
                        Total: ${currencyFormatter.format(activeOrder.totalAmount)}
                    </div>
                </body>
            </html>
        `);
        windowPrint.document.close();
        windowPrint.focus();
        windowPrint.print();
        windowPrint.close();
    };

    return (
        <AdminLayout>
            <header className="space-y-1">
                <h1 className="font-headline text-on-surface text-3xl font-black">
                    Pesanan WhatsApp
                </h1>
                <p className="text-on-surface-variant text-sm">
                    Semua checkout WA dari halaman cart tersimpan di sini.
                </p>
            </header>

            <section className="bg-surface-container-lowest rounded-2xl border border-black/5 p-5 md:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="font-headline text-on-surface text-xl font-black">
                            Daftar Pesanan
                        </h2>
                        <p className="text-on-surface-variant text-sm">
                            Menampilkan {orders.from ?? 0}-{orders.to ?? 0}{' '}
                            dari {orders.total} pesanan
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedIds.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setConfirmDeleteType('bulk')}
                                className="bg-error text-white hover:brightness-110 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all shadow-sm"
                            >
                                <Trash2 className="h-4 w-4" /> Hapus {selectedIds.length} Terpilih
                            </button>
                        )}
                        {orders.total > 0 && (
                            <button
                                type="button"
                                onClick={() => setConfirmDeleteType('all')}
                                className="bg-error/10 text-error hover:bg-error/20 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all"
                            >
                                <Trash2 className="h-4 w-4" /> Hapus Semua
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="divide-surface-container-highest min-w-full divide-y text-left">
                        <thead>
                            <tr className="text-on-surface-variant/70 text-xs tracking-wider uppercase">
                                <th className="py-3 pl-4 pr-2 w-10">
                                    <Checkbox
                                        className="h-4 w-4"
                                        checked={selectedIds.length === orders.data.length && orders.data.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="py-3 pr-4">Kode</th>
                                <th className="py-3 pr-4">Pelanggan</th>
                                <th className="py-3 pr-4">Ekspedisi</th>
                                <th className="py-3 pr-4">Qty Item</th>
                                <th className="py-3 pr-4">Total</th>
                                <th className="py-3 pr-4">Waktu</th>
                                <th className="py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-surface-container-highest divide-y">
                            {orders.data.map((order) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-surface-container-low"
                                >
                                    <td className="py-3 pl-4 pr-2">
                                        <Checkbox
                                            className="h-4 w-4"
                                            checked={selectedIds.includes(order.id)}
                                            onChange={() => toggleSelect(order.id)}
                                        />
                                    </td>
                                    <td className="py-3 pr-4">
                                        <span className="bg-primary-fixed text-on-primary-fixed inline-flex rounded-full px-2.5 py-1 text-xs font-bold">
                                            {order.orderCode}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4">
                                        <p className="text-on-surface font-semibold">
                                            {order.customerName}
                                        </p>
                                        <p className="text-on-surface-variant line-clamp-1 text-xs">
                                            {order.address}
                                        </p>
                                    </td>
                                    <td className="text-on-surface-variant py-3 pr-4 text-sm font-medium">
                                        {order.expedition}
                                    </td>
                                    <td className="text-on-surface py-3 pr-4 text-sm font-semibold">
                                        {order.totalItems}
                                    </td>
                                    <td className="text-on-surface py-3 pr-4 text-sm font-semibold">
                                        {currencyFormatter.format(
                                            order.totalAmount,
                                        )}
                                    </td>
                                    <td className="text-on-surface-variant py-3 pr-4 text-sm">
                                        {order.createdAt
                                            ? new Date(
                                                  order.createdAt,
                                              ).toLocaleString('id-ID')
                                            : '-'}
                                    </td>
                                    <td className="py-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setActiveOrder(order)}
                                            className="text-on-surface-variant hover:bg-surface-container inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold"
                                        >
                                            <Eye className="h-4 w-4" /> Detail
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {orders.data.length === 0 ? (
                        <div className="py-14 text-center">
                            <div className="bg-surface-container mx-auto mb-3 inline-flex rounded-full p-3">
                                <MessageCircle className="text-on-surface-variant h-6 w-6" />
                            </div>
                            <p className="text-on-surface-variant text-sm font-medium">
                                Belum ada pesanan WA masuk.
                            </p>
                        </div>
                    ) : null}
                </div>

                <div className="border-surface-container-highest mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <p className="text-on-surface-variant text-sm">
                        Halaman {orders.currentPage} dari {orders.lastPage}
                    </p>
                    <div className="flex items-center gap-2">
                        <Link
                            href={
                                orders.currentPage > 1
                                    ? `/admin/wa-orders?page=${orders.currentPage - 1}`
                                    : '/admin/wa-orders'
                            }
                            className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold ${
                                orders.currentPage > 1
                                    ? 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                                    : 'bg-surface-container-low text-on-surface-variant/50 cursor-not-allowed'
                            }`}
                            preserveScroll
                        >
                            <ChevronLeft className="h-4 w-4" /> Prev
                        </Link>
                        <Link
                            href={
                                orders.currentPage < orders.lastPage
                                    ? `/admin/wa-orders?page=${orders.currentPage + 1}`
                                    : `/admin/wa-orders?page=${orders.currentPage}`
                            }
                            className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold ${
                                orders.currentPage < orders.lastPage
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

            <AppModal
                open={activeOrder !== null}
                title={activeOrder ? `Detail ${activeOrder.orderCode}` : 'Detail'}
                description={
                    activeOrder
                        ? `Pelanggan: ${activeOrder.customerName} · Ekspedisi: ${activeOrder.expedition}`
                        : ''
                }
                onClose={() => setActiveOrder(null)}
                maxWidthClass="max-w-2xl"
            >
                {activeOrder ? (
                    <div className="space-y-4">
                        <div className="bg-surface-container-low rounded-xl p-3 text-sm">
                            <p className="text-on-surface mb-1 font-semibold">
                                Alamat Pengiriman
                            </p>
                            <p className="text-on-surface-variant whitespace-pre-line">
                                {activeOrder.address}
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead>
                                    <tr className="text-on-surface-variant/70 border-surface-container-highest border-b text-xs tracking-wider uppercase">
                                        <th className="py-2 pr-3">Produk</th>
                                        <th className="py-2 pr-3">Qty</th>
                                        <th className="py-2 pr-3">Harga</th>
                                        <th className="py-2 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeOrder.items.map((item, index) => (
                                        <tr
                                            key={`${activeOrder.id}-${item.id}-${index}`}
                                            className="border-surface-container-highest border-b"
                                        >
                                            <td className="py-2 pr-3">
                                                <p className="text-on-surface font-semibold">
                                                    {item.name}
                                                </p>
                                                <p className="text-on-surface-variant text-xs">
                                                    {item.size} · {item.pack}
                                                </p>
                                            </td>
                                            <td className="text-on-surface py-2 pr-3 font-semibold">
                                                {item.quantity}
                                            </td>
                                            <td className="text-on-surface py-2 pr-3">
                                                {currencyFormatter.format(
                                                    item.price,
                                                )}
                                            </td>
                                            <td className="text-on-surface py-2 text-right font-semibold">
                                                {currencyFormatter.format(
                                                    item.subtotal,
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between rounded-xl bg-[#313030] px-4 py-3 text-white">
                            <span className="font-semibold">Total Pesanan</span>
                            <span className="font-headline text-lg font-black">
                                {currencyFormatter.format(activeOrder.totalAmount)}
                            </span>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={printInvoice}
                                className="bg-primary text-white hover:brightness-110 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all shadow-sm"
                            >
                                <Printer className="h-4 w-4" /> Cetak Invoice
                            </button>
                        </div>
                    </div>
                ) : null}
            </AppModal>

            <ConfirmDialog
                open={confirmDeleteType !== null}
                title={confirmDeleteType === 'all' ? 'Hapus Semua Pesanan' : 'Hapus Pesanan Terpilih'}
                description={
                    confirmDeleteType === 'all'
                        ? 'Apakah Anda yakin ingin menghapus seluruh riwayat pesanan WhatsApp secara permanen? Tindakan ini tidak dapat dibatalkan.'
                        : `Apakah Anda yakin ingin menghapus ${selectedIds.length} pesanan yang dipilih? Tindakan ini tidak dapat dibatalkan.`
                }
                confirmLabel="Ya, Hapus"
                cancelLabel="Batal"
                processing={isDeleting}
                danger
                onCancel={() => setConfirmDeleteType(null)}
                onConfirm={executeDelete}
            />
        </AdminLayout>
    );
}
