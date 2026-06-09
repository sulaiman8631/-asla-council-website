<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * POST /api/upload
     * [admin] Upload a file and return its public URL.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10 MB max
        ]);

        $file      = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $filename  = Str::uuid() . '.' . $extension;

        // Store in public/uploads directory
        $uploadsPath = public_path('uploads');
        if (! is_dir($uploadsPath)) {
            mkdir($uploadsPath, 0755, true);
        }

        $file->move($uploadsPath, $filename);

        $url = '/uploads/' . $filename;

        return response()->json([
            'success' => true,
            'message' => 'تم رفع الملف بنجاح',
            'data'    => ['url' => $url],
        ], 201);
    }

    /**
     * DELETE /api/upload
     * [admin] Delete an uploaded file by path.
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        $path = $request->input('path');

        // Security: only allow deleting files inside uploads directory
        $normalizedPath = ltrim($path, '/');
        if (! Str::startsWith($normalizedPath, 'uploads/')) {
            return response()->json([
                'success' => false,
                'message' => 'مسار الملف غير صالح',
                'data'    => null,
            ], 400);
        }

        $filename     = basename($normalizedPath);
        $absolutePath = public_path('uploads/' . $filename);

        if (! file_exists($absolutePath)) {
            return response()->json([
                'success' => false,
                'message' => 'الملف غير موجود',
                'data'    => null,
            ], 404);
        }

        // Prevent directory traversal
        $realPath        = realpath($absolutePath);
        $uploadsRealPath = realpath(public_path('uploads'));
        if ($realPath === false || ! Str::startsWith($realPath, $uploadsRealPath)) {
            return response()->json([
                'success' => false,
                'message' => 'مسار الملف غير مسموح',
                'data'    => null,
            ], 400);
        }

        unlink($absolutePath);

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الملف بنجاح',
            'data'    => null,
        ]);
    }
}
