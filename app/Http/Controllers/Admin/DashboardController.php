<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Data\AdminDashboardData;
use App\Data\AdminDashboardStatsData;
use App\Http\Controllers\Controller;
use App\Http\Resources\AdminProductResource;
use App\Models\Category;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

final class DashboardController extends Controller
{
    public function index(): Response
    {
        $products = Product::query()
            ->with('category:id,name,slug')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $products->setCollection(
            $products->getCollection()->map(
                static fn (Product $product): array => AdminProductResource::make($product)->resolve(),
            ),
        );

        $statsData = Product::query()->get(['variants', 'min_price']);

        $totalStockUnits = 0;
        $stockValue = 0.0;
        $lowStockProducts = 0;

        foreach ($statsData as $product) {
            $productStock = $product->total_stock;
            $totalStockUnits += $productStock;

            if ($productStock < 120) {
                $lowStockProducts++;
            }

            $variants = is_array($product->variants) ? $product->variants : [];
            foreach ($variants as $variant) {
                $stockValue += ((float) ($variant['price'] ?? 0)) * ((int) ($variant['stock'] ?? 0));
            }
        }

        $stats = new AdminDashboardStatsData(
            totalProducts: Product::query()->count(),
            totalCategories: Category::query()->count(),
            totalStockUnits: $totalStockUnits,
            lowStockProducts: $lowStockProducts,
            stockValue: $stockValue,
        );

        $dashboard = new AdminDashboardData(
            stats: $stats,
            products: $products,
        );

        return Inertia::render('Admin/Dashboard', $dashboard->toArray());
    }
}
