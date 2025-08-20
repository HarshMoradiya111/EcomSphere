document.addEventListener("DOMContentLoaded", function () {
    fetchCartItems();

    function fetchCartItems() {
        fetch("fetch_cart.php") // Fetch cart data from PHP script
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayCartItems(data.cart);
                    updateCartTotal(); // ✅ Update subtotal after fetching cart items
                } else {
                    document.getElementById("cart-items").innerHTML = "<tr><td colspan='6'>Cart is empty</td></tr>";
                    document.getElementById("cart-subtotal").innerText = "Rs. 0.00";
                    document.getElementById("cart-total").innerText = "Rs. 0.00";
                }
            })
            .catch(error => console.error("Error fetching cart data:", error));
    }

    function displayCartItems(cart) {
        const cartTable = document.getElementById("cart-items");
        cartTable.innerHTML = ""; // Clear existing content

        cart.forEach(item => {
            let row = `
                <tr>
                    <td><button class="remove-item" data-id="${item.id}">Remove</button></td>
                    <td><img src="img/products/${item.image}" width="50" onerror="this.src='img/placeholder.jpg'"></td>
                    <td>${item.name}</td>
                    <td>Rs.${parseFloat(item.price).toFixed(2)}</td>
                    <td>
                        <button class="decrease-qty" data-id="${item.product_id}">−</button>
                        <span class="item-quantity" data-id="${item.product_id}">${item.quantity}</span>
                        <button class="increase-qty" data-id="${item.product_id}">+</button>
                    </td>
                    <td class="cart-subtotal" data-price="${item.price}" data-quantity="${item.quantity}">
                        Rs.${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </td>
                </tr>
            `;
            cartTable.innerHTML += row;
        });

        attachEventListeners();
        updateCartTotal(); // ✅ Ensure total updates after displaying cart
    }

    function attachEventListeners() {
        document.querySelectorAll(".increase-qty, .decrease-qty").forEach(button => {
            button.addEventListener("click", function () {
                const productId = this.dataset.id;
                const action = this.classList.contains("increase-qty") ? "increase" : "decrease";
                updateCartQuantity(productId, action);
            });
        });

        document.querySelectorAll(".remove-item").forEach(button => {
            button.addEventListener("click", function () {
                const cartId = this.dataset.id;
                removeCartItem(cartId);
            });
        });
    }

    function updateCartQuantity(productId, action) {
        fetch("update_cart.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id: productId, action: action })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchCartItems(); // ✅ Reload cart and recalculate totals
            } else {
                alert("Failed to update cart");
            }
        });
    }

    function removeCartItem(cartId) {
        fetch("remove_from_cart.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cart_id: cartId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchCartItems(); // ✅ Reload cart and recalculate totals
            } else {
                alert("Failed to remove item");
            }
        });
    }

    function updateCartTotal() {
        let subtotal = 0;

        document.querySelectorAll(".cart-subtotal").forEach(item => {
            let price = parseFloat(item.dataset.price);
            let quantity = parseInt(item.dataset.quantity);
            let itemTotal = price * quantity;
            
            subtotal += itemTotal;
            item.innerText = "Rs. " + itemTotal.toFixed(2);
        });

        document.getElementById("cart-subtotal").innerText = "Rs. " + subtotal.toFixed(2);
        document.getElementById("cart-total").innerText = "Rs. " + subtotal.toFixed(2);
    }
});
