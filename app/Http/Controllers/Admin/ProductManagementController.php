<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Data\PaginatedData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\AdminProductResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Support\ImageOptimizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

final class ProductManagementController extends Controller
{
    public function __construct(
        private readonly ImageOptimizer $imageOptimizer,
    ) {}

    public function index(Request $request): Response
    {
        $categoryId = (int) $request->input('category_id', 0);
        $search = trim((string) $request->input('search', ''));
        $escapedSearch = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $search);

        $products = Product::query()
            ->with(['category:id,name,slug', 'brand:id,kode'])
            ->when($search !== '', static function ($query) use ($escapedSearch): void {
                $query->where(static function ($subQuery) use ($escapedSearch): void {
                    $subQuery->where('name', 'like', "%{$escapedSearch}%")
                        ->orWhere('slug', 'like', "%{$escapedSearch}%")
                        ->orWhereHas('category', static fn ($categoryQuery) => $categoryQuery->where('name', 'like', "%{$escapedSearch}%"));
                });
            })
            ->when($categoryId > 0, static fn ($query) => $query->where('category_id', $categoryId))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $products->setCollection(
            $products->getCollection()->map(
                static fn (Product $product): array => AdminProductResource::make($product)->resolve(),
            ),
        );

        return Inertia::render('Admin/Products', [
            'products' => PaginatedData::fromLengthAwarePaginator($products)->toArray(),
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'brands' => Brand::query()->orderBy('kode')->get(['id', 'kode', 'keterangan']),
            'filters' => [
                'category_id' => $categoryId > 0 ? $categoryId : null,
                'search' => $search !== '' ? $search : null,
            ],
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $disk = $this->disk();

        $images = $this->resolveImages(
            validated: $validated,
            disk: $disk,
            existing: [],
        );

        Product::query()->create([
            ...$this->buildPayload($validated),
            'image' => $images[0] ?? null,
            'images' => $images,
        ]);

        return redirect()
            ->to($this->buildRedirectUrl($request))
            ->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $validated = $request->validated();
        $disk = $this->disk();

        $existingImages = array_values(array_filter(is_array($product->images) ? $product->images : [$product->image]));

        $images = $this->resolveImages(
            validated: $validated,
            disk: $disk,
            existing: $existingImages,
        );

        $product->update([
            ...$this->buildPayload($validated),
            'image' => $images[0] ?? null,
            'images' => $images,
        ]);

        return redirect()
            ->to($this->buildRedirectUrl($request))
            ->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $paths = array_values(array_filter(is_array($product->images) ? $product->images : [$product->image]));
        $this->imageOptimizer->deleteMany($paths, $this->disk());

        $product->delete();

        return redirect()
            ->to($this->buildRedirectUrl($request))
            ->with('success', 'Produk berhasil dihapus.');
    }

    private function buildPayload(array $validated): array
    {
        $variants = $validated['variants'] ?? [];
        $minPrice = empty($variants) ? 0 : min(array_column($variants, 'price'));

        return [
            'category_id' => (int) $validated['category_id'],
            'brand_id' => isset($validated['brand_id']) ? (int) $validated['brand_id'] : null,
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'min_price' => (float) $minPrice,
            'variant_types' => $validated['variant_types'] ?? [],
            'variants' => $variants,
            'description' => $validated['description'] ?? null,
            'min_order' => $validated['min_order'] ?? null,
            'min_order_qty' => max(1, (int) ($validated['min_order_qty'] ?? 1)),
            'badge' => $validated['badge'] ?? null,
            'is_new' => (bool) ($validated['is_new'] ?? false),
            'is_best_seller' => (bool) ($validated['is_best_seller'] ?? false),
            'is_active' => (bool) ($validated['is_active'] ?? true),
            'features' => $validated['features'] ?? [],
            'feature_descriptions' => $validated['feature_descriptions'] ?? [],
            'size_guide' => $validated['size_guide'] ?? null,
        ];
    }

    private function resolveImages(array $validated, string $disk, array $existing): array
    {
        $cleanExisting = array_values(array_filter($existing, static fn (mixed $item): bool => is_string($item) && $item !== ''));

        $requestedRetained = $validated['retained_image_paths'] ?? $cleanExisting;
        $retainedCandidates = is_array($requestedRetained)
            ? array_values(array_filter($requestedRetained, static fn (mixed $item): bool => is_string($item) && $item !== ''))
            : $cleanExisting;
        $retainedExisting = array_values(array_intersect($cleanExisting, $retainedCandidates));

        $result = $retainedExisting;
        $remainingSlots = max(0, 5 - count($retainedExisting));

        $fileImages = $validated['image_files'] ?? [];
        if (is_array($fileImages) && $remainingSlots > 0) {
            foreach ($fileImages as $file) {
                if ($remainingSlots <= 0) {
                    break;
                }

                if ($file instanceof UploadedFile) {
                    $result[] = $this->imageOptimizer->storeOptimized(
                        file: $file,
                        disk: $disk,
                        directory: 'products',
                    );
                    $remainingSlots--;
                }
            }
        }

        $result = array_values(array_unique(array_slice($result, 0, 5)));

        $deleted = array_diff($cleanExisting, $result);
        if (count($deleted) > 0) {
            $this->imageOptimizer->deleteMany(array_values($deleted), $disk);
        }

        return $result;
    }

    private function disk(): string
    {
        return (string) config('media.disk', 'public');
    }

    private function buildRedirectUrl(Request $request): string
    {
        $params = [];

        $categoryId = (int) $request->input('_filter_category_id', $request->input('category_id', 0));
        if ($categoryId > 0) {
            $params['category_id'] = $categoryId;
        }

        $search = trim((string) $request->input('_filter_search', $request->input('search', '')));
        if ($search !== '') {
            $params['search'] = $search;
        }

        $page = (int) $request->input('_filter_page', $request->input('page', 1));
        if ($page > 1) {
            $params['page'] = $page;
        }

        $base = route('admin.products.index');

        return !empty($params)
            ? $base . '?' . http_build_query($params)
            : $base;
    }
}
