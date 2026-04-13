<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_orders', function (Blueprint $table): void {
            $table->id();
            $table->string('customer_name', 120);
            $table->text('address');
            $table->string('expedition', 120);
            $table->decimal('total_amount', 12, 2);
            $table->json('items');
            $table->string('status', 30)->default('baru');
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_orders');
    }
};
