<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * The API only ever answers in JSON. Without this, a failed validation or a
 * missing route is answered with a 302 redirect to a web page that does not
 * exist, which reaches the front-end as an opaque error.
 */
class ForceJsonResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}
