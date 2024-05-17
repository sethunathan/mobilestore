{{-- resources/views/company-master.blade.php --}}
@extends('layouts.admin')

@section('content')
<div class="containerh">
    <div class="row justify-content-center">
     
        <div class="col-md-4">
            <div class="card">
                <div class="card-header">Company Details</div>
                <div class="card-body">
                    <form id="company-form">
                        <input type="hidden" id="company_id">
                        <div class="form-group">
                            <label for="concern_name">Concern Name:</label>
                            <input type="text" id="concern_name" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="phone">Phone:</label>
                            <input type="text" id="phone" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="email">Email:</label>
                            <input type="email" id="email" class="form-control">
                        </div>
                        <button type="submit" class="btn btn-primary">Save</button>
                        <button type="button" onclick="resetForm()" class="btn btn-secondary">Clear</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ assets('assets/js/company.js') }}"></script>
@endpush
