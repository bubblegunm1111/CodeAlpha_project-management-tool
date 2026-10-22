<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Schedule extends Model
{
    protected $fillable = [
        'project_id',
        'title',
        'date',
        'time',
        'category',
        'color',
        'priority',
        'assignee',
        'status'
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
