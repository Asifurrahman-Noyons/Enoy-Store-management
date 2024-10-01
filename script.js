
showSection('home');
// Global Variables
let totalPurchase = 0;
let totalSelling = 0;
let totalProfit = 0;
let totalQuantitySold = 0;
let totalStockPurchase = 0;
let totalStockProfit = 0;
let currentStockValue = 0;
let currentStockProfit = 0;
let products = [];
let salesHistory = []; // New variable for sales history

// Load data from local storage on page load
window.onload = function() {
    loadFromLocalStorage();
};

// Function to load data from local storage
function loadFromLocalStorage() {
    totalPurchase = parseFloat(localStorage.getItem('totalPurchase')) || 0;
    totalSelling = parseFloat(localStorage.getItem('totalSelling')) || 0;
    totalProfit = parseFloat(localStorage.getItem('totalProfit')) || 0;
    totalQuantitySold = parseInt(localStorage.getItem('totalQuantitySold')) || 0;
    totalStockPurchase = parseFloat(localStorage.getItem('totalStockPurchase')) || 0;
    totalStockProfit = parseFloat(localStorage.getItem('totalStockProfit')) || 0;
    currentStockValue = parseFloat(localStorage.getItem('currentStockValue')) || 0;
    currentStockProfit = parseFloat(localStorage.getItem('currentStockProfit')) || 0;
    products = JSON.parse(localStorage.getItem('products')) || [];
    salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || []; // Load sales history

    products.forEach(createProductCard);
    salesHistory.forEach(addToSalesHistory); // Load sales history into the table
    updateStockMetrics();
}

// Function to save data to local storage
function saveToLocalStorage() {
    localStorage.setItem('totalPurchase', totalPurchase);
    localStorage.setItem('totalSelling', totalSelling);
    localStorage.setItem('totalProfit', totalProfit);
    localStorage.setItem('totalQuantitySold', totalQuantitySold);
    localStorage.setItem('totalStockPurchase', totalStockPurchase);
    localStorage.setItem('totalStockProfit', totalStockProfit);
    localStorage.setItem('currentStockValue', currentStockValue);
    localStorage.setItem('currentStockProfit', currentStockProfit);
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory)); // Save sales history
}

// Add Product Form Submission
document.getElementById('productForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const productName = document.getElementById('productName').value;
    const productImage = document.getElementById('productImage').files[0];
    const productPurchasePrice = parseFloat(document.getElementById('productPurchasePrice').value);
    const productSellingPrice = parseFloat(document.getElementById('productSellingPrice').value);
    const productQuantity = parseInt(document.getElementById('productQuantity').value);

    const product = {
        name: productName,
        image: URL.createObjectURL(productImage),
        purchasePrice: productPurchasePrice,
        sellingPrice: productSellingPrice,
        quantity: productQuantity,
        soldQuantity: 0
    };

    products.push(product);
    createProductCard(product);

    totalStockPurchase += productPurchasePrice * productQuantity;
    totalStockProfit += (productSellingPrice - productPurchasePrice) * productQuantity;
    currentStockValue += productPurchasePrice * productQuantity;
    currentStockProfit += (productSellingPrice - productPurchasePrice) * productQuantity;

    updateStockMetrics();
    saveToLocalStorage();

    document.getElementById('productForm').reset();
});

// Function to create a product card
function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card p-4 bg-white rounded-lg shadow-md';

    productCard.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="w-full h-32 rounded mb-2">
        <h3 class="font-bold">${product.name}</h3>
        <p>Purchase Price: $${product.purchasePrice.toFixed(2)}</p>
        <p>Selling Price: $${product.sellingPrice.toFixed(2)}</p>
        <p>Quantity: <span class="product-quantity">${product.quantity}</span></p>
        <input type="number" min="0" placeholder="Enter Quantity" class="w-full quantity-input p-1 border rounded" />
        <div class="button-group mt-2">
            <button class="bg-green-500 text-white p-2 rounded sell-button mr-2">Sell</button>
            <button class="bg-blue-500 text-white p-2 rounded update-button">Update</button>
        </div>
    `;

    document.getElementById('productCards').appendChild(productCard);

    const quantityElement = productCard.querySelector('.product-quantity');
    const quantityInput = productCard.querySelector('.quantity-input');

    productCard.querySelector('.sell-button').addEventListener('click', function () {
        const inputQuantity = parseInt(quantityInput.value);
        let currentQuantity = parseInt(quantityElement.innerText);

        if (inputQuantity > 0 && currentQuantity >= inputQuantity) {
            quantityElement.innerText = currentQuantity - inputQuantity;

            totalQuantitySold += inputQuantity;
            totalSelling += product.sellingPrice * inputQuantity;
            totalPurchase += product.purchasePrice * inputQuantity;
            totalProfit += (product.sellingPrice - product.purchasePrice) * inputQuantity;

            product.soldQuantity += inputQuantity;

            currentStockValue -= product.purchasePrice * inputQuantity;
            currentStockProfit -= (product.sellingPrice - product.purchasePrice) * inputQuantity;

            // Update product quantity in the products array
            product.quantity -= inputQuantity;

            if (currentQuantity - inputQuantity === 0) {
                productCard.remove();
            }

            updateStockMetrics();
            saveToLocalStorage();
            quantityInput.value = '';
            updateSalesHistory(product, inputQuantity); // Update sales history
        } else {
            alert('Invalid quantity or insufficient stock.');
        }
    });

    productCard.querySelector('.update-button').addEventListener('click', function () {
        const inputQuantity = parseInt(quantityInput.value);
        let currentQuantity = parseInt(quantityElement.innerText);

        if (inputQuantity > 0) {
            quantityElement.innerText = currentQuantity + inputQuantity;
            product.quantity += inputQuantity; // Update quantity in products array

            currentStockValue += product.purchasePrice * inputQuantity;
            currentStockProfit += (product.sellingPrice - product.purchasePrice) * inputQuantity;

            totalStockPurchase += product.purchasePrice * inputQuantity;
            totalStockProfit += (product.sellingPrice - product.purchasePrice) * inputQuantity;

            updateStockMetrics();
            saveToLocalStorage();
            quantityInput.value = '';
        }
    });
}

// Function to update sales history
function updateSalesHistory(product, quantitySold) {
    const profit = (product.sellingPrice - product.purchasePrice) * quantitySold;
    const saleEntry = {
        name: product.name,
        quantity: quantitySold,
        total: product.sellingPrice * quantitySold,
        profit: profit,
        date: new Date().toLocaleString()
    };

    salesHistory.push(saleEntry); // Add to sales history array
    addToSalesHistory(saleEntry); // Add to the sales history table
    saveToLocalStorage(); // Save updated sales history to local storage
}

// Function to add a sale entry to the sales history table
function addToSalesHistory(saleEntry) {
    const salesHistoryBody = document.getElementById('salesHistoryBody');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td class="py-2 px-4 border">${saleEntry.name}</td>
        <td class="py-2 px-4 border">${saleEntry.quantity}</td>
        <td class="py-2 px-4 border">$${saleEntry.total.toFixed(2)}</td>
        <td class="py-2 px-4 border">$${saleEntry.profit.toFixed(2)}</td>
        <td class="py-2 px-4 border">${saleEntry.date}</td>
    `;

    salesHistoryBody.appendChild(newRow);
}

// Function to update stock metrics on the dashboard
function updateStockMetrics() {
    document.getElementById('totalPurchase').innerText = totalPurchase.toFixed(2);
    document.getElementById('totalSelling').innerText = totalSelling.toFixed(2);
    document.getElementById('totalProfit').innerText = totalProfit.toFixed(2);
    document.getElementById('totalQuantitySold').innerText = totalQuantitySold;
    document.getElementById('totalStockPurchase').innerText = totalStockPurchase.toFixed(2);
    document.getElementById('totalStockProfit').innerText = totalStockProfit.toFixed(2);
    document.getElementById('currentStockValue').innerText = currentStockValue.toFixed(2);
    document.getElementById('currentStockProfit').innerText = currentStockProfit.toFixed(2);
}

// Function to show selected section and hide others
function showSection(sectionId) {
    const sections = ['home', 'dashboard', 'addProduct', 'salesHistory'];
    sections.forEach(section => {
        const sectionElement = document.getElementById(section);
        sectionElement.classList.remove('visible');
        sectionElement.classList.add('hidden');
    });
    const selectedSection = document.getElementById(sectionId);
    selectedSection.classList.remove('hidden');
    selectedSection.classList.add('visible');
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.classList.remove('active');
    });
    const activeNavItem = Array.from(navItems).find(item => item.querySelector('span').innerText.toLowerCase() === sectionId);
    
    if (activeNavItem) {
      activeNavItem.classList.add('active');
    }
    }
    
    // Reset Button Event Listener
    document.getElementById('resetButton').addEventListener('click', function() {
      const enteredPassword = prompt('Please enter the reset password:'); // Prompt for password
      const requiredPassword = "admin123"; // Change this to your desired password
    
      if (enteredPassword === requiredPassword) {
        // Reset global variables
        totalPurchase = 0;
        totalSelling = 0;
        totalProfit = 0;
        totalQuantitySold = 0;
        totalStockPurchase = 0;
        totalStockProfit = 0;
        currentStockValue = 0;
        currentStockProfit = 0;
        products = [];
        salesHistory = []; // Reset sales history
    
        // Clear local storage
        localStorage.clear();
    
        // Clear product cards from the UI
        document.getElementById('productCards').innerHTML = '';
        document.getElementById('salesHistoryBody').innerHTML = ''; // Clear sales history
    
        // Update stock metrics on the dashboard
        updateStockMetrics();
    
        alert('All data has been reset successfully.');
      } else {
        alert('Incorrect password. Please try again.');
      }
    });
    
    // Logout Function
    function logout() {
      localStorage.removeItem('username');
      localStorage.removeItem('password');
      window.location.href = 'index.html'; // Redirect to login page
    }
    
    
    
    
    
    // Add Event Listener for Search Input
    document.getElementById('searchInput').addEventListener('input', function() {
      const query = this.value.toLowerCase();
      filterProducts(query);
    });
    
    // Function to filter products based on search query
    function filterProducts(query) {
      const productCards = document.getElementById('productCards').children;
      for (let i = 0; i < productCards.length; i++) {
        const productName = productCards[i].querySelector('h3').innerText.toLowerCase();
        if (productName.includes(query)) {
          productCards[i].style.display = 'block'; // Show product if it matches the query
        } else {
          productCards[i].style.display = 'none'; // Hide product if it does not match
        }
      }
    }
