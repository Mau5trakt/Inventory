from cs50 import SQL

db = SQL("sqlite:///inventario.db")


productos = db.execute("SELECT * FROM PRODUCTOS")

for producto in productos:
    print(producto)