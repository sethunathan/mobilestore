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
        
         return view('master.company.company_master_view');
    }

    public function edit($id)
    { 
        $accmasaccounts = Company::find($id);     
        return  view('master.company.company_master_edit',compact('accmasaccounts'));
    }

    public function check_availability()
	{
        if(isset($_POST['cat_name']))
        {
        require_once('../conn/blog.php');
        
        mysqli_select_db($blog, $database_blog);
        $cat_name = $_POST['cat_name'];
        $query = "SELECT cat_name FROM category WHERE cat_name = '$cat_name'";
        
        $query_retrived = mysqli_query($blog, $query) or die("Error:".mysqli_error($blog));
        $rows = mysqli_fetch_assoc($query_retrived);
        $result = mysqli_num_rows($query_retrived);
        
        if ($result>0)
        {
            echo 'true';
        }
        else
        {
            echo 'false';
        }
        mysqli_free_result($query_retrived);
        }


		 if(!empty($_POST["username"]))
     	{ 
           $ac_name=$_POST["ac_name"];	 
       		
		$row = $this->db->query("SELECT  company_name FROM mascompany WHERE  pan='" . $flag. "' and 
     		ac_name<>'" . $ac_name. "'and tin_no='" . $tin_no. "' ")->row();
	 
        if($row) { 
				 echo "<span style='color:red;font-weight:bold' class='status-available'> This pan linked with [$row->ac_name],  State   [row->tin_no]</span>";
				 
		}
		else
			
			{
		  	 echo "<span style='font-family: wingdings; font-size: 200%;'>&#252;</span>";
			}
		}		
	} 
    public function searchrecords(Request $request)
    { 
       
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

