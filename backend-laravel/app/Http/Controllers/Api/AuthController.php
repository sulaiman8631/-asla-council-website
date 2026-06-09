<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * POST /api/auth/login
     * Authenticate admin and return JWT token.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $admin = Admin::where('username', $request->username)->first();

        if (! $admin || ! Hash::check($request->password, $admin->password_hash)) {
            return response()->json([
                'success' => false,
                'message' => 'اسم المستخدم أو كلمة المرور غير صحيحة',
                'data'    => null,
            ], 401);
        }

        $token = JWTAuth::fromUser($admin);

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الدخول بنجاح',
            'data'    => [
                'token' => $token,
                'admin' => [
                    'id'       => $admin->id,
                    'username' => $admin->username,
                    'role'     => $admin->role,
                ],
            ],
        ]);
    }

    /**
     * PUT /api/auth/profile
     * Update admin username and/or password.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $admin = auth()->user();

        $request->validate([
            'username'        => 'sometimes|string|min:3|max:50|unique:admins,username,' . $admin->id,
            'currentPassword' => 'required|string',
            'newPassword'     => 'sometimes|nullable|string|min:6',
        ]);

        // Verify current password
        if (! Hash::check($request->currentPassword, $admin->password_hash)) {
            return response()->json([
                'success' => false,
                'message' => 'كلمة المرور الحالية غير صحيحة',
                'data'    => null,
            ], 400);
        }

        $updates = [];

        if ($request->filled('username')) {
            $updates['username'] = $request->username;
        }

        if ($request->filled('newPassword')) {
            $updates['password_hash'] = Hash::make($request->newPassword);
        }

        if (! empty($updates)) {
            $admin->update($updates);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الملف الشخصي بنجاح',
            'data'    => [
                'id'       => $admin->id,
                'username' => $admin->username,
                'role'     => $admin->role,
            ],
        ]);
    }
}
