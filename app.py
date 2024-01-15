import datetime
import os.path
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session, send_file
from flask_cors import CORS
from flask_paginate import Pagination, get_page_parameter, get_page_args
from flask_session import Session
from cs50 import SQL
from werkzeug.security import generate_password_hash, check_password_hash
from helpers import *
from pyexcel_xlsx import save_data, get_data
import json
from tempfile import mkdtemp

TASA_CAMBIO = 37.00


app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"

app.config["INSERCIONES_FOLDER"] = "inserciones/"

db = SQL("sqlite:///inventario.db")

Session(app)
CORS(app)


# users = list(range(100))
def allowed_insertion(filename):
    ALLOWED_EXTENSION = {'xlsx'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSION


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
    productos = db.execute(
        "SELECT *, precio_venta - costo as ganancia_neta, (precio_venta - costo) * cantidad as ganancia_potencial, ((precio_venta - productos.costo) / productos.costo) * 100 as porcentaje_ganancia  FROM PRODUCTOS")

    def get_products(offset=0, per_page=30):
        return productos[offset: offset + per_page]

    def filter_products(search_term):
        return [p for p in productos if search_term.lower() in p["nombre"].lower()]

    nav_links = [{"nombre": "Inventario", "ruta": "/"}, {"nombre": "Agregar Productos", "ruta": "/agregar-productos"},
                 {"nombre": "Reporte de Ventas", "ruta": "reporte-ventas"}]
    page, per_page, offset = get_page_args(page_parameter='page',
                                           per_page_parameter='per_page')
    total = len(productos)  # len(users)
    pagination_users = get_products(offset=offset,
                                    per_page=per_page)  # El parametro per page de aqui es el que indica cuantos elementos se muestran en la plantilla html
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
    filtered_products = db.execute(
        "SELECT *, precio_venta - costo as ganancia_neta, (precio_venta - costo) * cantidad as ganancia_potencial, ((precio_venta - productos.costo) / productos.costo) * 100 as porcentaje_ganancia  FROM productos WHERE nombre LIKE '%' || ? || '%' ",
        (search_term,))  # filter_products(search_term)
    return jsonify(filtered_products)
    # return render_template(, products=filtered_products)


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

        db.execute("INSERT INTO productos(nombre, cantidad, precio_venta, costo, categoria) VALUES (?, ?, ?, ?, ?)",
                   nombre, cantidad, precio_venta, costo, categoria)

    return render_template("agregar-producto.html", nav_links=nav_links)


@app.route("/editar-producto/<int:id>", methods=["GET", "POST"])
@login_required
def editar_producto(id):
    nav_links = [{"nombre": "Agregar Productos", "ruta": "/agregar-productos"},
                 {"nombre": "Inventario", "ruta": "/"},
                 {"nombre": "Reporte de Ventas", "ruta": "reporte-ventas"}]
    producto = db.execute(
        "SELECT *, precio_venta - costo as ganancia_neta, (precio_venta - costo) * cantidad as ganancia_potencial, ((precio_venta - productos.costo) / productos.costo) * 100 as porcentaje_ganancia FROM productos WHERE producto_id = ?",
        id)[0]

    if request.method == "POST":
        nombre = request.form.get("nombre")
        costo = request.form.get("costo")
        precio_venta = request.form.get("precio-venta")
        categoria = request.form.get("categoria")

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

        db.execute("UPDATE productos SET nombre = ?, precio_venta = ?, costo = ?, categoria =? WHERE producto_id = ?",
                   nombre, precio_venta, costo, categoria, id)

        return redirect(f"/editar-producto/{producto['producto_id']}")

    return render_template("editar-producto.html", producto=producto, nav_links=nav_links)


@app.route("/checkout", methods=["GET", "POST"])
@login_required
def checkout():
    print("In checkout ")

    return render_template("pago.html")


@app.route("/procesar_orden", methods=["POST"])
@login_required
def procesar_orden():
    try:
        data = request.get_json()
        transaccion = data["transaccion"]
        productos = data["products_list"]

        numero = db.execute("INSERT INTO TRANSACCIONES (cliente, correo, direccion, forma_pago, entrega, mdelivery, fecha)"
                            "VALUES (?, ?, ?, ?, ?, ?, ?)",transaccion["cliente"], transaccion["correo"], transaccion["direccion"], transaccion["forma_pago"], transaccion["entrega"], transaccion["delivery"], datetime.now() )

        for producto in productos:
            p_id = db.execute("SELECT producto_id FROM PRODUCTOS WHERE nombre = ?", producto["nombre"])[0]["producto_id"]
            db.execute("INSERT INTO productos_transaccion"
                       "(pt_transaccion_id, pt_producto_id, pt_cantidad, pt_monto_producto)" #pt_monto_producto antes se llamaba total
                       "VALUES(?,?,?,?)",numero, p_id,producto["cantidad"], producto["total"])

            #restar del inventario
            cantidad_inventario = db.execute("SELECT cantidad FROM productos WHERE producto_id = ?", p_id)[0]["cantidad"]
            db.execute("UPDATE productos set cantidad = ? WHERE producto_id = ?", (cantidad_inventario - producto["cantidad"]), p_id)
            print(producto["cantidad"], "se compraron")

            #enviar el correo



        return jsonify({"message": "datos correctos"}) #Respuesta para la peticion fetch#############
    except Exception as e:
        print("Error en la ruta /procesar_orden:", str(e))
        return redirect("/")

@app.route("/reporte-ventas", methods=["GET", "POST"])
@login_required
def show_reports():
    hoy = datetime.now()
    fecha_formateada = hoy.strftime("%Y-%m-%d")
    print(fecha_formateada)
    return render_template("reportes.html", fecha_formateada=fecha_formateada)



@app.route("/generar_reportes", methods=["POST"])
@login_required
def generar_reportes():

    #Funcion que recibe y manda datos a la respuesta del fetch
    data = request.get_json()
    print(data)


    query = (f"SELECT * FROM transacciones INNER JOIN productos_transaccion pt on transacciones.transaccion_id = pt.pt_transaccion_id inner join main.productos p on p.producto_id = pt.pt_producto_id where fecha BETWEEN '{data["f1"]} 00:00:00' AND '{data["f2"]} 23:59:59' ORDER BY fecha DESC;")
    consulta = db.execute(query)
    query_vendidos =f'''SELECT sum(pt.pt_cantidad) as vendidos FROM transacciones INNER JOIN productos_transaccion pt on transacciones.transaccion_id = pt.pt_transaccion_id
                        inner join main.productos p on p.producto_id = pt.pt_producto_id where fecha BETWEEN "{data["f1"]} 00:00:00" AND   "{data["f2"]} 23:59:59";'''
    vendidos = db.execute(query_vendidos)[0]

    query_ventas = f' SELECT count(*) as ventas FROM transacciones WHERE fecha between "{data["f1"]} 00:00:00" AND "{data["f2"]} 23:59:59" '
    ventas = db.execute(query_ventas)[0]

    query_facturado = f'''SELECT ifnull(sum(pt_monto_producto), 0) as facturado FROM transacciones INNER JOIN productos_transaccion pt on transacciones.transaccion_id = pt.pt_transaccion_id
                            inner join main.productos p on p.producto_id = pt.pt_producto_id where fecha
                            BETWEEN "{data["f1"]} 00:00:00" AND   "{data["f2"]} 23:59:59";'''

    facturado = float(db.execute(query_facturado)[0]["facturado"])
    query_entregas_local = f''' 
    SELECT count(entrega) FROM transacciones WHERE entrega = "local" AND fecha
    BETWEEN "{data["f1"]} 00:00:00" AND   "{data["f2"]} 23:59:59";
    '''
    query_entregas_delivery = f''' 
        SELECT count(entrega) FROM transacciones WHERE entrega = "delivery" AND fecha
        BETWEEN "{data["f1"]} 00:00:00" AND   "{data["f2"]} 23:59:59";
        '''

    query_total_efectivo = f''' SELECT count(forma_pago) as fp FROM transacciones WHERE forma_pago = "efectivo" AND fecha 
                                BETWEEN "{data["f1"]} 00:00:00" AND   "{data["f2"]} 23:59:59";'''

    query_total_transferencia = f''' SELECT count(forma_pago) as fp FROM transacciones WHERE forma_pago = "transferencia" AND fecha 
                                BETWEEN "{data["f1"]} 00:00:00" AND   "{data["f2"]} 23:59:59";'''

    query_total_tarjeta = f''' SELECT count(forma_pago) as fp FROM transacciones WHERE forma_pago = "tarjeta" AND fecha 
                                BETWEEN "{data["f1"]} 00:00:00" AND   "{data["f2"]} 23:59:59";'''

    query_monto_efectivo = f''' 
    SELECT ifnull(sum(pt_monto_producto), 0) as monto FROM transacciones INNER JOIN productos_transaccion pt on transacciones.transaccion_id = pt.pt_transaccion_id
inner join main.productos p on p.producto_id = pt.pt_producto_id
where forma_pago = "efectivo" AND fecha BETWEEN "{data["f1"]} 00:00:00" AND   "{data["f2"]} 23:59:59";'''

    query_monto_transferencia = f''' 
    SELECT ifnull(sum(pt_monto_producto), 0) as monto FROM transacciones INNER JOIN productos_transaccion pt on transacciones.transaccion_id = pt.pt_transaccion_id
inner join main.productos p on p.producto_id = pt.pt_producto_id
where forma_pago = "transferencia" AND fecha BETWEEN "{data["f1"]} 00:00:00" AND   "{data["f2"]} 23:59:59";'''

    query_monto_tarjeta = f''' 
    SELECT ifnull(sum(pt_monto_producto), 0) as monto FROM transacciones INNER JOIN productos_transaccion pt on transacciones.transaccion_id = pt.pt_transaccion_id
inner join main.productos p on p.producto_id = pt.pt_producto_id
where forma_pago = "tarjeta" AND fecha BETWEEN "{data["f1"]} 00:00:00" AND   "{data["f2"]} 23:59:59";'''

    query_recaudado_delivery = f''' SELECT  ifnull(sum(mdelivery), 0) as rdelivery FROM transacciones where fecha  BETWEEN "{data["f1"]} 00:00:00" AND   "{data["f2"]} 23:59:59";'''

    recaudado_delivery = db.execute(query_recaudado_delivery)[0]["rdelivery"]

    round(recaudado_delivery, 2)
    recaudado_delivery_dolares = round(recaudado_delivery / 37, 2)

    query_rdelivery_efectivo = f''' 
    SELECT ifnull(SUM(mdelivery), 0) as mdelivery FROM transacciones
    where forma_pago = "efectivo" AND entrega = "delivery" AND fecha
    BETWEEN "{data["f1"]} 00:00:00" AND   "{data["f2"]} 23:59:59"     
    '''
    query_rdelivery_transferencia = f''' 
    SELECT ifnull(SUM(mdelivery), 0) as mdelivery FROM transacciones
    where forma_pago = "transferencia" AND entrega = "delivery" AND fecha
    BETWEEN "{data["f1"]} 00:00:00" AND   "{data["f2"]} 23:59:59"     
    '''
    query_rdelivery_tarjeta = f''' 
    SELECT ifnull(SUM(mdelivery), 0) as mdelivery FROM transacciones
    where forma_pago = "tarjeta" AND entrega = "delivery" AND fecha
    BETWEEN "{data["f1"]} 00:00:00" AND   "{data["f2"]} 23:59:59"     
    '''

    rdelivery_efectivo = float(db.execute(query_rdelivery_efectivo)[0]["mdelivery"])
    rdelivery_transferencia = float(db.execute(query_rdelivery_transferencia)[0]["mdelivery"])
    rdelivery_tarjeta = float(db.execute(query_rdelivery_tarjeta)[0]["mdelivery"])


    print(f"recaudado de delivery: {recaudado_delivery} en dolares: {recaudado_delivery_dolares}")
    print("@@@@@@@@@@",facturado)
    print("@@@@@@@@@@",recaudado_delivery_dolares)





    monto_efectivo = float(db.execute(query_monto_efectivo)[0]["monto"])
    monto_transferencia = db.execute(query_monto_transferencia)[0]["monto"]
    monto_tarjeta = db.execute(query_monto_tarjeta)[0]["monto"]

    compras_efectivo = db.execute(query_total_efectivo)[0]["fp"]
    compras_transferencia = db.execute(query_total_transferencia)[0]["fp"]
    compras_tarjeta = db.execute(query_total_tarjeta)[0]["fp"]

    entregas_local = db.execute(query_entregas_local)[0]["count(entrega)"]
    entregas_delivery = db.execute(query_entregas_delivery)[0]["count(entrega)"]
    print(entregas_local, "entregas local")
    print(entregas_delivery, "entregas delivery")

    print(vendidos["vendidos"])
    monto_ventas = monto_efectivo + monto_transferencia + monto_tarjeta

    print(f"monto efectivo: {monto_efectivo} monto d: {rdelivery_efectivo}")
    print(f"monto transferencia: {monto_transferencia} monto d: {rdelivery_transferencia}")
    print(f"monto tarjeta: {monto_tarjeta} monto d: {rdelivery_tarjeta}")
    #for columna in consulta:
    #    print(columna)
    send = {"query_productos": consulta,
            "vendidos": vendidos,
            "recaudado_delivery": recaudado_delivery,
            "ventas": ventas,
            "facturado": facturado + recaudado_delivery_dolares,
            "entregas_local": entregas_local,
            "entregas_delivery": entregas_delivery,
            "compras_efectivo": compras_efectivo,
            "compras_transferencia": compras_transferencia,
            "compras_tarjeta": compras_tarjeta,
            "monto_efectivo": round(monto_efectivo + (rdelivery_efectivo / TASA_CAMBIO), 2),
            "monto_transferencia": round(monto_transferencia + (rdelivery_transferencia / TASA_CAMBIO), 2),
            "monto_tarjeta": round(monto_tarjeta + (rdelivery_tarjeta / TASA_CAMBIO), 2),
            "recaudado_delivery_cordobas": recaudado_delivery,
            "monto_ventas": monto_ventas



            }

    print(consulta)

    #("{consulta: [{}, {}, {}],"
    # "ventas: a",
    # "p_vendidos}")

    return jsonify(send)


@app.route("/descargar_productos", methods=["GET"])
@login_required
def descargar_productos():
    productos = db.execute(
        "SELECT *, precio_venta - costo as ganancia_neta, (precio_venta - costo) * cantidad as ganancia_potencial, ((precio_venta - productos.costo) / productos.costo) * 100 as porcentaje_ganancia  FROM PRODUCTOS")

    array = [["Productos en existencia", datetime.now()], [""], ["ID Producto", "Cantidad", "Nombre", "Precio de Venta", "Costo", "Categoria", "Ganancia Neta", "Ganancia Potencial", "Porcentaje de Ganancia"]]
    for producto in productos:
        array.append([producto["producto_id"], producto["cantidad"], producto["nombre"], producto["precio_venta"], producto["costo"], producto["categoria"], producto["ganancia_neta"], producto["ganancia_potencial"], producto["porcentaje_ganancia"]])

    excel_file_path = "productos.xlsx"
    save_data(excel_file_path, {"Hoja 1": array})

    return send_file(excel_file_path, as_attachment=True, download_name=f'productos - {datetime.now()} .xlsx', mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

@app.route("/insertar_productos", methods=["GET", "POST"])
@login_required
def insertar():
    nav_links = [{"nombre": "Insertar Productos", "ruta": "/insertar_productos"},
                 {"nombre": "Agregar Productos", "ruta": "/agregar-productos"},
                 {"nombre": "Inventario", "ruta": "/"},
                 {"nombre": "Reporte de Ventas", "ruta": "reporte-ventas"}]

    if request.method == "POST":
        #print(request.files)
        if 'file' not in request.files:
            return apology("No se proporcionó ningún archivo")

        file = request.files["file"]

        if file.filename == '':
            return apology("Nombre de archivo no valido")

        if file and allowed_insertion(file.filename):
            array = [["producto", "cantidad"]]
            print("Valid")
            data = json.loads(json.dumps(get_data(file)))
            productos = data["Hoja1"][1:]
            cabeceras = data["Hoja1"][0]

            cabeceras_minusculas = [cabecera.lower() for cabecera in cabeceras]
            if len(cabeceras) != 2 or cabeceras_minusculas[0] != "producto" or cabeceras_minusculas[1] != "cantidad":
                return apology("Contenido del archivo invalido")
            #print(cabeceras)
            #print(cabeceras_minusculas)
            try:
                for producto in productos:
                    producto_info = db.execute("SELECT producto_id, cantidad, nombre FROM productos WHERE nombre = ?", producto[0])
                    producto_id = producto_info[0]["producto_id"]
                    cantidad = producto_info[0]["cantidad"]
                    nombre = producto_info[0]["nombre"]
                    if int(producto[1]) < 0:
                        pass
                    else:
                            #Introducir lo que mandó el usuario
                        array.append([nombre, producto[1]])
                        ncantidad = int(cantidad) + int(producto[1])
                        db.execute("UPDATE productos SET cantidad = ? WHERE producto_id = ?", ncantidad, producto_id)
                        print(producto_id, cantidad)
            except:
                pass

            os.makedirs(app.config["INSERCIONES_FOLDER"], exist_ok=True)
            excel_file_path = f"./inserciones/Insercion Multiple - {datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.xlsx"
            save_data(excel_file_path, {"Hoja 1": array})


            return redirect("/")

    #return apology("Extension de arhivo no permitida")
    return render_template("insertar.html", nav_links=nav_links)




@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")


if __name__ == '__main__':
    app.run()
