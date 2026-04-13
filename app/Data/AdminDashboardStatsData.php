<?php

declare(strict_types=1);

namespace App\Data;

final readonly class AdminDashboardStatsData
{
    public function __construct(
        public int $totalProducts,
        public int $totalCategories,
        public int $totalStockUnits,
        public int $lowStockProducts,
        public float $stockValue,
    ) {}

    public function toArray(): array
    {
        return [
            'totalProducts' => $this->totalProducts,
            'totalCategories' => $this->totalCategories,
            'totalStockUnits' => $this->totalStockUnits,
            'lowStockProducts' => $this->lowStockProducts,
            'stockValue' => $this->stockValue,
        ];
    }
}
