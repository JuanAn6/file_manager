<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    //

    protected $fillable = [
        'parent_id',
        'user_id',
        'name',
        'extension',
        'size',
        'uuid',
    ];


    
}
