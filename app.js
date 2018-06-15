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
  12. express-fileupload. Plugins de express para FileApi --> https://github.com/richardgirges/express-fileupload
    npm install --save express-fileupload
  13. npm install google-auth-library --save
    */
// URL GENERADA POR POSTMAN con la doc: eyJhbGciOiJSUzI1NiIsImtpZCI6IjdkZGY1NGQzMDMyZDFmMGQ0OGMzNjE4ODkyY2E3NGMxYWMzMGFkNzcifQ.eyJhenAiOiIzNjQyNTYyOTkyOTAtb2Y2aDhuczZ2dWp2N2JlYzNoMGlqbWQyN2hhYzdtcHAuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzNjQyNTYyOTkyOTAtb2Y2aDhuczZ2dWp2N2JlYzNoMGlqbWQyN2hhYzdtcHAuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTg0MTQwMjI3Mzc0MDMzOTI0NjEiLCJoZCI6Im9wdGl2YW1lZGlhLmNvbSIsImVtYWlsIjoibWFyaW9sYS5tb3Jlbm9Ab3B0aXZhbWVkaWEuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJ4aVFmeEFBQjJrSkhOdEdsaGxJU2FnIiwiZXhwIjoxNTI5MDUwODI2LCJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwianRpIjoiNTJkNjEwNTY2MDk5YjljZTgwMjQ0MjFmMTQ0NTJiYjgyZGZkNzkwMCIsImlhdCI6MTUyOTA0NzIyNiwibmFtZSI6Ik1hcmlvbGEgTW9yZW5vIiwicGljdHVyZSI6Imh0dHBzOi8vbGg2Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tNktzN3p3akRVRFUvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQWMvbHYtaG9ObHZVQ3Mvczk2LWMvcGhvdG8uanBnIiwiZ2l2ZW5fbmFtZSI6Ik1hcmlvbGEiLCJmYW1pbHlfbmFtZSI6Ik1vcmVubyIsImxvY2FsZSI6ImVzIn0.Z1JlEi4sLExS8GyWMSXupYbrEMgkYaRafPm4MzSH3Wp6UbA8owB6zpjqeX-__4o3iBNRARRatxeB3Xi7C6XLFctR03MalMpVtRX_PWn4wwRwBrQfnfHF-Km39s5wqXAHcJw0LCztZNcV4XenRPftoo-YAPz6dSfqO9wfJ6H6pHvcenZLoMQ8wIqY38KodfTsJHkbVNiOOsyrVsULKCayr8314JV2HGc66mLsjgUOen6gWnkuQhdZixkf1Duu6ZLf198vubCj1kVMsr-6aeNu0LHNBuZnADIhswawSWITeO1u_4rx4zBr0HT7xnjvN3DWUR7VG1-7A9Zu4FGogPxEvA

// requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();
// importar módulos de rutas
var appRoutes = require('./routes/app');// Importar ruta princiapl --> /
var loginRoutes = require('./routes/login'); // ruta --> /login
var usuarioRoutes = require('./routes/usuario'); // ruta de --> /usuario
var medicoRoutes = require('./routes/medico'); // ruta de --> /medico
var hospitalRoutes = require('./routes/hospital'); // ruta de --> /hospital
var busquedaRoutes = require('./routes/busqueda'); // ruta de --> /busqueda
var uploadRoutes = require('./routes/upload'); // ruta de --> /upload
var imagenesRoutes = require('./routes/imagenes'); // ruta /img
// Body parser
app.use(bodyParser.json()); // parse application/json (parsea lo json)
app.use(bodyParser.urlencoded({ extended: false })); // application/x-www.form-urlencoded

// Habilitar Cors
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

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
app.use('/usuario', usuarioRoutes);
app.use('/medico', medicoRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);

//Escuchar peticiones
app.listen(3000, () => {
  console.log('express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});