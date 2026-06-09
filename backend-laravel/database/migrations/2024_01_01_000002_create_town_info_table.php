<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('town_info', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255)->nullable();
            $table->string('tagline', 500)->nullable();
            $table->text('about')->nullable();
            $table->text('history')->nullable();
            $table->unsignedInteger('population')->nullable();
            $table->string('area', 100)->nullable();
            $table->string('established', 100)->nullable();
            $table->string('mayor_name', 255)->nullable();
            $table->string('logo', 500)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('town_info');
    }
};
