<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

final class StoreWhatsappOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'address' => ['required', 'string', 'max:3000'],
            'expedition' => ['required', 'string', 'max:120'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer', 'exists:products,id'],
            'items.*.name' => ['required', 'string', 'max:255'],
            'items.*.size' => ['required', 'string', 'max:120'],
            'items.*.pack' => ['required', 'string', 'max:120'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $items = $this->input('items', []);

            if (!is_array($items) || count($items) === 0) {
                return;
            }

            $productMinimums = $this->resolveProductMinimums($items);

            foreach ($items as $index => $item) {
                $this->validateMinimumOrderForItem(
                    item: $item,
                    index: (int) $index,
                    productMinimums: $productMinimums,
                    validator: $validator,
                );
            }
        });
    }

    /**
     * @param array<int, mixed> $items
     * @return array<int, array{qty: int, unit: string}>
     */
    private function resolveProductMinimums(array $items): array
    {
        $productIds = collect($items)
            ->pluck('id')
            ->filter(static fn (mixed $id): bool => is_numeric($id))
            ->map(static fn (mixed $id): int => (int) $id)
            ->unique()
            ->values();

        return Product::query()
            ->whereIn('id', $productIds)
            ->get(['id', 'min_order_qty', 'min_order'])
            ->mapWithKeys(static fn (Product $product): array => [
                (int) $product->id => [
                    'qty' => max(1, (int) ($product->min_order_qty ?? 1)),
                    'unit' => trim((string) ($product->min_order ?? 'pack')),
                ],
            ])
            ->all();
    }

    /**
     * @param mixed $item
     * @param array<int, array{qty: int, unit: string}> $productMinimums
     */
    private function validateMinimumOrderForItem(
        mixed $item,
        int $index,
        array $productMinimums,
        Validator $validator,
    ): void {
        if (!is_array($item)) {
            return;
        }

        $productId = (int) ($item['id'] ?? 0);
        $quantity = (int) ($item['quantity'] ?? 0);
        $minimum = $productMinimums[$productId] ?? ['qty' => 1, 'unit' => 'pack'];
        $minQuantity = max(1, (int) $minimum['qty']);
        $unitLabel = trim((string) ($minimum['unit'] ?? 'pack')) ?: 'pack';

        if ($quantity >= $minQuantity) {
            return;
        }

        $message = "Minimal pesanan produk ini adalah {$minQuantity} {$unitLabel}.";

        $validator->errors()->add("items.{$index}.quantity", $message);
    }
}

