<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreWhatsappOrderRequest;
use App\Models\Product;
use App\Models\WhatsappOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;

final class WhatsappCheckoutController extends Controller
{
    public function store(StoreWhatsappOrderRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $products = Product::query()
            ->whereIn('id', collect($validated['items'])->pluck('id')->all())
            ->get(['id', 'min_price', 'variant_types', 'variants'])
            ->keyBy('id');

        /** @var Collection<int, array<string, mixed>> $items */
        $items = collect($validated['items'])->map(function (array $item) use ($products): array {
            /** @var Product|null $product */
            $product = $products->get((int) $item['id']);
            $price = $product instanceof Product
                ? $this->resolveUnitPriceFromProduct($product, (string) $item['size'])
                : (float) $item['price'];
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

    private function resolveUnitPriceFromProduct(Product $product, string $sizeLabel): float
    {
        $variants = is_array($product->variants) ? $product->variants : [];
        if ($variants === []) {
            return (float) $product->min_price;
        }

        $variantTypes = is_array($product->variant_types) ? $product->variant_types : [];
        $normalizedSizeLabel = $this->normalizeLabel($sizeLabel);
        $fallbackPrice = (float) $product->min_price;

        foreach ($variants as $variant) {
            $resolvedPrice = $this->resolvePriceFromVariant(
                variant: $variant,
                variantTypes: $variantTypes,
                normalizedSizeLabel: $normalizedSizeLabel,
                fallbackPrice: $fallbackPrice,
            );

            if ($resolvedPrice !== null) {
                return $resolvedPrice;
            }
        }

        return $fallbackPrice;
    }

    private function resolvePriceFromVariant(
        mixed $variant,
        array $variantTypes,
        string $normalizedSizeLabel,
        float $fallbackPrice,
    ): ?float {
        $resolvedPrice = null;

        if (is_array($variant)) {
            $options = $variant['options'] ?? null;

            if (is_array($options)) {
                foreach ($this->buildVariantLabelCandidates($options, $variantTypes) as $candidate) {
                    if ($this->normalizeLabel($candidate) === $normalizedSizeLabel) {
                        $resolvedPrice = (float) ($variant['price'] ?? $fallbackPrice);
                        break;
                    }
                }
            }
        }

        return $resolvedPrice;
    }

    /**
     * @param array<string, mixed> $options
     * @param array<int, mixed> $variantTypes
     * @return array<int, string>
     */
    private function buildVariantLabelCandidates(array $options, array $variantTypes): array
    {
        $labelsFromTypes = [];
        foreach ($variantTypes as $typeName) {
            if (!is_string($typeName)) {
                continue;
            }

            $value = trim((string) ($options[$typeName] ?? ''));
            if ($value !== '') {
                $labelsFromTypes[] = $value;
            }
        }

        $labelsFromOptions = array_values(array_filter(
            array_map(static fn (mixed $value): string => trim((string) $value), $options),
            static fn (string $value): bool => $value !== '',
        ));

        return array_values(array_unique(array_filter([
            implode(' / ', $labelsFromTypes),
            implode(' / ', $labelsFromOptions),
            trim((string) ($options['Ukuran'] ?? '')),
        ], static fn (string $value): bool => $value !== '')));
    }

    private function normalizeLabel(string $label): string
    {
        return mb_strtolower(trim($label));
    }

    private function formatOrderCode(int $id): string
    {
        return 'WA-'.str_pad((string) $id, 6, '0', STR_PAD_LEFT);
    }
}

