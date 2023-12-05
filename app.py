from flask import Flask, render_template, request, jsonify
from flask_paginate import Pagination, get_page_parameter, get_page_args
from cs50 import SQL

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True

db = SQL("sqlite:///inventario.db")

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
def index():
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
                           )

@app.route("/search", methods=["GET", "POST"])
def buscar():
    search_term = request.form.get('search_term', '')
    filtered_products = filter_products(search_term)
    return jsonify(filtered_products)
    #return render_template(, products=filtered_products)

if __name__ == '__main__':
    app.run()
