<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin Product */
class ProductSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'variantTypes' => $this->variant_types ?? [],
            'variants' => $this->variants ?? [],
            'minPrice' => (float) $this->min_price,
            'maxPrice' => $this->max_price,
            'image' => $this->resolveImage(),
            'images' => $this->resolveImages(),
            'minOrder' => $this->min_order,
            'minOrderQty' => max(1, (int) ($this->min_order_qty ?? 1)),
            'badge' => $this->badge,
            'isNew' => (bool) ($this->is_new ?? false),
            'isBestSeller' => (bool) ($this->is_best_seller ?? false),
            'category' => $this->relationLoaded('category') && $this->category
                ? CategoryResource::make($this->category)->resolve()
                : null,
        ];
    }

    private function resolveImage(): ?string
    {
        if (! is_string($this->image) || $this->image === '') {
            return null;
        }

        if (str_starts_with($this->image, 'products/')) {
            /** @var FilesystemAdapter $storage */
            $storage = Storage::disk((string) config('media.disk', 'public'));

            return $storage->url($this->image);
        }

        return $this->image;
    }

    private function resolveImages(): array
    {
        $images = is_array($this->images) ? $this->images : [];

        if (count($images) === 0) {
            return array_values(array_filter([$this->resolveImage()]));
        }

        /** @var FilesystemAdapter $storage */
        $storage = Storage::disk((string) config('media.disk', 'public'));

        return array_values(array_map(static function (mixed $item) use ($storage): ?string {
            if (! is_string($item) || $item === '') {
                return null;
            }

            return str_starts_with($item, 'products/') ? $storage->url($item) : $item;
        }, $images));
    }
}
