<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

final class CategorySeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->categoryDirectories() as $directory) {
            $name = basename($directory);

            // Check if this directory has subdirectories with images (e.g. CELANA DALAM/CEWEK, CELANA DALAM/COWOK)
            $subDirs = array_filter(
                File::directories($directory),
                fn (string $sub): bool => $this->hasImages($sub),
            );

            if ($subDirs !== []) {
                // Create sub-categories like "Celana Dalam Cewek", "Celana Dalam Cowok"
                foreach ($subDirs as $subDir) {
                    $subName = $name . ' ' . basename($subDir);

                    Category::query()->updateOrCreate(
                        ['slug' => Str::slug($subName)],
                        ['name' => $subName],
                    );
                }
            } else {
                // Flat directory — create single category
                Category::query()->updateOrCreate(
                    ['slug' => Str::slug($name)],
                    ['name' => $name],
                );
            }
        }
    }

    private function categoryDirectories(): array
    {
        $excluded = ['build', 'storage'];

        return array_values(array_filter(
            File::directories(public_path()),
            function (string $directory) use ($excluded): bool {
                $basename = basename($directory);

                if (in_array($basename, $excluded, true)) {
                    return false;
                }

                // Has images directly
                if ($this->hasImages($directory)) {
                    return true;
                }

                // Has subdirectories with images (e.g. CELANA DALAM/CEWEK)
                foreach (File::directories($directory) as $subDir) {
                    if ($this->hasImages($subDir)) {
                        return true;
                    }
                }

                return false;
            },
        ));
    }

    private function hasImages(string $directory): bool
    {
        foreach (File::allFiles($directory) as $file) {
            if (in_array(strtolower($file->getExtension()), ['jpg', 'jpeg', 'png', 'webp', 'avif'], true)) {
                return true;
            }
        }

        return false;
    }
}
