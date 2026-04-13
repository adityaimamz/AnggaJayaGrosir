<?php

use App\Http\Controllers\Admin\CategoryManagementController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProductManagementController;
use App\Http\Controllers\Admin\WhatsappOrderManagementController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WhatsappCheckoutController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/product/{slug}', [ProductController::class, 'show'])->name('product.show');
Route::get('/cart', function () {
    return Inertia::render('Cart');
})->name('cart');
Route::get('/kontak', function () {
    return Inertia::render('Contact');
})->name('contact');
Route::get('/products', [HomeController::class, 'index'])->name('products.index');
Route::post('/checkout/wa-orders', [WhatsappCheckoutController::class, 'store'])->name('checkout.wa-orders.store');

Route::middleware(['auth', 'verified'])
    ->get('/dashboard', [DashboardController::class, 'index'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('admin.index');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/products', [ProductManagementController::class, 'index'])->name('admin.products.index');
    Route::post('/products', [ProductManagementController::class, 'store'])->name('admin.products.store');
    Route::put('/products/{product}', [ProductManagementController::class, 'update'])->name('admin.products.update');
    Route::delete('/products/{product}', [ProductManagementController::class, 'destroy'])->name('admin.products.destroy');
    Route::get('/categories', [CategoryManagementController::class, 'index'])->name('admin.categories.index');
    Route::post('/categories', [CategoryManagementController::class, 'store'])->name('admin.categories.store');
    Route::put('/categories/{category}', [CategoryManagementController::class, 'update'])->name('admin.categories.update');
    Route::delete('/categories/{category}', [CategoryManagementController::class, 'destroy'])->name('admin.categories.destroy');
    Route::get('/wa-orders', [WhatsappOrderManagementController::class, 'index'])->name('admin.wa-orders.index');
    // Admin profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
