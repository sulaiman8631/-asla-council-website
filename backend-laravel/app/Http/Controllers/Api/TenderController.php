<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tender;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenderController extends Controller
{
    /**
     * GET /api/tenders
     * List tenders with optional ?status= filter.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tender::orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $tenders = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب المناقصات بنجاح',
            'data'    => $tenders->map(fn ($t) => $this->formatTender($t)),
        ]);
    }

    /**
     * GET /api/tenders/:id
     * Single tender detail.
     */
    public function show(int $id): JsonResponse
    {
        $tender = Tender::find($id);

        if (! $tender) {
            return response()->json([
                'success' => false,
                'message' => 'المناقصة غير موجودة',
                'data'    => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم جلب المناقصة بنجاح',
            'data'    => $this->formatTender($tender),
        ]);
    }

    /**
     * POST /api/tenders
     * [admin] Create a new tender (validate unique referenceNo).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'reference_no'   => 'required|string|max:100|unique:tenders,reference_no',
            'title'          => 'required|string|max:500',
            'description'    => 'sometimes|nullable|string',
            'publish_date'   => 'sometimes|nullable|date',
            'deadline'       => 'sometimes|nullable|date',
            'status'         => 'sometimes|string|in:open,closed',
            'attachment_url' => 'sometimes|nullable|string|max:500',
        ]);

        $admin = auth()->user();

        $tender = Tender::create([
            'reference_no'   => $request->reference_no,
            'title'          => $request->title,
            'description'    => $request->description,
            'publish_date'   => $request->publish_date,
            'deadline'       => $request->deadline,
            'status'         => $request->input('status', 'open'),
            'attachment_url' => $request->attachment_url,
            'created_by'     => $admin->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء المناقصة بنجاح',
            'data'    => $this->formatTender($tender),
        ], 201);
    }

    /**
     * PUT /api/tenders/:id
     * [admin] Update a tender.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $tender = Tender::find($id);

        if (! $tender) {
            return response()->json([
                'success' => false,
                'message' => 'المناقصة غير موجودة',
                'data'    => null,
            ], 404);
        }

        $request->validate([
            'reference_no'   => 'sometimes|string|max:100|unique:tenders,reference_no,' . $id,
            'title'          => 'sometimes|string|max:500',
            'description'    => 'sometimes|nullable|string',
            'publish_date'   => 'sometimes|nullable|date',
            'deadline'       => 'sometimes|nullable|date',
            'status'         => 'sometimes|string|in:open,closed',
            'attachment_url' => 'sometimes|nullable|string|max:500',
        ]);

        $updates = [];
        $fields  = ['reference_no', 'title', 'description', 'publish_date', 'deadline', 'status', 'attachment_url'];
        foreach ($fields as $field) {
            if ($request->has($field)) {
                $updates[$field] = $request->$field;
            }
        }

        if (! empty($updates)) {
            $tender->update($updates);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث المناقصة بنجاح',
            'data'    => $this->formatTender($tender),
        ]);
    }

    /**
     * DELETE /api/tenders/:id
     * [admin] Delete a tender.
     */
    public function destroy(int $id): JsonResponse
    {
        $tender = Tender::find($id);

        if (! $tender) {
            return response()->json([
                'success' => false,
                'message' => 'المناقصة غير موجودة',
                'data'    => null,
            ], 404);
        }

        $tender->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف المناقصة بنجاح',
            'data'    => null,
        ]);
    }

    private function formatTender(Tender $tender): array
    {
        return [
            'id'            => $tender->id,
            'referenceNo'   => $tender->reference_no,
            'title'         => $tender->title,
            'description'   => $tender->description,
            'publishDate'   => $tender->publish_date,
            'deadline'      => $tender->deadline,
            'status'        => $tender->status,
            'attachmentUrl' => $tender->attachment_url,
            'createdBy'     => $tender->created_by,
            'createdAt'     => $tender->created_at,
            'updatedAt'     => $tender->updated_at,
        ];
    }
}
