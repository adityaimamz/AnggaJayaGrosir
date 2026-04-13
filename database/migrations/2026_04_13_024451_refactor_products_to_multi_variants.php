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
            $table->json('variant_types')->nullable()->after('features');
            $table->json('variants')->nullable()->after('variant_types');
        });

        // Migrate data
        $products = DB::table('products')->get();
        foreach ($products as $product) {
            $prices = json_decode($product->prices ?? '[]', true) ?: [];
            $stock = (int) ($product->stock ?? 0);
            
            $variantTypes = ['Ukuran'];
            $variants = [];
            
            if (empty($prices)) {
                // Dummy fallback if prices is empty
                $variants[] = [
                    'options' => ['Ukuran' => 'All Size'],
                    'price' => (float) ($product->min_price ?? 0),
                    'stock' => $stock
                ];
            } else {
                foreach ($prices as $p) {
                    $variants[] = [
                        'options' => ['Ukuran' => $p['size'] ?? 'M'],
                        'price' => (float) ($p['price'] ?? 0),
                        'stock' => $stock // In legacy, stock was general, so we carry it over to all variants temporarily or divide it? Best to just set it per variant, admin can fix it.
                    ];
                }
            }
            
            DB::table('products')->where('id', $product->id)->update([
                'variant_types' => json_encode($variantTypes),
                'variants' => json_encode($variants),
            ]);
        }

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('prices');
            $table->dropColumn('stock');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->json('prices')->nullable()->after('images');
            $table->integer('stock')->default(0)->after('min_price');
        });

        $products = DB::table('products')->get();
        foreach ($products as $product) {
            $variants = json_decode($product->variants ?? '[]', true) ?: [];
            
            $prices = [];
            $totalStock = 0;
            
            foreach ($variants as $v) {
                $prices[] = [
                    'size' => $v['options']['Ukuran'] ?? 'M',
                    'price' => $v['price'] ?? 0
                ];
                $totalStock += (int) ($v['stock'] ?? 0);
            }
            
            DB::table('products')->where('id', $product->id)->update([
                'prices' => json_encode($prices),
                'stock' => $totalStock > 0 ? $totalStock : 0,
            ]);
        }

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('variant_types');
            $table->dropColumn('variants');
        });
    }
};
