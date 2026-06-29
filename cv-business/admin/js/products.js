document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('adminToken');
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  
  if (!token) {
    window.location.href = '/admin/login.html';
    return;
  }

  document.getElementById('userName').textContent = user.name || 'Admin';
  document.getElementById('userRole').textContent = user.role === 'admin' ? 'Administrator' : 'Staff';

  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  
  menuToggle.addEventListener('click', function () {
    sidebar.classList.toggle('open');
  });

  document.getElementById('logoutBtn').addEventListener('click', function () {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login.html';
  });

  loadProducts();

  // Filter listeners
  document.getElementById('searchInput').addEventListener('input', debounce(loadProducts, 300));
  document.getElementById('categoryFilter').addEventListener('change', loadProducts);
  document.getElementById('stockFilter').addEventListener('change', loadProducts);

  // Modal listeners
  document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
  document.getElementById('closeModal').addEventListener('click', closeProductModal);
  document.getElementById('cancelBtn').addEventListener('click', closeProductModal);
  document.getElementById('productModal').addEventListener('click', function(e) {
    if (e.target === this) closeProductModal();
  });
  document.getElementById('saveProductBtn').addEventListener('click', saveProduct);
});

let allProducts = [];

async function loadProducts() {
  try {
    const response = await AdminAPI.getProducts();
    
    if (response.success) {
      allProducts = response.data;
      populateCategories();
      filterAndRenderProducts();
    }
  } catch (error) {
    console.error('Failed to load products:', error);
    showToast('Failed to load products', 'error');
  }
}

function populateCategories() {
  const categories = [...new Set(allProducts.map(p => p.category))];
  const select = document.getElementById('categoryFilter');
  
  select.innerHTML = '<option value="">All Categories</option>';
  categories.forEach(cat => {
    select.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

function filterAndRenderProducts() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const stock = document.getElementById('stockFilter').value;

  let filtered = allProducts.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(search) ||
      (product.description && product.description.toLowerCase().includes(search));
    
    const matchesCategory = !category || product.category === category;
    
    let matchesStock = true;
    if (stock === 'low') {
      matchesStock = product.stock > 0 && product.stock < 10;
    } else if (stock === 'out') {
      matchesStock = product.stock === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  renderProducts(filtered);
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  
  if (products.length === 0) {
    grid.innerHTML = '<div class="loading">No products found</div>';
    return;
  }

  grid.innerHTML = products.map(product => `
    <div class="product-card">
      <div class="product-image">
        ${product.image 
          ? `<img src="${product.image}" alt="${product.name}">`
          : `<div class="product-placeholder"><i class="fas fa-box"></i></div>`
        }
        ${product.stock < 10 && product.stock > 0 
          ? '<span class="stock-badge warning">Low Stock</span>' 
          : product.stock === 0 
            ? '<span class="stock-badge danger">Out of Stock</span>' 
            : ''
        }
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="product-category">${product.category}</p>
        <div class="product-price">
          <span class="selling-price">${formatCurrency(product.sellingPrice)}</span>
          <span class="purchase-price">${formatCurrency(product.purchasePrice)}</span>
        </div>
        <div class="product-stock">
          <i class="fas fa-box"></i>
          <span>${product.stock} in stock</span>
        </div>
        <div class="product-actions">
          <button class="btn-action" onclick="editProduct('${product.id}')" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-action danger" onclick="deleteProduct('${product.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function openProductModal(product = null) {
  const modal = document.getElementById('productModal');
  const title = document.getElementById('productModalTitle');
  const form = document.getElementById('productForm');
  
  form.reset();
  document.getElementById('productId').value = '';
  
  if (product) {
    title.textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('purchasePrice').value = product.purchasePrice;
    document.getElementById('sellingPrice').value = product.sellingPrice;
    document.getElementById('stock').value = product.stock;
    document.getElementById('productDescription').value = product.description || '';
  } else {
    title.textContent = 'Add Product';
  }
  
  modal.classList.add('show');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('show');
}

async function saveProduct() {
  const id = document.getElementById('productId').value;
  const name = document.getElementById('productName').value;
  const category = document.getElementById('productCategory').value;
  const purchasePrice = document.getElementById('purchasePrice').value;
  const sellingPrice = document.getElementById('sellingPrice').value;
  const stock = document.getElementById('stock').value;
  const description = document.getElementById('productDescription').value;
  const imageFile = document.getElementById('productImage').files[0];

  if (!name || !category || !purchasePrice || !sellingPrice || !stock) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  const productData = {
    name,
    category,
    purchasePrice: parseInt(purchasePrice),
    sellingPrice: parseInt(sellingPrice),
    stock: parseInt(stock),
    description,
  };

  try {
    let response;
    if (id) {
      response = await AdminAPI.updateProduct(id, productData, imageFile);
    } else {
      response = await AdminAPI.createProduct(productData, imageFile);
    }

    if (response.success) {
      showToast(id ? 'Product updated successfully' : 'Product created successfully', 'success');
      closeProductModal();
      loadProducts();
    }
  } catch (error) {
    console.error('Failed to save product:', error);
    showToast('Failed to save product', 'error');
  }
}

async function editProduct(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  try {
    const response = await AdminAPI.getProduct(id);
    if (response.success) {
      openProductModal(response.data);
    }
  } catch (error) {
    console.error('Failed to load product:', error);
    showToast('Failed to load product details', 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }

  try {
    const response = await AdminAPI.deleteProduct(id);
    
    if (response.success) {
      showToast('Product deleted successfully', 'success');
      loadProducts();
    }
  } catch (error) {
    console.error('Failed to delete product:', error);
    showToast('Failed to delete product', 'error');
  }
}

function formatCurrency(value) {
  return 'Rp ' + (value || 0).toLocaleString('id-ID');
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
  
  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  toast.className = `toast ${type}`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
