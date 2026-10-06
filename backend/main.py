from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import Base, engine, SessionLocal

import models
import product_models
import cart_models
import order_models


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="My E-Commerce API",
    description="E-Commerce Backend API",
    version="1.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# =========================================================
# REQUEST SCHEMAS
# =========================================================

class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    category: str


class CartCreate(BaseModel):
    user_id: int
    product_id: int
    quantity: int


class CartUpdate(BaseModel):
    quantity: int


class OrderStatusUpdate(BaseModel):
    status: str


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "message": "E-commerce API is running",
        "status": "success"
    }


# =========================================================
# USER REGISTER
# =========================================================

@app.post("/register")
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(
        models.User
    ).filter(
        models.User.email == user.email
    ).first()

    if existing_user:

        return {
            "message": "Email already registered"
        }

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=user.password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id,
        "name": new_user.name,
        "email": new_user.email
    }


# =========================================================
# LOGIN
# =========================================================

@app.post("/login")
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(
        models.User
    ).filter(
        models.User.email == login_data.email,
        models.User.password == login_data.password
    ).first()

    if not user:

        return {
            "message": "Invalid email or password"
        }

    return {
        "message": "Login successful",
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }


# =========================================================
# GET ALL PRODUCTS
# =========================================================

@app.get("/products")
def get_products(
    db: Session = Depends(get_db)
):

    products = db.query(
        product_models.Product
    ).all()

    return products


# =========================================================
# GET SINGLE PRODUCT
# =========================================================

@app.get("/products/{product_id}")
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = db.query(
        product_models.Product
    ).filter(
        product_models.Product.id == product_id
    ).first()

    if not product:

        return {
            "message": "Product not found"
        }

    return product


# =========================================================
# ADMIN - ADD PRODUCT
# =========================================================

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

    return new_product


# =========================================================
# ADMIN - UPDATE PRODUCT
# =========================================================

@app.put("/products/{product_id}")
def update_product(
    product_id: int,
    product: ProductCreate,
    db: Session = Depends(get_db)
):

    existing_product = db.query(
        product_models.Product
    ).filter(
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

    return existing_product


# =========================================================
# ADMIN - DELETE PRODUCT
# =========================================================

@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = db.query(
        product_models.Product
    ).filter(
        product_models.Product.id == product_id
    ).first()

    if not product:

        return {
            "message": "Product not found"
        }

    db.delete(product)

    db.commit()

    return {
        "message": "Product deleted successfully"
    }


# =========================================================
# ADD PRODUCT TO CART
# =========================================================

@app.post("/cart")
def add_to_cart(
    cart: CartCreate,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # CHECK PRODUCT
    # -----------------------------------------------------

    product = db.query(
        product_models.Product
    ).filter(
        product_models.Product.id == cart.product_id
    ).first()

    if not product:

        return {
            "message": "Product not found"
        }


    # -----------------------------------------------------
    # CHECK QUANTITY
    # -----------------------------------------------------

    if cart.quantity <= 0:

        return {
            "message": "Quantity must be greater than 0"
        }


    # -----------------------------------------------------
    # CHECK STOCK
    # -----------------------------------------------------

    if product.stock < cart.quantity:

        return {
            "message": f"Only {product.stock} items available"
        }


    # -----------------------------------------------------
    # CHECK EXISTING CART ITEM
    # -----------------------------------------------------

    existing_item = db.query(
        cart_models.Cart
    ).filter(
        cart_models.Cart.user_id == cart.user_id,
        cart_models.Cart.product_id == cart.product_id
    ).first()


    # -----------------------------------------------------
    # UPDATE EXISTING ITEM
    # -----------------------------------------------------

    if existing_item:

        new_quantity = (
            existing_item.quantity +
            cart.quantity
        )

        if new_quantity > product.stock:

            return {
                "message":
                f"Only {product.stock} items available"
            }

        existing_item.quantity = new_quantity


    # -----------------------------------------------------
    # ADD NEW ITEM
    # -----------------------------------------------------

    else:

        new_cart = cart_models.Cart(

            user_id=cart.user_id,

            product_id=cart.product_id,

            quantity=cart.quantity
        )

        db.add(new_cart)


    db.commit()

    return {
        "message": "Product added to cart"
    }


# =========================================================
# GET USER CART
# =========================================================

@app.get("/cart/{user_id}")
def get_cart(
    user_id: int,
    db: Session = Depends(get_db)
):

    cart_items = db.query(
        cart_models.Cart
    ).filter(
        cart_models.Cart.user_id == user_id
    ).all()


    result = []


    # -----------------------------------------------------
    # ADD PRODUCT DETAILS TO CART RESPONSE
    # -----------------------------------------------------

    for item in cart_items:

        product = db.query(
            product_models.Product
        ).filter(
            product_models.Product.id == item.product_id
        ).first()


        if product:

            result.append({

                "id": item.id,

                "user_id": item.user_id,

                "product_id": item.product_id,

                "product_name": product.name,

                "description": product.description,

                "price": product.price,

                "category": product.category,

                "stock": product.stock,

                "quantity": item.quantity,

                "subtotal":
                    product.price * item.quantity
            })


    return result


# =========================================================
# UPDATE CART QUANTITY
# =========================================================

@app.put("/cart/{cart_id}")
def update_cart_quantity(
    cart_id: int,
    cart_data: CartUpdate,
    db: Session = Depends(get_db)
):

    cart_item = db.query(
        cart_models.Cart
    ).filter(
        cart_models.Cart.id == cart_id
    ).first()


    if not cart_item:

        return {
            "message": "Cart item not found"
        }


    if cart_data.quantity <= 0:

        return {
            "message": "Quantity must be greater than 0"
        }


    # -----------------------------------------------------
    # CHECK PRODUCT STOCK
    # -----------------------------------------------------

    product = db.query(
        product_models.Product
    ).filter(
        product_models.Product.id ==
        cart_item.product_id
    ).first()


    if not product:

        return {
            "message": "Product not found"
        }


    if cart_data.quantity > product.stock:

        return {
            "message":
            f"Only {product.stock} items available"
        }


    cart_item.quantity = cart_data.quantity

    db.commit()

    db.refresh(cart_item)


    return {
        "message": "Cart quantity updated",

        "cart_id": cart_item.id,

        "quantity": cart_item.quantity
    }


# =========================================================
# REMOVE PRODUCT FROM CART
# =========================================================

@app.delete("/cart/{cart_id}")
def remove_from_cart(
    cart_id: int,
    db: Session = Depends(get_db)
):

    cart_item = db.query(
        cart_models.Cart
    ).filter(
        cart_models.Cart.id == cart_id
    ).first()


    if not cart_item:

        return {
            "message": "Cart item not found"
        }


    db.delete(cart_item)

    db.commit()


    return {
        "message": "Product removed from cart"
    }


# =========================================================
# PLACE ORDER
# =========================================================

@app.post("/orders/{user_id}")
def place_order(
    user_id: int,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # GET CART
    # -----------------------------------------------------

    cart_items = db.query(
        cart_models.Cart
    ).filter(
        cart_models.Cart.user_id == user_id
    ).all()


    if not cart_items:

        return {
            "message": "Cart is empty"
        }


    total_amount = 0


    # -----------------------------------------------------
    # CHECK STOCK + CALCULATE TOTAL
    # -----------------------------------------------------

    products_data = []


    for cart_item in cart_items:

        product = db.query(
            product_models.Product
        ).filter(
            product_models.Product.id ==
            cart_item.product_id
        ).first()


        if not product:

            return {
                "message":
                f"Product {cart_item.product_id} not found"
            }


        if cart_item.quantity > product.stock:

            return {
                "message":
                f"Not enough stock for {product.name}"
            }


        subtotal = (
            product.price *
            cart_item.quantity
        )

        total_amount += subtotal


        products_data.append({

            "product": product,

            "quantity": cart_item.quantity,

            "price": product.price
        })


    # -----------------------------------------------------
    # CREATE ORDER
    # -----------------------------------------------------

    new_order = order_models.Order(

        user_id=user_id,

        total_amount=total_amount,

        status="Placed"
    )


    db.add(new_order)

    db.commit()

    db.refresh(new_order)


    # -----------------------------------------------------
    # CREATE ORDER ITEMS
    # -----------------------------------------------------

    for item in products_data:

        product = item["product"]

        quantity = item["quantity"]

        price = item["price"]


        order_item = order_models.OrderItem(

            order_id=new_order.id,

            product_id=product.id,

            quantity=quantity,

            price=price
        )


        db.add(order_item)


        # -------------------------------------------------
        # REDUCE PRODUCT STOCK
        # -------------------------------------------------

        product.stock -= quantity


    # -----------------------------------------------------
    # CLEAR CART
    # -----------------------------------------------------

    for cart_item in cart_items:

        db.delete(cart_item)


    db.commit()


    return {

        "message":
        "Order placed successfully",

        "order_id":
        new_order.id,

        "user_id":
        new_order.user_id,

        "total_amount":
        new_order.total_amount,

        "status":
        new_order.status
    }


# =========================================================
# GET USER ORDERS
# =========================================================

@app.get("/orders/{user_id}")
def get_orders(
    user_id: int,
    db: Session = Depends(get_db)
):

    orders = db.query(
        order_models.Order
    ).filter(
        order_models.Order.user_id == user_id
    ).all()


    return orders


# =========================================================
# GET ORDER DETAILS
# =========================================================

@app.get("/order-details/{order_id}")
def get_order_details(
    order_id: int,
    db: Session = Depends(get_db)
):

    order = db.query(
        order_models.Order
    ).filter(
        order_models.Order.id == order_id
    ).first()


    if not order:

        return {
            "message": "Order not found"
        }


    order_items = db.query(
        order_models.OrderItem
    ).filter(
        order_models.OrderItem.order_id ==
        order_id
    ).all()


    items = []


    for item in order_items:

        product = db.query(
            product_models.Product
        ).filter(
            product_models.Product.id ==
            item.product_id
        ).first()


        if product:

            items.append({

                "product_id":
                    product.id,

                "product_name":
                    product.name,

                "quantity":
                    item.quantity,

                "price":
                    item.price,

                "subtotal":
                    item.price *
                    item.quantity
            })


    return {

        "order_id":
            order.id,

        "user_id":
            order.user_id,

        "total_amount":
            order.total_amount,

        "status":
            order.status,

        "items":
            items
    }


# =========================================================
# ADMIN - GET ALL ORDERS
# =========================================================

@app.get("/admin/orders")
def get_all_orders(
    db: Session = Depends(get_db)
):

    orders = db.query(
        order_models.Order
    ).all()


    return orders


# =========================================================
# ADMIN - UPDATE ORDER STATUS
# =========================================================

@app.put("/admin/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    db: Session = Depends(get_db)
):

    order = db.query(
        order_models.Order
    ).filter(
        order_models.Order.id == order_id
    ).first()


    if not order:

        return {
            "message": "Order not found"
        }


    new_status = status_data.status.strip()


    # -----------------------------------------------------
    # ALLOWED STATUS VALUES
    # -----------------------------------------------------

    allowed_statuses = [

        "Placed",

        "Processing",

        "Shipped",

        "Delivered",

        "Cancelled"
    ]


    # -----------------------------------------------------
    # CASE-INSENSITIVE CHECK
    # -----------------------------------------------------

    matched_status = None


    for status in allowed_statuses:

        if new_status.lower() == status.lower():

            matched_status = status

            break


    if matched_status is None:

        return {

            "message":
            "Invalid order status",

            "allowed_statuses":
                allowed_statuses
        }


    # -----------------------------------------------------
    # UPDATE
    # -----------------------------------------------------

    order.status = matched_status


    db.commit()

    db.refresh(order)


    return {

        "message":
        "Order status updated successfully",

        "order_id":
        order.id,

        "status":
        order.status
    }


# =========================================================
# ADMIN - GET ALL USERS
# =========================================================

@app.get("/admin/users")
def get_all_users(
    db: Session = Depends(get_db)
):

    users = db.query(
        models.User
    ).all()


    return users


# =========================================================
# ADMIN - DASHBOARD SUMMARY
# =========================================================

@app.get("/admin/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db)
):

    total_products = db.query(
        product_models.Product
    ).count()


    total_users = db.query(
        models.User
    ).count()


    total_orders = db.query(
        order_models.Order
    ).count()


    orders = db.query(
        order_models.Order
    ).all()


    total_sales = sum(
        order.total_amount
        for order in orders
    )


    return {

        "total_products":
            total_products,

        "total_users":
            total_users,

        "total_orders":
            total_orders,

        "total_sales":
            total_sales
    }