import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    MessageCircle,
    Package,
    Shapes,
    UserCircle,
    X,
    Menu,
    Image as ImageIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
    {
        href: '/admin/banners',
        label: 'Spanduk',
        icon: ImageIcon,
        isActive: (path: string) => path.startsWith('/admin/banners'),
    },
];

interface AdminSidebarProps {
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

export default function AdminSidebar(props: Readonly<AdminSidebarProps>) {
    const { mobileOpen = false, onMobileClose } = props;
    const { url } = usePage();
    const [desktopCollapsed, setDesktopCollapsed] = useState(false);
    const desktopSidebarRef = useRef<HTMLElement | null>(null);
    const mobileSidebarRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
            const target = event.target;

            if (!(target instanceof Node)) {
                return;
            }

            if (
                mobileOpen &&
                mobileSidebarRef.current !== null &&
                !mobileSidebarRef.current.contains(target)
            ) {
                onMobileClose?.();
            }

            if (
                !desktopCollapsed &&
                globalThis.innerWidth >= 768 &&
                desktopSidebarRef.current !== null &&
                !desktopSidebarRef.current.contains(target)
            ) {
                setDesktopCollapsed(true);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('touchstart', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
        };
    }, [desktopCollapsed, mobileOpen, onMobileClose]);

    const renderContent = (isCollapsed: boolean) => (
        <>
            <div className={`flex items-center ${isCollapsed ? 'justify-center p-4' : 'justify-between p-6'}`}>
                {!isCollapsed && (
                    <h1 className="font-headline text-2xl font-black tracking-tight truncate">
                        ANGGA JAYA
                    </h1>
                )}
                <button
                    type="button"
                    onClick={() => setDesktopCollapsed(!desktopCollapsed)}
                    className="hidden md:block text-white/70 hover:bg-white/10 hover:text-white rounded-lg p-1.5 transition-colors"
                    aria-label="Toggle menu"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            <div className={`py-4 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                {!isCollapsed && (
                    <p className="mb-3 px-2 text-xs font-bold tracking-widest text-white/50 uppercase">
                        Menu Utama
                    </p>
                )}
                <nav className="space-y-1.5 flex flex-col">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = item.isActive(url);

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={onMobileClose}
                                title={isCollapsed ? item.label : undefined}
                                className={`flex items-center rounded-xl p-3 text-sm transition-colors ${
                                    isCollapsed ? 'justify-center' : 'gap-3 px-4'
                                } ${
                                    active
                                        ? 'bg-primary font-bold text-white'
                                        : 'font-medium text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                {!isCollapsed && <span className="truncate">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className={`mt-auto border-t border-white/10 p-5 ${isCollapsed ? 'flex justify-center' : ''}`}>
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <UserCircle className="h-10 w-10 shrink-0 text-white/70" />
                    {!isCollapsed && (
                        <div className="min-w-0">
                            <p className="text-sm font-bold truncate">Admin Utama</p>
                            <p className="text-xs text-white/50 truncate">Grosir Curator</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside ref={desktopSidebarRef} className={`hidden flex-col bg-[#313030] text-white transition-all duration-300 md:flex ${
                desktopCollapsed ? 'w-20' : 'w-64'
            }`}>
                {renderContent(desktopCollapsed)}
            </aside>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Tutup menu"
                    className="bg-black/50 fixed inset-0 z-40 md:hidden transition-opacity"
                    onClick={onMobileClose}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <aside
                ref={mobileSidebarRef}
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

                {renderContent(false)}
            </aside>
        </>
    );
}
