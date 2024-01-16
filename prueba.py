from cs50 import SQL
from werkzeug.security import generate_password_hash, check_password_hash
from pyexcel_xlsx import get_data

import json

data = json.loads(json.dumps(get_data("insertar.xlsx")))
productos = data["Hoja1"][1:]
print(data)


#Usar un try y en caso de que un producto tenga error, solo pasar
for producto in productos:
    print(producto[0])







db = SQL("sqlite:///inventario.db")

