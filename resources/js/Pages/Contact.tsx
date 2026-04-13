import PublicLayout from '@/Layouts/PublicLayout';
import { MapPin, MessageCircle, PhoneCall } from 'lucide-react';

interface BranchInfo {
    name: string;
    address: string;
    mapsUrl: string;
}

const branches: BranchInfo[] = [
    {
        name: 'Angga Jaya 1',
        address: 'Ruko pasar Jati Baru Blok B No.15 - 16, Jatiuwung, Kota Tangerang',
        mapsUrl:
            'https://maps.app.goo.gl/xkP6w8QmWb1MMxxK7',
    },
    {
        name: 'Angga Jaya 2',
        address: 'Jl. Kampung Kadu Rt 01/Rw 02 Kec. Curug, Kab.Tangerang.',
        mapsUrl: 'https://maps.app.goo.gl/tUCGqiBfEG6iyV4t8',
    },
];

export default function Contact() {
    const whatsappNumber = (
        import.meta.env.VITE_WHATSAPP_NUMBER || '6285133842871'
    ).replaceAll(/\D/g, '');
    const whatsappMessage = encodeURIComponent(
        'Halo Admin ANGGA JAYA, saya ingin tanya seputar produk grosir.',
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    return (
        <PublicLayout>
            <section className="relative overflow-hidden px-6 pt-28 pb-16 md:px-10 md:pt-32 md:pb-20">
                <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
                <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />

                <div className="relative mx-auto max-w-6xl">
                    <header className="mb-12 rounded-3xl border border-black/5 bg-white/60 p-8 text-center shadow-sm backdrop-blur md:p-10">
                        <p className="font-headline text-primary mb-2 text-sm font-bold tracking-[0.2em] uppercase">
                            Hubungi Kami
                        </p>
                        <h1 className="font-headline text-on-surface text-3xl font-black tracking-tight md:text-5xl">
                            ANGGA JAYA GROSIR
                        </h1>
                        <div className="text-on-surface-variant mt-6 space-y-2 text-base font-medium md:text-lg">
                            <p>Ruko Pasar Jati Baru Blok B No. 15-16, Tangerang</p>
                            <p className="inline-flex items-center gap-2">
                                <PhoneCall className="h-4 w-4" />
                                0812-2182-7745 (Admin)
                            </p>
                        </div>
                        <div className="mt-6">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-700"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Chat WhatsApp Admin
                            </a>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {branches.map((branch) => (
                            <article
                                key={branch.name}
                                className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm"
                            >
                                <div className="mb-6 flex aspect-[4/3] items-center justify-center rounded-2xl border-2 border-dashed border-surface-container-highest bg-surface-container-low text-on-surface-variant text-lg font-semibold">
                                    (Foto)
                                </div>

                                <h2 className="font-headline text-on-surface mb-2 text-2xl font-extrabold">
                                    {branch.name}
                                </h2>
                                <p className="text-on-surface-variant mb-5 min-h-12 text-sm leading-relaxed md:text-base">
                                    {branch.address}
                                </p>

                                <a
                                    href={branch.mapsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
                                >
                                    <MapPin className="h-4 w-4" />
                                    Buka Maps
                                </a>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
