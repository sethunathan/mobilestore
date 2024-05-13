<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Master; 

Route::get('/', function () {
    return view('welcome');
});



Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');

Route::get('master/company/searchrecords', [Master\CompanyController::class, 'searchrecords']);   
Route::get('/master/company', [Master\CompanyController::class, 'index']);
Route::get('/master/company/create', [Master\CompanyController::class, 'create']);
Route::post('/master/company/store', [Master\CompanyController::class, 'store']);
Route::get('/master/company/edit/{number?}', [Master\CompanyController::class, 'edit']);
Route::post('/master/company/update',  [Master\CompanyController::class, 'update']);    
Auth::routes();
