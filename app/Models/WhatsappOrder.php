<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsappOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_name',
        'address',
        'expedition',
        'total_amount',
        'items',
        'status',
    ];

    protected $casts = [
        'items' => 'array',
        'total_amount' => 'decimal:2',
    ];
}

