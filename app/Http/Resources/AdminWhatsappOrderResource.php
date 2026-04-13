<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\WhatsappOrder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin WhatsappOrder */
final class AdminWhatsappOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = is_array($this->items) ? $this->items : [];

        $totalItems = collect($items)->sum(
            static fn (mixed $item): int => is_array($item) ? (int) ($item['quantity'] ?? 0) : 0,
        );

        return [
            'id' => $this->id,
            'orderCode' => $this->formatOrderCode((int) $this->id),
            'customerName' => $this->customer_name,
            'address' => $this->address,
            'expedition' => $this->expedition,
            'totalAmount' => (float) $this->total_amount,
            'status' => $this->status,
            'items' => $items,
            'totalItems' => $totalItems,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }

    private function formatOrderCode(int $id): string
    {
        return 'WA-'.str_pad((string) $id, 6, '0', STR_PAD_LEFT);
    }
}

