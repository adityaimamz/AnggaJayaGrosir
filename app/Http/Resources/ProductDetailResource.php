<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;

/** @mixin Product */
final class ProductDetailResource extends ProductSummaryResource
{
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'description' => $this->description,
            'features' => $this->features ?? [],
            'featureDescriptions' => $this->feature_descriptions ?? [],

            'totalStock' => $this->total_stock,
            'isNew' => $this->is_new,
            'isBestSeller' => $this->is_best_seller,
            'sizeGuide' => $this->size_guide,
        ];
    }
}
