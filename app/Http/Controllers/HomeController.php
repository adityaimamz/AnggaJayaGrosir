<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\PaginatedData;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductSummaryResource;
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

        return Inertia::render('PublicHome', [
            'products' => PaginatedData::fromLengthAwarePaginator($products)->toArray(),
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'sort' => $sort,
            ],
        ]);
    }
}
