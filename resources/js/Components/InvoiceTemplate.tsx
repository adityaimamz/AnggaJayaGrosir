import React from 'react';

export interface InvoiceItem {
    no: number;
    namaItem: string;
    jumlah: number;
    satuan: string;
    total: number;
}

interface InvoiceTemplateProps {
    noTransaksi: string;
    namaPelanggan: string;
    tanggal: string;
    alamat: string;
    ekspedisi: string;
    items: InvoiceItem[];
    logoUrl?: string;
    companyName?: string;
    companyAddress?: string;
}

const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceTemplateProps>(
    (
        {
            noTransaksi,
            namaPelanggan,
            tanggal,
            alamat,
            ekspedisi,
            items,
            logoUrl = '/logo AJ.png',
            companyName = 'ANGGA JAYA',
            companyAddress = 'Ruko Pasar Jati baru Blok B No.15-16 (Jatiuwung)',
        },
        ref,
    ) => {
        const subTotal = items.reduce((sum, item) => sum + item.total, 0);

        return (
            <div
                ref={ref}
                style={{
                    width: '800px',
                    backgroundColor: '#fdf6e3', // Warna krem/non-putih
                    fontFamily: 'Arial, sans-serif',
                    color: '#1a1a1a',
                    padding: 0,
                    overflow: 'hidden',
                }}
            >
                {/* Dark Header Bar */}
                <div
                    style={{
                        backgroundColor: '#1a1c1e',
                        color: 'white',
                        padding: '16px 40px',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        marginBottom: '30px',
                    }}
                >
                    INVOICE CHECKOUT - ANGGA JAYA
                </div>

                <div style={{ padding: '0 40px 40px 40px' }}>
                    {/* Header and Invoice Details */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            borderBottom: '2px solid #333',
                            paddingBottom: '20px',
                            marginBottom: '30px',
                        }}
                    >
                    {/* Invoice Info - Left Aligned */}
                    <div style={{ flex: 1, fontSize: '14px' }}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '130px 10px 1fr',
                                gap: '8px',
                                marginBottom: '5px',
                            }}
                        >
                            <span style={{ fontWeight: 'bold' }}>
                                Tanggal
                            </span>
                            <span>:</span>
                            <span>{tanggal}</span>

                            <span style={{ fontWeight: 'bold' }}>
                                Kode Pesanan
                            </span>
                            <span>:</span>
                            <span>{noTransaksi}</span>

                            <span style={{ fontWeight: 'bold' }}>
                                Nama
                            </span>
                            <span>:</span>
                            <span>{namaPelanggan}</span>

                            <span style={{ fontWeight: 'bold' }}>Alamat</span>
                            <span>:</span>
                            <span>{alamat}</span>

                            <span style={{ fontWeight: 'bold' }}>
                                Ekspedisi
                            </span>
                            <span>:</span>
                            <span>{ekspedisi}</span>
                        </div>
                    </div>
                    </div>

                {/* Table */}
                <table
                    style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        marginBottom: '30px',
                    }}
                >
                    <thead>
                        <tr style={{ borderBottom: '2px solid #000' }}>
                            <th
                                style={{
                                    textAlign: 'left',
                                    padding: '10px 5px',
                                    fontSize: '13px',
                                }}
                            >
                                No
                            </th>
                            <th
                                style={{
                                    textAlign: 'left',
                                    padding: '10px 5px',
                                    fontSize: '13px',
                                }}
                            >
                                Nama Item
                            </th>
                            <th
                                style={{
                                    textAlign: 'right',
                                    padding: '10px 5px',
                                    fontSize: '13px',
                                }}
                            >
                                Jumlah
                            </th>
                            <th
                                style={{
                                    textAlign: 'left',
                                    padding: '10px 5px',
                                    fontSize: '13px',
                                }}
                            >
                                Satuan
                            </th>
                            <th
                                style={{
                                    textAlign: 'right',
                                    padding: '10px 5px',
                                    fontSize: '13px',
                                }}
                            >
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr
                                key={index}
                                style={{ borderBottom: '1px solid #eee' }}
                            >
                                <td style={{ padding: '12px 5px', fontSize: '12px' }}>
                                    {item.no}
                                </td>
                                <td style={{ padding: '12px 5px', fontSize: '12px' }}>
                                    {item.namaItem}
                                </td>
                                <td
                                    style={{
                                        padding: '12px 5px',
                                        fontSize: '12px',
                                        textAlign: 'right',
                                    }}
                                >
                                    {item.jumlah}
                                </td>
                                <td style={{ padding: '12px 5px', fontSize: '12px' }}>
                                    {item.satuan}
                                </td>
                                <td
                                    style={{
                                        padding: '12px 5px',
                                        fontSize: '13px',
                                        fontWeight: 'bold',
                                        textAlign: 'right',
                                    }}
                                >
                                    Rp {item.total.toLocaleString('id-ID')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer / Total */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}
                >
                    <div
                        style={{
                            width: '250px',
                            borderTop: '2px solid #000',
                            paddingTop: '10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontWeight: 'bold',
                        }}
                    >
                        <span>SUB TOTAL</span>
                        <span>Rp {subTotal.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                <div
                    style={{
                        marginTop: '40px',
                        fontSize: '11px',
                        color: '#666',
                        fontStyle: 'italic',
                    }}
                >
                    * rekap pesanan ini selanjutnya akan dibuat nota oleh admin
                </div>
            </div>
        </div>
    );
    },
);

InvoiceTemplate.displayName = 'InvoiceTemplate';

export default InvoiceTemplate;
