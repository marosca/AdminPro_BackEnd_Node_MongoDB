// requires
var express = require('express');
var Usuario = require('../models/usuario'); //modelo de usuario
var bcrypt = require('bcryptjs'); // sistema de encriptación
var jwt = require('jsonwebtoken'); //creacion de token
var Config = require('../config/config');
// Inicializar variables
var app = express();

app.post('/', (req, res) => {
  
  var body = req.body; //eso funciona gracias al body parser. Es lo que viene del front

  //findOne, metodo de mongoose, primer parametro la condición de busqueda e que el email sea
  // igual al pasado en la petición post, devuelve callback con error o el usuario encontrado
  Usuario.findOne({email: body.email}, (error, usuarioDB) => {
    
    if (error) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuarios',
        errors: error
      });
    }

    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas - email',
        errors: error
      });
    }

    // ahora hay que verificar la contraseña. Con bcrypt, el método compareSync compara si son
    // iguales las que viene en el post con el usuario encontrado en la base de datos por email
    if( !bcrypt.compareSync(body.password, usuarioDB.password) ) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas - password',
        errors: error
      });
    }

    // Aqui el usuario y contraseña ya sabemos que son válidos. Debemos creaer un token. Ese token
    // debe ser enviado a todas la peticiones que requieran autenticación. Existe una librería que se llama jsonwebtoken
    usuarioDB.password = ':-)'; // quitamos la contraseña del usuarioDB para no incluirla en el token que vamos a genera
    
    var token = jwt.sign( // tiene tres parámetros
      { usuario: usuarioDB }, // payload: el usuario del que creamos un token
      Config.SEED, // SEED : string dificil de entender // luego se mete en la web jwt.io para validar el token
      { expiresIn: 1440 } // tiempo de vigencia, hemos elegido 4 horas
    );

    res.status(200).json({
      ok: true,
      usuario: usuarioDB,
      token: token, // si metemos el token en jwt.io nos sale el payload( esto no se debe pasar al front end NUNCA)
      id: usuarioDB._id // le envio al front el id del usuario logueado
    });
  })  


});

module.exports = app;