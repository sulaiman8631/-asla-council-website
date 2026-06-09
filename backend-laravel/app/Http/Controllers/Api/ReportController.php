<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * GET /api/reports
     * List reports with optional ?year=&category= filters, ordered by year desc.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Report::with('category')->orderByDesc('year')->orderByDesc('created_at');

        if ($request->filled('year')) {
            $query->where('year', (int) $request->query('year'));
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->query('category'));
        }

        $reports = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب التقارير بنجاح',
            'data'    => $reports->map(fn ($r) => $this->formatReport($r)),
        ]);
    }

    /**
     * GET /api/reports/:id
     * Single report detail.
     */
    public function show(int $id): JsonResponse
    {
        $report = Report::with('category')->find($id);

        if (! $report) {
            return response()->json([
                'success' => false,
                'message' => 'التقرير غير موجود',
                'data'    => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم جلب التقرير بنجاح',
            'data'    => $this->formatReport($report),
        ]);
    }

    /**
     * POST /api/reports
     * [admin] Create a new report.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title'       => 'required|string|max:500',
            'year'        => 'required|integer|min:1900|max:2100',
            'category_id' => 'sometimes|nullable|exists:categories,id',
            'file_url'    => 'sometimes|nullable|string|max:500',
        ]);

        $admin  = auth()->user();
        $report = Report::create([
            'title'       => $request->title,
            'year'        => $request->year,
            'category_id' => $request->category_id,
            'file_url'    => $request->file_url,
            'created_by'  => $admin->id,
        ]);

        $report->load('category');

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء التقرير بنجاح',
            'data'    => $this->formatReport($report),
        ], 201);
    }

    /**
     * PUT /api/reports/:id
     * [admin] Update a report.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $report = Report::find($id);

        if (! $report) {
            return response()->json([
                'success' => false,
                'message' => 'التقرير غير موجود',
                'data'    => null,
            ], 404);
        }

        $request->validate([
            'title'       => 'sometimes|string|max:500',
            'year'        => 'sometimes|integer|min:1900|max:2100',
            'category_id' => 'sometimes|nullable|exists:categories,id',
            'file_url'    => 'sometimes|nullable|string|max:500',
        ]);

        $updates = [];
        foreach (['title', 'year', 'category_id', 'file_url'] as $field) {
            if ($request->has($field)) {
                $updates[$field] = $request->$field;
            }
        }

        if (! empty($updates)) {
            $report->update($updates);
        }

        $report->load('category');

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث التقرير بنجاح',
            'data'    => $this->formatReport($report),
        ]);
    }

    /**
     * DELETE /api/reports/:id
     * [admin] Delete a report.
     */
    public function destroy(int $id): JsonResponse
    {
        $report = Report::find($id);

        if (! $report) {
            return response()->json([
                'success' => false,
                'message' => 'التقرير غير موجود',
                'data'    => null,
            ], 404);
        }

        $report->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف التقرير بنجاح',
            'data'    => null,
        ]);
    }

    private function formatReport(Report $report): array
    {
        return [
            'id'         => $report->id,
            'title'      => $report->title,
            'year'       => $report->year,
            'categoryId' => $report->category_id,
            'category'   => $report->category ? [
                'id'   => $report->category->id,
                'name' => $report->category->name,
                'kind' => $report->category->kind,
            ] : null,
            'fileUrl'   => $report->file_url,
            'createdBy' => $report->created_by,
            'createdAt' => $report->created_at,
            'updatedAt' => $report->updated_at,
        ];
    }
}
