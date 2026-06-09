<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TownInfo;
use App\Models\TownStatistic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TownController extends Controller
{
    /**
     * GET /api/town
     * Return town info with statistics array.
     */
    public function show(): JsonResponse
    {
        $town = TownInfo::with(['statistics' => function ($q) {
            $q->orderBy('sort_order');
        }])->first();

        if (! $town) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم العثور على بيانات البلدة',
                'data'    => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم جلب بيانات البلدة بنجاح',
            'data'    => $this->formatTown($town),
        ]);
    }

    /**
     * PUT /api/town
     * Update town info and replace all statistics.
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'name'        => 'sometimes|string|max:255',
            'tagline'     => 'sometimes|nullable|string|max:500',
            'about'       => 'sometimes|nullable|string',
            'history'     => 'sometimes|nullable|string',
            'population'  => 'sometimes|nullable|integer|min:0',
            'area'        => 'sometimes|nullable|string|max:100',
            'established' => 'sometimes|nullable|string|max:100',
            'mayor_name'  => 'sometimes|nullable|string|max:255',
            'logo'        => 'sometimes|nullable|string|max:500',
            'statistics'  => 'sometimes|array',
            'statistics.*.label'      => 'required_with:statistics|string|max:255',
            'statistics.*.value'      => 'required_with:statistics|string|max:255',
            'statistics.*.sort_order' => 'sometimes|integer|min:0',
        ]);

        DB::transaction(function () use ($request) {
            // Upsert town_info with fixed id=1
            $town = TownInfo::firstOrNew(['id' => 1]);
            $fields = ['name', 'tagline', 'about', 'history', 'population', 'area', 'established', 'mayor_name', 'logo'];
            foreach ($fields as $field) {
                if ($request->has($field)) {
                    $town->$field = $request->$field;
                }
            }
            $town->save();

            // Replace all statistics if provided
            if ($request->has('statistics')) {
                TownStatistic::where('town_info_id', $town->id)->delete();
                foreach ($request->statistics as $index => $stat) {
                    TownStatistic::create([
                        'town_info_id' => $town->id,
                        'label'        => $stat['label'],
                        'value'        => $stat['value'],
                        'sort_order'   => $stat['sort_order'] ?? $index,
                    ]);
                }
            }
        });

        $town = TownInfo::with(['statistics' => function ($q) {
            $q->orderBy('sort_order');
        }])->findOrFail(1);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات البلدة بنجاح',
            'data'    => $this->formatTown($town),
        ]);
    }

    private function formatTown(TownInfo $town): array
    {
        return [
            'id'          => $town->id,
            'name'        => $town->name,
            'tagline'     => $town->tagline,
            'about'       => $town->about,
            'history'     => $town->history,
            'population'  => $town->population,
            'area'        => $town->area,
            'established' => $town->established,
            'mayorName'   => $town->mayor_name,
            'logo'        => $town->logo,
            'statistics'  => $town->statistics->map(fn ($s) => [
                'id'        => $s->id,
                'label'     => $s->label,
                'value'     => $s->value,
                'sortOrder' => $s->sort_order,
            ])->toArray(),
            'createdAt' => $town->created_at,
            'updatedAt' => $town->updated_at,
        ];
    }
}
