<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
        $response->headers->set('Cross-Origin-Resource-Policy', 'same-site');
        $response->headers->set('X-Permitted-Cross-Domain-Policies', 'none');

        $this->applyContentSecurityPolicy($response);
        $this->applyHstsHeader($request, $response);

        return $response;
    }

    private function applyContentSecurityPolicy(Response $response): void
    {
        $cspConfig = config('security.headers.csp', []);
        $enabled = (bool) ($cspConfig['enabled'] ?? true);

        if (! $enabled) {
            return;
        }

        $policy = $cspConfig['policy'] ?? [];
        if (! is_array($policy) || $policy === []) {
            return;
        }

        $headerName = (bool) ($cspConfig['report_only'] ?? true)
            ? 'Content-Security-Policy-Report-Only'
            : 'Content-Security-Policy';

        $response->headers->set($headerName, implode('; ', $policy));
    }

    private function applyHstsHeader(Request $request, Response $response): void
    {
        $hstsConfig = config('security.headers.hsts', []);
        $enabled = (bool) ($hstsConfig['enabled'] ?? false);

        if (! $enabled || ! $request->isSecure()) {
            return;
        }

        $maxAge = max(0, (int) ($hstsConfig['max_age'] ?? 31536000));
        $value = "max-age={$maxAge}";

        if ((bool) ($hstsConfig['include_subdomains'] ?? true)) {
            $value .= '; includeSubDomains';
        }

        $response->headers->set('Strict-Transport-Security', $value);
    }
}
