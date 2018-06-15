// requires
var express = require('express');
var Usuario = require('../models/usuario'); //modelo de usuario
var bcrypt = require('bcryptjs'); // sistema de encriptación
var jwt = require('jsonwebtoken'); //creacion de token
var Config = require('../config/config');
// Inicializar variables
var app = express();

// Modelos
var Usuario = require('../models/usuario');

// Google
var Config = require('../config/config')
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(Config.CLIENT_ID);


var mdAutenticacion = require('../middlewares/autenticacion');

// ==========================================
//  Renovar Token
// ==========================================
app.get('/renuevatoken', mdAutenticacion.verificaToken, (req, res) => {

    var token = jwt.sign({ usuario: req.usuario }, Config.SEED, { expiresIn: 14400 }); // 4 horas

    res.status(200).json({
        ok: true,
        token: token
    });

});

// =================================================
//  Autenticación de Google
// =================================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: Config.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => { // --> localhost:3000/login/google

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            });
        });

    // en googleUser tenemos la información del usuario que se ha logueado a través de google, pero 
    // vamos a crearlo en nuestra base de datos... primero teneos que ver si ya le tenemos
    // así que buscamos por su email (del de google)
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar',
                errors: err
            });
        }
        // si el usuario existe en la BD
        if (usuarioDB) {
          // si no es un usuario de google
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal'
                });
            // si es un usuario de google 
            } else {
                //tenemos que generar un nuevo token y enviarlo
                var token = jwt.sign({ usuario: usuarioDB }, Config.SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }
        // si el usuario se autentica la primera vez en nuestro sistema
        } else {
            // El usuario no existe... hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true; // determina que es un usuario que se ha creado a través del login de google
            usuario.password = ':)'; // eliminamos la contraseña, para que no vaya en la respuesta

            // lo guardarmos en nuestra base de datos
            usuario.save((err, usuarioDB) => {
                // generamos el token de nuevo
                var token = jwt.sign({ usuario: usuarioDB }, Config.SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            });
        }
    });
});


// =======================================================
// ============= LOGIN PROPIO ============================
// =======================================================
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
function obtenerMenu(ROLE) {

  var menu = [{
          titulo: 'Principal',
          icono: 'mdi mdi-gauge',
          submenu: [
              { titulo: 'Dashboard', url: '/dashboard' },
              { titulo: 'ProgressBar', url: '/progress' },
              { titulo: 'Gráficas', url: '/graficas1' },
              { titulo: 'Promesas', url: '/promesas' },
              { titulo: 'RxJs', url: '/rxjs' }
          ]
      },
      {
          titulo: 'Mantenimientos',
          icono: 'mdi mdi-folder-lock-open',
          submenu: [
              // { titulo: 'Usuarios', url: '/usuarios' },
              { titulo: 'Hospitales', url: '/hospitales' },
              { titulo: 'Médicos', url: '/medicos' }
          ]
      }
  ];

  console.log('ROLE', ROLE);

  if (ROLE === 'ADMIN_ROLE') {
      menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
  }


  return menu;

}


module.exports = app;