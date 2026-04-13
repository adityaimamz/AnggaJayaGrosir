<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreWhatsappOrderRequest;
use App\Models\WhatsappOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;

final class WhatsappCheckoutController extends Controller
{
    public function store(StoreWhatsappOrderRequest $request): JsonResponse
    {
        $validated = $request->validated();

        /** @var Collection<int, array<string, mixed>> $items */
        $items = collect($validated['items'])->map(static function (array $item): array {
            $price = (float) $item['price'];
            $quantity = (int) $item['quantity'];

            return [
                'id' => (int) $item['id'],
                'name' => (string) $item['name'],
                'size' => (string) $item['size'],
                'pack' => (string) $item['pack'],
                'price' => $price,
                'quantity' => $quantity,
                'subtotal' => $price * $quantity,
            ];
        })->values();

        $totalAmount = (float) $items->sum(
            static fn (array $item): float => (float) $item['subtotal'],
        );

        $order = WhatsappOrder::query()->create([
            'customer_name' => (string) $validated['name'],
            'address' => (string) $validated['address'],
            'expedition' => (string) $validated['expedition'],
            'total_amount' => $totalAmount,
            'items' => $items->all(),
            'status' => 'baru',
        ]);

        return response()->json([
            'data' => [
                'id' => $order->id,
                'orderCode' => $this->formatOrderCode((int) $order->id),
                'totalAmount' => (float) $order->total_amount,
            ],
        ], 201);
    }

    private function formatOrderCode(int $id): string
    {
        return 'WA-'.str_pad((string) $id, 6, '0', STR_PAD_LEFT);
    }
}

