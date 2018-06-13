var jwt = require('jsonwebtoken');
var Config = require('../config/config');

// ===========================================================
// =================== Verificar token  ======================
// ===========================================================//

exports.verificaToken = function( req, res, next) {
  var token = req.query.token; // vendrán por query (aunque se puede pasar por headers). formato: localhost:3000/url?token=token
  // se pasa el token, el seed con el que se creó, tercer paramtetro es un calbakc que recibe error y decoded (información de payload que se usó en la creación del token)
  jwt.verify(token, Config.SEED, (error, decoded) => { // en decoded.usuario --> están los datos del usuario
    if (error) {
      return res.status(401).json({ // 401 Unauthorized
        ok: false,
        mensaje: 'No se puede acceder sin autenticar por token',
        errors: error
      });
    }
    //si queremos que en todas las peticiones tengamos acceso a los datos de usuario logueado, podemos añadir a request una propiedada tal que:
    req.usuarioLogado = decoded.usuario;
    next(); // le decimos que continue
  })
}
