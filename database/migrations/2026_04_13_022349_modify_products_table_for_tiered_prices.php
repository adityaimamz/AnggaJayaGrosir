<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->json('prices')->nullable()->after('description');
        });

        // Migrate existing data
        $products = DB::table('products')->get();
        foreach ($products as $product) {
            $sizesStr = $product->sizes ?? '';
            $sizes = json_decode($sizesStr, true) ?? [];
            if (!is_array($sizes) || empty($sizes)) {
                $sizes = ['S']; // default
            }

            $prices = array_map(function ($size) use ($product) {
                return ['size' => (string) $size, 'price' => (float) $product->price];
            }, $sizes);
            
            DB::table('products')
                ->where('id', $product->id)
                ->update(['prices' => json_encode($prices)]);
        }

        // In SQLite (which might be used in tests), dropColumn can be problematic if multiple
        // We add min_price and drop price and sizes
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('min_price', 12, 2)->nullable()->after('slug');
        });

        DB::statement('UPDATE products SET min_price = price');

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['price', 'sizes']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('price', 12, 2)->default(0);
            $table->json('sizes')->nullable();
        });

        $products = DB::table('products')->get();
        foreach ($products as $product) {
            $pricesStr = $product->prices ?? '';
            $prices = json_decode($pricesStr, true) ?? [];
            $price = 0;
            $sizes = [];
            if (is_array($prices) && !empty($prices)) {
                $price = $prices[0]['price'] ?? 0;
                $sizes = array_column($prices, 'size');
            }
            
            DB::table('products')
                ->where('id', $product->id)
                ->update([
                    'price' => $price,
                    'sizes' => json_encode($sizes)
                ]);
        }

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['prices', 'min_price']);
        });
    }
};
