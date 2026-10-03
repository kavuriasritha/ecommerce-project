from pydantic import BaseModel


class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str
class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    category: str
class ProductUpdate(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    category: str
class CartItemCreate(BaseModel):
    user_id: int
    product_id: int
    quantity: int
class CartUpdate(BaseModel):
    quantity: int