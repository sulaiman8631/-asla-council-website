<?php

return [
    'defaults' => [
        'guard'     => 'api',
        'passwords' => 'admins',
    ],

    'guards' => [
        'web' => [
            'driver'   => 'session',
            'provider' => 'admins',
        ],
        'api' => [
            'driver'   => 'jwt',
            'provider' => 'admins',
        ],
    ],

    'providers' => [
        'admins' => [
            'driver' => 'eloquent',
            'model'  => App\Models\Admin::class,
        ],
    ],

    'passwords' => [
        'admins' => [
            'provider' => 'admins',
            'table'    => 'password_reset_tokens',
            'expire'   => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => 10800,
];
