var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var rolesValidos = {
  values: ['ADMIN_ROLE', 'USER_ROLE'],
  message: '{VALUE} no es un rol permitido'
};

var Schema = mongoose.Schema;

var usuarioSchema = new Schema({
  nombre: { type: String, required: [true, 'El nombre es necesario'] },
  email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
  password: { type: String, required: [true, 'La contraseña es necesaria'] },
  img: { type: String, required: false },
  role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
  google: { type: Boolean, default: false} // flag que nos dice si el usuario se creo de google (es decir, un usuario que guando se loguea lo hace a través de google, en ese caso, le dejamos loguearse y lo guardamos en nuestra base de datos)
});

// el plugin de mongoose unique validator sirve para personalizar mensajes en aquellos
// campos del modelo uqe deben ser únicos. PATH hace referencia a la propieda del campo
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único'});

module.exports = mongoose.model('Usuario', usuarioSchema);

