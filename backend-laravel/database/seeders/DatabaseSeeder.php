<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Category;
use App\Models\ContactInfo;
use App\Models\Job;
use App\Models\News;
use App\Models\Tender;
use App\Models\TownInfo;
use App\Models\TownStatistic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ──────────────────────────────────────────────────────────────
        $admin = Admin::firstOrCreate(
            ['username' => 'admin'],
            [
                'password_hash' => Hash::make('Admin@2026'),
                'role'          => 'admin',
            ]
        );
        $this->command->info('✓ Admin ready');

        // ── Town Info ──────────────────────────────────────────────────────────
        if (! TownInfo::find(1)) {
            $town = TownInfo::create([
                'id'          => 1,
                'name'        => 'عسلة',
                'tagline'     => 'بلدة عريقة في قلب محافظة قلقيلية',
                'about'       => 'تقع بلدة عسلة في وسط محافظة قلقيلية، شرق مدينة قلقيلية وغرب قرية عزون وجنوب قرية عزبة الطبيب، على بعد 7 كيلومترات من مركز المحافظة. ترتفع البلدة 650 متراً عن سطح البحر وتتميز بطبيعتها الجبلية والسهلية الخلابة. تبلغ مساحتها الإجمالية 100 دونم، وتُعدّ من التجمعات السكانية المتماسكة ذات الهوية الراسخة والحضور الاجتماعي المتميز في المنطقة.',
                'history'     => 'تحدّ بلدة عسلة من الشمال قرية عزبة الطبيب، ومن الجنوب قرية كفر ثلث، ومن الشرق قرية عزون، ومن الغرب مستوطنة ألفي منشه. يبلغ عدد سكانها نحو 1,250 نسمة موزعين على 260 أسرة في 280 وحدة سكنية. يشكّل الشباب دون سن الخامسة عشرة 40% من إجمالي السكان، مما يعكس مجتمعاً حيوياً فتياً يحمل آفاق التنمية والبناء. تبلغ نسبة الحاصلين على مؤهلات ما بعد الثانوية 15%، ونسبة الأمية 10%، وتوزّع العاملون بين القطاع الحكومي بنسبة 5% والقطاع الخاص بنسبة 10%.',
                'population'  => 1256,
                'area'        => '100 دونم',
                'established' => '1995',
                'mayor_name'  => 'سليمان عثمان سليمان سليمان',
                'logo'        => null,
            ]);

            TownStatistic::insert([
                ['town_info_id' => 1, 'label' => 'عدد السكان',         'value' => '1,256 نسمة', 'sort_order' => 0],
                ['town_info_id' => 1, 'label' => 'عدد الأسر',          'value' => '260 أسرة',   'sort_order' => 1],
                ['town_info_id' => 1, 'label' => 'الوحدات السكنية',    'value' => '280 وحدة',   'sort_order' => 2],
                ['town_info_id' => 1, 'label' => 'المساحة الكلية',     'value' => '100 دونم',   'sort_order' => 3],
                ['town_info_id' => 1, 'label' => 'الارتفاع عن البحر',  'value' => '650 متراً',  'sort_order' => 4],
                ['town_info_id' => 1, 'label' => 'البعد عن المحافظة',  'value' => '7 كم',       'sort_order' => 5],
                ['town_info_id' => 1, 'label' => 'الشباب (أقل من 15)', 'value' => '40%',        'sort_order' => 6],
                ['town_info_id' => 1, 'label' => 'التعليم العالي',     'value' => '15%',        'sort_order' => 7],
            ]);
            $this->command->info('✓ Town info + statistics');
        } else {
            $this->command->info('✓ Town info already exists');
        }

        // ── Contact Info ───────────────────────────────────────────────────────
        if (! ContactInfo::find(1)) {
            ContactInfo::create([
                'id'            => 1,
                'address'       => 'بلدة عسلة، محافظة قلقيلية، فلسطين',
                'phone'         => '0594272308',
                'email'         => 'eslastar@outlook.com',
                'working_hours' => 'السبت - الخميس: 8:30 صباحًا - 13:30 مساءً',
                'map_embed_url' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13508.807655487242!2d35.032959000000005!3d32.171829499999994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151d3b49fa2060ab%3A0xfc74be52c7355ec3!2z2K7Ysdob2Kkg2LnYs9mE2Kk!5e0!3m2!1sar!2s!4v1780953285765!5m2!1sar!2s',
                'lat'           => 32.1718295,
                'lng'           => 35.032959,
                'facebook'      => 'https://www.facebook.com/profile.php?id=100063726772548',
                'instagram'     => null,
                'twitter'       => null,
                'youtube'       => null,
            ]);
            $this->command->info('✓ Contact info');
        } else {
            $this->command->info('✓ Contact info already exists');
        }

        // ── Categories ─────────────────────────────────────────────────────────
        $cats = [
            ['name' => 'عام',    'kind' => 'news'],
            ['name' => 'صحة',   'kind' => 'news'],
            ['name' => 'تنمية', 'kind' => 'news'],
            ['name' => 'مالي',  'kind' => 'report'],
            ['name' => 'إداري', 'kind' => 'report'],
        ];
        foreach ($cats as $cat) {
            Category::firstOrCreate(['name' => $cat['name'], 'kind' => $cat['kind']]);
        }
        $this->command->info('✓ Categories');

        // ── News ───────────────────────────────────────────────────────────────
        if (News::count() === 0) {
            $devCat = Category::where('name', 'تنمية')->where('kind', 'news')->first();

            News::create([
                'title'        => 'مشاركة رئيس مجلس قروي عسلة في إقرار الخطة التنموية 2026–2027',
                'body'         => "شارك رئيس مجلس قروي عسلة في اللقاء الخاص بإقرار الخطة التنموية للأعوام 2026–2027، والذي نظمته مؤسسة الرؤيا العالمية في أريحا، بمشاركة ممثلين عن 33 هيئة محلية من ثلاث محافظات.\nويأتي هذا اللقاء في إطار تعزيز التخطيط التنموي ودعم جهود الهيئات المحلية في تحديد أولوياتها واحتياجاتها التنموية، بما يسهم في تحسين الخدمات المقدمة للمواطنين وتحقيق التنمية المستدامة في المجتمعات المحلية.",
                'category_id'  => $devCat?->id,
                'created_by'   => $admin->id,
                'is_published' => true,
                'published_at' => '2026-06-08 21:53:16',
                'cover_image'  => null,
            ]);

            News::create([
                'title'        => 'بكل فخرٍ واعتزاز، يشارك مجلس قروي عسله بتخريج فوج المستقبل',
                'body'         => "بكل فخرٍ واعتزاز، يشارك مجلس قروي عسله بتخريج فوج المستقبل من أطفال روضة عسله، الذين أضاءوا أيامنا ببراءتهم واجتهادهم، وها هم يخطون أولى خطواتهم نحو مستقبلٍ مشرق مليء بالعلم والنجاح.\nنبارك لأطفالنا الأعزاء هذا الإنجاز الجميل، ونتمنى لهم دوام التفوق والتميز في مسيرتهم التعليمية القادمة.\nكما نتقدم بجزيل الشكر والتقدير للهيئة التدريسية على جهودها المباركة، ولأولياء الأمور الكرام على دعمهم ومتابعتهم المستمرة لأبنائهم.\nفوج المستقبل 2026 – روضة عسله.",
                'category_id'  => $devCat?->id,
                'created_by'   => $admin->id,
                'is_published' => true,
                'published_at' => '2026-06-08 21:56:35',
                'cover_image'  => null,
            ]);
            $this->command->info('✓ News (2 articles)');
        } else {
            $this->command->info('✓ News already exists — skipped');
        }

        // ── Jobs ───────────────────────────────────────────────────────────────
        if (Job::count() === 0) {
            Job::create([
                'title'          => 'موظف/ة استقبال',
                'description'    => 'يعلن المجلس القروي عن حاجته لموظف/ة استقبال للعمل في مقر المجلس.',
                'requirements'   => 'خبرة لا تقل عن سنتين، إجادة استخدام الحاسوب.',
                'type'           => 'دوام كامل',
                'location'       => 'عسلة',
                'deadline'       => '2026-07-08',
                'status'         => 'open',
                'attachment_url' => null,
                'created_by'     => $admin->id,
            ]);
            $this->command->info('✓ Jobs');
        } else {
            $this->command->info('✓ Jobs already exist — skipped');
        }

        // ── Tenders ────────────────────────────────────────────────────────────
        if (Tender::count() === 0) {
            Tender::create([
                'reference_no'   => 'T-2026-001',
                'title'          => 'عطاء توريد مواد بناء لمشروع ترميم مبنى المجلس',
                'description'    => 'يعلن المجلس القروي عن طرح عطاء لتوريد مواد بناء لمشروع ترميم مبنى المجلس القروي.',
                'publish_date'   => '2026-06-08',
                'deadline'       => '2026-06-29',
                'status'         => 'open',
                'attachment_url' => null,
                'created_by'     => $admin->id,
            ]);
            $this->command->info('✓ Tenders');
        } else {
            $this->command->info('✓ Tenders already exist — skipped');
        }

        $this->command->info("\n✅ Seed complete!");
    }
}
