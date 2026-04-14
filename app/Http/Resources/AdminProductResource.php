<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;

/** @mixin Product */
final class AdminProductResource extends ProductSummaryResource
{
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'totalStock' => $this->total_stock,
            'imagePaths' => $this->resolveImagePaths(),

            'features' => $this->features ?? [],
            'featureDescriptions' => $this->feature_descriptions ?? [],
            'description' => $this->description,
            'isNew' => $this->is_new,
            'isBestSeller' => $this->is_best_seller,
            'isActive' => (bool) ($this->is_active ?? true),
        ];
    }

    private function resolveImagePaths(): array
    {
        $images = is_array($this->images) ? $this->images : [];

        if (count($images) === 0 && is_string($this->image) && $this->image !== '') {
            $images = [$this->image];
        }

        return array_values(array_filter($images, static fn (mixed $item): bool => is_string($item) && $item !== ''));
    }
}
