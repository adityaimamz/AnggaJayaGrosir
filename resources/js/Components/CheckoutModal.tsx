import AppModal from '@/Components/AppModal';
import InvoiceTemplate from '@/Components/InvoiceTemplate';
import axios from 'axios';
import { toPng } from 'html-to-image';
import React, { useRef, useState } from 'react';

export interface CheckoutItem {
    id: number;
    name: string;
    size: string;
    pack: string;
    price: number;
    quantity: number;
}

interface CheckoutModalProps {
    open: boolean;
    onClose: () => void;
    items: CheckoutItem[];
    totalAmount: number;
}

interface CheckoutForm {
    name: string;
    address: string;
    expedition: string;
}

interface CheckoutOrderResponse {
    data: {
        id: number;
        orderCode: string;
        totalAmount: number;
    };
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
    open,
    onClose,
    items,
    totalAmount,
}) => {
    const [form, setForm] = useState<CheckoutForm>({
        name: '',
        address: '',
        expedition: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [orderCode, setOrderCode] = useState<string | null>(null);
    const invoiceRef = useRef<HTMLDivElement>(null);

    const whatsappNumber = (
        import.meta.env.VITE_WHATSAPP_NUMBER || '6281234567890'
    ).replaceAll(/\D/g, '');

    const resetForm = () => {
        setForm({
            name: '',
            address: '',
            expedition: '',
        });
        setError(null);
        setOrderCode(null);
    };

    const handleClose = () => {
        if (isSubmitting || isExporting) return;
        onClose();
        resetForm();
    };

    const handleFormChange =
        (field: keyof CheckoutForm) =>
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setForm((prev) => ({
                ...prev,
                [field]: event.target.value,
            }));
        };

    const buildWhatsappMessage = (code: string) => {
        return [
            'Terimakasih atas pesanannya',
            `Kode Pesanan: ${code}`,
            `Nama: ${form.name.trim()}`,
            `Alamat: ${form.address.trim()}`,
            `Ekspedisi: ${form.expedition.trim()}`,
            '',
            'Selanjutnya akan admin buatkan Nota terlebih dahulu. Mohon anda menunggu',
            '',
            'Perhatian!',
            '* Website tidak menunjukan ketersediaan stok di toko kami',
            '* Apabila stok produk kosong maka tidak akan masuk kedalam nota',
            '* Admin akan konfirmasi jika barang yg anda inginkan tersebut sedang kosong',
        ].join('\n');
    };

    const downloadInvoiceImage = async (code: string): Promise<void> => {
        if (!invoiceRef.current) return;

        setIsExporting(true);
        try {
            // Wait for DOM update
            await new Promise((resolve) => setTimeout(resolve, 150));

            const dataUrl = await toPng(invoiceRef.current, {
                cacheBust: true,
                backgroundColor: '#ffffff',
            });

            const fileName = `invoice-${code.toLowerCase()}-${Date.now()}.png`;
            const downloadLink = document.createElement('a');
            downloadLink.href = dataUrl;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
        } catch (err) {
            console.error('Failed to export invoice image:', err);
        } finally {
            setIsExporting(false);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!form.name.trim() || !form.address.trim() || !form.expedition.trim()) {
            setError('Nama, alamat, dan ekspedisi wajib diisi.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                name: form.name.trim(),
                address: form.address.trim(),
                expedition: form.expedition.trim(),
                items: items,
            };

            const response = await axios.post<CheckoutOrderResponse>(
                '/checkout/wa-orders',
                payload,
            );

            const code = response.data.data.orderCode;
            setOrderCode(code);

            const text = buildWhatsappMessage(code);
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

            await downloadInvoiceImage(code);

            handleClose();

            setTimeout(() => {
                window.location.href = whatsappUrl;
            }, 150);
        } catch (err) {
            console.error('Checkout error:', err);
            setError('Checkout gagal disimpan. Coba lagi beberapa saat.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <AppModal
                open={open}
                title="Data Pengiriman"
                description="Isi data berikut sebelum melanjutkan checkout via WhatsApp."
                onClose={handleClose}
                maxWidthClass="max-w-xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="checkout-name"
                            className="text-on-surface mb-1 block text-sm font-semibold"
                        >
                            Nama
                        </label>
                        <input
                            id="checkout-name"
                            type="text"
                            value={form.name}
                            onChange={handleFormChange('name')}
                            className="bg-surface-container-lowest text-on-surface border-surface-container-highest focus:border-primary w-full rounded-xl border px-4 py-2.5 outline-none"
                            placeholder="Contoh: Budi Santoso"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="checkout-address"
                            className="text-on-surface mb-1 block text-sm font-semibold"
                        >
                            Alamat
                        </label>
                        <textarea
                            id="checkout-address"
                            value={form.address}
                            onChange={handleFormChange('address')}
                            rows={3}
                            className="bg-surface-container-lowest text-on-surface border-surface-container-highest focus:border-primary w-full rounded-xl border px-4 py-2.5 outline-none"
                            placeholder="Alamat lengkap pengiriman"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="checkout-expedition"
                            className="text-on-surface mb-1 block text-sm font-semibold"
                        >
                            Ekspedisi
                        </label>
                        <input
                            id="checkout-expedition"
                            type="text"
                            value={form.expedition}
                            onChange={handleFormChange('expedition')}
                            className="bg-surface-container-lowest text-on-surface border-surface-container-highest focus:border-primary w-full rounded-xl border px-4 py-2.5 outline-none"
                            placeholder="Contoh: JNE, J&T, SiCepat"
                            required
                        />
                    </div>

                    <div className="bg-surface-container-low rounded-xl px-4 py-3 text-sm">
                        <div className="text-on-surface mb-1 font-semibold">
                            Total pesanan
                        </div>
                        <div className="text-primary text-lg font-black">
                            Rp {totalAmount.toLocaleString('id-ID')}
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm font-medium text-red-600">
                            {error}
                        </p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting || isExporting}
                            className="bg-surface-container rounded-xl px-4 py-2 text-sm font-semibold"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || isExporting}
                            className="bg-tertiary rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                        >
                            {isSubmitting
                                ? 'Menyimpan...'
                                : isExporting
                                  ? 'Mengekspor Invoice...'
                                  : 'Lanjut ke WhatsApp'}
                        </button>
                    </div>
                </form>
            </AppModal>

            {/* Hidden Invoice Template for Export */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <InvoiceTemplate
                    ref={invoiceRef}
                    noTransaksi={orderCode || 'PENDING'}
                    namaPelanggan={form.name || '-'}
                    alamat={form.address || '-'}
                    ekspedisi={form.expedition || '-'}
                    tanggal={new Date().toLocaleString('id-ID')}
                    items={items.map((item, index) => ({
                        no: index + 1,
                        namaItem: `${item.name} (${item.size})`,
                        jumlah: item.quantity,
                        satuan: item.pack,
                        total: item.price * item.quantity,
                    }))}
                />
            </div>
        </>
    );
};

export default CheckoutModal;
