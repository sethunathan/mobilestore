<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'id', 'concern_name', 'address_line1', 'address_line2', 'address_line3', 
        'phone', 'mobile', 'pan_no', 'gst_no', 'hsn_code', 
        'email', 'udayam_reg_no', 'year_id', 'status'
    ];
}
