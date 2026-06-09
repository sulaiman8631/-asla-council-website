<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    /**
     * POST /api/contact
     * Submit a contact message (rate limited: 5/hour per IP).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'sometimes|nullable|email|max:255',
            'subject' => 'sometimes|nullable|string|max:500',
            'message' => 'required|string|max:5000',
        ]);

        $msg = ContactMessage::create([
            'name'    => $request->name,
            'email'   => $request->email,
            'subject' => $request->subject,
            'message' => $request->message,
            'is_read' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال رسالتك بنجاح، سنتواصل معك قريباً',
            'data'    => ['id' => $msg->id],
        ], 201);
    }

    /**
     * GET /api/contact
     * [admin] List all contact messages ordered by newest first.
     */
    public function index(): JsonResponse
    {
        $messages = ContactMessage::orderByDesc('created_at')->get();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب الرسائل بنجاح',
            'data'    => $messages->map(fn ($m) => $this->formatMessage($m)),
        ]);
    }

    /**
     * PATCH /api/contact/:id/read
     * [admin] Mark a message as read.
     */
    public function markRead(int $id): JsonResponse
    {
        $message = ContactMessage::find($id);

        if (! $message) {
            return response()->json([
                'success' => false,
                'message' => 'الرسالة غير موجودة',
                'data'    => null,
            ], 404);
        }

        $message->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديد الرسالة كمقروءة',
            'data'    => $this->formatMessage($message),
        ]);
    }

    /**
     * DELETE /api/contact/:id
     * [admin] Delete a contact message.
     */
    public function destroy(int $id): JsonResponse
    {
        $message = ContactMessage::find($id);

        if (! $message) {
            return response()->json([
                'success' => false,
                'message' => 'الرسالة غير موجودة',
                'data'    => null,
            ], 404);
        }

        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الرسالة بنجاح',
            'data'    => null,
        ]);
    }

    private function formatMessage(ContactMessage $m): array
    {
        return [
            'id'        => $m->id,
            'name'      => $m->name,
            'email'     => $m->email,
            'subject'   => $m->subject,
            'message'   => $m->message,
            'isRead'    => $m->is_read,
            'createdAt' => $m->created_at,
            'updatedAt' => $m->updated_at,
        ];
    }
}
