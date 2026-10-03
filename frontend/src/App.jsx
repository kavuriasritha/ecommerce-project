import { useEffect, useState } from "react";
import "./App.css";
import AdminDashboard from "./AdminDashboard";

function App() {
  // ==============================
  // STATES
  // ==============================

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


  // ==============================
  // GET PRODUCTS
  // ==============================

  useEffect(() => {
    fetch("http://127.0.0.1:8000/products")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        console.log("Product error:", error);
      });
  }, []);


  // ==============================
  // CATEGORIES
  // ==============================

  const categories = [
    "All",
    ...new Set(
      products.map((product) => product.category)
    ),
  ];


  // ==============================
  // FILTER PRODUCTS
  // ==============================

  const filteredProducts = products.filter(
    (product) => {
      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        product.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    }
  );


  // ==============================
  // OPEN PRODUCT DETAILS
  // ==============================

  function openProduct(product) {
    setSelectedProduct(product);
    setProductQuantity(1);

    setShowCart(false);
    setShowRegister(false);
    setShowLogin(false);
    setShowAdmin(false);
  }


  // ==============================
  // CLOSE PRODUCT DETAILS
  // ==============================

  function closeProduct() {
    setSelectedProduct(null);
    setProductQuantity(1);
  }


  // ==============================
  // ADD TO CART
  // ==============================

  function addToCart(productId, quantity = 1) {
    if (!loggedInUser) {
      alert("Please login first!");

      setShowLogin(true);
      setShowRegister(false);
      setShowCart(false);
      setShowAdmin(false);
      setSelectedProduct(null);

      return;
    }

    fetch("http://127.0.0.1:8000/cart", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        user_id: loggedInUser.user_id,
        product_id: productId,
        quantity: quantity,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.detail) {
          alert(data.detail);
          return;
        }

        alert("Product added to cart!");

        setSelectedProduct(null);
        setProductQuantity(1);
      })
      .catch((error) => {
        console.log("Cart error:", error);
        alert("Could not add product to cart");
      });
  }


  // ==============================
  // GET CART
  // ==============================

  function getCart() {
    if (!loggedInUser) {
      alert("Please login first!");

      setShowLogin(true);
      setShowRegister(false);
      setShowCart(false);
      setShowAdmin(false);

      return;
    }

    fetch(
      `http://127.0.0.1:8000/cart/${loggedInUser.user_id}`
    )
      .then((response) => response.json())
      .then((data) => {
        setCart(data);

        setShowCart(true);
        setShowRegister(false);
        setShowLogin(false);
        setShowAdmin(false);
        setSelectedProduct(null);
      })
      .catch((error) => {
        console.log("Cart error:", error);
        alert("Could not load cart");
      });
  }


  // ==============================
  // UPDATE CART QUANTITY
  // ==============================

  function updateQuantity(cartId, newQuantity) {
    if (newQuantity < 1) {
      removeFromCart(cartId);
      return;
    }

    fetch(
      `http://127.0.0.1:8000/cart/${cartId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          quantity: newQuantity,
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.detail) {
          alert(data.detail);
          return;
        }

        getCart();
      })
      .catch((error) => {
        console.log("Update cart error:", error);
        alert("Could not update quantity");
      });
  }


  // ==============================
  // REMOVE FROM CART
  // ==============================

  function removeFromCart(cartId) {
    fetch(
      `http://127.0.0.1:8000/cart/${cartId}`,
      {
        method: "DELETE",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.detail) {
          alert(data.detail);
          return;
        }

        alert("Product removed from cart!");

        getCart();
      })
      .catch((error) => {
        console.log("Remove cart error:", error);
        alert("Could not remove product");
      });
  }


  // ==============================
  // PLACE ORDER
  // ==============================

  function placeOrder() {
    if (!loggedInUser) {
      alert("Please login first!");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    fetch(
      `http://127.0.0.1:8000/orders/${loggedInUser.user_id}`,
      {
        method: "POST",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.detail) {
          alert(data.detail);
          return;
        }

        if (data.message === "Cart is empty") {
          alert("Your cart is empty!");
          return;
        }

        alert(
          "Order placed successfully!\n" +
          "Order ID: " +
          data.order_id +
          "\nTotal: ₹" +
          data.total_amount
        );

        setCart([]);
        setShowCart(false);
      })
      .catch((error) => {
        console.log("Order error:", error);
        alert("Could not place order");
      });
  }


  // ==============================
  // REGISTER
  // ==============================

  function registerUser() {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    fetch("http://127.0.0.1:8000/register", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
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
      })
      .catch((error) => {
        console.log("Registration error:", error);
        alert("Could not register user");
      });
  }


  // ==============================
  // LOGIN
  // ==============================

  function loginUser() {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    fetch("http://127.0.0.1:8000/login", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Login response:", data);

        if (data.user_id) {
          alert("Login successful!");

          setLoggedInUser(data);

          setEmail("");
          setPassword("");

          setShowLogin(false);
          setShowRegister(false);
          setShowCart(false);
          setShowAdmin(false);
        } else {
          alert(
            data.message ||
            data.detail ||
            "Login failed"
          );
        }
      })
      .catch((error) => {
        console.log("Login error:", error);
        alert("Could not login");
      });
  }


  // ==============================
  // LOGOUT
  // ==============================

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


  // ==============================
  // OPEN ADMIN
  // ==============================

  function openAdmin() {
    setShowAdmin(true);

    setShowCart(false);
    setShowRegister(false);
    setShowLogin(false);
    setSelectedProduct(null);
  }


  // ==============================
  // CART TOTAL
  // ==============================

  const cartTotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );


  // ==============================
  // MAIN UI
  // ==============================

  return (
    <div className="app">

      {/* ==========================
          NAVBAR
      =========================== */}

      <nav className="navbar">

        <h2>
          🛒 My Store
        </h2>


        <div className="nav-links">

          {/* HOME */}

          <button
            onClick={() => {
              setShowAdmin(false);
              setShowCart(false);
              setShowRegister(false);
              setShowLogin(false);
              setSelectedProduct(null);
            }}
          >
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


      {/* ==========================
          USER MESSAGE
      =========================== */}

      {loggedInUser && (
        <div className="user-message">

          Welcome,{" "}

          {loggedInUser.name ||
            loggedInUser.email ||
            "User"}!

        </div>
      )}


      {/* ==========================
          ADMIN DASHBOARD
      =========================== */}

      {showAdmin && (
        <AdminDashboard />
      )}


      {/* ==========================
          REGISTER
      =========================== */}

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
            onClick={() =>
              setShowRegister(false)
            }
          >
            ← Back
          </button>

        </section>
      )}


      {/* ==========================
          LOGIN
      =========================== */}

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
            onClick={() =>
              setShowLogin(false)
            }
          >
            ← Back
          </button>

        </section>
      )}


      {/* ==========================
          PRODUCT DETAILS
      =========================== */}

      {selectedProduct &&
        !showAdmin && (
          <section className="product-details">

            <button
              className="back-button"
              onClick={closeProduct}
            >
              ← Back to Products
            </button>


            <div className="product-details-card">

              <div className="product-details-image">

                {selectedProduct.category ===
                "Electronics"
                  ? "🎧"
                  : selectedProduct.category ===
                    "Wearables"
                    ? "⌚"
                    : "🛍️"}

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
                  ₹{selectedProduct.price}
                </p>


                <p className="details-stock">

                  {selectedProduct.stock > 0
                    ? `In Stock: ${selectedProduct.stock}`
                    : "Out of Stock"}

                </p>


                {selectedProduct.stock > 0 && (
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
                            selectedProduct.stock,
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
                    selectedProduct.stock === 0
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


      {/* ==========================
          CART
      =========================== */}

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

              {cart.map((item) => (

                <div
                  className="cart-item"
                  key={item.id}
                >

                  <div>

                    <h3>
                      {item.product_name}
                    </h3>


                    <p>
                      Price: ₹{item.price}
                    </p>

                  </div>


                  <div className="quantity-controls">

                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity - 1
                        )
                      }
                    >
                      −
                    </button>


                    <span>
                      {item.quantity}
                    </span>


                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity + 1
                        )
                      }
                    >
                      +
                    </button>

                  </div>


                  <p>

                    Subtotal: ₹
                    {item.price *
                      item.quantity}

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

              ))}


              <div className="cart-total">

                <h2>
                  Total: ₹{cartTotal}
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


      {/* ==========================
          HOME / PRODUCTS
      =========================== */}

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

                      <div
                        className="product-image"
                        onClick={() =>
                          openProduct(product)
                        }
                      >

                        {product.category ===
                        "Electronics"
                          ? "🎧"
                          : product.category ===
                            "Wearables"
                            ? "⌚"
                            : "🛍️"}

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
                        ₹{product.price}
                      </p>


                      <p className="stock">
                        Stock available:{" "}
                        {product.stock}
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


                {filteredProducts.length ===
                  0 && (

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