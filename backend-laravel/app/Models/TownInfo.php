<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TownInfo extends Model
{
    protected $table = 'town_info';

    protected $fillable = [
        'name',
        'tagline',
        'about',
        'history',
        'population',
        'area',
        'established',
        'mayor_name',
        'logo',
    ];

    protected $casts = [
        'population' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function statistics(): HasMany
    {
        return $this->hasMany(TownStatistic::class, 'town_info_id')->orderBy('sort_order');
    }
}
