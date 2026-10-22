<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\ScheduleController;

/*
|--------------------------------------------------------------------------
| API Routes - Task Management & Collaborative Dossier
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Auth Routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Projects
        Route::apiResource('projects', ProjectController::class);

        // Tasks (with color, subtasks, notes)
        Route::post('/projects/{project}/tasks', [TaskController::class, 'store']);
        Route::put('/tasks/{task}', [TaskController::class, 'update']);
        Route::post('/tasks/{task}/move', [TaskController::class, 'move']);
        Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);

        // Comments
        Route::get('/tasks/{task}/comments', [CommentController::class, 'index']);
        Route::post('/tasks/{task}/comments', [CommentController::class, 'store']);

        // Notes (Dossier memos)
        Route::apiResource('notes', NoteController::class);

        // Schedules & Timeline
        Route::apiResource('schedules', ScheduleController::class);
    });
});
