<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\GalleryImage;
use App\Models\Job;
use App\Models\News;
use App\Models\Report;
use App\Models\Tender;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * GET /api/dashboard
     * [admin] Return counts for the admin dashboard.
     */
    public function index(): JsonResponse
    {
        $data = [
            'news'            => News::count(),
            'jobs'            => Job::count(),
            'tenders'         => Tender::count(),
            'reports'         => Report::count(),
            'gallery'         => GalleryImage::count(),
            'unreadMessages'  => ContactMessage::where('is_read', false)->count(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'تم جلب إحصائيات لوحة التحكم بنجاح',
            'data'    => $data,
        ]);
    }
}
