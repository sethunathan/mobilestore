<?php

namespace Database\Seeders;
use DB;
use App\Models\User;
 
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    { 
        DB::table('users')->insert([
            [
            'name' => 'test',
            'email' => 'test@gmail.com',
            'password' => bcrypt('password'),
        ],
        [
            'name' => 'sethu',
            'email' => 'email.sethu@gmail.com',
            'password' => bcrypt('7Qq5-Thd[4A8Od'),
        ]

    ]);
   
    }
}
