{{-- resources/views/company-master.blade.php --}}
@extends('layouts.admin')

@section('content')
<div class="containerh">
    <div class="row justify-content-center">
       
        <div class="col-md-4">
            <div class="card">
                <div class="card-header">Our Company Details</div>
                <div class="card-body">

                <form id="company-form" name ="company" action="{{ url('master/company/store') }}"
                         method="POST"   >

                         <input type="hidden" name="_method" value="POST">
                         <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" id="company_id">
                        <div class="form-group">
                            <label for="concern_name">Our Company Name:</label>
                            <input type="text" id="concern_name"
                             onBlur="checkAvailabilityCompanyName()" 
                             name="concern_name" class="form-control" required>
                              <span class="glyphicon glyphicon-user form-control-feedback"></span>
			                  <span id="user-availability-status"></span>    
                        </div>
                       <?php echo asset('storage/file.txt'); ?>
                        <div class="form-group">


                        <img class="rounded" alt="200x200" width="200" src="assets/images/small/img-4.jpg">
                        <img class="rounded-circle avatar-xl" alt="200x200" src="assets/images/users/avatar-4.jpg">

                        <img class="rounded-circle header-profile-user" src="websiteLoaderIcon.jpeg'" alt="Header Avatar"/>
                        <img src="{{ asset('/public/themes/material/assets/images/users/avatar-1.jpg') }}" alt="job image" title="job image">
                        <img src="storage/website/websiteLoaderIcon.jpeg "  id="loaderIcon"  />
                           <div class="txt-heading"  id="panerror" ></div>
                           </div>
                        <div class="form-group">
                            <label for="phone">Phone:</label>
                            <input type="text" id="phone"   name="phone" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="email">Email:</label>
                            <input type="email" id="email"  name="email" class="form-control">
                        </div>
                        <div> <br>
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
<script type="text/javascript">
      var appBaseUrl = {'http://127.0.0.1:8000'};
      var finalUrl = appBaseUrl+'/public';
      var APP_URL = {!! json_encode(url('/')) !!}
       alert(APP_URL);
      //alert base_url;
</script>