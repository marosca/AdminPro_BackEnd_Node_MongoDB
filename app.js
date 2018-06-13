/* Punto de entrada de la app (servidor) 
Proyecto original: https://github.com/Klerith/backend-server-udemy/releases/tag/v0.0.1
Instlaciones:
  1. Creamos proyecto con npm init
  2. Instalación express: npm install --save express
  3. Instalamos nodemon y creamos un script en npm --> "nodemon app.js" (para no tener que estar subiendo y bajando el servidor con cada cambio)
  4. Instalamos postman
  5. Instalamos mongodb con hombrebrew y lo levantamos con 'sudo mongod'.
  6. Instalamos robo 3T (creamos conexión a localhost en puerto 27017)
  7. Instalamos mongoose--> npm install mongoose --save --> sirve para conectar con la bd de mongodb
  8. Plugin de validaciones de mongoose --> npm install mongoose-unique-validator --save
  9. Instalamos body parser node --> npm install body-parser --save
    El body parser sirve para poder trabajar con datos de tipo application/x-www-form-urlencoded recibidos de formularios del front end
  10. Librería bcrypt.js para encriptar passwords --> npm install bcryptjs --save
    Esta librería se importa en la rutas de usuario, que es donde voy a necesitar encrptar una contraseña pasada por post
  11. Json web token: npm install jsonwebtoken --save --> lo importamos en el login
    */

// requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();
// importar módulos de rutas
var appRoutes = require('./routes/app');// Importar ruta princiapl --> /
var usuarioRoutes = require('./routes/usuario'); // ruta de --> /usuario
var loginRoutes = require('./routes/login'); // ruta --> /login


// Body parser
app.use(bodyParser.json()); // parse application/json (parsea lo json)
app.use(bodyParser.urlencoded({ extended: false })); // application/x-www.form-urlencoded


// Conexióna la db
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
  if(err) throw err;
  console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
})

//==========================================================
//======================= RUTAS ============================
//==========================================================
//Rutas (estan separadas en la carpeta /routes)
app.use('/login', loginRoutes);
app.use('/', appRoutes);
app.use('/usuario', usuarioRoutes);

//Escuchar peticiones
app.listen(3000, () => {
  console.log('express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});