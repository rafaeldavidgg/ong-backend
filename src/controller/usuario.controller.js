const usuarioCtrl = {}

const Usuario = require('../models/Usuario')

usuarioCtrl.getUser = async(req, res) => {
    const usuarios = await Usuario.find()
    res.json(usuarios)
}

usuarioCtrl.createUser = async(req, res) => {
    const {nombre, apellido, edad, telefono, correo} = req.body;
    const newUser = new Usuario({
        nombre: nombre,
        apellido: apellido,
        edad: edad,
        telefono: telefono,
        correo: correo
    })
    await newUser.save();
    res.json({message: "Usuario creado"})
}

usuarioCtrl.getUserById = async(req, res) => {
    const user = await Usuario.findById(req.params.id)
    res.json(user)
}

usuarioCtrl.deleteUserById = async(req, res) => {
    await Usuario.findByIdAndDelete(req.params.id)
    res.json({message: "Usuario eliminado"})
}

usuarioCtrl.putUserById = async(req, res) => {
    const {nombre, apellido, edad, telefono, correo} = req.body;
    await Usuario.findByIdAndUpdate(req.params.id, {
        nombre: nombre,
        apellido: apellido,
        edad: edad,
        telefono: telefono,
        correo: correo
    })
    res.json({message: "Usuario actualizado"})
}

module.exports = usuarioCtrl;