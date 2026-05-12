<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Data\PaginatedData;
use App\Http\Controllers\Controller;
use App\Http\Resources\AdminWhatsappOrderResource;
use App\Models\WhatsappOrder;
use Inertia\Inertia;
use Inertia\Response;

final class WhatsappOrderManagementController extends Controller
{
    public function index(): Response
    {
        $orders = WhatsappOrder::query()
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $orders->setCollection(
            $orders->getCollection()->map(
                static fn (WhatsappOrder $order): array => AdminWhatsappOrderResource::make($order)->resolve(),
            ),
        );

        return Inertia::render('Admin/WaOrders', [
            'orders' => PaginatedData::fromLengthAwarePaginator($orders)->toArray(),
        ]);
    }
    public function bulkDestroy(\Illuminate\Http\Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['nullable', 'array'],
            'ids.*' => ['integer', 'exists:whatsapp_orders,id'],
            'delete_all' => ['nullable', 'boolean'],
        ]);

        if (!empty($validated['delete_all'])) {
            WhatsappOrder::query()->delete();

            return redirect()
                ->route('admin.wa-orders.index')
                ->with('success', 'Semua riwayat pesanan berhasil dihapus.');
        }

        if (!empty($validated['ids'])) {
            WhatsappOrder::whereIn('id', $validated['ids'])->delete();

            return redirect()
                ->route('admin.wa-orders.index')
                ->with('success', count($validated['ids']) . ' pesanan berhasil dihapus.');
        }

        return redirect()->route('admin.wa-orders.index');
    }
}

