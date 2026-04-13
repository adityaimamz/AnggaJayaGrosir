import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    LayoutDashboard,
    MessageCircle,
    Package,
    Shapes,
    UserCircle,
    X,
} from 'lucide-react';

const navItems = [
    {
        href: '/admin',
        label: 'Dashboard',
        icon: LayoutDashboard,
        isActive: (path: string) =>
            path === '/admin' || path === '/admin/dashboard',
    },
    {
        href: '/admin/products',
        label: 'Produk',
        icon: Package,
        isActive: (path: string) => path.startsWith('/admin/products'),
    },
    {
        href: '/admin/categories',
        label: 'Kategori',
        icon: Shapes,
        isActive: (path: string) => path.startsWith('/admin/categories'),
    },
    {
        href: '/admin/wa-orders',
        label: 'Pesanan WA',
        icon: MessageCircle,
        isActive: (path: string) => path.startsWith('/admin/wa-orders'),
    },
    // {
    //     href: '#',
    //     label: 'Stok',
    //     icon: BarChart3,
    //     isActive: () => false,
    // },
];

interface AdminSidebarProps {
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

export default function AdminSidebar({
    mobileOpen = false,
    onMobileClose,
}: AdminSidebarProps) {
    const { url } = usePage();

    const sidebarContent = (
        <>
            <div className="p-6">
                <h1 className="font-headline text-2xl font-black tracking-tight">
                    ANGGA JAYA
                </h1>
            </div>

            <div className="px-4 py-4">
                <p className="mb-3 px-2 text-xs font-bold tracking-widest text-white/50 uppercase">
                    Menu Utama
                </p>
                <nav className="space-y-1.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = item.isActive(url);

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={onMobileClose}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                                    active
                                        ? 'bg-primary font-bold text-white'
                                        : 'font-medium text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <Icon className="h-5 w-5" /> {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto border-t border-white/10 p-5">
                <div className="flex items-center gap-3">
                    <UserCircle className="h-10 w-10 text-white/70" />
                    <div>
                        <p className="text-sm font-bold">Admin Utama</p>
                        <p className="text-xs text-white/50">Grosir Curator</p>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 flex-col bg-[#313030] text-white md:flex">
                {sidebarContent}
            </aside>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="bg-black/50 fixed inset-0 z-40 md:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#313030] text-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
                    mobileOpen
                        ? 'translate-x-0'
                        : '-translate-x-full'
                }`}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onMobileClose}
                    className="absolute top-4 right-4 rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Tutup menu"
                >
                    <X className="h-5 w-5" />
                </button>

                {sidebarContent}
            </aside>
        </>
    );
}
