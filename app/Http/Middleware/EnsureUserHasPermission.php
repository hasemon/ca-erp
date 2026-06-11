<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasPermission
{
    /**
     * Single-tenant app: authenticated users have full access (see HandleInertiaRequests).
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        if ($request->user()) {
            return $next($request);
        }

        abort(403);
    }
}
