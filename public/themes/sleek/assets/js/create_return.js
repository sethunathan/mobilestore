// Function to calculate the discount
function calculateDiscount(discountType, discountAmount) {
    if (discountType === "fixed") {
        return discountAmount;
    } else if (discountType === "percent") {
        // Ensure discountAmount is less than or equal to 90 for 'percent' type
        if (discountAmount > 90) {
            throw new Error(
                "Discount amount cannot exceed 90 for percent type."
            );
        }

        return (discountAmount / 100) * totalWithoutTaxAndShipping;
    }
    return 0;
}

function calculateTax(taxRate) {
    if (taxRate === 0 || isNaN(taxRate)) {
        return 0;
    }
    return (taxRate / 100) * (totalWithoutTaxAndShipping - calculateDiscount());
}

// Function to update grand total
function updateGrandTotal() {
    const taxRateElement = document.getElementById("taxRate");
    const shippingAmountElement = document.getElementById("shippingAmount");
    const discountTypeElement = document.getElementById("discountType");
    const discountAmountElement = document.getElementById("discountAmount");

    // Ensure discountAmount and discountType have valid values, else default to 0 and 'fixed'
    const discountType =
        discountTypeElement && discountTypeElement.value
            ? discountTypeElement.value
            : "fixed";
    const discountAmount =
        discountAmountElement && discountAmountElement.value
            ? parseFloat(discountAmountElement.value) || 0
            : 0;
    const taxRate =
        taxRateElement && taxRateElement.value
            ? parseFloat(taxRateElement.value) || 0
            : 0;
    const shippingAmount = parseFloat(shippingAmountElement.value) || 0;

    const discount = calculateDiscount(discountType, discountAmount);
    tax = calculateTax(taxRate);

    // Calculate grandTotal
    grandTotal =
        totalWithoutTaxAndShipping - discount + tax + shippingAmount;

    // Update the display for discount, tax, and grand total
    const displayDiscountElement = document.getElementById("display_discount");
    const displayTaxElement = document.getElementById("display_tax");
    const grandTotalElement = document.getElementById("grandTotal");
    const displayShippingElement = document.getElementById("display_shipping");

    // Update display for shipping
    if (displayShippingElement) {
        const displayShippingValue = isNaN(shippingAmount) ? 0 : shippingAmount;
        displayShippingElement.textContent = `₹ ${displayShippingValue.toFixed(
            2
        )}`;
    }

    if (displayDiscountElement)
        displayDiscountElement.textContent = `₹ ${(+discount).toFixed(2)} (${
            discountType === "percent" ? discountAmount + "%" : "Fixed"
        })`;
    if (displayTaxElement)
        displayTaxElement.textContent = `₹ ${(+tax).toFixed(2)} (${taxRate}%)`;
    if (grandTotalElement)
        grandTotalElement.textContent = `₹ ${(+grandTotal).toFixed(2)}`;
}



function incrementQuantity(productIdentifier) {
    const productIndex = cart.findIndex(
        (item) => item.productIdentifier === productIdentifier
    );
    if (productIndex !== -1) {
        const productInCart = cart[productIndex];
        const potentialNewQuantity = productInCart.quantity + 1;

        if (potentialNewQuantity > productInCart.availableQuantity) {
            toastr.error("Return quantity cannot be greater than  Items current quantity ");
            return;
        }

        // Correctly call updateProductQuantity with the newQuantity
        updateProductQuantity(productIdentifier, 0, potentialNewQuantity);
    }
}


function decrementQuantity(productIdentifier) {
    const productIndex = cart.findIndex((item) => item.productIdentifier === productIdentifier);
    if (productIndex !== -1) {
        // Calculate the new potential quantity by subtracting one
        const potentialNewQuantity = Math.max(0, cart[productIndex].quantity - 1); // Ensures it doesn't go below 0

        // Update the quantity directly
        updateProductQuantity(productIdentifier, 0, potentialNewQuantity);
    }
}


function updateQuantity(productIdentifier, newQuantity) {
    newQuantity = parseInt(newQuantity, 10);
    const productIndex = cart.findIndex(
        (item) => item.productIdentifier === productIdentifier
    );

    if (productIndex !== -1 && !isNaN(newQuantity) && newQuantity > 0) {
        const productInCart = cart[productIndex];
       
        // Check if the new quantity exceeds available stock
        if (newQuantity > productInCart.availableQuantity) {
            toastr.error("Return quantity cannot be greater than  items Current quantity.");
            return;
        }
        cart[productIndex].quantity = newQuantity;
        cart[productIndex].subtotal = (
            newQuantity * productInCart.productPrice
        ).toFixed(2);
        updateCartTable();
    }
}

function updateProductQuantity(
    productIdentifier,
    change = 0,
    newQuantity = 0
) {
    const productIndex = cart.findIndex(
        (item) => item.productIdentifier === productIdentifier
    );
    if (productIndex !== -1) {
        if (newQuantity !== null) {
            cart[productIndex].quantity = newQuantity;
        } else {
            cart[productIndex].quantity += change;
        }
        //cart[productIndex].quantity = Math.max(1, cart[productIndex].quantity); // Ensure quantity doesn't go below 1
        cart[productIndex].subtotal = (
            cart[productIndex].quantity * cart[productIndex].productPrice
        ).toFixed(2);
        updateCartTable(); // Re-render the cart table UI
    }
}


function debounce(func, timeout = 1200) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}



// Function to update cart table in UI
function updateCartTable() {
    const tableBody = document.querySelector(".my-table tbody");

    // Clear existing table rows
    tableBody.innerHTML = "";

    // Reset totalWithoutTaxAndShipping before recalculating
    totalWithoutTaxAndShipping = 0;

    // If cart is empty, show 'No data available'
    if (cart.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9">No data Available</td></tr>';
        updateGrandTotal();
        return;
    }

    // Add each cart item as a row in the table
    cart.forEach((item) => {
        const row = document.createElement("tr");

        // Product Name
        const nameCell = document.createElement("td");
        nameCell.textContent = item.productName;
        row.appendChild(nameCell);

        // Price Input
        const priceText = document.createElement("span");
        priceText.classList.add( "price-text"); // You can adjust the classes as needed
        priceText.textContent = item.productPrice; 
        

        const priceCell = document.createElement("td");
        priceCell.appendChild(priceText);
        row.appendChild(priceCell);

        // Quantity Input with Debounce
        const quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.classList.add("form-control", "input-sm");
        quantityInput.value = item.quantity;
        quantityInput.addEventListener(
            "input",
            debounce((event) => {
                updateQuantity(item.productIdentifier, event.target.value);
            })
        );

        const decrementButton = document.createElement("button");
        decrementButton.innerHTML =
            '<span class="mdi mdi-24px mdi-minus-circle-outline"></span>';
        decrementButton.style.color = "#8a909d";
        decrementButton.type = "button";
        decrementButton.addEventListener("click", () => {
            decrementQuantity(item.productIdentifier);
        });

        const incrementButton = document.createElement("button");
        incrementButton.innerHTML =
            '<span class="mdi mdi-24px mdi-plus-circle-outline"></span>';
        incrementButton.style.color = "#8a909d";
        incrementButton.type = "button";
        incrementButton.addEventListener("click", () => {
            incrementQuantity(item.productIdentifier);
        });

        const quantityInputGroup = document.createElement("div");
        quantityInputGroup.classList.add("input-group");
        quantityInputGroup.appendChild(decrementButton);
        quantityInputGroup.appendChild(quantityInput);
        quantityInputGroup.appendChild(incrementButton);

        const quantityCell = document.createElement("td");
        quantityCell.appendChild(quantityInputGroup);
        row.appendChild(quantityCell);

       

        // Subtotal
        const subtotalCell = document.createElement("td");
        subtotalCell.textContent = item.subtotal;
        row.appendChild(subtotalCell);

        // Add subtotal to totalWithoutTaxAndShipping
        const itemSubtotalNumber = parseFloat(item.subtotal);
        if (!isNaN(itemSubtotalNumber)) {
            totalWithoutTaxAndShipping += itemSubtotalNumber;
        } else {
            console.error('Invalid subtotal for item', item.productIdentifier, ':', item.subtotal);
        }

       

        // Append the row to the table body
        tableBody.appendChild(row);
    });

    // Update the grand total after cart is updated
    updateGrandTotal();
}

// Call this function on page load to show the current cart
document.addEventListener("DOMContentLoaded", function () {
    

    updateCartTable();

    document
        .getElementById("discountType")
        ?.addEventListener("change", updateGrandTotal);
    document
        .getElementById("discountAmount")
        ?.addEventListener("input", updateGrandTotal);
    document
        .getElementById("taxRate")
        ?.addEventListener("input", updateGrandTotal);
    document
        .getElementById("shippingAmount")
        ?.addEventListener("input", updateGrandTotal);
});



$(document).ready(function () {
    $("#saleForm").on("submit", function (e) {
        e.preventDefault();

        // Prepare form data
        const formData = {
            _token: $('meta[name="csrf-token"]').attr("content"),
            return_date: $('input[name="inv_datetime"]').val(),
            return_cart: cart.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                variantId: item.variantId,
                price: item.productPrice,
                // ... add other product details as needed
            })),
            discount_type: $("#discountType").val(),
            discount: parseFloat($("#discountAmount").val()) || 0,
            tax_rate: parseFloat($("#taxRate").val()) || 0,
            tax_amount: parseFloat(tax.toFixed(2)) || 0,
            shipping_amount: parseFloat($("#shippingAmount").val()) || 0,
            total_amount: parseFloat(grandTotal.toFixed(2)) || 0,
        };
        
   

        // Post data to the server
          $.ajax({
            url: SaleReturnUrl,
            type: "POST",
            data: formData,
            success: function (response) {
                // Show toastr success message
                toastr.success(response.message);
                window.location.href = SaleslistPage
               // location.reload(); // Refresh the page
            },
            error: function (xhr, status, error) {
               // console.error(error);
                toastr.error("Error occurred while creating the sales return.");
                // Handle error, show error messages
            },
        });  
    });


    $("#editsalesReturnForm").on("submit", function (e) {
        e.preventDefault();

        // Prepare form data
        const formData = {
            _token: $('meta[name="csrf-token"]').attr("content"),
            salesreturn_id: salesReturnId,
            return_date: $('input[name="inv_datetime"]').val(),
            return_cart: cart.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                variantId: item.variantId,
                price: item.productPrice,
                // ... add other product details as needed
            })),
            discount_type: $("#discountType").val(),
            discount: parseFloat($("#discountAmount").val()) || 0,
            tax_rate: parseFloat($("#taxRate").val()) || 0,
            tax_amount: parseFloat(tax.toFixed(2)) || 0,
            shipping_amount: parseFloat($("#shippingAmount").val()) || 0,
            total_amount: parseFloat(grandTotal.toFixed(2)) || 0,
        };
        
   

        // Post data to the server
          $.ajax({
            url: editSaleReturnUrl,
            type: "POST",
            data: formData,
            success: function (response) {
                // Show toastr success message
                toastr.success(response.message);
                window.location.href = SaleslistPage
               // location.reload(); // Refresh the page
            },
            error: function (xhr, status, error) {
               // console.error(error);
                toastr.error("Error occurred while Editing the sales return.");
                // Handle error, show error messages
            },
        });  
    });



    $("#purchaseForm").on("submit", function (e) {
        e.preventDefault();

        // Prepare form data
        const formData = {
            _token: $('meta[name="csrf-token"]').attr("content"),
            return_date: $('input[name="inv_datetime"]').val(),
            return_cart: cart.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                variantId: item.variantId,
                price: item.productPrice,
                // ... add other product details as needed
            })),
            discount_type: $("#discountType").val(),
            discount: parseFloat($("#discountAmount").val()) || 0,
            tax_rate: parseFloat($("#taxRate").val()) || 0,
            tax_amount: parseFloat(tax.toFixed(2)) || 0,
            shipping_amount: parseFloat($("#shippingAmount").val()) || 0,
            total_amount: parseFloat(grandTotal.toFixed(2)) || 0,
        };
        
   

        // Post data to the server
          $.ajax({
            url: PurchaseReturnUrl,
            type: "POST",
            data: formData,
            success: function (response) {
                // Show toastr success message
                toastr.success(response.message);
                window.location.href = PurchaseslistPage
               // location.reload(); // Refresh the page
            },
            error: function (xhr, status, error) {
                console.error(error);
                toastr.error("Error occurred while creating the purchase return.");
                // Handle error, show error messages
            },
        });  
    });


    $("#editpurchaseReturnForm").on("submit", function (e) {
        e.preventDefault();

        // Prepare form data
        const formData = {
            _token: $('meta[name="csrf-token"]').attr("content"),
            purchase_return_id: purchaseReturnId,
            return_date: $('input[name="inv_datetime"]').val(),
            return_cart: cart.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                variantId: item.variantId,
                price: item.productPrice,
                // ... add other product details as needed
            })),
            discount_type: $("#discountType").val(),
            discount: parseFloat($("#discountAmount").val()) || 0,
            tax_rate: parseFloat($("#taxRate").val()) || 0,
            tax_amount: parseFloat(tax.toFixed(2)) || 0,
            shipping_amount: parseFloat($("#shippingAmount").val()) || 0,
            total_amount: parseFloat(grandTotal.toFixed(2)) || 0,
        };
        
   

        // Post data to the server
          $.ajax({
            url: updatePurchaseReturnUrl,
            type: "POST",
            data: formData,
            success: function (response) {
                // Show toastr success message
                toastr.success(response.message);
                window.location.href = PurchaseslistPage
               // location.reload(); // Refresh the page
            },
            error: function (xhr, status, error) {
                console.error(error);
                toastr.error("Error occurred while creating the purchase return.");
                // Handle error, show error messages
            },
        });  
    });


    
});
