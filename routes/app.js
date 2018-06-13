// requires
var express = require('express');

// Inicializar variables
var app = express();

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

module.exports = app;