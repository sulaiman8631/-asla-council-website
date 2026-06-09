<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Job extends Model
{
    protected $table = 'jobs';

    protected $fillable = [
        'title',
        'description',
        'requirements',
        'type',
        'location',
        'deadline',
        'status',
        'attachment_url',
        'created_by',
    ];

    protected $casts = [
        'deadline'   => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }
}
