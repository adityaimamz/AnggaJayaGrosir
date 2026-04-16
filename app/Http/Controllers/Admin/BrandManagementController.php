<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

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
        $statusCode = 200;
        $payload = ['message' => 'Merek berhasil dihapus.'];

        try {
            DB::transaction(function () use ($brand): void {
                // Keep delete resilient even when production FK action is not nullOnDelete.
                $brand->products()->update(['brand_id' => null]);
                $brand->delete();
            });
        } catch (QueryException $exception) {
            $errorCode = (int) ($exception->errorInfo[1] ?? 0);

            if (in_array($errorCode, [1451, 1452], true)) {
                $statusCode = 409;
                $payload = [
                    'message' => 'Merek tidak bisa dihapus karena masih dipakai oleh data lain.',
                ];
            } else {
                Log::error('Brand delete query failed.', [
                    'brand_id' => $brand->id,
                    'error' => $exception->getMessage(),
                    'sql_error_code' => $errorCode,
                ]);

                $statusCode = 500;
                $payload = [
                    'message' => 'Gagal menghapus merek karena masalah database. Coba lagi beberapa saat.',
                ];
            }
        } catch (Throwable $exception) {
            Log::error('Brand delete failed.', [
                'brand_id' => $brand->id,
                'error' => $exception->getMessage(),
            ]);

            $statusCode = 500;
            $payload = [
                'message' => 'Terjadi kesalahan saat menghapus merek.',
            ];
        }

        return response()->json($payload, $statusCode);
    }
}
