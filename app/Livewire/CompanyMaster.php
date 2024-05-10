<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\WithPagination;
use App\Models\Company;

class CompanyMaster extends Component
{
    use WithPagination;

    public $company_id;
    public $concern_name, $address_line1, $address_line2, $address_line3;
    public $phone, $mobile, $pan_no, $gst_no, $hsn_code, $email;
    public $udayam_reg_no, $year_id;
    public $status = 'Active';
    public $search = '';

    protected $paginationTheme = 'bootstrap';

    protected $rules = [
        'concern_name' => 'required|string|max:255',
        'address_line1' => 'nullable|string|max:255',
        'address_line2' => 'nullable|string|max:255',
        'address_line3' => 'nullable|string|max:255',
        'phone' => 'nullable|string|max:15',
        'mobile' => 'nullable|string|max:15',
        'pan_no' => 'nullable|string|max:15',
        'gst_no' => 'nullable|string|max:15',
        'hsn_code' => 'nullable|string|max:10',
        'email' => 'nullable|email|max:255',
        'udayam_reg_no' => 'nullable|string|max:15',
        'year_id' => 'nullable|string|max:10',
        'status' => 'required|in:Active,Inactive'
    ];

    public function render()
    {
        $companies = Company::where('concern_name', 'like', '%'.$this->search.'%')
            ->orderBy('id', 'desc')
            ->paginate(10);

        return view('livewire.company-master', compact('companies'));
    }

    public function resetInputFields()
    {
        $this->company_id = null;
        $this->concern_name = '';
        $this->address_line1 = '';
        $this->address_line2 = '';
        $this->address_line3 = '';
        $this->phone = '';
        $this->mobile = '';
        $this->pan_no = '';
        $this->gst_no = '';
        $this->hsn_code = '';
        $this->email = '';
        $this->udayam_reg_no = '';
        $this->year_id = '';
        $this->status = 'Active';
    }

    public function store()
    {
        $this->validate();
        
        Company::updateOrCreate(['id' => $this->company_id], [
            'concern_name' => $this->concern_name,
            'address_line1' => $this->address_line1,
            'address_line2' => $this->address_line2,
            'address_line3' => $this->address_line3,
            'phone' => $this->phone,
            'mobile' => $this->mobile,
            'pan_no' => $this->pan_no,
            'gst_no' => $this->gst_no,
            'hsn_code' => $this->hsn_code,
            'email' => $this->email,
            'udayam_reg_no' => $this->udayam_reg_no,
            'year_id' => $this->year_id,
            'status' => $this->status
        ]);

        session()->flash('success', 'Company '.($this->company_id ? 'Updated' : 'Created').' Successfully.');

        $this->resetInputFields();
        $this->dispatch('show-toastr', ['message' => 'Company '.($this->company_id ? 'Updated' : 'Created').' Successfully.']);
    }

    public function edit($id)
    {
        $company = Company::findOrFail($id);
        $this->company_id = $company->id;
        $this->concern_name = $company->concern_name;
        $this->address_line1 = $company->address_line1;
        $this->address_line2 = $company->address_line2;
        $this->address_line3 = $company->address_line3;
        $this->phone = $company->phone;
        $this->mobile = $company->mobile;
        $this->pan_no = $company->pan_no;
        $this->gst_no = $company->gst_no;
        $this->hsn_code = $company->hsn_code;
        $this->email = $company->email;
        $this->udayam_reg_no = $company->udayam_reg_no;
        $this->year_id = $company->year_id;
        $this->status = $company->status;
    }

    public function delete($id)
    {
        Company::findOrFail($id)->delete();
        session()->flash('success', 'Company Deleted Successfully.');
    }

    public function create()
    {
        $this->resetInputFields();
    }
}

