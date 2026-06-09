<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsImage extends Model
{
    protected $table = 'news_images';

    public $timestamps = false;

    protected $fillable = [
        'news_id',
        'url',
    ];

    public function news(): BelongsTo
    {
        return $this->belongsTo(News::class, 'news_id');
    }
}
