<?php

declare(strict_types=1);

namespace App\Data;

use Illuminate\Pagination\LengthAwarePaginator;

final readonly class PaginatedData
{
    public function __construct(
        public array $data,
        public int $currentPage,
        public int $lastPage,
        public int $perPage,
        public int $total,
        public ?int $from,
        public ?int $to,
        public array $links,
    ) {}

    public static function fromLengthAwarePaginator(LengthAwarePaginator $paginator): self
    {
        $raw = $paginator->toArray();

        return new self(
            data: $paginator->items(),
            currentPage: $paginator->currentPage(),
            lastPage: $paginator->lastPage(),
            perPage: $paginator->perPage(),
            total: $paginator->total(),
            from: $paginator->firstItem(),
            to: $paginator->lastItem(),
            links: array_map(
                static fn (array $link): array => [
                    'url' => $link['url'],
                    'label' => $link['label'],
                    'active' => $link['active'],
                ],
                $raw['links'] ?? [],
            ),
        );
    }

    public function toArray(): array
    {
        return [
            'data' => $this->data,
            'currentPage' => $this->currentPage,
            'lastPage' => $this->lastPage,
            'perPage' => $this->perPage,
            'total' => $this->total,
            'from' => $this->from,
            'to' => $this->to,
            'links' => $this->links,
        ];
    }
}
