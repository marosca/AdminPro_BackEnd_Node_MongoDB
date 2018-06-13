/* Punto de entrada de la app (servidor) 
Instlaciones:
  1. Creamos proyecto con npm init
  2. Instalación express: npm install --save express
  3. Instalamos nodemon y creamos un script en npm --> "nodemon app.js" (para no tener que estar subiendo y bajando el servidor con cada cambio)
  4. Instalamos postman
  5. Instalamos mongodb con hombrebrew y lo levantamos con 'sudo mongodb'.
  6. Instalamos robo 3T (creamos conexión a localhost en puerto 27017)
  7. Instalamos mongoose--> npm install mongoose --save --> sirve para conectar con la bd de mongodb

*/

// requires
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// Conexióna la db
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
  if(err) throw err;
  console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
})


//Rutas
app.get('/', (req, res, next) => {

  //con status devolvemos el código de estado de la petición. con .json encapsulamos un objeto
  // donde enviamos la información que queramos. Con esto se está enviando directamente la 
  //cabecera Content-Type →application/json; charset=utf-8
  res.status(200).json({
    ok: true,
    mensaje: 'Peticion realizada correctamenteeee'
  });
});

//Escuchar peticiones
app.listen(3000, () => {
  console.log('express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});