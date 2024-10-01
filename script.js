// Initial setup to show home section
showSection('home');

// Global Variables
let totalPurchase = 0;
let totalSelling = 0;
let totalProfit = 0;
let totalQuantitySold = 0;
let totalStockPurchase = 0;
let totalStockProfit = 0;

// To keep track of the current stock value and profit
let currentStockValue = 0;
let currentStockProfit = 0;

// Array to hold product data
let products = [];

// Add Product Form Submission
document.getElementById('productForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const productName = document.getElementById('productName').value;
    const productImage = document.getElementById('productImage').files[0];
    const productPurchasePrice = parseFloat(document.getElementById('productPurchasePrice').value);
    const productSellingPrice = parseFloat(document.getElementById('productSellingPrice').value);
    const productQuantity = parseInt(document.getElementById('productQuantity').value);

    // Create Product Object
    const product = {
        name: productName,
        image: URL.createObjectURL(productImage),
        purchasePrice: productPurchasePrice,
        sellingPrice: productSellingPrice,
        quantity: productQuantity,
        soldQuantity: 0 // Track quantity sold for each product
    };

    // Add Product to Array
    products.push(product);

    // Create Product Card
    createProductCard(product);

    // Update Dashboard Metrics
    totalStockPurchase += productPurchasePrice * productQuantity;
    totalStockProfit += (productSellingPrice - productPurchasePrice) * productQuantity;
    currentStockValue += productPurchasePrice * productQuantity; // Update current stock value
    currentStockProfit += (productSellingPrice - productPurchasePrice) * productQuantity; // Update current stock profit

    updateStockMetrics();

    // Clear the form fields
    document.getElementById('productForm').reset();
});

// Function to create a product card
function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card p-4 bg-white rounded-lg shadow-md';

    productCard.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="w-full h-32  rounded mb-2">
        <h3 class="font-bold">${product.name}</h3>
        <p>Purchase Price: $${product.purchasePrice.toFixed(2)}</p>
        <p>Selling Price: $${product.sellingPrice.toFixed(2)}</p>
        <p>Quantity: <span class="product-quantity">${product.quantity}</span></p>
        
        <input type="number" min="0" placeholder="Enter Quantity" class="quantity-input p-1 border rounded"/>
        <div class="button-group mt-2">
            <button class="bg-green-500 text-white p-2 rounded sell-button mr-2">Sell</button>
            <button class="bg-blue-500 text-white p-2 rounded update-button">Update</button>
        </div>
    `;

    
    document.getElementById('productCards').appendChild(productCard);

    const quantityElement = productCard.querySelector('.product-quantity');
    const quantityInput = productCard.querySelector('.quantity-input');

    // Sell Button Event Listener
    productCard.querySelector('.sell-button').addEventListener('click', function () {
        const inputQuantity = parseInt(quantityInput.value);
        let currentQuantity = parseInt(quantityElement.innerText);

        if (inputQuantity > 0 && currentQuantity >= inputQuantity) {
            // Selling stock
            quantityElement.innerText = currentQuantity - inputQuantity;

            // Update totals
            totalQuantitySold += inputQuantity;
            totalSelling += product.sellingPrice * inputQuantity;
            totalPurchase += product.purchasePrice * inputQuantity;
            totalProfit += (product.sellingPrice - product.purchasePrice) * inputQuantity;

            // Update the sold quantity in the product object
            product.soldQuantity += inputQuantity;

            // Update current stock value and profit
            currentStockValue -= product.purchasePrice * inputQuantity; // Subtract the purchase price of the sold item
            currentStockProfit -= (product.sellingPrice - product.purchasePrice) * inputQuantity; // Subtract profit from sold item

            // Update sales history
            updateSalesHistory(product, inputQuantity);

            // If quantity reaches zero, remove the product card
            if (currentQuantity - inputQuantity === 0) {
                productCard.remove();
            }

            // Update metrics on the dashboard
            updateStockMetrics();

            // Clear the input field after selling
            quantityInput.value = '';
        } else {
            alert('Invalid quantity or insufficient stock.');
        }
    });

    // Update Button Event Listener
    productCard.querySelector('.update-button').addEventListener('click', function () {
        const inputQuantity = parseInt(quantityInput.value);
        let currentQuantity = parseInt(quantityElement.innerText);

        if (inputQuantity > 0) {
            // Adding stock
            quantityElement.innerText = currentQuantity + inputQuantity;

            // Update stock value and profit based on the added quantity (newly added stock)
            currentStockValue += product.purchasePrice * inputQuantity;
            currentStockProfit += (product.sellingPrice - product.purchasePrice) * inputQuantity;

            // Update totals for the entire stock
            totalStockPurchase += product.purchasePrice * inputQuantity;
            totalStockProfit += (product.sellingPrice - product.purchasePrice) * inputQuantity;

            // Update metrics on the dashboard
            updateStockMetrics();

            // Clear the input field after updating
            quantityInput.value = '';
        } else {
            alert('Please enter a valid quantity.');
        }
    });
}

// Function to update sales history
function updateSalesHistory(product, soldQuantity) {
    const salesHistoryBody = document.getElementById('salesHistoryBody');

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td class="py-2 px-4 border">${product.name}</td>
        <td class="py-2 px-4 border">${soldQuantity}</td>
        <td class="py-2 px-4 border">$${(product.sellingPrice * soldQuantity).toFixed(2)}</td>
        <td class="py-2 px-4 border">$${((product.sellingPrice - product.purchasePrice) * soldQuantity).toFixed(2)}</td>
        <td class="py-2 px-4 border">${new Date().toLocaleString()}</td>
    `;

    salesHistoryBody.appendChild(newRow);
}

// Reset Data
document.getElementById('resetButton').addEventListener('click', function () {
    const password = prompt("Please enter the reset password:");
    if (password === "yourpassword") { // Replace "yourpassword" with your actual password
        // Reset all variables
        totalPurchase = 0;
        totalSelling = 0;
        totalProfit = 0;
        totalQuantitySold = 0;
        totalStockPurchase = 0;
        totalStockProfit = 0;
        products = []; // Reset the product array
        currentStockValue = 0; // Reset current stock value
        currentStockProfit = 0; // Reset current stock profit

        // Clear product cards and sales history
        document.getElementById('productCards').innerHTML = '';
        document.getElementById('salesHistoryBody').innerHTML = '';

        updateStockMetrics();
        alert("All data has been reset.");
    } else {
        alert("Incorrect password.");
    }
});

// Update Dashboard Metrics
function updateStockMetrics() {
    document.getElementById('totalPurchase').innerText = totalPurchase.toFixed(2);
    document.getElementById('totalSelling').innerText = totalSelling.toFixed(2);
    document.getElementById('totalProfit').innerText = totalProfit.toFixed(2);
    document.getElementById('totalQuantitySold').innerText = totalQuantitySold;
    document.getElementById('totalStockPurchase').innerText = totalStockPurchase.toFixed(2);
    document.getElementById('totalStockProfit').innerText = totalStockProfit.toFixed(2);

    // Update the new metrics
    document.getElementById('currentStockValue').innerText = currentStockValue.toFixed(2);
    document.getElementById('currentStockProfit').innerText = currentStockProfit.toFixed(2);
}








// Function to show selected section and hide others
function showSection(sectionId) {
    const sections = ['home', 'dashboard', 'addProduct', 'salesHistory'];
    sections.forEach(section => {
        const sectionElement = document.getElementById(section);
        sectionElement.classList.remove('visible'); // Remove visible class
        sectionElement.classList.add('hidden'); // Hide all sections
    });
    const selectedSection = document.getElementById(sectionId);
    selectedSection.classList.remove('hidden'); // Show the selected section
    selectedSection.classList.add('visible'); // Add visible class

    // Set active state for navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active'); // Remove active state from all
    });
    const activeNavItem = Array.from(navItems).find(item => item.querySelector('span').innerText.toLowerCase() === sectionId);
    if (activeNavItem) {
        activeNavItem.classList.add('active'); // Add active state to selected item
    }
}





function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    window.location.href = 'index.html'; // Redirect to login page
}
