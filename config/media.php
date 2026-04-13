<?php

return [
    'disk' => env('MEDIA_DISK', 'public'),
    'images' => [
        'max_width' => (int) env('MEDIA_IMAGE_MAX_WIDTH', 1600),
        'webp_quality' => (int) env('MEDIA_IMAGE_WEBP_QUALITY', 78),
    ],
];
