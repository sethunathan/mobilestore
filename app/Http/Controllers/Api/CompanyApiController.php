<?php

namespace App\Http\Controllers\Api;

use App\Models\Company;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class CompanyApiController extends Controller
{
    // GET: List all companies
    public function index(Request $request)
    {
        $search = $request->query('search');
        $companies = Company::when($search, function ($query, $search) {
            return $query->where('concern_name', 'like', '%' . $search . '%');
        })->orderBy('id', 'desc')->paginate(10);

        return response()->json($companies);
    }

    // POST: Create a new company
    public function store(Request $request)
    {
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

        $company = Company::create($request->all());

        return response()->json($company, 201);
    }

    // GET: Show a specific company
    public function show($id)
    {
        $company = Company::findOrFail($id);
        return response()->json($company);
    }

    // PUT: Update a specific company
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

    // DELETE: Delete a specific company
    public function destroy($id)
    {
        $company = Company::findOrFail($id);
        $company->delete();

        return response()->json(['message' => 'Company deleted successfully']);
    }
}

