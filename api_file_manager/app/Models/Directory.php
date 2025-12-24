<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Directory extends Model
{
    //
    protected $table = 'directory';

    protected $fillable = [
        'user_id',
        'parent_id',
        'name',
        'color',
        'icon',
        'items',
        'size',        
    ];

    public function user(){
        return self::belongsTo(User::class, 'user_id');
    }

}
