<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\News;
use App\Models\NewsImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NewsController extends Controller
{
    /**
     * GET /api/news
     * Paginated list of published news with images.
     * Query: ?page=1&limit=10&category=
     */
    public function index(Request $request): JsonResponse
    {
        $page     = max(1, (int) $request->query('page', 1));
        $limit    = min(50, max(1, (int) $request->query('limit', 10)));
        $category = $request->query('category');

        $query = News::with(['images', 'category'])
            ->where('is_published', true)
            ->orderByDesc('published_at')
            ->orderByDesc('created_at');

        if ($category) {
            $query->where('category_id', $category);
        }

        $total      = $query->count();
        $items      = $query->skip(($page - 1) * $limit)->take($limit)->get();
        $totalPages = (int) ceil($total / $limit);

        return response()->json([
            'success' => true,
            'message' => 'تم جلب الأخبار بنجاح',
            'data'    => [
                'items'       => $items->map(fn ($n) => $this->formatNews($n)),
                'total'       => $total,
                'page'        => $page,
                'limit'       => $limit,
                'totalPages'  => $totalPages,
            ],
        ]);
    }

    /**
     * GET /api/news/:id
     * Single published news item with images and category.
     */
    public function show(int $id): JsonResponse
    {
        $news = News::with(['images', 'category'])
            ->where('id', $id)
            ->where('is_published', true)
            ->first();

        if (! $news) {
            return response()->json([
                'success' => false,
                'message' => 'الخبر غير موجود',
                'data'    => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم جلب الخبر بنجاح',
            'data'    => $this->formatNews($news),
        ]);
    }

    /**
     * GET /api/news/:id/edit
     * [admin] Get news item for editing (including unpublished).
     */
    public function edit(int $id): JsonResponse
    {
        $news = News::with(['images', 'category'])->find($id);

        if (! $news) {
            return response()->json([
                'success' => false,
                'message' => 'الخبر غير موجود',
                'data'    => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم جلب الخبر بنجاح',
            'data'    => $this->formatNews($news),
        ]);
    }

    /**
     * POST /api/news
     * [admin] Create news with optional images array (urls).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title'        => 'required|string|max:500',
            'body'         => 'required|string',
            'category_id'  => 'sometimes|nullable|exists:categories,id',
            'is_published' => 'sometimes|boolean',
            'published_at' => 'sometimes|nullable|date',
            'cover_image'  => 'sometimes|nullable|string|max:500',
            'images'       => 'sometimes|array',
            'images.*'     => 'string|max:500',
        ]);

        $admin = auth()->user();

        $news = DB::transaction(function () use ($request, $admin) {
            $isPublished = $request->boolean('is_published', false);
            $publishedAt = null;
            if ($isPublished) {
                $publishedAt = $request->filled('published_at')
                    ? $request->published_at
                    : now();
            }

            $news = News::create([
                'title'        => $request->title,
                'body'         => $request->body,
                'category_id'  => $request->category_id,
                'created_by'   => $admin->id,
                'is_published' => $isPublished,
                'published_at' => $publishedAt,
                'cover_image'  => $request->cover_image,
            ]);

            if ($request->filled('images')) {
                foreach ($request->images as $url) {
                    NewsImage::create(['news_id' => $news->id, 'url' => $url]);
                }
            }

            return $news;
        });

        $news->load(['images', 'category']);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء الخبر بنجاح',
            'data'    => $this->formatNews($news),
        ], 201);
    }

    /**
     * PUT /api/news/:id
     * [admin] Update news.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $news = News::find($id);

        if (! $news) {
            return response()->json([
                'success' => false,
                'message' => 'الخبر غير موجود',
                'data'    => null,
            ], 404);
        }

        $request->validate([
            'title'        => 'sometimes|string|max:500',
            'body'         => 'sometimes|string',
            'category_id'  => 'sometimes|nullable|exists:categories,id',
            'is_published' => 'sometimes|boolean',
            'published_at' => 'sometimes|nullable|date',
            'cover_image'  => 'sometimes|nullable|string|max:500',
            'images'       => 'sometimes|array',
            'images.*'     => 'string|max:500',
        ]);

        DB::transaction(function () use ($request, $news) {
            $updates = [];

            if ($request->has('title'))       $updates['title']       = $request->title;
            if ($request->has('body'))        $updates['body']        = $request->body;
            if ($request->has('category_id')) $updates['category_id'] = $request->category_id;
            if ($request->has('cover_image')) $updates['cover_image'] = $request->cover_image;

            if ($request->has('is_published')) {
                $isPublished = $request->boolean('is_published');
                $updates['is_published'] = $isPublished;

                if ($isPublished && ! $news->published_at) {
                    $updates['published_at'] = $request->filled('published_at')
                        ? $request->published_at
                        : now();
                } elseif ($request->has('published_at')) {
                    $updates['published_at'] = $request->published_at;
                }
            }

            if (! empty($updates)) {
                $news->update($updates);
            }

            if ($request->has('images')) {
                NewsImage::where('news_id', $news->id)->delete();
                foreach ($request->images as $url) {
                    NewsImage::create(['news_id' => $news->id, 'url' => $url]);
                }
            }
        });

        $news->load(['images', 'category']);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الخبر بنجاح',
            'data'    => $this->formatNews($news),
        ]);
    }

    /**
     * DELETE /api/news/:id
     * [admin] Delete news and its images.
     */
    public function destroy(int $id): JsonResponse
    {
        $news = News::find($id);

        if (! $news) {
            return response()->json([
                'success' => false,
                'message' => 'الخبر غير موجود',
                'data'    => null,
            ], 404);
        }

        DB::transaction(function () use ($news) {
            NewsImage::where('news_id', $news->id)->delete();
            $news->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الخبر بنجاح',
            'data'    => null,
        ]);
    }

    private function formatNews(News $news): array
    {
        return [
            'id'          => $news->id,
            'title'       => $news->title,
            'body'        => $news->body,
            'categoryId'  => $news->category_id,
            'category'    => $news->category ? [
                'id'   => $news->category->id,
                'name' => $news->category->name,
                'kind' => $news->category->kind,
            ] : null,
            'createdBy'   => $news->created_by,
            'isPublished' => $news->is_published,
            'publishedAt' => $news->published_at,
            'coverImage'  => $news->cover_image,
            'images'      => $news->images->map(fn ($img) => [
                'id'  => $img->id,
                'url' => $img->url,
            ])->toArray(),
            'createdAt' => $news->created_at,
            'updatedAt' => $news->updated_at,
        ];
    }
}
