<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected $fillable = [
        'category_id', 'brand_id', 'name', 'slug', 'min_price', 'image', 'description',
        'images', 'features', 'feature_descriptions', 'size_guide', 'variant_types', 'variants', 'min_order', 'min_order_qty', 'badge', 'is_new', 'is_best_seller', 'is_active',
    ];

    protected $casts = [
        'images' => 'array',
        'features' => 'array',
        'feature_descriptions' => 'array',
        'size_guide' => 'array',
        'variant_types' => 'array',
        'variants' => 'array',
        'is_new' => 'boolean',
        'is_best_seller' => 'boolean',
        'is_active' => 'boolean',
        'min_order_qty' => 'integer',
        'min_price' => 'decimal:2',
    ];

    public function getMaxPriceAttribute(): float
    {
        $variants = is_array($this->variants) ? $this->variants : [];
        if (empty($variants)) {
            return (float) $this->min_price;
        }

        $priceValues = array_column($variants, 'price');
        return (float) max($priceValues);
    }

    public function getTotalStockAttribute(): int
    {
        $variants = is_array($this->variants) ? $this->variants : [];
        $total = 0;
        foreach ($variants as $item) {
            $total += (int) ($item['stock'] ?? 0);
        }
        return $total;
    }

    public function getSizesAttribute(): array
    {
        $variants = is_array($this->variants) ? $this->variants : [];
        $sizes = [];
        foreach ($variants as $v) {
            if (isset($v['options']['Ukuran']) && !in_array($v['options']['Ukuran'], $sizes)) {
                $sizes[] = $v['options']['Ukuran'];
            }
        }
        return $sizes;
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }
}
