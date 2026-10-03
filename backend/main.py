from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models
import product_models
import cart_models
import order_models
from schemas import UserCreate, UserLogin, ProductCreate, ProductUpdate, CartItemCreate, CartUpdate
import bcrypt
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)


# Database connection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Home API
@app.get("/")
def home():
    return {
        "message": "Welcome to My E-Commerce Website"
    }


# User Registration
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    # Check whether email already exists
    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing_user:
        return {
            "message": "Email already registered"
        }

    # Hash password
    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    # Create new user
    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_password
    )

    # Save user to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id
    }


# User Login
@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    # Find user using email
    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    # User doesn't exist
    if not existing_user:
        return {
            "message": "Invalid email or password"
        }

    # Check password
    password_correct = bcrypt.checkpw(
        user.password.encode("utf-8"),
        existing_user.password.encode("utf-8")
    )

    # Wrong password
    if not password_correct:
        return {
            "message": "Invalid email or password"
        }

    # Successful login
    return {
        "message": "Login successful",
        "user_id": existing_user.id,
        "name": existing_user.name
    }
# Add Product
@app.post("/products")
def add_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    new_product = product_models.Product(
        name=product.name,
        description=product.description,
        price=product.price,
        stock=product.stock,
        category=product.category
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return {
        "message": "Product added successfully",
        "product_id": new_product.id
    }
# Get All Products
@app.get("/products")
def get_products(db: Session = Depends(get_db)):

    products = db.query(product_models.Product).all()

    return products
# Get One Product
@app.get("/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):

    product = db.query(product_models.Product).filter(
        product_models.Product.id == product_id
    ).first()

    if not product:
        return {
            "message": "Product not found"
        }

    return product
# Update Product
@app.put("/products/{product_id}")
def update_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db)
):

    existing_product = db.query(product_models.Product).filter(
        product_models.Product.id == product_id
    ).first()

    if not existing_product:
        return {
            "message": "Product not found"
        }

    existing_product.name = product.name
    existing_product.description = product.description
    existing_product.price = product.price
    existing_product.stock = product.stock
    existing_product.category = product.category

    db.commit()
    db.refresh(existing_product)

    return {
        "message": "Product updated successfully",
        "product": existing_product
    }
# Delete Product
@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    existing_product = db.query(product_models.Product).filter(
        product_models.Product.id == product_id
    ).first()

    if not existing_product:
        return {
            "message": "Product not found"
        }

    db.delete(existing_product)
    db.commit()

    return {
        "message": "Product deleted successfully"
    }
# Add Product to Cart
@app.post("/cart")
def add_to_cart(
    cart_item: CartItemCreate,
    db: Session = Depends(get_db)
):

    # Check if product exists
    product = db.query(product_models.Product).filter(
        product_models.Product.id == cart_item.product_id
    ).first()

    if not product:
        return {
            "message": "Product not found"
        }

    # Check if enough stock is available
    if cart_item.quantity > product.stock:
        return {
            "message": "Not enough stock available"
        }

    # Check if this product is already in the user's cart
    existing_item = db.query(cart_models.CartItem).filter(
        cart_models.CartItem.user_id == cart_item.user_id,
        cart_models.CartItem.product_id == cart_item.product_id
    ).first()

    if existing_item:

        existing_item.quantity += cart_item.quantity

        db.commit()
        db.refresh(existing_item)

        return {
            "message": "Cart quantity updated",
            "cart_id": existing_item.id,
            "quantity": existing_item.quantity
        }

    # Create a new cart item
    new_cart_item = cart_models.CartItem(
        user_id=cart_item.user_id,
        product_id=cart_item.product_id,
        quantity=cart_item.quantity
    )

    db.add(new_cart_item)
    db.commit()
    db.refresh(new_cart_item)

    return {
        "message": "Product added to cart",
        "cart_id": new_cart_item.id
    }
# View User Cart
@app.get("/cart/{user_id}")
def get_cart(
    user_id: int,
    db: Session = Depends(get_db)
):

    cart_items = db.query(cart_models.CartItem).filter(
        cart_models.CartItem.user_id == user_id
    ).all()

    return cart_items
# Update Cart Quantity
@app.put("/cart/{cart_id}")
def update_cart(
    cart_id: int,
    cart_update: CartUpdate,
    db: Session = Depends(get_db)
):

    cart_item = db.query(cart_models.CartItem).filter(
        cart_models.CartItem.id == cart_id
    ).first()

    if not cart_item:
        return {
            "message": "Cart item not found"
        }

    if cart_update.quantity <= 0:
        return {
            "message": "Quantity must be greater than 0"
        }

    cart_item.quantity = cart_update.quantity

    db.commit()
    db.refresh(cart_item)

    return {
        "message": "Cart quantity updated successfully",
        "cart_id": cart_item.id,
        "quantity": cart_item.quantity

    }
# Remove Item from Cart
@app.delete("/cart/{cart_id}")
def remove_from_cart(
    cart_id: int,
    db: Session = Depends(get_db)
):

    cart_item = db.query(cart_models.CartItem).filter(
        cart_models.CartItem.id == cart_id
    ).first()

    if not cart_item:
        return {
            "message": "Cart item not found"
        }

    db.delete(cart_item)
    db.commit()

    return {
        "message": "Product removed from cart successfully"
    }
# Place Order
@app.post("/orders/{user_id}")
def place_order(
    user_id: int,
    db: Session = Depends(get_db)
):

    # Get user's cart
    cart_items = db.query(cart_models.CartItem).filter(
        cart_models.CartItem.user_id == user_id
    ).all()

    # Check if cart is empty
    if not cart_items:
        return {
            "message": "Cart is empty"
        }

    total_amount = 0

    # Calculate total
    for cart_item in cart_items:

        product = db.query(product_models.Product).filter(
            product_models.Product.id == cart_item.product_id
        ).first()

        if not product:
            return {
                "message": "Product not found"
            }

        if cart_item.quantity > product.stock:
            return {
                "message": f"Not enough stock for {product.name}"
            }

        total_amount += product.price * cart_item.quantity

    # Create order
    new_order = order_models.Order(
        user_id=user_id,
        total_amount=total_amount,
        status="Placed"
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Create order items
    for cart_item in cart_items:

        product = db.query(product_models.Product).filter(
            product_models.Product.id == cart_item.product_id
        ).first()

        new_order_item = order_models.OrderItem(
            order_id=new_order.id,
            product_id=product.id,
            quantity=cart_item.quantity,
            price=product.price
        )

        db.add(new_order_item)

        # Reduce product stock
        product.stock -= cart_item.quantity

    # Remove cart items
    for cart_item in cart_items:
        db.delete(cart_item)

    db.commit()

    return {
        "message": "Order placed successfully",
        "order_id": new_order.id,
        "total_amount": total_amount,
        "status": "Placed"
    }
# Get User Orders
@app.get("/orders/{user_id}")
def get_orders(
    user_id: int,
    db: Session = Depends(get_db)
):

    orders = db.query(order_models.Order).filter(
        order_models.Order.user_id == user_id
    ).all()

    return orders
# Get Order Details
@app.get("/order-details/{order_id}")
def get_order_details(
    order_id: int,
    db: Session = Depends(get_db)
):

    # Find the order
    order = db.query(order_models.Order).filter(
        order_models.Order.id == order_id
    ).first()

    if not order:
        return {
            "message": "Order not found"
        }

    # Find items belonging to this order
    order_items = db.query(order_models.OrderItem).filter(
        order_models.OrderItem.order_id == order_id
    ).all()

    items = []

    for item in order_items:

        product = db.query(product_models.Product).filter(
            product_models.Product.id == item.product_id
        ).first()

        items.append({
            "product_id": item.product_id,
            "product_name": product.name if product else "Unknown Product",
            "quantity": item.quantity,
            "price": item.price,
            "subtotal": item.price * item.quantity
        })

    return {
        "order_id": order.id,
        "user_id": order.user_id,
        "total_amount": order.total_amount,
        "status": order.status,
        "items": items
    }