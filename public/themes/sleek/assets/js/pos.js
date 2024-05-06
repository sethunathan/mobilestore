
        // Function to fetch and display products
        function fetchAndDisplayProducts(page = 1, categoryId = null, warehouseId = null) {
            // Start with the base URL and mandatory parameters
            let url = `/getitems?page=${page}`;
        
            // Append category_id only if it's available
            if (categoryId) {
                url += `&category_id=${categoryId}`;
            }

            if (warehouseId) {
                url += `&warehouse_id=${warehouseId}`;
            }
        
            $.get(url, function(data) {
                displayProducts(data.products.data);
                displayPagination(data.products.links);
            });
        }
        
        // Function to display products
        function displayProducts(products) {
            $('#productContainer').empty();
            products.forEach(product => {
                const productCardHtml = getProductCardHtml(product);
                $('#productContainer').append(productCardHtml);
            });
        }

        // Function to generate product card HTML
        function getProductCardHtml(product) {
            // Check if the product has a variant_id and set the attribute accordingly
            const variantAttribute = product.variant_id ? `data-variant-id="${product.variant_id}"` : '';
            const unit = product.unit ? product.unit.short_name : 'kg';
            const stockDisplay = stocksModuleEnabled ? `<div class="quantity"><span>${product.current_stock} ${unit}</span></div>` : '';

       
            return `
                <div class="col-md-3 col-sm-6 product-card" data-product-id="${product.id}" data-product-name="${product.name}" data-product-stock="${product.current_stock}" data-product-price="${product.price}" ${variantAttribute}>
                    <div class="card mt-3">
                    ${stockDisplay}
                        <img class="img-fluid rounded-circle" style="height:140px; width:140px; align-self: center; " src="${product.image}" alt="${product.name}">
                        <div class="card-body" style="padding: 1.725rem">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text">Price : $${product.price}</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Function to display pagination
        function displayPagination(links) {
            const paginationHtml = links.map(link => getPaginationLinkHtml(link)).join('');
            $('#paginationContainer').html(
                `<nav aria-label="Page navigation"><ul class="pagination">${paginationHtml}</ul></nav>`);
        }

        // Function to generate pagination link HTML
        function getPaginationLinkHtml(link) {
            return `<li class="page-item ${link.active ? 'active' : ''}"><a class="page-link" href="${link.url}">${link.label}</a></li>`;
        }



        // Add product to local storage (cart)
        function addProductToCart(productInfo) {
            const cart = getCartFromLocalStorage();
            
            // Create a unique identifier for the cart item
            const productIdentifier = productInfo.variant_id ? `${productInfo.id}-${productInfo.variant_id}` : `${productInfo.id}`;
            
            // Find if the product (and its variant, if applicable) already exists in the cart
            const existingProductIndex = cart.findIndex(item => item.productIdentifier === productIdentifier);
        
            // Assuming `stocksModuleEnabled` and `warehousesModuleEnabled` are previously defined flags
            if (stocksModuleEnabled && (productInfo.stock < 1 || productInfo.stock === null)) {
                toastr.error("Cannot add to cart, product is out of stock or stock data is unavailable.");
                return;
            }
     
            if (warehousesModuleEnabled) {
                // Disable the warehouseSelect dropdown to manage item stock
                document.getElementById('warehouseDropdown').disabled = true;
            }
        
            if (existingProductIndex !== -1) {

                // Check if adding another unit exceeds current stock
                if (stocksModuleEnabled && productInfo.stock < (cart[existingProductIndex].quantity + 1)) {
                    toastr.error("Cannot add more to cart, not enough stock.");
                    return;
                }
                // Increase the quantity if stock is sufficient
                cart[existingProductIndex].quantity += 1;
            } else {
                // Add new item to the cart if it doesn't exist and stock is sufficient
                const newCartItem = {
                    productId: productInfo.id,
                    productName: productInfo.name,
                    productPrice: parseFloat(productInfo.price),
                    quantity: 1,
                    variantId: productInfo.variant_id,
                    productIdentifier: productIdentifier, 
                    stock: productInfo.stock
                };
                cart.push(newCartItem);
            }
        
            saveCartToLocalStorage(cart);
        
            // Play beep sound
            playBeepSound();
        }
        
        function getCartFromLocalStorage() {
            // Retrieve cart from local storage or return an empty array if not found
            return JSON.parse(localStorage.getItem('cart')) || [];
        }
        
        function saveCartToLocalStorage(cart) {
            // Save the updated cart back to local storage
            localStorage.setItem('cart', JSON.stringify(cart));
        }
        
        function playBeepSound() {
            // Play beep sound logic
        }
        
        

        function playBeepSound() {
            const audio = new Audio(beepAudioUrl); 
            audio.play().catch(e => console.error('Error playing sound:', e));
        }

        // Get cart from local storage
        function getCartFromLocalStorage() {
            return JSON.parse(localStorage.getItem('cart')) || [];
        }

        // Save cart to local storage
        function saveCartToLocalStorage(cart) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }

        // Display cart items
        function displayCart() {
            const cart = getCartFromLocalStorage();

            if (cart.length === 0) {
                displayEmptyCartMessage();
            } else {
                const cartItemsHtml = cart.map(getCartItemHtml).join('');
                const tableHtml = `
            <table class="table">
                <thead>
                    <tr>
                        <th class="product-name">Product Name</th>
                        <th class="price">Price</th>
                        <th class="quantity">Quantity</th>
                        <th class="remove"></th>
                    </tr>
                </thead>
                <tbody>${cartItemsHtml}</tbody>
            </table>
        `;

                $('#cartContainer').html(tableHtml);
                calculateAndDisplayTotal(cart);
                $('#discountSection').show(); // Show the discount input
            }
        }

        // Function to display a message when the cart is empty
        function displayEmptyCartMessage() {
            const emptyCartHtml = '<br><br><br>   <p class="text-center">Your cart is empty. Add some products!</p>';
            $('#cartContainer').html(emptyCartHtml);
            $('#totalAmountContainer').empty(); // Clear the total amount container
            $('#discountSection').hide(); // Hide the discount input
        }

        // Generate HTML for a cart item
        function getCartItemHtml(item) {
            return `
                <tr data-product-id="${item.productId}" data-variant-id="${item.variantId}">
                    <td>${item.productName}</td>
                    <td>
                            <input type="text" inputmode="decimal" pattern="[0-9]+(\.[0-9]{1,2})?" value="${item.productPrice.toFixed(2)}"  class="form-control product-price" style="width:90px">
                    </td>
                    <td>
                        <div class="quantity-controls d-flex align-items-center">
                            <input class="form-control cart-item-quantity" style="width:80px" type="number" value="${item.quantity}" min="1">
                        </div>
                    </td>
                    <td >
                        <button type="button" class="close remove-item-btn" aria-label="Close">
                            <span aria-hidden="true">×</span>
                        </button>
                    </td>
                </tr>
                `;
        }


        // Calculate and display the total amount
        function calculateAndDisplayTotal(cart) {
            const discount = parseFloat($('#discountInput').val()) || 0;
            const discountType = $('#discount_type').val();
            const taxRate = parseFloat($('#taxInput').val()) || 0; // Get the current tax rate
            const calculations = calculateTotalAmount(cart, discount, discountType, taxRate);
        
            const discountTypeValue = $('#discount_type option:selected').text();
        
            $('#totalAmountContainer').html(`
                <div class="totals">
                    <br>
                    <table class="table">
                        <tr>
                            <td colspan="2">Subtotal:</td>
                            <td>${CurrencySymbol} ${(cart.reduce((acc, item) => acc + (item.productPrice * item.quantity), 0)).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td colspan="2">Discount (${discountTypeValue}):</td>
                            <td>-${calculations.discountAmount}</td>
                        </tr>
                        <tr>
                            <td colspan="2">Tax:</td>
                            <td>${CurrencySymbol} ${calculations.taxAmount}</td>
                        </tr>
                        <tr>
                            <td colspan="2"><strong>Grand Total:</strong></td>
                            <td><strong>${CurrencySymbol} ${calculations.totalAmount}</strong></td>
                        </tr>
                    </table>
                </div>
            `);
        }
        

        // Calculate total amount considering price, quantity, and discount
        function calculateTotalAmount(cart, discount, discountType, taxRate) {
            let subtotal = cart.reduce((acc, item) => acc + (item.productPrice * item.quantity), 0);
        
            // Apply discount
            let discountAmount = 0;
            if (discountType === 'percent') {
                discountAmount = (subtotal * discount) / 100;
            } else {
                discountAmount = discount;
            }
            let discountedSubtotal = subtotal - discountAmount;

            if (taxRate > 90) {
                toastr.error("taxRate cannot exceed 90 for percent type.");
            }
        
            // Apply tax on the discounted subtotal
            let taxAmount = (discountedSubtotal * taxRate) / 100;
        
            // Total amount is discounted subtotal plus tax
            let totalAmount = discountedSubtotal + taxAmount;
        
            return {
                totalAmount: totalAmount.toFixed(2),
                taxAmount: taxAmount.toFixed(2),
                discountAmount: discountAmount.toFixed(2)
            };
        }
        

        // Function to update only the cart data for the quantity
        function updateCartDataQuantity(productIdentifier, newQuantity) {
            const cart = getCartFromLocalStorage();
            const productIndex = cart.findIndex(item => item.productIdentifier === productIdentifier);
        
            if (productIndex !== -1) {
                if (stocksModuleEnabled && newQuantity > cart[productIndex].stock) {

                    toastr.error("Cannot update quantity, exceeds current stock.");
                    return;
                }
                cart[productIndex].quantity = newQuantity;
                saveCartToLocalStorage(cart);
                updateTotalAmountDisplay();
            }
        }
        // Function to update only the cart data for the price
        function updateCartDataPrice(productIdentifier, newPrice) {
            const cart = getCartFromLocalStorage();
            const productIndex = cart.findIndex(item => item.productIdentifier === productIdentifier);
        
            if (productIndex !== -1) {
                cart[productIndex].productPrice = newPrice;
                saveCartToLocalStorage(cart);
                updateTotalAmountDisplay();
            }
        }

        // Function to update the total amount display
        function updateTotalAmountDisplay() {
            const cart = getCartFromLocalStorage();
            const discount = parseFloat($('#discountInput').val()) || 0;
            const discountType = $('#discount_type').val(); // Get the current discount type
            const taxRate = parseFloat($('#taxInput').val()) || 0; // Get the current tax rate
            const calculations = calculateTotalAmount(cart, discount, discountType, taxRate);
        
            $('#totalAmountContainer').html(`
                <div class="totals">
                    <br>
                    <table class="table">
                        <tr>
                            <td colspan="2">Subtotal:</td>
                            <td>$${(cart.reduce((acc, item) => acc + (item.productPrice * item.quantity), 0)).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td colspan="2">Discount (${$('#discount_type option:selected').text()}):</td>
                            <td>-${calculations.discountAmount}</td>
                        </tr>
                        <tr>
                            <td colspan="2">Tax:</td>
                            <td>$${calculations.taxAmount}</td>
                        </tr>
                        <tr>
                            <td colspan="2"><strong>Grand Total:</strong></td>
                            <td><strong>$${calculations.totalAmount}</strong></td>
                        </tr>
                    </table>
                </div>
            `);
        }
        
        

        function removeItemFromCart(productIdentifier) {
            let cart = getCartFromLocalStorage();
            cart = cart.filter(item => item.productIdentifier !== productIdentifier);
            saveCartToLocalStorage(cart);
            displayCart();
        }


        // Event listeners
        $(document).ready(function() {
            // Initial fetch of products
            fetchAndDisplayProducts();


            // Handle category selection change
            $('#categorySelect').change(function() {
                var warehouseId= $('#warehouseDropdown').val() || null;
                fetchAndDisplayProducts(1, $(this).val(), warehouseId);
            });

            $('#warehouseDropdown').change(function() {

                var categoryId= $('#categorySelect').val() || null;

                fetchAndDisplayProducts(1,categoryId, $(this).val());
            });

            // Handle pagination link click
           /*  $(document).on('click', '.pagination a', function(e) {
                e.preventDefault();
                fetchAndDisplayProducts($(this).attr('href').split('page=')[1]);
            }); */

            $(document).on('click', '.pagination a', function(e) {
                e.preventDefault();
                
                // Extract the page number from the clicked link
                const page = $(this).attr('href').split('page=')[1];
                const categoryId = $('#categorySelect').val(); 
                const warehouseId = $('#warehouseDropdown').val(); 
            
                fetchAndDisplayProducts(page, categoryId, warehouseId);
            });
            

            // Handle product card click
            $(document).on('click', '.product-card', function() {
                const productInfo = {
                    id: $(this).data('product-id'),
                    name: $(this).data('product-name'),
                    price: $(this).data('product-price'),
                    variant_id: $(this).data('variant-id') || null,
                    stock: $(this).data('product-stock') || null
                };
                addProductToCart(productInfo);
                displayCart();
            });

            // Handle discount input change
            $('#discountInput').on('input change', function() {
                displayCart();
            });

            // Event listener for discount type change
            $('#discount_type').on('change', function() {
                displayCart(); // Recalculate and display cart because discount type has changed
            });


            // Event listener for tax input change
            $('#taxInput').on('input change', function() {
                const cart = getCartFromLocalStorage();
                calculateAndDisplayTotal(cart);
            });


            // Event listener for quantity change in cart
            $(document).on('input', '.cart-item-quantity', function() {
                const productRow = $(this).closest('tr');
                const productId = parseInt(productRow.data('product-id'));
                const variantId = productRow.data('variant-id');
                const productIdentifier = variantId ? `${productId}-${variantId}` : `${productId}`;
                const newQuantity = parseInt($(this).val());
        
                if (!isNaN(newQuantity) && newQuantity > 0) {
                    updateCartDataQuantity(productIdentifier, newQuantity);
                } else {
                    console.log('Invalid quantity entered');
                }
            });



            // Event listener for price change in cart
            $(document).on('input', '.product-price', function() {
                const productRow = $(this).closest('tr');
                const productId = parseInt(productRow.data('product-id'));
                const variantId = productRow.data('variant-id');
                const productIdentifier = variantId ? `${productId}-${variantId}` : `${productId}`;
                const newPrice = parseFloat($(this).val());
        
                if (!isNaN(newPrice) && newPrice > 0) {
                    updateCartDataPrice(productIdentifier, newPrice);
                } else {
                    console.log('Invalid price entered');
                }
            });

            // Clear cart on page load
            localStorage.removeItem('cart');
            displayCart();
        });

        // Event listener for remove item button in cart
        $(document).on('click', '.remove-item-btn', function() {
            const productRow = $(this).closest('tr');
            const productId = parseInt(productRow.data('product-id'));
            const variantId = productRow.data('variant-id');
            const productIdentifier = variantId ? `${productId}-${variantId}` : `${productId}`;
            removeItemFromCart(productIdentifier);
        });

       



        $(document).ready(function() {

            $('#createSaleButton').on('click', function() {
                // Get cart items from local storage 
                const cartItems = getCartFromLocalStorage();
                const discount = parseFloat($('#discountInput').val()) || 0;
                const discountType = $('#discount_type').val(); // Get the current discount type
                const taxRate = parseFloat($('#taxInput').val()) || 0; // Get the current tax rate
                const calculations = calculateTotalAmount(cartItems, discount, discountType, taxRate);
            
                console.log(calculations);
                // Prepare data for sending
                const data = {
                    _token: $('meta[name="csrf-token"]').attr('content'),
                    cart: cartItems,
                    sale_date: $('#saleDate').val(),
                    customer_id: $('#customerDropdown').val(),
                    warehouse_id: $('#warehouseDropdown').val() || 1,
                    discount: discount,
                    discount_type: discountType, // Include discount type
                    tax_rate: taxRate, // Include tax rate
                    tax_amount: calculations.taxAmount, // Include tax amount
                    total_amount: calculations.totalAmount // Use total amount from calculations
                };
            
                $.ajax({
                    url: createSaleUrl,
                    type: 'POST',
                    data: data,
                    success: function(response) {
                        // Handle success
                        console.log('Sale created successfully:', response);
                        // Consider clearing the cart in local storage and updating the UI
                        localStorage.removeItem('cart');
            
                        // Set grand total as default paying amount
                        $('#payingAmount').val(response.grandTotal);
            
                        // Set sales ID in the hidden input field
                        $('#salesId').val(response.salesId);

                        // ... update UI ...
                        displayCart();

                        $('#paymentModal').modal('show');
                    },
                    error: function(response) {
                        // Handle errors
                        toastr.options = {
                            closeButton: true,
                            positionClass: "toast-top-right",
                        };
                        if (response.status === 422) { // Validation error
                            // Extract errors and concatenate into a message
                            let errorMsg = '';
                            $.each(response.responseJSON.errors, function(key, value) {
                                errorMsg += value + '<br/>';
                            });
                            toastr.error(errorMsg);
                        } else {
                            // Handle other types of errors
                            toastr.error('An error occurred. Please try again.');
                        }
                    }
                });
            });



            $('#customerForm').on('submit', function(e) {
                e.preventDefault();
                // Get the values from the input fields
                var customerName = $('#newCustomerName').val();
                var customerPhone = $('#newCustomerPhone').val();

                 // Check if the customerName is empty
                if (customerName.trim() === '') {
                    // Show an error message, for example:
                    alert('Customer Name cannot be empty');
                    return; // Stop further execution
                }
                    
                // Send the data using AJAX to your Laravel backend
                $.ajax({
                    url: addCustomerUrl, // Adjust this URL to your Laravel route
                    type: 'POST',
                    data: {
                        name: customerName,
                        phone: customerPhone,
                        _token: $('meta[name="csrf-token"]').attr("content") // Include CSRF token for Laravel
                    },
                    success: function(response) {
                        // Assuming the response contains the id and name of the newly created customer
                        var newOption = $('<option>', {
                            value: response.id,
                            text: response.name,
                            selected: true
                        });
        
                        // Append the new option and select it
                        $('#customerDropdown').append(newOption);
        
                        // Close the modal
                        $('#createCustomerModal').modal('hide');
        
                        // Optionally, clear the input fields
                        $('#newCustomerName').val('');
                        $('#newCustomerPhone').val('');
                    }
                });
            });
            
        
            $('#paymentForm').on('submit', function(e) {
                e.preventDefault();

                // Prepare data for sending
                const data = {
                    _token: $('meta[name="csrf-token"]').attr('content'),
                    sales_id: $('#salesId').val(),
                    payment_date: $('#paymentDate').val(),
                    payment_choice_id: $('#paymentChoice').val(),
                    payment_notes: $('#paymentNotes').val(),
                    paying_amount: $('#payingAmount').val(),
                    sales_notes: $('#salesNotes').val(),
                };

                // Include account_id only if it's provided
                const accountId = $('#account_id').val();
                if (accountId && accountId.trim() !== '') {
                    data.account_id = accountId;
                }

                $.ajax({
                    url: paymentURL,
                    type: 'POST',
                    data: data,
                    success: function(response) {
                        // Handle success
                        console.log('Payment submitted successfully:', response);

                        // Redirect to the POS print page
                        //window.location.href = redirectURL + $('#salesId').val();
                        window.open(redirectURL + $('#salesId').val(), '_blank');

                        window.location.reload(true);


                    },
                    error: function(response) {
                        // Handle errors
                        toastr.options = {
                            closeButton: true,
                            positionClass: "toast-top-right",
                        };
                        if (response.status === 422) { // Validation error
                            // Extract errors and concatenate into a message
                            let errorMsg = '';
                            $.each(response.responseJSON.errors, function(key, value) {
                                errorMsg += value + '<br/>';
                            });
                            toastr.error(errorMsg);
                        } else {
                            // Handle other types of errors
                            toastr.error('An error occurred. Please try again.');
                        }
                    }
                });
            });
        });
