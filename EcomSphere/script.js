document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent the page from reloading

            let product_id = this.getAttribute("data-id");
            let name = this.getAttribute("data-name");
            let price = this.getAttribute("data-price");
            let image = this.getAttribute("data-image");
            let quantity = 1; // Default quantity

            fetch("add_to_cart.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: product_id,
                    name: name,
                    price: price,
                    image: image,
                    quantity: quantity
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Item added to cart!");
                    updateCartUI(); // Update cart dynamically
                } else {
                    alert("Error: " + data.error);
                }
            })
            .catch(error => console.error("Error:", error));
        });
    });

    // Function to update cart UI (show Rs. instead of $)
    function updateCartUI() {
        fetch("fetch_cart.php") // Ensure fetch_cart.php returns updated cart items
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    let cartTable = document.querySelector("#cart-items"); // Ensure you have a <tbody> with this ID
                    cartTable.innerHTML = ""; // Clear existing cart

                    data.cart.forEach(item => {
                        let row = document.createElement("tr");
                        row.innerHTML = `
                            <td><img src="img/products/${item.image}" width="50"></td>
                            <td>${item.name}</td>
                            <td>Rs. ${item.price}</td>
                            <td>
                                <button class="decrease-qty" data-id="${item.id}">-</button>
                                <span>${item.quantity}</span>
                                <button class="increase-qty" data-id="${item.id}">+</button>
                            </td>
                            <td>Rs. ${item.price * item.quantity}</td>
                            <td><button class="remove-item" data-id="${item.id}">Remove</button></td>
                        `;
                        cartTable.appendChild(row);
                    });

                    attachEventListeners(); // Attach event listeners for quantity buttons
                }
            });
    }

    // Function to attach event listeners for quantity update buttons
    function attachEventListeners() {
        document.querySelectorAll(".increase-qty").forEach(button => {
            button.addEventListener("click", function () {
                let cartId = this.getAttribute("data-id");
                updateQuantity(cartId, "increase");
            });
        });

        document.querySelectorAll(".decrease-qty").forEach(button => {
            button.addEventListener("click", function () {
                let cartId = this.getAttribute("data-id");
                updateQuantity(cartId, "decrease");
            });
        });

        document.querySelectorAll(".remove-item").forEach(button => {
            button.addEventListener("click", function () {
                let cartId = this.getAttribute("data-id");
                removeItem(cartId);
            });
        });
    }

    // Function to update cart quantity
    function updateQuantity(cartId, action) {
        fetch("update_cart.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: cartId, action: action })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateCartUI(); // Refresh the cart display
            }
        });
    }

    // Function to remove cart item
    function removeItem(cartId) {
        fetch("remove_from_cart.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: cartId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateCartUI(); // Refresh the cart display
            }
        });
    }

    updateCartUI(); // Load cart on page load
});
