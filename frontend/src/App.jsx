
import { useEffect, useState } from "react";
import "./App.css";
import AdminDashboard from "./AdminDashboard";

function App() {
  // =====================================================
  // STATES
  // =====================================================

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const [showCart, setShowCart] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);

  const [loggedInUser, setLoggedInUser] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // =====================================================
  // API URL
  // =====================================================

  const API_URL = "http://127.0.0.1:8000";

  // =====================================================
  // PRODUCT IMAGES
  // =====================================================

  function getProductImage(product) {
    const productName = (product?.name || "").toLowerCase();

    if (productName.includes("headphone")) {
      return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80";
    }

    if (productName.includes("mouse")) {
      return "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=600&q=80";
    }

    if (productName.includes("keyboard")) {
      return "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80";
    }

    if (productName.includes("speaker")) {
      return "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80";
    }

    if (productName.includes("watch")) {
      return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";
    }

    if (productName.includes("backpack")) {
      return "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80";
    }

    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";
  }

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  async function loadProducts() {
    try {
      const response = await fetch(`${API_URL}/products`);

      if (!response.ok) {
        throw new Error("Could not load products");
      }

      const data = await response.json();

      console.log("Products:", data);

      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.log("Product error:", error);
    }
  }

  // =====================================================
  // LOAD PRODUCTS WHEN APP STARTS
  // =====================================================

  useEffect(() => {
    loadProducts();
  }, []);

  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories = [
    "All",
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ];

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts = products.filter((product) => {
    const productName =
      product?.name?.toLowerCase() || "";

    const productDescription =
      product?.description?.toLowerCase() || "";

    const search =
      searchTerm.toLowerCase();

    const matchesSearch =
      productName.includes(search) ||
      productDescription.includes(search);

    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // =====================================================
  // OPEN PRODUCT DETAILS
  // =====================================================

  function openProduct(product) {
    setSelectedProduct(product);
    setProductQuantity(1);

    setShowCart(false);
    setShowRegister(false);
    setShowLogin(false);
    setShowAdmin(false);
  }

  // =====================================================
  // CLOSE PRODUCT DETAILS
  // =====================================================

  function closeProduct() {
    setSelectedProduct(null);
    setProductQuantity(1);
  }

  // =====================================================
  // ADD TO CART
  // =====================================================

  async function addToCart(productId, quantity = 1) {
    if (!loggedInUser) {
      alert("Please login first!");

      setShowLogin(true);
      setShowRegister(false);
      setShowCart(false);
      setShowAdmin(false);
      setSelectedProduct(null);

      return;
    }

    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          user_id: loggedInUser.user_id,
          product_id: productId,
          quantity: quantity,
        }),
      });

      const data = await response.json();

      console.log("Add cart response:", data);

      if (!response.ok || data.detail) {
        alert(data.detail || "Could not add product to cart");
        return;
      }

      alert("Product added to cart!");

      setSelectedProduct(null);
      setProductQuantity(1);

    } catch (error) {
      console.log("Cart error:", error);
      alert("Could not add product to cart");
    }
  }

  // =====================================================
  // GET CART
  // =====================================================

  async function getCart() {
    if (!loggedInUser) {
      alert("Please login first!");

      setShowLogin(true);
      setShowRegister(false);
      setShowCart(false);
      setShowAdmin(false);

      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/cart/${loggedInUser.user_id}`
      );

      if (!response.ok) {
        throw new Error("Could not load cart");
      }

      const data = await response.json();

      console.log("Cart:", data);

      if (Array.isArray(data)) {
        setCart(data);
      } else {
        setCart([]);
      }

      setShowCart(true);
      setShowRegister(false);
      setShowLogin(false);
      setShowAdmin(false);
      setSelectedProduct(null);

    } catch (error) {
      console.log("Cart error:", error);
      alert("Could not load cart");
    }
  }

  // =====================================================
  // UPDATE CART QUANTITY
  // =====================================================

  async function updateQuantity(cartId, newQuantity) {
    if (newQuantity < 1) {
      removeFromCart(cartId);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/cart/${cartId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            quantity: newQuantity,
          }),
        }
      );

      const data = await response.json();

      console.log("Update cart response:", data);

      if (!response.ok || data.detail) {
        alert(data.detail || "Could not update quantity");
        return;
      }

      getCart();

    } catch (error) {
      console.log("Update cart error:", error);
      alert("Could not update quantity");
    }
  }

  // =====================================================
  // REMOVE FROM CART
  // =====================================================

  async function removeFromCart(cartId) {
    try {
      const response = await fetch(
        `${API_URL}/cart/${cartId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      console.log("Remove cart response:", data);

      if (!response.ok || data.detail) {
        alert(data.detail || "Could not remove product");
        return;
      }

      alert("Product removed from cart!");

      getCart();

    } catch (error) {
      console.log("Remove cart error:", error);
      alert("Could not remove product");
    }
  }

  // =====================================================
  // PLACE ORDER
  // =====================================================

  async function placeOrder() {
    if (!loggedInUser) {
      alert("Please login first!");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/orders/${loggedInUser.user_id}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      console.log("Order response:", data);

      if (!response.ok || data.detail) {
        alert(data.detail || "Could not place order");
        return;
      }

      if (data.message === "Cart is empty") {
        alert("Your cart is empty!");
        return;
      }

      alert(
        "Order placed successfully!\n\n" +
        "Order ID: " +
        data.order_id +
        "\n" +
        "Total: ₹" +
        Number(data.total_amount || 0).toFixed(2)
      );

      setCart([]);
      setShowCart(false);

    } catch (error) {
      console.log("Order error:", error);
      alert("Could not place order");
    }
  }

  // =====================================================
  // REGISTER
  // =====================================================

  async function registerUser() {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name,
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log("Register response:", data);

      if (!response.ok || data.detail) {
        alert(
          data.detail ||
          data.message ||
          "Registration failed"
        );
        return;
      }

      if (data.user_id) {
        alert("Registration successful!");

        setName("");
        setEmail("");
        setPassword("");

        setShowRegister(false);
        setShowLogin(true);
      } else {
        alert(
          data.message ||
          data.detail ||
          "Registration failed"
        );
      }

    } catch (error) {
      console.log("Registration error:", error);
      alert("Could not register user");
    }
  }

  // =====================================================
  // LOGIN
  // =====================================================

  async function loginUser() {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log("Login response:", data);

      if (!response.ok || data.detail) {
        alert(
          data.detail ||
          data.message ||
          "Login failed"
        );
        return;
      }

      if (data.user_id) {
        alert("Login successful!");

        setLoggedInUser(data);

        setEmail("");
        setPassword("");

        setShowLogin(false);
        setShowRegister(false);
        setShowCart(false);
        setShowAdmin(false);
        setSelectedProduct(null);

      } else {
        alert(
          data.message ||
          data.detail ||
          "Login failed"
        );
      }

    } catch (error) {
      console.log("Login error:", error);
      alert("Could not login");
    }
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  function logoutUser() {
    setLoggedInUser(null);
    setCart([]);

    setShowCart(false);
    setShowLogin(false);
    setShowRegister(false);
    setShowAdmin(false);
    setSelectedProduct(null);

    alert("Logged out successfully!");
  }

  // =====================================================
  // OPEN ADMIN
  // =====================================================

  function openAdmin() {
    setShowAdmin(true);

    setShowCart(false);
    setShowRegister(false);
    setShowLogin(false);
    setSelectedProduct(null);
  }

  // =====================================================
  // GO HOME
  // =====================================================

  function goHome() {
    setShowAdmin(false);
    setShowCart(false);
    setShowRegister(false);
    setShowLogin(false);
    setSelectedProduct(null);
  }

  // =====================================================
  // CART TOTAL
  // =====================================================

  const cartTotal = cart.reduce(
    (total, item) => {
      const price = Number(item?.price || 0);
      const quantity = Number(item?.quantity || 0);

      return total + price * quantity;
    },
    0
  );

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="app">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="navbar">

        <h2>
          🛒 My Store
        </h2>

        <div className="nav-links">

          {/* HOME */}

          <button onClick={goHome}>
            Home
          </button>

          {/* LOGIN */}

          {!loggedInUser && (
            <button
              onClick={() => {
                setShowLogin(true);
                setShowRegister(false);
                setShowCart(false);
                setShowAdmin(false);
                setSelectedProduct(null);
              }}
            >
              Login
            </button>
          )}

          {/* REGISTER */}

          {!loggedInUser && (
            <button
              onClick={() => {
                setShowRegister(true);
                setShowLogin(false);
                setShowCart(false);
                setShowAdmin(false);
                setSelectedProduct(null);
              }}
            >
              Register
            </button>
          )}

          {/* CART */}

          <button onClick={getCart}>
            🛒 Cart
          </button>

          {/* ADMIN */}

          <button onClick={openAdmin}>
            ⚙️ Admin
          </button>

          {/* LOGOUT */}

          {loggedInUser && (
            <button onClick={logoutUser}>
              Logout
            </button>
          )}

        </div>
      </nav>

      {/* =================================================
          USER MESSAGE
      ================================================= */}

      {loggedInUser && (
        <div className="user-message">
          Welcome,{" "}
          {loggedInUser.name ||
            loggedInUser.email ||
            "User"}
          !
        </div>
      )}

      {/* =================================================
          ADMIN DASHBOARD
      ================================================= */}

      {showAdmin && (
        <AdminDashboard />
      )}

      {/* =================================================
          REGISTER
      ================================================= */}

      {showRegister && !showAdmin && (
        <section className="register-section">

          <h1>
            Create Account
          </h1>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            className="register-button"
            onClick={registerUser}
          >
            Create Account
          </button>

          <button
            className="back-button"
            onClick={() => {
              setShowRegister(false);
              setShowLogin(false);
            }}
          >
            ← Back
          </button>

        </section>
      )}

      {/* =================================================
          LOGIN
      ================================================= */}

      {showLogin && !showAdmin && (
        <section className="register-section">

          <h1>
            Login
          </h1>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            className="register-button"
            onClick={loginUser}
          >
            Login
          </button>

          <button
            className="back-button"
            onClick={() => {
              setShowLogin(false);
            }}
          >
            ← Back
          </button>

        </section>
      )}

      {/* =================================================
          PRODUCT DETAILS
      ================================================= */}

      {selectedProduct && !showAdmin && (
        <section className="product-details">

          <button
            className="back-button"
            onClick={closeProduct}
          >
            ← Back to Products
          </button>

          <div className="product-details-card">

            <div className="product-details-image">

              <img
                src={getProductImage(selectedProduct)}
                alt={selectedProduct.name}
              />

            </div>

            <div className="product-details-info">

              <p className="category">
                {selectedProduct.category}
              </p>

              <h1>
                {selectedProduct.name}
              </h1>

              <p className="details-description">
                {selectedProduct.description}
              </p>

              <p className="details-price">
                ₹{Number(selectedProduct.price || 0)}
              </p>

              <p className="details-stock">

                {Number(selectedProduct.stock || 0) > 0
                  ? `In Stock: ${selectedProduct.stock}`
                  : "Out of Stock"}

              </p>

              {Number(selectedProduct.stock || 0) > 0 && (
                <div className="details-quantity">

                  <span>
                    Quantity:
                  </span>

                  <button
                    onClick={() =>
                      setProductQuantity(
                        Math.max(
                          1,
                          productQuantity - 1
                        )
                      )
                    }
                  >
                    −
                  </button>

                  <strong>
                    {productQuantity}
                  </strong>

                  <button
                    onClick={() =>
                      setProductQuantity(
                        Math.min(
                          Number(selectedProduct.stock),
                          productQuantity + 1
                        )
                      )
                    }
                  >
                    +
                  </button>

                </div>
              )}

              <button
                className="details-cart-button"
                disabled={
                  Number(selectedProduct.stock || 0) === 0
                }
                onClick={() =>
                  addToCart(
                    selectedProduct.id,
                    productQuantity
                  )
                }
              >
                🛒 Add to Cart
              </button>

            </div>

          </div>

        </section>
      )}

      {/* =================================================
          CART
      ================================================= */}

      {showCart && !showAdmin && (
        <section className="cart-section">

          <h1>
            🛒 My Cart
          </h1>

          {cart.length === 0 ? (

            <div>

              <p>
                Your cart is empty.
              </p>

              <button
                className="back-button"
                onClick={() =>
                  setShowCart(false)
                }
              >
                ← Continue Shopping
              </button>

            </div>

          ) : (

            <div>

              {cart.map((item) => {

                const price = Number(
                  item?.price || 0
                );

                const quantity = Number(
                  item?.quantity || 0
                );

                const productName =
                  item?.product_name ||
                  item?.name ||
                  "Product";

                return (
                  <div
                    className="cart-item"
                    key={item.id}
                  >

                    <div>

                      <h3>
                        {productName}
                      </h3>

                      <p>
                        Price: ₹{price}
                      </p>

                    </div>

                    <div className="quantity-controls">

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            quantity - 1
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            quantity + 1
                          )
                        }
                      >
                        +
                      </button>

                    </div>

                    <p>
                      Subtotal: ₹
                      {(price * quantity).toFixed(2)}
                    </p>

                    <button
                      className="remove-button"
                      onClick={() =>
                        removeFromCart(item.id)
                      }
                    >
                      🗑️ Remove
                    </button>

                  </div>
                );
              })}

              <div className="cart-total">

                <h2>
                  Total: ₹{cartTotal.toFixed(2)}
                </h2>

                <button
                  className="order-button"
                  onClick={placeOrder}
                >
                  Place Order
                </button>

              </div>

            </div>
          )}

          {cart.length > 0 && (
            <button
              className="back-button"
              onClick={() =>
                setShowCart(false)
              }
            >
              ← Continue Shopping
            </button>
          )}

        </section>
      )}

      {/* =================================================
          HOME / PRODUCTS
      ================================================= */}

      {!showAdmin &&
        !showCart &&
        !showRegister &&
        !showLogin &&
        !selectedProduct && (

          <>

            {/* HERO */}

            <section className="hero">

              <h1>
                Welcome to My E-Commerce Store
              </h1>

              <p>
                Shop your favorite products
                at the best prices.
              </p>

            </section>

            {/* PRODUCTS */}

            <section className="products-section">

              <h2>
                Our Products
              </h2>

              <p>
                Total Products: {products.length}
              </p>

              {/* SEARCH + FILTER */}

              <div className="shop-controls">

                <input
                  type="text"
                  placeholder="🔍 Search products..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                />

                <select
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(
                      e.target.value
                    )
                  }
                >

                  {categories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* PRODUCT GRID */}

              <div className="product-grid">

                {filteredProducts.map(
                  (product) => (

                    <div
                      className="product-card"
                      key={product.id}
                    >

                      {/* PRODUCT IMAGE */}

                      <div
                        className="product-image"
                        onClick={() =>
                          openProduct(product)
                        }
                      >

                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                        />

                      </div>

                      <p className="category">
                        {product.category}
                      </p>

                      <h3>
                        {product.name}
                      </h3>

                      <p className="description">
                        {product.description}
                      </p>

                      <p className="price">
                        ₹{Number(product.price || 0)}
                      </p>

                      <p className="stock">

                        {Number(product.stock || 0) > 0
                          ? `Stock available: ${product.stock}`
                          : "Out of Stock"}

                      </p>

                      <button
                        className="cart-button"
                        onClick={() =>
                          openProduct(product)
                        }
                      >
                        View Product
                      </button>

                    </div>

                  )
                )}

                {filteredProducts.length === 0 && (
                  <p className="no-products">
                    No products found.
                  </p>
                )}

              </div>

            </section>

          </>
        )}

    </div>
  );
}

export default App;

