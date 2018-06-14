// RUTA PARA MEDICOS
/* tendremos estas rutas
  get: /medico --> get de todos los medicos, ruta publica
  put: /medico/id -> actualización de un medico, se necesitará autenticación por token
  post: /medico/id -> creación de un medico, se necesita token
  delete: /medico/id -> eliminación de un medico, se necesita token
*/
// requires
var express = require('express');
var Hospital = require('../models/hospital'); //modelo de hospital
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
  Hospital.find({ }, 'nombre img usuario')
    .skip(desde)
    .limit(5) //limita a 5 la respuesta
    /*el modelo de Hospital, lleva un campo llamado usuario que contiene el _id del usuario
    que lo creó. Ese id es el mismo que tiene el usuario en la table 'usuarios'. Con populate 
    hace la búsqueda en su tabla correspondiente y trae toda la información del usuario y no
    solo el _id. Si quiere discriminar y elegir qué se trae del usuario, se pasa un segundo parametro
    con los campos que queremos:
    {
            "_id": "5b2185086948f61b2d2dcf3e",
            "nombre": "Gregorio Marañón",
            "usuario": {
                "role": "USER_ROLE",
                "_id": "5b20f01130c95cc5bad32ccc",
                "nombre": "diana moreno",
                "email": "diana@hotmail.es",
                "password": "$2a$10$pyWOvp7lcZQNa3NyJQQ3yO6p1tMbQgoYlM/Fyxy/ff3w/UxDf.WZ2",
                "__v": 0
            }
    */
    .populate('usuario', 'nombre email')
    // ejecutamos esa búsqueda
    .exec(
      //en un callback tendremos los posibles errores o el resultado de la búsqueda
      (error, hospitales) => {
        // si hay un usuario el código para y devuelve el statuto 500 y el json uqe hemos creado
        if (error) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error en la bd cargando hospitales',
            errors: error
          });
        }
        // Medico.count es un función de mongoose que te devuelve el total de resgistros
        Hospital.count({}, (error, total) => {
          // si no hay error devolvemos status 200 y un json con datos, entre ellos un array de usuarios de la db 
          res.status(200).json({
            ok: true,
            total: total,
            hospital: hospitales //eso viene del Hopital.find de mongoose
          });
        });
      }
    );
});


// ===========================================================
// =================== UPDATE HOSPITAL (PUT) ======================
// ===========================================================
app.put('/:id', autenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  //findById es de mongoose. se pasa el id, trae una callbak con los posibles errores, o el dato
  // encontrado con ese id
  Hospital.findById(id, (error, hospital) => {
    // si da error es que ni ha realizado la busqueda del hospital a editar
    if (error) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar el hospital',
        errors: error
      });
    }
    // Puede que no de error, pero nos devuelve un hospital vacio, no válido
    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El hospital con el id' + id + 'no existe',
        errors: { message: 'No exite un hospital con ese ID'}
      });
    }
    // si el código llega aquí actulizamos el objeto hospital, con lo que tenmos en body y guardamos
    hospital.nombre = body.nombre;
    //hospital.img = body.img;
    hospital.usuario = req.usuarioLogado._id; //usuario que está modificando el hospital (viene de autenticacion.verificarToken)

    hospital.save( (error, hospitalGuardado) => {
      if (error) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar hospital',
          errors: error
        });
      }
      // o tambien, estableces que cambios van a in en la respuesta como hicimos en 
      // get all user
      res.status(200).json({ 
        ok: true,
        hospital: hospitalGuardado
      });

    });
    
  })

});

// ===========================================================
// ========= CREAR UN NUEVO HOSPITAL (POST) ===================
// ===========================================================
// como segundo parametro se pasa una función (de verificación de token)
app.post('/', autenticacion.verificaToken, (req, res, next) => {

  var body = req.body; //eso funciona gracias al body parser. Es lo que viene del front

  // creamos un nuevo usuario usando su modelo (mongoose) con la intención de guardarlo en la bd
  var hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuarioLogado._id //usuario que está modificando el hospital (viene de autenticacion.verificarToken)
  });

  // guardamos el medico en la bd, tenemos un callback de vuelta ocn el posible error, por
  // ejmeplo que no hayan pasado todos los datos, o con el objeto ya guardado con su id correspondiente
  hospital.save( (error, hospitalGuardado) => {
    if (error) {
      return res.status(400).json({
        ok: false,
        mensaje: ' Error al crear el hospital',
        errors: error
      });
    }

    res.status(201).json({ // 201 -> recurso creado
      ok: true,
      hospital: hospitalGuardado
    });
  });
});

// ===========================================================
// =================== DELETE HOSPITAL ===========================
// ===========================================================
app.delete('/:id', autenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Hospital.findByIdAndRemove(id, (error, hospitalBorrado) => {
    if (error) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar usuario',
        errors: error
      });
    }

    if (!hospitalBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El usuario con el id' + id + 'no existe',
        errors: { message: 'No exite un usuario con ese ID'}
      });
    }

    res.status(200).json({ 
      ok: true,
      hospital: hospitalBorrado
    });
  });

});

module.exports = app;