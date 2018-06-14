// La idea es tener una url tal que:
// http://miserver.com/img/usuario|medicos|hospital/nombreDeLaImagen.jpg

// requires
var express = require('express');

var app = express();

// path es un paquete de node
const path = require('path');
const fs = require('fs');


app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    //path me da la ruta absoluta con __direname
    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImagen = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImagen);
    }


});

module.exports = app;