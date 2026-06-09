<?php

use Illuminate\Support\Facades\Facade;

return [
    'name' => env('APP_NAME', 'Asla Village Council'),
    'env'  => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url'  => env('APP_URL', 'http://localhost'),
    'asset_url' => env('ASSET_URL'),
    'timezone' => 'Asia/Jerusalem',
    'locale' => 'ar',
    'fallback_locale' => 'en',
    'faker_locale' => 'ar_SA',
    'cipher' => 'AES-256-CBC',
    'key' => env('APP_KEY'),
    'previous_keys' => array_filter(
        explode(',', env('APP_PREVIOUS_KEYS', ''))
    ),
    'maintenance' => [
        'driver' => 'file',
    ],
    'providers' => Illuminate\Support\ServiceProvider::defaultProviders()->merge([
        App\Providers\AppServiceProvider::class,
        Tymon\JWTAuth\Providers\LaravelServiceProvider::class,
    ])->toArray(),
    'aliases' => Facade::defaultAliases()->merge([
        'JWTAuth'    => Tymon\JWTAuth\Facades\JWTAuth::class,
        'JWTFactory' => Tymon\JWTAuth\Facades\JWTFactory::class,
    ])->toArray(),
];
