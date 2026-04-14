import AppModal from '@/Components/AppModal';
import InvoiceTemplate from '@/Components/InvoiceTemplate';
import axios from 'axios';
import { toPng } from 'html-to-image';
import { CheckCircle, Download } from 'lucide-react';
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
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [invoiceDownloaded, setInvoiceDownloaded] = useState(false);
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
        setStep(1);
        setInvoiceDownloaded(false);
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
            'Terima kasih atas pesanannya.',
            `Kode Pesanan: ${code}`,
            `Nama: ${form.name.trim()}`,
            `Alamat: ${form.address.trim()}`,
            `Ekspedisi: ${form.expedition.trim()}`,
            '',
            'Tunggu saya lampirkan notanya terlebih dahulu.',
            '',
            '[PERHATIAN]',
            '- Website tidak menunjukan ketersediaan stok di toko kami',
            '- Apabila stok produk kosong maka tidak akan masuk ke dalam nota',
            '- Admin akan konfirmasi jika barang yang anda inginkan sedang kosong',
        ].join('\n');
    };

    const handleProceedToPreview = async (event: React.FormEvent) => {
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
            setStep(2);
        } catch (err) {
            console.error('Checkout error:', err);
            setError('Checkout gagal disimpan. Coba lagi beberapa saat.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const downloadInvoiceImage = async (): Promise<void> => {
        if (!invoiceRef.current || !orderCode) return;

        setIsExporting(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 150));

            const dataUrl = await toPng(invoiceRef.current, {
                cacheBust: true,
                backgroundColor: '#ffffff',
            });

            const fileName = `invoice-${orderCode.toLowerCase()}-${Date.now()}.png`;
            const downloadLink = document.createElement('a');
            downloadLink.href = dataUrl;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
            
            setInvoiceDownloaded(true);
            setStep(3);
        } catch (err) {
            console.error('Failed to export invoice image:', err);
            setError('Gagal mengunduh invoice. Silakan coba lagi.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleProceedToWhatsapp = () => {
        if (!orderCode) return;
        const text = buildWhatsappMessage(orderCode);
        const params = new URLSearchParams({ text });
        const whatsappUrl = `https://wa.me/${whatsappNumber}?${params.toString()}`;
        
        handleClose();
        setTimeout(() => {
            window.location.href = whatsappUrl;
        }, 150);
    };

    return (
        <AppModal
            open={open}
            title={step === 1 ? 'Data Pengiriman' : 'Preview Invoice'}
            description={
                step === 1 
                    ? 'Isi data berikut sebelum melanjutkan pesanan.' 
                    : step === 2 
                        ? 'Mohon unduh invoice ini sebelum lanjut ke WhatsApp.'
                        : 'Invoice berhasil diunduh. Silakan lanjut ke WhatsApp dan kirim invoice ke chat Admin.'
            }
            onClose={handleClose}
            maxWidthClass={step === 1 ? 'max-w-xl' : 'max-w-3xl'}
        >
            {/* Stepper Progress */}
            <div className="mb-6 flex items-center justify-between relative px-2">
                <div className="absolute left-6 right-6 top-1/2 h-0.5 bg-surface-container -z-10 -translate-y-1/2"></div>
                <div className="absolute left-6 top-1/2 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-300" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : 'calc(100% - 3rem)' }}></div>
                
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-1.5 bg-surface-container-lowest px-2 py-1">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${step >= s ? 'bg-primary text-white scale-110 shadow-sm' : 'bg-surface-container-high text-on-surface-variant'}`}>
                            {s === 3 && step === 3 ? <CheckCircle className="h-4 w-4" /> : s}
                        </div>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${step >= s ? 'text-primary' : 'text-on-surface-variant'}`}>
                            {s === 1 ? 'Data' : s === 2 ? 'Preview' : 'WhatsApp'}
                        </span>
                    </div>
                ))}
            </div>

            {step === 1 && (
                <form onSubmit={handleProceedToPreview} className="space-y-4">
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

                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 sm:pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="bg-surface-container hover:bg-surface-container-high transition-colors rounded-xl px-5 py-2.5 text-sm font-semibold w-full sm:w-auto"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-primary hover:brightness-110 transition-all rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Lanjut ke Preview'}
                        </button>
                    </div>
                </form>
            )}

            {(step === 2 || step === 3) && (
                <div className="space-y-5">
                    {/* Invoice View Container */}
                    <div className="max-h-[50vh] overflow-auto rounded-xl border border-black/10 bg-surface-container-lowest shadow-inner">
                        <div className="w-max p-4 mx-auto">
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
                    </div>
                    
                    {error && (
                        <p className="text-sm font-medium text-red-600">
                            {error}
                        </p>
                    )}
                    
                    {step === 3 && (
                        <div className="bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] rounded-xl px-4 py-3 flex items-start gap-3">
                            <CheckCircle className="h-6 w-6 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-sm mb-1">Invoice Berhasil Diunduh!</h4>
                                <p className="text-xs">Anda sudah bisa melanjutkan pesanan ke WhatsApp. Jangan lupa kirim gambar invoice yang barusan diunduh ke chat Admin agar pesanan Anda bisa segera diproses.</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 sm:pt-2 pb-4 sm:pb-0">
                        {step === 2 && (
                            <button
                                type="button"
                                onClick={() => handleClose()}
                                disabled={isExporting}
                                className="bg-surface-container hover:bg-surface-container-high transition-colors rounded-xl px-5 py-3 text-sm font-semibold w-full sm:w-auto"
                            >
                                Batal
                            </button>
                        )}
                        
                        {!invoiceDownloaded ? (
                            <button
                                type="button"
                                onClick={downloadInvoiceImage}
                                disabled={isExporting}
                                className="bg-primary hover:brightness-110 transition-all flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white disabled:opacity-50 w-full sm:w-auto sm:min-w-[200px]"
                            >
                                <Download className="h-5 w-5" />
                                {isExporting ? 'Mengekspor...' : 'Unduh Invoice'}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleProceedToWhatsapp}
                                className="bg-tertiary hover:brightness-110 transition-all flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white w-full sm:w-auto sm:min-w-[200px]"
                            >
                                <CheckCircle className="h-5 w-5" />
                                Lanjut ke WhatsApp
                            </button>
                        )}
                    </div>
                </div>
            )}
        </AppModal>
    );
};

export default CheckoutModal;
