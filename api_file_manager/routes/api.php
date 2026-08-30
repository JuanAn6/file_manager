<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/check_token', [AuthController::class, 'checkToken']);

    Route::middleware('jwt')->group(function () { //Auth routes

        //FILES AND DIRECTORIES
        Route::post('/get_directory', [HomeController::class, 'getDirectory']);
        Route::post('/create_new_folder', [HomeController::class, 'createNewFolder']);
        Route::post('/upload_files', [HomeController::class, 'uploadFiles']);
        Route::post('/rename_item', [HomeController::class, 'renameItem']);
        Route::get('/directory_tree', [HomeController::class, 'getDirectoryTree']);
        Route::post('/move_items', [HomeController::class, 'moveItems']);
        Route::post('/delete_items', [HomeController::class, 'deleteItems']);
        Route::get('/search', [HomeController::class, 'search']);
        Route::get('/get_files_by_category', [HomeController::class, 'getFilesByCategory']);
        Route::get('/storage_usage', [HomeController::class, 'getStorageUsage']);

        //USER
        Route::get('/user', [AuthController::class, 'getUser']);
        Route::put('/user', [AuthController::class, 'updateUser']);
        Route::post('/logout', [AuthController::class, 'logout']);

        //Profile
        Route::get('/profile', [UsersController::class, 'getUser']);
        Route::post('/update_profile', [UsersController::class, 'updateProfile']);
        Route::get('/get_profile_image', [UsersController::class, 'getProfileImage']);
        Route::post('/update_profile_image', [UsersController::class, 'updateProfileImage']);

        //Protect this routes with rols
        Route::middleware(['auth:api', 'role:superadmin'])->group(function () {
            Route::get('/get_users_list', [UsersController::class, 'getList']);
            Route::get('/roles', [UsersController::class, 'getRoles']);
            Route::get('/users/{id}', [UsersController::class, 'getById']);
            Route::put('/users/{id}', [UsersController::class, 'updateById']);
        });
    });

});
