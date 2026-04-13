<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

final class ImageOptimizer
{
    public function storeOptimized(
        UploadedFile $file,
        string $disk,
        string $directory = 'products',
        ?string $oldPath = null,
    ): string {
        $filename = sprintf(
            '%s/%s.%s',
            trim($directory, '/'),
            bin2hex(random_bytes(16)),
            $this->supportsOptimization() ? 'webp' : strtolower($file->getClientOriginalExtension() ?: 'jpg'),
        );

        /** @var FilesystemAdapter $storage */
        $storage = Storage::disk($disk);

        if ($this->supportsOptimization()) {
            $manager = new ImageManager(new Driver);
            $image = $manager->read($file->getRealPath());

            $maxWidth = (int) config('media.images.max_width', 1600);
            if ($image->width() > $maxWidth) {
                $image->scale(width: $maxWidth);
            }

            $quality = (int) config('media.images.webp_quality', 78);
            $encoded = $image->toWebp($quality);
            $storage->put($filename, (string) $encoded, ['visibility' => 'public']);
        } else {
            $storage->putFileAs(trim($directory, '/'), $file, basename($filename), ['visibility' => 'public']);
        }

        if ($oldPath !== null && str_starts_with($oldPath, 'products/')) {
            $storage->delete($oldPath);
        }

        return $filename;
    }

    public function deleteMany(array $paths, string $disk): void
    {
        /** @var FilesystemAdapter $storage */
        $storage = Storage::disk($disk);

        foreach ($paths as $path) {
            if (is_string($path) && str_starts_with($path, 'products/')) {
                $storage->delete($path);
            }
        }
    }

    public function storeOptimizedFromPath(
        string $sourcePath,
        string $disk,
        string $targetPath,
    ): string {
        /** @var FilesystemAdapter $storage */
        $storage = Storage::disk($disk);

        if ($this->supportsOptimization()) {
            $manager = new ImageManager(new Driver);
            $image = $manager->read($sourcePath);

            $maxWidth = (int) config('media.images.max_width', 1600);
            if ($image->width() > $maxWidth) {
                $image->scale(width: $maxWidth);
            }

            $quality = (int) config('media.images.webp_quality', 78);
            $encoded = $image->toWebp($quality);
            $storage->put($targetPath, (string) $encoded, ['visibility' => 'public']);

            return $targetPath;
        }

        $extension = strtolower(pathinfo($sourcePath, PATHINFO_EXTENSION) ?: 'jpg');
        $fallbackPath = preg_replace('/\.webp$/i', '.'.$extension, $targetPath) ?: $targetPath;
        $storage->put($fallbackPath, (string) file_get_contents($sourcePath), ['visibility' => 'public']);

        return $fallbackPath;
    }

    private function supportsOptimization(): bool
    {
        return extension_loaded('gd');
    }
}
