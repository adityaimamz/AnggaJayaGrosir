import Footer from '@/Components/Footer';
import Navbar from '@/Components/Navbar';
import React from 'react';

interface PublicLayoutProps {
    children: React.ReactNode;
    search?: string;
    onSearchChange?: (value: string) => void;
}

export default function PublicLayout({
    children,
    search,
    onSearchChange,
}: PublicLayoutProps) {
    return (
        <div className="bg-surface text-on-surface min-h-screen">
            <Navbar search={search} onSearchChange={onSearchChange} />
            <main>{children}</main>
            <Footer />
        </div>
    );
}
