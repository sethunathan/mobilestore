{{-- resources/views/company-master.blade.php --}}
@extends('layouts.admin')

@section('content')
<div class="containerh">
    <div class="row justify-content-center">

    <div class="col-6">
         <div class="float-right"><a class="btn btn-sm  btn-primary" href="{{ url('master/company/create') }}">Add New</a></div>
           </div>
           <div class="card-header">
                    <input type="text" id="search-box" class="form-control" placeholder="Search Companies..."
                     onkeyup="searchCompanies()">
                </div>
        <div class="col-md-8">
            <div class="card"> 
                <div class="card-body">
                    <table class="table" id="companies-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Concern Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                            
                        </thead>
                        <tbody>
                            
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        

    </div>
</div>
@endsection

@push('scripts')
<script src="{{ assets('assets/js/company.js') }}"></script>
@endpush
