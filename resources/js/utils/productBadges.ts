interface ProductBadgeSource {
    badge?: string | null;
    isBestSeller?: boolean;
    isNew?: boolean;
}

function parseManualBadges(badge?: string | null): string[] {
    return (badge ?? '')
        .split(/[|,]/)
        .map((item) => item.trim())
        .filter(Boolean);
}

export function resolveProductBadges(source: ProductBadgeSource): string[] {
    const autoBadges = [
        ...(source.isBestSeller ? ['Best Seller'] : []),
        ...(source.isNew ? ['Produk Terbaru'] : []),
    ];

    const merged = [...autoBadges, ...parseManualBadges(source.badge)];
    const seen = new Set<string>();

    return merged.filter((label) => {
        const key = label.toLowerCase();

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

export function getBadgeClassName(label: string): string {
    const normalized = label.toLowerCase();

    if (normalized === 'best seller') {
        return 'bg-amber-100 text-amber-700 border border-amber-200';
    }

    if (normalized === 'produk terbaru') {
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    }

    return 'bg-white/90 text-on-surface border border-white/70';
}
