<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\ProductDetailResource;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

final class ProductController extends Controller
{
    public function show(string $slug): Response
    {
        $product = Product::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->with(['category:id,name,slug', 'brand:id,kode,keterangan'])
            ->firstOrFail();

        return Inertia::render('ProductDetail', [
            'product' => ProductDetailResource::make($product)->resolve(),
        ]);
    }
}
