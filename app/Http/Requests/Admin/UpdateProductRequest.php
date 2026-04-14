<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        /** @var Product $product */
        $product = $this->route('product');

        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'slug')->ignore($product->id),
            ],
            'image_files' => ['nullable', 'array', 'max:5'],
            'image_files.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'retained_image_paths' => ['nullable', 'array', 'max:5'],
            'retained_image_paths.*' => ['required', 'string', 'max:500', 'regex:/^products\/.+$/'],
            'description' => ['nullable', 'string'],
            'min_order' => ['nullable', 'string', 'max:100'],
            'min_order_qty' => ['nullable', 'integer', 'min:1'],
            'badge' => ['nullable', 'string', 'max:100'],
            'is_new' => ['nullable', 'boolean'],
            'is_best_seller' => ['nullable', 'boolean'],
            'features' => ['nullable', 'array'],
            'features.*' => ['required', 'string', 'max:255'],
            'feature_descriptions' => ['nullable', 'array'],
            'feature_descriptions.*' => ['nullable', 'string', 'max:500'],
            'variant_types' => ['nullable', 'array', 'max:2'],
            'variant_types.*' => ['required', 'string', 'max:50'],
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.options' => ['required', 'array'],
            'variants.*.price' => ['required', 'numeric', 'min:0'],
            'variants.*.stock' => ['required', 'integer', 'min:0'],
        ];
    }
}
