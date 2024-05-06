function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}


document.getElementById('search-box').addEventListener('input', debounce(function(e) {
    const query = e.target.value;
    if (query.length < 2) { // Avoid searching for too short strings
        document.getElementById('searchResults').innerHTML = '';
        return;
    }

    var warehouseId = warehousesModuleEnabled ? document.getElementById("warehouseSelect").value : null;

    if (warehousesModuleEnabled && !warehouseId) {
        toastr.error("Please select a warehouse before searching.");
        return;
    }

    searchProducts(query);
}, 500)); // Adjust debounce time as needed

function searchProducts(query) {
    // Example URL, adjust based on your actual search endpoint
    const url = `/api/search-products?query=${encodeURIComponent(query)}`;
    fetch(url)
        .then(response => response.json())
        .then(data => displaySearchResults(data))
        .catch(error => console.error('Error searching products:', error));
}

function displaySearchResults(products) {
    const searchResultsDiv = document.getElementById('searchResults');
    searchResultsDiv.innerHTML = ''; // Clear previous results
    products.forEach(product => {
        const li = document.createElement("li");
        li.classList.add("list-group-item");
        li.textContent = `${product.name} - ${product.cost}`;
        // Set custom attributes for the product and its variant
        li.setAttribute("data-product-id", product.id);
        li.setAttribute("data-variant-id", product.variant_id || "");
        li.setAttribute("data-product-name", product.name);
        li.setAttribute("data-product-price", product.cost);

         // Enable tab index for each list item
        li.setAttribute("tabIndex", 0);

        
        // Event listener to add product to cart on click
        li.addEventListener("click", function () {
            const productToAdd = {
                id: this.getAttribute("data-product-id"),
                name: this.getAttribute("data-product-name"),
                price: this.getAttribute("data-product-price"),
                variant_id: this.getAttribute("data-variant-id"),
            };
            addToPurchaseCart(productToAdd);
            searchResultsDiv.innerHTML = ''; // Clear the search results
        });
        searchResultsDiv.appendChild(li);
    });
}























// Function to add product to the cart
function addToPurchaseCart(product) {
    // Create a unique identifier to consider product variants
    const productIdentifier = product.variant_id ? `${product.id}-${product.variant_id}` : `${product.id}`;
    
    const existingProductIndex = purchaseCart.findIndex(
        item => item.productIdentifier === productIdentifier
    );

    if (existingProductIndex !== -1) {
        purchaseCart[existingProductIndex].quantity += 1;
        purchaseCart[existingProductIndex].subtotal = 
            (purchaseCart[existingProductIndex].quantity * purchaseCart[existingProductIndex].productPrice).toFixed(2);
    } else {
        const newCartItem = {
            productId: product.id,
            productIdentifier: productIdentifier,
            productName: product.name,
            productPrice: parseFloat(product.price),
            quantity: 1,
            subtotal: parseFloat(product.price).toFixed(2),
            variantId: product.variant_id || null,
        };
        purchaseCart.push(newCartItem);
    }
    updatePurchaseCartTable();

    
    document.getElementById('search-box').value = '';
}


// Function to update cart table in UI
function updatePurchaseCartTable() {
    const tableBody = document.querySelector(".my-table tbody");
    let tableContent = "";

    totalWithoutTaxAndShipping = 0; // Reset total

    if (purchaseCart.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No data available</td></tr>';
    } else {
        purchaseCart.forEach((item, index) => {
            totalWithoutTaxAndShipping += parseFloat(item.subtotal);

            tableContent += `
                        <tr>
                            <td>${item.productName}</td>
                            <td><input type="text" class="form-control input-sm price-input" value="${item.productPrice}" data-product-identifier="${item.productIdentifier}"></td>
                            <td>
                                <div class="input-group">
                                    <button type="button"  onclick="decrementQuantity('${item.productIdentifier}')" style="color: rgb(138, 144, 157);">
                                        <span class="mdi mdi-24px mdi-minus-circle-outline"></span>
                                    </button>
                                    <input type="number" class="form-control input-sm quantity-input" value="${item.quantity}" min="1" data-product-identifier="${item.productIdentifier}">

                                    <button type="button"  onclick="incrementQuantity('${item.productIdentifier}')" style="color: rgb(138, 144, 157);">
                                        <span class="mdi mdi-24px mdi-plus-circle-outline"></span>
                                    </button>
                                </div>
                            </td>
                            <td>₹ ${parseFloat(item.subtotal).toFixed(2)}</td>
                            <td><button class="btn btn-sm btn-danger" onclick="removeFromCart('${item.productIdentifier}')">Remove</button></td>
                        </tr>
            `;
        });
    }

    tableBody.innerHTML = tableContent;
    updateGrandTotal(); // Update the grand total after rendering the table
}
// Function to calculate the discount
function calculateDiscount(discountType, discountAmount) {
    if (discountType === "fixed") {
        return discountAmount;
    } else if (discountType === "percent") {
        return (discountAmount / 100) * totalWithoutTaxAndShipping;
    }
    return 0;
}

// Function to calculate tax
function calculateTax(taxRate) {
    if (taxRate === 0 || isNaN(taxRate)) {
        return 0;
    }
    return (taxRate / 100) * (totalWithoutTaxAndShipping - calculateDiscount(document.getElementById("discountType").value, parseFloat(document.getElementById("discountAmount").value) || 0));
}

// Function to update grand total
function updateGrandTotal() {
    const discountType = document.getElementById("discountType").value;
    const discountAmount = parseFloat(document.getElementById("discountAmount").value) || 0;
    const taxRate = parseFloat(document.getElementById("taxRate").value) || 0;
    const shippingAmount = parseFloat(document.getElementById("shippingAmount").value) || 0;

    const discount = calculateDiscount(discountType, discountAmount);
    tax = calculateTax(taxRate);

    grandTotal = totalWithoutTaxAndShipping - discount + tax + shippingAmount;

    document.getElementById("display_discount").textContent = `₹ ${discount.toFixed(2)} (${discountType === "percent" ? discountAmount + "%" : "Fixed"})`;
    document.getElementById("display_tax").textContent = `₹ ${tax.toFixed(2)}`;
    document.getElementById("display_shipping").textContent = `₹ ${shippingAmount.toFixed(2)}`;
    document.getElementById("grandTotal").textContent = `₹ ${grandTotal.toFixed(2)}`;
}

// Event listeners for dynamic updates
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("discountType").addEventListener("change", updateGrandTotal);
    document.getElementById("discountAmount").addEventListener("input", updateGrandTotal);
    document.getElementById("taxRate").addEventListener("input", updateGrandTotal);
    document.getElementById("shippingAmount").addEventListener("input", updateGrandTotal);
});


// Create a map to store debounced functions for each input by its product identifier
const debouncedUpdates = {};

document.addEventListener('input', function(event) {
    if (event.target.classList.contains('quantity-input')) {
        const productIdentifier = event.target.getAttribute('data-product-identifier');

        // Check if a debounced function already exists for this identifier, if not, create one
        if (!debouncedUpdates[productIdentifier]) {
            debouncedUpdates[productIdentifier] = debounce(function(value) {
                updateQuantity(productIdentifier, value);
            }, 1000, false); // Adjust the debounce timing as needed
        }

        // Call the debounced function for this product identifier
        debouncedUpdates[productIdentifier](event.target.value);
    }
});


document.addEventListener('input', function(event) {
    // Check if the event is from a price input
    if (event.target.classList.contains('price-input')) {
        const productIdentifier = event.target.getAttribute('data-product-identifier');
        const value = parseFloat(event.target.value);

        // Construct a unique key for debouncing the price update to differentiate it from quantity updates
        const debounceKey = productIdentifier + '-price';

        // Check if a debounced function already exists for this key, if not, create one
        if (!debouncedUpdates[debounceKey]) {
            debouncedUpdates[debounceKey] = debounce(function(updatedValue) {
                // Call updatePrice with the product identifier and the new price
                updatePrice(productIdentifier, updatedValue);
            }, 1000, false); // Adjust the debounce timing as needed
        }

        // Call the debounced function for this product identifier with the new price
        debouncedUpdates[debounceKey](value);
    }
});




// Update price in the cart
function updatePrice(productIdentifier, newPrice) {
    console.log('Updating price for:', productIdentifier, 'New price:', newPrice); // Debug log
    newPrice = parseFloat(newPrice);
    if (!isNaN(newPrice) && newPrice > 0) {
        const index = purchaseCart.findIndex(item => item.productIdentifier === productIdentifier);
        if (index !== -1) { // Ensure item is found
            purchaseCart[index].productPrice = newPrice;
            purchaseCart[index].subtotal = (purchaseCart[index].quantity * newPrice).toFixed(2);
            updatePurchaseCartTable();
        }
    }
}


// Update quantity in the cart
function updateQuantity(productIdentifier, newQuantity) {
    newQuantity = parseInt(newQuantity, 10);
    const productIndex = purchaseCart.findIndex(
        (item) => item.productIdentifier === productIdentifier
    );

    if (productIndex !== -1 && !isNaN(newQuantity) && newQuantity > 0) {
        const productInCart = purchaseCart[productIndex];

        let subtotal=newQuantity * productInCart.productPrice;
        purchaseCart[productIndex].quantity = newQuantity;
        purchaseCart[productIndex].subtotal = subtotal.toFixed(2);
        updatePurchaseCartTable();
    }
}



function incrementQuantity(productIdentifier) {

    
    const productIndex = purchaseCart.findIndex(
        (item) => item.productIdentifier === productIdentifier
    );
    if (productIndex !== -1) {
        const productInCart = purchaseCart[productIndex];
        const NewQuantity = productInCart.quantity + 1;
        updateQuantity(productIdentifier, NewQuantity);
    }
}

function decrementQuantity(productIdentifier) {
    const productIndex = purchaseCart.findIndex(
        (item) => item.productIdentifier === productIdentifier
    );
    if (productIndex !== -1) {
        const productInCart = purchaseCart[productIndex];
        let newQuantity = productInCart.quantity - 1;
        newQuantity = Math.max(newQuantity, 1); // Ensure the quantity doesn't go below 1
        updateQuantity(productIdentifier, newQuantity);
    }
}


// Remove item from the cart
function removeFromCart(productIdentifier) {
    purchaseCart = purchaseCart.filter((item) => item.productIdentifier !== productIdentifier);
    updatePurchaseCartTable();
}


$(document).ready(function () {

    $('#supplierFrom').on('submit', function(e) {
        e.preventDefault();
        // Get the values from the input fields
        var supplierName = $('#newSupplierName').val();
        var supplierPhone = $('#newSupplierPhone').val();

          // Check if the customerName is empty
          if (supplierName.trim() === '') {
            // Show an error message, for example:
            alert('Supplier Name cannot be empty');
            return; // Stop further execution
        }

        // Send the data using AJAX to your Laravel backend
        $.ajax({
            url: addSupplierUrl, // Adjust this URL to your Laravel route
            type: 'POST',
            data: {
                name: supplierName,
                phone: supplierPhone,
                _token: $('meta[name="csrf-token"]').attr("content") // Include CSRF token for Laravel
            },
            success: function(response) {
                // Assuming the response contains the id and name of the newly created supplier
                var newOption = $('<option>', {
                    value: response.id,
                    text: response.name,
                    selected: true
                });

                // Append the new option to the supplier dropdown and select it
                $('#supplierDropdown').append(newOption); // Make sure you have a <select> with id="supplierDropdown"

                // Close the modal
                $('#createSupplierModal').modal('hide');

                // Optionally, clear the input fields
                $('#newSupplierName').val('');
                $('#newSupplierPhone').val('');
            },
            error: function(xhr, status, error) {
                // Handle errors (e.g., displaying an error message)
                console.error("Error adding supplier: ", error);
            }
        });
    });


    $("#purchaseForm").on("submit", function (e) {
        e.preventDefault(); // Prevent the default form submission behavior

        // Assuming you have fields or variables for supplier_id, warehouse_id, and date
        // You can collect their values similar to how you collect values for the other fields
        const formData = {
            _token: $('meta[name="csrf-token"]').attr("content"), // CSRF token for Laravel applications
            supplier_id: $("#supplierDropdown").val(), // Example for supplier ID
            warehouse_id: $("#warehouseSelect").val(), // Warehouse ID
            purchase_date: $("#dateInput").val(), // Sale/Purchase date
            cart: purchaseCart.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                variantId: item.variantId,
                price: item.productPrice,
                // ... add other product details as needed
            })),
        
            discount_type: $("#discountType").val(),
            discount_amount: parseFloat($("#discountAmount").val()) || 0,
            tax_rate: parseFloat($("#taxRate").val()) || 0,
            tax_amount: parseFloat(tax.toFixed(2)) || 0,
            shipping_amount: parseFloat($("#shippingAmount").val()) || 0,
            total_amount: parseFloat(grandTotal.toFixed(2)) || 0,
            // Add any other form fields as needed
        };

        // AJAX request to server
        $.ajax({
            url: createPurchaseUrl, 
            type: 'POST',
            data: formData,
            success: function(response) {
               
                toastr.success('Purchase submitted successfully!');

                // Reset the form and any other UI elements as needed
                $("#purchaseForm")[0].reset();
                purchaseCart = []; // Assuming you want to clear the cart
                updatePurchaseCartTable(); // Update the cart UI
                // Additional success handling...

                location.reload(); // Refresh the page
            },
            error: function(xhr, status, error) {
                // Handle error
                console.error('Error:', error);
                toastr.error('Error occurred while submitting the purchase.');
                // Additional error handling...
            }
        });
    });
});

