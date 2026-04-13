<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            $table->decimal('price', 12, 2);
            $table->string('image', 500)->nullable();
            $table->text('description')->nullable();
            $table->json('features')->nullable();
            $table->json('sizes')->nullable();
            $table->string('min_order', 100)->nullable();
            $table->string('badge', 100)->nullable();
            $table->boolean('is_new')->default(false);
            $table->boolean('is_best_seller')->default(false);
            $table->integer('stock')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
