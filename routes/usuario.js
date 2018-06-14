// RUTA PARA GET USUARIOS
/* tendremos estas rutas
  get: /usuario --> get de todos los usuario, ruta publica
  put: /usuario/id -> actualización de un usuario, se necesitará autenticación por token
  post: /usuario/id -> creación de un usuario, se necesita token
  delete: /usuario/id -> eliminación de un usuario, se necesita token
*/
// requires
var express = require('express');
var Usuario = require('../models/usuario'); //modelo de usuario
var bcrypt = require('bcryptjs'); // sistema de encriptación para que lo guarde encriptado en la bd
//var jwt = require('jsonwebtoken'); // se pasa al middleware que es donde hemos hecho la función de verificar token
var autenticacion = require('../middlewares/autenticacion');
// Inicializar variables
var app = express();

//Rutas

// ===========================================================
// ==== GET ALL USERS (publico no necesita token) ============
// ===========================================================
app.get('/', (req, res, next) => {
  //para paginación. Desde nos llegara por query /usuarios?
  var desde = Number(req.query.desde) || 0; 
  //eso busca todos los usuarios, usa el modelo Usario (que se ha importado). ESta forma de búsqued de mongodb es gracias a mongoose
  // el segundo parametro de find son los campos que queremos traer (traemos  todos menos pasword)
  Usuario.find({ }, 'nombre email img role')
    .skip(desde)
    .limit(5) //limita a 5 la respuesta
    // ejecutamos esa búsqueda
    .exec(
      //en un callback tendremos los posibles errores o el resultado de la búsqueda
      (error, usuarios) => {
        // si hay un usuario el código para y devuelve el statuto 500 y el json uqe hemos creado
        if (error) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error en la bd cargando usuarios',
            errors: error
          });
        }
        // Usuario.count es un función de mongoose que te devuelve el total de resgistros
        Usuario.count({}, (error, total) => {
          // si no hay error devolvemos status 200 y un json con datos, entre ellos un array de usuarios de la db 
        res.status(200).json({
          ok: true,
          total: total,
          usuario: usuarios //eso viene del Usuario.find de mongoose
        });
        })

      }
    );
});


// ===========================================================
// =================== UPDATE USER (PUT) ======================
// ===========================================================
app.put('/:id', autenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  //findById es de mongoose. se pasa el id, trae una callbak con los posibles errores, o el dato
  // encontrado con ese id
  Usuario.findById(id, (error, usuario) => {
    // si da error es que ni ha realizado la busqueda del usuario a editar
    if (error) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar el usuario',
        errors: error
      });
    }
    // Puede que no de error, pero nos devuelve un usuario vacio, no válido
    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El usuario con el id' + id + 'no existe',
        errors: { message: 'No exite un usuario con ese ID'}
      });
    }
    // si el código llega aquí actulizamos el objeto usuario, con lo que tenmos en body y guardamos
    usuario.nombre = body.nombre,
    usuario.email = body.email,
    usuario.role = body.role

    usuario.save( (error, usuarioGuardado) => {
      if (error) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar usuario',
          errors: error
        });
      }

      // en la respuesta de vuelta al front no quiero que se envie la contraseña
      // ni siquiera la encriptada..., así que puedo hacer algo como:
      usuarioGuardado.password = ':-)';
      // o tambien, estableces que cambios van a in en la respuesta como hicimos en 
      // get all user
      res.status(200).json({ 
        ok: true,
        usuario: usuarioGuardado,
        usuarioLogado: req.usuarioLogado // en el req viene información del usuario logado que está haciendo esta peticion (no es que venga por defecto, viene porque hemos creado un middleware de verificación de toke que incluyen en el req esos datos)
      });

    });
    
  })

});


// ===========================================================
// ========= CREAR UN NUEVO USUARIO (POST) ===================
// ===========================================================
// como segundo parametro se pasa una función (de verificación de token)
app.post('/', autenticacion.verificaToken, (req, res, next) => {

  var body = req.body; //eso funciona gracias al body parser. Es lo que viene del front

  // creamos un nuevo usuario usando su modelo (mongoose) con la intención de guardarlo en la bd
  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role
  });

  // guardamos el usuario en la bd, tenemos un callback de vuelta ocn el posible error, por
  // ejmeplo que no hayan pasado todos los datos, o con el objeto ya guardado con su id correspondiente
  usuario.save( (error, usuarioGuardado) => {
    if (error) {
      return res.status(400).json({
        ok: false,
        mensaje: ' Error al crear usuario',
        errors: error
      });
    }

    res.status(201).json({ // 201 -> recurso creado
      ok: true,
      usuario: usuarioGuardado,
      usuarioLogado: req.usuarioLogado // en el req viene información del usuario logado que está haciendo esta peticion (no es que venga por defecto, viene porque hemos creado un middleware de verificación de toke que incluyen en el req esos datos)
    });
  });
});

// ===========================================================
// =================== DELETE USER ===========================
// ===========================================================
app.delete('/:id', autenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Usuario.findByIdAndRemove(id, (error, usuarioBorrado) => {
    if (error) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar usuario',
        errors: error
      });
    }

    if (!usuarioBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El usuario con el id' + id + 'no existe',
        errors: { message: 'No exite un usuario con ese ID'}
      });
    }

    res.status(200).json({ 
      ok: true,
      usuario: usuarioBorrado,
      usuarioLogado: req.usuarioLogado // en el req viene información del usuario logado que está haciendo esta peticion (no es que venga por defecto, viene porque hemos creado un middleware de verificación de toke que incluyen en el req esos datos)
    });
  });

});

module.exports = app;