<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\PaginatedData;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductSummaryResource;
use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $category = trim((string) $request->query('category', ''));
        $brand = trim((string) $request->query('brand', ''));
        $sort = trim((string) $request->query('sort', 'newest'));

        $products = Product::query()
            ->where('is_active', true)
            ->with('category:id,name,slug')
            ->when($search !== '', static function ($query) use ($search): void {
                $query->where(static function ($subQuery) use ($search): void {
                    $subQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhereHas('category', static fn ($categoryQuery) => $categoryQuery->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($category !== '', static fn ($query) => $query->whereHas('category', static fn ($categoryQuery) => $categoryQuery->where('slug', $category)))
            ->when($brand !== '', static fn ($query) => $query->whereHas('brand', static fn ($brandQuery) => $brandQuery->where('kode', $brand)))
            ->when($sort === 'best_seller', static fn ($query) => $query->where('is_best_seller', true)->latest())
            ->when($sort === 'newest', static fn ($query) => $query->latest())
            ->when(!in_array($sort, ['newest', 'best_seller']), static fn ($query) => $query->latest())
            ->paginate(16)
            ->withQueryString();

        $products->setCollection(
            $products->getCollection()->map(
                static fn (Product $product): array => ProductSummaryResource::make($product)->resolve(),
            ),
        );

        $categories = Category::query()
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(static fn (Category $category): array => CategoryResource::make($category)->resolve());

        $brands = Brand::query()
            ->orderBy('kode')
            ->get(['id', 'kode', 'keterangan']);

        $banners = Banner::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id', 'desc')
            ->get(['id', 'image_path']);

        return Inertia::render('PublicHome', [
            'banners' => $banners,
            'products' => PaginatedData::fromLengthAwarePaginator($products)->toArray(),
            'categories' => $categories,
            'brands' => $brands,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'brand' => $brand,
                'sort' => $sort,
            ],
        ]);
    }
}
