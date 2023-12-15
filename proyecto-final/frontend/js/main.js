// Objeto para mantener el stock de cada producto
let datosUsuario = {};
let datosClientes = {};
let datosProductos = {};
let datosServicios = {};
let datosFacturas = {};
let datosDetallesFacturas = {};
let datosRankingClientes = {};
let datosRankingServicios = {};
let datosRankingProductos = {};
let datosMovimientoStock = {};
const productosStock = {};
const productosPrecio = {};
const serviciosPrecio = {};
let todasLasFacturas = []; // Asegúrate de cargar aquí todas las facturas
let facturasFiltradas = [];
let totalFacturadoUsuario = {};
let datosControlStock = {};
let myChartVentas = null;
let myChartStock = null;
let myChartClientes = null;
let myChartProductos = null;
let myChartServicios = null;
let contadorProductos = 0;
let selectProductos = 1;
let contadorServicios = 0;
let selectServicios = 1;
let historialVentasMostrado = false;
let movimientoStockMostrado = false;
let ultimosDatosClientes = {};
let ultimosDatosProductos = {};
let ultimosDatosServicios = {};
let ultimosDatosFacturas = {};
let ultimosDatosMovimientoStock = {};
let ultimoAnoProcesado = null;
let cantidadesSeleccionadas = {};
let movimientosProductos = {};

// LOGIN
//  cambiar de sing up a login
const signupButton = document.getElementById("signup");
const loginChange = document.getElementById("login");
const userForms = document.getElementById("user_options-forms");
const loginButton = document.getElementById("login-button");

// al darle click en singup pasa a login
signupButton.addEventListener(
  "click",
  () => {
    userForms.classList.remove("bounceRight");
    userForms.classList.add("bounceLeft");
    document.getElementById("signup-fullname").value = "";
    document.getElementById("signup-email").value = "";
    document.getElementById("signup-password").value = "";
    document.getElementById("signup-repeat-password").value = "";
  },
  false
);

// al contrario que el anterior
loginChange.addEventListener(
  "click",
  () => {
    userForms.classList.remove("bounceLeft");
    userForms.classList.add("bounceRight");
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
  },
  false
);

loginButton.addEventListener('click', function(event) {
  // Prevenir el comportamiento por defecto del botón de tipo submit
  event.preventDefault();

  // Llamar a la función iniciarSesion
  iniciarSesion();
});

// ----------------------- menu hamburguesa mobile  ----------------

const loginSection = document.getElementById("login-section");
const mainContent = document.getElementById("home-section");


window.onload = function () {
  login();
};

// --------------------------   INICIAR SESION ------------------------------
function iniciarSesion() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + btoa(username + ":" + password),
    },
  };

  fetch("http://127.0.0.1:5200/login", requestOptions)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Credenciales incorrectas");
      }
    })
    .then((data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userid", data.id_usuario);
      localStorage.setItem("plan", data.categoria);
      inicio();
    })
    .catch((error) => {
      alert(error.message);
    });
}

// ----------------------------------- cerrar Sesion ------------------
function cerrarSesion() {
  // Eliminar el token y el id del usuario del almacenamiento
  localStorage.removeItem("token");
  localStorage.removeItem("userid");
  localStorage.removeItem("plan");

  // Redirigir al usuario a la página de inicio de sesión
  window.location.href = "./index.html";
}

function datosHanCambiado(datosActuales, ultimosDatos) {
  return JSON.stringify(datosActuales) !== JSON.stringify(ultimosDatos);
}

// Agregar evento al enlace de desconectar
const logoutLink = document.querySelector('a[href="#"][onclick="login()"]');
if (logoutLink) {
  logoutLink.onclick = function (event) {
    event.preventDefault(); // Prevenir el comportamiento predeterminado del enlace
    cerrarSesion();
  };
}

// -----------------------------  modificacion del usuario -------------------------
function mostrarOpcionesUsuario() {
  var menuUsuario = document.getElementById("menu-usuario");
  menuUsuario.style.display = menuUsuario.style.display === "block" ? "none" : "block";
}



function mostrarModalPerfil() {
  mostrarOpcionesUsuario();

  const modal = document.getElementById("modal-perfil-usuario");
  modal.style.display = "block";

  const categoriaUsuario = document.getElementById("categoria-usuario");
  const correoUsuario = document.getElementById("correo-usuario");
  const nombreUsuario = document.getElementById("nombre-usuario");
  const contrasenaActual = document.getElementById("contrasena-actual");

  categoriaUsuario.value = datosUsuario.categoria;
  correoUsuario.value = datosUsuario.correo_electronico;
  nombreUsuario.value = datosUsuario.nombre;
  contrasenaActual.value = datosUsuario.contrasena;
}

async function obtenerUsuario() {
  try {
    const response = await fetch(
      `http://127.0.0.1:5200/user/${localStorage.getItem("userid")}/get_usuario`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem("token"),
          "user-id": localStorage.getItem("userid"),
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error al cargar servicios");
    }

    const data = await response.json();

    datosUsuario = data;
  }
  catch (error) {
    console.error("Error al cargar usuario:", error);
  }
  
  const bienvenido = document.getElementById("bienvenido");
  bienvenido.innerHTML = "";
  bienvenido.innerHTML = `
    <h1 class="title-bienvenido">Bienvenido ${datosUsuario.nombre}</h1>
  `;
}

// Función para ocultar el menú usuario que puedes llamar después de realizar alguna acción
function ocultarMenuUsuario() {
  var menuUsuario = document.getElementById("menu-usuario");
  menuUsuario.style.display = "none";
}

function editarUsuario() {
  const boton = document.getElementById("btn-editar-perfil");
  boton.textContent = "Guardar";
  boton.onclick = () => {
    guardarUsuario();
    ocultarMenuUsuario(); // Esto ocultará el menú de usuario
  };

  const contrasenaNueva = document.getElementById("contrasena-nueva");
  contrasenaNueva.style.display = "block";

  const repetirContrasena = document.getElementById("repetir-contrasena");
  repetirContrasena.style.display = "block";

  // Hacer que los campos de correo electrónico y nombre sean editables
  document.getElementById("correo-usuario").readOnly = false;
  document.getElementById("nombre-usuario").readOnly = false;
  document.getElementById("categoria-usuario").readOnly = false;

  //Cambiar el foco al primer campo editable
  document.getElementById("categoria-usuario").focus();
}

function guardarUsuario() {
  // Aquí agregarías la lógica para guardar los cambios
  // Por ejemplo, enviar los datos actualizados al servidor
  const nombre = document.getElementById("nombre-usuario").value;
  const correo = document.getElementById("correo-usuario").value;
  const contrasenaNueva = document.getElementById("nueva-contrasena").value;
  const repetirContrasena = document.getElementById("repetir-contrasena").value;

  // Volver a hacer los campos de solo lectura
  nombre.readOnly = true;
  correo.readOnly = true;

  let usuario = {
    correo_electronico: correo,
    contrasena: contrasenaNueva,
    nombre_usuario: nombre,
  };

  if (!validarContrasena(contrasenaNueva)) {
    // Muestra un SweetAlert
    Swal.fire({
      title: "¡Error!",
      text: "La contraseña debe tener al menos 8 caracteres, comenzar con una letra mayúscula, una letra minúscula y un número.",
      icon: "error",
      confirmButtonText: "OK",
    });
    return;
  } else if (contrasenaNueva !== repetirContrasena) {
    // Muestra un SweetAlert
    Swal.fire({
      title: "¡Error!",
      text: "Las contraseñas no coinciden",
      icon: "error",
      confirmButtonText: "OK",
    });
    return;
  }
  fetch(`http://127.0.0.1:5200/user/${localStorage.getItem("userid")}/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": localStorage.getItem("token"), // Reemplaza TOKEN_AQUI con el token JWT aquí
      "user-id": localStorage.getItem("userid"), // Reemplaza con el ID de usuario correcto
    },
    body: JSON.stringify(usuario),
  }).then((response) => {
    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "Se han guardado los cambios. Debe volver a iniciar sesion",
        showConfirmButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          cerrarSesion();
        }
      });
    } else {
      throw new Error("Error al actualizar el usuario");
    }
  });
}


function cancelarCliente(id, fila, mobile) {
  // Opcional: Aquí restablecerías los valores originales de las celdas si es necesario...
  const datosOriginales = datosClientes.find((c) => c.id === id);
  if (!mobile){
    fila.querySelector("#nombre").textContent = datosOriginales.nombre;
    fila.querySelector("#direccion").textContent = datosOriginales.direccion;
    fila.querySelector("#telefono").textContent = datosOriginales.telefono;
    fila.querySelector("#correo").textContent =
      datosOriginales.correo_electronico;
    fila.querySelector("#dni").textContent = datosOriginales.dni;
    // Restablecer los botones
    resetBotonesCliente(fila, id, false);
  }else{
    const nombre = document.getElementById("nombre");
    const direccion = document.getElementById("direccion");
    const telefono = document.getElementById("telefono");
    const correo = document.getElementById("correo");
    const dni = document.getElementById("dni");
    nombre.value = datosOriginales.nombre;
    direccion.value = datosOriginales.direccion;
    telefono.value = datosOriginales.telefono;
    correo.value = datosOriginales.correo_electronico;
    dni.value = datosOriginales.dni;
    // Restablecer los botones
    resetBotonesCliente(null, id, true);
  }
  
}

function cancelarProducto(id, fila, mobile) {
  const datosOriginales = datosProductos.find((p) => p.id === id);
  if (!mobile){
    fila.querySelector("#nombreProducto").textContent =
      datosOriginales.nombre_producto;
    fila.querySelector("#precioProducto").textContent = "$ " + datosOriginales.precio;
    fila.querySelector("#stockProducto").textContent = datosOriginales.stock;
  
    resetBotonesProducto(fila, id, false);
  } else{
    const nombre = document.getElementById("nombre-producto-mobile");
    const precio = document.getElementById("precio-producto-mobile");
    const stock = document.getElementById("stock-producto-mobile");
    nombre.value = datosOriginales.nombre;
    precio.value = datosOriginales.precio;
    stock.value = datosOriginales.stock;
    // Restablecer los botones
    resetBotonesProducto(null, id, true);
  }
  
}

function cancelarServicio(id, fila, mobile) {
  const datosOriginales = datosServicios.find((s) => s.id === id);
  if (!mobile){
    fila.querySelector("#nombreServicio").textContent =
    datosOriginales.nombre_servicio;
    fila.querySelector("#precio").textContent = "$ " + datosOriginales.precio;

    resetBotonesServicio(fila, id, mobile);
  }else{
    const nombre = document.getElementById("nombre-servicio-mobile");
    const precio = document.getElementById("precio-servicio-mobile");
    nombre.value = datosOriginales.nombre;
    precio.value = datosOriginales.precio;
    // Restablecer los botones
    resetBotonesServicio(null, id, mobile);
  }
  
}

function resetBotonesCliente(fila, id, mobile) {
  if (!mobile){
    let btnEditarCliente = fila.querySelector(".btn-editar");
    btnEditarCliente.textContent = "Editar";
    btnEditarCliente.onclick = function () {
      editarClienteDesktop(id);
    };
  
    let btnEliminarCliente = fila.querySelector(".btn-eliminar");
    btnEliminarCliente.textContent = "Eliminar";
    btnEliminarCliente.onclick = function () {
      eliminarCliente(id);
    };
  
    // Hacer que las celdas de la fila no sean editables
    fila.querySelectorAll('td[contenteditable="true"]').forEach((td) => {
      td.contentEditable = "false";
    });
  } else{
    let btnEditar = document.getElementById("btn-editar-cliente-mobile");
    btnEditar.textContent = "Editar";
    btnEditar.onclick = function () {
      editarClienteMobile(id);
    };
    let btnEliminarCliente = document.getElementById("btn-eliminar-cliente-mobile");
    btnEliminarCliente.textContent = "Eliminar";
    btnEliminarCliente.onclick = function () {
      eliminarCliente(id);
    };
  }
  
}

// funcion para poner en mayuscula la primer letra, se utilizara en cliente, productos y servicios
function capitalizarPrimeraLetra(cadena) {
  if (!cadena) return cadena;
  return cadena.charAt(0).toUpperCase() + cadena.slice(1);
}


function capitalizarTodasLasPalabras(cadena) {
  if (!cadena) return cadena;
  
  return cadena.split(' ').map(palabra => {
    return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
  }).join(' ');
}

// --------------- selector tablas ----------------
function selectorCantidadProductos(inicio) {
  let numberOfRowsToShow; 
  if (inicio){
    numberOfRowsToShow = 5;
  } else{
    numberOfRowsToShow = parseInt(document.getElementById("rows-selector-productos").value, 10);
  }

  const tablaProductos = document.getElementById("product-table-body");
  const productoDiv = document.getElementById('table-productos-container-mobile');

  // Limpiar la tabla y el contenedor móvil
  tablaProductos.innerHTML = "";
  productoDiv.innerHTML = "";

  // Mostrar las filas seleccionadas en la tabla
  if (datosProductos && datosProductos.length > 0) {
    datosProductos.slice(0, numberOfRowsToShow).forEach((product) => {
      let colorStock = getColorPorStock(product.stock);

      tablaProductos.innerHTML += `
        <tr id="producto-${product.id}">
          <td style="background-color: #a1a1a1;" id="nombreProducto" contenteditable="false">${product.nombre_producto}</td>
          <td class="text-end" style="background-color: #a1a1a1;" id="precioProducto" contenteditable="false">$ ${product.precio}</td>
          <td class="text-center" id="stockProducto" contenteditable="false" style="color: ${colorStock}; font-weight: bold; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6); background-color: #a1a1a1;">${product.stock}</td>
          <td style="background-color: #a1a1a1" colspan="2" class="text-center">
            <div style="background-color: #a1a1a1;" class="btn-group" role="group" aria-label="Acciones">
              <button class="btn btn-primary btn-sm btn-editar me-2" onclick="editarProductoDesktop(${product.id})">Editar</button>
              <button class="btn btn-danger btn-sm btn-eliminar" onclick="eliminarProducto(${product.id})">Eliminar</button>
            </div>
          </td>
        </tr>
        <div id="table-productos-container-mobile" class="producto-mobile"></div>
      `;

        // Ocultar o mostrar la columna de acciones
        const columnasAcciones = tablaProductos.querySelectorAll(
          "th:last-child, td:last-child"
        );
        columnasAcciones.forEach((columna) => {
          columna.style.display = inicio ? "none" : "";
        });

      productoDiv.innerHTML += `
        <div id="nombre-producto-mobile">
          <strong>Nombre:</strong> ${product.nombre_producto}
        </div>
        <div id="precio-producto-mobile">
          <strong>Precio:</strong> $ ${product.precio}
        </div>
        <div id="stock-producto-mobile">
          <strong>Stock:</strong>
          <span style="color: ${colorStock}; font-weight: bold; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);">${product.stock}</span>
        </div>
        <div class="btn-group" role="group" aria-label="Acciones">
          <button id="btn-editar-producto-mobile" class="btn btn-primary btn-sm btn-editar me-2" onclick="editarProductoMobile(${product.id})">Editar</button>
          <button id="btn-eliminar-producto-mobile" class="btn btn-danger btn-sm btn-eliminar" onclick="eliminarProducto(${product.id})">Eliminar</button>
        </div>
      `;
    });
  } else {
    tablaProductos.innerHTML = '<tr><td style="background-color: #a1a1a1;" colspan="4">No hay productos</td></tr>';
    productoDiv.innerHTML = `<div style= colspan="3">No hay productos registrados.</div>`;
  }
  
  // ocular botones mobile
  const botonesAcciones = productoDiv.querySelectorAll(
    ".btn-editar, .btn-eliminar"
  );
  botonesAcciones.forEach((boton) => {
    boton.style.display = inicio ? "none" : "";
  });

  mostrarTabla("tabla-productos", inicio);
}

  function selectorCantidadClientes(inicio){
  const numberOfRowsToShow = parseInt(document.getElementById("rows-selector-clientes").value, 10);
  const tablaClientes = document.getElementById("table-body-clientes");
  const clienteDiv = document.getElementById('table-clientes-container-mobile');
  // limpiar la tabla y el contenedor movil
  tablaClientes.innerHTML = "";
  clienteDiv.innerHTML = "";

  // Mostrar las filas seleccionadas en la tabla
  if (datosClientes && datosClientes.length > 0) {
    datosClientes.slice(0, numberOfRowsToShow).forEach((client) => {

      tablaClientes.innerHTML += `
        <tr id="cliente-${client.id}">
          <td style="background-color: #a1a1a1;" id="nombre" contenteditable="false">${client.nombre_cliente}</td>
          <td class="text-center" style="background-color: #a1a1a1;" id="direccion" contenteditable="false">${client.direccion}</td>
          <td class="text-center" style="background-color: #a1a1a1;" id="telefono" contenteditable="false">${client.telefono}</td>
          <td class="text-center" style="background-color: #a1a1a1;" id="correo" contenteditable="false">${client.correo_electronico}</td>
          <td class="text-center" style="background-color: #a1a1a1;" id="dni" contenteditable="false">${client.dni}</td>
          <td style="background-color: #a1a1a1" colspan="2" class="text-center">
            <div style="background-color: #a1a1a1;" class="btn-group" role="group" aria-label="Acciones">
              <button class="btn btn-primary btn-sm btn-editar me-2" onclick="editarClienteDesktop(${client.id})">Editar</button>
              <button class="btn btn-danger btn-sm btn-eliminar" onclick="eliminarCliente(${client.id})">Eliminar</button>
            </div>
          </td>
        </tr>
      `;

      // ocultar o mostrar la columna acciones
      const columnasAcciones = tablaClientes.querySelectorAll(
        "th:last-child, td:last-child"
      );
      columnasAcciones.forEach((columna) => {
        columna.style.display = inicio ? "none" : ""
      });

    
      clienteDiv.innerHTML += `
        <div id="nombre-mobile" contenteditable="false"><strong>Nombre:</strong> ${client.nombre_cliente}</div>
      <div id="dni-mobile" contenteditable="false"><strong>DNI:</strong> ${client.dni}</div>
      <div id="direccion-mobile" contenteditable="false"><strong>Domicilio:</strong> ${client.direccion}</div>
      <div id="telefono-mobile" contenteditable="false"><strong>Teléfono:</strong> ${client.telefono}</div>
      <div id="correo-mobile" contenteditable="false"><strong>Correo Electrónico:</strong> ${client.correo_electronico}</div>
      <div class="btn-group" role="group" aria-label="Acciones">
        <button id="btn-editar-cliente-mobile" class="btn btn-primary btn-sm btn-editar me-2" onclick="editarClienteMobile(${client.id})">Editar</button>
        <button id="btn-eliminar-cliente-mobile" class="btn btn-danger btn-sm btn-eliminar" onclick="eliminarCliente(${client.id})">Eliminar</button>
      </div>
      `;
    });
    } else {
      tablaClientes.innerHTML = '<tr><td style="background-color: #a1a1a1;" colspan="6">No hay clientes</td></tr>';
      clienteDiv.innerHTML = `<div style= colspan="6">No hay clientes registrados.</div>`;
    }

    // tabla servicios
    // ocular botones mobile
    const botonesAcciones = clienteDiv.querySelectorAll(
      ".btn-editar, .btn-eliminar"
    );
    botonesAcciones.forEach((boton) => {
      boton.style.display = inicio ? "none" : "";
    });
    
    mostrarTabla("tabla-clientes", inicio);

  }

  function selectorCantidadServicios(inicio){
    let numberOfRowsToShow; 
    if (inicio){
      numberOfRowsToShow = 5;
    } else{
      numberOfRowsToShow = parseInt(document.getElementById("rows-selector-servicios").value, 10);
    }

    const tablaServicios = document.getElementById("service-table-body");
    const servicioDiv = document.getElementById('table-servicios-container-mobile');

    // limpiar la tabla y el contenedor movil
    tablaServicios.innerHTML = "";
    servicioDiv.innerHTML = "";

     // Mostrar las filas seleccionadas en la tabla
    if (datosServicios && datosServicios.length > 0) {
      datosServicios.slice(0, numberOfRowsToShow).forEach((servicio) => {
        
        tablaServicios.innerHTML += `
          <tr id="servicio-${servicio.id}">
            <td style="background-color: #a1a1a1;" id="nombreServicio" contenteditable="false">${servicio.nombre_servicio}</td>
            <td style="background-color: #a1a1a1;" id="precio" contenteditable="false">${servicio.precio}</td>
            <td style="background-color: #a1a1a1" colspan="2" class="text-center">
              <div style="background-color: #a1a1a1;" class="btn-group" role="group" aria-label="Acciones">
                <button class="btn btn-primary btn-sm btn-editar me-2" onclick="editarServicioDesktop(${servicio.id})">Editar</button>
                <button class="btn btn-danger btn-sm btn-eliminar" onclick="eliminarServicio(${servicio.id})">Eliminar</button>
              </div>
            </td>
          </tr>
          <div id="table-servicios-container-mobile" class="servicio-mobile"></div>
        `;
        
        // ocultar o mostrar la columna acciones
        const columnasAcciones = tablaServicios.querySelectorAll(
          "th:last-child, td:last-child"
        );
        columnasAcciones.forEach((columna) => {
          columna.style.display = inicio ? "none" : ""
        });

        servicioDiv.innerHTML += `
          <div id="nombre-servicio-mobile">
            <strong>Nombre:</strong> ${servicio.nombre_servicio}
          </div>
          <div id="precio-servicio-mobile">
            <strong>Precio:</strong>$ ${servicio.precio}
          </div>
          <div class="btn-group" role="group" aria-label="Acciones">
            <button id="btn-editar-servicio-mobile" class="btn btn-primary btn-sm btn-editar me-2" onclick="editarServicioMobile(${servicio.id})">Editar</button>
            <button id="btn-eliminar-servicio-mobile" class="btn btn-danger btn-sm btn-eliminar" onclick="eliminarServicio(${servicio.id})">Eliminar</button>
          </div>
        `;
        });
    }else{
      tablaServicios.innerHTML = '<tr><td style="background-color: #a1a1a1;" colspan="4">No hay Servicios</td></tr>';
      servicioDiv.innerHTML = `<div style= colspan="3">No hay Servicios registrados.</div>`;
    }

    // ocultar botones mobile
    const botonesAcciones = servicioDiv.querySelectorAll(
      ".btn-editar, .btn-eliminar"
    );
    botonesAcciones.forEach((boton) => {
      boton.style.display = inicio ? "none" : "";
    });

    mostrarTabla("tabla-servicios", inicio);
  }
  

// --------------------- TABLA DE CLIENTES ----------------------
// Modifica la función para aceptar el parámetro id_user
async function tablaClientes(inicio, login) {
  let tablaClientes = document.getElementById("tabla-clientes");
  tablaClientes.innerHTML = "";
  tablaClientes.innerHTML = `
    <h2 class="titulo-tablas">Tabla Clientes</h2> 
    <div class="d-flex justify-content-between align-items-center">
    <div class="rows-selector-container">
    <select id="rows-selector-clientes" class="form-select" onchange="selectorCantidadClientes(${inicio})">
      <option value="5">Mostrar 5 filas</option>
      <option value="10">Mostrar 10 filas</option>
      <option value="15">Mostrar 15 filas</option>
      <option value="20">Mostrar 20 filas</option>
    </select>
    </div>
    <div class="search-container">
      <input
        type="text"
        id="searchClient"
        class="form-control my-2"
        placeholder="Nombre Cliente"
        style="max-width: 200px; margin-right: 5px;" 
      />
        <button id="searchButton" class="btn" onclick="buscarCliente()"> 
          <ion-icon name="search-outline"></ion-icon>
        </button>
      </div>
    </div>
    </div>
    <div id="table-clientes-container" class="container h-100">
      <table id="tabla-desktop" class="table table-hover">
    
        <thead>
          <tr>
            <th class= "text-start" style="background-color: #a1a1a1;" scope="col">Nombre</th>
            <th class= "text-start" style="background-color: #a1a1a1;" scope="col">Direccion</th>
            <th class= "text-start" style="background-color: #a1a1a1;" scope="col">Telefono</th>
            <th class= "text-center" style="background-color: #a1a1a1;" scope="col">Correo</th>
            <th class= "text-center" style="background-color: #a1a1a1;" scope="col">Dni</th>
            <th style="background-color: #a1a1a1;" scope="col" colspan="2" class="text-center" id="acciones">Acciones</th> 
          </tr>
        </thead>
        <tbody id="table-body-clientes">
          <!-- Contenido de la tabla de clientes -->
        </tbody>
      </table>
      <div id="mobile-view">
      <div id="table-clientes-container-mobile" class="servicio-mobile"></div>
    </div>  
    </div>
  `;
  let tablaBody = document.getElementById("table-body-clientes");
  tablaBody.innerHTML = ""; // Limpia el contenido existente

  if (login || datosHanCambiado(datosClientes,ultimosDatosClientes)){
    try {
      const response = await fetch(
        `http://127.0.0.1:5200/user/${localStorage.getItem("userid")}/client`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": localStorage.getItem("token"),
            "user-id": localStorage.getItem("userid"),
          },
        }
      );
  
      const data = await response.json();
  
      datosClientes = data;
    }
    catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  }

  const tablaClientesConteiner = document.getElementById(
    "table-clientes-container"
  );

  // Estructura alternativa para móviles
  let clienteDiv = document.getElementById("table-clientes-container-mobile");
  clienteDiv.innerHTML = "";

  if (datosClientes && datosClientes.length > 0) {
    datosClientes.forEach((cliente) => {
      tablaBody.innerHTML += `
      <tr id="cliente-${cliente.id}">
        <td class= "text-center" style="background-color: #a1a1a1;" id="nombre" contenteditable="false">${cliente.nombre_cliente}</td>
        <td class= "text-center" style="background-color: #a1a1a1;" id="direccion" contenteditable="false">${cliente.direccion}</td>
        <td class= "text-center" style="background-color: #a1a1a1;"  id="telefono" contenteditable="false">${cliente.telefono}</td>
        <td class= "text-center" style="background-color: #a1a1a1;" id="correo" contenteditable="false">${cliente.correo_electronico}</td>
        <td class= "text-center" style="background-color: #a1a1a1;" id="dni" contenteditable="false">${cliente.dni}</td>
        <td style="background-color: #a1a1a1;" colspan="2" style="width: auto; padding: 0.5rem;" class= "text-center">
          <div style="background-color: #a1a1a1;" class="btn-group" role="group" aria-label="Acciones">
            <button class="btn btn-primary btn-sm btn-editar me-2" onclick="editarClienteDesktop(${cliente.id})">Editar</button>
            <button class="btn btn-danger btn-sm btn-eliminar" onclick="eliminarCliente(${cliente.id})">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
    // Ocultar o mostrar la columna de acciones
    const columnasAcciones = tablaClientes.querySelectorAll(
      "th:last-child, td:last-child"
    );
    columnasAcciones.forEach((columna) => {
      columna.style.display = inicio ? "none" : "";
    });

    clienteDiv.innerHTML = `
      <div id="nombre" contenteditable="false"><strong>Nombre:</strong> ${cliente.nombre_cliente}</div>
      <div id="dni" contenteditable="false"><strong>DNI:</strong> ${cliente.dni}</div>
      <div id="direccion" contenteditable="false"><strong>Domicilio:</strong> ${cliente.direccion}</div>
      <div id="telefono" contenteditable="false"><strong>Teléfono:</strong> ${cliente.telefono}</div>
      <div id="correo" contenteditable="false"><strong>Correo Electrónico:</strong> ${cliente.correo_electronico}</div>
      <div id="botones-mobile" class="btn-group" role="group" aria-label="Acciones">
        <button id="btn-editar-cliente-mobile" class="btn btn-primary btn-sm btn-editar me-2" onclick="editarClienteMobile(${cliente.id})">Editar</button>
        <button id="btn-eliminar-cliente-mobile"class="btn btn-danger btn-sm btn-eliminar" onclick="eliminarCliente(${cliente.id})">Eliminar</button>
      </div>
    `;

    });
  } else {
    tablaBody.innerHTML =
      '<tr><td style="background-color: #a1a1a1;"  colspan="6">No hay clientes disponibles</td></tr>';
    clienteDiv.innerHTML = `<div style= colspan="6">No hay clientes registrados.</div> `;
  }

  // ocultar botones en mobile
  const botonesAcciones = tablaClientes.querySelectorAll(
    ".btn-editar, .btn-eliminar"
  );
  botonesAcciones.forEach((boton) => {
    boton.style.display = inicio ? "none" : "";
  })

  const buttonAgregar = document.createElement("button");
  buttonAgregar.classList.add("btn", "btn-primary", "btn-agregar");
  buttonAgregar.textContent = "Añadir";
  buttonAgregar.onclick = function () {
    agregarCliente(datosClientes.length);
  }
  tablaClientesConteiner.appendChild(buttonAgregar);

  selectorCantidadClientes(inicio);
  mostrarTabla("tabla-clientes", inicio);
}


function buscarCliente() {
  const clientName = document.getElementById("searchClient").value;
  const clientTable = document.getElementById("table-body-clientes");
  clientTable.innerHTML = "";
  try{
    datosClientes.forEach((client) => {
      if (client.nombre_cliente.toLowerCase().includes(clientName.toLowerCase())) {
        clienteEncontrado = true;
        clientTable.innerHTML += `
        <tr id="cliente-${client.id}">
          <td style="background-color: #a1a1a1;" id="nombre-mobile" contenteditable="false">${client.nombre_cliente}</td>
          <td style="background-color: #a1a1a1;" class="columna-ocultable" id="direccion-mobile" contenteditable="false">${client.direccion}</td>
          <td style="background-color: #a1a1a1;" class="columna-ocultable" id="telefono-mobile" contenteditable="false">${client.telefono}</td>
          <td style="background-color: #a1a1a1;" class="columna-ocultable" id="correo-mobile" contenteditable="false">${client.correo_electronico}</td>
          <td style="background-color: #a1a1a1;" id="dni" contenteditable="false">${client.dni}</td>
          <td style="background-color: #a1a1a1;" colspan="2" style="width: auto; padding: 0.5rem;" class= "text-center">
            <div style="background-color: #a1a1a1;" class="btn-group" role="group" aria-label="Acciones">
              <button id="btn-editar-cliente-mobile" class="btn btn-primary btn-sm btn-editar me-2" onclick="editarClienteMobile(${client.id})">Editar</button>
              <button id="btn-eliminar-cliente-mobile" class="btn btn-danger btn-sm btn-eliminar" onclick="eliminarCliente(${client.id})">Eliminar</button>
            </div>
          </td>
        </tr>
      `;
      }
    });
  }
  catch{
    Swal.fire({
      icon: 'error',
      title: 'El cliente no existe',
      text: 'No se encontro el cliente',
    });
    return;
  }
}

function editarClienteDesktop(idCliente) {
  let fila = document.getElementById(`cliente-${idCliente}`);

  document.getElementById('dni').addEventListener('input', function(e) {
    const valor = e.target.innerText;
    if (!/^\d{0,8}$/.test(valor)) {
        // Si la entrada no es válida, restablece el valor a solo dígitos o recorta a 8 dígitos
        e.target.innerText = valor.substring(0, 8).replace(/[^0-9]/g, '');
    }
});

  // Cambiar el texto y la función de los botones
  let btnEditar = fila.querySelector(".btn-editar");
  btnEditar.textContent = "Guardar";
  btnEditar.onclick = function () {
    guardarCliente(idCliente, false);
  };
  let btnEliminarCliente = fila.querySelector(".btn-eliminar");
  btnEliminarCliente.textContent = "Cancelar";
  btnEliminarCliente.onclick = function () {
    cancelarCliente(idCliente, fila, false);
  };

  // Hacer que las celdas de la fila sean editables
  fila.querySelectorAll('td[contenteditable="false"]').forEach((td) => {
    td.contentEditable = "true";
  });
}

  function editarClienteMobile(idCliente){
    
  let nombreElemento = document.getElementById(`nombre-mobile`);
  let dniElemento = document.getElementById(`dni-mobile`);
  let direccionElemento = document.getElementById(`direccion-mobile`);
  let telefonoElemento = document.getElementById(`telefono-mobile`);
  let correoElemento = document.getElementById(`correo-mobile`);

  document.getElementById('dni-mobile').addEventListener('input', function(e) {
    const valor = e.target.innerText;
    if (!/^\d{0,8}$/.test(valor)) {
        // Si la entrada no es válida, restablece el valor a solo dígitos o recorta a 8 dígitos
        e.target.innerText = valor.substring(0, 8).replace(/[^0-9]/g, '');
    }
});
    
  nombreElemento.contentEditable = "true";
  dniElemento.contentEditable = "true";
  direccionElemento.contentEditable = "true";
  telefonoElemento.contentEditable = "true";
  correoElemento.contentEditable = "true";

  let btnEditar = document.getElementById("btn-editar-cliente-mobile");
  btnEditar.textContent = "Guardar";
  btnEditar.onclick = function () {
    guardarCliente(idCliente, true);
  };
  let btnEliminarCliente = document.getElementById("btn-eliminar-cliente-mobile");
  btnEliminarCliente.textContent = "Cancelar";
  btnEliminarCliente.onclick = function () {
    cancelarCliente(idCliente, null, true);
  };

}

function obtenerValorDespuesDeDosPuntos(texto) {
  return texto.split(':')[1].trim(); // Divide el texto por ':' y retorna la parte después del ':', eliminando espacios en blanco al principio y al final
}

function guardarCliente(idCliente, mobile) {
  let cliente;
  let fila = "";

  if (!mobile){
    fila = document.getElementById(`cliente-${idCliente}`);
    // Obtener los valores de las celdas de la fila
    cliente = {
      nombre_cliente: capitalizarTodasLasPalabras(fila.querySelector("#nombre").textContent), // Asegúrate de que estas clases correspondan a las celdas de tu fila
      direccion: fila.querySelector("#direccion").textContent,
      telefono: fila.querySelector("#telefono").textContent,
      correo_electronico: fila.querySelector("#correo").textContent,
      dni: fila.querySelector("#dni").textContent,
    };
  }
  else{
    cliente = {
      nombre_cliente: capitalizarTodasLasPalabras(obtenerValorDespuesDeDosPuntos(document.getElementById(`nombre-mobile`).textContent)),
      direccion: obtenerValorDespuesDeDosPuntos(document.getElementById(`direccion-mobile`).textContent),
      telefono: obtenerValorDespuesDeDosPuntos(document.getElementById(`telefono-mobile`).textContent),
      correo_electronico: obtenerValorDespuesDeDosPuntos(document.getElementById(`correo-mobile`).textContent),
      dni: document.getElementById(`dni-mobile`).textContent,
    }
  }

  // Utiliza la ruta /user/<int:id_user>/client en lugar de la URL completa
  fetch(
    `http://127.0.0.1:5200/user/${localStorage.getItem(
      "userid"
    )}/client/${idCliente}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("token"), // Asegúrate de que el token JWT sea válido
        "user-id": localStorage.getItem("userid"), // Asegúrate de que el ID de usuario sea correcto
      },
      body: JSON.stringify(cliente),
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // Si la respuesta es exitosa, muestra el SweetAlert
      Swal.fire({
        title: "¡Cliente actualizado exitosamente!",
        text: `Los datos del cliente ${cliente.nombre_cliente} han sido actualizados.`,
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      datosClientes.forEach((client) => {
        if (client.id === idCliente) {
          let clienteActualizado = {
            id: client.id,
            nombre: cliente.nombre_cliente,
            direccion: cliente.direccion,
            telefono: cliente.telefono,
            correo_electronico: cliente.correo_electronico,
            dni: cliente.dni,
          }
          datosClientes[datosClientes.indexOf(client)] = clienteActualizado;
        }
      })
      if (mobile) {
        document.getElementById("nombre-mobile").contentEditable = "false";
        document.getElementById("direccion-mobile").contentEditable = "false";
        document.getElementById("telefono-mobile").contentEditable = "false";
        document.getElementById("correo-mobile").contentEditable = "false";
        document.getElementById("dni-mobile").contentEditable = "false";
      }
      // Después de guardar, restablecer los botones
      resetBotonesCliente(fila, idCliente, mobile);
      tablaClientes(false, false);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function crearCliente(cliente) {
  fetch(`http://127.0.0.1:5200/user/${localStorage.getItem("userid")}/client`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": localStorage.getItem("token"), // Reemplaza TOKEN_AQUI con el token JWT válido
      "user-id": localStorage.getItem("userid"), // Reemplaza con el ID de usuario correcto
    },
    body: JSON.stringify(cliente),
  })
    .then((response) => response.json())
    .then((data) => {
      let idCliente = data.id;
      let contenidoHtml = `
        <div><strong>Nombre:</strong> ${cliente.nombre_cliente}</div>
        <div><strong>Correo Electrónico:</strong> ${cliente.correo_electronico}</div>
        <div><strong>DNI:</strong> ${cliente.dni}</div>
        <div><strong>Dirección:</strong> ${cliente.direccion}</div>
        <div><strong>Teléfono:</strong> ${cliente.telefono}</div>
      `;
      Swal.fire({
        title: "Cliente agregado exitosamente!",
        html: contenidoHtml,
        icon: "success",
        confirmButtonText: "OK",
      });
      let clienteConId = {
        id: idCliente,
        ...cliente
      }
      datosClientes[idCliente] = clienteConId; 
      document.getElementById("form-cliente-nombre").value = "";
      document.getElementById("form-cliente-email").value = "";
      document.getElementById("form-cliente-dni").value = "";
      document.getElementById("form-cliente-direccion").value = "";
      document.getElementById("form-cliente-telefono").value = "";
      document.getElementById("nuevo-cliente").remove();
      tablaClientes(false, false);
    })
    .catch((error) => {
      console.error("Error al crear el cliente:", error);
    });
}

function agregarCliente(cantClientes) {
  const secciónCliente = document.getElementById("tabla-clientes");
  if (document.getElementById("nuevo-cliente")) {
    document.getElementById("nuevo-cliente").remove();
  }
  const nuevoCliente = document.createElement("div");
  nuevoCliente.id = "nuevo-cliente";
  nuevoCliente.innerHTML = `
  <div id="modal-cliente" class="modal-factura">
  <div class="modal-content-factura">
    <span class="close-button" onclick="cerrarModal('cliente')">&times;</span>
    <h2>Nuevo Cliente</h2>
  <div class="container">
    <form id="nuevo-cliente-form">
      <div class="mb-3">
        <label for="nombre" class="form-label">Nombre</label>
        <input type="text" class="form-control" id="form-cliente-nombre" required>
      </div>
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input type="email" class="form-control" id="form-cliente-email" required>
      </div>
      <div class="mb-3">
        <label for="dni" class="form-label">DNI</label>
        <input type="text" class="form-control" id="form-cliente-dni" inputmode="numeric" required minlength="8" maxlength="8" pattern="\\d{8}">
      </div>
      <div class="mb-3">
        <label for="direccion" class="form-label">Dirección</label>
        <input type="text" class="form-control" id="form-cliente-direccion" required>
      </div>
      <div class="mb-3">
        <label for="telefono" class="form-label">Teléfono</label>
        <input type="number" class="form-control" id="form-cliente-telefono" required>
      </div>
    </form>
  </div>
  </div>
  </div>
  `;

  secciónCliente.appendChild(nuevoCliente);
  document.getElementById("modal-cliente").style.display = "block";
  const form = document.getElementById("nuevo-cliente-form");

  let button = document.createElement("button");
  button.type = "submit";
  button.className = "btn btn-primary";
  button.textContent = "Guardar";

  form.append(button);
  form.onsubmit = function (event) {
    event.preventDefault();

    let cliente = {
      nombre_cliente: capitalizarTodasLasPalabras(document.getElementById("form-cliente-nombre").value),
      correo_electronico: document.getElementById("form-cliente-email").value,
      dni: document.getElementById("form-cliente-dni").value,
      direccion: document.getElementById("form-cliente-direccion").value,
      telefono: document.getElementById("form-cliente-telefono").value,
    };

    // Validaciones
    const regexNombre = /^[a-zA-Z\s]+$/;
    const regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const regexDireccion = /^[0-9a-zA-Z\s,#.-]+$/;

    if (!regexNombre.test(cliente.nombre_cliente)) {
      Swal.fire({
        title: 'Error',
        text: 'El nombre debe contener solo letras y espacios.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!regexEmail.test(cliente.correo_electronico)) {
      Swal.fire({
        title: 'Error',
        text: 'Formato de correo electrónico no válido.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (isNaN(cliente.dni)) {
      Swal.fire({
        title: 'Error',
        text: 'El DNI debe contener solo números.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!regexDireccion.test(cliente.direccion)) {
      Swal.fire({
        title: 'Error',
        text: 'La dirección debe ser alfanumérica',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (isNaN(cliente.telefono)) {
      Swal.fire({
        title: 'Error',
        text: 'El Teléfono debe contener solo números.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (localStorage.getItem("plan") === "C") {
      if (cantClientes === 10) {
        Swal.fire({
          title: "Error",
          text: "Tu plan no permite agregar mas de 5 clientes.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }
    } else if (localStorage.getItem("plan") === "B") {
      if (cantClientes === 25) {
        Swal.fire({
          title: "Error",
          text: "Tu plan no permite agregar mas de 10 clientes.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }
    }
    crearCliente(cliente);
  };
}

function eliminarCliente(idCliente) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "No podrás revertir esto.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      try{
        fetch(
          `http://127.0.0.1:5200/user/${localStorage.getItem(
            "userid"
          )}/client/${idCliente}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": localStorage.getItem("token"), // Asegúrate de que el token JWT sea válido
              "user-id": localStorage.getItem("userid"), // Asegúrate de que el ID de usuario sea correcto
            },
          }
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            // Si la respuesta es exitosa, muestra el SweetAlert
            Swal.fire({
              title: "¡Cliente eliminado exitosamente!",
              text: `El cliente ha sido eliminado.`,
              icon: "success",
              confirmButtonText: "Aceptar",
            });
            document.getElementById(`cliente-${idCliente}`).remove();
            datosClientes.forEach((cliente) => {
              if (cliente.id === idCliente) {
                datosClientes.splice(datosClientes.indexOf(cliente), 1);
              }
            })
            tablaClientes(false,false);
          });
      }
      catch{
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el cliente.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }
      
    }
  });
}


// --------------- TABLA DE PRODUCTOS -------------------
// Función para obtener el color según el stock
function getColorPorStock(stock) {
  if (stock < 25) {
    return "red"; // Rojo para stock menor a 30
  } else if (stock >= 25 && stock <= 60) {
    return "#FFDD00"; // Amarillo para stock entre 30 y 60
  } else {
    return "#32CD32"; // Verde para stock mayor a 60
  }
}


// Función para cargar productos
async function tablaProductos(inicio, login) {
  let tablaProductos = document.getElementById("tabla-productos");
  tablaProductos.innerHTML = "";
  tablaProductos.innerHTML = `
  <h2 class="titulo-tablas">Productos</h2>
  <div class="d-flex justify-content-between align-items-center">
  <div class="rows-selector-container">
  <select id="rows-selector-productos" class="form-select" onchange="selectorCantidadProductos(${inicio})">
    <option value="5">Mostrar 5 filas</option>
    <option value="10">Mostrar 10 filas</option>
    <option value="15">Mostrar 15 filas</option>
    <option value="20">Mostrar 20 filas</option>
  </select>
  </div>
  <div class="search-container">
  <input
    type="text"
    id="searchProduct"
    class="form-control my-2"
    placeholder="Nombre Producto"
    style="max-width: 200px;"
    />
    <button id="searchButton" class="btn" onclick="buscarProducto()">
      <ion-icon name="search-outline"></ion-icon>
    </button>
  </div>
  </div>
  </div>
  <div id="table-productos-container" class="container h-100">
    <table id="tabla-desktop" class="table text-center table-hover table-auto">
      <thead>
        <tr>
          <th style="background-color: #a1a1a1;">Nombre Producto</th>
          <th class= "text-end" style="background-color: #a1a1a1;">Precio</th>
          <th class= "text-center" style="background-color: #a1a1a1;">Stock</th>
          <th style="background-color: #a1a1a1;" id="acciones" scope="col" colspan="2" class="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody id="product-table-body">
        <!-- Contenido de la tabla de productos -->
      </tbody>
    </table>
    <div id="mobile-view">
    <div id="table-productos-container-mobile" class="producto-mobile"></div>
  </div>
  </div>
</div>
  `;
  
  const productTable = document.getElementById("product-table-body");
  productTable.innerHTML = "";

  if (login || datosHanCambiado(datosProductos, ultimosDatosProductos)){
    try {
      const response = await fetch(
        `http://127.0.0.1:5200/user/${localStorage.getItem("userid")}/product`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": localStorage.getItem("token"),
            "user-id": localStorage.getItem("userid"),
          },
        }
      );
  
      const data = await response.json();
  
      datosProductos = data;
    }
    catch (error) {
      console.error("Error al cargar productos:", error);
    }
  }
  
  const tablaProductosContainer = document.getElementById(
    "table-productos-container"
  );
    // Estructura alternativa para móviles
  let productoDiv = document.getElementById("table-productos-container-mobile");
  productoDiv.innerHTML = "";
  

  if (datosProductos && datosProductos.length > 0) {
    datosProductos.forEach((product) => {
      let colorStock = getColorPorStock(product.stock); // Aplica el color según el stock
      productTable.innerHTML += `
      <tr id="producto-${product.id}">
      <td style="background-color: #a1a1a1;" id="nombreProducto" contenteditable="false">${product.nombre_producto}</td>
      <td class= "text-end" style="background-color: #a1a1a1;" id="precioProducto" contenteditable="false">$ ${product.precio}</td>
      <td class= "text-center" id="stockProducto" contenteditable="false" style="color: ${colorStock}; font-weight: bold; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6); background-color: #a1a1a1;">${product.stock}</td>
      <td style="background-color: #a1a1a1;" colspan="2" class= "text-center">
        <div style="background-color: #a1a1a1;" class="btn-group" role="group" aria-label="Acciones">
          <button class="btn btn-primary btn-sm btn-editar me-2" onclick="editarProductoDesktop(${product.id})">Editar</button>
          <button class="btn btn-danger btn-sm btn-eliminar" onclick="eliminarProducto(${product.id})">Eliminar</button>
        </div>
      </td>
    </tr>
    `;
      // Ocultar o mostrar la columna de acciones
      const columnasAcciones = tablaProductos.querySelectorAll(
        "th:last-child, td:last-child"
      );
      columnasAcciones.forEach((columna) => {
        columna.style.display = inicio ? "none" : "";
      });
      
      productoDiv.innerHTML = `
      <div id="nombre-producto-mobile"><strong>Nombre:</strong> ${product.nombre_producto}</div>
      <div id="precio-producto-mobile"><strong>Precio:</strong> $ ${product.precio}</div>
      <div id="stock-producto-mobile"><strong>Stock:</strong> <span style="color: ${colorStock}; font-weight: bold; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);">${product.stock}</span></div>
      <div class="btn-group" role="group" aria-label="Acciones">
        <button id="btn-editar-producto-mobile" class="btn btn-primary btn-sm btn-editar me-2" onclick="editarProductoMobile(${product.id})">Editar</button>
        <button id="btn-eliminar-producto-mobile" class="btn btn-danger btn-sm btn-eliminar" onclick="eliminarProducto(${product.id})">Eliminar</button>
      </div>
      `;

    });
  } else {
    productTable.innerHTML =
      '<tr><td style="background-color: #a1a1a1;" colspan="4">No hay productos</td></tr>';
    productoDiv.innerHTML = `<div style= colspan="3">No hay productos registrados.</div> `;
  }

  // ocultar botones en mobile
  const botonesAcciones = tablaProductos.querySelectorAll(
    ".btn-editar, .btn-eliminar"
  );
  botonesAcciones.forEach((boton) => {
    boton.style.display = inicio ? "none" : "";
  })

  const buttonAgregar = document.createElement("button");
  buttonAgregar.classList.add("btn", "btn-primary", "btn-agregar");
  buttonAgregar.onclick = function () {
    agregarProducto(datosProductos.length);
  }
  buttonAgregar.textContent = "Añadir";
  tablaProductosContainer.appendChild(buttonAgregar);
    
  // Mostrar inicialmente solo 5 elementos
  selectorCantidadProductos(inicio);
  mostrarTabla("tabla-productos", inicio);
}

function buscarProducto() {
  const productName = document.getElementById("searchProduct").value;
  const productTable = document.getElementById("product-table-body");
  productTable.innerHTML = "";
  try{
    datosProductos.forEach((product) => {
      if (product.nombre_producto.toLowerCase().includes(productName.toLowerCase())) {
        let colorStock = getColorPorStock(product.stock); // Aplica el color según el stock
        productTable.innerHTML += `
            <tr>
              <td style="background-color: #a1a1a1;">${product.nombre_producto}</td>
              <td style="background-color: #a1a1a1;">$ ${product.precio}</td>
              <td style="background-color: #a1a1a1; color: ${colorStock}; font-weight: bold; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);">${product.stock}</td>
              <td style="background-color: #a1a1a1;" colspan="2" style="width: auto; padding: 0.5rem;" class= "text-center">
                <div class="btn-group" role="group" aria-label="Acciones">
                  <button id="btn-editar-producto-mobile class="btn btn-primary btn-sm btn-editar me-2" onclick="editarProductoDesktop(${product.id})">Editar</button>
                  <button id="btn-eliminar-producto-mobile" class="btn btn-danger btn-sm btn-eliminar" onclick="eliminarProducto(${product.id})">Eliminar</button>
                </div>
              </td>
            </tr>
          `;
      }
    }); 
  }
  catch {
    Swal.fire({
      icon: 'error',
      title: 'El producto no existe',
      text: 'No se encontró el producto',
    });
    return;
  }
}

//------------- crear Producto ------------------
function crearProducto(producto) {
  try{
    fetch(
      `http://127.0.0.1:5200/user/${localStorage.getItem("userid")}/product`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem("token"), // Reemplaza TOKEN_AQUI con el token JWT válido
          "user-id": localStorage.getItem("userid"), // Reemplaza con el ID de usuario correcto
        },
        body: JSON.stringify(producto),
      }
    )
    .then((response) => response.json())
    .then((data) => {
      let contenidoHtml = `
        <div><strong>Nombre:</strong> ${producto.nombre_producto}</div>
        <div><strong>Precio:</strong>$ ${producto.precio}</div>
        <div><strong>Stock:</strong> ${producto.stock}</div>
      `;
      Swal.fire({
        title: "Producto agregado exitosamente!",
        html: contenidoHtml,
        icon: "success",
        confirmButtonText: "OK",
      });
      let productoConId = {
        id: data.id,
        ...producto,
      }
      datosProductos.push(productoConId);
      document.getElementById("form-nombre-producto").value = "";
      document.getElementById("form-precio-producto").value = "";
      document.getElementById("form-stock-producto").value = "";
      document.getElementById("nuevo-producto").remove();
      tablaProductos(false);
    })
  }
  catch (error){
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo agregar el producto',
    });
  }
}



// ------------------ BOTONES EDITAR PRODUCTO --------------------


function resetBotonesProducto(fila, id, mobile) {
  if (!mobile){
    let btnEditarProducto = fila.querySelector(".btn-editar");
    btnEditarProducto.textContent = "Editar";
    btnEditarProducto.onclick = function () {
      editarProducto(id);
    };
  
    let btnEliminarProducto = fila.querySelector(".btn-eliminar");
    btnEliminarProducto.textContent = "Eliminar";
    btnEliminarProducto.onclick = function () {
      eliminarProducto(id);
    };
  
    // Hacer que las celdas de la fila no sean editables
    fila.querySelectorAll('td[contenteditable="true"]').forEach((td) => {
      td.contentEditable = "false";
    });
  } else{
    let btnEditarProducto = document.getElementById("btn-editar-producto-mobile");
    btnEditarProducto.textContent = "Editar";
    btnEditarProducto.onclick = function () {
      editarProductoMobile(id);
    };
  
    let btnEliminarProducto = document.getElementById("btn-eliminar-producto-mobile");
    btnEliminarProducto.textContent = "Eliminar";
    btnEliminarProducto.onclick = function () {
      eliminarProducto(id);
    };
  }
  
}

function resetBotonesServicio(fila, id, mobile) {
  if (!mobile){
    let btnEditarServicio = fila.querySelector(".btn-editar");
    btnEditarServicio.textContent = "Editar";
    btnEditarServicio.onclick = function () {
      editarServicioDesktop(id);
    };

    let btnEliminarServicio = fila.querySelector(".btn-eliminar");
    btnEliminarServicio.textContent = "Eliminar";
    btnEliminarServicio.onclick = function () {
      eliminarServicio(id);
    };

    // Hacer que las celdas de la fila no sean editables
    fila.querySelectorAll('td[contenteditable="true"]').forEach((td) => {
      td.contentEditable = "false";
    });
  } else{
    let btnEditarServicio = document.getElementById("btn-editar-servicio-mobile");
      btnEditarServicio.textContent = "Editar";
      btnEditarServicio.onclick = function () {
      editarServicioMobile(idServicio);
    };
    let btnEliminarServicio = document.getElementById("btn-eliminar-servicio-mobile");
    btnEliminarServicio.textContent = "Eliminar";
    btnEliminarServicio.onclick = function () {
      eliminarServicio(idServicio);
    };
  }
  
}

// ------------------  AGREGAR PRODUCTO --------------------
function agregarProducto(cantProductos) {
  const seccionProducto = document.getElementById("tabla-productos");
  if (document.getElementById("nuevo-producto")) {
    document.getElementById("nuevo-producto").remove();
  }
  const nuevoProducto = document.createElement("div");
  nuevoProducto.id = "nuevo-producto";
  nuevoProducto.innerHTML = `
  <div id="modal-producto" class="modal-factura">
  <div class="modal-content-factura">
    <span class="close-button" onclick="cerrarModal('producto')">&times;</span>
      <h2>Nuevo Producto</h2>
      <div class="container">
        <form id="nuevo-producto-form">
          <div class="mb-3">
            <label for="nombre" class="form-label">Nombre</label>
            <input type="text" class="form-control" id="form-nombre-producto" required>
          </div>
          <div class="mb-3">
            <label for="price" class="form-label">Precio</label>
            <input type="number" class="form-control" id="form-precio-producto" required>
          </div>
          <div class="mb-3">
            <label for="stock" class="form-label">Stock</label>
            <input type="number" class="form-control" id="form-stock-producto" required>
          </div>
        </form>
      </div>
  </div>
  </div>
  `;

  seccionProducto.appendChild(nuevoProducto);
  document.getElementById("modal-producto").style.display = "block";

  const form = document.getElementById("nuevo-producto-form");

  let button = document.createElement("button");
  button.type = "submit";
  button.className = "btn btn-primary";
  button.textContent = "Guardar";

  form.append(button);
  form.onsubmit = function (event) {
    event.preventDefault();

    let nombreProducto = document.getElementById("form-nombre-producto").value;
    let precioElemento = document.getElementById("form-precio-producto");
    let stock = parseInt(document.getElementById("form-stock-producto").value);

    let precioProducto = precioElemento.value.trim();
    // Elimina el signo '$' si está presente y toma solo el número
    if (precioProducto.startsWith("$")) {
      precioProducto = precioProducto.substring(1).trim();
    }

    // Convierte a número para realizar la validación
    precioProducto = parseFloat(precioProducto);

    // Validar el nombre del producto
    const regexNombreProducto = /^[a-zA-Z\s]+$/;
    if (!regexNombreProducto.test(nombreProducto)) {
      Swal.fire({
        title: 'Error',
        text: 'El nombre del producto debe contener solo letras y espacios.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Validar el precio
    if (isNaN(precioProducto) || precioProducto <= 0) {
      Swal.fire({
        title: 'Error',
        text: 'El precio del producto debe ser un número positivo.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Validar el stock
    if (isNaN(stock) || stock < 0) {
      Swal.fire({
        title: 'Error',
        text: 'El stock del producto debe ser un número entero no negativo.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Crear el objeto del producto
    let producto = {
      nombre_producto: capitalizarPrimeraLetra(nombreProducto),
      precio: precioProducto,
      stock: stock,
    };

    if (localStorage.getItem("plan") === "C") {
      if (cantProductos === 10) {
        Swal.fire({
          title: "Error",
          text: "Tu plan no permite agregar mas de 5 productos",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }
    } else if (localStorage.getItem("plan") === "B") {
      if (cantProductos === 25) {
        Swal.fire({
          title: "Error",
          text: "Tu plan no permite agregar mas de 10 productos",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }
    }
    crearProducto(producto);
  };
}
// ------------------   EDITAR PRODUCTO --------------------
function editarProductoDesktop(idProducto) {
  let fila = document.getElementById(`producto-${idProducto}`);

  // Cambiar el texto y la función de los botones
  let btnEditarProducto = fila.querySelector(".btn-editar");
  btnEditarProducto.textContent = "Guardar";
  btnEditarProducto.onclick = function () {
    // Obtener el precio actual desde el elemento correspondiente
    let precioElemento = fila.querySelector("#precioProducto");
    if (!precioElemento) {
      console.error("Elemento de precio no encontrado");
      return; // Salir de la función si el elemento no existe
    }
    let precioProducto = precioElemento.textContent.trim();
    // Elimina el signo '$' si está presente y toma solo el número
    if (precioProducto.startsWith("$")) {
      precioProducto = precioProducto.substring(1).trim();
    }

    // Validar el precio
    if (!validarPrecio(precioProducto)) {
      Swal.fire({
        title: "Error",
        text: "Formato de precio no valido. ($ precio o precio)",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    // Aquí puedes añadir el signo '$' de nuevo si es necesario
    precioProducto = "$ " + precioProducto;

    guardarProducto(idProducto,false);
  };

  let btnEliminarProducto = fila.querySelector(".btn-eliminar");
  btnEliminarProducto.textContent = "Cancelar";
  btnEliminarProducto.onclick = function () {
    cancelarProducto(idProducto, fila, false);
  };

  // Hacer que las celdas de la fila sean editables
  fila.querySelectorAll('td[contenteditable="false"]').forEach((td) => {
    td.contentEditable = "true";
  });
}

function editarProductoMobile(idProducto){
  
  let nombreProduct = document.getElementById(`nombre-producto-mobile`);
  let precioProduct = document.getElementById(`precio-producto-mobile`);
  let stockProduct = document.getElementById(`stock-producto-mobile`);

  nombreProduct.contentEditable = "true";
  precioProduct.contentEditable = "true";
  stockProduct.contentEditable = "true";

  let btnEditarProducto = document.getElementById(`btn-editar-producto-mobile`);
  btnEditarProducto.textContent = "Guardar";
  btnEditarProducto.onclick = function () {
    // Obtener el precio actual desde el elemento correspondiente
    if (!precioProduct) {
      console.error("Elemento de precio no encontrado");
      return; // Salir de la función si el elemento no existe
    }
    let precioProducto =obtenerValorDespuesDeDosPuntos(precioProduct.textContent.trim());
    // Elimina el signo '$' si está presente y toma solo el número
    if (precioProducto.startsWith("$")) {
      precioProducto = precioProducto.substring(1).trim();
    }

    // Validar el precio
    if (!validarPrecio(precioProducto)) {
      Swal.fire({
        title: "Error",
        text: "Formato de precio no valido. ($ precio o precio)",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    // Aquí puedes añadir el signo '$' de nuevo si es necesario
    precioProducto = "$ " + precioProducto;

    guardarProducto(idProducto,true);
  };
  let btnEliminarProducto = document.getElementById(`btn-eliminar-producto-mobile`);
  btnEliminarProducto .textContent = "Cancelar";
  btnEliminarProducto .onclick = function () {
    cancelarProducto(idProducto, null, true);
  }
}


function validarPrecio(input) {
  // Asegura que el input sea una cadena de texto
  input = String(input).trim();

  // Verifica si el formato comienza con '$'
  if (input.startsWith("$")) {
    // Elimina el signo '$' y los espacios adicionales
    input = input.slice(1).trim();
  }

  // Intenta convertir la entrada a un número
  const numero = parseFloat(input);

  // Verifica si el número es negativo
  if (numero <= 0) {
    Swal.fire({
      title: "Error",
      text: "El precio no puede ser negativo ni 0.",
      icon: "error",
      confirmButtonText: "OK",
    });
    return false;
  }

  // Verifica si el número es un float válido y tiene hasta dos decimales
  if (!isNaN(numero) && numero.toString().match(/^\d*(\.\d{0,2})?$/)) {
    return true;
  } else {
    Swal.fire({
      title: "Error",
      text: "Formato de precio no valido. ($precio o precio)",
      icon: "error",
      confirmButtonText: "OK",
    });
    return false;
  }
}

// ------------------- GUARDAR PRODUCTO ---------------------
function guardarProducto(idProducto,mobile) {
  let nuevoProducto;
  let fila ="";

  if(!mobile){
    fila = document.getElementById(`producto-${idProducto}`);

    let precioElemento = fila.querySelector("#precio-producto");
    if (!precioElemento){
      console.error("Elemento de precio no encontrado");
      return; // Salir de la función si el elemento no existe
    }
    let precioProducto = precioElemento.textContent.trim();

    if (precioProducto.startsWith("$")){
      precioProducto = precioProducto.substring(1).trim();
    }
    nuevoProducto = {
      nombre_producto: capitalizarPrimeraLetra(fila.querySelector("#nombre-producto").textContent),
      precio: precioProducto,
      stock: fila.querySelector("#stock-producto").textContent,
    };
  }else{

    let precioElemento = document.getElementById("precio-producto-mobile");
    if (!precioElemento){
      console.error("Elemento de precio no encontrado");
      return; // Salir de la función si el elemento no existe
    }
    let precioProducto = obtenerValorDespuesDeDosPuntos(precioElemento.textContent.trim()) ;

    if (precioProducto.startsWith("$")){
      precioProducto = precioProducto.substring(1).trim();
    }
    nuevoProducto = {
      nombre_producto: capitalizarPrimeraLetra(obtenerValorDespuesDeDosPuntos(document.getElementById(`nombre-producto-mobile`).textContent)),
      precio: precioProducto,
      stock: obtenerValorDespuesDeDosPuntos(document.getElementById(`stock-producto-mobile`).textContent),
    }
  }

  try{

    fetch(
      `http://127.0.0.1:5200/user/${localStorage.getItem(
        "userid"
      )}/product/${idProducto}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem("token"), // Reemplaza TOKEN_AQUI con el token JWT válido
          "user-id": localStorage.getItem("userid"), // Reemplaza con el ID de usuario correcto
        },
        body: JSON.stringify(nuevoProducto),
      }
    )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // Si la respuesta es exitosa, muestra el SweetAlert
      Swal.fire({
        title: "¡Producto actualizado exitosamente!",
        text: `El producto ${data.nombre_producto} ha sido actualizado.`,
        icon: "success",
      });
      datosProductos.forEach((producto) => {
        if (producto.id === idProducto) {
          productoActualizado = {
            id: idProducto,
            ...nuevoProducto,
          }
          datosProductos[datosProductos.indexOf(producto)] = productoActualizado;
        }
      })
      resetBotonesProducto(fila, idProducto, mobile);
      tablaProductos(false);
    })
  }
  catch(error){
    Swal.fire({
      title: "Error",
      text: "No se pudo actualizar el producto",
      icon: "error",
      confirmButtonText: "OK",
    });
    return;
  }
}

// ------------ ELIMINAR PRODUCTO ---------------------
function eliminarProducto(idProducto) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "No podrás revertir esto.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      try{
        fetch(
          `http://127.0.0.1:5200/user/${localStorage.getItem(
            "userid"
          )}/product/${idProducto}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": localStorage.getItem("token"), // Reemplaza TOKEN_AQUI con el token JWT válido
              "user-id": localStorage.getItem("userid"), // Reemplaza con el ID de usuario correcto
            },
          }
        )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          // Si la respuesta es exitosa, muestra el SweetAlert
          Swal.fire({
            title: "¡Producto eliminado exitosamente!",
            text: `El Producto ha sido eliminado.`,
            icon: "success",
            confirmButtonText: "Aceptar",
          });
          document.getElementById(`producto-${idProducto}`).remove();
          datosProductos.forEach((producto) => {
            if (producto.id === idProducto) {
              datosProductos.splice(datosProductos.indexOf(producto), 1);
            }
          })
          tablaProductos(false);
        });
    }
    catch(error){
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar el producto",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }
  
  }
  })


}

// tabla servicios
async function tablaServicios(inicio, login) {
  let tablaServicios = document.getElementById("tabla-servicios");
  tablaServicios.innerHTML = "";
  tablaServicios.innerHTML = `
    <h2 class="titulo-tablas">Tabla Servicios</h2> 
    <div class="d-flex justify-content-between align-items-center">
    <div class="rows-selector-container">
      <select id="rows-selector-servicios" class="form-select" onchange="selectorCantidadServicios(${inicio})">
        <option value="5">Mostrar 5 filas</option>
        <option value="10">Mostrar 10 filas</option>
        <option value="15">Mostrar 15 filas</option>
        <option value="20">Mostrar 20 filas</option>
      </select>
    </div>
    <div class="search-container">
      <input
        type="text"
        id="searchService"
        class="form-control my-2"
        placeholder="Nombre Servicio"
        style="max-width: 200px; margin-right: 5px;" 
      />
        <button id="searchButton" class="btn" onclick="buscarServicio()"> 
          <ion-icon name="search-outline"></ion-icon>
        </button>
      </div>
    </div>
    </div>
    <div id="table-servicios-container" class="container h-100">
      <table id="tabla-desktop" class="table text-center table-hover  table-auto">
      <thead>
        <tr>
          <th style="background-color: #a1a1a1;" class="text-center">Nombre de Servicio</th>
          <th style="background-color: #a1a1a1;" class="text-end">Precio</th>
          <th style="background-color: #a1a1a1;" id="acciones" scope="col" colspan="2" class="text-center">Acciones</th>
        </tr>
      </thead>
        <tbody id="service-table-body">
          <!-- Contenido de la tabla de servicios -->
        </tbody>
      </table>
      <div id="mobile-view">
        <div id="table-servicios-container-mobile" class="servicio-mobile"></div>
      </div>
    </div>
  </div>
  `;
  

  if (login || datosHanCambiado(datosServicios, ultimosDatosServicios)){
    try {
      const response = await fetch(
        `http://127.0.0.1:5200/user/${localStorage.getItem("userid")}/services`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": localStorage.getItem("token"),
            "user-id": localStorage.getItem("userid"),
          },
        }
      );
  
      const data = await response.json();
  
      datosServicios = data;
    }
    catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  }
  

  // Código para añadir el botón de añadir servicios
  const tablaServiciosConteiner = document.getElementById(
    "table-servicios-container"
  );

  const serviceTable = document.getElementById("service-table-body");
  serviceTable.innerHTML = "";

  // Estructura alternativa para móviles
  let servicioDiv = document.getElementById("table-servicios-container-mobile");
  servicioDiv.innerHTML = "";
  

  if (datosServicios && datosServicios.length > 0) {
    datosServicios.forEach((service) => {
      // Asumiendo que aquí es donde se añaden los servicios y botones al DOM
      serviceTable.innerHTML += `
          <tr id="servicio-${service.id}">
            <td style="background-color: #a1a1a1;" id="nombreServicio" class="text-center" contenteditable="false" required>${service.nombre_servicio}</td>
            <td style="background-color: #a1a1a1;" id="precioServicio" class="text-end" contenteditable="false" required>$ ${service.precio}</td>
            <td style="background-color: #a1a1a1;" colspan="2" style="width: auto; padding: 0.5rem;" class= "text-center">
              <div style="background-color: #a1a1a1;" class="btn-group role="group" aria-label="Acciones">
                <button class="btn btn-primary btn-sm btn-editar me-2" onclick="editarServicioDesktop(${service.id})">Editar</button>
                <button class="btn btn-danger btn-sm btn-eliminar" onclick="eliminarServicio(${service.id})">Eliminar</button>
              </div>
            </td>
          </tr>
        `;
    // Ocultar o mostrar la columna de acciones
    const columnasAcciones = tablaServicios.querySelectorAll(
      "th:last-child, td:last-child"
    );
    columnasAcciones.forEach((columna) => {
      columna.style.display = inicio ? "none" : "";
    });

    servicioDiv.innerHTML=` 
      <div id="nombre-servicio-mobile"><strong>Nombre:</strong> ${service.nombre_servicio}</div>
      <div id="precio-servicio-mobile"><strong>Precio:</strong>$ ${service.precio}</div>
      <div class="btn-group role="group" aria-label="Acciones">
        <button id="btn-editar-servicio-mobile" class="btn btn-primary btn-sm btn-editar me-2" onclick="editarServicioMobile(${service.id})">Editar</button>
        <button id="btn-eliminar-servicio-mobile" class="btn btn-danger btn-sm btn-eliminar" onclick="eliminarServicio(${service.id})">Eliminar</button>
      </div>
    `;

    });

  } else {
    serviceTable.innerHTML = `<tr><td style="background-color: #a1a1a1;" colspan="3">No hay servicios registrados.</td></tr>`;
    servicioDiv.innerHTML = `<div style= colspan="3">No hay servicios registrados.</div>`;
  } 
  
    // ocultar botones en mobile
    const botonesAcciones = tablaServicios.querySelectorAll(
      ".btn-editar, .btn-eliminar"
    );
    botonesAcciones.forEach((boton) => {
      boton.style.display = inicio ? "none" : "";
    })

  const buttonAgregar = document.createElement("button");
  buttonAgregar.classList.add("btn", "btn-primary", "btn-agregar");
  buttonAgregar.onclick = function () {
    agregarServicio(datosServicios.length);
  }
  buttonAgregar.textContent = "Añadir";
  tablaServiciosConteiner.appendChild(buttonAgregar);

  selectorCantidadServicios(inicio);
  mostrarTabla("tabla-servicios", inicio);
}

function editarServicioDesktop(idServicio) {
  let fila = document.getElementById(`servicio-${idServicio}`);

  // Cambiar el texto y la función de los botones
  let btnEditarServicio = fila.querySelector(".btn-editar");
  btnEditarServicio.textContent = "Guardar";
  btnEditarServicio.onclick = function () {
    let precioElemento = fila.querySelector("#precioServicio");
    if (!precioElemento) {
      console.error("Elemento de precio no encontrado");
      return; // Salir de la función si el elemento no existe
    }
    let precioServicio = precioElemento.textContent.trim();
    // Elimina el signo '$' si está presente y toma solo el número
    if (precioServicio.startsWith("$")) {
      precioServicio = precioServicio.substring(1).trim();
    }

    // Verifica si el precio es negativo antes de validarlo
    const numero = parseFloat(precioServicio);
    if (numero < 0) {
      Swal.fire({
        title: "Error",
        text: "El precio no puede ser negativo.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    // Validar el precio
    if (!validarPrecio(precioServicio)) {
      Swal.fire({
        title: "Error",
        text: "Formato de precio no valido. ($precio o precio)",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    // Acá ponemos el signo '$' si es necesario
    precioServicio = "$ " + precioServicio;
    guardarServicio(idServicio, false);
  };

  let btnEliminarServicio = fila.querySelector(".btn-eliminar");
  btnEliminarServicio.textContent = "Cancelar";
  btnEliminarServicio.onclick = function () {
    cancelarServicio(idServicio, fila, false);
  };

  // Hacer que las celdas de la fila sean editables
  fila.querySelectorAll('td[contenteditable="false"]').forEach((td) => {
    td.contentEditable = "true";
  });
}

  function editarServicioMobile(idServicio){
    
    let nombreServicio = document.getElementById(`nombre-servicio-mobile`);
    let precioElemento = document.getElementById(`precio-servicio-mobile`);
      
    nombreServicio.contentEditable = "true";
    precioElemento.contentEditable = "true";

    let btnEditarServicio = document.getElementById("btn-editar-servicio-mobile");
    btnEditarServicio.textContent = "Guardar";
    btnEditarServicio.onclick = function () {
    if (!precioElemento) {
      console.error("Elemento de precio no encontrado");
      return; // Salir de la función si el elemento no existe
    }
    let precioServicio = obtenerValorDespuesDeDosPuntos(precioElemento.textContent.trim());
    // Elimina el signo '$' si está presente y toma solo el número
    if (precioServicio.startsWith("$")) {
      precioServicio = precioServicio.substring(1).trim();
    }

    // Verifica si el precio es negativo antes de validarlo
    const numero = parseFloat(precioServicio);
    if (numero < 0) {
      Swal.fire({
        title: "Error",
        text: "El precio no puede ser negativo.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    // Validar el precio
    if (!validarPrecio(precioServicio)) {
      Swal.fire({
        title: "Error",
        text: "Formato de precio no valido. ($precio o precio)",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    // Acá ponemos el signo '$' si es necesario
    precioServicio = "$ " + precioServicio;
    guardarServicio(idServicio, true);
    };
    let btnEliminarServicio = document.getElementById("btn-eliminar-servicio-mobile");
    btnEliminarServicio.textContent = "Cancelar";
    btnEliminarServicio.onclick = function () {
      cancelarServicio(idServicio, null, true);
    };

}

function agregarServicio(cantServicios) {
  const seccionServicio = document.getElementById("tabla-servicios");
  if (document.getElementById("nuevo-servicio")) {
    document.getElementById("nuevo-servicio").remove();
  }
  const nuevoServicio = document.createElement("div");
  nuevoServicio.id = "nuevo-servicio";
  nuevoServicio.innerHTML = `
  <div id="modal-servicio" class="modal-factura">
  <div class="modal-content-factura">
    <span class="close-button" onclick="cerrarModal('servicio')">&times;</span>
      <h2>Nuevo Servicio</h2>
      <div class="container">
        <form id="nuevo-servicio-form">
          <div class="mb-3">
            <label for="nombre" class="form-label">Nombre Servicio</label>
            <input type="text" class="form-control" id="form-nombre" required>
          </div>
          <div class="mb-3">
            <label for="precio" class="form-label">Precio</label>
            <input type="number" class="form-control" id="form-precio" required>
          </div>
        </form>
      </div>
  </div>
  </div>
  `;

  seccionServicio.appendChild(nuevoServicio);

  document.getElementById("modal-servicio").style.display = "block";
  const form = document.getElementById("nuevo-servicio-form");

  let button = document.createElement("button");
  button.type = "submit";
  button.className = "btn btn-primary";
  button.textContent = "Guardar";

  form.append(button);

  form.onsubmit = function (event) {
    event.preventDefault();

    let precioElemento = document.getElementById("form-precio");
    let precioServicio = precioElemento.value;

    // Primero, valida el precio
    if (!validarPrecio(precioServicio)) {
      // Si el precio no es válido, `validarPrecio` mostrará el SweetAlert correspondiente
      return;
    }

    // Si el precio es válido, procede con la creación del servicio
    let servicio = {
      nombre_servicio: capitalizarPrimeraLetra(document.getElementById("form-nombre").value),
      precio: precioServicio,
    };

    if (localStorage.getItem("plan") === "C") {
      if (cantServicios === 10) {
        Swal.fire({
          title: "Error",
          text: "Tu plan no permite agregar mas de 5 servicios.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }
    } else if (localStorage.getItem("plan") === "B") {
      if (cantServicios === 25) {
        Swal.fire({
          title: "Error",
          text: "Tu plan no permite agregar mas de 10 servicios.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }
    }
    crearServicio(servicio);
  };
}

function crearServicio(servicio) {
  try{
        // Validaciones
        const regexNombreServicio = /^[a-zA-Z\s]+$/;

        if (!regexNombreServicio.test(servicio.nombre_servicio)) {
          Swal.fire({
            title: 'Error',
            text: 'El nombre del servicio debe contener solo letras y espacios.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return;
        }
    
        let precioServicio = parseFloat(servicio.precio);
        if (isNaN(precioServicio) || precioServicio <= 0) {
          Swal.fire({
            title: 'Error',
            text: 'El precio del servicio debe ser un número positivo.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return;
        }
    fetch(
      `http://127.0.0.1:5200/user/${localStorage.getItem("userid")}/services`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem("token"), // Reemplaza TOKEN_AQUI con el token JWT válido
          "user-id": localStorage.getItem("userid"), // Reemplaza con el ID de usuario correcto
        },
        body: JSON.stringify(servicio),
      }
    )
    .then((response) => response.json())
    .then((data) => {
      let contenidoHtml = `
        <div><strong>Nombre:</strong> ${servicio.nombre_servicio}</div>
        <div><strong>Precio:</strong>$ ${servicio.precio}</div>
      `;
      Swal.fire({
        title: "Servicio agregado exitosamente!",
        html: contenidoHtml,
        icon: "success",
        confirmButtonText: "OK",
      });
      let servicioConId = {
        id: data.id,
        ...servicio,
      }
      datosServicios.push(servicioConId);
      document.getElementById("form-nombre").value = "";
      document.getElementById("form-precio").value = "";
      document.getElementById("nuevo-servicio").remove();
      tablaServicios(false, false);
    })
  }
  catch{
    Swal.fire({
      title: "Error",
      text: "No se pudo agregar el servicio.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
}

function guardarServicio(idServicio, mobile) {
  let nuevoServicio;
  let fila = "";
  if (!mobile){
    fila = document.getElementById(`servicio-${idServicio}`);
    let precioElemento = fila.querySelector("#precioServicio");
  
    // verifica si el elemento existe y obtiene el precio
    if (!precioElemento) {
      console.error("Elemento de precio no encontrado");
      return; // Salir de la función si el elemento no existe
    }
  
    let precioServicio = precioElemento.textContent.trim();
    // Elimina el signo '$' si está presente y toma solo el número
    if (precioServicio.startsWith("$")) {
      precioServicio = precioServicio.substring(1).trim();
    }
  
    nuevoServicio = {
      nombre_servicio: capitalizarPrimeraLetra(fila.querySelector("#nombreServicio").textContent),
      precio: precioServicio,
    };
  }else{
    let precioElemento = document.getElementById("precio-servicio-mobile");
  
    // verifica si el elemento existe y obtiene el precio
    if (!precioElemento) {
      console.error("Elemento de precio no encontrado");
      return; // Salir de la función si el elemento no existe
    }
  
    let precioServicio = obtenerValorDespuesDeDosPuntos(precioElemento.textContent.trim());
    // Elimina el signo '$' si está presente y toma solo el número
    if (precioServicio.startsWith("$")) {
      precioServicio = precioServicio.substring(1).trim();
    }

    nuevoServicio ={
      nombre_servicio: capitalizarTodasLasPalabras(obtenerValorDespuesDeDosPuntos(document.getElementById(`nombre-servicio-mobile`).textContent)),
      precio: precioServicio,
    }
  }
  

  try{
    fetch(
      `http://127.0.0.1:5200/user/${localStorage.getItem(
        "userid"
      )}/services/${idServicio}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem("token"), // Reemplaza TOKEN_AQUI con el token JWT válido
          "user-id": localStorage.getItem("userid"), // Reemplaza con el ID de usuario correcto
        },
        body: JSON.stringify(nuevoServicio),
      }
    )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // Si la respuesta es exitosa, muestra el SweetAlert
      Swal.fire({
        title: "¡Servicio actualizado exitosamente!",
        text: `El servicio ha sido actualizado.`,
        icon: "success",
      });
      datosServicios.forEach((servicio) => {
        if (servicio.id === idServicio) {
          servicioActualizado = {
            id: idServicio,
            ...nuevoServicio,
          }
          datosServicios[datosServicios.indexOf(servicio)] = servicioActualizado;
        }
      })
      
      resetBotonesServicio(fila, idServicio, mobile);
      tablaServicios(false, false);
    })
  }
  catch{
    Swal.fire({
      title: "Error",
      text: "No se pudo actualizar el servicio.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
}

function eliminarServicio(idServicio) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "No podrás revertir esto.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      try{
        fetch(
          `http://127.0.0.1:5200/user/${localStorage.getItem(
            "userid"
          )}/services/${idServicio}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": localStorage.getItem("token"), // Reemplaza TOKEN_AQUI con el token JWT válido
              "user-id": localStorage.getItem("userid"), // Reemplaza con el ID de usuario correcto
            },
          }
        )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          // Si la respuesta es exitosa, muestra el SweetAlert
          Swal.fire({
            title: "¡Servicio eliminado exitosamente!",
            text: `El Servicio ha sido eliminado.`,
            icon: "success",
            confirmButtonText: "Aceptar",
          });
          document.getElementById(`servicio-${idServicio}`).remove();
          datosServicios.forEach((servicio) => {
            if (servicio.id === idServicio) {
              datosServicios.splice(datosServicios.indexOf(servicio), 1);
            }
          })
          tablaServicios(false, false);
        });
      }
  
      catch{
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el Servicio.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
  }
  });
}

function buscarServicio() {
  const serviceName = document.getElementById("searchService").value;
  const serviceTable = document.getElementById("service-table-body");
  serviceTable.innerHTML = "";
  try{
    datosServicios.forEach((service) => {
      if (
        service.nombre_servicio
          .toLowerCase()
          .includes(serviceName.toLowerCase())
      ) {
        serviceTable.innerHTML += `
            <tr>
              <td style="background-color: #a1a1a1;">${service.nombre_servicio}</td>
              <td style="background-color: #a1a1a1;">$ ${service.precio}</td>
              <td style="background-color: #a1a1a1;" colspan="2" style="width: auto; padding: 0.5rem;" class= "text-center">
                <div style="background-color: #a1a1a1;" class="btn-group role="group" aria-label="Acciones">
                  <button class="btn btn-primary btn-sm btn-editar me-2" onclick="editarServicioDesktop(${service.id})">Editar</button>
                  <button class="btn btn-danger btn-sm btn-eliminar" onclick="eliminarServicio(${service.id})">Eliminar</button>
                </div>
            </td>
            </tr>
          `;
      }
    });
  } catch{
    Swal.fire({
      title: "Error",
      text: "No se pudo encontrar el Servicio.",
      icon: "error",
      confirmButtonText: "OK",
    });
    return;
  }
}

//  recuperar el nombre que pertenece al id de factura

// ------------------  TABLA DE FACTURAS ---------------------
// Reemplazar la función para obtener datos de facturas por una función que obtiene los datos de la base de datos
async function tablaFacturas(inicio) {
  document.getElementById("modal-carga").style.display = "flex";
  const tablaFacturas = document.getElementById("tabla-facturas");
  tablaFacturas.innerHTML = `
    <h2 class="titulo-tablas">Facturas</h2>
    <div style="display: flex class="row searchRow">
      <div class="fecha-factura">
        <input type="date" id="fecha-inicio" class="input-fecha" />
        <input type="date" id="fecha-fin" class="input-fecha" />
        <button id="btn-filtrar" onclick="filtrarFacturasPorFechas()">Filtrar</button>
      </div>
      <div id="table-facturas-container" class="container h-100">
      <table id="facturas-table" class="table table-hover table-auto">
        <thead>
          <tr>
            <th style="background-color: #a1a1a1;">Nombre Cliente</th>
            <th style="background-color: #a1a1a1;">Fecha</th>
            <th style="background-color: #a1a1a1;" id="acciones" scope="col" colspan="2" class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody id="facturas-table-body">
          <!-- Contenido de la tabla de facturas -->
        </tbody>
      </table>
      <div id="mobile-view">
        <div id="table-facturas-container-mobile" class="factura-mobile"></div>
      </div>
    </div>
    </div>
  `;

  let tablaBody = document.getElementById("facturas-table-body");
  tablaBody.innerHTML = ""; // Limpia el contenido existente

  if (Object.keys(datosFacturas).length === 0 || datosHanCambiado(datosFacturas, ultimosDatosFacturas)) {
    try {
    const response = await fetch(
      `http://127.0.0.1:5200/user/${localStorage.getItem("userid")}/factura`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem("token"),
          "user-id": localStorage.getItem("userid"),
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error al cargar clientes");
    }

    const data = await response.json();

    datosFacturas = data;

    }
    catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  }

    const tablaFacturasContainer = document.getElementById(
      "table-facturas-container"
    );

    // Estructura alternativa para móbiles
    let facturaDiv = document.getElementById("table-facturas-container-mobile");
    facturaDiv.innerHTML = ""; // Limpia el contenido existente en la vista móvil
    let idProducto = "";
  
    if (datosFacturas.length > 0) {
      datosFacturas.forEach((factura) => {
        // Encuentra el cliente correspondiente
        idProducto = factura.idProducto;
        let nombreCliente = "Cliente no encontrado";
        if (datosClientes) {
          const clienteCorrespondiente = datosClientes.find(
            (cliente) => cliente.id === factura.id_cliente
          );
          nombreCliente = clienteCorrespondiente ? clienteCorrespondiente.nombre_cliente : "Cliente eliminado";
        }
  
        // Agregar filas a la tabla
        tablaBody.innerHTML += `
          <tr id="factura-${factura.id_factura}">
            <td style="background-color: #a1a1a1;">${nombreCliente}</td>
            <td style="background-color: #a1a1a1;">${factura.fecha}</td>
            <td style="background-color: #a1a1a1;" colspan="2" class="text-center">
              <div class="btn-group" role="group" aria-label="Acciones">
                <button class="btn btn-primary me-2" onclick="verDetalle(${factura.id_factura})">Detalle</button>
                <button class="btn btn-danger" onclick="anularFactura(${factura.id_factura})">Anular</button>
              </div>
            </td>
          </tr>
        `;
  
        // Agregar contenido a la vista móvil
        facturaDiv.innerHTML += `
          <div class="factura-movil">
            <div><strong>Nombre:</strong> ${nombreCliente}</div>
            <div><strong>Fecha:</strong> ${factura.fecha}</div>
            <div class="btn-group" role="group" aria-label="Acciones">
              <button class="btn btn-primary me-2" onclick="verDetalle(${factura.id_factura})">Detalle</button>
              <button class="btn btn-danger" onclick="anularFactura(${factura.id_factura})">Anular</button>
            </div>
          </div>
        `;
      });
    } else {
      tablaBody.innerHTML = '<tr ><td  style="background-color: #a1a1a1"; colspan="3">No hay facturas registradas.</td></tr>';
      facturaDiv.innerHTML = '<div>No hay facturas registradas.</div>';
    }
  
    // Añadir botón para agregar nueva factura (si es necesario)
    const buttonAgregar = document.createElement("button");
    buttonAgregar.classList.add("btn", "btn-primary", "btn-agregar");
    buttonAgregar.textContent = "Añadir";
    buttonAgregar.onclick = function () {
      // Función para generar formulario de factura
      generarFormularioFactura(datosFacturas.length, idProducto);
    };
    document.getElementById("table-facturas-container").appendChild(buttonAgregar);
  
    // Asumiendo que mostrarTabla es una función definida que muestra la tabla
    await mostrarTabla("tabla-facturas", inicio);
    document.getElementById("modal-carga").style.display = "none";
  }


  async function verDetalle(idFactura) {
    const tablaFacturas = document.getElementById("detalle-factura");
    tablaFacturas.innerHTML = "";

    // Crear tabla y encabezados
    tablaFacturas.innerHTML = `
      <h2 class="titulo-tablas">Detalle Factura</h2>
      <div class="container">
        <table id="detalle-factura-table" class="table table-auto">
          <thead>
            <tr>
              <th style="background-color: #a1a1a1;" class="text-center" scope="col">Nombre Cliente</th>
              <th style="background-color: #a1a1a1;" class="text-center" scope="col">Producto/Servicio</th>
              <th style="background-color: #a1a1a1;" class="text-center" scope="col">Cantidad</th>
              <th style="background-color: #a1a1a1;" class="text-end" scope="col">Precio Unitario</th>
            </tr>
          </thead>
          <tbody id="detalle-factura-table-body">
            <!-- Contenido de la tabla de facturas -->
          </tbody>
        </table>
      </div>
    `;
  
    let tablaBody = document.getElementById("detalle-factura-table-body");
    tablaBody.innerHTML = ""; // Limpia el contenido existente
    
  
    try {
      const response = await fetch(
        `http://127.0.0.1:5200/user/${localStorage.getItem("userid")}/factura/${idFactura}/detalle`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": localStorage.getItem("token"),
            "user-id": localStorage.getItem("userid"),
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Error al cargar detalles de factura");
      }
  
      const detalles = await response.json();
      let montoTotalFactura = 0;
      
      // Procesar y mostrar cada detalle en la tabla
      detalles.forEach(detalle => {
        const nombreItem = detalle.nombre_producto || detalle.nombre_servicio;
        const precioUnitario = detalle.precio_unitario || detalle.precio_servicio;
        const cantidad = detalle.cantidad || 'N/A'; // 'N/A' para servicios
        montoTotalFactura = detalle.monto_total; // Sumar al monto total
  
        tablaBody.innerHTML += `
          <tr>
            <td style="background-color: #a1a1a1;" class="text-center">${detalle.nombre_cliente}</td>
            <td style="background-color: #a1a1a1;" class="text-center">${nombreItem}</td>
            <td style="background-color: #a1a1a1;" class="text-center">${cantidad}</td>
            <td style="background-color: #a1a1a1;" class="text-end">$ ${precioUnitario}</td>
          </tr>
        `;
      });
  
      // Agregar fila para el monto total de la factura
      tablaBody.innerHTML += `
        <tr>
          <td colspan="4" class="text-end"><strong>Monto Total de la Factura: $ ${montoTotalFactura} </strong></td>
        </tr>
      `;
    } catch (error) {
      console.error("Error al cargar detalles de factura:", error);
    }
    tablaFacturas.style.display = "block";
  }
  
  

function anularFactura(idFactura) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "No podrás revertir esto.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, anular",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      try{
        fetch(
          `http://127.0.0.1:5200/user/${localStorage.getItem(
            "userid"
          )}/factura/${idFactura}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": localStorage.getItem("token"), // Asegúrate de que el token JWT sea válido
              "user-id": localStorage.getItem("userid"), // Asegúrate de que el ID de usuario sea correcto
            },
          }
        )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          // Si la respuesta es exitosa, muestra el SweetAlert
          Swal.fire({
            title: "¡Factura anulada exitosamente!",
            text: `La factura ha sido anulada.`,
            icon: "success",
            confirmButtonText: "Aceptar",
          });
          document.getElementById(`factura-${idFactura}`).remove();
          datosFacturas.forEach((factura) => {
            if (factura.id_factura === idFactura) {
              datosFacturas.splice(datosFacturas.indexOf(factura), 1);
          
            };
          });
          Object.keys(datosDetallesFacturas).forEach((key) => {
            let factura = datosDetallesFacturas[key];
            if (factura.id === idFactura) {
              datosDetallesFacturas.splice(
                datosDetallesFacturas.indexOf(factura),
                1
              );
            };
          });
          tablaFacturas(false,false);
        });
      }
      catch {
        Swal.fire({
          title: "Error",
          text: "No se pudo anular la factura.",
          icon: "error",
          confirmButtonText: "Aceptar",
        })
      }
    }
  });
}

// --------------- Mostrar tablas y ocultar otras ---------------------------
// Función para mostrar una tabla y ocultar las demás
// Variable para rastrear si estamos viendo los detalles de una factura
async function mostrarTabla(tablaId, inicio) {
  // Contrae el menú de navegación si está expandido
  var navMenu = document.getElementById('navbarNavMobile');
  if (navMenu.classList.contains('show')) {
    navMenu.classList.remove('show');
  }
  let botonAñadir = document.querySelectorAll(".btn-agregar");
  const searchRow = document.querySelectorAll(".search-container");

  // Lista de todas las tablas
  const tablas = [
    "tabla-clientes",
    "tabla-productos",
    "tabla-servicios",
    "tabla-facturas",
    "detalle-factura",
    "seccion-estadisticas",
    "seccion-historial",
    "seccion-control",
  ];
  const tablasInicio = ["tabla-clientes", "tabla-productos", "tabla-servicios"];
  if (inicio) {
    tablas.forEach((id) => {
      const tabla = document.getElementById(id);
      if (tabla) {
        tabla.style.display = "none";
      }
    });
    tablasInicio.forEach((id) => {
      const tabla = document.getElementById(id);
      if (tabla) {
        tabla.style.display = "block";
        searchRow.forEach((row) => {
          row.classList.replace("search-container", "hidden")
        });
      }
    });
    for (let i = 0; i < botonAñadir.length; i++) {
      botonAñadir[i].style.display = "none";
    }
    // Ocultar el elemento rows-selector
    const rowsSelectorElements = document.querySelectorAll('[id^="rows-selector"]');    
      rowsSelectorElements.forEach(element => {
        element.style.display = "none"; // Aquí puedes manejar cada elemento como desees
    });
  } else {
    // Ocultar todas las tablas
    tablas.forEach((id) => {
      const tabla = document.getElementById(id);
      if (tabla) {
        tabla.style.display = "none";
        searchRow.forEach((row) => {
          row.classList.replace("hidden", "search-container");
        });
      }
    });
    botonAñadir.forEach((boton) => {
      boton.style.display = "block";
    });
    // Mostrar el elemento rows-selector
    const rowsSelectorElements = document.querySelectorAll('[id^="rows-selector"]');
    rowsSelectorElements.forEach(element => {
      element.style.display = "block"; // Aquí puedes manejar cada elemento como desees
  });

    // Mostrar la tabla solicitada
    const tablaSeleccionada = document.getElementById(tablaId);
    if (tablaSeleccionada) {
      tablaSeleccionada.style.display = "block";
    }
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function mostrarTablasInicio(login) {
  if (login){
    document.getElementById("modal-carga").style.display = "flex";
    // Asumiendo que tablaClientes, tablaProductos y tablaServicios son funciones asíncronas o retornan una Promesa
    await tablaClientes(true, login);
  
    await tablaProductos(true, login);
  
    await tablaServicios(true, login);
  
    document.getElementById("modal-carga").style.display = "none";
  } else{
    await tablaClientes(true, login);

    await tablaProductos(true, login);
  
    await tablaServicios(true, login);
  }
  
}

function crearUsuario(plan) {
  const nameElement = document.getElementById("signup-fullname");
  const emailElement = document.getElementById("signup-email");
  const passwordElement = document.getElementById("signup-password");
  const repeatPasswordElement = document.getElementById(
    "signup-repeat-password"
  );
  const planModal = document.getElementById("planModal");

  usuario = {
    nombre_usuario: capitalizarTodasLasPalabras(nameElement.value),
    correo_electronico: emailElement.value,
    contrasena: passwordElement.value,
    categoria: plan,
  };

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario),
  };

  try{
    fetch("http://127.0.0.1:5200/crearUsuario", requestOptions)
    .then((response) => response.json())
    .then((data) => {
      // Muestra un SweetAlert
      Swal.fire({
        title: "¡Éxito!",
        text: `Usuario ${emailElement.value} creado exitosamente`,
        icon: "success",
        confirmButtonText: "OK",
      }).then((result) => {
        if (result.isConfirmed) {
          // Limpia los campos del formulario
          nameElement.value = "";
          emailElement.value = "";
          passwordElement.value = "";
          repeatPasswordElement.value = "";
          planModal.style.display = "none";
          window.location.reload();
        }
      });
    })
  }
  catch(error) {
    // Manejo de errores (opcional)
    Swal.fire({
      title: "Error",
      text: error.message,
      icon: "error",
      confirmButtonText: "OK",
    });
    return;
  };
}

function togglePassword(passwordInputId, toggleIconId) {
  var passwordInput = document.getElementById(passwordInputId);
  var toggleIcon = document.getElementById(toggleIconId);

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.textContent = "👁️"; // Cambiar a ícono de ocultar si lo prefieres
  } else {
    passwordInput.type = "password";
    toggleIcon.textContent = "👁️"; // Cambiar a ícono de mostrar si lo prefieres
  }
}

function login() {
  // Muestra el resto del contenido

  mainContent.style.display = "none";

  loginSection.style.display = "block";
}

async function inicio() {
  obtenerUsuario();
  await delay(500);
  // Oculta la sección de inicio de sesión
  loginSection.style.display = "none";

  // Muestra el resto del contenido
  mainContent.style.display = "block";

  ajustarNavegacion();

  mostrarTablasInicio(true);
}

// --------------------------------------- crear factura, tendra cargar producto, cliente y servicio ---------------------------------------------------

async function generarFormularioFactura(cantFacturas, idProducto) {
  const tablaFacturas = document.getElementById("tabla-facturas");
  if (document.getElementById("nueva-factura")) {
    document.getElementById("nueva-factura").remove();
  }
  const nuevaFactura = document.createElement("div");
  nuevaFactura.id = "nueva-factura";
  nuevaFactura.innerHTML = "";
  nuevaFactura.innerHTML = `
  <div id="modal-factura" class="modal-factura">
  <div class="modal-content-factura">
    <span class="close-button" onclick="cerrarModal('factura')">&times;</span>
      <h2>Crear Factura</h2>
      <form id="form-crear-factura">
        <div class="mb-3">
          <label for="select-cliente" class="form-label">Cliente</label>
          <select id="select-cliente" class="form-select" required>
            <!-- Las opciones se cargarán dinámicamente -->
          </select>
        </div>
        <div class="mb-3">
          <label for="select-producto" class="form-label">Producto</label>
          <select id="select-producto-${0}" class="form-select" onchange="actualizarStockProducto(${0}); calcularMontoTotal(); manejarSeleccionProducto(${0});">
            <!-- Las opciones se cargarán dinámicamente -->
          </select>
        </div>
        <div id="cantidad-producto-container-${0}" class="mb-3" style="display: none;">
          <label for="cantidad-producto" class="form-label">Cantidad</label>
          <input type="number" id="cantidad-producto-${0}" class="form-control" min="1" required>
        </div>
        <div class="mb-3" id="agregar-producto-${selectProductos - 1}" style="display: none;">
          <label for="agregar-producto-checkbox">
            ¿Desea agregar otro producto?
          </label>
          <input type="checkbox" id="agregar-producto-checkbox" onclick="agregarSelectProducto(${contadorProductos})">
        </div>
        <div class="mb-3">
          <label for="select-servicio" class="form-label">Servicio</label>
          <select id="select-servicio-${0}" class="form-select" onchange="cantidadServicio(${0}); calcularMontoTotal(); manejarSeleccionServicio(${0});">
            <option value="">-- Seleccione un servicio --</option>
            <!-- Las opciones se cargarán dinámicamente -->
          </select>
        </div>
        <div id="cantidad-servicio-container-${0}" class="mb-3" style="display: none;">
          <label for="cantidad-servicio" class="form-label">Cantidad</label>
          <input type="number" id="cantidad-servicio-${0}" class="form-control" min="1" required>
        </div>
        <div class="mb-3" id="agregar-servicio-${selectProductos - 1}" style="display: none;">
          <label for="agregar-servicio-checkbox">
            ¿Desea agregar otro servicio?
          </label>
          <input type="checkbox" id="agregar-servicio-checkbox" onclick="agregarSelectServicio(${contadorServicios})">
        </div>
        <div class="mb-3">
          <label for="fecha-factura" class="form-label">Fecha</label>
          <input type="date" id="fecha-factura" class="form-control" required>
        </div>
        <div class="mb-3">
          <label for="monto-total" class="form-label">Monto Total</label>
          <p><span id="monto-total">0</span></p>
        </div>
        <button type="button" class="btn btn-primary" onclick="crearFactura(${cantFacturas})">Guardar Factura</button>
      </form>
    <!-- Aquí irá el contenido del formulario -->
  </div>
</div>
  `;

  tablaFacturas.appendChild(nuevaFactura);

  document.getElementById("modal-factura").style.display = "block"; // Mostrar el modal

  // Espera hasta que el DOM se actualice antes de añadir los event listeners y cargar los datos
  setTimeout(() => {
    // Añadir el event listener al formulario
    const formCrearFactura = document.getElementById("form-crear-factura");
    if (formCrearFactura) {
      formCrearFactura.addEventListener("submit", crearFactura);
    }

    // Deshabilitar la entrada de teclado en los campos de cantidad
    document.querySelectorAll('[id^="cantidad-producto-"], [id^="cantidad-servicio-"]').forEach(input => {
      input.addEventListener('keydown', e => {
        e.preventDefault(); // Prevenir cualquier entrada de teclado
      });
    });
  }, 0);

  // Cargar clientes, productos y servicios
  cargarClientes();
  await delay(500);
  cargarProductos(selectProductos - 1);
  await delay(500);
  cargarServicios(selectProductos - 1);
}

function cerrarModal(id) {
  document.getElementById(`modal-${id}`).style.display = "none";
  if (id = 'factura'){
    selectProductos = 1;
    cantProductos = 0; 
  }
}

function manejarSeleccionProducto(idSelect) {
  actualizarStockProducto(idSelect);
  calcularMontoTotal();

  // Mostrar o ocultar la opción de agregar otro producto
  const seleccionado = document.getElementById(`select-producto-${idSelect}`).value;
  const divAgregarProducto = document.getElementById(`agregar-producto-${idSelect}`);
  divAgregarProducto.style.display = seleccionado ? "block" : "none";
}

function manejarSeleccionServicio(idSelect) {
  cantidadServicio(idSelect);
  calcularMontoTotal();

  // Mostrar o ocultar la opción de agregar otro servicio
  const seleccionado = document.getElementById(`select-servicio-${idSelect}`).value;
  const divAgregarServicio = document.getElementById(`agregar-servicio-${idSelect}`);
  divAgregarServicio.style.display = seleccionado ? "block" : "none";
}


function agregarSelectProducto(contadorProductos, idProducto) {
  productosStock[idProducto] = productosStock[idProducto] - cantidadesSeleccionadas[idProducto];
  const selectContainer = document.getElementById(`agregar-producto-${contadorProductos}`);
  contadorProductos++;
  selectContainer.innerHTML = "";
  selectContainer.innerHTML = `
  <div class="mb-3">
    <label for="select-producto" class="form-label">Producto</label>
    <select id="select-producto-${selectProductos}" class="form-select" onchange="actualizarStockProducto(${selectProductos}); calcularMontoTotal(); manejarSeleccionProducto(${selectProductos});">
      <!-- Las opciones se cargarán dinámicamente -->
    </select>
  </div>
  <div id="cantidad-producto-container-${selectProductos}" class="mb-3" style="display: none;">
    <label for="cantidad-producto" class="form-label">Cantidad</label>
    <input type="number" id="cantidad-producto-${selectProductos}" class="form-control" required>
  </div>
  <div class="mb-3" id="agregar-producto-${contadorProductos}" style="display: none;">
    <label for="agregar-producto-checkbox">
      ¿Desea agregar otro producto?
    </label>
    <input type="checkbox" id="agregar-producto-checkbox" onclick="agregarSelectProducto(${contadorProductos})">
  </div>`;

  const nuevoSelectProducto = document.getElementById(`select-producto-${contadorProductos}`);
  nuevoSelectProducto.id = `select-producto-${selectProductos}`;
  const nuevoInputCantidad = document.getElementById(`cantidad-producto-${contadorProductos}`);
  nuevoInputCantidad.id = `cantidad-producto-${selectProductos}`;

  // Deshabilitar la entrada de teclado en los campos de cantidad
  document.querySelectorAll('[id^="cantidad-producto-"], [id^="cantidad-servicio-"]').forEach(input => {
    input.addEventListener('keydown', e => {
      e.preventDefault(); // Prevenir cualquier entrada de teclado
    });
  });

  cargarProductos(selectProductos);
  selectProductos++;
}

function agregarSelectServicio(contadorServicios) {
  const selectContainer = document.getElementById(`agregar-servicio-${contadorServicios}`);
  contadorServicios++;
  selectContainer.innerHTML = "";
  selectContainer.innerHTML = `
  <div class="mb-3">
    <label for="select-servicio" class="form-label">Servicio</label>
    <select id="select-servicio-${selectServicios}" class="form-select" onchange="cantidadServicio(${selectServicios}); calcularMontoTotal(); manejarSeleccionServicio(${selectServicios});">
      <!-- Las opciones se cargarán dinámicamente -->
    </select>
  </div>
  <div id="cantidad-servicio-container-${selectServicios}" class="mb-3" style="display: none;">
    <label for="cantidad-servicio" class="form-label">Cantidad</label>
    <input type="number" id="cantidad-servicio-${selectServicios}" class="form-control" min="1" required>
  </div>
  <div class="mb-3" id="agregar-servicio-${contadorServicios}" style="display: none;">
    <label for="agregar-servicio-checkbox">
      ¿Desea agregar otro servicio?
    </label>
    <input type="checkbox" id="agregar-servicio-checkbox" onclick="agregarSelectServicio(${contadorServicios})">
  </div>`;

  const nuevoSelectServicio = document.getElementById(`select-servicio-${contadorServicios}`);
  nuevoSelectServicio.id = `select-servicio-${selectServicios}`;
  const nuevoInputCantidad = document.getElementById(`cantidad-servicio-${contadorServicios}`);
  nuevoInputCantidad.id = `cantidad-servicio-${selectServicios}`;

  cargarServicios(selectServicios);
  selectServicios++;
}

// Función para cargar clientes de forma asíncrona
async function cargarClientes() {
  const selectCliente = document.getElementById("select-cliente");
  selectCliente.innerHTML = "";

  datosClientes.forEach((cliente) => {
    let option = document.createElement("option");
    option.value = cliente.id;
    option.textContent = cliente.nombre_cliente;
    selectCliente.appendChild(option);
  });
}

// Función para cargar productos de forma asíncrona
async function cargarProductos(idSelect) {
  const selectProducto = document.getElementById(`select-producto-${idSelect}`);
  selectProducto.innerHTML = "";
  selectProducto.innerHTML = `<option value="">-- Seleccione un producto --</option>`;

  if (!productosStock[idSelect] ){
    datosProductos.forEach((producto) => {
      let option = document.createElement("option");
      option.value = producto.id;
      option.textContent = producto.nombre_producto;
      productosStock[producto.id] = producto.stock;
      productosPrecio[producto.id] = producto.precio;
      selectProducto.appendChild(option);
    });
  } else{
    datosProductos.forEach((producto) => {
      let option = document.createElement("option");
      option.value = producto.id;
      option.textContent = producto.nombre_producto;
      productosPrecio[producto.id] = producto.precio;
      selectProducto.appendChild(option);
    });
  }

  

}

function calcularMontoTotal() {
  let total = 0;

  // Calcular el total de los productos
  for (let i = 0; i < selectProductos; i++) {
    if (document.getElementById(`select-producto-${i}`)) {
      const selectedProductId = document.getElementById(`select-producto-${i}`).value;
      const cantidadProducto = document.getElementById(`cantidad-producto-${i}`).value || 0;
      if (selectedProductId) {
        total += cantidadProducto * productosPrecio[selectedProductId];
      }
    }
  }

  // Calcular el total de los servicios
  for (let i = 0; i < selectServicios; i++) {
    if (document.getElementById(`select-servicio-${i}`)) {
      const selectedServiceId = document.getElementById(`select-servicio-${i}`).value;
      const cantidadServicio = document.getElementById(`cantidad-servicio-${i}`).value || 0;
      if (selectedServiceId) {
        total += cantidadServicio * serviciosPrecio[selectedServiceId];
      }
    }
  }

  document.getElementById("monto-total").textContent = "$ " + total.toFixed(2);
}


function actualizarStockProducto(idSelect) {
  const selectedProductId = document.getElementById(`select-producto-${idSelect}`).value;
  const cantidadInput = document.getElementById(`cantidad-producto-${idSelect}`);
  const cantidadContainer = document.getElementById(`cantidad-producto-container-${idSelect}`);

  if (selectedProductId) {
    // Producto seleccionado, mostrar el campo de cantidad y actualizar el stock
    cantidadContainer.style.display = "block";

    // Calcular la cantidad máxima disponible teniendo en cuenta las selecciones anteriores
    let maxDisponible = productosStock[selectedProductId] - (cantidadesSeleccionadas[selectedProductId] || 0);
    cantidadInput.max = Math.max(maxDisponible, 0);
    cantidadInput.value = maxDisponible > 0 ? 1 : 0;

    // Añadir event listener para validar el stock y actualizar cantidadesSeleccionadas
    cantidadInput.addEventListener('input', function() {
      let currentValue = parseInt(cantidadInput.value, 10);

      // Asegurarse de que el valor no exceda el máximo ni sea menor que 1
      if (currentValue > cantidadInput.max) {
        cantidadInput.value = cantidadInput.max;
      } else if (currentValue < 1) {
        cantidadInput.value = 1;
      }

      // Actualizar el registro de cantidades seleccionadas
      cantidadesSeleccionadas[selectedProductId] = (cantidadesSeleccionadas[selectedProductId] || 0) + currentValue;

      calcularMontoTotal();
    });
  } else {
    // No se seleccionó ningún producto, ocultar el campo de cantidad
    cantidadContainer.style.display = "none";
  }

  calcularMontoTotal(); // Llamar a calcularMontoTotal independientemente de la selección
}

// Función para cargar servicios de forma asíncrona
async function cargarServicios(idSelect) {
  const selectServicio = document.getElementById(`select-servicio-${idSelect}`);
  selectServicio.innerHTML = "";
  selectServicio.innerHTML = `<option value="">-- Seleccione un servicio --</option>`;

  datosServicios.forEach((servicio) => {
    let option = document.createElement("option");
    option.value = servicio.id;
    option.textContent = servicio.nombre_servicio;
    serviciosPrecio[servicio.id] = servicio.precio;
    selectServicio.appendChild(option);
  });
}

function cantidadServicio(idSelect) {
  const selectedServiceId = document.getElementById(`select-servicio-${idSelect}`).value;
  const inputCantidadServicio = document.getElementById(`cantidad-servicio-${idSelect}`);
  const inputCantidadContainer = document.getElementById(
    `cantidad-servicio-container-${idSelect}`
  );

  if (selectedServiceId) {
    // Servicio seleccionado, mostrar el campo de cantidad
    inputCantidadContainer.style.display = "block";
    inputCantidadServicio.value =
      inputCantidadServicio.value > 0 ? inputCantidadServicio.value : 1;
    inputCantidadServicio.onchange = () => {
      if (parseInt(inputCantidadServicio.value, 10) < 1) {
        inputCantidadServicio.value = 1;
      }
      calcularMontoTotal();
    };
  } else {
    // No se seleccionó servicio, ocultar el campo de cantidad
    inputCantidadContainer.style.display = "none";
  }
  calcularMontoTotal(); // Llamar a calcularMontoTotal independientemente de la selección
}

// Función para manejar la creación de la factura
function crearFactura(cantFacturas) {
  const idCliente = document.getElementById("select-cliente").value;
  let productos = {}; // Objeto para almacenar productos con sus cantidades
  let servicios = {}; // Lista para servicios


  // Procesar productos
  for (let i = 0; i < selectProductos; i++) {
    if (document.getElementById(`select-producto-${i}`)) {
      let idProducto = document.getElementById(`select-producto-${i}`).value;
      let cantidad = parseInt(document.getElementById(`cantidad-producto-${i}`).value);

      if (idProducto === "") {
        continue;
      }

      if (productos[idProducto]) {
        productos[idProducto] += cantidad; // Incrementar cantidad para productos duplicados
      } else {
        productos[idProducto] = cantidad; // Agregar nuevo producto
      }
    }
  }

  for (let i = 0; i < selectServicios; i++) {
    if (document.getElementById(`select-servicio-${i}`)) {
      let idServicio = document.getElementById(`select-servicio-${i}`).value;

      if (idServicio === "") {
        continue;
      }

      servicios[idServicio] = true;

    }
  }

  const fechaFactura = document.getElementById("fecha-factura").value;
  const montoTotal = document
    .getElementById("monto-total")
    .textContent.split(" ", 2)[1];

  if (Object.keys(productos).length != 0 || Object.keys(servicios.length != 0)) {
    if (fechaFactura === "") {
      Swal.fire({
        title: "Error",
        text: "Debe seleccionar una fecha.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const nuevaFactura = {
      id_cliente: parseInt(idCliente),
      productos: Object.keys(productos).length != 0 ? productos : null, 
      id_servicio: Object.keys(servicios).length != 0 ? servicios : null,
      fecha: fechaFactura,
      total: parseInt(montoTotal),
    };


    if (localStorage.getItem("plan") === "C") {
      if (cantFacturas === 10) {
        Swal.fire({
          title: "Error",
          text: "Tu plan no permite agregar mas de 5 facturas.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }
    } else if (localStorage.getItem("plan") === "B") {
      if (cantFacturas === 25) {
        Swal.fire({
          title: "Error",
          text: "Tu plan no permite agregar mas de 10 facturas.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }
    }

    // Enviar los datos al backend
    try{

    
    fetch(
      `http://127.0.0.1:5200/user/${localStorage.getItem("userid")}/facturas`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem("token"),
          "user-id": localStorage.getItem("userid"),
        },
        body: JSON.stringify(nuevaFactura),
      }
    )
    .then((response) => response.json())
    .then((data) => {
      Swal.fire({
        title: "¡Éxito!",
        text: `Factura creada exitosamente`,
        icon: "success",
        confirmButtonText: "OK",
      });
      document.getElementById("nueva-factura").remove();
      let nombreCliente;
      datosClientes.forEach((cliente) => {
        if (cliente.id === data.id_cliente) {
          nombreCliente = cliente.nombre_cliente;
        }
      })
      let facturaConId = {
        fecha: fechaFactura,
        id_cliente: parseInt(idCliente),
        id_factura: data.id_factura,
      }
      datosFacturas.push(facturaConId);
      tablaFacturas(false, false);
      selectProductos = 1;
      contadorProductos = 0;
      });
    }
    catch {
        Swal.fire({
          title: "Error",
          text: `Hubo un problema al crear la factura. ${error}`,
          icon: "error",
          confirmButtonText: "OK",
        });
      };
  } else {
    Swal.fire({
      title: "Error",
      text: "Debe seleccionar un producto o un servicio.",
      icon: "error",
      confirmButtonText: "OK",
    });
    return;
  }
}

function mostrarPlanes() {
  const nameElement = document.getElementById("signup-fullname");
  const emailElement = document.getElementById("signup-email");
  const passwordElement = document.getElementById("signup-password");
  const repeatPasswordElement = document.getElementById(
    "signup-repeat-password"
  );

  if (
    nameElement.value === "" ||
    emailElement.value === "" ||
    passwordElement.value === ""
  ) {
    // Muestra un SweetAlert
    Swal.fire({
      title: "¡Error!",
      text: "Todos los campos son obligatorios",
      icon: "error",
      confirmButtonText: "OK",
    });
  } else if (!validarContrasena(passwordElement.value)) {
    // Muestra un SweetAlert
    Swal.fire({
      title: "¡Error!",
      text: "La contraseña debe tener al menos 8 caracteres, comenzar con una letra mayúscula, una letra minúscula y un número.",
      icon: "error",
      confirmButtonText: "OK",
    });
    return;
  } else if (passwordElement.value !== repeatPasswordElement.value) {
    // Muestra un SweetAlert
    Swal.fire({
      title: "¡Error!",
      text: "Las contraseñas no coinciden",
      icon: "error",
      confirmButtonText: "OK",
    });
  } else {
    // Obtén el modal
    var modal = document.getElementById("planModal");
    modal.style.display = "block";

    // Obtén el elemento <span> que cierra el modal
    var span = document.getElementsByClassName("close")[0];

    // Cuando el usuario hace clic en <span> (x), cierra el modal
    span.onclick = function () {
      modal.style.display = "none";
    };

    // Cuando el usuario hace clic en cualquier lugar fuera del modal, ciérralo
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };

    const seccionPlanes = document.getElementById("pricing");

    seccionPlanes.classList.remove("hidden");
  }
}

function validarContrasena(contrasena) {
  // Expresión regular para validar la contraseña
  // ^ indica el comienzo de la entrada
  // [A-Z] verifica que el primer carácter sea una letra mayúscula
  // (?=.*\d) asegura que haya al menos un dígito en cualquier parte de la cadena
  // (?=.*[a-zA-Z]) asegura que haya al menos una letra en cualquier parte de la cadena
  // .{8,} indica que la longitud total debe ser de al menos 8 caracteres
  // $ indica el fin de la entrada
  var regex = /^[A-Z](?=.*\d)(?=.*[a-zA-Z]).{7,}$/;

  return regex.test(contrasena);
}

async function obtenerRankingClientes() {
  if (Object.keys(datosRankingClientes).length === 0 || datosHanCambiado(datosFacturas, ultimosDatosFacturas)) {
    try {
      const response = await fetch(
        `http://127.0.0.1:5200/user/${localStorage.getItem("userid")}/ranking/client`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": localStorage.getItem("token"),
            "user-id": localStorage.getItem("userid"),
          },
        }
      );
  
      const data = await response.json();
  
      datosRankingClientes = data;

      return data;
    }
    catch (error) {
      console.error("Error al cargar ranking clientes:", error);
    }
  }
  else{
    return datosRankingClientes;
  }
}

async function obtenerRankingProductos() {
  if (Object.keys(datosRankingProductos).length === 0 || datosHanCambiado(datosFacturas, ultimosDatosFacturas)) {
    try {
      const response = await fetch(
        `http://127.0.0.1:5200/user/${localStorage.getItem("userid")}/product/ranking`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": localStorage.getItem("token"),
            "user-id": localStorage.getItem("userid"),
          },
        }
      );
  
      const data = await response.json();
  
      datosRankingProductos = data;

      return data;
    }
    catch (error) {
      console.error("Error al cargar ranking clientes:", error);
    }
  }
  else{
    return datosRankingProductos;
  }
}

async function obtenerRankingServicios() {
  if (Object.keys(datosRankingServicios).length === 0 || datosHanCambiado(datosFacturas, ultimosDatosFacturas)) {
    try {
      const response = await fetch(
        `http://127.0.0.1:5200/user/${localStorage.getItem("userid")}/ranking/service`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": localStorage.getItem("token"),
            "user-id": localStorage.getItem("userid"),
          },
        }
      );
  
      const data = await response.json();
  
      datosRankingServicios = data;

      return data;
    }
    catch (error) {
      console.error("Error al cargar ranking clientes:", error);
    }
  }
  else{
    return datosRankingServicios;
  }
}

async function mostrarRankingClientes(datos) {
  document.getElementById("modal-carga").style.display = "flex";

  ultimosDatosClientes = [...datos];

  const lista = document.getElementById("lista-ranking-clientes");
  let tablaHTML = `
      <table id="ranking-clientes-desktop" class="table table-auto h-100">
        <thead>
          <tr>
              <th style="background-color: #a1a1a1;">Nombre Cliente</th>
              <th style="background-color: #a1a1a1;">Total Ventas</th>
          </tr>
        </thead>`;

  tablaHTML += datos
    .map(
      (cliente) => `
      <tr>
          <td style="background-color: #a1a1a1">${cliente.nombre_cliente}</td>
          <td style="background-color: #a1a1a1">${cliente.total_ventas || "0"}</td>
      </tr>`
    )
    .join("");

  tablaHTML += `</table>`;
  lista.innerHTML = tablaHTML;

  // Vista móvil - Contenedores Div
  let rankingClientesMobile = document.createElement("div");
  rankingClientesMobile.id = "ranking-clientes-mobile";

  datos.forEach((cliente) => {
    let clienteDiv = document.createElement("div");
    clienteDiv.classList.add("cliente-mobile");
    clienteDiv.innerHTML = `
      <div><strong>Nombre Cliente:</strong> ${cliente.nombre_cliente}</div>
      <div><strong>Total Ventas:</strong> ${cliente.total_ventas || "0"}</div>`;
    rankingClientesMobile.appendChild(clienteDiv);
  });

  // Añadir la vista móvil al DOM
  lista.appendChild(rankingClientesMobile);

  let graficoContainer = document.getElementById('graficoClientes');
  if (!graficoContainer) {
    graficoContainer = document.createElement('canvas');
    graficoContainer.id = 'graficoClientes';
    lista.appendChild(graficoContainer);
  }

  await crearGraficoClientes(datos);

  document.getElementById("modal-carga").style.display = "none";
}

async function crearGraficoClientes(datos) {
  const canvas = document.getElementById('graficoClientes');
  const ctx = canvas.getContext('2d');

  if (myChartClientes) {
    myChartClientes.destroy();
  }

  const nombresClientes = datos.map(cliente => cliente.nombre_cliente);
  const totalesVentas = datos.map(cliente => cliente.total_ventas);

  const data = {
    labels: nombresClientes,
    datasets: [{
        label: 'Total Ventas',
        data: totalesVentas,
        backgroundColor: 'rgba(0, 123, 255, 0.5)',
        borderColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 1
    }]
  };

  const config = {
    type: 'bar',
    data: data,
    options: {
      scales: {
          y: {
              ticks: {
                  beginAtZero: true
              }
          }
      },
      responsive: true, // Hacer el gráfico responsivo
      maintainAspectRatio: true, // Mantener la relación de aspecto
      aspectRatio: 2, // Relación de aspecto (ancho / alto)
    }
  };

  myChartClientes = new Chart(ctx, config);
    
}


async function mostrarRankingProductos(datos) {
  document.getElementById("modal-carga").style.display = "flex";

  // Si el ranking no ha sido mostrado o los datos han cambiado, actualiza el ranking
  ultimosDatosProductos = [...datos];

  const lista = document.getElementById("lista-ranking-productos");
  let tablaHTML = `
  <table id="ranking-productos-desktop" class="table table-auto h-100">
    <thead>
      <tr>
          <th style="background-color: #a1a1a1;">Nombre Producto</th>
          <th style="background-color: #a1a1a1;">Total Ventas</th>
      </tr>
    </thead>`;

  tablaHTML += datos
    .map(
      (producto) => `
    <tr>
        <td style="background-color: #a1a1a1">${producto.nombre_producto}</td>
        <td style="background-color: #a1a1a1">${producto.total_ventas || "0"}</td>
    </tr>`
    )
    .join("");


  tablaHTML += `</table>`;
  lista.innerHTML = tablaHTML;

  // Vista móvil - Contenedores Div
  let rankingProductosMobile = document.createElement("div");
  rankingProductosMobile.id = "ranking-productos-mobile";

  datos.forEach((producto) => {
    let productoDiv = document.createElement("div");
    productoDiv.classList.add("producto-mobile");
    productoDiv.innerHTML = `
      <div><strong>Nombre Producto:</strong> ${producto.nombre_producto}</div>
      <div><strong>Total Ventas:</strong> ${producto.total_ventas || "0"}</div>`;
    rankingProductosMobile.appendChild(productoDiv);
  });

  // Añadir la vista móvil al DOM
  lista.appendChild(rankingProductosMobile);

  let graficoContainer = document.getElementById('graficoProductos');
  if (!graficoContainer) {
    graficoContainer = document.createElement('canvas');
    graficoContainer.id = 'graficoProductos';
    lista.appendChild(graficoContainer);
  }

  // Llamar a la función para crear el gráfico
  await crearGraficoProductos(datos);
  
  document.getElementById("modal-carga").style.display = "none";
}

async function crearGraficoProductos(datos) {
  const canvas = document.getElementById('graficoProductos');
  const nombresProductos = datos.map(producto => producto.nombre_producto);

  if (myChartProductos) {
    myChartProductos.destroy();
  }

  const totalesVentas = datos.map(producto => producto.total_ventas);
  const ctx = canvas.getContext('2d');

  const data = {
    labels: nombresProductos,
    datasets: [{
        label: 'Total Ventas',
        data: totalesVentas,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
    }]
  };

  const config = {
    type: 'bar',
    data: data,
    options: {
      scales: {
          y: {
              ticks: {
                  beginAtZero: true
              }
          }
      },
      responsive: true, // Hacer el gráfico responsivo
      maintainAspectRatio: true, // Mantener la relación de aspecto
      aspectRatio: 2, // Relación de aspecto (ancho / alto)
    }
  };

  myChartProductos = new Chart(ctx, config);
}


async function mostrarRankingServicios(datos) {
  document.getElementById("modal-carga").style.display = "flex";

  // Si el ranking no ha sido mostrado o los datos han cambiado, actualiza el ranking

  ultimosDatosServicios = [...datos];

  const lista = document.getElementById("lista-ranking-servicios");
  let tablaHTML = `
  <table id="ranking-servicios-desktop" class="table table-auto h-100">
    <thead>
      <tr>
          <th style="background-color: #a1a1a1";">Nombre Servicio</th>
          <th style="background-color: #a1a1a1";">Total Ventas</th>
      </tr>
    </thead>`;

  tablaHTML += datos
    .map(
      (servicio) => `
    <tr>
        <td style="background-color: #a1a1a1">${servicio.nombre_servicio}</td>
        <td style="background-color: #a1a1a1">${servicio.total_ventas || "0"}</td>
    </tr>`
    )
    .join("");

  tablaHTML += `</table>`;
  lista.innerHTML = tablaHTML;

  // Vista móvil - Contenedores Div
  let rankingServiciosMobile = document.createElement("div");
  rankingServiciosMobile.id = "ranking-servicios-mobile";

  datos.forEach((servicio) => {
    let servicioDiv = document.createElement("div");
    servicioDiv.classList.add("servicio-mobile");
    servicioDiv.innerHTML = `
      <div><strong>Nombre Servicio:</strong> ${servicio.nombre_servicio}</div>
      <div><strong>Total Ventas:</strong> ${servicio.total_ventas || "0"}</div>`;
    rankingServiciosMobile.appendChild(servicioDiv);
  });

  // Añadir la vista móvil al DOM
  lista.appendChild(rankingServiciosMobile);

  let graficoContainer = document.getElementById('graficoServicios');
  if (!graficoContainer) {
    graficoContainer = document.createElement('canvas');
    graficoContainer.id = 'graficoServicios';
    lista.appendChild(graficoContainer);
  }
  
  await crearGraficoServicios(datos);

  document.getElementById("modal-carga").style.display = "none";
}

async function crearGraficoServicios(datos) {
  const canvas = document.getElementById('graficoServicios');
  const nombresServicios = datos.map(servicio => servicio.nombre_servicio);

  if (myChartServicios) {
    myChartServicios.destroy();
  }

  const totalesVentas = datos.map(servicio => servicio.total_ventas);
  const ctx = canvas.getContext('2d');

  const data = {
    labels: nombresServicios,
    datasets: [{
        label: 'Total Ventas',
        data: totalesVentas,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
    }]
  };

  const config = {
    type: 'bar',
    data: data,
    options: {
      scales: {
          y: {
              ticks: {
                  beginAtZero: true
              }
          }
      },
      responsive: true, // Hacer el gráfico responsivo
      maintainAspectRatio: true, // Mantener la opción de aspecto
      aspectRatio: 2, // Relación de aspecto (ancho / alto)
    }
  };
  
  myChartServicios = new Chart(ctx, config);
}


async function cargarEstadisticas(ranking) {
  document.getElementById("modal-carga").style.display = "flex";

  // Obtener la sección de estadísticas y el selector de ranking
  const seccionEstadisticas = document.getElementById("seccion-estadisticas");

  // Inicialización solo en la primera carga
  if (!document.getElementById("selector-ranking")) {
    seccionEstadisticas.innerHTML = `
      <h2>Rankings de Ventas</h2>
      <select name="ranking-tipo" id="selector-ranking" onchange="cargarEstadisticas(this.value);">
        <option id="option-todos" value="todos">TODOS</option>
        <option id="option-clientes" value="clientes">CLIENTES</option>
        <option id="option-productos" value="productos">PRODUCTOS</option>
        <option id="option-servicios" value="servicios">SERVICIOS</option>
      </select>
      <div id="ranking-clientes" class="ranking">
        <h3 class="titulo-tablas">Ranking de Ventas por Cliente</h3>
        <div id="lista-ranking-clientes"></div>
      </div>
      <div id="ranking-productos" class="ranking">
        <h3 class="titulo-tablas">Ranking de Ventas por Producto</h3>
        <div id="lista-ranking-productos"></div>
      </div>
      <div id="ranking-servicios" class="ranking">
        <h3 class="titulo-tablas">Ranking de Ventas por Servicio</h3>
        <div id="lista-ranking-servicios"></div>
      </div>
    `;
  }

  let selectorRanking = document.getElementById("selector-ranking");

  document.getElementById("ranking-clientes").style.display = "none";
  document.getElementById("ranking-productos").style.display = "none";
  document.getElementById("ranking-servicios").style.display = "none";

  // Establecer el valor del selector de ranking
  selectorRanking.value = ranking;

  // Cargar y mostrar los datos de ranking
  try {
    if (ranking === "clientes") {
      const rankingClientes = await obtenerRankingClientes();
      await mostrarRankingClientes(rankingClientes);
      document.getElementById("ranking-clientes").style.display = "block";
    } else if (ranking === "productos") {
      const rankingProductos = await obtenerRankingProductos();
      await mostrarRankingProductos(rankingProductos);
      document.getElementById("ranking-productos").style.display = "block";
    } else if (ranking === "servicios") {
      const rankingServicios = await obtenerRankingServicios();
      await mostrarRankingServicios(rankingServicios);
      document.getElementById("ranking-servicios").style.display = "block";
    } else if (ranking === "todos") {
      // Si la opción "todos" está seleccionada, muestra todos los rankings
      const rankingClientes = await obtenerRankingClientes();
      const rankingProductos = await obtenerRankingProductos();
      const rankingServicios = await obtenerRankingServicios();
      await mostrarRankingClientes(rankingClientes);
      await mostrarRankingProductos(rankingProductos);
      await mostrarRankingServicios(rankingServicios);
      document.getElementById("ranking-clientes").style.display = "block";
      document.getElementById("ranking-productos").style.display = "block";
      document.getElementById("ranking-servicios").style.display = "block";
    }
    mostrarTabla("seccion-estadisticas", false);
  } catch (error) {
    console.error(error);
  }

  document.getElementById("modal-carga").style.display = "none";
}



function filtrarFacturasPorFechas() {
  const fechaInicio = document.getElementById("fecha-inicio").value;
  const fechaFin = document.getElementById("fecha-fin").value;
  todasLasFacturas = Object.values(datosFacturas);

  // Filtrar facturas que estén en el rango de fechas
  const filtroLasFacturas = todasLasFacturas.filter((factura) => {
    const fechaFactura = factura.fecha;
    return fechaFactura >= fechaInicio && fechaFactura <= fechaFin;
  });

  facturasFiltradas = filtroLasFacturas;

  modalFacturasFiltradas(fechaInicio, fechaFin);
}

function modalFacturasFiltradas(fechaInicio, fechaFin) {
  const tablaFacturas = document.getElementById("tabla-facturas");
  const divModalFacturas = document.createElement("div");
  divModalFacturas.id = "modal-facturas-filtradas";
  divModalFacturas.classList.add("modal-factura");
  divModalFacturas.innerHTML = "";
  divModalFacturas.innerHTML = `
  <div class="modal-content-factura">
    <span class="close-button" onclick="cerrarModal('facturas-filtradas')">&times;</span>
    <h2 class="text-center">Facturas filtradas de ${fechaInicio} a ${fechaFin}</h2>

  <div id="table-modal-facturas-container" class="container h-100">
      <table id="facturas-modal-table" class="table table-auto">
        <thead>
          <tr>
            <th style="background-color: #a1a1a1;">Nombre Cliente</th>
            <th style="background-color: #a1a1a1;">Fecha</th>
            <th style="background-color: #a1a1a1;" id="acciones" scope="col" colspan="2" class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody id="facturas-modal-table-body">
          <!-- Contenido de la tabla de facturas -->
        </tbody>
      </table>
    </div>
  </div>
  `;

  tablaFacturas.appendChild(divModalFacturas);

  document.getElementById("modal-facturas-filtradas").style.display = "block";

  const tablaBody = document.getElementById("facturas-modal-table-body");
  tablaBody.innerHTML = "";

  facturasFiltradas.forEach((factura) => {
    const clienteEncontrado = Object.values(datosClientes).find(
      (cliente) => cliente.id === factura.id_cliente
    );
    const nombreCliente = clienteEncontrado
      ? clienteEncontrado.nombre_cliente
      : "Cliente eliminado";

    tablaBody.innerHTML += `
      <tr id="factura-${factura.id_factura}">
        <td style="background-color: #a1a1a1;">${nombreCliente}</td>
        <td style="background-color: #a1a1a1;">${factura.fecha}</td>
        <td style="background-color: #a1a1a1;" colspan="2" style="width: auto; padding: 0.5rem;" class= "text-center">
          <div class="btn-group role="group" aria-label="Acciones">
            <button class="btn btn-primary me-2" onclick="verDetalle(${factura.id_factura}, ">Detalle</button>
            <button class="btn btn-danger btn-sm" onclick="anularFactura(${factura.id_factura})">Anular</button>
          </div>
        </td>        
      </tr>
    `;
  });
}

function cargarRanking() {
  cargarEstadisticas(false, document.getElementById("selector-ranking").value);
}

function ajustarNavegacion() {y:
  if (loginSection.style.display === "none") {
    if (window.innerWidth <= 767) {
      document.getElementById("navMobile").style.display = "block";
      document.getElementById("navDesktop").style.display = "none";
    } else {
      document.getElementById("navMobile").style.display = "none";
      document.getElementById("navDesktop").style.display = "block";
    }
  }
}

// cambia el texto del boton de planes
function ajustarTextoBoton() {
  var boton = document.getElementById('plan-button');

  if (window.innerWidth <= 768) { // Para dispositivos móviles
      boton.value = 'Planes';
  } else { // Para dispositivos de escritorio
      boton.value = 'Seleccione su plan';
  }
}

function crearSelectorAnio() {
  const selectorAno = document.getElementById("selector-ano-container");
  let selectHTML = `<select id="selector-ano" class="form-select" aria-label="Default select example" onchange="historialVentas(this.value)">`;
  for (let ano = 2010; ano <= 2030; ano++) {
    selectHTML += `<option value="${ano}" ${ano === new Date().getFullYear() ? 'selected' : ''}>${ano}</option>`;
  }
  selectHTML += `</select>`;
  selectorAno.innerHTML = selectHTML;
}

async function historialVentas(anoSeleccionado) {
  document.getElementById("modal-carga").style.display = "flex";

  if (!document.getElementById("selector-ano")) {
      crearSelectorAnio();
  }

  anoSeleccionado = Number(anoSeleccionado);
  if (isNaN(anoSeleccionado) || anoSeleccionado < 2010 || anoSeleccionado > 2030) {
      console.error("Año seleccionado no es válido");
      document.getElementById("modal-carga").style.display = "none";
      return;
  }

  // Cargar datos de facturas si aún no se han cargado
  if (Object.keys(datosFacturas).length === 0) {
      try {
          const response = await fetch(
              `http://127.0.0.1:5200/user/${localStorage.getItem("userid")}/factura`, {
                  method: "GET",
                  headers: {
                      "Content-Type": "application/json",
                      "x-access-token": localStorage.getItem("token"),
                      "user-id": localStorage.getItem("userid"),
                  },
              }
          );

          if (!response.ok) {
              throw new Error("Error al cargar facturas");
          }

          const data = await response.json();
          datosFacturas = data;
      } catch (error) {
          console.error("Error al cargar facturas:", error);
          document.getElementById("modal-carga").style.display = "none";
          return;
      }
  }

  const haCambiadoElAno = ultimoAnoProcesado !== anoSeleccionado;
  ultimoAnoProcesado = anoSeleccionado; // Actualizar el último año procesado

  if (!myChartVentas || datosHanCambiado(datosFacturas, ultimosDatosFacturas) || Object.keys(totalFacturadoUsuario).length === 0 || haCambiadoElAno) {
      historialVentasMostrado = true;
      ultimosDatosFacturas = [...datosFacturas];

      for (let mes = 0; mes < 12; mes++) {
          let inicioMes = new Date(anoSeleccionado, mes, 1);
          let finMes = new Date(anoSeleccionado, mes + 1, 0);

          try {
              const response = await fetch(`http://127.0.0.1:5200/user/${localStorage.getItem("userid")}/factura/total/${inicioMes.toISOString().split('T')[0]}/${finMes.toISOString().split('T')[0]}`, {
                  method: "GET",
                  headers: {
                      "Content-Type": "application/json",
                      "x-access-token": localStorage.getItem("token"),
                      "user-id": localStorage.getItem("userid"),
                  },
              });

              const data = await response.json();
              totalFacturadoUsuario[mes] = data.monto_total_facturado;

          } catch (error) {
              console.error("Error al cargar datos del mes:", error);
              totalFacturadoUsuario[mes] = 0; // En caso de error, asignar 0 a ese mes
          }
      }

      await generarGrafico(anoSeleccionado);
  }

  mostrarTabla("seccion-historial", false);
  document.getElementById("modal-carga").style.display = "none";
}

async function generarGrafico(anoSeleccionado) {
  const canvas = document.getElementById('grafico-ventas');
  if (!canvas) {
    console.error('Elemento canvas no encontrado.');
    return;
  }
  const ctx = canvas.getContext('2d');

  // Destruye el gráfico existente para forzar una actualización
  if (myChartVentas) {
    myChartVentas.destroy();
  }

  // Datos y configuración del gráfico
  const data = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    datasets: [{
      label: 'Monto Total Facturado por Mes del año ' + anoSeleccionado,
      data: Object.values(totalFacturadoUsuario),
      backgroundColor: 'rgba(0, 123, 255, 0.5)',
      borderColor: 'rgba(0, 123, 255, 1)',
      borderWidth: 1
    }]
  };

  const config = {
    type: 'bar',
    data: data,
    options: {
        maintainAspectRatio: true, // Esto mantendrá la proporción al redimensionar
        responsive: true, // Hace que el gráfico sea responsivo al tamaño del contenedor
        aspectRatio: 2, // Puedes ajustar la proporción aquí según necesites
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  // Crear el nuevo gráfico
  myChartVentas = new Chart(ctx, config);
}

async function actualizarGraficoPorProducto(idProducto) {
  document.getElementById("modal-carga").style.display = "flex";

  try {
    if (idProducto === 'todos') {
      await movimientoStock();
    } else {
      const response = await fetch(`http://127.0.0.1:5200/user/${localStorage.getItem("userid")}/informe_movimiento_stock/${idProducto}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem("token"),
          "user-id": localStorage.getItem("userid"),
        },
      });
      const data = await response.json();
      await generarGraficoStock({ movimientos: [data] });
    }
  } catch (error) {
    console.error("Error al cargar el movimiento de stock:", error);
  }



  document.getElementById("modal-carga").style.display = "none";
}


async function movimientoStock() {
  document.getElementById("modal-carga").style.display = "flex";
  const selectorProducto = document.getElementById("selector-producto-container");
  selectorProducto.innerHTML = "";

  if (!datosMovimientoStock || datosHanCambiado(datosProductos, ultimosDatosProductos)){
    try {
      const response = await fetch(`http://127.0.0.1:5200/user/${localStorage.getItem("userid")}/informe_movimiento_stock`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem("token"),
          "user-id": localStorage.getItem("userid"),
        },
      });

      const data = await response.json();
      datosMovimientoStock = data;

      selectorProducto.innerHTML = `
      <select id="selector-producto" >
        <option value="todos">Todos los productos</option>
      </select>
      `;

      const selector = document.getElementById("selector-producto");
      selector.innerHTML = '';

      // Opción para mostrar todos los productos
      const opcionTodos = document.createElement('option');
      opcionTodos.value = 'todos';
      opcionTodos.textContent = 'Todos los productos';
      selector.appendChild(opcionTodos);

      // Cargar productos en el selector
      datosProductos.forEach(producto => {
        const opcion = document.createElement('option');
        opcion.value = producto.id;
        opcion.textContent = producto.nombre_producto;
        selector.appendChild(opcion);
      });


      selector.onchange = async () => {
        const idProductoSeleccionado = selector.value;
        await actualizarGraficoPorProducto(idProductoSeleccionado);
      };

      // Generar el gráfico para todos los productos
      await generarGraficoStock(data);

    } catch (error) {
      console.error("Error al cargar movimientos de stock:", error);
    }
  }

  await mostrarTabla("seccion-control", false);

  document.getElementById("modal-carga").style.display = "none";
}

async function generarGraficoStock(datosMovimientoStock) {
  const canvas = document.getElementById('movimiento-stock');
  if (!canvas) {
    console.error('Elemento canvas no encontrado.');
    return;
  }
  const ctx = canvas.getContext('2d');

  if (myChartStock) {
    myChartStock.destroy();
  }

  const esUnSoloProducto = datosMovimientoStock.movimientos.length === 1 && datosMovimientoStock.movimientos[0].id_producto;
  const colorPorProducto = {};
  let etiquetas;

  if (esUnSoloProducto) {
    const producto = datosMovimientoStock.movimientos[0];
    const nombreProducto = producto.nombre_producto;
    colorPorProducto[nombreProducto] = obtenerColorAleatorio();

    // Encuentra el primer movimiento de 'creación' para establecer el stock inicial
    const movimientoCreacion = producto.movimientos.find(mov => mov.tipo_movimiento === 0);
    let stockActual = movimientoCreacion ? movimientoCreacion.stock_inicial : 0;
    const datosProducto = {'Stock Inicial': stockActual};

    // Asegúrate de que 'creación' no se cuente dos veces si ya se encontró
    const movimientosRestantes = movimientoCreacion ? producto.movimientos.filter(mov => mov !== movimientoCreacion) : [...producto.movimientos];

    // Ordena y procesa los movimientos restantes
    movimientosRestantes.sort((a, b) => {
      const fechaA = new Date(a.fecha);
      const fechaB = new Date(b.fecha);
      return fechaA - fechaB;
    }).forEach(mov => {
      const fechaObj = new Date(mov.fecha);
      const fechaLocal = new Date(fechaObj.getUTCFullYear(), fechaObj.getUTCMonth(), fechaObj.getUTCDate());

      const fechaFormateada = `${fechaLocal.getDate().toString().padStart(2, '0')}-${(fechaLocal.getMonth() + 1).toString().padStart(2, '0')}-${fechaLocal.getFullYear()}`;
      const etiqueta = mov.tipo_movimiento === 1 ? `Modificación de stock: ${fechaFormateada}` : `Venta: ${fechaFormateada}`;

      if (mov.tipo_movimiento === 1) {
        stockActual = mov.stock;
      } else if (mov.tipo_movimiento === 2) {
        stockActual -= mov.cantidad_vendida; // Asegúrate de usar la propiedad correcta aquí
      }
      datosProducto[etiqueta] = stockActual;
    });

    etiquetas = ['Stock Inicial', ...Object.keys(datosProducto).filter(key => key !== 'Stock Inicial')];
    const stockData = etiquetas.map(etiqueta => datosProducto[etiqueta]);

    const dataset = {
      label: nombreProducto,
      backgroundColor: colorPorProducto[nombreProducto],
      data: stockData
    };

    const config = {
      type: 'bar',
      data: { labels: etiquetas, datasets: [dataset] },
      options: {
        maintainAspectRatio: true,
        responsive: true,
        legend: {
          display: true,
          position: 'top',
          labels: { fontColor: 'black' }
        },
        scales: {
          y: { beginAtZero: true },
          x: { type: 'category' }
        }
      }
    };

    myChartStock = new Chart(ctx, config);
  } else {
    const datasets = [];
const etiquetasGenerales = new Set(['Stock Inicial']);

// Agrupar movimientos por producto
const movimientosPorProducto = datosMovimientoStock.movimientos.reduce((acc, mov) => {
  const idProducto = mov.id_producto;
  if (!acc[idProducto]) {
    acc[idProducto] = {
      nombre: mov.nombre_producto,
      movimientos: []
    };
    colorPorProducto[mov.nombre_producto] = obtenerColorAleatorio();
  }
  acc[idProducto].movimientos.push(mov);
  return acc;
}, {});

// Procesar cada producto
for (const [idProducto, producto] of Object.entries(movimientosPorProducto)) {
  // Encuentra el primer movimiento de 'creación' para establecer el stock inicial
  const movimientoCreacion = producto.movimientos.find(mov => mov.tipo_movimiento === 0);
  let stockActual = movimientoCreacion ? movimientoCreacion.stock_inicial : 0;

  // Asegúrate de que 'creación' no se cuente dos veces si ya se encontró
  const movimientosRestantes = movimientoCreacion ? producto.movimientos.filter(mov => mov !== movimientoCreacion) : [...producto.movimientos];

  // Ordena y procesa los movimientos restantes
  movimientosRestantes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const datosProducto = {'Stock Inicial': stockActual};
  movimientosRestantes.forEach(mov => {
    const fechaObj = new Date(mov.fecha);
    const fechaLocal = new Date(fechaObj.getUTCFullYear(), fechaObj.getUTCMonth(), fechaObj.getUTCDate());

    const fechaFormateada = `${fechaLocal.getDate().toString().padStart(2, '0')}-${(fechaLocal.getMonth() + 1).toString().padStart(2, '0')}-${fechaLocal.getFullYear()}`;
    const etiqueta = mov.tipo_movimiento === 1 ? `Modificación de stock: ${fechaFormateada}` : `Venta: ${fechaFormateada}`;

    if (mov.tipo_movimiento === 1) {
      stockActual = mov.stock;
    } else if (mov.tipo_movimiento === 2) {
      stockActual -= mov.cantidad_vendida;
    }
    datosProducto[etiqueta] = stockActual;
    etiquetasGenerales.add(etiqueta);
  });

  const stockData = Array.from(etiquetasGenerales).sort((a, b) => {
    if (a === 'Stock Inicial') return -1;
    if (b === 'Stock Inicial') return 1;
    const fechaA = new Date(a.split(': ')[1]);
    const fechaB = new Date(b.split(': ')[1]);
    return fechaA - fechaB;
  }).map(etiqueta => datosProducto[etiqueta] || 0);

  const dataset = {
    label: producto.nombre,
    backgroundColor: colorPorProducto[producto.nombre],
    data: stockData
  };

  datasets.push(dataset);
}

const etiquetas = Array.from(etiquetasGenerales).sort((a, b) => {
  if (a === 'Stock Inicial') return -1;
  if (b === 'Stock Inicial') return 1;
  const fechaA = new Date(a.split(': ')[1]);
  const fechaB = new Date(b.split(': ')[1]);
  return fechaA - fechaB;
});

const config = {
  type: 'bar',
  data: {
    labels: etiquetas,
    datasets: datasets
  },
  options: {
    maintainAspectRatio: true,
    responsive: true,
    legend: {
      display: true,
      position: 'top',
      labels: { fontColor: 'black' }
    },
    scales: {
      y: { beginAtZero: true },
      x: { type: 'category' }
    }
  }
};

// Inicializar el gráfico
myChartStock = new Chart(ctx, config);
  }
}



// Función para obtener un color aleatorio
function obtenerColorAleatorio() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgba(${r}, ${g}, ${b}, 1)`;
}

// Ejecutar al cargar y cuando cambia el tamaño de la ventana
document.addEventListener('DOMContentLoaded', function() {
ajustarTextoBoton();
window.onresize = ajustarTextoBoton;
window.onresize = ajustarNavegacion;
});