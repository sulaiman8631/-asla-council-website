<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('title', 500);
            $table->longText('description');
            $table->longText('requirements')->nullable();
            $table->string('type', 100)->nullable();
            $table->string('location', 255)->nullable();
            $table->date('deadline')->nullable();
            $table->string('status', 50)->default('open');
            $table->string('attachment_url', 500)->nullable();
            $table->foreignId('created_by')->constrained('admins')->onDelete('restrict');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
