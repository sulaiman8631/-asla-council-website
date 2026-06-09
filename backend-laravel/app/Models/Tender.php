<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tender extends Model
{
    protected $table = 'tenders';

    protected $fillable = [
        'reference_no',
        'title',
        'description',
        'publish_date',
        'deadline',
        'status',
        'attachment_url',
        'created_by',
    ];

    protected $casts = [
        'publish_date' => 'date',
        'deadline'     => 'date',
        'created_at'   => 'datetime',
        'updated_at'   => 'datetime',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }
}
