<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BrandManagementController extends Controller
{
    public function index(): JsonResponse
    {
        $brands = Brand::query()
            ->orderBy('kode')
            ->get(['id', 'kode', 'keterangan']);

        return response()->json(['data' => $brands]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:50', 'unique:brands,kode'],
            'keterangan' => ['nullable', 'string', 'max:255'],
        ]);

        $brand = Brand::query()->create([
            'kode' => $validated['kode'],
            'keterangan' => $validated['keterangan'] ?? '',
        ]);

        return response()->json(['data' => $brand], 201);
    }

    public function update(Request $request, Brand $brand): JsonResponse
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:50', 'unique:brands,kode,' . $brand->id],
            'keterangan' => ['nullable', 'string', 'max:255'],
        ]);

        $brand->update([
            'kode' => $validated['kode'],
            'keterangan' => $validated['keterangan'] ?? '',
        ]);

        return response()->json(['data' => $brand]);
    }

    public function destroy(Brand $brand): JsonResponse
    {
        $brand->delete();

        return response()->json(['message' => 'Merek berhasil dihapus.']);
    }
}
