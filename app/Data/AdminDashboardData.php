<?php

declare(strict_types=1);

namespace App\Data;

use Illuminate\Pagination\LengthAwarePaginator;

final readonly class AdminDashboardData
{
    public function __construct(
        public AdminDashboardStatsData $stats,
        public LengthAwarePaginator $products,
        public array $categoryComposition,
    ) {}

    public function toArray(): array
    {
        return [
            'stats' => $this->stats->toArray(),
            'products' => PaginatedData::fromLengthAwarePaginator($this->products)->toArray(),
            'categoryComposition' => $this->categoryComposition,
        ];
    }
}
