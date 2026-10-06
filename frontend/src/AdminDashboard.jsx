import { useEffect, useState } from "react";

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Electronics");

  const API = "http://127.0.0.1:8000";


  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  function loadProducts() {
    fetch(`${API}/products`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Products:", data);

        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      })
      .catch((error) => {
        console.log("Product error:", error);
      });
  }


  // =====================================================
  // LOAD ORDERS
  // =====================================================

  function loadOrders() {
    fetch(`${API}/admin/orders`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Orders:", data);

        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }
      })
      .catch((error) => {
        console.log("Order error:", error);
      });
  }


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);


  // =====================================================
  // CLEAR PRODUCT FORM
  // =====================================================

  function clearForm() {
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setCategory("Electronics");
    setEditingProduct(null);
  }


  // =====================================================
  // ADD PRODUCT
  // =====================================================

  function addProduct() {
    if (!name || !description || !price || !stock) {
      alert("Please fill all fields");
      return;
    }

    fetch(`${API}/products`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name: name,
        description: description,
        price: Number(price),
        stock: Number(stock),
        category: category,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Added product:", data);

        if (data.detail) {
          alert(data.detail);
          return;
        }

        alert("Product added successfully!");

        clearForm();
        setShowAddForm(false);

        loadProducts();
      })
      .catch((error) => {
        console.log("Add product error:", error);
        alert("Could not add product");
      });
  }


  // =====================================================
  // START EDIT
  // =====================================================

  function startEdit(product) {
    setEditingProduct(product);

    setName(product.name || "");
    setDescription(product.description || "");
    setPrice(product.price || "");
    setStock(product.stock || "");
    setCategory(product.category || "Electronics");

    setShowAddForm(true);
  }


  // =====================================================
  // UPDATE PRODUCT
  // =====================================================

  function updateProduct() {
    if (!name || !description || !price || !stock) {
      alert("Please fill all fields");
      return;
    }

    if (!editingProduct) {
      alert("No product selected");
      return;
    }

    fetch(`${API}/products/${editingProduct.id}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name: name,
        description: description,
        price: Number(price),
        stock: Number(stock),
        category: category,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Updated product:", data);

        if (data.detail) {
          alert(data.detail);
          return;
        }

        alert("Product updated successfully!");

        clearForm();
        setShowAddForm(false);

        loadProducts();
      })
      .catch((error) => {
        console.log("Update error:", error);
        alert("Could not update product");
      });
  }


  // =====================================================
  // DELETE PRODUCT
  // =====================================================

  function deleteProduct(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
      return;
    }

    fetch(`${API}/products/${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Delete response:", data);

        if (data.detail) {
          alert(data.detail);
          return;
        }

        alert("Product deleted successfully!");

        loadProducts();
      })
      .catch((error) => {
        console.log("Delete error:", error);
        alert("Could not delete product");
      });
  }


  // =====================================================
  // VIEW ORDER DETAILS
  // =====================================================

  function viewOrderDetails(orderId) {
    fetch(`${API}/order-details/${orderId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Order details:", data);

        if (data.message) {
          alert(data.message);
          return;
        }

        setSelectedOrder(orderId);
        setOrderDetails(data);
      })
      .catch((error) => {
        console.log("Order details error:", error);
        alert("Could not load order details");
      });
  }


  // =====================================================
  // CLOSE ORDER DETAILS
  // =====================================================

  function closeOrderDetails() {
    setSelectedOrder(null);
    setOrderDetails(null);
  }


  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  function updateOrderStatus(orderId, newStatus) {
    fetch(`${API}/admin/orders/${orderId}/status`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        status: newStatus,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Status response:", data);

        if (data.message === "Invalid order status") {
          alert("Invalid order status");
          return;
        }

        if (data.message === "Order not found") {
          alert("Order not found");
          return;
        }

        alert("Order status updated successfully!");

        loadOrders();

        if (selectedOrder === orderId) {
          viewOrderDetails(orderId);
        }
      })
      .catch((error) => {
        console.log("Status update error:", error);
        alert("Could not update order status");
      });
  }


  // =====================================================
  // CANCEL FORM
  // =====================================================

  function cancelForm() {
    clearForm();
    setShowAddForm(false);
  }


  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      style={{
        padding: "30px",
        margin: "30px auto",
        maxWidth: "1100px",
        backgroundColor: "#ffffff",
        borderRadius: "15px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          gap: "20px",
        }}
      >

        <div>
          <h1 style={{ margin: 0 }}>
            Admin Dashboard
          </h1>

          <p>
            Manage your products and orders
          </p>
        </div>

        <button
          onClick={() => {
            clearForm();
            setShowAddForm(true);
          }}
          style={{
            padding: "12px 20px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          + Add Product
        </button>

      </div>


      {/* =================================================
          ADD / EDIT PRODUCT
      ================================================= */}

      {showAddForm && (
        <div
          style={{
            padding: "25px",
            marginBottom: "30px",
            backgroundColor: "#f3f4f6",
            borderRadius: "10px",
          }}
        >

          <h2>
            {editingProduct
              ? "✏️ Edit Product"
              : "➕ Add New Product"}
          </h2>

          <input
            type="text"
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              boxSizing: "border-box",
            }}
          />

          <textarea
            placeholder="Product description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              boxSizing: "border-box",
              minHeight: "80px",
            }}
          />

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              boxSizing: "border-box",
            }}
          />

          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              boxSizing: "border-box",
            }}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
              boxSizing: "border-box",
            }}
          >

            <option value="Electronics">
              Electronics
            </option>

            <option value="Wearables">
              Wearables
            </option>

            <option value="Accessories">
              Accessories
            </option>

            <option value="Home">
              Home
            </option>

            <option value="Fashion">
              Fashion
            </option>

          </select>

          <button
            onClick={
              editingProduct
                ? updateProduct
                : addProduct
            }
            style={{
              padding: "10px 20px",
              backgroundColor: "green",
              color: "white",
              border: "none",
              borderRadius: "6px",
              marginRight: "10px",
              cursor: "pointer",
            }}
          >
            {editingProduct
              ? "Update Product"
              : "Add Product"}
          </button>

          <button
            onClick={cancelForm}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              border: "none",
              borderRadius: "6px",
            }}
          >
            Cancel
          </button>

        </div>
      )}


      {/* =================================================
          PRODUCTS
      ================================================= */}

      <div style={{ marginBottom: "40px" }}>

        <h2>
          📦 Products
        </h2>

        <p>
          Total Products: {products.length}
        </p>

        {products.length === 0 ? (

          <p>
            No products found.
          </p>

        ) : (

          products.map((product) => (

            <div
              key={product.id}
              style={{
                border: "1px solid #ddd",
                padding: "20px",
                marginBottom: "15px",
                borderRadius: "10px",
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >

                <div>

                  <h3>
                    {product.name}
                  </h3>

                  <p>
                    {product.description}
                  </p>

                  <p>
                    Category: {product.category}
                  </p>

                  <p>
                    Price: ₹{product.price}
                  </p>

                  <p>
                    Stock: {product.stock}
                  </p>

                </div>

                <div>

                  <button
                    onClick={() => startEdit(product)}
                    style={{
                      padding: "8px 15px",
                      backgroundColor: "#2563eb",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      marginRight: "10px",
                    }}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() => deleteProduct(product.id)}
                    style={{
                      padding: "8px 15px",
                      backgroundColor: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    🗑️ Delete
                  </button>

                </div>

              </div>

            </div>

          ))

        )}

      </div>


      {/* =================================================
          ORDERS
      ================================================= */}

      <div>

        <h2>
          🛍️ Orders
        </h2>

        <p>
          Total Orders: {orders.length}
        </p>

        {orders.length === 0 ? (

          <p>
            No orders found.
          </p>

        ) : (

          orders.map((order) => (

            <div
              key={order.id}
              style={{
                border: "1px solid #ddd",
                padding: "20px",
                marginBottom: "15px",
                borderRadius: "10px",
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >

                <div>

                  <h3>
                    🧾 Order #{order.id}
                  </h3>

                  <p>
                    User ID: {order.user_id}
                  </p>

                  <p>
                    Total Amount: ₹{order.total_amount}
                  </p>

                  <p>
                    Status: <strong>{order.status}</strong>
                  </p>

                </div>


                <div>

                  <button
                    onClick={() =>
                      viewOrderDetails(order.id)
                    }
                    style={{
                      padding: "9px 15px",
                      backgroundColor: "#2563eb",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      marginRight: "10px",
                    }}
                  >
                    👁️ View Details
                  </button>


                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus(
                        order.id,
                        e.target.value
                      )
                    }
                    style={{
                      padding: "9px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                    }}
                  >

                    <option value="Placed">
                      Placed
                    </option>

                    <option value="Processing">
                      Processing
                    </option>

                    <option value="Shipped">
                      Shipped
                    </option>

                    <option value="Delivered">
                      Delivered
                    </option>

                  </select>

                </div>

              </div>

            </div>

          ))

        )}

      </div>


      {/* =================================================
          ORDER DETAILS
      ================================================= */}

      {orderDetails && (

        <div
          style={{
            marginTop: "30px",
            padding: "25px",
            backgroundColor: "#f8fafc",
            borderRadius: "12px",
            border: "1px solid #ddd",
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >

            <h2>
              🧾 Order Details
            </h2>

            <button
              onClick={closeOrderDetails}
              style={{
                padding: "8px 15px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              ✕ Close
            </button>

          </div>


          <p>
            <strong>Order ID:</strong>{" "}
            {orderDetails.order_id}
          </p>

          <p>
            <strong>User ID:</strong>{" "}
            {orderDetails.user_id}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {orderDetails.status}
          </p>

          <p>
            <strong>Total:</strong>{" "}
            ₹{orderDetails.total_amount}
          </p>


          <h3>
            Products in this order
          </h3>


          {orderDetails.items &&
          orderDetails.items.length > 0 ? (

            orderDetails.items.map((item, index) => (

              <div
                key={index}
                style={{
                  padding: "15px",
                  marginBottom: "10px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              >

                <p>
                  <strong>
                    {item.product_name}
                  </strong>
                </p>

                <p>
                  Product ID: {item.product_id}
                </p>

                <p>
                  Quantity: {item.quantity}
                </p>

                <p>
                  Price: ₹{item.price}
                </p>

                <p>
                  Subtotal: ₹{item.subtotal}
                </p>

              </div>

            ))

          ) : (

            <p>
              No products found in this order.
            </p>

          )}

        </div>

      )}

    </div>
  );
}

export default AdminDashboard;