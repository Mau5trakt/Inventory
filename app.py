import datetime
from datetime import datetime

from flask import Flask, render_template, request, jsonify, session
from flask_paginate import Pagination, get_page_parameter, get_page_args
from flask_session import Session
from cs50 import SQL
from werkzeug.security import generate_password_hash, check_password_hash
from helpers import *
from tempfile import mkdtemp

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"


db = SQL("sqlite:///inventario.db")

Session(app)


#users = list(range(100))



@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route('/')
@login_required
def index():
    productos = db.execute("SELECT *,precio_venta - costo as ganancia_neta,(precio_venta - costo) * cantidad as ganancia_potencial, (precio_venta / productos.costo) * 100 as porcentaje_ganancia FROM PRODUCTOS")
    def get_products(offset=0, per_page=30):
        return productos[offset: offset + per_page]

    def filter_products(search_term):
        return [p for p in productos if search_term.lower() in p["nombre"].lower()]


    nav_links = [{"nombre": "Inventario", "ruta": "/"}, {"nombre": "Agregar Productos", "ruta":"/agregar-productos"}, {"nombre": "Reporte de Ventas", "ruta": "reporte-ventas"}]
    page, per_page, offset = get_page_args(page_parameter='page',
                                           per_page_parameter='per_page')
    total = len(productos) #len(users)
    pagination_users = get_products(offset=offset, per_page=per_page) #El parametro per page de aqui es el que indica cuantos elementos se muestran en la plantilla html
    pagination = Pagination(page=page, per_page=per_page, total=total,
                            css_framework='bootstrap5')

    return render_template('index.html',
                           products=pagination_users,
                           page=page,
                           per_page=per_page,
                           pagination=pagination,
                           nav_links=nav_links
                           )

@app.route("/search", methods=["POST"])
def buscar():
    search_term = request.form.get('search_term', '')
    filtered_products = db.execute("SELECT *, precio_venta - costo as ganancia_neta, (precio_venta - costo) * cantidad as ganancia_potencial, (precio_venta / productos.costo) * 100 as porcentaje_ganancia FROM productos WHERE nombre LIKE '%' || ? || '%' ", (search_term,)) #filter_products(search_term)
    return jsonify(filtered_products)
    #return render_template(, products=filtered_products)

@app.route("/login", methods=["GET", "POST"])
def login():
    year = datetime.now().year
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        if not request.form.get("username"):
            return apology("Introduzca un nombre de usuario")

        if not request.form.get("password"):
            return apology("Introduzca una contraseña")

        validation = db.execute("SELECT * FROM admin WHERE username =?", username)


        if len(validation) != 1 or not check_password_hash(validation[0]["hash"], password):
            return apology("Clave o Usuario Incorrecto")

        session["username"] = validation[0]["username"]

        print(session["username"])

        return redirect("/")



    return render_template("login.html", year=year, )

@app.route("/agregar-productos", methods=["GET", "POST"])
@login_required
def agregar_producto():
    nav_links = [{"nombre": "Agregar Productos", "ruta": "/agregar-productos"},
                 {"nombre": "Inventario", "ruta": "/"},
                 {"nombre": "Reporte de Ventas", "ruta": "reporte-ventas"}]

    if request.method == "POST":

        nombre = request.form.get("nombre")
        cantidad = request.form.get("cantidad")
        costo = request.form.get("costo")
        precio_venta = request.form.get("precio-venta")
        categoria = request.form.get("categoria")



        try:
            cantidad = int(cantidad)
        except:
            return apology("Numeros decimales no permitidos")

        try:
            precio_venta = float(precio_venta)
        except:
            return apology("Precio no permitido")

        try:
            costo = float(costo)
        except:
            return apology("Precio no permitido")

        if not nombre:
            return apology("Introduzca nombre del producto")

        db.execute("INSERT INTO productos(nombre, cantidad, precio_venta, costo, categoria) VALUES (?, ?, ?, ?, ?)", nombre, cantidad, precio_venta, costo, categoria)


    return render_template("agregar-producto.html", nav_links=nav_links)

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

if __name__ == '__main__':
    app.run()
