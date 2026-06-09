<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenders', function (Blueprint $table) {
            $table->id();
            $table->string('reference_no', 100)->unique();
            $table->string('title', 500);
            $table->longText('description')->nullable();
            $table->date('publish_date')->nullable();
            $table->date('deadline')->nullable();
            $table->string('status', 50)->default('open');
            $table->string('attachment_url', 500)->nullable();
            $table->foreignId('created_by')->constrained('admins')->onDelete('restrict');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenders');
    }
};
