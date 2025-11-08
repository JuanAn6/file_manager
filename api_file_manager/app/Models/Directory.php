<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Directory extends Model
{
    //

    protected $fillable = [
        'user_id',
        'parent_id',
        'name',
        'color',
        'icon',
        'items',
        'size',        
    ];

}
