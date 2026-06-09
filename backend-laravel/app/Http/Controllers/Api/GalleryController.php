<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    /**
     * GET /api/gallery
     * All gallery images ordered by sort_order.
     */
    public function index(): JsonResponse
    {
        $images = GalleryImage::orderBy('sort_order')->orderByDesc('created_at')->get();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب معرض الصور بنجاح',
            'data'    => $images->map(fn ($img) => $this->formatImage($img)),
        ]);
    }

    /**
     * POST /api/gallery
     * [admin] Add an image to the gallery.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'url'        => 'required|string|max:500',
            'caption'    => 'sometimes|nullable|string|max:500',
            'sort_order' => 'sometimes|integer|min:0',
        ]);

        $admin = auth()->user();

        $image = GalleryImage::create([
            'url'        => $request->url,
            'caption'    => $request->caption,
            'sort_order' => $request->input('sort_order', 0),
            'created_by' => $admin->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الصورة بنجاح',
            'data'    => $this->formatImage($image),
        ], 201);
    }

    /**
     * DELETE /api/gallery/:id
     * [admin] Remove an image from the gallery.
     */
    public function destroy(int $id): JsonResponse
    {
        $image = GalleryImage::find($id);

        if (! $image) {
            return response()->json([
                'success' => false,
                'message' => 'الصورة غير موجودة',
                'data'    => null,
            ], 404);
        }

        $image->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الصورة بنجاح',
            'data'    => null,
        ]);
    }

    private function formatImage(GalleryImage $image): array
    {
        return [
            'id'        => $image->id,
            'url'       => $image->url,
            'caption'   => $image->caption,
            'sortOrder' => $image->sort_order,
            'createdBy' => $image->created_by,
            'createdAt' => $image->created_at,
            'updatedAt' => $image->updated_at,
        ];
    }
}
