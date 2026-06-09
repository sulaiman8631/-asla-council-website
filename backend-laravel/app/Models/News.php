<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class News extends Model
{
    protected $table = 'news';

    protected $fillable = [
        'title',
        'body',
        'category_id',
        'created_by',
        'is_published',
        'published_at',
        'cover_image',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'created_at'   => 'datetime',
        'updated_at'   => 'datetime',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }

    public function images(): HasMany
    {
        return $this->hasMany(NewsImage::class, 'news_id');
    }
}
