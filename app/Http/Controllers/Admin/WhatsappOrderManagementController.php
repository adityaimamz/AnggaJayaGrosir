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
}

