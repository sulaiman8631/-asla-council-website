<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * GET /api/categories
     * List categories with optional ?kind= filter.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Category::orderBy('name');

        if ($request->filled('kind')) {
            $query->where('kind', $request->query('kind'));
        }

        $categories = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب التصنيفات بنجاح',
            'data'    => $categories->map(fn ($c) => $this->formatCategory($c)),
        ]);
    }

    /**
     * POST /api/categories
     * [admin] Create a new category.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'kind' => 'required|string|in:news,report',
        ]);

        // Check unique name+kind
        $exists = Category::where('name', $request->name)
            ->where('kind', $request->kind)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'يوجد تصنيف بهذا الاسم ونفس النوع',
                'data'    => null,
            ], 400);
        }

        $category = Category::create([
            'name' => $request->name,
            'kind' => $request->kind,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء التصنيف بنجاح',
            'data'    => $this->formatCategory($category),
        ], 201);
    }

    /**
     * DELETE /api/categories/:id
     * [admin] Delete a category.
     */
    public function destroy(int $id): JsonResponse
    {
        $category = Category::find($id);

        if (! $category) {
            return response()->json([
                'success' => false,
                'message' => 'التصنيف غير موجود',
                'data'    => null,
            ], 404);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف التصنيف بنجاح',
            'data'    => null,
        ]);
    }

    private function formatCategory(Category $category): array
    {
        return [
            'id'        => $category->id,
            'name'      => $category->name,
            'kind'      => $category->kind,
            'createdAt' => $category->created_at,
            'updatedAt' => $category->updated_at,
        ];
    }
}
