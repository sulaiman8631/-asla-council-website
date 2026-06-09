<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobController extends Controller
{
    /**
     * GET /api/jobs
     * List jobs with optional ?status= filter.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Job::orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $jobs = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب الوظائف بنجاح',
            'data'    => $jobs->map(fn ($j) => $this->formatJob($j)),
        ]);
    }

    /**
     * GET /api/jobs/:id
     * Single job detail.
     */
    public function show(int $id): JsonResponse
    {
        $job = Job::find($id);

        if (! $job) {
            return response()->json([
                'success' => false,
                'message' => 'الوظيفة غير موجودة',
                'data'    => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم جلب الوظيفة بنجاح',
            'data'    => $this->formatJob($job),
        ]);
    }

    /**
     * POST /api/jobs
     * [admin] Create a new job posting.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title'          => 'required|string|max:500',
            'description'    => 'required|string',
            'requirements'   => 'sometimes|nullable|string',
            'type'           => 'sometimes|nullable|string|max:100',
            'location'       => 'sometimes|nullable|string|max:255',
            'deadline'       => 'sometimes|nullable|date',
            'status'         => 'sometimes|string|in:open,closed',
            'attachment_url' => 'sometimes|nullable|string|max:500',
        ]);

        $admin = auth()->user();

        $job = Job::create([
            'title'          => $request->title,
            'description'    => $request->description,
            'requirements'   => $request->requirements,
            'type'           => $request->type,
            'location'       => $request->location,
            'deadline'       => $request->deadline,
            'status'         => $request->input('status', 'open'),
            'attachment_url' => $request->attachment_url,
            'created_by'     => $admin->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء الوظيفة بنجاح',
            'data'    => $this->formatJob($job),
        ], 201);
    }

    /**
     * PUT /api/jobs/:id
     * [admin] Update a job posting.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $job = Job::find($id);

        if (! $job) {
            return response()->json([
                'success' => false,
                'message' => 'الوظيفة غير موجودة',
                'data'    => null,
            ], 404);
        }

        $request->validate([
            'title'          => 'sometimes|string|max:500',
            'description'    => 'sometimes|string',
            'requirements'   => 'sometimes|nullable|string',
            'type'           => 'sometimes|nullable|string|max:100',
            'location'       => 'sometimes|nullable|string|max:255',
            'deadline'       => 'sometimes|nullable|date',
            'status'         => 'sometimes|string|in:open,closed',
            'attachment_url' => 'sometimes|nullable|string|max:500',
        ]);

        // Use explicit has checks to allow null values
        $updates = [];
        $fields = ['title', 'description', 'requirements', 'type', 'location', 'deadline', 'status', 'attachment_url'];
        foreach ($fields as $field) {
            if ($request->has($field)) {
                $updates[$field] = $request->$field;
            }
        }

        if (! empty($updates)) {
            $job->update($updates);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الوظيفة بنجاح',
            'data'    => $this->formatJob($job),
        ]);
    }

    /**
     * DELETE /api/jobs/:id
     * [admin] Delete a job posting.
     */
    public function destroy(int $id): JsonResponse
    {
        $job = Job::find($id);

        if (! $job) {
            return response()->json([
                'success' => false,
                'message' => 'الوظيفة غير موجودة',
                'data'    => null,
            ], 404);
        }

        $job->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الوظيفة بنجاح',
            'data'    => null,
        ]);
    }

    private function formatJob(Job $job): array
    {
        return [
            'id'            => $job->id,
            'title'         => $job->title,
            'description'   => $job->description,
            'requirements'  => $job->requirements,
            'type'          => $job->type,
            'location'      => $job->location,
            'deadline'      => $job->deadline,
            'status'        => $job->status,
            'attachmentUrl' => $job->attachment_url,
            'createdBy'     => $job->created_by,
            'createdAt'     => $job->created_at,
            'updatedAt'     => $job->updated_at,
        ];
    }
}
