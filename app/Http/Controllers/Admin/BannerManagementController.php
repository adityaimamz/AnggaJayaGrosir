<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Support\ImageOptimizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

final class BannerManagementController extends Controller
{
    public function __construct(
        private readonly ImageOptimizer $imageOptimizer,
    ) {}

    public function index(): Response
    {
        $banners = Banner::query()
            ->orderBy('sort_order')
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('Admin/Banners', [
            'banners' => $banners,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'image_file' => ['required', 'image', 'max:2048'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $disk = config('media.disk', 'public');
        $imagePath = $this->imageOptimizer->storeOptimized(
            file: $request->file('image_file'),
            disk: $disk,
            directory: 'banners',
        );

        $nextSortOrder = ((int) Banner::query()->max('sort_order')) + 1;

        Banner::query()->create([
            'image_path' => $imagePath,
            'sort_order' => $nextSortOrder,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.banners.index')->with('success', 'Banner berhasil ditambahkan.');
    }

    public function update(Request $request, Banner $banner): RedirectResponse
    {
        $request->validate([
            'image_file' => ['nullable', 'image', 'max:2048'],
            'sort_order' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('banners', 'sort_order')->ignore($banner->id),
            ],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $payload = [
            'sort_order' => (int) $request->input('sort_order'),
            'is_active' => $request->boolean('is_active', true),
        ];

        if ($request->hasFile('image_file')) {
            $disk = config('media.disk', 'public');
            
            // Delete old
            $this->imageOptimizer->deleteMany([$banner->image_path], $disk);

            // Store new
            $imagePath = $this->imageOptimizer->storeOptimized(
                file: $request->file('image_file'),
                disk: $disk,
                directory: 'banners',
            );
            $payload['image_path'] = $imagePath;
        }

        $banner->update($payload);

        return redirect()->route('admin.banners.index')->with('success', 'Banner berhasil diperbarui.');
    }

    public function destroy(Banner $banner): RedirectResponse
    {
        $disk = config('media.disk', 'public');
        $this->imageOptimizer->deleteMany([$banner->image_path], $disk);
        
        $banner->delete();

        return redirect()->route('admin.banners.index')->with('success', 'Banner berhasil dihapus.');
    }
}
