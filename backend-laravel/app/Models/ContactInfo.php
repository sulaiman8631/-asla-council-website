<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactInfo extends Model
{
    protected $table = 'contact_info';

    protected $fillable = [
        'address',
        'phone',
        'email',
        'working_hours',
        'map_embed_url',
        'lat',
        'lng',
        'facebook',
        'instagram',
        'twitter',
        'youtube',
    ];

    protected $casts = [
        'lat'        => 'decimal:8',
        'lng'        => 'decimal:8',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
