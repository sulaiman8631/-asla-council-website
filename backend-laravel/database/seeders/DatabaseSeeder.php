<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\ContactInfo;
use App\Models\TownInfo;
use App\Models\TownStatistic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create default admin account
        if (! Admin::where('username', 'admin')->exists()) {
            Admin::create([
                'username'      => 'admin',
                'password_hash' => Hash::make('admin123'),
                'role'          => 'admin',
            ]);
            $this->command->info('Default admin created: username=admin, password=admin123');
        }

        // Seed initial town info (singleton id=1)
        if (! TownInfo::find(1)) {
            $town = TownInfo::create([
                'id'          => 1,
                'name'        => 'عسلة',
                'tagline'     => 'قرية فلسطينية أصيلة',
                'about'       => 'عسلة قرية فلسطينية تقع في محافظة جنين.',
                'history'     => 'تاريخ عريق يمتد لقرون طويلة.',
                'population'  => null,
                'area'        => null,
                'established' => null,
                'mayor_name'  => null,
                'logo'        => null,
            ]);

            // Seed a few example statistics
            TownStatistic::insert([
                ['town_info_id' => $town->id, 'label' => 'عدد السكان', 'value'  => '5000+',  'sort_order' => 0],
                ['town_info_id' => $town->id, 'label' => 'المساحة',   'value'  => '10 كم²', 'sort_order' => 1],
            ]);

            $this->command->info('Town info seeded.');
        }

        // Seed initial contact info (singleton id=1)
        if (! ContactInfo::find(1)) {
            ContactInfo::create([
                'id'           => 1,
                'address'      => 'عسلة، محافظة جنين، فلسطين',
                'phone'        => null,
                'email'        => null,
                'working_hours'=> 'الأحد - الخميس: 8:00 - 15:00',
                'map_embed_url'=> null,
                'lat'          => null,
                'lng'          => null,
                'facebook'     => null,
                'instagram'    => null,
                'twitter'      => null,
                'youtube'      => null,
            ]);
            $this->command->info('Contact info seeded.');
        }
    }
}
