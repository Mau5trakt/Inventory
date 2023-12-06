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

productos = db.execute("SELECT * FROM PRODUCTOS")
#users = list(range(100))

def get_products(offset=0, per_page=30):
    return productos[offset: offset + per_page]

def filter_products(search_term):
    return [p for p in productos if search_term.lower() in p["nombre"].lower()]

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
    filtered_products = filter_products(search_term)
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

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

if __name__ == '__main__':
    app.run()
