<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactInfo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactInfoController extends Controller
{
    /**
     * GET /api/contact-info
     * Return contact information.
     */
    public function show(): JsonResponse
    {
        $info = ContactInfo::first();

        if (! $info) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم العثور على بيانات التواصل',
                'data'    => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم جلب بيانات التواصل بنجاح',
            'data'    => $this->formatContactInfo($info),
        ]);
    }

    /**
     * PUT /api/contact-info
     * Upsert contact info (fixed id=1).
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'address'       => 'sometimes|nullable|string|max:500',
            'phone'         => 'sometimes|nullable|string|max:50',
            'email'         => 'sometimes|nullable|email|max:255',
            'working_hours' => 'sometimes|nullable|string|max:255',
            'map_embed_url' => 'sometimes|nullable|string',
            'lat'           => 'sometimes|nullable|numeric|between:-90,90',
            'lng'           => 'sometimes|nullable|numeric|between:-180,180',
            'facebook'      => 'sometimes|nullable|string|max:500',
            'instagram'     => 'sometimes|nullable|string|max:500',
            'twitter'       => 'sometimes|nullable|string|max:500',
            'youtube'       => 'sometimes|nullable|string|max:500',
        ]);

        $info = ContactInfo::firstOrNew(['id' => 1]);
        $fields = ['address', 'phone', 'email', 'working_hours', 'map_embed_url', 'lat', 'lng', 'facebook', 'instagram', 'twitter', 'youtube'];

        foreach ($fields as $field) {
            if ($request->has($field)) {
                $info->$field = $request->$field;
            }
        }
        $info->save();

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات التواصل بنجاح',
            'data'    => $this->formatContactInfo($info),
        ]);
    }

    private function formatContactInfo(ContactInfo $info): array
    {
        return [
            'id'           => $info->id,
            'address'      => $info->address,
            'phone'        => $info->phone,
            'email'        => $info->email,
            'workingHours' => $info->working_hours,
            'mapEmbedUrl'  => $info->map_embed_url,
            'lat'          => $info->lat,
            'lng'          => $info->lng,
            'facebook'     => $info->facebook,
            'instagram'    => $info->instagram,
            'twitter'      => $info->twitter,
            'youtube'      => $info->youtube,
            'createdAt'    => $info->created_at,
            'updatedAt'    => $info->updated_at,
        ];
    }
}
