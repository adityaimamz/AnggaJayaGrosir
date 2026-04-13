import AdminSidebar from '@/Components/admin/AdminSidebar';
import { Link } from '@inertiajs/react';
import { Home, Menu } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';

export default function AdminLayout({ children }: PropsWithChildren) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="bg-surface-container-low min-h-screen md:flex">
            <AdminSidebar
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />

            <div className="flex flex-1 flex-col">
                {/* Mobile Header */}
                <header className="bg-surface-container-lowest sticky top-0 z-30 flex items-center justify-between border-b border-black/5 px-4 py-3 md:hidden">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        className="text-on-surface hover:bg-surface-container rounded-lg p-2 transition-colors"
                        aria-label="Buka menu"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <h1 className="font-headline text-on-surface text-lg font-bold">
                        Admin
                    </h1>

                    <Link
                        href="/"
                        className="text-on-surface-variant hover:text-primary rounded-lg p-2 transition-colors"
                        aria-label="Ke Website"
                    >
                        <Home className="h-5 w-5" />
                    </Link>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8">
                    <div className="mx-auto max-w-7xl space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
