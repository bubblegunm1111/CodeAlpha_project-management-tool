<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    protected $fillable = [
        'column_id',
        'project_id',
        'title',
        'description',
        'assigned_to',
        'priority',
        'due_date',
        'position',
        'color',
        'tags',
        'progress',
        'subtasks',
        'note'
    ];

    protected $casts = [
        'tags' => 'array',
        'subtasks' => 'array',
        'progress' => 'integer',
        'position' => 'integer'
    ];

    public function column(): BelongsTo
    {
        return $this->belongsTo(BoardColumn::class, 'column_id');
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->latest();
    }
}
