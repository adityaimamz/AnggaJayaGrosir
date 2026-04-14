<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Support\ImageOptimizer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

final class ProductSeeder extends Seeder
{
    private const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];

    public function run(): void
    {
        $disk = (string) config('media.disk', 'public');
        /** @var ImageOptimizer $optimizer */
        $optimizer = app(ImageOptimizer::class);

        foreach ($this->categoryDirectories() as $directory) {
            $dirName = basename($directory);

            // Check if this directory has subdirectories with images
            $subDirs = array_filter(
                File::directories($directory),
                fn (string $sub): bool => $this->hasImages($sub),
            );

            if ($subDirs !== []) {
                // Process each subdirectory as its own category
                foreach ($subDirs as $subDir) {
                    $categoryName = $dirName . ' ' . basename($subDir);
                    $this->seedProductsFromDirectory($subDir, $categoryName, $disk, $optimizer);
                }
            } else {
                // Flat directory — process directly
                $this->seedProductsFromDirectory($directory, $dirName, $disk, $optimizer);
            }
        }
    }

    private function seedProductsFromDirectory(
        string $directory,
        string $categoryName,
        string $disk,
        ImageOptimizer $optimizer,
    ): void {
        $category = Category::query()->where('slug', Str::slug($categoryName))->first();

        if ($category === null) {
            return;
        }

        foreach (File::allFiles($directory) as $file) {
            if (! $this->isImage($file->getExtension())) {
                continue;
            }

            $originalName = pathinfo($file->getFilename(), PATHINFO_FILENAME);

            // Clean up names: remove timestamps like _20260212_192155_0000
            $cleanedName = (string) preg_replace('/_\d{8}_\d{6}_\d{4}$/', '', $originalName);

            $normalizedName = Str::of($cleanedName)
                ->replace(['_', '-'], ' ')
                ->squish()
                ->title()
                ->toString();

            $slug = Str::slug($category->slug.'-'.$cleanedName);
            $targetPath = sprintf('products/%s/%s.webp', $category->slug, sha1_file($file->getRealPath()));
            $storedPath = $optimizer->storeOptimizedFromPath(
                sourcePath: $file->getRealPath(),
                disk: $disk,
                targetPath: $targetPath,
            );

            Product::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'category_id' => $category->id,
                    'name' => $normalizedName,
                    'min_price' => 0,
                    'image' => $storedPath,
                    'images' => [$storedPath],
                    'description' => null,
                    'features' => [],
                    'feature_descriptions' => [],
                    'variant_types' => ['Ukuran'],
                    'variants' => [[
                        'options' => ['Ukuran' => 'All Size'],
                        'price' => 0,
                        'stock' => 0,
                    ]],
                    'min_order' => null,
                    'min_order_qty' => 1,
                    'is_new' => false,
                    'is_best_seller' => false,
                    'badge' => null,
                ],
            );
        }
    }

    private function categoryDirectories(): array
    {
        $excluded = ['build', 'storage'];

        return array_values(array_filter(
            File::directories(public_path()),
            function (string $directory) use ($excluded): bool {
                $basename = basename($directory);
                $shouldInclude = ! in_array($basename, $excluded, true);

                if ($shouldInclude && ! $this->hasImages($directory)) {
                    $hasImagesInSubDirectory = false;
                    foreach (File::directories($directory) as $subDir) {
                        if ($this->hasImages($subDir)) {
                            $hasImagesInSubDirectory = true;
                            break;
                        }
                    }

                    $shouldInclude = $hasImagesInSubDirectory;
                }

                return $shouldInclude;
            },
        ));
    }

    private function hasImages(string $directory): bool
    {
        foreach (File::allFiles($directory) as $file) {
            if ($this->isImage($file->getExtension())) {
                return true;
            }
        }

        return false;
    }

    private function isImage(string $extension): bool
    {
        return in_array(strtolower($extension), self::IMAGE_EXTENSIONS, true);
    }
}
