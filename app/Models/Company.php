<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use DB;
class Company extends Model
{
    use HasFactory;
    protected $table='companies';
    protected $fillable = [
        'id', 'concern_name', 'address_line1', 'address_line2', 'address_line3', 
        'phone', 'mobile', 'pan_no', 'gst_no', 'hsn_code', 
        'email', 'udayam_reg_no', 'year_id', 'status'
    ];

   // protected $primaryKey = 'Comp_ID'; // or null
    
    public static function getmax()
    {
       $retvalue= DB::table('companies')        
       ->max('id');        
       if ($retvalue === null)
       {
           $retvalue=1;
       }
       elseif ($retvalue >=1)
       {
           $retvalue=$retvalue+1;
       }
       return $retvalue;
   }


    protected function getall()
    {
        return $this->select('id','concern_name','phone','mobile','email')        
        ->orderBy('concern_name')
        ->get();
    }

}
