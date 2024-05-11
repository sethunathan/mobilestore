

<!-- resources/views/livewire/company-master.blade.php -->
<div>
    <div class="row">


        <div style="padding-left:30px;" class="col-md-8 col-xs-12">

            <div class="card" style="height: 80vh; overflow-y: auto;">

                <div class="card-header">
                    <div class="row" style="padding-top: 20px; padding-left:20px;">
                        <div class="col-md-8">
                            <h2>Company Master</h2>
                        </div>
                        <div class="col-md-4 text-right">
                            <input wire:model.debounce.300ms="search" id="search-box" type="text" class="form-control"
                                placeholder="Search Companies...">
                        </div>
                    </div>

                </div>
               

                <div class="card-body">

                    <div style="padding-top: 10px">
                        <table class="table table-bordered mt-5">
                            @if ($companies->count() > 0)
                                <thead>
                                    <tr>
                                        <th>No.</th>
                                        <th>Concern Name</th>
                                        <th>Phone</th>
                                        <th>Mobile</th>
                                        <th>PAN No</th>
                                        <th>GST No</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($companies as $company)
                                        <tr>
                                            <td>{{ ($companies->currentPage() - 1) * $companies->perPage() + $loop->index + 1 }}
                                            </td>
                                            <td>{{ $company->concern_name }}</td>
                                            <td>{{ $company->phone }}</td>
                                            <td>{{ $company->mobile }}</td>
                                            <td>{{ $company->pan_no }}</td>
                                            <td>{{ $company->gst_no }}</td>
                                            <td>{{ $company->status }}</td>
                                            <td>
                                                <button wire:click="edit({{ $company->id }})"
                                                    class="btn btn-primary btn-sm">Edit</button>
                                                <button x-data="{ unitId: {{ $company->id }} }" @click="confirmDeletion(unitId)"
                                                    class="btn btn-danger btn-sm">Delete</button>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            @else
                                <tr>
                                    <td colspan="8">
                                        <h5>No companies found</h5>
                                    </td>
                                </tr>
                            @endif
                        </table>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>{{ $companies->links() }}</div>
                            <div class="text-right">Total: {{ $companies->total() }}</div>
                        </div>
                    </div>

                </div>

            </div>

        </div>


        <div class="col-md-4 col-xs-12">
            <div class="card" style="height: 80vh; overflow-y: auto;">
                <div class="card-header card-header-border-bottom d-flex justify-content-between">
                    <h5>{{ $company_id ? 'Edit Company' : 'Create Company' }}</h5>
                </div>
                <div class="card-body" style="padding-top: 10px">
                    <form wire:submit.prevent="store">
                        <div class="form-group">
                            <label for="concern_name">Concern Name*</label>
                            <input type="text" class="form-control" id="concern_name" autofocus
                                placeholder="Enter concern name" wire:model="concern_name">
                            @error('concern_name')
                                <span class="text-danger">{{ $message }}</span>
                            @enderror
                        </div>
                        <div class="form-group">
                            <label for="phone">Phone</label>
                            <input type="text" class="form-control" placeholder="Enter phone" wire:model="phone">
                            @error('phone')
                                <span class="text-danger">{{ $message }}</span>
                            @enderror
                        </div>
                        <div class="form-group">
                            <label for="mobile">Mobile</label>
                            <input type="text" class="form-control" placeholder="Enter mobile" wire:model="mobile">
                            @error('mobile')
                                <span class="text-danger">{{ $message }}</span>
                            @enderror
                        </div>
                        <div class="form-group">
                            <label for="pan_no">PAN No</label>
                            <input type="text" class="form-control" placeholder="Enter PAN No" wire:model="pan_no">
                            @error('pan_no')
                                <span class="text-danger">{{ $message }}</span>
                            @enderror
                        </div>
                        <div class="form-group">
                            <label for="gst_no">GST No</label>
                            <input type="text" class="form-control" placeholder="Enter GST No" wire:model="gst_no">
                            @error('gst_no')
                                <span class="text-danger">{{ $message }}</span>
                            @enderror
                        </div>
                        <div class="form-group">
                            <label for="hsn_code">HSN Code</label>
                            <input type="text" class="form-control" placeholder="Enter HSN Code"
                                wire:model="hsn_code">
                            @error('hsn_code')
                                <span class="text-danger">{{ $message }}</span>
                            @enderror
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="text" class="form-control" placeholder="Enter Email" wire:model="email">
                            @error('email')
                                <span class="text-danger">{{ $message }}</span>
                            @enderror
                        </div>
                        <div class="form-group">
                            <label for="udayam_reg_no">UDAYAM Reg No</label>
                            <input type="text" class="form-control" placeholder="Enter UDAYAM Reg No"
                                wire:model="udayam_reg_no">
                            @error('udayam_reg_no')
                                <span class="text-danger">{{ $message }}</span>
                            @enderror
                        </div>
                        <div class="form-group">
                            <label for="year_id">Year ID</label>
                            <input type="text" class="form-control" placeholder="Enter Year ID" wire:model="year_id">
                            @error('year_id')
                                <span class="text-danger">{{ $message }}</span>
                            @enderror
                        </div>
                        <div class="form-group">
                            <label for="status">Status</label>
                            <select class="form-control" wire:model="status">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                            @error('status')
                                <span class="text-danger">{{ $message }}</span>
                            @enderror
                        </div>

                        <div class="form-group gap-2 mt-3">
                            <button type="submit" class="btn btn-primary">Save</button>
                            <button type="button" wire:click="create" class="btn btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    @push('scripts')
        <script>
            function confirmDeletion(unitId) {
                Swal.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        @this.call('delete', unitId);
                        Swal.fire('Deleted!', 'Company Deleted Successfully.', 'success');
                    }
                });
            }

            document.addEventListener('DOMContentLoaded', function() {
                window.addEventListener('show-toastr', event => {
                    toastr.options = {
                        closeButton: true,
                        positionClass: "toast-top-right",
                    };
                    toastr.success(event.detail[0].message);
                });

                hotkeys('alt+i', function(event, handler) {
                    event.preventDefault();
                    let companyName = document.getElementById('concern_name');
                    if (document.activeElement !== companyName) {
                        companyName.focus();
                    }
                });
            });
        </script>
    @endpush
</div>
