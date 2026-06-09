<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $table = 'categories';

    protected $fillable = [
        'name',
        'kind',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function news(): HasMany
    {
        return $this->hasMany(News::class, 'category_id');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'category_id');
    }
}
