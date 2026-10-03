
import { useEffect, useState } from "react";

function AdminDashboard() {
  // =========================
  // STATES
  // =========================

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Electronics");


  // =========================
  // LOAD PRODUCTS
  // =========================

  function loadProducts() {
    fetch("http://127.0.0.1:8000/products")
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


  // =========================
  // LOAD ORDERS
  // =========================

  function loadOrders() {
    fetch("http://127.0.0.1:8000/admin/orders")
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


  // =========================
  // LOAD DATA WHEN PAGE OPENS
  // =========================

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);


  // =========================
  // CLEAR FORM
  // =========================

  function clearForm() {
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setCategory("Electronics");
    setEditingProduct(null);
  }


  // =========================
  // ADD PRODUCT
  // =========================

  function addProduct() {
    if (!name || !description || !price || !stock) {
      alert("Please fill all fields");
      return;
    }

    fetch("http://127.0.0.1:8000/products", {
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


  // =========================
  // START EDIT
  // =========================

  function startEdit(product) {
    setEditingProduct(product);

    setName(product.name || "");
    setDescription(product.description || "");
    setPrice(product.price || "");
    setStock(product.stock || "");
    setCategory(product.category || "Electronics");

    setShowAddForm(true);
  }


  // =========================
  // UPDATE PRODUCT
  // =========================

  function updateProduct() {
    if (!name || !description || !price || !stock) {
      alert("Please fill all fields");
      return;
    }

    if (!editingProduct) {
      alert("No product selected");
      return;
    }

    fetch(
      `http://127.0.0.1:8000/products/${editingProduct.id}`,
      {
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
      }
    )
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


  // =========================
  // DELETE PRODUCT
  // =========================

  function deleteProduct(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
      return;
    }

    fetch(
      `http://127.0.0.1:8000/products/${id}`,
      {
        method: "DELETE",
      }
    )
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


  // =========================
  // CANCEL FORM
  // =========================

  function cancelForm() {
    clearForm();
    setShowAddForm(false);
  }


  // =========================
  // UI
  // =========================

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

      {/* =========================
          HEADER
      ========================= */}

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


      {/* =========================
          ADD / EDIT FORM
      ========================= */}

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


          {/* NAME */}

          <input
            type="text"
            placeholder="Product name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              boxSizing: "border-box",
            }}
          />


          {/* DESCRIPTION */}

          <textarea
            placeholder="Product description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              boxSizing: "border-box",
              minHeight: "80px",
            }}
          />


          {/* PRICE */}

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value)
            }
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              boxSizing: "border-box",
            }}
          />


          {/* STOCK */}

          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) =>
              setStock(e.target.value)
            }
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              boxSizing: "border-box",
            }}
          />


          {/* CATEGORY */}

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
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


          {/* FORM BUTTONS */}

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


      {/* =========================
          PRODUCTS SECTION
      ========================= */}

      <div
        style={{
          marginBottom: "40px",
        }}
      >

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
                    Category:{" "}
                    {product.category}
                  </p>

                  <p>
                    Price: ₹{product.price}
                  </p>

                  <p>
                    Stock: {product.stock}
                  </p>

                </div>


                <div>

                  {/* EDIT */}

                  <button
                    onClick={() =>
                      startEdit(product)
                    }
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


                  {/* DELETE */}

                  <button
                    onClick={() =>
                      deleteProduct(product.id)
                    }
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


      {/* =========================
          ORDERS SECTION
      ========================= */}

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
                    Total Amount: ₹
                    {order.total_amount}
                  </p>

                  <p>
                    Status: {order.status}
                  </p>

                </div>


                <div
                  style={{
                    padding: "8px 15px",
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    borderRadius: "20px",
                    fontWeight: "bold",
                  }}
                >
                  {order.status}
                </div>

              </div>

            </div>

          ))

        )}

      </div>

    </div>
  );
}

export default AdminDashboard;

