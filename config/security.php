<?php

return [
    'headers' => [
        'csp' => [
            'enabled' => (bool) env('SECURITY_CSP_ENABLED', true),
            'report_only' => (bool) env('SECURITY_CSP_REPORT_ONLY', true),
            'policy' => [
                "default-src 'self'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'none'",
                "object-src 'none'",
                "img-src 'self' data: https:",
                "font-src 'self' data: https:",
                "style-src 'self' 'unsafe-inline' https:",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                "connect-src 'self' https: ws: wss:",
            ],
        ],

        'hsts' => [
            'enabled' => (bool) env('SECURITY_HSTS_ENABLED', false),
            'max_age' => (int) env('SECURITY_HSTS_MAX_AGE', 31536000),
            'include_subdomains' => (bool) env('SECURITY_HSTS_INCLUDE_SUBDOMAINS', true),
        ],
    ],
];
