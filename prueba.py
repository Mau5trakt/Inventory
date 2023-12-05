from cs50 import SQL
from werkzeug.security import generate_password_hash, check_password_hash


db = SQL("sqlite:///inventario.db")

