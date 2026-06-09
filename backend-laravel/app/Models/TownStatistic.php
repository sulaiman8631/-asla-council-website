<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TownStatistic extends Model
{
    protected $table = 'town_statistics';

    public $timestamps = false;

    protected $fillable = [
        'town_info_id',
        'label',
        'value',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function townInfo(): BelongsTo
    {
        return $this->belongsTo(TownInfo::class, 'town_info_id');
    }
}
