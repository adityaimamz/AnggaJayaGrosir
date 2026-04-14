# Rencana Perbaikan Keamanan — Angga Jaya

Berdasarkan hasil [audit keamanan](file:///C:/Users/5CG4310VMV/.gemini/antigravity/brain/7d64df3f-2e8a-41b6-9e6b-e8e0950263b5/security_audit.md), berikut rencana perbaikan yang dikelompokkan berdasarkan prioritas.

---

## P0 — Kritis (Konfigurasi Environment)

### Temuan #1 & #2: `APP_DEBUG` dan `SESSION_ENCRYPT`

Ini adalah perubahan konfigurasi di `.env` **production** (cPanel), bukan di kode. Saya akan membuat file `.env.production.example` sebagai panduan agar Anda tidak lupa saat deploy.

#### [NEW] [.env.production.example](file:///d:/PROJECT/angga-jaya/.env.production.example)
File template berisi nilai-nilai yang **wajib** diubah di production:
```env
APP_ENV=production
APP_DEBUG=false
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true
```

> [!IMPORTANT]
> File ini hanya panduan. Anda tetap harus mengedit `.env` asli di cPanel secara manual.

---

## P1 — Tinggi (Perubahan Kode)

### Temuan #3: Rate Limiting Endpoint Checkout

#### [MODIFY] [web.php](file:///d:/PROJECT/angga-jaya/routes/web.php)
Tambahkan middleware `throttle:10,1` pada route `POST /checkout/wa-orders`:
```diff
-Route::post('/checkout/wa-orders', ...)->name(...);
+Route::post('/checkout/wa-orders', ...)->middleware('throttle:10,1')->name(...);
```
Efek: Maksimal 10 request checkout per menit per IP. Jika melebihi, Laravel otomatis mengembalikan response `429 Too Many Requests`.

---

### Temuan #4: Proteksi Admin (Pendekatan Non-Registrasi)

Karena saat ini aplikasi hanya diperuntukkan bagi admin dan tidak ada fitur user umum, kita akan menggunakan pendekatan **menutup akses registrasi publik** alih-alih menambah kolom database.

#### [MODIFY] [auth.php](file:///d:/PROJECT/angga-jaya/routes/auth.php)
Komentar atau hapus route registrasi:
```php
// Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
// Route::post('register', [RegisteredUserController::class, 'store']);
```
Dengan ini, tidak ada akun baru yang bisa dibuat secara publik. Hanya akun yang sudah terdaftar (melalui database) yang bisa login.

#### [MODIFY] 4 file FormRequest Admin:
Tetap perbarui `authorize()` untuk memastikan integritas (mengecek user terautentikasi):
```php
public function authorize(): bool
{
    return $this->check(); // Laravel base FormRequest check
}
```
Atau cukup andalkan middleware `auth` di route. Saya akan memastikan method `authorize()` di semua FormRequest merujuk pada pengecekan autentikasi yang benar.

---

### Temuan #5: Escape LIKE Wildcards

#### [MODIFY] [HomeController.php](file:///d:/PROJECT/angga-jaya/app/Http/Controllers/HomeController.php)
#### [MODIFY] [ProductManagementController.php](file:///d:/PROJECT/angga-jaya/app/Http/Controllers/Admin/ProductManagementController.php)

Pada kedua file, tambahkan helper escape sebelum query:
```php
$escapedSearch = str_replace(['%', '_'], ['\\%', '\\_'], $search);
// lalu gunakan $escapedSearch di semua ->where('...', 'like', "%{$escapedSearch}%")
```

---

## P2 — Sedang

### Temuan #6: Validasi Harga Server-Side

#### [MODIFY] [WhatsappCheckoutController.php](file:///d:/PROJECT/angga-jaya/app/Http/Controllers/WhatsappCheckoutController.php)

Setelah validasi, cocokkan harga dari client dengan harga sebenarnya di database:
```php
$product = Product::find($item['id']);
$matchedVariant = collect($product->variants)->first(fn($v) =>
    ($v['options']['Ukuran'] ?? '') === $item['size']
);
$actualPrice = $matchedVariant['price'] ?? $product->min_price;
// Gunakan $actualPrice, bukan $item['price']
```

> [!IMPORTANT]
> Perubahan ini memerlukan pencocokan varian yang tepat. Karena struktur `size` di checkout bisa berupa gabungan beberapa opsi (mis. "L / Merah"), saya akan membuat logika **fallback** — jika varian tidak ditemukan, gunakan `min_price` produk sebagai harga teraman.

---

### Temuan #7: Security Headers

#### [NEW] [SecurityHeaders.php](file:///d:/PROJECT/angga-jaya/app/Http/Middleware/SecurityHeaders.php)
Middleware baru yang menambahkan header keamanan pada setiap response:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

#### [MODIFY] [bootstrap/app.php](file:///d:/PROJECT/angga-jaya/bootstrap/app.php)
Daftarkan middleware baru ke stack `web`.

---

## P3 — Rendah (Hardening)

### Temuan #8: Retained Image Path Regex

#### [MODIFY] [UpdateProductRequest.php](file:///d:/PROJECT/angga-jaya/app/Http/Requests/Admin/UpdateProductRequest.php)
Tambahkan regex validation pada `retained_image_paths.*`:
```diff
-'retained_image_paths.*' => ['required', 'string', 'max:500'],
+'retained_image_paths.*' => ['required', 'string', 'max:500', 'regex:/^products\/.+$/'],
```
Ini memastikan path hanya boleh dimulai dengan `products/`, mencegah path traversal.

---

## Ringkasan File yang Diubah

| File | Aksi | Prioritas |
|---|---|---|
| `.env.production.example` | NEW | P0 |
| `routes/web.php` | MODIFY — throttle checkout | P1 |
| `routes/auth.php` | MODIFY — matikan registrasi | P1 |
| `app/Http/Requests/Admin/StoreProductRequest.php` | MODIFY — authorize | P1 |
| `app/Http/Requests/Admin/UpdateProductRequest.php` | MODIFY — authorize + regex | P1+P3 |
| `app/Http/Requests/Admin/StoreCategoryRequest.php` | MODIFY — authorize | P1 |
| `app/Http/Requests/Admin/UpdateCategoryRequest.php` | MODIFY — authorize | P1 |
| `app/Http/Controllers/HomeController.php` | MODIFY — escape LIKE | P1 |
| `app/Http/Controllers/Admin/ProductManagementController.php` | MODIFY — escape LIKE | P1 |
| `app/Http/Controllers/WhatsappCheckoutController.php` | MODIFY — harga server-side | P2 |
| `app/Http/Middleware/SecurityHeaders.php` | NEW | P2 |
| `bootstrap/app.php` | MODIFY — register middleware | P2 |

---

## Verification Plan

### Automated
```bash
php artisan test             # Pastikan tidak ada test yang rusak (khususnya login)
```

### Manual
- Coba akses `/register` → harus 404 atau dialihkan (tergantung cara pemutusan route)
- Kirim 15 request checkout berturut-turut → request ke-11 harus mendapat response 429
- Cek response headers di browser DevTools (Network tab) → pastikan `X-Frame-Options` dll muncul
- Cek apakah harga di keranjang masih bisa dimanipulasi (coba checkout dengan harga Rp 0 di localStorage) → harusnya harga tetap betul di sisi admin.

---

> [!TIP]
> Setelah semua kode berhasil, jangan lupa jalankan perintah di server production:
> ```bash
> php artisan migrate
> # Lalu update user admin:
> php artisan tinker --execute="App\Models\User::where('email','EMAIL_ADMIN')->update(['is_admin'=>true]);"
> ```
