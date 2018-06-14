// RUTA PARA MEDICOS
/* tendremos estas rutas
  get: /medico --> get de todos los medicos, ruta publica
  put: /medico/id -> actualización de un medico, se necesitará autenticación por token
  post: /medico/id -> creación de un medico, se necesita token
  delete: /medico/id -> eliminación de un medico, se necesita token
*/
// requires
var express = require('express');
var Medico = require('../models/medico'); //modelo de medico
var autenticacion = require('../middlewares/autenticacion');
// Inicializar variables
var app = express();

//Rutas

// ===========================================================
// ==== GET ALL MEDICOS (publico no necesita token) ==========
// ===========================================================
app.get('/', (req, res, next) => {
  //para paginación. Desde nos llegara por query /usuarios?
  var desde = Number(req.query.desde) || 0; 
  //eso busca todos los usuarios, usa el modelo Medico (que se ha importado). ESta forma de búsqued de mongodb es gracias a mongoose
  // el segundo parametro de find son los campos que queremos traer 
  Medico.find({ }, 'nombre img usuario hospital')
    .skip(desde)
    .limit(5) //limita a 5 la respuesta
    .populate('usuario', 'nombre email') // añade de la tabla 'usuario' la información del usuario
    .populate('hospital')
    // ejecutamos esa búsqueda
    .exec(
      //en un callback tendremos los posibles errores o el resultado de la búsqueda
      (error, medicos) => {
        // si hay un usuario el código para y devuelve el statuto 500 y el json uqe hemos creado
        if (error) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error en la bd cargando medicos',
            errors: error
          });
        }
        // Medico.count es un función de mongoose que te devuelve el total de resgistros
        Medico.count({}, (error, total) => {
          // si no hay error devolvemos status 200 y un json con datos, entre ellos un array de usuarios de la db 
          res.status(200).json({
            ok: true,
            medico: medicos, //eso viene del Medico.find de mongoose
            total: total
          });
        });
      }
    );
});


// ===========================================================
// =================== UPDATE MEDICO (PUT) ======================
// ===========================================================
app.put('/:id', autenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  //findById es de mongoose. se pasa el id, trae una callbak con los posibles errores, o el dato
  // encontrado con ese id
  Medico.findById(id, (error, medico) => {
    // si da error es que ni ha realizado la busqueda del medico a editar
    if (error) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar el medico',
        errors: error
      });
    }
    // Puede que no de error, pero nos devuelve un medico vacio, no válido
    if (!medico) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El medico con el id' + id + 'no existe',
        errors: { message: 'No exite un medico con ese ID'}
      });
    }
    // si el código llega aquí actulizamos el objeto medico, con lo que tenmos en body y guardamos
    medico.nombre = body.nombre;
    medico.usuario = req.usuarioLogado._id;
    medico.hospital = body.hospital;

    medico.save( (error, medicoGuardado) => {
      if (error) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar medico',
          errors: error
        });
      }

      // o tambien, estableces que cambios van a in en la respuesta como hicimos en 
      // get all user
      res.status(200).json({ 
        ok: true,
        medico: medicoGuardado
      });

    });
    
  })

});


// ===========================================================
// ========= CREAR UN NUEVO MEDICO (POST) ===================
// ===========================================================
// como segundo parametro se pasa una función (de verificación de token)
app.post('/', autenticacion.verificaToken, (req, res, next) => {

  var body = req.body; //eso funciona gracias al body parser. Es lo que viene del front

  // creamos un nuevo usuario usando su modelo (mongoose) con la intención de guardarlo en la bd
  var medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuarioLogado._id,
    hospital: body.hospital,
  });

  // guardamos el medico en la bd, tenemos un callback de vuelta ocn el posible error, por
  // ejmeplo que no hayan pasado todos los datos, o con el objeto ya guardado con su id correspondiente
  medico.save( (error, medicoGuardado) => {
    if (error) {
      return res.status(400).json({
        ok: false,
        mensaje: ' Error al crear el medico',
        errors: error
      });
    }

    res.status(201).json({ // 201 -> recurso creado
      ok: true,
      medico: medicoGuardado
    });
  });
});

// ===========================================================
// =================== DELETE USER ===========================
// ===========================================================
app.delete('/:id', autenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Medico.findByIdAndRemove(id, (error, medicoBorrado) => {
    if (error) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar usuario',
        errors: error
      });
    }

    if (!medicoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El usuario con el id' + id + 'no existe',
        errors: { message: 'No exite un usuario con ese ID'}
      });
    }

    res.status(200).json({ 
      ok: true,
      medico: medicoBorrado
    });
  });

});

module.exports = app;