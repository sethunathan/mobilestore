// Function to calculate the discount
function calculateDiscount(discountType, discountAmount) {
    if (discountType === "fixed") {
        return discountAmount;
    } else if (discountType === "percent") {
        // Ensure discountAmount is less than or equal to 90 for 'percent' type
        if (discountAmount > 90) {
            toastr.error("Discount amount cannot exceed 90 for percent type.");
        }

        return (discountAmount / 100) * totalWithoutTaxAndShipping;
    }
    return 0;
}

function calculateTax(taxRate) {
   
    // Check if taxRate is 0 or not a number
    if (taxRate === 0 || isNaN(taxRate)) {
        return 0;
    }

    // Validate the taxRate does not exceed 90
    if (taxRate > 90) {
        toastr.error("taxRate cannot exceed 90 for percent type.");
        return 0; // Return 0 or any other appropriate value when taxRate is invalid
    }

    return (taxRate / 100) * (totalWithoutTaxAndShipping - calculateDiscount(document.getElementById("discountType").value, parseFloat(document.getElementById("discountAmount").value) || 0));

    
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

function updatePrice(productIdentifier, newPrice) {
    newPrice = parseFloat(newPrice);
    const productIndex = cart.findIndex(
        (item) => item.productIdentifier === productIdentifier
    );
    if (productIndex !== -1 && !isNaN(newPrice) && newPrice > 1) {
        cart[productIndex].productPrice = newPrice;
        cart[productIndex].subtotal = (cart[productIndex].quantity * newPrice).toFixed(2);
        updateCartTable();
    }
}

function incrementQuantity(productIdentifier) {
    const productIndex = cart.findIndex(
        (item) => item.productIdentifier === productIdentifier
    );
    if (productIndex !== -1) {
        const productInCart = cart[productIndex];
        const potentialNewQuantity = productInCart.quantity + 1;

        if (
            stocksModuleEnabled &&
            productInCart.stock !== null &&
            potentialNewQuantity > productInCart.stock
        ) {
            toastr.error("Cannot add more. Not enough stock.");
            return;
        }

        updateProductQuantity(productIdentifier, 1);
    }
}

function decrementQuantity(productIdentifier) {
    updateProductQuantity(productIdentifier, -1);
}

function updateQuantity(productIdentifier, newQuantity) {
    newQuantity = parseInt(newQuantity, 10);
    const productIndex = cart.findIndex(
        (item) => item.productIdentifier === productIdentifier
    );

    if (productIndex !== -1 && !isNaN(newQuantity) && newQuantity > 0) {
        const productInCart = cart[productIndex];

        // Check if the stocks module is enabled and if stock information is available
        if (stocksModuleEnabled && productInCart.stock !== null) {
            // Check if the new quantity exceeds available stock
            if (newQuantity > productInCart.stock) {
                toastr.error("Cannot update quantity. Not enough stock.");
                return;
            }
        }
        let subtotal=newQuantity * productInCart.productPrice;
        cart[productIndex].quantity = newQuantity;
        cart[productIndex].subtotal = subtotal.toFixed(2);
        updateCartTable();
    }
}

function updateProductQuantity(
    productIdentifier,
    change = 0,
    newQuantity = null
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
        cart[productIndex].quantity = Math.max(1, cart[productIndex].quantity); // Ensure quantity doesn't go below 1
        cart[productIndex].subtotal =
            (cart[productIndex].quantity * cart[productIndex].productPrice).toFixed(2) ;
        updateCartTable(); // Re-render the cart table UI
    }
}

function removeFromCart(productIdentifier) {
    cart = cart.filter((item) => item.productIdentifier !== productIdentifier);
    updateCartTable();
}

function debounce(func, timeout = 800) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

function addToCart(product) {

    
    // Create a unique identifier that considers both product ID and variant ID
    const productIdentifier = product.variant_id ? `${product.id}-${product.variant_id}` : `${product.id}`;

    const existingProductIndex = cart.findIndex(
        (item) => item.productIdentifier === productIdentifier
    );

    if (warehousesModuleEnabled) {
    // disable the warehouseSelect dropdown so can manage item stock
    document.getElementById('warehouseSelect').disabled = true;
    }

    
    document.getElementById('search-box').value = '';

    // If the stocks module is enabled and the stock is less than one, display an error message.
    if (stocksModuleEnabled && (product.stock < 1 || product.stock === null)) {
        toastr.error(
            "Cannot add to cart, product is out of stock or stock data is unavailable."
        );
        return;
    }

    if (existingProductIndex !== -1) {
        // Product exists, increase quantity if stock permits or if stock module is not enabled
        const potentialNewQuantity = cart[existingProductIndex].quantity + 1;
        if (
            !stocksModuleEnabled ||
            (stocksModuleEnabled && product.stock >= potentialNewQuantity)
        ) {
            cart[existingProductIndex].quantity = potentialNewQuantity;
            cart[existingProductIndex].subtotal =
                cart[existingProductIndex].quantity *
                cart[existingProductIndex].productPrice;
        } else {
            toastr.error("Cannot add more. Not enough stock.");
            return;
        }
    } else {
        // New product, add to cart if stock permits or if stock module is not enabled
        if (
            !stocksModuleEnabled ||
            (stocksModuleEnabled && product.stock >= 1)
        ) {
            const newCartItem = {
                productId: product.id,
                productIdentifier: productIdentifier,
                productName: product.name,
                productPrice: parseFloat(product.price),
                quantity: 1,
                subtotal: parseFloat(product.price),
                stock: stocksModuleEnabled ? parseInt(product.stock, 10) : null,
                variantId: product.variant_id,
            };
            cart.push(newCartItem);
        } else {
            toastr.error("Cannot add to cart, product is out of stock !");
            return;
        }
    }
    updateCartTable();
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
        const priceInput = document.createElement("input");
        priceInput.type = "text";
        priceInput.classList.add("form-control", "input-sm", "price-input");
        priceInput.value = item.productPrice;
        priceInput.addEventListener(
            "input",
            debounce((event) => {
                updatePrice(item.productIdentifier, event.target.value);
            })
        );

        const priceCell = document.createElement("td");
        priceCell.appendChild(priceInput);
        row.appendChild(priceCell);

        // Quantity Input with Debounce
        const quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.classList.add("form-control", "input-sm");
        quantityInput.value = item.quantity;
        quantityInput.min = 1;
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

        // Stock Cell (only if stocksModuleEnabled is true)
        if (stocksModuleEnabled) {
            const stockCell = document.createElement("td");
            stockCell.textContent = item.stock !== null ? item.stock : "N/A";
            row.appendChild(stockCell);
        }

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

        // Remove Button
        const removeButton = document.createElement("button");
        removeButton.classList.add("btn", "btn-sm", "btn-danger");
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", () => {
            removeFromCart(item.productIdentifier);
        });

        const actionCell = document.createElement("td");
        actionCell.appendChild(removeButton);
        row.appendChild(actionCell);

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




document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search-box");

    // Define the search logic as a separate function
    const handleSearchInput = (e) => {
        const query = e.target.value;
        if (warehousesModuleEnabled) {
            var warehouseId = document.getElementById("warehouseSelect").value;
        }

        if (query.length < 2) {
            return;
        }

        // Check if warehousesModuleEnabled and warehouseId is not selected
        if (warehousesModuleEnabled && !warehouseId) {
            toastr.error("Please select a warehouse before searching.");
            return;
        }

        let url = `/search-products?query=${encodeURIComponent(query)}`;

        if (stocksModuleEnabled && warehouseId) {
            url += `&warehouse_id=${encodeURIComponent(warehouseId)}`;
        }

        fetch(url)
            .then((response) => response.json())
            .then((products) => {
                displaySearchResults(products);
            })
            .catch((error) => console.error("Error:", error));
    };

    // Create a debounced version of the search logic function
    const debouncedSearch = debounce(handleSearchInput, 800);

    // Attach the debounced function to the input event
    searchInput.addEventListener("input", debouncedSearch);
});



function displaySearchResults(products) {
    const searchResultsDiv = document.getElementById("searchResults");
    searchResultsDiv.innerHTML = "";
    const ul = document.createElement("ul");
    ul.classList.add("list-group");

    products.forEach((product) => {
        const li = document.createElement("li");
        li.classList.add("list-group-item");
        let productText = product.name + " - " + product.price;
        if (stocksModuleEnabled && product.current_stock !== undefined) {
            productText += " - Stock: " + product.current_stock;
        }
        li.textContent = productText;
        li.setAttribute("data-product-id", product.id);
        li.setAttribute("data-product-name", product.name);
        li.setAttribute("data-product-price", product.price);
        li.setAttribute("data-variant-id", product.variant_id || "");
         // Enable tab index for each list item
        li.setAttribute("tabIndex", 1);

        if (stocksModuleEnabled) {
            li.setAttribute("data-product-stock", product.current_stock);
        }

         // Event handler to add product to cart
         const handleAddToCart = () => {
            const productToAdd = {
                id: li.getAttribute("data-product-id"),
                name: li.getAttribute("data-product-name"),
                price: li.getAttribute("data-product-price"),
                variant_id: li.getAttribute("data-variant-id"),
                stock: stocksModuleEnabled
                    ? li.getAttribute("data-product-stock")
                    : null,
            };

            addToCart(productToAdd);
            searchResultsDiv.innerHTML = "";
        };
        
        // Click event
        li.addEventListener("click", handleAddToCart);

        // Keydown event for the Enter key
        li.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.keyCode === 13) {
                handleAddToCart();
            }
        });

        
        ul.appendChild(li);
    });
    searchResultsDiv.appendChild(ul);
}

$(document).ready(function() {
    $(document).on('keydown', '#search-box', function(e) {
        // Check if Tab or Page Down was pressed
        if (e.keyCode === 9 || e.keyCode === 34) {

            console.log('key pressed');
            e.preventDefault(); // Prevent the default tab behavior
            // Navigate through the search results
            navigateResults(e.keyCode);
        }
    });

    function navigateResults(keyCode) {
        const currentFocus = $(".list-group-item:focus");
        if (keyCode === 9) { // Tab key
            if (currentFocus.length === 0) {
                console.log('tab');
                $(".list-group-item").first().focus();
            } else {
                currentFocus.next().focus();
            }
        } else if (keyCode === 34) { // Page Down key
            // Implement as needed, e.g., jump multiple items or to the end
            currentFocus.nextAll().eq(4).focus(); // Example: Jump 5 items down
        }
    }
});


$(document).ready(function () {
    $("#stocktransferForm").on("submit", function (e) {
        e.preventDefault();

        // Prepare form data
        const formData = {
            _token: $('meta[name="csrf-token"]').attr("content"),
            warehouseto_id: $("#warehouseTo").val(),
            warehouse_id: $("#warehouseSelect").val(),
            transfer_date: $('input[name="inv_datetime"]').val(),
            cart: cart.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                variantId: item.variantId,
                productPrice: item.productPrice,
                // ... add other product details as needed
            })),
            discount_type: $("#discountType").val(),
            discount: parseFloat($("#discountAmount").val()) || 0,
            tax_rate: parseFloat($("#taxRate").val()) || 0,
            tax_amount: parseFloat(tax.toFixed(2)) || 0,
            shipping_amount: parseFloat($("#shippingAmount").val()) || 0,
            total_amount: parseFloat(grandTotal.toFixed(2)) || 0,
        };

         // Check if the warehouse IDs are the same
         if (formData.warehouseto_id === formData.warehouse_id) {
            toastr.warning('The source and destination warehouses cannot be the same.');
            return; // Stop further execution or form submission
        }


        // Post data to the server
        $.ajax({
            url: StockTransferURL,
            type: "POST",
            data: formData,
            success: function (response) {

                // Show toastr success message
                toastr.success("Stock Transfered  successfully!");

                // Clear cart array
                cart = [];

                // Reset form fields or other related variables
                $("#warehouseTo").val("");
                $("#warehouseSelect").val("");
                $('input[name="inv_datetime"]').val("");
                $("#discountType").val("");
                $("#discountAmount").val("");
                $("#taxRate").val("");
                $("#shippingAmount").val("");
                $("#grandTotal").text("0.00");

                // Optionally, you can refresh the page or redirect the user
                location.reload(); // Refresh the page
            },
            error: function (xhr, status, error) {
                console.error("Error:", error);
                toastr.error("Error occurred while creating the Transfer.");
                // Handle error, show error messages
            },
        });
    });



   
});
