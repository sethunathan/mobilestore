<?php

namespace App\Http\Controllers\Master;

use App\Models\Company;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
 
class CompanyController extends Controller
{
    
    public function index(Request $request)
    {
       
        $companies= Company::getall(); 
       return view('master.company.company_master_view',compact('companies'));
    }
    public function searchrecords(Request $request)
    {
          
       // $company= Company::orderBy('concern_name','asc')->paginate(5); 
        //return response()->json($company);
        $search = $request->query('search');
        $companies = Company::when($search, function ($query, $search) {
            return $query->where('concern_name', 'like', '%' . $search . '%');
        })->orderBy('id', 'desc')->paginate(10);

        return response()->json($companies);
       
    }


    public function create()
    {

        return view('master.company.company_master_create');
    }
    

    public function store(Request $request)
    {       
       
        $id= Company::getmax();   
        Company::create(['id'=>$id,       
        'concern_name'=>$request->concern_name,
        'phone'=>$request->phone,
        'email'=>$request->email
         ]);
        $msg = [ 'message' => 'Concern Name created successfully!' ];
        return  redirect('master/company')->with($msg);
    }

    
   
   
   
    public function update(Request $request, $id)
    {
        $company = Company::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'concern_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:15',
            'mobile' => 'nullable|string|max:15',
            'pan_no' => 'nullable|string|max:15',
            'gst_no' => 'nullable|string|max:15',
            'hsn_code' => 'nullable|string|max:10',
            'email' => 'nullable|email|max:255',
            'udayam_reg_no' => 'nullable|string|max:15',
            'year_id' => 'nullable|string|max:10',
            'status' => 'required|in:Active,Inactive'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $company->update($request->all());

        return response()->json($company);
    }

   
    public function destroy($id)
    {
        // No Need to Delete
        //$company = Company::findOrFail($id);
       // $company->delete();
        //return response()->json(['message' => 'Company deleted successfully']);
    }
}

