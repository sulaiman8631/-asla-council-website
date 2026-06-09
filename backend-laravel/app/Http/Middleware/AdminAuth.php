<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenExpiredException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenInvalidException;

class AdminAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $admin = JWTAuth::parseToken()->authenticate();

            if (! $admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'المستخدم غير موجود',
                    'data'    => null,
                ], 401);
            }

            // Bind authenticated admin to the request
            $request->merge(['_admin' => $admin]);
            auth()->setUser($admin);

        } catch (TokenExpiredException $e) {
            return response()->json([
                'success' => false,
                'message' => 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً',
                'data'    => null,
            ], 401);

        } catch (TokenInvalidException $e) {
            return response()->json([
                'success' => false,
                'message' => 'رمز المصادقة غير صالح',
                'data'    => null,
            ], 401);

        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'رمز المصادقة مفقود',
                'data'    => null,
            ], 401);
        }

        return $next($request);
    }
}
