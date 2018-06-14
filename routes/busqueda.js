/* Buscador simultáneo en todas las tablas (colecciones) */
// requires
var express = require('express');

// Inicializar variables
var app = express();

// Modelos
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Function Helpers
function buscarHospitales ( busqueda ) {
  return new Promise( (resolve, reject) => {
    var regex = new RegExp(busqueda, 'i'); // para qeu de igual las min y may
    Hospital.find( {'nombre': regex} )
      .populate('usuario', 'nombre email') //para que meta qué usuario creo el hospital
      .exec((error, hospitales) => {
      if (error) {
        reject('Error al cargar hospitales', error);
      } else {
        resolve(hospitales)
      }
    });
  })
};

function buscarMedicos ( busqueda ) {
  return new Promise( (resolve, reject) => {
    var regex = new RegExp(busqueda, 'i'); // para qeu de igual las min y may
    Medico.find( {'nombre': regex} )
      .populate('usuario', 'nombre email') //para que meta qué usuario creo el hospital
      .populate('hospital') //para que meta en qué hospitales trabvaja
      .exec((error, medicos) => {
        if (error) {
          reject('Error al cargar medicos', error);
        } else {
          resolve(medicos)
        }
    });
  })
};

function buscarUsuarios ( busqueda ) {
  return new Promise( (resolve, reject) => {

    var regex = new RegExp(busqueda, 'i'); // para qeu de igual las min y may
    Usuario.find({}, 'nombre email role') //para que no aparezca la contraseña
      .or([{'nombre': regex}, {'email': regex}]) //busqueda por varios campos a la vez
      .exec( (error, usuarios) => {
      if (error) {
        reject('Error al cargar usuarios', error);
      } else {
        resolve(usuarios)
      }
    });
  })
};

//Rutas

// ===========================================================
// ====     BUSQUEDA GENERAL EN TODAS LA TABLAS     ==========
// ===========================================================
// ruta como localhost:3000/todo/palabraABuscar
app.get('/todo/:busqueda', (req, res, next) => { 
  var busqueda = req.params.busqueda;
  
  Promise.all([ buscarHospitales(busqueda), buscarMedicos(busqueda), buscarUsuarios(busqueda) ])
  .then( respuesta => {
    res.status(200).json({
      ok: true,
      hospitales: respuesta[0],
      medicos: respuesta[1],
      usuarios: respuesta[2]
    });
  })
  /* Para buscar en una SOLA TABLA
  Hospital.find( {nombre: regex}, (error, hospitales) => {
    res.status(200).json({
      ok: true,
      hospital: hospitales
    });
  });
  */
});
// ===========================================================
// =============    BUSQUEDA EN UNA TABLA =====================
// ===========================================================
// ruta como localhost:3000/coleccion/medicos/palabraABuscar
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => { 
  
  var tabla = req.params.tabla,
    busqueda = req.params.busqueda,
    promesa;
  /* Para buscar en una SOLA TABLA */
  switch (tabla) {
    case 'usuarios':
      promesa = buscarUsuarios(busqueda);
      break;
    case 'medicos':
      promesa = buscarMedicos(busqueda);
      break;
    case 'hospitales':
      promesa = buscarHospitales(busqueda);
      break;
    default:
      return res.status(400).json({
        ok: false,
        mensaje:'No existe esa tabla en la que intentas buscar',
        error: { message: 'Coleccion no válida'}
      });
  }
  
  promesa
    .then( respuesta => {
        res.status(200).json({
          ok: true,
          [tabla]: respuesta
        });
      });

});

module.exports = app;