<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ContactInfoController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TenderController;
use App\Http\Controllers\Api\TownController;
use App\Http\Controllers\Api\UploadController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — مجلس قروي عسلة
|--------------------------------------------------------------------------
*/

// ── Authentication ─────────────────────────────────────────────────────────
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('admin.auth')->group(function () {
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
});

// ── Town Info ───────────────────────────────────────────────────────────────
Route::get('/town', [TownController::class, 'show']);
Route::middleware('admin.auth')->group(function () {
    Route::put('/town', [TownController::class, 'update']);
});

// ── Contact Info ────────────────────────────────────────────────────────────
Route::get('/contact-info', [ContactInfoController::class, 'show']);
Route::middleware('admin.auth')->group(function () {
    Route::put('/contact-info', [ContactInfoController::class, 'update']);
});

// ── Contact Messages ────────────────────────────────────────────────────────
// Rate limit: 5 requests per hour per IP for public submission
Route::middleware('throttle:5,60')->post('/contact', [ContactController::class, 'store']);

Route::middleware('admin.auth')->group(function () {
    Route::get('/contact', [ContactController::class, 'index']);
    Route::patch('/contact/{id}/read', [ContactController::class, 'markRead']);
    Route::delete('/contact/{id}', [ContactController::class, 'destroy']);
});

// ── News ────────────────────────────────────────────────────────────────────
Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/{id}', [NewsController::class, 'show'])->where('id', '[0-9]+');

Route::middleware('admin.auth')->group(function () {
    Route::get('/news/{id}/edit', [NewsController::class, 'edit'])->where('id', '[0-9]+');
    Route::post('/news', [NewsController::class, 'store']);
    Route::put('/news/{id}', [NewsController::class, 'update'])->where('id', '[0-9]+');
    Route::delete('/news/{id}', [NewsController::class, 'destroy'])->where('id', '[0-9]+');
});

// ── Jobs ─────────────────────────────────────────────────────────────────────
Route::get('/jobs', [JobController::class, 'index']);
Route::get('/jobs/{id}', [JobController::class, 'show'])->where('id', '[0-9]+');

Route::middleware('admin.auth')->group(function () {
    Route::post('/jobs', [JobController::class, 'store']);
    Route::put('/jobs/{id}', [JobController::class, 'update'])->where('id', '[0-9]+');
    Route::delete('/jobs/{id}', [JobController::class, 'destroy'])->where('id', '[0-9]+');
});

// ── Tenders ──────────────────────────────────────────────────────────────────
Route::get('/tenders', [TenderController::class, 'index']);
Route::get('/tenders/{id}', [TenderController::class, 'show'])->where('id', '[0-9]+');

Route::middleware('admin.auth')->group(function () {
    Route::post('/tenders', [TenderController::class, 'store']);
    Route::put('/tenders/{id}', [TenderController::class, 'update'])->where('id', '[0-9]+');
    Route::delete('/tenders/{id}', [TenderController::class, 'destroy'])->where('id', '[0-9]+');
});

// ── Reports ──────────────────────────────────────────────────────────────────
Route::get('/reports', [ReportController::class, 'index']);
Route::get('/reports/{id}', [ReportController::class, 'show'])->where('id', '[0-9]+');

Route::middleware('admin.auth')->group(function () {
    Route::post('/reports', [ReportController::class, 'store']);
    Route::put('/reports/{id}', [ReportController::class, 'update'])->where('id', '[0-9]+');
    Route::delete('/reports/{id}', [ReportController::class, 'destroy'])->where('id', '[0-9]+');
});

// ── Gallery ──────────────────────────────────────────────────────────────────
Route::get('/gallery', [GalleryController::class, 'index']);

Route::middleware('admin.auth')->group(function () {
    Route::post('/gallery', [GalleryController::class, 'store']);
    Route::delete('/gallery/{id}', [GalleryController::class, 'destroy'])->where('id', '[0-9]+');
});

// ── Categories ───────────────────────────────────────────────────────────────
Route::get('/categories', [CategoryController::class, 'index']);

Route::middleware('admin.auth')->group(function () {
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->where('id', '[0-9]+');
});

// ── File Upload ───────────────────────────────────────────────────────────────
Route::middleware('admin.auth')->group(function () {
    Route::post('/upload', [UploadController::class, 'store']);
    Route::delete('/upload', [UploadController::class, 'destroy']);
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
Route::middleware('admin.auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
});
